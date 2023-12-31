import { writable } from "svelte/store";

export const speed = writable(1);

export const color = writable("#A2D729");
export const mass = writable(10);
export const radius = writable(20);

export const drawOnTop = writable(false);

export const averageInitialMomentum = writable(1);
export const areaFactor = writable(3);

export const preventInterlock = writable(true);
export const wrap = writable(false);
