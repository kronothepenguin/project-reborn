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

  // Holo's Flash editor, once it had drawn a look the club allows, held its answers
  // for five seconds and then opened Save changes, or gave its last answer if the
  // look had changed meanwhile; it answered a look with club items outside the club
  // at once. The HTML5 editor counts its five seconds from its start and ends them
  // closed, so they are counted here from its first look instead, and whatever it
  // answers before that look is set aside (0107).
  function saveChanges(save: HTMLButtonElement) {
    let phase: "starting" | "drawn" | "holding" | "open" = "starting";
    let last = false;
    let changed = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    function allow(allowed: boolean) {
      save.disabled = !allowed;
      if (allowed) {
        show(clubNotice, false);
      }
    }

    return {
      start() {
        phase = "starting";
        clearTimeout(timer);
        save.disabled = true;
      },
      drawn() {
        phase = "drawn";
        last = false;
        changed = false;
      },
      looked() {
        if (phase === "holding") {
          changed = true;
        }
      },
      // Right after its first look, the editor hides the club notice, or shows it
      // for a look with club items outside the club.
      club(shown: boolean) {
        show(clubNotice, shown);
        if (phase !== "drawn") {
          return;
        }
        if (shown) {
          phase = "open";
          return;
        }
        phase = "holding";
        timer = setTimeout(() => {
          phase = "open";
          allow(changed ? last : true);
        }, 5000);
      },
      answer(allowed: boolean) {
        last = allowed;
        if (phase === "open") {
          allow(allowed);
        }
      },
    };
  }

  onMount(() => {
    const figure = input(figureInput);
    const gender = input(genderInput);
    const state = input(stateInput);
    const proceed = saveButton
      ? saveChanges(document.getElementById(saveButton) as HTMLButtonElement)
      : undefined;

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
      proceed?.start();
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
          proceed?.drawn();
          const look = waiting;
          waiting = null;
          if (look) queueMicrotask(() => restart(look));
        } else {
          proceed?.looked();
        }
      },
      setEditorState(newState) {
        state.value = newState;
      },
    };
    if (proceed) {
      Object.assign(window.HabboEditor, {
        setAllowedToProceed: proceed.answer,
        showHabboClubNotice: () => proceed.club(true),
        hideHabboClubNotice: () => proceed.club(false),
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
