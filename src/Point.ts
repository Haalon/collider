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

    collide(other: Point) {
        // see https://en.wikipedia.org/wiki/Elastic_collision#Two-dimensional_collision_with_two_moving_objects
        const x1_x2 = sub(this.pos, other.pos);
        const v1_v2 = sub(this.vel, other.vel);

        const magn2 = magnitude2(x1_x2);

        const this_mass_mult = (2 * other.mass) / (this.mass + other.mass);
        const other_mass_mult = (2 * this.mass) / (this.mass + other.mass);

        const dot_mult = dot(v1_v2, x1_x2) / magn2;

        const this_term = scale(this_mass_mult * dot_mult, x1_x2);
        const other_term = scale(other_mass_mult * dot_mult, x1_x2);

        this.vel = sub(this.vel, this_term);
        other.vel = add(other.vel, other_term);
    }

    static calculateCollisions(points: Point[]) {
        for (let i = 0; i < points.length; i++) {
            const thisPoint = points[i];
            for (let j = i + 1; j < points.length; j++) {
                const otherPoint = points[j];

                const collisionAxis = sub(otherPoint.pos, thisPoint.pos);
                const otherAxisVel = project(otherPoint.vel, collisionAxis);
                const thisAxisVel = project(thisPoint.vel, collisionAxis);

                const distance = magnitude(collisionAxis);

                if (distance > thisPoint.radius + otherPoint.radius) continue;
                if (otherAxisVel > thisAxisVel) continue;
                thisPoint.collide(otherPoint);
            }
        }
    }
}
