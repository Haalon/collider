<script lang="ts">
  import { onMount } from "svelte";
  import { Point } from "./Point";
  import { color, mass, radius, speed } from "./state";

  import { populate } from "./populate";
  import { add, scale, sub, type Vec } from "./vector";

  let canvas: HTMLCanvasElement;
  let points: Point[] = [];

  const sqrt2 = 1 / Math.sqrt(2);
  let newPoint: Point | null = null;

  onMount(() => {
    // if (!canvas) return;
    const ratio = window.devicePixelRatio || 1;
    const w = (canvas.width = window.innerWidth);
    const h = (canvas.height = window.innerHeight);

    console.log({ w, h, ratio });

    points = populate(w, h);

    const context = canvas.getContext("2d");
    if (!context) throw new Error("No canvas context");

    let frame = requestAnimationFrame(function loop(t) {
      frame = requestAnimationFrame(loop);

      context.clearRect(0, 0, w, h);

      points.forEach((point) => {
        point.draw(context);
        point.moveInBox(w, h, $speed);
      });
      Point.calculateCollisions(points);

      if (newPoint) newPoint.draw(context);
    });

    return () => {
      cancelAnimationFrame(frame);
    };
  });

  function mousedown(event: MouseEvent) {
    const rect = canvas.getBoundingClientRect();
    newPoint = new Point(event.pageX - rect.left, event.pageY - rect.top, 0, 0, $radius, $mass);
    newPoint.color = "#FFFFFF";
  }

  function mouseup(event: MouseEvent) {
    if (!newPoint) return;
    const rect = canvas.getBoundingClientRect();
    const mousePos: Vec = [event.pageX - rect.left, event.pageY - rect.top];

    let [dx, dy] = sub(newPoint.pos, mousePos);
    // const len = Math.sqrt(dx * dx + dy * dy);

    let mdx = dx / 100;
    let mdy = dy / 100;
    newPoint.vel[0] = mdx;
    newPoint.vel[1] = mdy;
    newPoint.color = $color;
    points.push(newPoint);

    newPoint = null;
  }

  function keydown(e: KeyboardEvent) {
    if (e.key == "Backspace") points = [];
  }
</script>

<svelte:document on:keydown={keydown} />

<canvas
  bind:this={canvas}
  on:mousedown={mousedown}
  on:mouseup={mouseup}
  class="touch-none fixed top-0 left-0 bg-black"
/>
