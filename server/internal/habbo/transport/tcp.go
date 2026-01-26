package transport

import "net"

type TCPServer struct {
	address  string
	listener net.Listener
}

func NewTCPServer(address string) *TCPServer {
	return &TCPServer{
		address: address,
	}
}

func (s *TCPServer) Start() error {
	listener, err := net.Listen("tcp", s.address)
	if err != nil {
		return err
	}

	s.listener = listener
	return nil
}

func (s *TCPServer) Stop() error {
	if s.listener != nil {
		listener := s.listener
		s.listener = nil
		return listener.Close()
	}
	return nil
}

func (s *TCPServer) Loop(handle func(net.Conn)) error {
	for {
		conn, err := s.listener.Accept()
		if err != nil {
			return err
		}
		go handle(conn)
	}
}
