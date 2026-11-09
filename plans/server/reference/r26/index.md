# The R26 protocol by cast

One document per client cast, in the [format](/reference/client-r26.md#protocol-reference-format) of The R26 client,
each written by its task in [S1](/phases/s1-protocol-reference.md).

- [R26 fuse_client](/reference/r26/fuse_client.md) — How the R26 client opens its #info and #mus connections, frames packets both ways, encodes every value, and maps listeners and commands, from fuse_client's .ls scripts.
- [R26 hh_entry_init](/reference/r26/hh_entry_init.md) — How the R26 client logs in, from the handshake without encryption to the user object, and what it does with rights, badges, achievements, alerts, pings, latency tests, logouts and opening hours, from hh_entry_init's .ls scripts.
- [R26 hh_shared](/reference/r26/hh_shared.md) — How the R26 client sends calls for help, how staff take them up, answer them and moderate with the mod tool, and how it asks the server's date, shows the server's error reports and passes tracking codes on, from hh_shared's .ls scripts.
- [R26 hh_club](/reference/r26/hh_club.md) — How the R26 client asks for its club status after the login and shows it, buys club periods in the club window, and accepts or refuses the club's gifts, from hh_club's .ls scripts.
- [R26 hh_human](/reference/r26/hh_human.md) — How the R26 client reads the figure strings the server sends, from the figure data files it downloads, and the one command its figure system registers and never sends, from hh_human's .ls scripts.
- [R26 hh_navigator](/reference/r26/hh_navigator.md) — How the R26 client browses the navigator's public and private categories, lists its own rooms, searches and keeps favourites, reads and changes a room's settings, deletes a room, enters a room or is refused, and is forwarded, from hh_navigator's .ls scripts.
- [R26 hh_buffer](/reference/r26/hh_buffer.md) — How the R26 client holds back the updates of furniture whose graphics are still downloading and replays them through hh_room once they arrive, from hh_buffer's .ls scripts.
- [R26 hh_cat_code](/reference/r26/hh_cat_code.md) — How the R26 client's catalogue asks for its index and pages, which it reads as text, checks a pet's name, buys a product, as a gift or not, with the extra value its page gives it, and hears of the credit balance, from hh_cat_code's .ls scripts.
