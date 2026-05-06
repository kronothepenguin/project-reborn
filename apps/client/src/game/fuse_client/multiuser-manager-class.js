import { VOID } from "../../director";

export default function () {
  return {
    pClassString: VOID,

    construct() {
      this.pClassString = "multiuser.instance.class";
      return 1;
    },
  };
}
