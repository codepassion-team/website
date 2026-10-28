/** Native vector fallback. Higgsfield source footage can be integrated separately. */
import {
  layerGeometry,
  desktopStoryAlignment,
  STORY_LAYER_COUNT,
} from "./story-timeline";

import { connectorRoute } from "./story-connector";

type Point = { x: number; y: number };
export type LayerCallout = Point & {
  side: "left" | "right";
  opacity: number;
  clearanceX: number;
};
export function createArchitectureRenderer(canvas: HTMLCanvasElement) {
  const context = canvas.getContext("2d", { alpha: true });
  if (!context) return null;
  const ctx = context;
  let width = 0;
  let height = 0;

  function resize() {
    const bounds = canvas.getBoundingClientRect();
    width = bounds.width;
    height = bounds.height;
    const density = Math.min(
      window.devicePixelRatio || 1,
      1.75,
      Math.sqrt(5_000_000 / Math.max(1, width * height)),
    );
    canvas.width = Math.round(width * density);
    canvas.height = Math.round(height * density);
    ctx.setTransform(density, 0, 0, density, 0, 0);
  }

  function polygon(
    points: Point[],
    fill?: string | CanvasGradient,
    stroke?: string,
    lineWidth = 1,
  ) {
    ctx.beginPath();
    points.forEach((point, index) =>
      index ? ctx.lineTo(point.x, point.y) : ctx.moveTo(point.x, point.y),
    );
    ctx.closePath();
    if (fill) {
      ctx.fillStyle = fill;
      ctx.fill();
    }
    if (stroke) {
      ctx.strokeStyle = stroke;
      ctx.lineWidth = lineWidth;
      ctx.stroke();
    }
  }

  function structure(
    cx: number,
    cy: number,
    scale: number,
    position: number,
    rotation: number,
    callout?: LayerCallout,
  ) {
    const cosine = Math.cos(rotation);
    const sine = Math.sin(rotation);
    let surfaceScale = 1;
    let arrowTarget: Point | undefined;
    function project(x: number, y: number, z: number): Point {
      const horizontal = (x * cosine - z * sine) * surfaceScale;
      const depth = (x * sine + z * cosine) * surfaceScale;
      return { x: cx + horizontal * scale, y: cy + (depth * 0.48 - y) * scale };
    }
    function square(radius: number, y: number) {
      const bevel = radius * 0.085;
      return [
        [-radius + bevel, -radius],
        [radius - bevel, -radius],
        [radius, -radius + bevel],
        [radius, radius - bevel],
        [radius - bevel, radius],
        [-radius + bevel, radius],
        [-radius, radius - bevel],
        [-radius, -radius + bevel],
      ].map(([x, z]) => project(x, y, z));
    }
    // A faint ground reflection anchors the assembly without a floor texture.
    const reflection = ctx.createRadialGradient(
      cx,
      cy + 85 * scale,
      0,
      cx,
      cy + 85 * scale,
      330 * scale,
    );
    reflection.addColorStop(0, "#ffffff0a");
    reflection.addColorStop(0.5, "#ffffff03");
    reflection.addColorStop(1, "#00000000");
    ctx.fillStyle = reflection;
    ctx.fillRect(cx - 340 * scale, cy - 220 * scale, 680 * scale, 640 * scale);
    // A soft centered glow frames the stack without competing with its layers.
    ctx.save();
    const halo = ctx.createRadialGradient(cx, cy, 0, cx, cy, 360 * scale);
    halo.addColorStop(0, "#ffffff06");
    halo.addColorStop(0.72, "#ffffff03");
    halo.addColorStop(1, "#ffffff00");
    ctx.fillStyle = halo;
    ctx.beginPath();
    ctx.arc(cx, cy, 360 * scale, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    const geometry = layerGeometry(position);
    const strongest = Math.max(...geometry.map((layer) => layer.focus));
    // Contact shadows ground the stack instead of floating it.
    const floor = geometry[STORY_LAYER_COUNT - 1];
    surfaceScale = floor.scale;
    ctx.save();
    ctx.filter = `blur(${Math.round(34 * scale)}px)`;
    polygon(square(185, floor.height - 70), "#000000c0");
    ctx.filter = `blur(${Math.round(10 * scale)}px)`;
    polygon(square(160, floor.height - 30), "#000000d0");
    ctx.restore();
    surfaceScale = 1;
    for (let layer = STORY_LAYER_COUNT - 1; layer >= 0; layer--) {
      const emphasis = geometry[layer].focus;
      const y = geometry[layer].height;
      surfaceScale = geometry[layer].scale;
      ctx.save();
      ctx.globalAlpha = 1 - (strongest - emphasis) * 0.76;
      const radius = 155 - (layer === 0 ? 9 : 0);
      const top = square(radius, y);
      if (callout && layer === Math.round(position) - 1) {
        arrowTarget = top.reduce((edge, point) =>
          callout.side === "left"
            ? point.x < edge.x
              ? point
              : edge
            : point.x > edge.x
              ? point
              : edge,
        );
      }
      const bottom = square(radius, y - 18);
      const side = ctx.createLinearGradient(
        cx - 200 * scale,
        cy,
        cx + 150 * scale,
        cy + 50,
      );
      side.addColorStop(0, "#0c0d0f");
      side.addColorStop(0.45, "#2a2c31");
      side.addColorStop(0.5, "#111215");
      side.addColorStop(1, "#08090a");
      for (let face = 0; face < 8; face++)
        polygon(
          [
            top[face],
            top[(face + 1) % 8],
            bottom[(face + 1) % 8],
            bottom[face],
          ],
          side,
          "#ffffff1a",
          0.5,
        );
      const metal = ctx.createLinearGradient(
        cx - 200 * scale,
        cy - 180 * scale - y * scale,
        cx + 170 * scale,
        cy + 60 * scale - y * scale,
      );
      metal.addColorStop(0, "#2b2d32");
      metal.addColorStop(0.18, "#1a1b1f");
      metal.addColorStop(0.48, "#0f1012");
      metal.addColorStop(0.7, "#141518");
      metal.addColorStop(1, "#0b0c0e");
      polygon(top, metal, "#ffffff66", 0.85);
      ctx.save();
      ctx.globalAlpha *= emphasis;
      polygon(top, undefined, "#ffffffcc", 0.85 + emphasis);
      ctx.restore();
      if (emphasis > 0) {
        ctx.save();
        ctx.globalAlpha *= emphasis;
        ctx.shadowColor = "#ffffff";
        ctx.shadowBlur = 24 * scale;
        polygon(square(radius - 7, y + 1), undefined, "#ffffffb3", 1.4);
        ctx.restore();
      }
      polygon(square(radius - 4, y + 0.2), undefined, "#ffffff15", 0.6);
      polygon(
        square(radius - 11, y + 0.4),
        undefined,
        layer === 1 ? "#ffffff40" : "#ffffff1f",
        0.7,
      );
      // Fine etched traces follow the top surface, rather than screen-space grids.
      for (let trace = 0; trace < 11; trace++) {
        const z = -radius + 23 + trace * 4;
        const start = project(-radius + 23, y + 1, z);
        const end = project(radius - 24 - trace * 4, y + 1, z);
        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);
        ctx.strokeStyle = trace % 3 ? "#ffffff0d" : "#ffffff1c";
        ctx.lineWidth = 0.55;
        ctx.stroke();
      }
      // Each surface has its own schematic, projected onto the same material.
      const line = (
        points: number[][],
        color = "#ffffff8c",
        thickness = 1.5,
      ) => {
        ctx.beginPath();
        points.forEach(([x, z], index) => {
          const point = project(x, y + 3, z);
          if (index) ctx.lineTo(point.x, point.y);
          else ctx.moveTo(point.x, point.y);
        });
        ctx.strokeStyle = color;
        ctx.lineWidth = thickness * scale;
        ctx.stroke();
      };
      const panel = (
        x: number,
        z: number,
        w: number,
        h: number,
        fill = "#131417",
      ) => {
        polygon(
          [
            [x, z],
            [x + w, z],
            [x + w, z + h],
            [x, z + h],
          ].map(([px, pz]) => project(px, y + 2, pz)),
          fill,
          "#ffffff4d",
          scale,
        );
      };
      if (layer === 0) {
        for (const [x, z] of [
          [-77, -48],
          [77, -48],
          [-77, 48],
          [77, 48],
        ]) {
          line(
            [
              [0, 0],
              [x * 0.6, 0],
              [x * 0.6, z],
              [x, z],
            ],
            "#ffffff80",
          );
          panel(x - 13, z - 12, 26, 24, "#ffffff0f");
        }
        panel(-30, -30, 60, 60, "#f04d2d33");
        panel(-18, -18, 36, 36, "#f04d2d99");
        for (let pin = -18; pin <= 18; pin += 12) {
          line(
            [
              [pin, -40],
              [pin, -31],
            ],
            "#ffffffb3",
          );
          line(
            [
              [pin, 31],
              [pin, 40],
            ],
            "#ffffffb3",
          );
        }
      } else if (layer === 1) {
        panel(-82, -65, 164, 130, "#0f1012");
        line(
          [
            [-82, -40],
            [82, -40],
          ],
          "#ffffff59",
        );
        panel(-67, -23, 38, 70, "#ffffff12");
        panel(-16, -23, 80, 24, "#ffffff1a");
        for (let row = 0; row < 3; row++)
          line(
            [
              [-16, 18 + row * 13],
              [64 - row * 12, 18 + row * 13],
            ],
            "#ffffff66",
          );
      } else if (layer === 2) {
        line([
          [-75, 0],
          [0, 0],
          [0, -50],
          [65, -50],
        ]);
        line([
          [0, 0],
          [0, 50],
          [65, 50],
        ]);
        for (const [x, z] of [
          [-75, 0],
          [0, 0],
          [65, -50],
          [65, 50],
        ])
          panel(x - 13, z - 13, 26, 26, "#ffffff12");
      } else if (layer === 3) {
        for (let row = 0; row < 3; row++) {
          const z = -48 + row * 48;
          panel(-91, z - 10, 26 + row * 12, 20, "#ffffff12");
          line(
            [
              [-30, z],
              [-10, z],
              [15, 0],
              [37, z],
            ],
            "#ffffff80",
          );
          panel(42, z - 10, 49, 20, "#ffffff1a");
        }
      } else {
        for (let rack = 0; rack < 3; rack++) {
          const z = -58 + rack * 44;
          panel(-80, z, 160, 30, "#121316");
          for (let led = 0; led < 3; led++)
            panel(-66 + led * 14, z + 10, 5, 8, "#f04d2d");
          line(
            [
              [0, z + 15],
              [64, z + 15],
            ],
            "#ffffff59",
          );
        }
      }
      [
        [-1, -1],
        [-1, 1],
        [1, -1],
        [1, 1],
      ].forEach(([sx, sz]) => {
        const p = project(sx * (radius - 21), y + 2, sz * (radius - 21));
        ctx.beginPath();
        ctx.ellipse(p.x, p.y, 2 * scale, 1.2 * scale, 0, 0, Math.PI * 2);
        ctx.fillStyle = "#ffffff40";
        ctx.fill();
      });
      if (layer === 1 || layer === 2) {
        ctx.save();
        ctx.shadowColor = "#ffffff";
        ctx.shadowBlur = 13 * scale;
        const start = project(-radius + 12, y - 7, radius);
        const end = project(radius - 12, y - 7, radius);
        const edge = ctx.createLinearGradient(start.x, start.y, end.x, end.y);
        edge.addColorStop(0, "#ffffff00");
        edge.addColorStop(0.3, "#ffffff99");
        edge.addColorStop(0.7, "#ffffff66");
        edge.addColorStop(1, "#ffffff00");
        ctx.strokeStyle = edge;
        ctx.lineWidth = 1.5 * scale;
        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);
        ctx.stroke();
        ctx.restore();
      }
      ctx.restore();
    }
    if (callout && arrowTarget && callout.opacity > 0.01) {
      ctx.save();
      ctx.globalAlpha = callout.opacity;
      ctx.strokeStyle = "#ffffff99";
      ctx.fillStyle = "#ffffff";
      ctx.lineWidth = 1.2;
      ctx.lineJoin = "round";
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(callout.x, callout.y);
      if (width <= 800) {
        const gutter = callout.side === "left" ? -22 : 22;
        ctx.lineTo(callout.x, arrowTarget.y + 22);
        ctx.lineTo(arrowTarget.x + gutter, arrowTarget.y);
        ctx.lineTo(arrowTarget.x, arrowTarget.y);
      } else {
        const { bendX, radius, direction, verticalDirection } = connectorRoute(
          callout,
          arrowTarget,
          callout.clearanceX,
        );
        if (radius < 0.5) {
          ctx.lineTo(bendX, callout.y);
          ctx.lineTo(bendX, arrowTarget.y);
        } else {
          ctx.lineTo(bendX - direction * radius, callout.y);
          ctx.quadraticCurveTo(
            bendX,
            callout.y,
            bendX,
            callout.y + verticalDirection * radius,
          );
          ctx.lineTo(bendX, arrowTarget.y - verticalDirection * radius);
          ctx.quadraticCurveTo(
            bendX,
            arrowTarget.y,
            bendX + direction * radius,
            arrowTarget.y,
          );
        }
        ctx.lineTo(arrowTarget.x, arrowTarget.y);
      }
      ctx.stroke();
      const direction = callout.side === "left" ? -1 : 1;
      polygon(
        [
          arrowTarget,
          { x: arrowTarget.x + direction * 7, y: arrowTarget.y - 3 },
          { x: arrowTarget.x + direction * 7, y: arrowTarget.y + 3 },
        ],
        "#ffffff",
      );
      ctx.beginPath();
      ctx.arc(callout.x, callout.y, 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  function draw(progress: number, callout?: LayerCallout, copyBottom?: number) {
    if (!width || !height) resize();
    ctx.clearRect(0, 0, width, height);
    const mobile = width <= 800;
    const alignment = desktopStoryAlignment(progress);
    const centerX = width * (mobile ? 0.5 : alignment.x);
    let centerY = height * (mobile ? 0.43 : alignment.y);
    const openingSize = Math.min(width / 1150, height / 640, 2.2);
    const centeredSize = Math.min(width / 1450, height / 620, 2.2);
    let size = mobile
      ? Math.min(width / 550, height / (height < 650 ? 1380 : 1100), 0.9)
      : openingSize + (centeredSize - openingSize) * alignment.centered;
    if (mobile) {
      // Fit the whole assembly above the shortest chapter, including the bottom layer.
      const geometry = layerGeometry(progress);
      const top = Math.min(
        ...geometry.map((layer) => -layer.height - 105 * layer.scale),
      );
      const bottom = Math.max(
        ...geometry.map((layer) => -layer.height + 105 * layer.scale + 18),
      );
      const headerHeight =
        document.getElementById("site-header")?.getBoundingClientRect().height ??
        68;
      const transition = Math.max(0, Math.min(1, progress / 0.12));
      const storyComposition = transition * transition * (3 - 2 * transition);
      const openingTop = height * 0.42;
      const storyTop = Math.max(headerHeight + 18, height * 0.18);
      const openingBottom = height - (height < 650 ? 112 : 96);
      const storyBottom = height * 0.56;
      const frameTop =
        openingTop + (storyTop - openingTop) * storyComposition;
      const frameBottom =
        openingBottom + (storyBottom - openingBottom) * storyComposition;
      size = Math.min(size, (frameBottom - frameTop) / (bottom - top));
      centerY = (frameTop + frameBottom) / 2 - ((top + bottom) * size) / 2;
    } else if (copyBottom !== undefined) {
      // Fit the opening stack between the centered headline and the controls.
      const geometry = layerGeometry(progress);
      const top = Math.min(
        ...geometry.map((layer) => -layer.height - 105 * layer.scale),
      );
      const bottom = Math.max(
        ...geometry.map((layer) => -layer.height + 105 * layer.scale + 18),
      );
      const frameTop = copyBottom + 32;
      const frameBottom = height - 96;
      const fitted = Math.min(size, (frameBottom - frameTop) / (bottom - top));
      const fittedY =
        (frameTop + frameBottom) / 2 - ((top + bottom) * fitted) / 2;
      const opening = 1 - alignment.centered;
      size += (fitted - size) * opening;
      centerY += (fittedY - centerY) * opening;
    }
    structure(centerX, centerY, size, progress, 0.64, callout);
  }
  resize();
  return {
    draw,
    resize,
    dispose() {
      ctx.clearRect(0, 0, width, height);
      canvas.width = 0;
      canvas.height = 0;
    },
  };
}
