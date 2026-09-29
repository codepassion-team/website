export const STORY_LAYER_COUNT = 5;
const clamp = (value: number) => Math.max(0, Math.min(1, value));
// Zero velocity and acceleration at both ends avoids a hard lift/landing.
export const ease = (value: number) => {
  const t = clamp(value);
  return t * t * t * (t * (t * 6 - 15) + 10);
};

const storyHolds = (mobile: boolean) =>
  mobile
    ? [
        [0, 0.05],
        [0.17, 0.22],
        [0.35, 0.4],
        [0.53, 0.58],
        [0.71, 0.76],
        [0.91, 1],
      ]
    : [
        [0, 0.07],
        [0.17, 0.24],
        [0.35, 0.42],
        [0.53, 0.6],
        [0.71, 0.78],
        [0.91, 1],
      ];

export function chapterScrollPosition(chapter: number, mobile = false) {
  const index = Math.max(0, Math.min(STORY_LAYER_COUNT, Math.round(chapter)));
  const [start, end] = storyHolds(mobile)[index];
  return index === 0 ? 0 : (start + end) / 2;
}

/** Preserve physical order, adding space on either side of the selected layer. */
export function layerGeometry(position: number) {
  const focus = Array.from({ length: STORY_LAYER_COUNT }, (_, layer) =>
    layerFocus(position, layer),
  );
  const heights = Array(STORY_LAYER_COUNT).fill(0) as number[];
  for (let layer = STORY_LAYER_COUNT - 2; layer >= 0; layer--) {
    heights[layer] =
      heights[layer + 1] + 38 + 65 * (focus[layer] + focus[layer + 1]);
  }
  const center = heights.reduce((sum, y) => sum + y, 0) / STORY_LAYER_COUNT;
  return heights.map((height, layer) => ({
    height: height - center + 76,
    scale: 1 + focus[layer] * 0.18,
    focus: focus[layer],
  }));
}

/** Each integer is a readable hold; transitions expand one layer within the stack. */
export function layerStoryPosition(scroll: number, mobile = false) {
  const holds = storyHolds(mobile);
  const progress = clamp(scroll);
  for (let chapter = 0; chapter < holds.length; chapter++) {
    const [start, end] = holds[chapter];
    if (progress <= end) {
      if (progress >= start || chapter === 0) return chapter;
      const previousEnd = holds[chapter - 1][1];
      return chapter - 1 + (progress - previousEnd) / (start - previousEnd);
    }
  }
  return STORY_LAYER_COUNT;
}

export function layerFocus(position: number, layer: number) {
  return ease(1 - Math.abs(position - (layer + 1)) / 0.5);
}

export function chapterOpacity(position: number, chapter: number) {
  return 1 - ease(Math.abs(position - chapter) / 0.42);
}

/** Time-based scroll following is consistent across different refresh rates. */
export function followScroll(
  current: number,
  target: number,
  elapsedMs: number,
) {
  const next =
    current + (target - current) * (1 - Math.exp(-Math.max(0, elapsedMs) / 85));
  return Math.abs(next - target) < 0.00005 ? target : next;
}

/** The opening settles into the center before the first layer's copy appears. */
export function desktopStoryAlignment(position: number) {
  const centered = ease(position / 0.58);
  return { x: 0.72 - 0.22 * centered, y: 0.66 - 0.09 * centered, centered };
}
