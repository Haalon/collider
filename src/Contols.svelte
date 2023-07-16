<script lang="ts">
  let visibility = "visible";
  import { color, mass, radius, speed } from "./state";

  function keydown(e: KeyboardEvent) {
    if (e.key == "Escape") visibility = visibility === "visible" ? "hidden" : "visible";
  }
</script>

<svelte:document on:keydown={keydown} />

<div class="container" style:visibility>
  <div class="dialog">
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
    display: flex;
    width: 100%;
    gap: 50px;
    /* justify-content: space-between; */
  }

  label {
    min-width: 200px;
  }

  input {
    flex-grow: 1;
  }

  .container {
    width: 100vw;
    height: 100vh;
    display: flex;
    position: relative;

    justify-content: end;
    align-items: center;
    pointer-events: none;
  }

  .dialog {
    pointer-events: all;
    padding: 20px;
    padding-top: 60px;
    min-width: 600px;
    height: 100%;
    display: flex;
    flex-direction: column;
    gap: 20px;

    background-color: rgba(203, 207, 216, 0.5);
  }
</style>
