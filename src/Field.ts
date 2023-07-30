import { PALETTES, STARTING_DOTS } from "./constants";
import { Point } from "./Point";
import { gaussianRandom, generateRandomNumbersWithSum, rand } from "./utils";
import { add, dot, magnitude, magnitude2, project, scale, sub, type Vec } from "./vector";

export class Field {
  size: Vec;
  fieldSize: Vec;
  maxRadius: number;

  buckets: Map<string, Point[]>;
  locations: Map<Point, string>;

  constructor(size: Vec, maxRadius: number) {
    this.size = size;
    this.maxRadius = maxRadius;

    const [w, h] = this.size;

    this.fieldSize = [Math.ceil(w / this.maxRadius / 2), Math.ceil(h / this.maxRadius / 2)];

    this.clear();
  }

  clear() {
    this.buckets = new Map();
    this.locations = new Map();
  }

  fieldIndex2dTo1d(i: number, j: number) {
    return `${i}_${j}`;
  }

  fieldIndex1dTo2d(index: string) {
    return index.split("_").map(Number);
  }

  getBucketIndex(pos: Vec): string {
    const [i, j] = [Math.floor(pos[0] / this.maxRadius / 2), Math.floor(pos[1] / this.maxRadius / 2)];
    return this.fieldIndex2dTo1d(i, j);
  }

  addPoint(point: Point) {
    const bucketIndex = this.getBucketIndex(point.pos);
    this.locations.set(point, bucketIndex);

    if (!this.buckets.has(bucketIndex)) this.buckets.set(bucketIndex, []);

    const bucket = this.buckets.get(bucketIndex);
    bucket?.push(point);
  }

  removePoint(point: Point): boolean {
    if (!this.locations.has(point)) return false;

    const bucketIndex = this.locations.get(point)!;
    const bucket = this.buckets.get(bucketIndex)!;

    const index = bucket.indexOf(point);
    if (index < 0) throw new Error("Point is in field but not in any buckets");
    bucket.splice(index, 1);

    return true;
  }

  getAdjacentBuckets(n: string) {
    const [i, j] = this.fieldIndex1dTo2d(n);
    // get only half of the 8 neighbours, since collisions are calculated an applied for both points
    // that way collisions wont be chacked and calculated twice
    return [
      [0, 1],
      [1, 1],
      [1, 0],
      [1, -1],
    ]
      .map(([di, dj]) => [i + di, j + dj])
      .map(([ni, nj]) => this.fieldIndex2dTo1d(ni, nj));
  }

  calculateCollisions(preventInterlock = true) {
    for (const index of this.buckets.keys()) {
      const currentPoints = this.buckets.get(index) || [];
      if (!currentPoints.length) continue;

      const neighbourBucketIndexes = this.getAdjacentBuckets(index);
      const neighbourPoints = neighbourBucketIndexes.flatMap((n) => this.buckets.get(n) || []);

      for (let i = 0; i < currentPoints.length; i++) {
        const thisPoint = currentPoints[i];

        // collisions of points inside current bucket
        for (let j = i + 1; j < currentPoints.length; j++) {
          const otherPoint = currentPoints[j];

          const collisionAxis = sub(otherPoint.pos, thisPoint.pos);
          const otherAxisVel = project(otherPoint.vel, collisionAxis);
          const thisAxisVel = project(thisPoint.vel, collisionAxis);

          const distance = magnitude(collisionAxis);

          if (distance > thisPoint.radius + otherPoint.radius) continue;
          if (preventInterlock && otherAxisVel > thisAxisVel) continue;
          this.collide(thisPoint, otherPoint);
        }

        // collisions with neighbours
        for (let j = 0; j < neighbourPoints.length; j++) {
          const otherPoint = neighbourPoints[j];

          const collisionAxis = sub(otherPoint.pos, thisPoint.pos);
          const otherAxisVel = project(otherPoint.vel, collisionAxis);
          const thisAxisVel = project(thisPoint.vel, collisionAxis);

          const distance = magnitude(collisionAxis);

          if (distance > thisPoint.radius + otherPoint.radius) continue;
          if (preventInterlock && otherAxisVel > thisAxisVel) continue;
          this.collide(thisPoint, otherPoint);
        }
      }
    }
  }

  collide(pointA: Point, pointB: Point) {
    // see https://en.wikipedia.org/wiki/Elastic_collision#Two-dimensional_collision_with_two_moving_objects
    const x1_x2 = sub(pointA.pos, pointB.pos);
    const v1_v2 = sub(pointA.vel, pointB.vel);

    const magn2 = magnitude2(x1_x2);

    const this_mass_mult = (2 * pointB.mass) / (pointA.mass + pointB.mass);
    const other_mass_mult = (2 * pointA.mass) / (pointA.mass + pointB.mass);

    const dot_mult = dot(v1_v2, x1_x2) / magn2;

    const this_term = scale(this_mass_mult * dot_mult, x1_x2);
    const other_term = scale(other_mass_mult * dot_mult, x1_x2);

    pointA.vel = sub(pointA.vel, this_term);
    pointB.vel = add(pointB.vel, other_term);
  }

  movePoints(speed) {
    for (const point of [...this.points]) {
      this.removePoint(point);
      point.moveInBox(this.size[0], this.size[1], speed);
      this.addPoint(point);
    }
  }

  populate() {
    const [w, h] = this.size;
    const circleAreas = STARTING_DOTS.map((e) => e.radius * e.radius * 2);
    const area = window.innerWidth * window.innerHeight;
    const restrictions = [
      [0.1, 0.9],
      [0.1, 0.9],
      [0.1, 0.9],
      [0.1, 0.9],
    ];
    const counts = generateRandomNumbersWithSum(4, area, circleAreas, restrictions).map(Math.floor);
    const palette = [...PALETTES[Math.floor(Math.random() * PALETTES.length)]];
    for (const { radius, mass } of STARTING_DOTS) {
      const color = palette.shift()!;
      const count = counts.shift()!;
      for (let index = 0; index < count; index++) {
        const point = new Point(rand(0, w), rand(0, h), gaussianRandom(0, 1), gaussianRandom(0, 1), radius, mass);
        point.color = color;
        this.addPoint(point);
      }
    }
  }

  get points() {
    return this.locations.keys();
  }
}
