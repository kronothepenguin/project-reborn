<script lang="ts">
  import Step from "../step.svelte";
  import Stepper from "../stepper.svelte";

  interface Item {
    label: string;
    href?: string;
    current?: boolean;
  }

  interface Props {
    steps?: Item[];
  }

  let { steps = [] }: Props = $props();
</script>

<nav aria-label="Steps">
  <Stepper>
    {#each steps as step (step.label)}
      <Step href={step.href} current={step.current}>{step.label}</Step>
    {/each}
  </Stepper>
</nav>
