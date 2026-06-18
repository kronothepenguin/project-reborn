## setFlashProperty()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 27365-27399

### Usage
```lingo
spriteObjRef.setFlashProperty(targetName, #property, newValue)
spriteObjRef.setFlashProperty(targetName, #property, newValue);
```

### Description
Function; allows Lingo to call the Flash action script function setProperty() on the given Flash
sprite. Use the setFlashProperty() function to set the properties of movie clips or levels within
a Flash movie. This is similar to setting sprite properties within Director.
To set a global property of the Flash sprite, pass an empty string as the targetName. You can set
the global Flash properties: #focusRect and #spriteSoundBufferTime.
See the Flash documentation for descriptions of these properties.

### Parameters
targetName Required. Specifies the name of the movie clip or level whose property you want to
set within the given Flash sprite.
property Required. Specifies the name of the property to set. You can set the following movie
clip properties: #posX, #posY, #scaleX, #scaleY, #visible, #rotate, #alpha, and #name.
newValue Required. Specifies the new value.

### Example
```lingo
This statement sets the value of the #rotate property of the movie clip Star in the Flash member
in sprite 3 to 180:
-- Lingo syntax
sprite(3).setFlashProperty("Star", #rotate, 180)
// JavaScript syntax
sprite(3).setFlashProperty("Star", symbol("rotate"), 180);
```

### See also
getFlashProperty()

setFlashProperty()

531

### Implementation
- **File**: `apps/client/src/director/api/setFlashProperty.js`
- **Test**: `apps/client/src/director/api/__tests__/setFlashProperty.test.js`
- **Dependencies**: Various (depends on function)

