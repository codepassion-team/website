type Point = { x: number; y: number };

/** Keep both bends between the label and layer, even in a narrow column gap. */
export function connectorRoute(start: Point, end: Point, clearanceX: number) {
  const direction = end.x >= start.x ? 1 : -1;
  const gap = Math.abs(end.x - start.x);
  const requested = (clearanceX - start.x) * direction;
  const bendDistance = Math.max(gap * 0.1, Math.min(gap * 0.9, requested));
  return {
    direction,
    verticalDirection: end.y >= start.y ? 1 : -1,
    bendX: start.x + direction * bendDistance,
    radius: Math.min(
      10,
      bendDistance / 2,
      (gap - bendDistance) / 2,
      Math.abs(end.y - start.y) / 2,
    ),
  };
}
