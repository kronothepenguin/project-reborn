<script lang="ts">
  import { Button, Icon, Notice } from "@project-reborn/components";

  interface Props {
    input: string;
  }

  let { input }: Props = $props();

  let checking = $state(false);
  let notice = $state<{ variant: "red" | "green"; text: string } | null>(null);

  async function check() {
    const name = document.getElementById(input) as HTMLInputElement;
    checking = true;
    notice = null;
    try {
      const response = await fetch("/register/check-name", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.value }),
      });
      if (!response.ok) {
        throw new Error(response.statusText);
      }
      const { error }: { error: string } = await response.json();
      notice = error
        ? { variant: "red", text: error }
        : { variant: "green", text: "Congratulations! The name is available." };
    } catch {
      notice = {
        variant: "red",
        text: "The name could not be checked. Please try again.",
      };
    } finally {
      checking = false;
    }
  }
</script>

<Button
  size="compact"
  type="button"
  aria-label="Click here to check your name is free."
  title="Click here to check your name is free."
  disabled={checking}
  onclick={check}
>
  <Icon />
</Button>

{#if notice}
  <div class="w-full">
    <Notice variant={notice.variant}>{notice.text}</Notice>
  </div>
{/if}
