<script lang="ts">
  import { onMount } from "svelte";

  declare global {
    interface Window {
      HabboEditor: {
        setGenderAndFigure(gender: string, figure: string): void;
        setEditorState(state: string): void;
      };
      HabboEditorConfig: object;
    }
  }

  // Islands get no [[ ]] values, so the form holds the look in hidden inputs that
  // the server fills in. The editor reads them on start and writes every change
  // back, which is how the look reaches the backend.
  //
  // These are the callbacks Holo's registration.js listens to. Its account page
  // also listens to setAllowedToProceed and the club notices, but the editor
  // reports false until it is first touched, so they must not reach this form.
  interface Props {
    figureInput: string;
    genderInput: string;
    stateInput: string;
  }

  let { figureInput, genderInput, stateInput }: Props = $props();

  function input(id: string) {
    return document.getElementById(id) as HTMLInputElement;
  }

  onMount(() => {
    const figure = input(figureInput);
    const gender = input(genderInput);
    const state = input(stateInput);

    window.HabboEditor = {
      setGenderAndFigure(newGender, newFigure) {
        gender.value = newGender;
        figure.value = newFigure;
      },
      setEditorState(newState) {
        state.value = newState;
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
