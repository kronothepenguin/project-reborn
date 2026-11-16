---
type: Reference
title: The client files
description: How GET /dcr shows the client's variables and texts in the database, and how POST /dcr/import copies them from the assets folder in one transaction with its log row.
---

# The page

`GET /housekeeping/dcr` needs `housekeeping.dcr`. Its link, "Client files", sits in the Configuration & Setup box of
the menu, beside the settings forms. The page says how many variables and texts the database holds and names the
client's folder, `dcr/` inside `assets.path` of `config.json`.

# Import client files

`POST /housekeeping/dcr/import` runs `dcr.Import` (`packages/assets/dcr`) on the client's folder in `inTx`, with one
staff log row, `dcr.import`, whose detail counts the rows: `140 variables, 5518 texts`. Success goes back to the page
with "The client files were imported.".

A missing file rolls the transaction back and renders the page with status 422 and "The client files were not
imported: external_texts.txt is missing from assets/dcr.". Any other error is a 500.
