## getAt

**Source**: `docs/drmx2004_scripting_ref.txt` lines 16815-16875

### Usage
```lingo

```

### Description
List command; identifies the item in a specified position of a specified list. If the list contains
fewer elements than the specified position, a script error occurs.
The getAt command works with linear and property lists. This command has the same function
as the getaProp command for linear lists.
This command is useful for extracting a list from within another list, such as the
deskTopRectList.

### Parameters
list Required. Specifies the list from in which the item exists.
position Required. Specifies the index position of the item in the list.

### Example
```lingo
This statement causes the Message window to display the third item in the answers list, which
consists of [10, 12, 15, 22]:
put getAt(answers, 3)
-- 15

The same result can be returned using bracket access:
put answers[3]
-- 15

The following example extracts the first entry in a list containing two entries that specify name,
department, and employee number information. Then the second element of the newly extracted
list is returned, identifying the department in which the first person in the list is employed. The
format of the list is [[“Dennis”, “consulting”, 510], [“Sherry”, “Distribution”, 973]], and the list is
called employeeInfoList.
firstPerson = getAt(employeeInfoList, 1)
put firstPerson
-- ["Dennis", "consulting", 510]
firstPersonDept = getAt(firstPerson, 2)
put firstPersonDept
-- "consulting"

It’s also possible to nest getAt commands without assigning values to variables in intermediate
steps. This format can be more difficult to read and write, but less verbose.
firstPersonDept = getAt(getAt(employeeInfoList, 1), 2)
put firstPersonDept
-- "consulting"

326

Chapter 12: Methods

You can also use the bracket list access:
firstPerson = employeeInfoList[1]
put firstPerson
-- ["Dennis", "consulting", 510]
firstPersonDept = firstPerson[2]
put firstPersonDept
-- "consulting"

As with getAt, brackets can be nested:
firstPersonDept = employeeInfoList[1][2]
```

### See also
getaProp, setaProp, setAt

### Implementation
- **File**: `apps/client/src/director/core/list.js`
- **Test**: `apps/client/src/director/core/__tests__/list.test.js`
- **Dependencies**: None (part of List class)

