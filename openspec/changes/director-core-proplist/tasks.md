## 1. PropList Class Implementation

- [ ] 1.1 Create `apps/client/src/director/core/prop-list.js` with PropList class skeleton
- [ ] 1.2 Implement PropList constructor with variadic arguments (key/value pairs)
- [ ] 1.3 Implement `count` property (getter)
- [ ] 1.4 Implement Symbol.iterator for iteration support

## 2. PropList Methods

- [ ] 2.1 Implement `addProp(symbol, value)` method per `specs/director-core-proplist/addProp.md`
- [ ] 2.2 Implement `deleteAt(position)` method per `specs/director-core-proplist/deleteAt.md`
- [ ] 2.3 Implement `deleteOne(value)` method per `specs/director-core-proplist/deleteOne.md`
- [ ] 2.4 Implement `deleteProp(symbol)` method per `specs/director-core-proplist/deleteProp.md`
- [ ] 2.5 Implement `duplicate()` method per `specs/director-core-proplist/duplicate-list-function.md`
- [ ] 2.6 Implement `findPos(symbol)` method per `specs/director-core-proplist/findPos.md`
- [ ] 2.7 Implement `findPosNear(symbol)` method per `specs/director-core-proplist/findPosNear.md`
- [ ] 2.8 Implement `getaProp(symbol)` method per `specs/director-core-proplist/getaProp.md`
- [ ] 2.9 Implement `getAt(position)` method per `specs/director-core-proplist/getAt.md`
- [ ] 2.10 Implement `getOne(value)` method per `specs/director-core-proplist/getOne.md`
- [ ] 2.11 Implement `getPos(value)` method per `specs/director-core-proplist/getPos.md`
- [ ] 2.12 Implement `getProp(symbol)` method per `specs/director-core-proplist/getProp.md`
- [ ] 2.13 Implement `getPropAt(index)` method per `specs/director-core-proplist/getPropAt.md`
- [ ] 2.14 Implement `setaProp(symbol, value)` method per `specs/director-core-proplist/setaProp.md`
- [ ] 2.15 Implement `setAt(position, value)` method per `specs/director-core-proplist/setAt.md`
- [ ] 2.16 Implement `sort()` method per `specs/director-core-proplist/sort.md`

## 3. PropList Helper Function

- [ ] 3.1 Implement `propList(...args)` factory function per `specs/director-core-proplist/propList.md`
- [ ] 3.2 Implement Proxy wrapper for symbol access support

## 4. Tests

- [ ] 4.1 Create `apps/client/src/director/core/__tests__/prop-list.test.js`
- [ ] 4.2 Write tests for PropList constructor
- [ ] 4.3 Write tests for `count` property
- [ ] 4.4 Write tests for `addProp()` method
- [ ] 4.5 Write tests for `deleteAt()` method
- [ ] 4.6 Write tests for `deleteOne()` method
- [ ] 4.7 Write tests for `deleteProp()` method
- [ ] 4.8 Write tests for `duplicate()` method
- [ ] 4.9 Write tests for `findPos()` method
- [ ] 4.10 Write tests for `findPosNear()` method
- [ ] 4.11 Write tests for `getaProp()` method
- [ ] 4.12 Write tests for `getAt()` method
- [ ] 4.13 Write tests for `getOne()` method
- [ ] 4.14 Write tests for `getPos()` method
- [ ] 4.15 Write tests for `getProp()` method
- [ ] 4.16 Write tests for `getPropAt()` method
- [ ] 4.17 Write tests for `setaProp()` method
- [ ] 4.18 Write tests for `setAt()` method
- [ ] 4.19 Write tests for `sort()` method
- [ ] 4.20 Write tests for `propList()` factory function
- [ ] 4.21 Write tests for symbol access via Proxy
- [ ] 4.22 Write tests for sorted proplist behavior

## 5. Export

- [ ] 5.1 Export PropList class from `core/index.js`
- [ ] 5.2 Export propList() factory function from `core/index.js`
