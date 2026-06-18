## substituteFont

**Source**: `docs/drmx2004_scripting_ref.txt` lines 28624-28660

### Usage
```lingo

```

### Description
Text cast member command; replaces all instances of one font with another font in a text
cast member.

### Parameters
originalFont Required. The font to replace.
newFont Required. The new font that replaces the font specified by originalFont.

### Example
```lingo
This script checks to see if the font Bonneville is available in a text cast member, and replaces it
with Arial if it is not:
-- Lingo syntax
property spriteNum
on beginSprite me
currMember = sprite(spriteNum).member
if currMember.missingFonts contains "Bonneville" then
currMember.substituteFont("Bonneville", "Arial")
end if
end
// JavaScript syntax
function beginSprite() {
currMember = sprite(spriteNum).member;
if (currMember.missingFonts contains "Bonneville") { //check syntax
currMember.substituteFont("Bonneville", "Arial");
}
}
```

### See also
missingFonts

substituteFont

557

### Implementation
- **File**: `apps/client/src/director/api/substituteFont.js`
- **Test**: `apps/client/src/director/api/__tests__/substituteFont.test.js`
- **Dependencies**: Various (depends on function)

