// Package store is the project's persistence infrastructure: it owns the
// single embedded SQLite database file, applies the declared schemas on every
// open, and exposes the generated typed operations that applications consume.
//
// Contract:
//
//   - One database owner. A deployment opens exactly one Store for its
//     database file; applications never import a driver, call sql.Open, or
//     execute SQL themselves.
//   - Referential integrity and concurrency defaults are always on. Every
//     pooled connection enables foreign keys, WAL journaling, and a five
//     second busy timeout; the pool is capped at one connection per process.
//   - Schemas are additive and idempotent. Every schema file under schema/ is
//     applied in lexicographic filename order on Open. The store never drops,
//     alters, or overwrites structures it does not declare, so an older
//     application can open a database created by a newer one and leave the
//     unknown structures untouched. Incompatible changes to an existing
//     structure require a future migration feature.
//   - Generated code is the public data-access API. Typed operations are
//     produced by sqlc from queries/*.query.sql, committed, and never edited
//     by hand. Run "go tool sqlc generate" after changing SQL.
//   - Documentation lives with the code. Every schema and query file has a
//     concept in the OKF knowledge bundle under knowledge/, written with the
//     documenting-with-okf skill. New persisted data is added with the
//     adding-data-persistence skill.
package store
