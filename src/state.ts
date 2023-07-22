import { writable } from "svelte/store";

export const speed = writable(1);

export const color = writable("#A2D729");
export const mass = writable(10);
export const radius = writable(20);

export const preventInterlock = writable(true);
