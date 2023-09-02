import { PALETTES, STARTING_DOTS } from "./constants";
import { Point } from "./Point";
import { gaussianRandom, generateRandomNumbersWithSum, rand } from "./utils";
import { add, dot, magnitude, magnitude2, project, scale, sub, type Vec } from "./vector";

const EPS = 0.1;

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
    // that way collisions wont be checked and calculated twice
    return [
      [0, 1],
      [1, 1],
      [1, 0],
      [1, -1],
    ]
      .map(([di, dj]) => [i + di, j + dj])
      .map(([ni, nj]) => this.fieldIndex2dTo1d(ni, nj));
  }

  getAdjacentWrappedBuckets(n: string) {
    const [i, j] = this.fieldIndex1dTo2d(n);
    const [w, h] = this.size;
    const cellSize = this.maxRadius * 2;
    const bucketIndexToEdgePoints = (i, j) => {
      return [
        [i * cellSize, j * cellSize],
        [(i + 1) * cellSize - EPS, j * cellSize],
        [i * cellSize, (j + 1) * cellSize - EPS],
        [(i + 1) * cellSize - EPS, (j + 1) * cellSize - EPS],
      ].map(([i, j]) => [(i + w) % w, (j + h) % h]) as Vec[];
    };
    // get only half of the 8 neighbours, since collisions are calculated an applied for both points
    // that way collisions wont be checked and calculated twice
    return [
      [0, 1],
      [1, 1],
      [1, 0],
      [1, -1],
    ]
      .map(([di, dj]) => [i + di, j + dj])
      .flatMap(([ni, nj]) => {
        const endPoint = [(ni + 1) * cellSize, (nj + 1) * cellSize];
        // cell fully inside the field
        if (endPoint[0] > 0 && endPoint[0] <= w && endPoint[1] > 0 && endPoint[1] <= h)
          return this.fieldIndex2dTo1d(ni, nj);

        // otherwise - find where wrapped parts of the cell may end up
        return bucketIndexToEdgePoints(ni, nj).map((point) => this.getBucketIndex(point));
      })
      .filter((value, index, arr) => arr.indexOf(value) === index && value !== n);
  }

  calculateCollisions(preventInterlock = true, wrap = false) {
    const [w, h] = this.size;
    for (const index of this.buckets.keys()) {
      const currentPoints = this.buckets.get(index) || [];
      if (!currentPoints.length) continue;

      const neighbourBucketIndexes = wrap ? this.getAdjacentWrappedBuckets(index) : this.getAdjacentBuckets(index);
      const neighbourPoints = neighbourBucketIndexes.flatMap((n) => this.buckets.get(n) || []);

      for (let i = 0; i < currentPoints.length; i++) {
        const thisPoint = currentPoints[i];

        // collisions of points inside current bucket
        for (let j = i + 1; j < currentPoints.length; j++) {
          const otherPoint = currentPoints[j];

          this.checkAndCollide(thisPoint, otherPoint, preventInterlock);
        }

        // collisions with neighbours
        for (let j = 0; j < neighbourPoints.length; j++) {
          const otherPoint = neighbourPoints[j];

          const collided = this.checkAndCollide(thisPoint, otherPoint, preventInterlock);
          // if not collided - try again but with wrapped shift by half the field size
          if (!collided && wrap) {
            const thisPos = thisPoint.pos;
            thisPoint.pos = [(thisPoint.pos[0] + (w * 3) / 2) % w, (thisPoint.pos[1] + (h * 3) / 2) % h];
            const otherPos = otherPoint.pos;
            otherPoint.pos = [(otherPoint.pos[0] + (w * 3) / 2) % w, (otherPoint.pos[1] + (h * 3) / 2) % h];

            this.checkAndCollide(thisPoint, otherPoint, preventInterlock);
            thisPoint.pos = thisPos;
            otherPoint.pos = otherPos;
          }
        }
      }
    }
  }

  checkAndCollide(pointA: Point, pointB: Point, preventInterlock = true): boolean {
    const collisionAxis = sub(pointB.pos, pointA.pos);
    const otherAxisVel = project(pointB.vel, collisionAxis);
    const thisAxisVel = project(pointA.vel, collisionAxis);

    const distance = magnitude(collisionAxis);

    if (distance > pointA.radius + pointB.radius) return false;
    if (preventInterlock && otherAxisVel > thisAxisVel) return false;
    this.collide(pointA, pointB);

    return true;
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

  movePoints(speed, wrap = false) {
    for (const point of [...this.points]) {
      this.removePoint(point);
      if (wrap) point.moveWithWrap(this.size[0], this.size[1], speed);
      else point.moveWithBounds(this.size[0], this.size[1], speed);
      this.addPoint(point);
    }
  }

  populate(averageMomentum = 1, areaFactor = 2) {
    const [w, h] = this.size;
    const circleAreas = STARTING_DOTS.map((e) => e.radius * e.radius * areaFactor);
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
        const point = new Point(
          rand(0, w),
          rand(0, h),
          gaussianRandom(0, averageMomentum),
          gaussianRandom(0, averageMomentum),
          radius,
          mass
        );
        point.color = color;
        this.addPoint(point);
      }
    }
  }

  get points() {
    return this.locations.keys();
  }

  draw(context: CanvasRenderingContext2D, wrap = false) {
    if (!wrap) for (const point of this.points) point.draw(context);
    else {
      const [w, h] = this.size;
      for (const point of this.points) {
        // point.draw(context);

        let drawList = [point.pos];
        if (point.pos[0] + point.radius > w)
          drawList = drawList.flatMap(([i, j]) => [
            [i, j],
            [i - w, j],
          ]);
        // if (point.pos[0] + point.radius > w) point.drawAt(context, [x - w, y]);
        if (point.pos[0] - point.radius < 0)
          drawList = drawList.flatMap(([i, j]) => [
            [i, j],
            [i + w, j],
          ]);
        //point.drawAt(context, [x + w, y]);

        if (point.pos[1] + point.radius > h)
          drawList = drawList.flatMap(([i, j]) => [
            [i, j],
            [i, j - h],
          ]);
        // point.drawAt(context, [x, y - h]);
        if (point.pos[1] - point.radius < 0)
          drawList = drawList.flatMap(([i, j]) => [
            [i, j],
            [i, j + h],
          ]);
        // point.drawAt(context, [x, y + h]);
        drawList.forEach((pos) => point.drawAt(context, pos));
      }
    }
  }
}
