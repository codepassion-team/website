type Point = { x: number; y: number };

/** Keep both bends between the label and layer, even in a narrow column gap. */
export function connectorRoute(start: Point, end: Point, clearanceX: number) {
  const direction = end.x >= start.x ? 1 : -1;
  const gap = Math.abs(end.x - start.x);
  const requested = (clearanceX - start.x) * direction;
  // Keep the elbows away from either endpoint so the route remains legible
  // when copy switches sides or its width changes between story chapters.
  const bendDistance = Math.max(
    gap * 0.22,
    Math.min(gap * 0.78, requested),
  );
  return {
    direction,
    verticalDirection: end.y >= start.y ? 1 : -1,
    bendX: start.x + direction * bendDistance,
    radius: Math.min(
      12,
      bendDistance * 0.7,
      (gap - bendDistance) * 0.7,
      Math.abs(end.y - start.y) * 0.35,
    ),
  };
}
