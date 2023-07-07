<script lang="ts">
    import { onMount } from "svelte";

    let canvas: HTMLCanvasElement | undefined;

    onMount(() => {
        const ratio = window.devicePixelRatio || 1;
        const w = (canvas.width = window.innerWidth);
        const h = (canvas.height = window.innerHeight);

        console.log({ w, h, ratio });

        const pos = { x: w / 2 - 100, y: h / 2 };
        const radius = 20;
        const delta = { x: 1, y: 1 };
        const speed = 5;

        const context = canvas.getContext("2d");

        let frame = requestAnimationFrame(function loop(t) {
            frame = requestAnimationFrame(loop);

            context.clearRect(0, 0, w, h);

            context.fillStyle = "#000000";
            context.beginPath();
            context.arc(pos.x, pos.y, radius, 0, 2 * Math.PI);
            context.fill();

            pos.x += delta.x * speed;
            pos.y += delta.y * speed;

            if (pos.x + radius > w) delta.x = -1;
            if (pos.x - radius < 0) delta.x = 1;

            if (pos.y + radius > h) delta.y = -1;
            if (pos.y - radius < 0) delta.y = 1;
        });

        return () => {
            cancelAnimationFrame(frame);
        };
    });
</script>

<canvas bind:this={canvas} />

<style>
    canvas {
        touch-action: none;
        display: block;
        margin: 0px;

        background-color: brown;
    }
</style>
