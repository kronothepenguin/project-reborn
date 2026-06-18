## puppetTransition()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 24701-24989

### Usage
```lingo
_movie.puppetTransition(memberObjRef)
_movie.puppetTransition(int {, time} {, size} {, area})
_movie.puppetTransition(memberObjRef);
_movie.puppetTransition(int {, time} {, size} {, area});
```

### Description
Movie method; performs the specified transition between the current frame and the next frame.
To use an Xtra transition cast member, use the puppetTransition(memberObjRef) syntax.
To use a built-in Director transition, replace int with a value in the following table. Replace time
with the number of quarter seconds used to complete the transition. The minimum value is 0; the
maximum is 120 (30 seconds). Replace size with the number of pixels in each chunk of the
transition. The minimum value is 1; the maximum is 128. Smaller chunk sizes yield smoother
transitions but are slower.
Code

Transition

Code

Transition

01

Wipe right

27

Random rows

02

Wipe left

28

Random columns

03

Wipe down

29

Cover down

04

Wipe up

30

Cover down, left

05

Center out, horizontal

31

Cover down, right

06

Edges in, horizontal

32

Cover left

07

Center out, vertical

33

Cover right

08

Edges in, vertical

34

Cover up

09

Center out, square

35

Cover up, left

10

Edges in, square

36

Cover up, right

11

Push left

37

Venetian blinds

12

Push right

38

Checkerboard

13

Push down

39

Strips on bottom, build left

14

Push up

40

Strips on bottom, build right

15

Reveal up

41

Strips on left, build down

16

Reveal up, right

42

Strips on left, build up

17

Reveal right

43

Strips on right, build down

18

Reveal down, right

44

Strips on right, build up

19

Reveal down

45

Strips on top, build left

puppetTransition()

481

Code

Transition

Code

Transition

20

Reveal down, left

46

Strips on top, build right

21

Reveal left

47

Zoom open

22

Reveal up, left

48

Zoom close

23

Dissolve, pixels fast*

49

Vertical blinds

24

Dissolve, boxy rectangles

50

Dissolve, bits fast*

25

Dissolve, boxy squares

51

Dissolve, pixels*

26

Dissolve, patterns

52

Dissolve, bits*

Transitions marked with an asterisk (*) do not work on monitors set to 32 bits.
There is no direct relationship between a low time value and a fast transition. The actual speed of
the transition depends on the relation of size and time. For example, if size is 1 pixel, the
transition takes longer no matter how low the time value, because the computer has to do a lot of
work. To make transitions occur faster, use a larger chunk size, not a shorter time.
Replace area with a value that determines whether the transition occurs only in the changing area
(TRUE) or over the entire Stage (FALSE, default). The area variable is an area within which sprites
have changed.

### Parameters
memberObjRef Required if using an Xtra transition cast member. A reference to the Xtra cast
member to use as the transition.
int Required if using a built-in Director transition. An integer that specifies the number of the

transition to use.
time Optional. An integer that specifies that number of quarter seconds used to complete the

transition. Valid values range from 0 to 120.
size Optional. An integer that specifies the number of pixels in each chunk of the transition.

Valid values range from 1 to 128.
area Optional. A boolean value that specifies whether the transition occurs only in the changing
area (TRUE) or over the entire Stage (FALSE).

### Example
```lingo
The following statement performs a wipe right transition. Because no value is specified for area,
the transition occurs over the entire Stage, which is the default.
-- Lingo syntax
_movie.puppetTransition(1)
// JavaScript syntax
_movie.puppetTransition(1);

482

Chapter 12: Methods

This statement performs a wipe left transition that lasts 1 second, has a chunk size of 20, and
occurs over the entire Stage:
-- Lingo syntax
_movie.puppetTransition(2, 4, 20, FALSE)
// JavaScript syntax
_movie.puppetTransition(2, 4, 20, false);
```

### See also
Movie

### Implementation
- **File**: `apps/client/src/director/api/puppetTransition.js`
- **Test**: `apps/client/src/director/api/__tests__/puppetTransition.test.js`
- **Dependencies**: Various (depends on function)

