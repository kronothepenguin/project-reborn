// habbo cast - registers members and re-exports all translated files

import { registerMember, registerCastLib } from '../core/lingo-runtime.js'

// Register habbo as castLib 1
registerCastLib('habbo', 1, 'habbo.dcr')

// Register members from Internal_Members.csv
registerMember('Initialization', 1, 'script', 'habbo')
registerMember('Init', 2, 'script', 'habbo')
registerMember('Loop', 3, 'script', 'habbo')
registerMember('Logo', 4, 'bitmap', 'habbo')

// Re-export all translated modules (simulates Director global scope)
import './initialization.js'
import './init.js'
import './loop.js'
