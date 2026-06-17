## ilk()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 18644-18891

### Usage
```lingo

```

### Description
Function; indicates the type of an object.

ilk()

361

The following table shows the return value for each type of object recognized by ilk():

### Parameters
object Required. Specifies the object to test.
type Optional. Specifies the type to which object is compared. If the object is of the specified
type, the ilk() function returns TRUE. If the object is not of the specified type, the ilk()
function returns FALSE.

362

Chapter 12: Methods

### Example
```lingo
Type of
Object

ilk(Object) returns

ilk(Object, Type)
returns 1 only if
Type =

linear list

#list

#list or #linearlist ilk ([1,2,3])

property list

#proplist

#list or #proplist

ilk ([#his: 1234, #hers: 7890])

integer

#integer

#integer or #number

ilk (333)

float

#float

#float or #number

ilk (123.456)

string

#string

#string

ilk ("asdf")

rect

#rect

#rect or #list

ilk (sprite(1).rect)

point

#point

#point or #list

ilk (sprite(1).loc)

color

#color

#color

ilk (sprite(1).color)

date

#date

#date

ilk (the systemdate)

symbol

#symbol

#symbol

ilk (#hello)

void

#void

#void

ilk (void)

picture

#picture

#picture

ilk (member (2).picture)

parent script
instance

#instance

#object

ilk (new (script "blahblah"))

xtra instance

#instance

#object

ilk (new (xtra "fileio"))

member

#member

#object or #member

ilk (member 1)

xtra

#xtra

#object or #xtra

ilk (xtra "fileio")

script

#script

#object or #script

ilk (script "blahblah")

castlib

#castlib

#object or #castlib

ilk (castlib 1)

sprite

#sprite

#object or #sprite

ilk (sprite 1)

sound

#instance or #sound
(when Sound Control
Xtra is not present)

#instance or #sound

ilk (sound "yaddayadda")

window

#window

#object or #window

ilk (the stage)

media

#media

#object or #media

ilk (member (2).media)

timeout

#timeout

#object or #timeout

ilk (timeOut("intervalTimer"))

image

#image

#object or #image

ilk ((the stage).image)
```

### See also
N/A

### Implementation
- **File**: `apps/client/src/director/api/ilk.js`
- **Test**: `apps/client/src/director/api/__tests__/ilk.test.js`
- **Dependencies**: None (pure function)

