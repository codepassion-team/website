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
    reflection.addColorStop(0, "#b7353020");
    reflection.addColorStop(0.5, "#52152208");
    reflection.addColorStop(1, "#00000000");
    ctx.fillStyle = reflection;
    ctx.fillRect(cx - 340 * scale, cy - 220 * scale, 680 * scale, 640 * scale);
    const geometry = layerGeometry(position);
    const strongest = Math.max(...geometry.map((layer) => layer.focus));
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
      side.addColorStop(0, "#17151d");
      side.addColorStop(0.45, "#51414b");
      side.addColorStop(0.5, "#211b24");
      side.addColorStop(1, "#0d0d12");
      for (let face = 0; face < 8; face++)
        polygon(
          [
            top[face],
            top[(face + 1) % 8],
            bottom[(face + 1) % 8],
            bottom[face],
          ],
          side,
          "#b699a519",
          0.5,
        );
      const metal = ctx.createLinearGradient(
        cx - 200 * scale,
        cy - 180 * scale - y * scale,
        cx + 170 * scale,
        cy + 60 * scale - y * scale,
      );
      metal.addColorStop(0, "#62616b");
      metal.addColorStop(0.18, "#36343f");
      metal.addColorStop(0.48, "#191920");
      metal.addColorStop(0.7, "#24212b");
      metal.addColorStop(1, "#100f15");
      polygon(top, metal, "#9d919b99", 0.85);
      ctx.save();
      ctx.globalAlpha *= emphasis;
      polygon(top, undefined, "#ffac8d", 0.85 + emphasis);
      ctx.restore();
      if (emphasis > 0) {
        ctx.save();
        ctx.globalAlpha *= emphasis;
        ctx.shadowColor = "#f04d2d";
        ctx.shadowBlur = 24 * scale;
        polygon(square(radius - 7, y + 1), undefined, "#ff836a", 1.4);
        ctx.restore();
      }
      polygon(square(radius - 4, y + 0.2), undefined, "#ffffff15", 0.6);
      polygon(
        square(radius - 11, y + 0.4),
        undefined,
        layer === 1 ? "#e7736b88" : "#b9a7b733",
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
        ctx.strokeStyle = trace % 3 ? "#cbbdc012" : "#e9d8de29";
        ctx.lineWidth = 0.55;
        ctx.stroke();
      }
      // Each surface has its own schematic, projected onto the same material.
      const line = (points: number[][], color = "#ffac8d", thickness = 1.5) => {
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
        fill = "#28212c",
      ) => {
        polygon(
          [
            [x, z],
            [x + w, z],
            [x + w, z + h],
            [x, z + h],
          ].map(([px, pz]) => project(px, y + 2, pz)),
          fill,
          "#dd9c9777",
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
            "#da9f93",
          );
          panel(x - 13, z - 12, 26, 24, "#86525988");
        }
        panel(-30, -30, 60, 60, "#bf685d66");
        panel(-18, -18, 36, 36, "#ffc9a599");
        for (let pin = -18; pin <= 18; pin += 12) {
          line(
            [
              [pin, -40],
              [pin, -31],
            ],
            "#ffe3c4",
          );
          line(
            [
              [pin, 31],
              [pin, 40],
            ],
            "#ffe3c4",
          );
        }
      } else if (layer === 1) {
        panel(-82, -65, 164, 130, "#17141d");
        line(
          [
            [-82, -40],
            [82, -40],
          ],
          "#b5a3b7",
        );
        panel(-67, -23, 38, 70, "#944d5266");
        panel(-16, -23, 80, 24, "#ee896b55");
        for (let row = 0; row < 3; row++)
          line(
            [
              [-16, 18 + row * 13],
              [64 - row * 12, 18 + row * 13],
            ],
            "#cebac0",
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
          panel(x - 13, z - 13, 26, 26, "#9f4c4966");
      } else if (layer === 3) {
        for (let row = 0; row < 3; row++) {
          const z = -48 + row * 48;
          panel(-91, z - 10, 26 + row * 12, 20, "#71658266");
          line(
            [
              [-30, z],
              [-10, z],
              [15, 0],
              [37, z],
            ],
            "#e59980",
          );
          panel(42, z - 10, 49, 20, "#d8745355");
        }
      } else {
        for (let rack = 0; rack < 3; rack++) {
          const z = -58 + rack * 44;
          panel(-80, z, 160, 30, "#26232f");
          for (let led = 0; led < 3; led++)
            panel(-66 + led * 14, z + 10, 5, 8, "#ffac8d");
          line(
            [
              [0, z + 15],
              [64, z + 15],
            ],
            "#afa2b8",
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
        ctx.fillStyle = "#b5a6ae99";
        ctx.fill();
      });
      if (layer === 1 || layer === 2) {
        ctx.save();
        ctx.shadowColor = "#ef3544";
        ctx.shadowBlur = 13 * scale;
        const start = project(-radius + 12, y - 7, radius);
        const end = project(radius - 12, y - 7, radius);
        const edge = ctx.createLinearGradient(start.x, start.y, end.x, end.y);
        edge.addColorStop(0, "#f04d2d00");
        edge.addColorStop(0.3, "#ff825a");
        edge.addColorStop(0.7, "#ed1b5dcc");
        edge.addColorStop(1, "#ed1b5d00");
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
      ctx.strokeStyle = "#ffac8d99";
      ctx.fillStyle = "#ffac8d";
      ctx.lineWidth = 1;
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
        "#ffac8d",
      );
      ctx.beginPath();
      ctx.arc(callout.x, callout.y, 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  function draw(progress: number, callout?: LayerCallout) {
    if (!width || !height) resize();
    ctx.clearRect(0, 0, width, height);
    const mobile = width <= 800;
    const alignment = desktopStoryAlignment(progress);
    const centerX = width * (mobile ? 0.5 : alignment.x);
    let centerY = height * (mobile ? 0.43 : alignment.y);
    const openingSize = Math.min(width / 980, height / 520, 2.65);
    const centeredWidth = 1500 - Math.min(350, Math.max(0, width - 1000) * 0.8);
    const centeredSize = Math.min(width / centeredWidth, height / 620, 2.2);
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
      const frameTop = height < 650 ? 90 : 110;
      const frameBottom = height < 650 ? height - 318 : height * 0.56;
      size = Math.min(size, (frameBottom - frameTop) / (bottom - top));
      centerY = (frameTop + frameBottom) / 2 - ((top + bottom) * size) / 2;
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
