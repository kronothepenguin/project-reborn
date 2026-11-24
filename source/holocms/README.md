# HoloCMS 3.1.1

This folder is HoloCMS 3.1.1.60 "ATLANTA", UNSTABLE, of 19 February 2009 (`includes/version.php`). It is made for
"Eucalypt C#, HoloEMU Vista4life & Shine-Away's V26 Source". It is the source reference of the port.

It comes from the user's own copy. Its files are copied byte for byte: Latin-1, with CRLF lines.

What was left out:

- `r26/`: Sulake's client (`habbo.dcr`, the `.cct` casts, `c_images` and its texts).
- Pictures, Flash files, fonts and caches: `.gif`, `.png`, `.jpg`, `.ico`, `.swf`, `.ttf`, `Thumbs.db` and backups such
  as `.png~`.
- `config.php`: it holds the passwords of the user's database. `_install.php` writes it.

No file of Habbo's goes into the repository
([reborn 0011](../../knowledge/decisions/reborn/0011-no-habbo-files-in-the-repository.md)).

The older HoloCMS 1.3.1 of April 2008, which the first ported pages follow, is in `source/holocms-1.3.1`.
