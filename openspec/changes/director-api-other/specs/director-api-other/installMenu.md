## installMenu

**Source**: `docs/drmx2004_scripting_ref.txt` lines 19269-19302

### Usage
```lingo

```

### Description
Command; installs the menu defined in the field cast member specified by whichCastMember.
These custom menus appear only while the movie is playing. To remove the custom menus, use
the installMenu command with no argument or with 0 as the argument. This command doesn’t
work with hierarchical menus.
For an explanation of how menu items are defined in a field cast member, see the menu keyword.
Avoid changing menus many times because doing so affects system resources.
In Windows, if the menu is longer than the screen, only part of the menu appears; on the
Macintosh, menus longer than the screen can scroll.
Note: Menus are not available in Shockwave Player.

installMenu

369

### Parameters
fieldMemberObjRef Optional. Specifies the field cast member to which a menu is installed.

### Example
```lingo
This statement installs the menu defined in field cast member 37:
installMenu 37

This statement installs the menu defined in the field cast member named Menubar:
installMenu member "Menubar"

This statement disables menus that were installed by the installMenu command:
installMenu 0
```

### See also
menu

### Implementation
- **File**: `apps/client/src/director/api/installMenu.js`
- **Test**: `apps/client/src/director/api/__tests__/installMenu.test.js`
- **Dependencies**: Various (depends on function)

