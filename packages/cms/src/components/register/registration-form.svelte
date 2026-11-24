<script lang="ts">
  import { Bubble, Button, Notice } from "@project-reborn/components";
  import { onMount } from "svelte";
  import { SvelteMap } from "svelte/reactivity";
  import {
    ageLimit,
    ageOn,
    isEmail,
    isInTheFuture,
    looksLikeEmail,
    parentEmailAgeLimit,
  } from "./registration";

  // The port of Holo's registration.js. The form is plain HTML in the page, which
  // works without JavaScript, so this island only reads it by id and adds what
  // Holo's script added. It has no props, because islands get no [[ ]] values: the
  // form carries what it needs in data attributes.

  type FieldState = "error" | "ok" | "loading";
  type Dialog = "age" | "parent" | null;

  const texts = {
    name: "Your name can contain lowercase and uppercase letters, numbers and the characters -=?!@:.",
    enterName: "Please enter a name for your Habbo (character).",
    nameCheck: "Click here to check your name is free.",
    nameFree: "Congratulations! The name is available.",
    nameCheckFailed: "The name could not be checked. Please try again.",
    detailsDisabled: "Please choose your Habbo (character) name first.",
    enterPassword: "Please enter a password.",
    passwordTooShort: "The password you have chosen is too short.",
    passwordInvalid:
      "The password you have chosen is invalid, please choose a new password.",
    passwordRetype: "Please re-enter your password.",
    passwordSuccess: "Your password is now secure.",
    passwordDifferent: "Password not the same, please re-type it.",
    email:
      "Please enter your email address. You need to activate your account using this address so please use your real address.",
    emailInvalid: "Please enter a valid email address.",
    emailRetype: "Please re-enter your email address.",
    emailSuccess: "You have provided a valid email address, thanks!",
    emailDifferent: "Your retyped email doesn't match.",
    enterEmail: "Please enter your email address.",
    parentEmailSame:
      "You parent's email and your email cannot be the same, please provide a different one.",
    birthday: "Please supply a valid birthdate",
    terms: "Please accept the Terms and Conditions",
  };

  const tips = new SvelteMap<HTMLElement, string>();
  let tipFor = $state<HTMLElement | null>(null);
  let tipPosition = $state({ top: 0, left: 0 });
  const tip = $derived(tipFor && tips.get(tipFor));

  let dialog = $state<Dialog>(null);
  let dialogPosition = $state({ top: 0, left: 0 });
  let parentEmail = $state("");
  let parentState = $state<FieldState | null>(null);
  let parentStatus = $state(texts.enterEmail);
  let parentInput = $state<HTMLInputElement>();

  let form: HTMLFormElement;
  let lastCheckedParent = "";
  let parentEmailOk = false;

  function element<T extends HTMLElement>(id: string) {
    return document.getElementById(id) as T;
  }

  function setState(field: HTMLElement, state: FieldState | null) {
    if (state) {
      field.dataset.state = state;
    } else {
      delete field.dataset.state;
    }
  }

  function showError(field: HTMLElement, focus = false) {
    setState(field, "error");
    if (focus && !(field as HTMLInputElement).disabled) {
      field.focus();
    }
  }

  function showTip(anchor: HTMLElement, below = 0, at = anchor) {
    const box = at.getBoundingClientRect();
    tipFor = anchor;
    tipPosition = {
      top: box.top + window.scrollY + below - 8,
      left: box.left + window.scrollX,
    };
  }

  function hideTip(anchor: HTMLElement) {
    if (tipFor === anchor) {
      tipFor = null;
    }
  }

  // A tip is positioned against the page, so it must not sit inside the form's
  // positioned boxes.
  function onBody(node: HTMLElement) {
    document.body.append(node);
    return { destroy: () => node.remove() };
  }

  onMount(() => {
    form = element<HTMLFormElement>("registerform");
    const name = element<HTMLInputElement>("register-name");
    const nameCheck = element<HTMLElement>("register-name-check");
    const nameCheckContainer = element<HTMLElement>(
      "register-name-check-container",
    );
    const nameErrors = element<HTMLElement>("name-error-box");
    const nameSection = element<HTMLElement>("register-section-2");
    const details = element<HTMLElement>("register-section-3");
    const overlay = element<HTMLElement>("registration-overlay");
    const password = element<HTMLInputElement>("register-password");
    const passwordAgain = element<HTMLInputElement>("register-password2");
    const email = element<HTMLInputElement>("register-email");
    const emailAgain = element<HTMLInputElement>("register-email2");
    const birthday = element<HTMLElement>("register-birthday");
    const day = element<HTMLSelectElement>("register-day");
    const month = element<HTMLSelectElement>("register-month");
    const year = element<HTMLSelectElement>("register-year");
    const terms = element<HTMLElement>("register-terms-content");
    const termsCheck = element<HTMLInputElement>("register-terms-check");
    const termsLink = element<HTMLAnchorElement>("register-terms-link");
    const failed = element<HTMLElement>("form-validation-error-box");
    const buttons = element<HTMLElement>("register-buttons");

    const minLength = Number(form.dataset.passwordMin);
    const passwordHint = `Your password must have at least ${minLength} characters and it must contain both letters and numbers.`;

    let detailsClosed = false;
    let previousName = name.value;
    let lastCheckedName = "";
    let nameCheckNeeded = true;
    let nameErrorShown = false;

    tips.set(name, texts.name);
    tips.set(nameCheck, texts.nameCheck);
    tips.set(overlay, texts.detailsDisabled);
    tips.set(password, passwordHint);
    tips.set(email, texts.email);
    tips.set(birthday, texts.birthday);
    tips.set(terms, texts.terms);

    function showNameTip() {
      showTip(name, 0, tips.get(name) === texts.name ? nameSection : name);
    }

    function closeDetails(closed: boolean) {
      detailsClosed = closed;
      overlay.hidden = !closed;
      details
        .querySelectorAll<HTMLInputElement>("input, select")
        .forEach((field) => (field.disabled = closed));
    }

    function hideNameTip(event: MouseEvent) {
      if (event.target !== name) {
        hideTip(name);
      }
    }

    async function checkAvailability() {
      hideTip(nameCheck);
      const value = name.value;
      setState(name, "loading");
      lastCheckedName = value;
      let problem: string;
      try {
        const response = await fetch("/register/check-name", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: value }),
        });
        if (!response.ok) {
          throw new Error(response.statusText);
        }
        problem = (await response.json()).error;
      } catch {
        problem = texts.nameCheckFailed;
        lastCheckedName = "";
      }

      if (problem) {
        setState(name, "error");
        tips.set(name, problem);
        nameCheckNeeded = true;
        nameErrorShown = true;
        document.addEventListener("click", hideNameTip);
        name.focus();
        showNameTip();
        return;
      }
      setState(name, "ok");
      tips.set(name, texts.nameFree);
      nameErrorShown = false;
      nameErrors.hidden = true;
      nameCheckNeeded = false;
      document.removeEventListener("click", hideNameTip);
      closeDetails(false);
      password.focus();
    }

    function checkName() {
      if (name.value !== "" && name.value !== lastCheckedName) {
        setState(name, null);
        checkAvailability();
      } else {
        name.focus();
      }
    }

    name.addEventListener("keydown", (event) => {
      // Holo also kept Tab here when there was nothing to check, which trapped
      // the keyboard in the field.
      const nothingToCheck =
        name.value === "" || name.value === lastCheckedName;
      if (event.key === "Enter" || (event.key === "Tab" && !nothingToCheck)) {
        event.preventDefault();
        checkName();
      }
    });
    name.addEventListener("input", () => {
      if (name.value !== previousName) {
        setState(name, null);
        previousName = name.value;
        lastCheckedName = "";
        nameErrorShown = false;
        closeDetails(true);
        tips.set(name, texts.name);
        showNameTip();
      }
      nameCheckNeeded = true;
    });
    name.addEventListener("focus", () => {
      hideTip(nameCheck);
      showNameTip();
    });
    name.addEventListener("blur", () => {
      if (!nameErrorShown) {
        hideTip(name);
      }
      if (name.value !== "" && nameCheckNeeded && !nameErrorShown) {
        showTip(nameCheck);
        setState(name, "error");
      }
    });
    nameCheckContainer.hidden = false;
    nameCheck.addEventListener("click", (event) => {
      event.preventDefault();
      checkName();
    });
    overlay.addEventListener("mouseenter", () => showTip(overlay, 150));
    overlay.addEventListener("mouseleave", () => hideTip(overlay));

    function watchPair(
      first: HTMLInputElement,
      second: HTMLInputElement,
      hint: string,
      isValid: (value: string) => boolean,
      messages: {
        invalid: string;
        unusable: string;
        retype: string;
        success: string;
        different: string;
      },
    ) {
      first.addEventListener("focus", () => showTip(first));
      first.addEventListener("blur", () => hideTip(first));
      first.addEventListener("input", () => {
        if (first.value === "") {
          setState(first, null);
          setState(second, null);
          second.value = "";
          tips.set(first, hint);
        } else if (isValid(first.value)) {
          setState(first, "ok");
          tips.set(first, messages.retype);
        } else {
          showError(first, true);
          tips.set(first, messages.invalid);
        }
        showTip(first);
      });
      second.addEventListener("focus", () => {
        if (first.value === "") {
          first.focus();
        }
        showTip(first);
      });
      second.addEventListener("blur", () => hideTip(first));
      second.addEventListener("input", () => {
        if (second.value === "") {
          if (first.value !== "") {
            setState(second, null);
            tips.set(first, messages.retype);
          }
        } else if (first.dataset.state === "error") {
          tips.set(first, messages.unusable);
        } else if (second.value === first.value) {
          setState(second, "ok");
          tips.set(first, messages.success);
        } else {
          showError(second, true);
          tips.set(first, messages.different);
        }
        showTip(first);
      });
    }

    // Holo asked the server about both fields as they changed. Here the browser
    // answers, so that a password stays on the page until the form is sent.
    watchPair(
      password,
      passwordAgain,
      passwordHint,
      (value) => [...value].length >= minLength,
      {
        invalid: texts.passwordTooShort,
        unusable: texts.passwordInvalid,
        retype: texts.passwordRetype,
        success: texts.passwordSuccess,
        different: texts.passwordDifferent,
      },
    );
    watchPair(email, emailAgain, texts.email, isEmail, {
      invalid: texts.emailInvalid,
      unusable: texts.emailInvalid,
      retype: texts.emailRetype,
      success: texts.emailSuccess,
      different: texts.emailDifferent,
    });

    birthday.addEventListener("click", () => {
      setState(birthday, null);
      hideTip(birthday);
    });
    termsCheck.addEventListener("click", () => {
      setState(terms, null);
      hideTip(terms);
    });
    termsLink.addEventListener("click", (event) => {
      event.preventDefault();
      window.open(
        termsLink.href,
        termsLink.target,
        "toolbar=no,location=no,directories=no,status=no,menubar=no,scrollbars=yes,resizable=yes,width=820,height=500",
      );
    });

    function validate() {
      let valid = true;
      let last: HTMLElement | null = null;
      const need = (field: HTMLElement, passes: () => boolean) => {
        if (!passes()) {
          valid = false;
          showError(field, true);
          last = field;
        }
      };

      if (!detailsClosed) {
        need(terms, () => termsCheck.checked);
        need(birthday, () => {
          if (!year.value || !month.value || !day.value) {
            return false;
          }
          return !isInTheFuture(year.value, month.value, day.value);
        });
        need(email, () => {
          return looksLikeEmail(email.value) && email.dataset.state !== "error";
        });
        need(emailAgain, () => {
          if (email.dataset.state === "error") {
            return true;
          }
          if (emailAgain.value === "") {
            tips.set(email, texts.emailRetype);
          } else if (email.value !== emailAgain.value) {
            tips.set(email, texts.emailDifferent);
          }
          return (
            looksLikeEmail(emailAgain.value) && email.value === emailAgain.value
          );
        });
        need(password, () => {
          if (password.value === "") {
            tips.set(password, texts.enterPassword);
          }
          return password.value !== "" && password.dataset.state !== "error";
        });
        need(passwordAgain, () => {
          if (password.dataset.state === "error") {
            return true;
          }
          if (passwordAgain.value === "") {
            tips.set(password, texts.passwordRetype);
          } else if (password.value !== passwordAgain.value) {
            tips.set(password, texts.passwordDifferent);
          }
          return (
            passwordAgain.value !== "" && password.value === passwordAgain.value
          );
        });
      }
      need(name, () => {
        if (name.value === "") {
          tips.set(name, texts.enterName);
        }
        return name.value !== "" && name.dataset.state !== "error";
      });

      if (last === birthday || last === terms) {
        showTip(last);
      }
      return valid;
    }

    function age() {
      return ageOn(year.value, month.value, day.value);
    }

    function openDialog(kind: Dialog) {
      element<HTMLElement>("register-columns").inert = true;
      dialog = kind;
      const box = buttons.getBoundingClientRect();
      dialogPosition = {
        top: box.top + window.scrollY - 8,
        left: box.left + window.scrollX,
      };
    }

    form.addEventListener("submit", (event) => {
      if (!validate()) {
        event.preventDefault();
        failed.hidden = false;
        return;
      }
      const years = age();
      if (years !== -1 && years < ageLimit) {
        event.preventDefault();
        openDialog("age");
        return;
      }
      if (!parentEmailOk && years !== -1 && years <= parentEmailAgeLimit) {
        event.preventDefault();
        failed.hidden = true;
        openDialog("parent");
        queueMicrotask(() => parentInput?.focus());
      }
    });

    closeDetails(true);
    name.focus();
    if (name.value !== "") {
      checkName();
    }
  });

  function checkParentEmail() {
    const email = (document.getElementById("register-email") as HTMLInputElement)
      .value;
    if (parentEmail === email) {
      parentState = "error";
      parentEmailOk = false;
      parentStatus = texts.parentEmailSame;
    } else if (
      parentEmail !== "" &&
      parentEmail !== lastCheckedParent &&
      looksLikeEmail(parentEmail)
    ) {
      lastCheckedParent = parentEmail;
      if (isEmail(parentEmail)) {
        parentStatus = texts.emailSuccess;
        parentState = "ok";
        parentEmailOk = true;
        form.submit();
      } else {
        parentState = "error";
        parentStatus = texts.emailInvalid;
      }
    } else if (parentEmail !== "" && parentEmail !== lastCheckedParent) {
      parentState = "error";
      parentEmailOk = false;
      parentStatus = texts.emailInvalid;
    }
  }

  function parentKey(event: KeyboardEvent) {
    if (event.key === "Enter" || event.key === "Tab") {
      event.preventDefault();
      checkParentEmail();
    } else {
      lastCheckedParent = "";
      parentEmailOk = false;
      parentState = null;
      parentStatus = texts.enterEmail;
    }
  }
</script>

{#if tip}
  <div
    use:onBody
    class="pointer-events-none absolute z-20 -translate-y-full"
    style:top="{tipPosition.top}px"
    style:left="{tipPosition.left}px"
  >
    <Bubble role="tooltip">{tip}</Bubble>
  </div>
{/if}

{#if dialog}
  <div
    use:onBody
    class="absolute z-20 -translate-y-full"
    style:top="{dialogPosition.top}px"
    style:left="{dialogPosition.left}px"
  >
    <Bubble class="flex flex-col gap-2">
      {#if dialog === "age"}
        <p>
          Sorry but you cannot register, because you are too young. If you
          entered an incorrect date of birth by accident please try again in a
          few hours.
        </p>
        <div class="text-right">
          <Button href="/?ageLimit=true">Cancel</Button>
        </div>
      {:else}
        <p>
          Because you are under 12 and in accordance with industry best practice
          guidelines, we require your parent or guardian's email address.
        </p>
        <Notice variant="blue">{parentStatus}</Notice>
        <label class="flex flex-col gap-1">
          <span class="font-bold">Parent or guardian's email address</span>
          <input
            bind:this={parentInput}
            bind:value={parentEmail}
            type="text"
            autocomplete="off"
            data-state={parentState}
            class="border border-neutral-600 bg-white p-0.5"
            onkeydown={parentKey}
            onblur={checkParentEmail}
          />
        </label>
      {/if}
    </Bubble>
  </div>
{/if}
