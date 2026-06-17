## 1. MemberRef Class Implementation

- [ ] 1.1 Create `apps/client/src/director/core/member-ref.js` with MemberRef class skeleton
- [ ] 1.2 Implement MemberRef constructor with type and name parameters
- [ ] 1.3 Implement `type` property (read-only)
- [ ] 1.4 Implement `name` property (read-write)
- [ ] 1.5 Implement `number` property (read-only)
- [ ] 1.6 Implement `castLibNum` property (read-only)

## 2. Basic Properties

- [ ] 2.1 Implement `height` property per `specs/director-core-member-ref/height.md`
- [ ] 2.2 Implement `width` property per `specs/director-core-member-ref/width.md`
- [ ] 2.3 Implement `rect` property per `specs/director-core-member-ref/rect.md`
- [ ] 2.4 Implement `regPoint` property per `specs/director-core-member-ref/regPoint.md`
- [ ] 2.5 Implement `ink` property per `specs/director-core-member-ref/ink.md`

## 3. Text Member Properties

- [ ] 3.1 Implement `text` property per `specs/director-core-member-ref/text.md`
- [ ] 3.2 Implement `font` property per `specs/director-core-member-ref/font.md`
- [ ] 3.3 Implement `fontSize` property per `specs/director-core-member-ref/fontSize.md`

## 4. Media Member Properties

- [ ] 4.1 Implement `duration` property per `specs/director-core-member-ref/duration.md`
- [ ] 4.2 Implement `loop` property per `specs/director-core-member-ref/loop.md`
- [ ] 4.3 Implement `volume` property per `specs/director-core-member-ref/volume.md`
- [ ] 4.4 Implement `sound` property per `specs/director-core-member-ref/sound.md`
- [ ] 4.5 Implement `scale` property per `specs/director-core-member-ref/scale.md`

## 5. Streaming Properties

- [ ] 5.1 Implement `percentStreamed` property per `specs/director-core-member-ref/percentStreamed.md`
- [ ] 5.2 Implement `preLoad` property per `specs/director-core-member-ref/preLoad.md`

## 6. Track Properties

- [ ] 6.1 Implement `trackCount` property per `specs/director-core-member-ref/trackCount.md`
- [ ] 6.2 Implement `trackStartTime` property per `specs/director-core-member-ref/trackStartTime.md`
- [ ] 6.3 Implement `trackStopTime` property per `specs/director-core-member-ref/trackStopTime.md`
- [ ] 6.4 Implement `trackType` property per `specs/director-core-member-ref/trackType.md`

## 7. Other Properties

- [ ] 7.1 Implement `fileName` property per `specs/director-core-member-ref/fileName.md`
- [ ] 7.2 Implement `picture` property per `specs/director-core-member-ref/picture.md`

## 8. Tests

- [ ] 8.1 Create `apps/client/src/director/core/__tests__/member-ref.test.js`
- [ ] 8.2 Write tests for MemberRef constructor
- [ ] 8.3 Write tests for read-only properties (type, number, castLibNum)
- [ ] 8.4 Write tests for read-write properties (name, text, font, fontSize)
- [ ] 8.5 Write tests for dimension properties (height, width, rect)
- [ ] 8.6 Write tests for media properties (duration, loop, volume)
- [ ] 8.7 Write tests for type-specific property defaults

## 9. Export

- [ ] 9.1 Export MemberRef class from `core/index.js`
