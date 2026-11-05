# Decisions

Design decisions confirmed by the user, numbered in the order they were taken. Accepted text is never rewritten; a
change supersedes a decision with a new one. The branch rule every plan follows is
`plans/holo-port/decisions/0097-no-agent-works-on-main.md`.

## Process

- [0001 The game server's plan lives in plans/server](/decisions/0001-plan-in-plans-server.md) — plans/server is an OKF bundle in the format of plans/holo-port, worked through a tracking-plans skill shared by every plan, and Claude Code loads the project skills through a .claude/skills link.
- [0003 tools/create makes fullstack, backend and client projects](/decisions/0003-create-templates.md) — tools/create takes -template=fullstack|backend|client; fullstack is today's output and the default, backend is a Go package and runner only, and client is a Vite package like client-r26.
- [0004 The deleted server is the model for the structure](/decisions/0004-old-server-is-the-model.md) — The packages/server removed in commit 2ea51d7b is the model for the new server's structure, with separate receive and send interfaces for TCP and WebSocket, the encoding, and a protocol package with one part per client cast.

## Program and packages

- [0002 The game server is packages/server and apps/server, with no web pages](/decisions/0002-server-app.md) — The program is called server; packages/server holds it and apps/server runs it, as a TCP listener and a WebSocket server without web pages, created with the backend template of tools/create.
- [0005 The server lives in packages/server, and virtual holds only state](/decisions/0005-package-layout.md) — packages/server is one Go module with the transport, the encoding, the r26 protocol and the protocol-free game rules, and packages/virtual holds only the server's state.
- [0006 TCP and WebSocket are one byte-stream Conn, and the WebSocket mounts on any HTTP mux](/decisions/0006-transport.md) — The protocol code sees every connection as an io.Reader to receive and an io.Writer to send, TCP and golang.org/x/net/websocket both provide them, and the WebSocket is an http.Handler mounted with Mount(mux).

## Protocol

- [0007 r26 is the protocol package, and each listener names its protocol](/decisions/0007-protocols-per-listener.md) — The R26 protocol is a Go package named r26, each TCP address or WebSocket path names the protocol it speaks, r18 stays a door left open, and whether r18 and r26 players share one hotel is documented both ways.
- [0008 The R26 protocol comes from the client's .ls scripts](/decisions/0008-reverse-engineer-ls-only.md) — The protocol is reverse engineered from the Lingo .ls scripts of packages/client-r26/src/game, never from the .js translations, covering every Handler Class and every other script that registers or sends messages.
- [0012 The server skips the client's encryption](/decisions/0012-no-encryption.md) — At login the server answers the client's public key with ENDOFCRYPTOPARAMS, as the old server did, so the client sends plain bytes, with no Diffie-Hellman key exchange and no RC4.

## State and data

- [0009 packages/virtual holds the server's hot data and temporary data](/decisions/0009-virtual-holds-the-server-state.md) — The server's state lives in packages/virtual as hot data, saved data copied from the database while it is in use, and temporary data that lives only in memory and is gone after a restart.
- [0010 A change to hot data reaches the database at once](/decisions/0010-hot-data-written-at-once.md) — When saved data changes in the game, the handler writes the row and then updates memory, so a crash or a restart loses nothing, and temporary data never touches the database.
- [0011 What the server saves and what lives only in memory](/decisions/0011-saved-and-memory-only-data.md) — Placed furni, last time online, friend requests, room rights, bans, rating, chat history, furni state, ignore lists and the Game Hall of Fame are saved; positions, loaded rooms, who is online, instant messages and room events live only in memory.
- [0013 Changes from the site reach the server like Holo's MUS commands](/decisions/0013-site-changes-like-mus.md) — When the CMS or housekeeping changes something the server holds, the server is told, as Holo told its emulator with MUS commands, and under the orchestrator the CMS and housekeeping change the virtual state directly.
