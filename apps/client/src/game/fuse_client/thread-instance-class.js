import { VOID } from "../../director";

export default function () {
  return {
    interface: VOID,
    component: VOID,
    handler: VOID,

    construct() {
      this.interface = 0;
      this.component = 0;
      this.handler = 0;
      return 1;
    },

    deconstruct() {
      this.interface = 0;
      this.component = 0;
      this.handler = 0;
      return 1;
    },

    getInterface() {
      return this.interface;
    },

    getComponent() {
      return this.component;
    },

    getHandler() {
      return this.handler;
    },
  };
}
