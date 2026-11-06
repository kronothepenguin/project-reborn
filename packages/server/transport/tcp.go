package transport

import (
	"errors"
	"net"
)

// ServeTCP accepts connections on l and serves each one with h in a goroutine of its own. It
// returns nil once l is closed, and the error of any other failed Accept.
func ServeTCP(l net.Listener, h Handler) error {
	for {
		c, err := l.Accept()
		if errors.Is(err, net.ErrClosed) {
			return nil
		}
		if err != nil {
			return err
		}
		go serve(tcpConn{c}, h)
	}
}

type tcpConn struct{ net.Conn }

func (c tcpConn) RemoteAddr() string { return c.Conn.RemoteAddr().String() }
