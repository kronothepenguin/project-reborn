import {
  BEHAVIOR_SCRIPT,
  createBitmapMember,
  createFieldMember,
  createScriptMember,
  registerCast,
} from "../../director";
import SystemProps from "./1_System Props.txt?raw";
import SystemTexts from "./2_System Texts.txt?raw";
import EventBrokerBehavior from "./event-broker-behavior";

registerCast("fuse_client", [
  // Fields (text data)
  createFieldMember("System Props", SystemProps),
  createFieldMember("System Texts", SystemTexts),
  createScriptMember(
    "Event Broker Behavior",
    BEHAVIOR_SCRIPT,
    EventBrokerBehavior,
  ),
]);
