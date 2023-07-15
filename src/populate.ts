import { Point } from "./Point";

function gaussianRandom(mean = 0, stdev = 1) {
    const u = 1 - Math.random(); // Converting [0,1) to (0,1]
    const v = Math.random();
    const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    // Transform to the desired mean and standard deviation:
    return z * stdev + mean;
}

function rand(a = 0, b = 0) {
    return Math.random() * (b - a) + a;
}

const types = [
    {
        radius: 10,
        color: "#3C91E6",
        mass: 1,
        count: 80,
    },
    {
        radius: 20,
        color: "#A2D729",
        mass: 10,
        count: 40,
    },
    {
        radius: 30,
        color: "#FAFFFD",
        mass: 30,
        count: 20,
    },
    {
        radius: 80,
        color: "#FA824C",
        mass: 100,
        count: 4,
    },
] as const;

export function populate(w: number, h: number): Point[] {
    const points: Point[] = [];
    for (const { radius, color, mass, count } of types) {
        for (let index = 0; index < count; index++) {
            const point = new Point(rand(0, w), rand(0, h), gaussianRandom(0, 2), gaussianRandom(0, 2), radius, mass);
            point.color = color;
            points.push(point);
        }
    }

    return points;
}
