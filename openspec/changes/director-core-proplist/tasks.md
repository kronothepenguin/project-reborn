## 1. PropList Class Implementation

- [x] 1.1 Create `apps/client/src/director/core/prop-list.js` with PropList class skeleton
- [x] 1.2 Implement PropList constructor with variadic arguments (key/value pairs)
- [x] 1.3 Implement `count` property (getter)
- [x] 1.4 Implement Symbol.iterator for iteration support

## 2. PropList Methods

- [x] 2.1 Implement `addProp(symbol, value)` method per `specs/director-core-proplist/addProp.md`
- [x] 2.2 Implement `deleteAt(position)` method per `specs/director-core-proplist/deleteAt.md`
- [x] 2.3 Implement `deleteOne(value)` method per `specs/director-core-proplist/deleteOne.md`
- [x] 2.4 Implement `deleteProp(symbol)` method per `specs/director-core-proplist/deleteProp.md`
- [x] 2.5 Implement `duplicate()` method per `specs/director-core-proplist/duplicate-list-function.md`
- [x] 2.6 Implement `findPos(symbol)` method per `specs/director-core-proplist/findPos.md`
- [x] 2.7 Implement `findPosNear(symbol)` method per `specs/director-core-proplist/findPosNear.md`
- [x] 2.8 Implement `getaProp(symbol)` method per `specs/director-core-proplist/getaProp.md`
- [x] 2.9 Implement `getAt(position)` method per `specs/director-core-proplist/getAt.md`
- [x] 2.10 Implement `getOne(value)` method per `specs/director-core-proplist/getOne.md`
- [x] 2.11 Implement `getPos(value)` method per `specs/director-core-proplist/getPos.md`
- [x] 2.12 Implement `getProp(symbol)` method per `specs/director-core-proplist/getProp.md`
- [x] 2.13 Implement `getPropAt(index)` method per `specs/director-core-proplist/getPropAt.md`
- [x] 2.14 Implement `setaProp(symbol, value)` method per `specs/director-core-proplist/setaProp.md`
- [x] 2.15 Implement `setAt(position, value)` method per `specs/director-core-proplist/setAt.md`
- [x] 2.16 Implement `sort()` method per `specs/director-core-proplist/sort.md`

## 3. PropList Helper Function

- [x] 3.1 Implement `propList(...args)` factory function per `specs/director-core-proplist/propList.md`
- [x] 3.2 Implement Proxy wrapper for symbol access support

## 4. Tests

- [x] 4.1 Create `apps/client/src/director/core/__tests__/prop-list.test.js`
- [x] 4.2 Write tests for PropList constructor
- [x] 4.3 Write tests for `count` property
- [x] 4.4 Write tests for `addProp()` method
- [x] 4.5 Write tests for `deleteAt()` method
- [x] 4.6 Write tests for `deleteOne()` method
- [x] 4.7 Write tests for `deleteProp()` method
- [x] 4.8 Write tests for `duplicate()` method
- [x] 4.9 Write tests for `findPos()` method
- [x] 4.10 Write tests for `findPosNear()` method
- [x] 4.11 Write tests for `getaProp()` method
- [x] 4.12 Write tests for `getAt()` method
- [x] 4.13 Write tests for `getOne()` method
- [x] 4.14 Write tests for `getPos()` method
- [x] 4.15 Write tests for `getProp()` method
- [x] 4.16 Write tests for `getPropAt()` method
- [x] 4.17 Write tests for `setaProp()` method
- [x] 4.18 Write tests for `setAt()` method
- [x] 4.19 Write tests for `sort()` method
- [x] 4.20 Write tests for `propList()` factory function
- [x] 4.21 Write tests for symbol access via Proxy
- [x] 4.22 Write tests for sorted proplist behavior

## 5. Export

- [x] 5.1 Export PropList class from `core/index.js`
- [x] 5.2 Export propList() factory function from `core/index.js`
