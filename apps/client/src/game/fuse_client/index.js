import {
  BEHAVIOR_SCRIPT,
  createBitmapMember,
  createFieldMember,
  createScriptMember,
  MOVIE_SCRIPT,
  registerCast,
} from "../../director";
import SystemProps from "./1_System Props.txt?raw";
import SystemTexts from "./2_System Texts.txt?raw";
import clientInitializationScript from "./client-initialization-script";
import errorApi from "./error-api";
import eventBrokerBehavior from "./event-broker-behavior";
import objectApi from "./object-api";

registerCast("fuse_client", [
  createFieldMember("System Props", SystemProps),
  createFieldMember("System Texts", SystemTexts),
  createScriptMember(
    "Event Broker Behavior",
    BEHAVIOR_SCRIPT,
    eventBrokerBehavior,
  ),
  createScriptMember(
    "Client Initialization Script",
    MOVIE_SCRIPT,
    clientInitializationScript,
  ),
  //
  createScriptMember("Object API", MOVIE_SCRIPT, objectApi),
  createScriptMember("Error API", MOVIE_SCRIPT, errorApi),
]);
