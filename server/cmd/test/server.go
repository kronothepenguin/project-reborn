package main

import (
	"bufio"
	"bytes"
	"embed"
	"log"
	"net"
	"net/http"
	"slices"
	"sync"

	"golang.org/x/net/websocket"
)

//go:embed index.html
var index embed.FS

func main() {
	websocketServer()
}

func websocketServer() {
	mux := http.NewServeMux()
	mux.Handle("/", http.FileServerFS(index))
	mux.Handle("/echo", websocket.Handler(handleWebSocket))

	server := http.Server{
		Addr:    ":8080",
		Handler: mux,
	}
	log.Fatalln(server.ListenAndServe())
}

var clients []*websocket.Conn
var clientsMu sync.RWMutex

func handleWebSocket(ws *websocket.Conn) {
	log.Println("handleWebSocket", ws)
	// io.Copy(ws, ws)

	clientsMu.Lock()
	clients = append(clients, ws)
	clientsMu.Unlock()

	var buf = make([]byte, 1024)
	for {
		n, err := ws.Read(buf)
		if err != nil {
			clientsMu.Lock()
			clients = slices.DeleteFunc(clients, func(conn *websocket.Conn) bool { return conn == ws })
			clientsMu.Unlock()
			break
		}

		msg := buf[:n]
		if bytes.Equal(msg, []byte(":close")) {
			clientsMu.Lock()
			clients = slices.DeleteFunc(clients, func(conn *websocket.Conn) bool { return conn == ws })
			clientsMu.Unlock()
			break
		}

		clientsMu.RLock()
		for _, conn := range clients {
			conn.Write(msg)
		}
		clientsMu.RUnlock()
	}
}

func tcpServer() {
	listener, err := net.Listen("tcp", ":8090")
	if err != nil {
		log.Fatalln(err)
	}
	defer listener.Close()

	for {
		conn, err := listener.Accept()
		if err != nil {
			log.Println(err)
			continue
		}
		go handleConnection(conn)
	}
}

func handleConnection(conn net.Conn) {
	defer conn.Close()

	reader := bufio.NewReader(conn)

	for {
		_, err := reader.Peek(3)
		if err != nil {
			log.Println(err)
			return
		}
	}
}
