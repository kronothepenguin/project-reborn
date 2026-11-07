<script lang="ts" module>
  declare global {
    interface Window {
      HabboEditor: {
        setGenderAndFigure(gender: string, figure: string): void;
        setEditorState(state: string): void;
        setAllowedToProceed?(allowed: boolean): void;
        showHabboClubNotice?(): void;
        hideHabboClubNotice?(): void;
        showOldFigureNotice?(): void;
      };
      HabboEditorConfig: object;
      HabboAvatarEditor?: new (container: HTMLElement, config: object) => unknown;
    }
  }
</script>

<script lang="ts">
  import { onMount } from "svelte";

  // Islands get no [[ ]] values, so the form holds the look in hidden inputs that
  // the server fills in. The editor reads them on start and writes every change
  // back, which is how the look reaches the backend.
  //
  // saveButton, clubNotice and oldFigureNotice are what Holo's settings.js listens
  // to. The editor reports false until it is first touched, so on the registration
  // form, whose script ignores it, they must stay out: a visitor who keeps the
  // suggested look could not finish.
  interface Props {
    figureInput: string;
    genderInput: string;
    stateInput: string;
    saveButton?: string;
    clubNotice?: string;
    oldFigureNotice?: string;
  }

  let {
    figureInput,
    genderInput,
    stateInput,
    saveButton,
    clubNotice,
    oldFigureNotice,
  }: Props = $props();

  let container: HTMLDivElement;

  type Look = { figure: string; gender: string };

  function input(id: string) {
    return document.getElementById(id) as HTMLInputElement;
  }

  function show(id: string | undefined, shown: boolean) {
    if (id) {
      (document.getElementById(id) as HTMLElement).hidden = !shown;
    }
  }

  onMount(() => {
    const figure = input(figureInput);
    const gender = input(genderInput);
    const state = input(stateInput);

    // A "restart" event on the container starts the editor again with a look, as
    // Holo's wardrobe wrote the Flash editor again. An editor still loading cannot
    // be stopped, and would draw itself into the emptied container, so the new one
    // waits until it has drawn itself, which it reports with its first look.
    let starting = true;
    let waiting: Look | null = null;

    function restart(look: Look) {
      gender.value = look.gender;
      figure.value = look.figure;
      if (starting) {
        waiting = look;
        return;
      }
      starting = true;
      window.HabboEditorConfig = { ...window.HabboEditorConfig, ...look };
      container.replaceChildren();
      new window.HabboAvatarEditor!(container, window.HabboEditorConfig);
    }

    window.HabboEditor = {
      setGenderAndFigure(newGender, newFigure) {
        gender.value = newGender;
        figure.value = newFigure;
        if (starting) {
          starting = false;
          const look = waiting;
          waiting = null;
          if (look) queueMicrotask(() => restart(look));
        }
      },
      setEditorState(newState) {
        state.value = newState;
      },
    };
    if (saveButton) {
      const save = document.getElementById(saveButton) as HTMLButtonElement;
      Object.assign(window.HabboEditor, {
        setAllowedToProceed(allowed: boolean) {
          save.disabled = !allowed;
          if (allowed) {
            show(clubNotice, false);
          }
        },
        showHabboClubNotice: () => show(clubNotice, true),
        hideHabboClubNotice: () => show(clubNotice, false),
        showOldFigureNotice: () => show(oldFigureNotice, true),
      });
    }
    container.addEventListener("restart", (event) => restart((event as CustomEvent<Look>).detail));

    // The editor spreads this over its defaults, so an undefined value would
    // replace one. It attaches itself to #editor-container when its script loads.
    window.HabboEditorConfig = {
      figure: figure.value,
      gender: gender.value || "U",
      menuState: state.value,
      userHasClub: figure.dataset.club === "true",
      showClubSelections: saveButton !== undefined,
      assetsPath: "/",
      assetBundlePath: "assets.zip",
    };

    const script = document.createElement("script");
    script.src = "/habbo-editor.iife.js";
    document.body.append(script);
  });
</script>

<div id="editor-container" bind:this={container}></div>
