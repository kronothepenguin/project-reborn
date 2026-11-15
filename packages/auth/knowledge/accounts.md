---
type: Reference
title: Accounts
description: The rules of names, emails, birth dates and looks, and the helpers that create accounts and habbos and archive a habbo.
---

# Rules

Registration and the installer create accounts the same way (decision holo-port/0030).

- `ValidateHabboName(name)`, `ValidateEmail(email)`, `ValidateBornOn(bornOn)` and `ValidateLook(figure, gender)` give
  `ErrHabboName`, `ErrEmail`, `ErrBornOn` and `ErrLook`.
  - Names are 1 to 24 ASCII letters, digits or `- = ? ! @ : . ,`, and those starting with `MOD-` are refused, ignoring
    case. `ErrHabboNameEmpty`, `ErrHabboNameTooLong` and `ErrHabboNameReserved` say why, and all of them match
    `ErrHabboName`.
  - An email follows Holo's rule, at 6 to 254 bytes, and a birth date is a past date from 1920, Holo's first valid
    year.
  - A figure is the dot format of the v2 avatar editor (`hd-180-1.ch-215-82.lg-270-82`), at most 255 bytes, whose parts
    can leave the colour empty (`ha-1018-`), and the gender is `M` or `F`.

# Creating

- `CreateAccount(ctx, q, account)` writes the user, the credentials, the wallet and the first habbo, plus a
  `registration` ledger row when the account starts with credits, and returns `userID, avatarID`.
- `CreateHabbo(ctx, q, userID, habbo)` writes a habbo with its profile, its home and the home's profile widget.

Both take `*store.Queries` so that the caller keeps its own transaction, and neither validates. A taken email or name
comes back as an error that `store.IsConflict` recognises.

```go
hash := auth.HashPassword(password) // before the transaction: argon2 is slow and the pool has one connection
tx, err := db.BeginTx(ctx, nil)
if err != nil {
	return err
}
defer tx.Rollback()
userID, avatarID, err := auth.CreateAccount(ctx, store.New(tx), auth.Account{
	Email: email, BornOn: bornOn, IP: auth.ClientIP(r), PasswordHash: hash, Credits: 500, Detail: "Welcome!",
	Habbo: auth.Habbo{Name: name, Figure: figure, Gender: gender},
})
if err != nil {
	return err
}
return tx.Commit()
```

# Archiving

`ArchiveHabbo(ctx, db, avatarID)` hides a habbo of the session's user in one transaction (decision holo-port/0089):

- It refuses the active habbo with `ErrActiveHabbo`, a habbo that owns a group with `ErrHabboOwnsGroup`, and another
  user's habbo with `ErrNotOwner`.
- Sessions open on the habbo move to the session's habbo.
- The stickers and notes on its home go back to the user's inventory.
- The furni of its hand and of its recycler goes to the user's shared inventory, and its rooms go to the session's
  habbo (decision server/0124).
