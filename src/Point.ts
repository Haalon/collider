import { add, dot, magnitude, magnitude2, normalize, project, scale, sub, type Vec } from "./vector";

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

  moveInBox(w: number, h: number, speed: number = 1) {
    this.pos = add(this.pos, scale(speed, this.vel));

    if (this.pos[0] + this.radius > w && this.vel[0] > 0) this.vel[0] *= -1;
    if (this.pos[0] - this.radius < 0 && this.vel[0] < 0) this.vel[0] *= -1;

    if (this.pos[1] + this.radius > h && this.vel[1] > 0) this.vel[1] *= -1;
    if (this.pos[1] - this.radius < 0 && this.vel[1] < 0) this.vel[1] *= -1;
  }

  draw(context: CanvasRenderingContext2D) {
    context.fillStyle = this.color;
    context.beginPath();
    context.arc(this.pos[0], this.pos[1], this.radius, 0, 2 * Math.PI);
    context.fill();
  }
}
