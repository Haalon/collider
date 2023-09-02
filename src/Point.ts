import { add, scale, type Vec } from "./vector";

export class Point {
  pos: Vec;

  vel: Vec;

  radius: number;
  mass: number;

  color: string;

  constructor(x: number, y: number, dx: number = 0, dy: number = 0, radius: number = 8, mass: number = 10) {
    this.pos = [x, y];
    this.radius = radius;

    this.vel = [dx, dy];

    this.color = "#000000";
    this.mass = mass;
  }

  moveWithBounds(w: number, h: number, speed: number = 1) {
    this.pos = add(this.pos, scale(speed, this.vel));

    if (this.pos[0] + this.radius > w && this.vel[0] > 0) this.vel[0] *= -1;
    if (this.pos[0] - this.radius < 0 && this.vel[0] < 0) this.vel[0] *= -1;

    if (this.pos[1] + this.radius > h && this.vel[1] > 0) this.vel[1] *= -1;
    if (this.pos[1] - this.radius < 0 && this.vel[1] < 0) this.vel[1] *= -1;
  }

  moveWithWrap(w: number, h: number, speed: number = 1) {
    this.pos = add(this.pos, scale(speed, this.vel));

    if (this.pos[0] >= w) this.pos[0] -= w;
    if (this.pos[0] < 0) this.pos[0] += w;

    if (this.pos[1] >= h) this.pos[1] -= h;
    if (this.pos[1] < 0) this.pos[1] += h;
  }

  draw(context: CanvasRenderingContext2D) {
    this.drawAt(context, this.pos);
  }

  drawAt(context: CanvasRenderingContext2D, coords: Vec) {
    context.fillStyle = this.color;
    context.beginPath();
    context.arc(coords[0], coords[1], this.radius, 0, 2 * Math.PI);
    context.fill();
  }
}
