---
name: lingoscript-to-javascript
description: Transalate LingoScript (.ls) to JavaScript (.js). Use when translating .ls scripts to .js, mapping Lingo constructs (symbols, chunks, put, the) to JavaScript.
---

## Rules

1. WHEN a translation is requested you SHALL translate files manually following these rules.

2. WHEN many files are given for translation you SHALL use a subagent per file AND you MUST ask user the maximum number of subagents to use.

## File Naming Steps

Create a new file in the same folder as the `.ls` file following these rules:
- Replace `.ls` with `.js`.
- Lowercase the filename string.
- Replace underscore (`_`) with hypen (`-`).
- Replace spaces (` `) with hypen (`-`).

| Lingo | JavaScript |
| - | - |
| 3_Event Broker Behavior.ls | 3-event-broker-behavior.js |
| 4_Client Initialization Script.ls | 4-client-initialization-script.js |
| 6_Object API.ls | 6-object-api.js |

## File Structure Rules

1. WHEN you find `property` keyword at the begining of the file 
THEN export a default anonymous class in the .js file.

Example:

```1_Input.ls
property id, pSprite

on getID me
  return id
end

on getSprite me
  return pSprite
end
```

```1-input.js
export default class {
  id;
  pSprite;

  getID() {
    return this.id;
  }

  getSprite() {
    return this.pSprite;
  }
}
```

2. WHEN you find a handler at but do not find out `property` keyword
THEN you SHALL export every function one by one in the .js file.

Example:

```2_Client Initialization.ls
on initCore
  if not constructObjectManager() then
    return 0
  end if
  return 1
end
```

```2-client-initialization.js
export function initCore() {
  if (!constructObjectManager()) {
    return 0;
  }
  return 1;
}
```

3. WHEN you find a file where all the handlers have `me` keyword as first argument
THEN export a default anonymous class in the .js file.

Example:

```3_Text Manager.ls
on GET me, tKey, tDefault
end

on dump me, tField, tDelimiter
end
```

```3-text-manager.js
export default class {
  GET(tKey, tDefault) {
  }

  dump(tField, tDelimiter) {
  }
}
```

## Code Mapping Rules

| Lingo | JavaScript |
| - | - |
| `#name` | `Symbol.for("name")` |
| `[]` | `list()` |
| `[a, b, c]` | `list(a, b, c)` |
| `[:]` | `propList()` |
| `[#a:1, #b:2, #c:3]` | `propList("a",1, "b",2, "c",3)` |
| `["a",1, "b",2, "c",3]` | `propList("a",1, "b",2, "c",3)` |
| `list1[#Bruno] = "sushi"` | `list1[Symbol.for("Bruno")] = "sushi` |
| `a & b` | `` `${a}${b}` `` |
| `a && b` | `` `${a} ${b}` `` |
| `a mod b` | `a % b` |
| `if a = b` | `if (a == b)` |
| `if a <> b` | `if (a != b)` |
| `if a and b` | `if (a && b)` |
| `if a or b` | `if (a \|\| b)` |
| `if not a` | `if (!a)` |
| `case (_key.key)` | `switch (_key.key)` |
| `repeat with n = a to b` | `for (let n = a; n <= b; n++)` |
| `repeat with n = a down to b` | `for (let n = a; n >= b; n--)` |
| `repeat with i = 1 to list.count` | `for (let i = 1; i <= list.count; i++)` |
| `repeat while _mouse.mouseDown` | `while (_mouse.mouseDown)` |
| `repeat with variable in someList` | `for (const variable of someList)` |
| `exit repeat` | `break;` |
| `next repeat` | `continue;` |
| `exit` | `return;` |

Case Example:

```Lingo
case (_key.key) of
  "a": _movie.go("Apple")
  "b", "c":
    _movie.puppetTransition(99)
    _movie.go("Oranges")
  otherwise: _sound.beep()
end case
```

```JavaScript
switch (_key.key) {
  case "a":
    _movie.go("Apple");
    break;
  case "b":
  case "c":
    _movie.puppetTransition(99);
    _movie.go("Oranges");
    break;
  default:
    _sound.beep();
    break;
}
```

## Chunk Mapping Rules

1. char..of

| Lingo | JavaScript |
| - | - |
| `textMemberExpression.char[whichCharacter]` | `textMemberExpression.char[whichCharacter]` |
| `char whichCharacter of fieldOrStringVariable` | `char(whichCharacter).of(fieldOrStringVariable)` |
| `textMemberExpression.char[firstCharacter..lastCharacter]` | `` textMemberExpression.char[`${firstCharacter}..${lastCharacter}`] `` |
| `char firstCharacter to lastCharacter of fieldOrStringVariable` | `char(firstCharacter).to(lastCharacter).of(fieldOrStringVariable)` |

2. item..of

| Lingo | JavaScript |
| - | - |
| `textMemberExpression.item[whichItem]` | `textMemberExpression.item[whichItem]` |
| `item whichItem of fieldOrStringVariable` | `item(whichItem).of(fieldOrStringVariable)` |
| `textMemberExpression.item[firstItem..lastItem]` | `` textMemberExpression.item[`${firstItem}..${lastItem}`] `` |
| `item firstItem to lastItem of fieldOrStringVariable` | `item(firstItem).to(lastItem).of(fieldOrStringVariable)` |

3. line..of

| Lingo | JavaScript |
| - | - |
| `textMemberExpression.line[whichLine]` | `textMemberExpression.line[whichLine]` |
| `line whichLine of fieldOrStringVariable` | `line(whichLine).of(fieldOrStringVariable)` |
| `textMemberExpression.line[firstLine..lastLine]` | `` textMemberExpression.line[`${firstLine}..${lastLine}`] `` |
| `line firstLine to lastLine of fieldOrStringVariable` | `line(firstLine).to(lastLine).of(fieldOrStringVariable)` |

4. word..of

| Lingo | JavaScript |
| - | - |
| `member(whichCastMember).word[whichWord]` | `member(whichCastMember).word[whichWord]` |
| `textMemberExpression.word[whichWord]` | `textMemberExpression.word[whichWord]` |
| `chunkExpression.word[whichWord]` | `chunkExpression.word[whichWord]` |
| `word whichWord of fieldOrStringVariable` | `word(whichWord).of(fieldOrStringVariable)` |
| `fieldOrStringVariable.word[whichWord]` | `fieldOrStringVariable.word[whichWord]` |
| `textMemberExpression.word[firstWord..lastWord]` | `` textMemberExpression.word[`${firstWord}..${lastWord}`] `` |
| `member(whichCastMember).word[firstWord..lastWord]` | `` member(whichCastMember).word[`${firstWord}..${lastWord}`] `` |
| `word firstWord to lastWord of chunkExpression` | `word(firstWord).to(lastWord).of(chunkExpression)` |
| `chunkExpression.word[whichWord..lastWord]` | `` chunkExpression.word[`${whichWord}..${lastWord}`] `` |

## Put Expression Rules

| Lingo | JavaScript |
| - | - |
| `put expression after chunkExpression` | `putAfter(chunkExpression, expression)` |
| `put expression before chunkExpression` | `putBefore(chunkExpression, expression)` |
| `put expression into chunkExpression` | `putInto(chunkExpression, expression)` |

## the Expression Rules

1. WHEN you found `the` keyword
THEN you shall translate it into `the.` joining all the words and making them camel-case.

1. WHEN you found `the` keyword for an specific variable
THEN you shall translate it into `the.` function call.

Examples:

| Lingo | JavaScript |
| - | - |
| `the long time` | `the.longTime` |
| `the keyboardFocusSprite` | `the.keyboardFocusSprite` |
| `the runMode` | `the.runMode` |
| `the number of castLibs` | `the.numberOfCastLibs` |
| `the itemDelimiter` | `the.itemDelimiter` |
| `the number of castMembers of castLib tCastLib` | `the,numberOfCastMembersOfCastLib(tCastLib)` |
| `the number of items in tLine of tLine` | `the.numberOfItemsIn(tLine).of(tLine)` |
| `the last char in tName` | `the.lastCharIn(tName)` |
