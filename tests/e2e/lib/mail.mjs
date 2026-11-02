import net from "node:net";

// startMail is an SMTP server that keeps what it receives.
export function startMail() {
  const received = [];
  const server = net.createServer((socket) => {
    socket.setEncoding("utf8");
    const reply = (line) => socket.write(`${line}\r\n`);
    let buffer = "";
    let to = null;
    let data = null;

    const handle = (line) => {
      if (data !== null) {
        if (line === ".") {
          received.push({ to, data: data.join("\n") });
          data = null;
          reply("250 ok");
        } else {
          data.push(line);
        }
        return;
      }
      const command = line.toUpperCase();
      if (command.startsWith("EHLO") || command.startsWith("HELO"))
        reply("250 test");
      else if (command.startsWith("RCPT")) {
        to = line.split("<")[1].split(">")[0];
        reply("250 ok");
      } else if (command.startsWith("DATA")) {
        data = [];
        reply("354 go");
      } else if (command.startsWith("QUIT")) {
        reply("221 bye");
        socket.end();
      } else reply("250 ok");
    };

    socket.on("data", (chunk) => {
      buffer += chunk;
      const lines = buffer.split("\r\n");
      buffer = lines.pop();
      lines.forEach(handle);
    });
    socket.on("error", () => socket.destroy());
    reply("220 test");
  });

  return new Promise((resolve, reject) => {
    server.on("error", reject);
    server.listen(0, "127.0.0.1", () => {
      resolve({
        port: server.address().port,
        received,
        clear: () => received.splice(0),
        close: () => new Promise((done) => server.close(done)),
      });
    });
  });
}
