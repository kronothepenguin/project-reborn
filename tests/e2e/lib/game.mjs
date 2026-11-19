// enter brings a habbo into the hotel as the client does: it opens a WebSocket
// to the game's info listener and logs in with the SSO ticket of the client
// page. The page signed in on the CMS fetches the client page for its ticket.
// The habbo stays inside until the game sends it out or leave() is called.
export async function enter(page, base, infoPort) {
  const html = await (await page.request.get(`${base}/client`)).text();
  // The page escapes the parameter's value as an HTML attribute.
  const ticket = html
    .match(/;sso\.ticket=([^;"]+)/)?.[1]
    ?.replace(/&#(\d+);/g, (_, code) => String.fromCharCode(code))
    .replaceAll("&amp;", "&");
  if (!ticket) throw new Error("the client page holds no SSO ticket");

  // The game refuses a WebSocket without an Origin, which a browser always sends.
  const ws = new WebSocket(`ws://127.0.0.1:${infoPort}/`, { headers: { Origin: base } });
  ws.binaryType = "arraybuffer";
  const messages = [];
  const waiting = [];
  let buffer = "";
  let closedAt = null;
  const closed = new Promise((resolve) =>
    ws.addEventListener("close", () => {
      closedAt = Date.now();
      resolve();
    }),
  );
  ws.addEventListener("message", (event) => {
    buffer += Buffer.from(event.data).toString("latin1");
    for (let end; (end = buffer.indexOf("\x01")) >= 0; ) {
      const message = buffer.slice(0, end);
      buffer = buffer.slice(end + 1);
      messages.push({ id: readB64(message.slice(0, 2)), body: message.slice(2), at: Date.now() });
    }
    for (const w of [...waiting]) w();
  });
  await new Promise((resolve, reject) => {
    ws.addEventListener("open", resolve, { once: true });
    ws.addEventListener("error", () => reject(new Error("the info listener refused")), { once: true });
  });

  // until waits for the message id and returns it.
  const until = (id) =>
    new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error(`no message ${id}, got ${JSON.stringify(messages.map((m) => [m.id, m.body]))}`)), 5000);
      const look = () => {
        const found = messages.find((m) => m.id === id);
        if (found) {
          clearTimeout(timer);
          waiting.splice(waiting.indexOf(look), 1);
          resolve(found);
        }
      };
      waiting.push(look);
      look();
    });
  const send = (...packets) =>
    ws.send(Buffer.from(packets.map(([id, body]) => packet(id, body)).join(""), "latin1"));

  await until(0);
  send([206, ""]);
  await until(278);
  send([1170, "I" + b64String("") + b64String("")], [813, b64String("machine")], [1817, ""]);
  await until(257);
  send([204, b64String(ticket)]);
  await until(3);

  return {
    until,
    closed,
    get closedAt() {
      return closedAt;
    },
    leave: () => ws.close(),
  };
}

function readB64(s) {
  return [...s].reduce((n, c) => n * 64 + (c.charCodeAt(0) - 64), 0);
}

function b64(n, length) {
  let s = "";
  for (let i = length - 1; i >= 0; i--) s += String.fromCharCode(64 + ((n >> (6 * i)) & 63));
  return s;
}

function b64String(s) {
  return b64(s.length, 2) + s;
}

function packet(id, body) {
  return b64(2 + body.length, 3) + b64(id, 2) + body;
}
