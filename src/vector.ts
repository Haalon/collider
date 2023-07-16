export type Vec = [number, number];

export function sub(a: Vec, b: Vec): Vec {
  return [a[0] - b[0], a[1] - b[1]];
}

export function add(a: Vec, b: Vec): Vec {
  return [a[0] + b[0], a[1] + b[1]];
}

export function scale(mult: number, a: Vec): Vec {
  return [a[0] * mult, a[1] * mult];
}

export function dot(a: Vec, b: Vec): number {
  return a[0] * b[0] + a[1] * b[1];
}

export function magnitude(a: Vec): number {
  return Math.sqrt(a[0] * a[0] + a[1] * a[1]);
}

export function magnitude2(a: Vec): number {
  return a[0] * a[0] + a[1] * a[1];
}

export function normalize(a: Vec): Vec {
  return scale(1 / magnitude(a), a);
}

export function project(a: Vec, b: Vec): number {
  const normB = normalize(b);
  return dot(normB, a);
}
