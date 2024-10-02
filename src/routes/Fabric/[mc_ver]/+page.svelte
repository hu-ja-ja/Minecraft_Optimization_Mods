<script lang="ts">
    import { onMount } from 'svelte';
    import { fetchModData } from '$lib/fetchModData';
    import type { Mod } from '$lib/fetchModData';  // type-only import



    export let params;
  
    let mods: Mod[] = [];  // 明示的にModの配列型を指定
  
    onMount(async () => {
      const version = params.mc_ver;
      mods = await fetchModData(version);
    });
  </script>

  <h1>Minecraft Mods for {params.mc_ver}</h1>

  <table>
    <thead>
      <tr>
        <th>Mod名</th>
        <th>配布場所</th>
        <th>安定性</th>
        <th>説明 + <h class="tips">Tips</h></th>
        <th>競合Mod</th>
        <th>クライアント</th>
        <th>サーバー･シングル</th>
      </tr>
    </thead>
    <tbody>
      {#each mods as mod}
        <tr>
          <td>{mod.name}</td>
          <td><a href={mod.site.url} target="_blank">{mod.site.text}</a>
            <img src={mod.site.icon} width="16" height="16" alt="{mod.site.text} icon"></td>
          <td>{mod.stability}</td>
          <td>{mod.desc}</td>
          <td>{@html mod.incomp}</td>
          <td>{mod.client}</td>
          <td>{mod.server}</td>
        </tr>
      {/each}
    </tbody>
  </table>
