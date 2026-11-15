---
type: Reference
title: R26 hh_photo
description: How the R26 client takes a photo with the camera and stores it over #mus, shows a photo item by fetching its data over #mus, and keeps the film count, from hh_photo's .ls scripts.
timestamp: 2026-11-09T18:47:41+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-09T18:44:16+00:00"}
tags: [r26, protocol]
---

# Scripts

In `packages/client-r26/src/game/hh_photo/`. Below, scripts of this cast are named by their file name, and scripts
of other casts by `<cast>/<file>`.

| Script | What it holds |
| --- | --- |
| `2_Photo Interface Class.ls` | The camera: its picture, its text and the film count |
| `3_Photo Component Class.ls` | Stores a picture and fetches a photo's data over `#mus`, checks it, and shows the photo |
| `4_Photo Handler Class.ls` | Listens to 1 message on `#info` and 2 on `#mus`, registered in `construct`, and registers no command |
| `5_Photo Item Class.ls` | The photo as an item on a wall; a click opens it |

`fuse_client`'s Binary Manager owns `#mus`, logs in on it and runs the stores and fetches the photo asks for
([fuse_client](/r26/fuse_client.md#the-mus-connection)); the bytes of a MUS message are
s1-24's. The photo also uses two commands of `hh_room`: `G_IDATA` to read a photo
item's data and `REMOVEITEM` to take it down (s1-06).

# Messages from the server

| Id | Handler | Connection | Fields, in order | Notes |
| --- | --- | --- | --- | --- |
| 4 | `handle_film` | `#info` | int film | The photos the user may still save, kept in the session as `user_photo_film` |
| `FILM` | `handle_film_mus` | `#mus` | content: the film, as text | As 4 |
| `OK` | `handle_ok` | `#mus` | none read | Ignored |

On `#mus` a message is named by its subject, the first word, and its content is the rest
([fuse_client](/r26/fuse_client.md#wire-format)). The Binary Manager also handles `HELLO`, `BINDATA_SAVED`,
`BINDATA_AUTHKEYERROR` and the binary answer to `GETBINDATA`.

# Commands from the client

None registered. The photo's messages on `#mus` go through the Binary Manager's queue:

| Message | Connection | Sent by | Content | Notes |
| --- | --- | --- | --- | --- |
| `PHOTOTXT` | `#mus` | `3_Photo Component Class.ls`: `storePicture`, as text with `addMessageToBinaryQueue` | `/` and the photo's text, through `convertSpecialChars` | Sent just before the picture, without waiting for an answer |
| `BINDATA` | `#mus` | `3_Photo Component Class.ls`: `storePicture`, with `storeBinaryData` | a Lingo property list: `#image`, the picture; `#time`, the date and the time as text; `#cs`, a checksum of the picture | Answered by `BINDATA_SAVED` with the photo's id |
| `GETBINDATA` | `#mus` | `3_Photo Component Class.ls`: `setItemData`, with `retrieveBinaryData` | `<item id> <auth key>` | Answered by the photo's data, as a binary message |

# Flows

## Taking a photo

1. The camera shoots a still whatever the film. Save works only on a still while the film is above 0; at 0 it beeps
   and shows `cam_save_nofilm`.
2. Save sends `PHOTOTXT` with the text and then `BINDATA` with the picture, over `#mus`.
3. `BINDATA_SAVED` ends the save, and the camera goes back to live. The client never lowers the film itself: only 4
   on `#info` or `FILM` on `#mus` change it.

## Looking at a photo

1. A click on a photo item sends `G_IDATA` with the item's id on the room connection, and `hh_room` passes the item's
   text back as `#itemdata_received<id>`.
2. That text's first line holds the auth key and then the time the photo was taken; the lines after it are the
   photo's text, in which `&AUML;`, `&OUML;`, `&auml;` and `&ouml;` become letters.
3. The client sends `GETBINDATA` with the item id and the auth key over `#mus`, and draws the data it gets back. A
   picture whose checksum differs from `#cs`, or that has no `#cs`, shows `photo_invalid` instead; otherwise the time
   from the item's text is written in the photo's bottom right corner.
4. The room's owner, or a holder of `fuse_remove_photos`, can take the photo down, which sends `REMOVEITEM`.

# Notes

## Counts

`4_Photo Handler Class.ls` listens to 1 message on `#info` and 2 on `#mus`, and registers no command, as
Registering scripts (`packages/client-r26/knowledge/client-r26.md#registering-scripts`) says: "1, and 2 on `#mus`" in, 0 out.

## Ids other casts register too

- `G_IDATA` and `REMOVEITEM` are `hh_room`'s, and `#itemdata_received<id>` also opens the post-its of
  `hh_furni_classes`.

## Quirks

- The checksum reads 100 pixels of the picture by its palette index: the server stores the property list as it is,
  and the client checks it when it reads it back.
- In the `.ls` copy the text conversion turns `&AUML;` into `ƒ`, not `Ä`; the `.dcr`'s own byte there is not checked.
  Texts shorter than 6 characters are left as they are.
- The photo cache is looked up by `pPhotoId`, which no handler sets, so every look fetches the photo again with
  `GETBINDATA`.
- `OK` on `#mus` is listened to and does nothing.
