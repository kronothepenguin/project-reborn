import {
  BEHAVIOR_SCRIPT,
  createBitmapMember,
  createFieldMember,
  createScriptMember,
  MOVIE_SCRIPT,
  PARENT_SCRIPT,
  registerCast,
} from "../../director";
import SystemProps from "./1_System Props.txt?raw";
import SystemTexts from "./2_System Texts.txt?raw";
import eventBrokerBehavior from "./event-broker-behavior";
import clientInitializationScript from "./client-initialization-script";
import objectApi from "./object-api";
import errorApi from "./error-api";
import coreThreadApi from "./core-thread-api";
import resourceApi from "./resource-api";
import castloadApi from "./castload-api";
import downloadApi from "./download-api";
import connectionApi from "./connection-api";
import spriteApi from "./sprite-api";
import timeoutApi from "./timeout-api";
import textApi from "./text-api";
import stringServicesApi from "./string-services-api";
import visualizerApi from "./visualizer-api";
import windowApi from "./window-api";
import brokerManagerApi from "./broker-manager-api";
import variableApi from "./variable-api";
import writeApi from "./write-api";
import binaryApi from "./binary-api";
import specialServicesApi from "./special-services-api";
import multiuserApi from "./multiuser-api";
import dropDownClass from "./drop-down-class";
import managerTemplateClass from "./manager-template-class";
import objectManagerClass from "./object-manager-class";
import errorManagerClass from "./error-manager-class";
import threadManagerClass from "./thread-manager-class";

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
  createScriptMember("Object API", MOVIE_SCRIPT, objectApi),
  createScriptMember("Error API", MOVIE_SCRIPT, errorApi),
  createScriptMember("Core Thread API", MOVIE_SCRIPT, coreThreadApi),
  createScriptMember("Resource API", MOVIE_SCRIPT, resourceApi),
  createScriptMember("CastLoad  API", MOVIE_SCRIPT, castloadApi),
  createScriptMember("Download API", MOVIE_SCRIPT, downloadApi),
  createScriptMember("Connection API", MOVIE_SCRIPT, connectionApi),
  createScriptMember("Sprite API", MOVIE_SCRIPT, spriteApi),
  createScriptMember("Timeout API", MOVIE_SCRIPT, timeoutApi),
  createScriptMember("Text API", MOVIE_SCRIPT, textApi),
  createScriptMember("String Services API", MOVIE_SCRIPT, stringServicesApi),
  createScriptMember("Visualizer API", MOVIE_SCRIPT, visualizerApi),
  createScriptMember("Window API", MOVIE_SCRIPT, windowApi),
  createScriptMember("Broker Manager API", MOVIE_SCRIPT, brokerManagerApi),
  createScriptMember("Variable API", MOVIE_SCRIPT, variableApi),
  createScriptMember("Write API", MOVIE_SCRIPT, writeApi),
  createScriptMember("Binary API", MOVIE_SCRIPT, binaryApi),
  createScriptMember("Special Services API", MOVIE_SCRIPT, specialServicesApi),
  createScriptMember("Multiuser API", MOVIE_SCRIPT, multiuserApi),
  createScriptMember("DropDown Class", PARENT_SCRIPT, dropDownClass),
  createScriptMember("Manager Template Class", PARENT_SCRIPT, managerTemplateClass),
  createScriptMember("Object Manager Class", PARENT_SCRIPT, objectManagerClass),
  createScriptMember("Error Manager Class", PARENT_SCRIPT, errorManagerClass),
  createScriptMember("Thread Manager Class", PARENT_SCRIPT, threadManagerClass),
]);
