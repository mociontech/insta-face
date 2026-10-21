export type Landmark = { x: number; y: number; z?: number };

export function eyeTriangle(left: Landmark, right: Landmark) {
  return [left, right, { x: left.x - (right.y - left.y), y: left.y + (right.x - left.x) }];
}

export function visitorCrop(faces: Landmark[][], width: number, height: number) {
  if (faces.length !== 1) throw new Error(faces.length ? "Debe aparecer una sola persona en la foto." : "No se detecto tu rostro. Mira a la camara y evita reflejos en las gafas.");
  const face = faces[0];
  if (face.length < 455 || !face.every((vertex) => Number.isFinite(vertex.x) && Number.isFinite(vertex.y))) throw new Error("No se pudo medir bien el rostro. Repite la foto.");
  const left = face[33], right = face[263];
  const eyeSpan = Math.hypot((right.x - left.x) * width, (right.y - left.y) * height);
  if (eyeSpan < 40) throw new Error("Acercate un poco mas a la camara para conservar los detalles de tus ojos y gafas.");
  const roll = Math.atan2((right.y - left.y) * height, (right.x - left.x) * width);
  const nosePosition = (face[1].x - left.x) / Math.max(0.001, right.x - left.x);
  if (Math.abs(roll) > Math.PI / 12 || nosePosition < 0.2 || nosePosition > 0.8) throw new Error("Mira de frente a la camara y manten la cabeza recta.");
  const xs = face.slice(0, 468).map((vertex) => vertex.x * width);
  const ys = face.slice(0, 468).map((vertex) => vertex.y * height);
  const minX = Math.min(...xs), maxX = Math.max(...xs), minY = Math.min(...ys), maxY = Math.max(...ys);
  const marginX = (maxX - minX) * 0.4, marginY = (maxY - minY) * 0.3;
  const x = Math.max(0, Math.floor(minX - marginX));
  const y = Math.max(0, Math.floor(minY - marginY));
  return { x, y, width: Math.min(width, Math.ceil(maxX + marginX)) - x, height: Math.min(height, Math.ceil(maxY + marginY)) - y };
}
