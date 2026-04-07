// hh_pets_common cast - registers members and re-exports all translated files

import { registerMember, registerCastLib } from '../core/lingo-runtime.js'

// Register as castLib (number assigned by Director external_variables.txt)
registerCastLib('hh_pets_common', 0, 'hh_pets_common.cct')

// Register members from Members.csv
registerMember('Pet Class', 1, 'script', 'hh_pets_common')
registerMember('Petpart Class', 2, 'script', 'hh_pets_common')
registerMember('pet.definitions', 3, 'field', 'hh_pets_common')
registerMember('petColors_dog', 4, 'field', 'hh_pets_common')
registerMember('petColors_cat', 5, 'field', 'hh_pets_common')
registerMember('petColors_croco', 6, 'field', 'hh_pets_common')
registerMember('petstatus.window', 7, 'field', 'hh_pets_common')
registerMember('offset.dogcat.large', 8, 'field', 'hh_pets_common')
registerMember('offset.dogcat.small', 9, 'field', 'hh_pets_common')
registerMember('offset.croco.large', 10, 'field', 'hh_pets_common')
registerMember('offset.croco.small', 11, 'field', 'hh_pets_common')

// Re-export all translated modules (simulates Director global scope)
import './pet-class.js'
import './petpart-class.js'
