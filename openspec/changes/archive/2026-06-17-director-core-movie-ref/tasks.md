## 1. MovieRef Class Implementation

- [x] 1.1 Create `apps/client/src/director/core/movie-ref.js` with MovieRef class skeleton
- [x] 1.2 Implement MovieRef constructor (singleton)
- [x] 1.3 Implement `frame` property (read-only)
- [x] 1.4 Implement `frameTempo` property (read-write)
- [x] 1.5 Implement `castLib` property (indexed registry)
- [x] 1.6 Implement `sprite` property (indexed registry)

## 2. Movie Information Properties

- [x] 2.1 Implement `name` property per `specs/director-core-movie-ref/name.md`
- [x] 2.2 Implement `path` property per `specs/director-core-movie-ref/path.md`
- [x] 2.3 Implement `moviePath` property per `specs/director-core-movie-ref/moviePath.md`
- [x] 2.4 Implement `copyrightInfo` property per `specs/director-core-movie-ref/copyrightInfo.md`

## 3. Stage Properties

- [x] 3.1 Implement `stage` property per `specs/director-core-movie-ref/stage.md`
- [x] 3.2 Implement `lastChannel` property per `specs/director-core-movie-ref/lastChannel.md`

## 4. Control Properties

- [x] 4.1 Implement `exitLock` property per `specs/director-core-movie-ref/exitLock.md`
- [x] 4.2 Implement `editShortCutsEnabled` property per `specs/director-core-movie-ref/editShortCutsEnabled.md`
- [x] 4.3 Implement `keyboardFocusSprite` property per `specs/director-core-movie-ref/keyboardFocusSprite.md`
- [x] 4.4 Implement `traceScript` property per `specs/director-core-movie-ref/traceScript.md`

## 5. List Properties

- [x] 5.1 Implement `actorList` property per `specs/director-core-movie-ref/actorList.md`
- [x] 5.2 Implement `timeoutList` property per `specs/director-core-movie-ref/timeoutList.md`
- [x] 5.3 Implement `xtraList` property per `specs/director-core-movie-ref/xtraList.md`

## 6. Playback Control Methods

- [x] 6.1 Implement `go(frame)` method
- [x] 6.2 Implement `halt()` method
- [x] 6.3 Implement `puppetSprite(channel, flag)` method
- [x] 6.4 Implement `puppetTempo(tempo)` method
- [x] 6.5 Implement `rollOver(sprite)` method
- [x] 6.6 Implement `stopEvent()` method
- [x] 6.7 Implement `updateStage()` method

## 7. Tests

- [x] 7.1 Create `apps/client/src/director/core/__tests__/movie-ref.test.js`
- [x] 7.2 Write tests for MovieRef singleton
- [x] 7.3 Write tests for read-only properties (frame, castLib, sprite)
- [x] 7.4 Write tests for read-write properties (frameTempo, exitLock)
- [x] 7.5 Write tests for movie information properties (name, path)
- [x] 7.6 Write tests for playback control methods (go, halt, puppetSprite)

## 8. Export

- [x] 8.1 Export MovieRef class from `core/index.js`
- [x] 8.2 Export _movie singleton from `core/index.js`
