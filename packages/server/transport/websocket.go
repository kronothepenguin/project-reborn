package transport

import (
	"net/http"

	"golang.org/x/net/websocket"
)

// WebSocket returns an http.Handler that upgrades each request to a WebSocket and serves it with
// h. The connection writes binary frames and reads the bytes of binary and text frames alike. Like
// websocket.Handler, it refuses a request whose Origin header is missing or not a URL. RemoteAddr
// is the address of the HTTP request.
func WebSocket(h Handler) http.Handler {
	return websocket.Handler(func(ws *websocket.Conn) {
		ws.PayloadType = websocket.BinaryFrame
		serve(wsConn{ws}, h)
	})
}

type wsConn struct{ *websocket.Conn }

func (c wsConn) RemoteAddr() string { return c.Request().RemoteAddr }
