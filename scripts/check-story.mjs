import assert from "node:assert/strict";
import {
  layerStoryPosition,
  layerFocus,
  chapterOpacity,
  followScroll,
  STORY_LAYER_COUNT,
  layerGeometry,
  chapterScrollPosition,
  desktopStoryAlignment,
} from "../src/scripts/story-timeline.ts";

for (const mobile of [false, true]) {
  const samples = Array.from({ length: 1001 }, (_, index) =>
    layerStoryPosition(index / 1000, mobile),
  );
  assert.equal(layerStoryPosition(-1, mobile), 0);
  assert.equal(layerStoryPosition(2, mobile), STORY_LAYER_COUNT);
  for (let index = 1; index < samples.length; index++) {
    assert(
      samples[index] >= samples[index - 1],
      "Forward scrolling must preserve layer order",
    );
    assert(
      samples[index] - samples[index - 1] <= 0.01001,
      "Timeline must be continuous",
    );
  }
  for (const position of samples.reverse()) {
    const focus = [0, 1, 2, 3, 4].map((layer) => layerFocus(position, layer));
    assert(focus.every((value) => value >= 0 && value <= 1));
    assert(
      focus.filter((value) => value > 0).length <= 1,
      "Emphasize only one slab at a time",
    );
    const copy = [0, 1, 2, 3, 4, 5].map((chapter) =>
      chapterOpacity(position, chapter),
    );
    assert(
      copy.filter((value) => value > 0).length <= 1,
      "Chapter text must not overlap",
    );
  }
  for (const [scroll, chapter] of [
    [0.04, 0],
    [0.19, 1],
    [0.37, 2],
    [0.55, 3],
    [0.73, 4],
    [0.96, 5],
  ]) {
    const position = layerStoryPosition(scroll, mobile);
    assert.equal(position, chapter, "Every chapter needs a still reading hold");
    assert.equal(chapterOpacity(position, chapter), 1);
    if (chapter) assert.equal(layerFocus(position, chapter - 1), 1);
  }
}
console.log(
  "PASS: desktop/mobile holds, continuous layer order, isolated emphasis and non-overlapping copy.",
);

// Smooth scroll following must converge without overshoot in either direction.
for (const [start, target] of [
  [0, 1],
  [1, 0],
]) {
  let current = start;
  let previousError = 1;
  for (let frame = 0; frame < 120; frame++) {
    current = followScroll(current, target, 1000 / 60);
    const error = Math.abs(target - current);
    assert(error <= previousError);
    assert(current >= 0 && current <= 1);
    previousError = error;
  }
  assert.equal(current, target);
}
const once = followScroll(0, 1, 32);
const twice = followScroll(followScroll(0, 1, 16), 1, 16);
assert(
  Math.abs(once - twice) < 1e-12,
  "Smoothing must be independent of refresh rate",
);
for (let layer = 0; layer < STORY_LAYER_COUNT; layer++) {
  const start = layer + 0.5;
  assert(
    layerFocus(start + 0.001, layer) < 0.000001,
    "Expansion starts softly",
  );
  assert(
    1 - layerFocus(layer + 1.001, layer) < 0.000001,
    "Expansion settles softly",
  );
}
console.log(
  "PASS: frame-rate-independent scroll following, convergence, soft expansion and settling.",
);

for (const mobile of [false, true]) {
  for (let chapter = 0; chapter <= STORY_LAYER_COUNT; chapter++) {
    assert.equal(
      layerStoryPosition(chapterScrollPosition(chapter, mobile), mobile),
      chapter,
      "Navigation must land in the correct reading hold",
    );
  }
}
for (let sample = 0; sample <= 500; sample++) {
  const geometry = layerGeometry(sample / 100);
  for (let layer = 0; layer < geometry.length - 1; layer++) {
    assert(
      geometry[layer].height - geometry[layer + 1].height >= 38 - 1e-9,
      "Layers must never cross or reorder",
    );
  }
  assert(geometry.every((layer) => layer.scale >= 1 && layer.scale <= 1.18));
}
for (let chapter = 1; chapter <= STORY_LAYER_COUNT; chapter++) {
  const selected = chapter - 1;
  const geometry = layerGeometry(chapter);
  assert.equal(geometry[selected].scale, 1.18);
  if (selected > 0)
    assert(geometry[selected - 1].height - geometry[selected].height > 100);
  if (selected < STORY_LAYER_COUNT - 1)
    assert(geometry[selected].height - geometry[selected + 1].height > 100);
}
console.log(
  "PASS: chapter navigation targets, expansion bounds, surrounding space and unchanged layer order.",
);

assert.equal(desktopStoryAlignment(0).x, 0.65);
for (let position = 0.58; position <= 5; position += 0.01) {
  assert.equal(
    desktopStoryAlignment(position).x,
    0.5,
    "The stack must remain centered across every layer chapter",
  );
}
console.log(
  "PASS: opening right alignment and fixed center before layer copy appears.",
);

const { connectorRoute } = await import("../src/scripts/story-connector.ts");
for (const direction of [-1, 1]) {
  for (const gap of [0, 2, 8, 16, 40, 200]) {
    for (const clearance of [-100, 0, 20, 500]) {
      const start = { x: 300, y: 100 };
      const end = { x: 300 + gap * direction, y: 250 };
      const route = connectorRoute(start, end, start.x + clearance * direction);
      const traveled = (route.bendX - start.x) * direction;
      assert(
        traveled >= -1e-9 && traveled <= gap + 1e-9,
        "Connector must never double back",
      );
      assert(route.radius >= 0 && Number.isFinite(route.radius));
      assert(
        traveled - route.radius >= -1e-9 &&
          traveled + route.radius <= gap + 1e-9,
        "Rounded corners must fit the available gap",
      );
    }
  }
}
console.log(
  "PASS: connector routing remains continuous and bounded for narrow gaps on both sides.",
);
