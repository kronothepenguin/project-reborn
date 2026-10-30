<script lang="ts">
  import { Notice } from "@project-reborn/components";
  import { onMount } from "svelte";

  declare global {
    interface Window {
      HabboEditor: {
        setGenderAndFigure(gender: string, figure: string): void;
        setAllowedToProceed(allowed: boolean): void;
        setEditorState(state: string): void;
        showHabboClubNotice(): void;
        hideHabboClubNotice(): void;
        showOldFigureNotice(): void;
      };
      HabboEditorConfig: object;
    }
  }

  // Islands get no [[ ]] values, so the form holds the look in hidden inputs that
  // the server fills in. The editor reads them on start and writes every change
  // back, which is how the look reaches the backend.
  interface Props {
    figureInput: string;
    genderInput: string;
    stateInput: string;
    submitButton: string;
  }

  let { figureInput, genderInput, stateInput, submitButton }: Props = $props();

  let clubItem = $state(false);
  let oldFigure = $state(false);

  function input(id: string) {
    return document.getElementById(id) as HTMLInputElement;
  }

  onMount(() => {
    const figure = input(figureInput);
    const gender = input(genderInput);
    const state = input(stateInput);
    const submit = document.getElementById(submitButton) as HTMLButtonElement;

    window.HabboEditor = {
      setGenderAndFigure(newGender, newFigure) {
        gender.value = newGender;
        figure.value = newFigure;
      },
      setAllowedToProceed(allowed) {
        submit.disabled = !allowed;
      },
      setEditorState(newState) {
        state.value = newState;
      },
      showHabboClubNotice() {
        clubItem = true;
      },
      hideHabboClubNotice() {
        clubItem = false;
      },
      showOldFigureNotice() {
        oldFigure = true;
      },
    };

    // The editor spreads this over its defaults, so an undefined value would
    // replace one. It attaches itself to #editor-container when its script loads.
    window.HabboEditorConfig = {
      figure: figure.value,
      gender: gender.value || "U",
      menuState: state.value,
      userHasClub: false,
      showClubSelections: false,
      assetsPath: "/",
      assetBundlePath: "assets.zip",
    };

    const script = document.createElement("script");
    script.src = "/habbo-editor.iife.js";
    document.body.append(script);
  });
</script>

<div id="editor-container"></div>

{#if clubItem}
  <Notice variant="orange">This item is only for Habbo Club members.</Notice>
{/if}
{#if oldFigure}
  <Notice variant="orange">This look could not be loaded completely.</Notice>
{/if}
