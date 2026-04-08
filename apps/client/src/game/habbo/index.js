import {
  registerCast,
  createScriptMember,
  createBitmapMember,
} from "../../director";
import Logo from "./Internal_4_Logo.png";

registerCast("Internal", [
  createScriptMember("Initialization", import("./initialization")),
  createScriptMember("Init", import("./init")),
  createScriptMember("Loop", import("./loop")),
  createBitmapMember("Logo", Logo),
]);

registerCast("fuse_client", []);
