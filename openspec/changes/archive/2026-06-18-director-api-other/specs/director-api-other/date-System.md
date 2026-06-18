## date() (System)

**Source**: `docs/drmx2004_scripting_ref.txt` lines 14704-14738

### Usage
```lingo
_system.date({yyyymmdd})
_system.date({yyyymmdd});
```

### Description
System method; returns the current date in the system clock.
The format Director uses for the date varies, depending on how the date is formatted on the
computer.

• In Windows, you can customize the date display by using the International control panel.
(Windows stores the current short date format in the System.ini file. Use this value to
determine what the parts of the short date indicate.)
• On the Macintosh, you can customize the date display by using the Date and Time
control panel.

### Parameters
yyyymmdd Optional. A number that specifies the four-digit year (yyyy), two-digit month (mm),
and two-digit day (dd) of the returned date.

### Example
```lingo
This statement tests whether the current date is January 1 by checking whether the first four
characters of the date are 1/1. If it is January 1, the alert “Happy New Year!” appears:
-- Lingo syntax
if (_system.date().char[1..4] = "1/1/") then
_player.alert("Happy New Year!")
end if
// JavaScript syntax
if (_system.date().toString().substr(0, 4) == "1/1/") {
_player.alert("Happy New Year!");
}
```

### See also
System

### Implementation
- **File**: `apps/client/src/director/api/date-System.js`
- **Test**: `apps/client/src/director/api/__tests__/date-System.test.js`
- **Dependencies**: Various (depends on function)

