## getFlashProperty()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 17105-17140

### Usage
```lingo
spriteObjRef.getFlashProperty(targetName, symProp)
spriteObjRef.getFlashProperty(targetName, symProp);
```

### Description
This function allows Lingo to invoke the Flash action script function getProperty() on the
given Flash sprite. This Flash action script function is used to get the value of properties of movie
clips or levels within a Flash movie. This is similar to testing sprite properties within Director.
To get a global property of the Flash sprite, pass an empty string as the targetName. These global
Flash properties can be tested: #focusRect and #spriteSoundBufferTime.
See the Flash documentation for descriptions of these properties.

### Parameters
targetName Required. A string that specifies the name of the movie clip or level whose property
you want to get within the given Flash sprite.
symProp Required. A symbol that specifies the name of the property to get. Valid values include:
#posX, #posY, #scaleX, #scaleY, #visible, #rotate, #alpha, #name, #width, #height,
#target, #url, #dropTarget, #totalFrames, #currentFrame, #cursor, and
#lastframeLoaded.

### Example
```lingo
This statement gets the value of the #rotate property of the movie clip Star in the Flash member
in sprite 3:
-- Lingo syntax
sprite(3).setFlashProperty("Star", #rotate)
sprite(3).getFlashProperty()
// JavaScript syntax
sprite(3).setFlashProperty("Star", symbol("rotate"));
sprite(3).getFlashProperty();

getFlashProperty()

331
```

### See also
N/A

### Implementation
- **File**: `apps/client/src/director/api/getFlashProperty.js`
- **Test**: `apps/client/src/director/api/__tests__/getFlashProperty.test.js`
- **Dependencies**: Various (depends on function)

