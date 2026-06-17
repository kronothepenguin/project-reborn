## date() (formats)

**Source**: `docs/drmx2004_scripting_ref.txt` lines 14582-14703

### Usage
```lingo

```

### Description
Top level function and data type. Creates a standard, formatted date object instance for use with
other date object instances in arithmetic operations and for use in manipulating dates across
platforms and in international formats.
Lingo date objects and JavaScript syntax date objects are different; therefore, Lingo date objects
cannot be created using JavaScript syntax, and JavaScript syntax date objects cannot be created
using Lingo syntax.
Create a new JavaScript syntax Date object using the new Date() syntax. Case is important in
JavaScript syntax. For example, using new date() results in a runtime error.
When creating a date using Lingo, use four digits for the year, two digits for the month,
and two digits for the day. The following expressions all return a date object equivalent to
October 21, 2004.
Date Format

### Parameters
stringFormat Optional when creating a Lingo date object. A string that specifies the new

date object.

282

Chapter 12: Methods

intFormat Optional when creating a Lingo date object. An integer that specifies the new

date object.
intYearFormat Optional when creating a Lingo date object. An integer that specifies the fourdigit year of the new date object.
intMonthFormat Optional when creating a Lingo date object. An integer that specifies the twodigit month of the new date object.
intDayFormat Optional when creating a Lingo date object. An integer that specifies the two-

digit day of the new date object.
month Optional when creating an JavaScript syntax Date object. A string that specifies the month

of the new Date object. Valid values range from 0 (January) to 11 (December).
dd Optional when creating an JavaScript syntax Date object. A two-digit integer that specifies the
day of the new Date object. Valid values range from 0 (Sunday) to 6 (Saturday).
yyyy Optional when creating an JavaScript syntax Date object. A four-digit integer that specifies

the year of the new Date object.
hh Optional when creating an JavaScript syntax Date object. A two-digit integer that specifies the
hour of the new Date object. Valid values range from 0 (12:00am) to 23 (11:00pm).
mm Optional when creating an JavaScript syntax Date object. A two-digit integer that specifies the
minute of the new Date object. Valid values range from 0 to 59.
ss Optional when creating an JavaScript syntax Date object. A two-digit integer that specifies the
seconds of the new Date object. Valid values range from 0 to 59.
yy Optional when creating an JavaScript syntax Date object. A two-digit integer that specifies the
year of the new Date object. Valid values range from 0 to 99.
milliseconds Optional when creating an JavaScript syntax Date object. An integer that specifies

the milliseconds of the new Date object. Valid values range from 0 to 999.

### Example
```lingo
These statements create and determine the number of days between two dates:
-- Lingo syntax syntax
myBirthday = date(19650712)
yourBirthday = date(19450529)
put("There are" && abs(yourBirthday - myBirthday) && "days between our \
birthdays.")
// JavaScript syntax
var myBirthday = new Date(1965, 07, 12);
var yourBirthday = new Date(1945, 05, 29);
put("There are " + Math.abs(((yourBirthday - myBirthday)/1000/60/60/24)) +
" days between our birthdays.");

These statements access an individual property of a date:
-- Lingo syntax syntax
myBirthday = date(19650712)
put("I was born in month number" && myBirthday.month)
// JavaScript syntax
var myBirthday = new Date(1965, 07, 12);
put("I was born in month number " + myBirthday.getMonth());

date() (formats)

283
```

### See also
N/A

### Implementation
- **File**: `apps/client/src/director/api/date-formats.js`
- **Test**: `apps/client/src/director/api/__tests__/date-formats.test.js`
- **Dependencies**: Various (depends on function)

