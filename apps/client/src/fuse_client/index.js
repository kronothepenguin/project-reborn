// fuse_client cast - registers members and re-exports all translated files
// Members based on Members.csv from casts/fuse_client/

import { registerMember, registerCastLib } from '../core/lingo-runtime.js'

// Register fuse_client as castLib
registerCastLib('fuse_client', 2, 'fuse_client.cct')

// Register members from Members.csv
// Scripts (memNum 3-74, 80-86)
registerMember('Event Broker Behavior', 3, 'script', 'fuse_client')
registerMember('Client Initialization Script', 4, 'script', 'fuse_client')
registerMember('javascriptLog', 5, 'script', 'fuse_client')
registerMember('Object API', 6, 'script', 'fuse_client')
registerMember('Error API', 7, 'script', 'fuse_client')
registerMember('Core Thread API', 8, 'script', 'fuse_client')
registerMember('Resource API', 9, 'script', 'fuse_client')
registerMember('CastLoad  API', 10, 'script', 'fuse_client')
registerMember('Download API', 11, 'script', 'fuse_client')
registerMember('Connection API', 12, 'script', 'fuse_client')
registerMember('Sprite API', 13, 'script', 'fuse_client')
registerMember('Timeout API', 14, 'script', 'fuse_client')
registerMember('Text API', 15, 'script', 'fuse_client')
registerMember('String Services API', 16, 'script', 'fuse_client')
registerMember('Visualizer API', 17, 'script', 'fuse_client')
registerMember('Window API', 18, 'script', 'fuse_client')
registerMember('Broker Manager API', 19, 'script', 'fuse_client')
registerMember('Variable API', 20, 'script', 'fuse_client')
registerMember('Write API', 21, 'script', 'fuse_client')
registerMember('Binary API', 22, 'script', 'fuse_client')
registerMember('Special Services API', 23, 'script', 'fuse_client')
registerMember('Multiuser API', 24, 'script', 'fuse_client')
registerMember('DropDown Class', 25, 'script', 'fuse_client')
registerMember('Manager Template Class', 26, 'script', 'fuse_client')
registerMember('Object Manager Class', 27, 'script', 'fuse_client')
registerMember('Error Manager Class', 28, 'script', 'fuse_client')
registerMember('Thread Manager Class', 29, 'script', 'fuse_client')
registerMember('Resource Manager Class', 30, 'script', 'fuse_client')
registerMember('Download Manager Class', 31, 'script', 'fuse_client')
registerMember('CastLoad Manager Class', 32, 'script', 'fuse_client')
registerMember('Connection Manager Class', 33, 'script', 'fuse_client')
registerMember('Sprite Manager Class', 34, 'script', 'fuse_client')
registerMember('Timeout Manager Class', 35, 'script', 'fuse_client')
registerMember('Text Manager Class', 36, 'script', 'fuse_client')
registerMember('String Services Class', 37, 'script', 'fuse_client')
registerMember('Visualizer Manager Class', 38, 'script', 'fuse_client')
registerMember('Window Manager Class', 39, 'script', 'fuse_client')
registerMember('Broker Manager Class', 40, 'script', 'fuse_client')
registerMember('Method Manager Class', 41, 'script', 'fuse_client')
registerMember('Binary Manager Class', 42, 'script', 'fuse_client')
registerMember('Writer Manager Class', 43, 'script', 'fuse_client')
registerMember('Special Services Class', 44, 'script', 'fuse_client')
registerMember('Multiuser Manager Class', 45, 'script', 'fuse_client')
registerMember('Object Base Class', 46, 'script', 'fuse_client')
registerMember('Variable Container Class', 47, 'script', 'fuse_client')
registerMember('Download Instance Class', 48, 'script', 'fuse_client')
registerMember('CastLoad Instance Class', 49, 'script', 'fuse_client')
registerMember('CastLoad Task Class', 50, 'script', 'fuse_client')
registerMember('Connection Instance Class', 51, 'script', 'fuse_client')
registerMember('Multiuser Instance Class', 52, 'script', 'fuse_client')
registerMember('Layout Parser Class', 53, 'script', 'fuse_client')
registerMember('Visualizer Instance Class', 54, 'script', 'fuse_client')
registerMember('Window Instance Class', 55, 'script', 'fuse_client')
registerMember('Element Wrapper Class', 56, 'script', 'fuse_client')
registerMember('Grouped Element Class', 57, 'script', 'fuse_client')
registerMember('Unique Element Class', 58, 'script', 'fuse_client')
registerMember('Image Wrapper Class', 59, 'script', 'fuse_client')
registerMember('Text Wrapper Class', 60, 'script', 'fuse_client')
registerMember('Field Wrapper Class', 61, 'script', 'fuse_client')
registerMember('Pattern Wrapper Class', 62, 'script', 'fuse_client')
registerMember('Common Button Class', 63, 'script', 'fuse_client')
registerMember('Image Button Class', 64, 'script', 'fuse_client')
registerMember('Icon Button Class', 65, 'script', 'fuse_client')
registerMember('Scrollbar Class', 66, 'script', 'fuse_client')
registerMember('Event Agent Class', 67, 'script', 'fuse_client')
registerMember('Loading Bar Class', 68, 'script', 'fuse_client')
registerMember('Writer Class', 69, 'script', 'fuse_client')
registerMember('Thread Instance Class', 70, 'script', 'fuse_client')
registerMember('FPS Test Class', 71, 'script', 'fuse_client')
registerMember('RC4 Class', 72, 'script', 'fuse_client')
registerMember('Core Thread Class', 74, 'script', 'fuse_client')
registerMember('Visualizer Part Wrapper Class', 80, 'script', 'fuse_client')
registerMember('HttpCookie Instance Class', 81, 'script', 'fuse_client')
registerMember('CBigInt16', 82, 'script', 'fuse_client')
registerMember('JSBigInt', 83, 'script', 'fuse_client')
registerMember('JavaScript Proxy', 84, 'script', 'fuse_client')
registerMember('UTF8 To Locale Class', 85, 'script', 'fuse_client')
registerMember('tYy1rX5j7e4PLYJLER', 86, 'script', 'fuse_client')

// Fields (memNum 1-2, 73)
registerMember('System Props', 1, 'field', 'fuse_client')
registerMember('System Texts', 2, 'field', 'fuse_client')
registerMember('thread.index', 73, 'field', 'fuse_client')

// Window fields (memNum 75-79)
registerMember('modal.window', 75, 'field', 'fuse_client')
registerMember('system.window', 76, 'field', 'fuse_client')
registerMember('empty.window', 77, 'field', 'fuse_client')
registerMember('error.window', 78, 'field', 'fuse_client')
registerMember('performance.window', 79, 'field', 'fuse_client')

// Text maps (memNum 87-88)
registerMember('Shift JIS to Unicode map', 87, 'text', 'fuse_client')
registerMember('Windows-1251 to Unicode map', 88, 'text', 'fuse_client')

// Bitmap (memNum 89)
registerMember('crap.fixer', 89, 'bitmap', 'fuse_client')

// Re-export all translated modules (simulates Director global scope)
import './event-broker-behavior.js'
import './client-initialization.js'
import './object-api.js'
import './error-api.js'
import './core-thread-api.js'
import './resource-api.js'
import './castload-api.js'
import './download-api.js'
import './connection-api.js'
import './sprite-api.js'
import './timeout-api.js'
import './text-api.js'
import './string-services-api.js'
import './visualizer-api.js'
import './window-api.js'
import './broker-manager-api.js'
import './variable-api.js'
import './write-api.js'
import './binary-api.js'
import './special-services-api.js'
import './multiuser-api.js'
import './dropdown-class.js'
import './manager-template-class.js'
import './object-manager-class.js'
import './error-manager-class.js'
import './thread-manager-class.js'
import './resource-manager-class.js'
import './download-manager-class.js'
import './castload-manager-class.js'
import './connection-manager-class.js'
import './sprite-manager-class.js'
import './timeout-manager-class.js'
import './text-manager-class.js'
import './string-services-class.js'
import './visualizer-manager-class.js'
import './window-manager-class.js'
import './broker-manager-class.js'
import './method-manager-class.js'
import './binary-manager-class.js'
import './writer-manager-class.js'
import './special-services-class.js'
import './multiuser-manager-class.js'
import './object-base-class.js'
import './variable-container-class.js'
import './download-instance-class.js'
import './castload-instance-class.js'
import './castload-task-class.js'
import './connection-instance-class.js'
