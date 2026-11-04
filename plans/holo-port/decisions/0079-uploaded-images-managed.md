---
type: Decision
title: Uploaded images can be picked again, and only unused ones deleted
description: The news editor offers every uploaded picture in a gallery, articles link to their uploaded picture in the database, and an Uploaded Images page in housekeeping deletes only the pictures no article uses.
status: accepted
timestamp: 2026-11-04T15:56:14+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-04T15:56:14+00:00"}
tags: [news, housekeeping, store, images]
---

# Decision

- The news form's image editor gains a third mode beside Cut and Fit, `Uploaded`, with a thumbnail of every uploaded
  picture. Clicking one fills the top-story field and the preview, as an upload does.
- A database update gives each article a link to its uploaded picture, so the database itself refuses to delete a picture
  an article uses. The top-story address stays as it is.
- An `Uploaded Images` page in the Content Management box lists the uploaded pictures only, each with its thumbnail,
  format, size, uploader, date and the articles using it.
- A picture no article uses can be deleted. A picture in use names those articles and stays until they take another
  picture or are deleted.
- Both take `housekeeping.news`, the attribute of the news editor that uploads the pictures.

# Context

Asked what should happen to pictures that were uploaded but never saved, or later replaced, the user answered: "is it
possible to allow select existing images? and also create a housekeeping entry to delete unlinked assets? in my idea you
can see assets that are not linked to anything and can delete them, also you can see all the access but the system
prevents the user to delete something that is in use and tell the user to delete the dependant first before the asset."
The user then chose a gallery in the editor over suggestions in the field, a link in the database over matching
addresses, `housekeeping.news` over a new attribute, and uploaded pictures only over listing the five local ones too.

# Consequences

- Update 0006 adds the link and fills it for the articles that already use an uploaded picture.
- Nothing is deleted on its own: a picture nobody uses stays until staff delete it.
