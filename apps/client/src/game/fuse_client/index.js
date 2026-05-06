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
import javascriptLog from "./javascript-log";
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
import downloadManagerClass from "./download-manager-class";
import castloadManagerClass from "./castload-manager-class";
import connectionManagerClass from "./connection-manager-class";
import spriteManagerClass from "./sprite-manager-class";
import timeoutManagerClass from "./timeout-manager-class";
import textManagerClass from "./text-manager-class";
import stringServicesClass from "./string-services-class";
import visualizerManagerClass from "./visualizer-manager-class";
import windowManagerClass from "./window-manager-class";
import brokerManagerClass from "./broker-manager-class";
import methodManagerClass from "./method-manager-class";
import binaryManagerClass from "./binary-manager-class";
import writerManagerClass from "./writer-manager-class";
import specialServicesClass from "./special-services-class";
import multiuserManagerClass from "./multiuser-manager-class";
import objectBaseClass from "./object-base-class";
import variableContainerClass from "./variable-container-class";
import downloadInstanceClass from "./download-instance-class";
import castloadInstanceClass from "./castload-instance-class";
import castloadTaskClass from "./castload-task-class";
import connectionInstanceClass from "./connection-instance-class";
import multiuserInstanceClass from "./multiuser-instance-class";
import layoutParserClass from "./layout-parser-class";
import visualizerInstanceClass from "./visualizer-instance-class";
import windowInstanceClass from "./window-instance-class";
import elementWrapperClass from "./element-wrapper-class";
import groupedElementClass from "./grouped-element-class";
import uniqueElementClass from "./unique-element-class";
import imageWrapperClass from "./image-wrapper-class";
import textWrapperClass from "./text-wrapper-class";
import fieldWrapperClass from "./field-wrapper-class";
import patternWrapperClass from "./pattern-wrapper-class";
import commonButtonClass from "./common-button-class";
import imageButtonClass from "./image-button-class";
import iconButtonClass from "./icon-button-class";
import scrollbarClass from "./scrollbar-class";
import eventAgentClass from "./event-agent-class";
import loadingBarClass from "./loading-bar-class";
import writerClass from "./writer-class";
import threadInstanceClass from "./thread-instance-class";
import fpsTestClass from "./fps-test-class";
import rc4Class from "./rc4-class";
import coreThreadClass from "./core-thread-class";
import visualizerPartWrapperClass from "./visualizer-part-wrapper-class";
import httpcookieInstanceClass from "./httpcookie-instance-class";
import cbigInt16 from "./cbig-int16";
import jsbigInt from "./jsbig-int";
import javaScriptProxy from "./java-script-proxy";
import utf8ToLocaleClass from "./utf8-to-locale-class";
import tYy1rX5j7e4PLYJLER from "./t-yy1r-x5j7e4-plyjler";
import resourceManagerClass from "./resource-manager-class";
import threadIndex from "./73_thread.index.txt?raw";
import modalWindow from "./75_modal.window.txt?raw";
import systemWindow from "./76_system.window.txt?raw";
import emptyWindow from "./77_empty.window.txt?raw";
import errorWindow from "./78_error.window.txt?raw";
import performanceWindow from "./79_performance.window.txt?raw";
import shiftJisMap from "./87_Shift JIS to Unicode map.txt?raw";
import windows1251Map from "./88_Windows-1251 to Unicode map.txt?raw";
import crapFixer from "./89_crap.fixer.png";

registerCast("fuse_client", [
  createFieldMember("System Props", SystemProps),
  createFieldMember("System Texts", SystemTexts),
  createScriptMember("Event Broker Behavior", BEHAVIOR_SCRIPT, eventBrokerBehavior),
  createScriptMember("Client Initialization Script", MOVIE_SCRIPT, clientInitializationScript),
  createScriptMember("javascriptLog", MOVIE_SCRIPT, javascriptLog),
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
  createScriptMember("Resource Manager Class", PARENT_SCRIPT, resourceManagerClass),
  createScriptMember("Download Manager Class", PARENT_SCRIPT, downloadManagerClass),
  createScriptMember("CastLoad Manager Class", PARENT_SCRIPT, castloadManagerClass),
  createScriptMember("Connection Manager Class", PARENT_SCRIPT, connectionManagerClass),
  createScriptMember("Sprite Manager Class", PARENT_SCRIPT, spriteManagerClass),
  createScriptMember("Timeout Manager Class", PARENT_SCRIPT, timeoutManagerClass),
  createScriptMember("Text Manager Class", PARENT_SCRIPT, textManagerClass),
  createScriptMember("String Services Class", PARENT_SCRIPT, stringServicesClass),
  createScriptMember("Visualizer Manager Class", PARENT_SCRIPT, visualizerManagerClass),
  createScriptMember("Window Manager Class", PARENT_SCRIPT, windowManagerClass),
  createScriptMember("Broker Manager Class", PARENT_SCRIPT, brokerManagerClass),
  createScriptMember("Method Manager Class", PARENT_SCRIPT, methodManagerClass),
  createScriptMember("Binary Manager Class", PARENT_SCRIPT, binaryManagerClass),
  createScriptMember("Writer Manager Class", PARENT_SCRIPT, writerManagerClass),
  createScriptMember("Special Services Class", PARENT_SCRIPT, specialServicesClass),
  createScriptMember("Multiuser Manager Class", PARENT_SCRIPT, multiuserManagerClass),
  createScriptMember("Object Base Class", PARENT_SCRIPT, objectBaseClass),
  createScriptMember("Variable Container Class", PARENT_SCRIPT, variableContainerClass),
  createScriptMember("Download Instance Class", PARENT_SCRIPT, downloadInstanceClass),
  createScriptMember("CastLoad Instance Class", PARENT_SCRIPT, castloadInstanceClass),
  createScriptMember("CastLoad Task Class", PARENT_SCRIPT, castloadTaskClass),
  createScriptMember("Connection Instance Class", PARENT_SCRIPT, connectionInstanceClass),
  createScriptMember("Multiuser Instance Class", PARENT_SCRIPT, multiuserInstanceClass),
  createScriptMember("Layout Parser Class", PARENT_SCRIPT, layoutParserClass),
  createScriptMember("Visualizer Instance Class", PARENT_SCRIPT, visualizerInstanceClass),
  createScriptMember("Window Instance Class", PARENT_SCRIPT, windowInstanceClass),
  createScriptMember("Element Wrapper Class", PARENT_SCRIPT, elementWrapperClass),
  createScriptMember("Grouped Element Class", PARENT_SCRIPT, groupedElementClass),
  createScriptMember("Unique Element Class", PARENT_SCRIPT, uniqueElementClass),
  createScriptMember("Image Wrapper Class", PARENT_SCRIPT, imageWrapperClass),
  createScriptMember("Text Wrapper Class", PARENT_SCRIPT, textWrapperClass),
  createScriptMember("Field Wrapper Class", PARENT_SCRIPT, fieldWrapperClass),
  createScriptMember("Pattern Wrapper Class", PARENT_SCRIPT, patternWrapperClass),
  createScriptMember("Common Button Class", PARENT_SCRIPT, commonButtonClass),
  createScriptMember("Image Button Class", PARENT_SCRIPT, imageButtonClass),
  createScriptMember("Icon Button Class", PARENT_SCRIPT, iconButtonClass),
  createScriptMember("Scrollbar Class", PARENT_SCRIPT, scrollbarClass),
  createScriptMember("Event Agent Class", PARENT_SCRIPT, eventAgentClass),
  createScriptMember("Loading Bar Class", PARENT_SCRIPT, loadingBarClass),
  createScriptMember("Writer Class", PARENT_SCRIPT, writerClass),
  createScriptMember("Thread Instance Class", PARENT_SCRIPT, threadInstanceClass),
  createScriptMember("FPS Test Class", PARENT_SCRIPT, fpsTestClass),
  createScriptMember("RC4 Class", PARENT_SCRIPT, rc4Class),
  createFieldMember("thread.index", threadIndex),
  createScriptMember("Core Thread Class", PARENT_SCRIPT, coreThreadClass),
  createFieldMember("modal.window", modalWindow),
  createFieldMember("system.window", systemWindow),
  createFieldMember("empty.window", emptyWindow),
  createFieldMember("error.window", errorWindow),
  createFieldMember("performance.window", performanceWindow),
  createScriptMember("Visualizer Part Wrapper Class", PARENT_SCRIPT, visualizerPartWrapperClass),
  createScriptMember("HttpCookie Instance Class", PARENT_SCRIPT, httpcookieInstanceClass),
  createScriptMember("CBigInt16", PARENT_SCRIPT, cbigInt16),
  createScriptMember("JSBigInt", PARENT_SCRIPT, jsbigInt),
  createScriptMember("JavaScript Proxy", PARENT_SCRIPT, javaScriptProxy),
  createScriptMember("UTF8 To Locale Class", PARENT_SCRIPT, utf8ToLocaleClass),
  createScriptMember("tYy1rX5j7e4PLYJLER", PARENT_SCRIPT, tYy1rX5j7e4PLYJLER),
  createFieldMember("Shift JIS to Unicode map", shiftJisMap),
  createFieldMember("Windows-1251 to Unicode map", windows1251Map),
  createBitmapMember("crap.fixer", crapFixer),
]);
