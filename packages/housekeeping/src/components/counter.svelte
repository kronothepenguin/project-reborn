<script lang="ts">
  let count = $state(0);
</script>

<button
  class="rounded bg-sky-600 px-4 py-2 font-bold text-white hover:bg-sky-700"
  onclick={() => count++}
>
  Count: {count}
</button>
