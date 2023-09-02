<script lang="ts">
  import { onMount } from "svelte";
  import { Point } from "./Point";

  import {
    areaFactor,
    averageInitialMomentum,
    color,
    drawOnTop,
    mass,
    preventInterlock,
    radius,
    speed,
    wrap,
  } from "./state";

  import { MAX_RADIUS } from "./constants";
  import { Field } from "./Field";
  import { isTouchDevice } from "./utils";
  import { sub, type Vec } from "./vector";

  let canvas: HTMLCanvasElement;

  let newPoint: Point | null = null;

  let field: Field;

  let canvasWidth: number, canvasHeight: number;

  onMount(() => {
    const context = canvas.getContext("2d");
    if (!context) throw new Error("No canvas context");

    canvasWidth = canvas.width = window.innerWidth;
    canvasHeight = canvas.height = window.innerHeight;

    field = new Field([canvasWidth, canvasHeight], MAX_RADIUS);
    field.populate($averageInitialMomentum, $areaFactor);

    let frame = requestAnimationFrame(function loop(t) {
      frame = requestAnimationFrame(loop);

      // const startTime = performance.now();
      if (!$drawOnTop) context.clearRect(0, 0, canvasWidth, canvasHeight);

      field.movePoints($speed, $wrap);
      field.calculateCollisions($preventInterlock, $wrap);
      field.draw(context, $wrap);

      if (newPoint) newPoint.draw(context);

      // console.log(performance.now() - startTime);
    });

    return () => {
      cancelAnimationFrame(frame);
    };
  });

  function resizeCanvas() {
    canvasWidth = canvas.width = window.innerWidth;
    canvasHeight = canvas.height = window.innerHeight;

    field.size = [canvasWidth, canvasHeight];
  }

  function pointerdown(event: MouseEvent) {
    if (isTouchDevice()) {
      field.clear();
      field.populate($averageInitialMomentum, $areaFactor);
      return;
    }
    const rect = canvas.getBoundingClientRect();
    newPoint = new Point(event.pageX - rect.left, event.pageY - rect.top, 0, 0, $radius, $mass);
    newPoint.color = "#FFFFFF";
  }

  function pointerup(event: MouseEvent) {
    if (!newPoint) return;
    const rect = canvas.getBoundingClientRect();
    const mousePos: Vec = [event.pageX - rect.left, event.pageY - rect.top];

    let [dx, dy] = sub(newPoint.pos, mousePos);

    let mdx = (Math.sign(dx) * (dx * dx)) / 10000;
    let mdy = (Math.sign(dy) * (dy * dy)) / 10000;
    newPoint.vel[0] = mdx;
    newPoint.vel[1] = mdy;
    newPoint.color = $color;
    field.addPoint(newPoint);

    newPoint = null;
  }

  function keydown(e: KeyboardEvent) {
    if (e.key == "Backspace") {
      field.clear();
      field.populate($averageInitialMomentum, $areaFactor);
    }
    if (e.key == "Delete") field.clear();
    if (e.key == " ") $speed = $speed === 0 ? 1 : 0;
  }
</script>

<svelte:document on:keydown={keydown} />
<svelte:window on:resize={resizeCanvas} />

<canvas
  bind:this={canvas}
  on:pointerdown={pointerdown}
  on:pointerup={pointerup}
  class="touch-none fixed top-0 left-0 bg-black"
/>
