<script lang="ts">
  let visibility = "visible";
  import { color, mass, radius, speed } from "./state";

  function keydown(e: KeyboardEvent) {
    if (e.key == "Escape") visibility = visibility === "visible" ? "hidden" : "visible";
  }
</script>

<svelte:document on:keydown={keydown} />

<div class="w-full h-full relative flex justify-end items-center pointer-events-none" style:visibility>
  <div
    class="pointer-events-auto p-5 pt-10 flex flex-col gap-5 bg-slate-500/50 h-full w-fit min-w-[600px] text-slate-100"
  >
    <div class="input-row">
      <label for="speed">Simulation speed: {$speed}</label>
      <input name="speed" type="range" bind:value={$speed} min="0" max="5" step="0.1" />
    </div>

    <div class="input-row">
      <label for="speed">Point radius: {$radius}</label>
      <input name="radius" type="range" bind:value={$radius} min="5" max="80" step="1" />
    </div>

    <div class="input-row">
      <label for="speed">Point mass: {$mass}</label>
      <input name="mass" type="range" bind:value={$mass} min="1" max="100" step="1" />
    </div>

    <div class="input-row">
      <label for="speed">Point color: <span style:color={$color}>{$color}</span></label>
      <input name="speed" type="color" bind:value={$color} />
    </div>
  </div>
</div>

<style>
  .input-row {
    @apply flex w-full gap-12;
  }

  label {
    min-width: 200px;
  }

  input {
    flex-grow: 1;
  }
</style>
