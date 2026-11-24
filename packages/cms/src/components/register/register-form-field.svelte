<script lang="ts">
  interface Props {
    label: string;
  }

  let { label, children } = $props();
</script>

<label class="flex flex-col">
  <span class="text-center text-xs text-white">{label}</span>
  {@render children?.()}
</label>
