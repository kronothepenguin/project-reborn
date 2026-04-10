import {
  BEHAVIOR_SCRIPT,
  createBitmapMember,
  createScriptMember,
  MOVIE_SCRIPT,
  registerCast,
} from "../../director";
import "../fuse_client";
import Logo from "./Internal_4_Logo.png";
import Init from "./init";
import Initialization from "./initialization";
import Loop from "./loop";

registerCast("Internal", [
  createScriptMember("Initialization", MOVIE_SCRIPT, Initialization),
  createScriptMember("Init", BEHAVIOR_SCRIPT, Init),
  createScriptMember("Loop", BEHAVIOR_SCRIPT, Loop),
  createBitmapMember("Logo", Logo),
]);

registerCast("bin", []);
