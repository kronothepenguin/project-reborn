import { getContext, setContext } from "svelte";

export interface TabRegistration {
  readonly value: string;
  disabled(): boolean;
  element(): HTMLElement | undefined;
}

export interface TabsContext {
  readonly value: string | undefined;
  select(value: string): void;
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
    throw new Error("Tab and Tab panel must be used inside a Tabs component.");
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