import { getContext, setContext } from "svelte";

export interface TabRegistration {
  readonly value: string;
  disabled(): boolean;
  element(): HTMLElement | undefined;
}

// The colour of a group of tabs: Holo's blue, green or orange inner tabs.
export type TabsColor = "blue" | "green" | "orange";

export interface TabsContext {
  readonly value: string | undefined;
  readonly color: TabsColor;
  select(value: string): void;
  keydown(event: KeyboardEvent): void;
  registerTab(registration: TabRegistration): void;
  unregisterTab(registration: TabRegistration): void;
}

export interface MenuContext {
  readonly open: boolean;
  select(value: string): void;
}

const TABS_CONTEXT = Symbol("tabs");
const MENU_CONTEXT = Symbol("menu");

export function setTabsContext(context: TabsContext): void {
  setContext(TABS_CONTEXT, context);
}

export function useTabsContext(): TabsContext {
  const context = getContext<TabsContext>(TABS_CONTEXT);
  if (!context) {
    throw new Error("Tab list, Tab and Tab panel must be used inside a Tabs component.");
  }
  return context;
}

export function setMenuContext(context: MenuContext): void {
  setContext(MENU_CONTEXT, context);
}

export function useMenuContext(): MenuContext {
  const context = getContext<MenuContext>(MENU_CONTEXT);
  if (!context) {
    throw new Error("Menu item must be used inside a Menu component.");
  }
  return context;
}