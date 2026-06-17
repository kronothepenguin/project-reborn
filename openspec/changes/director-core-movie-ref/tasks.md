## 1. MovieRef Class Implementation

- [ ] 1.1 Create `apps/client/src/director/core/movie-ref.js` with MovieRef class skeleton
- [ ] 1.2 Implement MovieRef constructor (singleton)
- [ ] 1.3 Implement `frame` property (read-only)
- [ ] 1.4 Implement `frameTempo` property (read-write)
- [ ] 1.5 Implement `castLib` property (indexed registry)
- [ ] 1.6 Implement `sprite` property (indexed registry)

## 2. Movie Information Properties

- [ ] 2.1 Implement `name` property per `specs/director-core-movie-ref/name.md`
- [ ] 2.2 Implement `path` property per `specs/director-core-movie-ref/path.md`
- [ ] 2.3 Implement `moviePath` property per `specs/director-core-movie-ref/moviePath.md`
- [ ] 2.4 Implement `copyrightInfo` property per `specs/director-core-movie-ref/copyrightInfo.md`

## 3. Stage Properties

- [ ] 3.1 Implement `stage` property per `specs/director-core-movie-ref/stage.md`
- [ ] 3.2 Implement `lastChannel` property per `specs/director-core-movie-ref/lastChannel.md`

## 4. Control Properties

- [ ] 4.1 Implement `exitLock` property per `specs/director-core-movie-ref/exitLock.md`
- [ ] 4.2 Implement `editShortCutsEnabled` property per `specs/director-core-movie-ref/editShortCutsEnabled.md`
- [ ] 4.3 Implement `keyboardFocusSprite` property per `specs/director-core-movie-ref/keyboardFocusSprite.md`
- [ ] 4.4 Implement `traceScript` property per `specs/director-core-movie-ref/traceScript.md`

## 5. List Properties

- [ ] 5.1 Implement `actorList` property per `specs/director-core-movie-ref/actorList.md`
- [ ] 5.2 Implement `timeoutList` property per `specs/director-core-movie-ref/timeoutList.md`
- [ ] 5.3 Implement `xtraList` property per `specs/director-core-movie-ref/xtraList.md`

## 6. Playback Control Methods

- [ ] 6.1 Implement `go(frame)` method
- [ ] 6.2 Implement `halt()` method
- [ ] 6.3 Implement `puppetSprite(channel, flag)` method
- [ ] 6.4 Implement `puppetTempo(tempo)` method
- [ ] 6.5 Implement `rollOver(sprite)` method
- [ ] 6.6 Implement `stopEvent()` method
- [ ] 6.7 Implement `updateStage()` method

## 7. Tests

- [ ] 7.1 Create `apps/client/src/director/core/__tests__/movie-ref.test.js`
- [ ] 7.2 Write tests for MovieRef singleton
- [ ] 7.3 Write tests for read-only properties (frame, castLib, sprite)
- [ ] 7.4 Write tests for read-write properties (frameTempo, exitLock)
- [ ] 7.5 Write tests for movie information properties (name, path)
- [ ] 7.6 Write tests for playback control methods (go, halt, puppetSprite)

## 8. Export

- [ ] 8.1 Export MovieRef class from `core/index.js`
- [ ] 8.2 Export _movie singleton from `core/index.js`
