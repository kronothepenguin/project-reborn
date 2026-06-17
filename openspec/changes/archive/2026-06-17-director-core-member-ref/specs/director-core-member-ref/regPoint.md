## regPoint

**Source**: `docs/drmx2004_scripting_ref.txt` lines 47505-47545

### Usage
```lingo
memberObjRef.regPoint
memberObjRef.regPoint;
```

### Description
Member property; specifies the registration point of a cast member. Read/write.
The registration point is listed as the horizontal and vertical coordinates of a point in the form
point(horizontal, vertical). Nonvisual members such as sounds do not have a useful
regPoint property.
You can use the regPoint property to animate individual graphics in a film loop, changing the
film loop’s position in relation to other objects on the Stage.
You can also use regPoint to adjust the position of a mask being used on a sprite.
When a Flash movie cast member is first inserted into the cast library, its registration point is its
center and its centerRegPoint property is set to TRUE. If you subsequently use the regPoint
property to reposition the registration point, the centerRegPoint property is automatically set
to FALSE.

### Parameters
None.

### Example
```lingo
This statement displays the registration point of the bitmap cast member Desk in the
Message window:
-- Lingo syntax
put(member("Desk").regPoint)
// JavaScript syntax
put(member("Desk").regPoint);

This statement changes the registration point of the bitmap cast member Desk to the values in
the list:
-- Lingo syntax
member("Desk").regPoint = point(300, 400)
// JavaScript syntax
member("Desk").regPoint = point(300, 400);
```

### See also
Member, Sprite

950

Chapter 14: Properties

### Implementation
- **File**: `apps/client/src/director/core/member-ref.js`
- **Test**: `apps/client/src/director/core/__tests__/member-ref.test.js`
- **Dependencies**: None (part of MemberRef class)

