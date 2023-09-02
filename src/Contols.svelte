<script lang="ts">
  import { Checkbox, Kbd, TabItem, Tabs } from "flowbite-svelte";
  import { MAX_MASS, MAX_RADIUS } from "./constants";
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
  import { isTouchDevice } from "./utils";

  let visibility = isTouchDevice() ? "hidden" : "visible";
  if (isTouchDevice() && !sessionStorage.getItem("mobile-warn")) {
    alert(
      "This site is currrently designed to work with keyboard and mouse.\nSimulation will still work but you won't be able to control it"
    );
    sessionStorage.setItem("mobile-warn", "true");
  }

  function keydown(e: KeyboardEvent) {
    if (e.key == "Escape") visibility = visibility === "visible" ? "hidden" : "visible";
  }
</script>

<svelte:document on:keydown={keydown} />

<div class="w-full h-full relative flex justify-center pointer-events-none" style:visibility>
  <div class="mt-16 pointer-events-auto p-5 pt-10 bg-slate-900/95 h-max w-fit min-w-[50%] text-white rounded">
    <Tabs style="pill">
      <TabItem open title="Controls">
        <div class="grid grid-cols-2 gap-y-2">
          <div><Kbd class="px-2 py-1.5">Esc</Kbd></div>
          <div>Show\Hide this dialog</div>

          <div><Kbd class="px-2 py-1.5">Lmb</Kbd> + Mouse Drag</div>
          <div>Spawn and launch a dot</div>

          <div><Kbd class="px-2 py-1.5">BackSpace</Kbd></div>
          <div>Repopulate canvas</div>

          <div><Kbd class="px-2 py-1.5">Delete</Kbd></div>
          <div>Delete all dots</div>

          <div><Kbd class="px-2 py-1.5">Space</Kbd></div>
          <div>Pause/Unpause simulation</div>
        </div>
      </TabItem>
      <TabItem title="General">
        <div class="grid grid-cols-2 gap-y-2">
          <label for="speed">Simulation speed: {$speed}</label>
          <input name="speed" type="range" class="accent-primary-500" bind:value={$speed} min="0" max="5" step="0.1" />

          <label for="interlock">Prevent interlock</label>
          <Checkbox name="interlock" bind:checked={$preventInterlock} />

          <label for="wrap">Wrap edges</label>
          <Checkbox name="wrap" bind:checked={$wrap} />

          <label for="drawOnTop">Draw on top of previous frame</label>
          <Checkbox name="drawOnTop" bind:checked={$drawOnTop} />
        </div>
      </TabItem>
      <TabItem title="Spawn">
        <div class="grid grid-cols-2 gap-y-2">
          <label for="radius">Point radius: {$radius}</label>
          <input
            name="radius"
            type="range"
            class="accent-primary-500"
            bind:value={$radius}
            min="5"
            max={MAX_RADIUS}
            step="1"
          />

          <label for="mass">Point mass: {$mass}</label>
          <input
            name="mass"
            type="range"
            class="accent-primary-500"
            bind:value={$mass}
            min="1"
            max={MAX_MASS}
            step="1"
          />

          <label for="color">Point color: <span style:color={$color}>{$color}</span></label>
          <input name="color" class="accent-primary-500" type="color" bind:value={$color} />
        </div>
      </TabItem>
      <TabItem title="Repopulation">
        <div class="grid grid-cols-2 gap-y-2">
          <label for="momentum">Initial average momentum: {$averageInitialMomentum}</label>
          <input
            name="momentum"
            type="range"
            class="accent-primary-500"
            bind:value={$averageInitialMomentum}
            min="0"
            max="5"
            step="0.1"
          />

          <label for="reversedDensity">Reversed density factor: {$areaFactor}</label>
          <input
            name="reversedDensity"
            type="range"
            class="accent-primary-500"
            bind:value={$areaFactor}
            min="1"
            max="10"
            step="0.1"
          />
        </div>
      </TabItem>
    </Tabs>
  </div>
</div>

<style>
  label {
    min-width: 200px;
  }

  input {
    flex-grow: 1;
  }

  /* fix issues with firefox */
  input[type="range"] {
    background-color: transparent;
  }

  input[type="color"] {
    appearance: none;
    background-color: transparent;
    border: none;
    cursor: pointer;
    width: 100%;
  }
</style>
