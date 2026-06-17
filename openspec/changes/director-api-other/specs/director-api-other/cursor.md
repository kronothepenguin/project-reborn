## cursor()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 14253-14581

### Usage
```lingo
_player.cursor(intCursorNum)
_player.cursor(cursorMemNum, maskMemNum)
_player.cursor(cursorMemRef)
_player.cursor(intCursorNum);
_player.cursor(cursorMemNum, maskMemNum);
_player.cursor(cursorMemRef);
```

### Description
Player method; changes the cast member or built-in cursor that is used for a cursor and stays in
effect until you turn it off by setting the cursor to 0.

• Use the syntax _player.cursor(cursorMemNum, maskMemNum) to specify the number of a
cast member to use as a cursor and its optional mask. The cursor’s hot spot is the registration
point of the cast member.
The cast member that you specify must be a 1-bit cast member. If the cast member is larger
than 16 by 16 pixels, Director crops it to a 16-by-16-pixel square, starting in the upper left
corner of the image. The cursor’s hot spot is still the registration point of the cast member.

278

Chapter 12: Methods

• Use the syntax _player.cursor(cursorMemRef) for the custom cursors available through the
Cursor Xtra.
Note: Although the Cursor Xtra allows cursors of different cast library types, text cast members
cannot be used as cursors.

• Use the syntax _player.cursor(intCursorNum) to specify default system cursors. The term
intCursorNum must be one of the following integer values:
Value


-1, 0

Arrow

1

I-Beam

2

Cross

3

Crossbar

4

Watch (Macintosh) or Hour glass (Windows)

5

North South East West (NSEW)

6

North South (NS)

200

Blank (hides cursor)

254

Help

256

Pencil

257

Eraser

258

Select

259

Bucket

260

Hand

261

Rectangle tool

262

Rounded rectangle tool

263

Circle tool

264

Line tool

265

Rich text tool

266

Text field tool

267

Button tool

268

Check box tool

269

Radio button tool

270

Placement tool

271

Registration point tool

272

Lasso

280

Finger

281

Dropper

cursor()

279

Value


282

Wait mouse down 1

283

Wait mouse down 2

284

Vertical size

285

Horizontal size

286

Diagonal size

290

Closed hand

291

No-drop hand

292

Copy (closed hand)

293

Inverse arrow

294

Rotate

295

Skew

296

Horizontal double arrow

297

Vertical double arrow

298

Southwest Northeast double arrow

299

Northwest Southeast double arrow

300

Smear/smooth brush

301

Air brush

302

Zoom in

303

Zoom out

304

Zoom cancel

305

Start shape

306

Add point

307

Close shape

308

Zoom camera

309

Move camera

310

Rotate camera

457

Custom

During system events such as file loading, the operating system may display the watch cursor and
then change to the pointer cursor when returning control to the application, overriding the
cursor command settings from the previous movie. To use cursor() at the beginning of any
new movie that is loaded in a presentation using a custom cursor for multiple movies, store any
special cursor resource number as a global variable that remains in memory between movies.

280

Chapter 12: Methods

Cursor commands can be interrupted by an Xtra or other external agent. If the cursor is set to a
value in Director and an Xtra or external agent takes control of the cursor, resetting the cursor to
the original value has no effect because Director doesn’t perceive that the cursor has changed. To
work around this, explicitly set the cursor to a third value and then reset it to the original value.

### Parameters
intCursorNum Required when using an integer to identify a cursor. An integer that specifies the
built-in cursor to use as a cursor.
cursorMemNum Required when using a cast member number and its optional mask to identify the

cursor. An integer that specifies the cast member number to use as a cursor.
maskMemNum Required when using a cast member number and its optional mask to identify the
cursor. An integer that specifies the mask number of cursorMemNum.
cursorMemRef Required when using a cast member reference to identify the cursor. A reference

to the cast member to use as a cursor.

### Example
```lingo
This statement changes the cursor to a watch cursor on the Macintosh, and hourglass in
Windows, whenever the value in the variable named status equals 1:
-- Lingo syntax syntax
if (status = 1) then
_player.cursor(4)
end if
// JavaScript syntax
if (status == 1) {
_player.cursor(4);
}

This handler checks whether the cast member assigned to the variable is a 1-bit cast member and
then uses it as the cursor if it is:
-- Lingo syntax syntax
on myCursor(someMember)
if (member(someMember).depth = 1) then
_player.cursor(someMember)
else
_sound.beep()
end if
end
// JavaScript syntax
function myCursor(someMember) {
if (member(someMember).depth == 1) {
_player.cursor(someMember);
}
else {
_sound.beep();
}
}
```

### See also
Player

cursor()

281

### Implementation
- **File**: `apps/client/src/director/api/cursor.js`
- **Test**: `apps/client/src/director/api/__tests__/cursor.test.js`
- **Dependencies**: Various (depends on function)

