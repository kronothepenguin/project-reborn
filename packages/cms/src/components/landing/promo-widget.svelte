<script lang="ts">
  import { onMount } from "svelte";

  declare global {
    interface Window {
      HabbosV2LandingConfig: object;
    }
  }

  // The container is in the page because the slogan holds the site's name, which
  // an island cannot get from a [[ ]] value.
  interface Props {
    container: string;
  }

  let { container }: Props = $props();

  onMount(() => {
    const element = document.getElementById(container) as HTMLElement;

    // The widget starts itself from this config when its script loads. Without
    // the empty fallback it would ask for a demo file of its own.
    window.HabbosV2LandingConfig = {
      container,
      assetsPath: "/habbo-widgets/landing/",
      assetsZipUrl: "/habbo-widgets/landing/assets.zip",
      habbosUrl: "/xml/promo-habbos.xml",
      fallbackHabbosUrl: "",
      buttonLink: "/register",
      createButtonText: "Register today! »",
      slogan: element.dataset.slogan,
    };

    const script = document.createElement("script");
    script.src = "/habbo-widgets/landing/habbos-v2-landing.iife.js";
    document.body.append(script);
  });
</script>
