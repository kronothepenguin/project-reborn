class_name Connection
extends Node

var transport_layer: TransportLayer

func _process(delta: float) -> void:
	if not transport_layer:
		return
	
	transport_layer.poll()
	if transport_layer.get_status() == TransportLayer.Status.ERROR:
		transport_layer.dispose()
		transport_layer = null
	
	transport_layer.read_packet()

func connect_to(uri: String) -> Error:
	if uri.begins_with("tcp://"):
		transport_layer = TCPTransport.new()
	elif uri.begins_with("ws://") or uri.begins_with("wss://"):
		transport_layer = WebSocketTransport.new()
	return transport_layer.connect_to(uri)

func send(cmd: String, msg: Variant):
	if not transport_layer:
		return
	
	var packet := Packet.new(0, [])
	match typeof(msg):
		TYPE_STRING:
			packet.message.put_content(msg)
		TYPE_ARRAY:
			for arg in msg:
				if not arg:
					continue
				
				match typeof(arg):
					TYPE_BOOL:
						packet.message.put_bool(arg)
					TYPE_OBJECT:
						if arg.get_class() == "Short":
							packet.message.put_short(arg.value())
					TYPE_INT:
						packet.message.put_int(arg)
					TYPE_STRING:
						packet.message.put_string(arg)
	
	transport_layer.write_packet(packet)

class Short:
	var _val: int
	
	func _init(val: int) -> void:
		_val = val
	
	func value() -> int:
		return _val

class Message:
	var _buf: PackedByteArray
	
	func _init(buf: PackedByteArray) -> void:
		_buf = buf
	
	func get_content() -> String:
		var r := _buf.get_string_from_utf8()
		_buf.clear()
		return r
	
	func put_content(c: String) -> void:
		var msg := c.to_utf8_buffer()
		_buf.append_array(msg)
	
	func get_bool() -> bool:
		var b := _buf.get(0) & 63
		_buf = _buf.slice(1)
		return b != 0
	
	func put_bool(v: bool) -> void:
		if v:
			_buf.append(1 | 64)
		else:
			_buf.append(0 | 64)
	
	func get_byte() -> int:
		var b := _buf.get(0) & 63
		_buf = _buf.slice(1)
		return b
	
	func put_short(v: int) -> void:
		var b1 := (v / 64) | 64
		var b2 := (v & 63) | 64
		_buf.append(b1)
		_buf.append(b2)
	
	func get_int() -> int:
		var b := _buf.get(0) & 63
		var byte_count := ((b & 56) / 8) | 0
		var neg := b & 4
		var v := b & 3
		if byte_count > 1:
			var pow_table = [4, 256, 16384, 1048576, 67108864]
			for i in range(1, byte_count):
				b = _buf.get(i) & 63
				v |= b * pow_table[i - 1]
		if neg != 0:
			v = -v
		_buf = _buf.slice(byte_count)
		return v
	
	func put_int(v: int) -> void:
		var neg := 0
		if v < 0:
			neg = 4
			v = -v
		var b = (v & 3) | 64
		var buf: PackedByteArray = []
		var byte_count := 1
		v = v / 4
		while v != 0:
			byte_count += 1
			buf.append((v & 63) | 64)
			v = v / 64
		_buf.append(b | (8 * byte_count) | neg)
		_buf.append_array(buf)
	
	func get_string() -> String:
		var length := _buf.find(2)
		var s := ""
		if length > -1:
			s = _buf.slice(0, length).get_string_from_utf8()
			_buf = _buf.slice(length + 1)
		return s
	
	func put_string(s: String) -> void:
		var msg := s.to_utf8_buffer()
		var b1 := (msg.size() / 64) | 64
		var b2 := (msg.size() & 63) | 64
		_buf.append(b1)
		_buf.append(b2)
		_buf.append_array(msg)

class Packet:
	var command: int
	var message: Message
	
	func _init(cmd: int, msg: PackedByteArray) -> void:
		command = cmd
		message = Message.new(msg)

class TransportLayer:
	var _buf: PackedByteArray = []
	
	enum Status { NONE, CONNECTING, CONNECTED, ERROR }
	
	func connect_to(uri: String) -> Error:
		assert(true, "connect_to not implemented yet")
		return OK
	func dispose() -> void:
		assert(true, "dispose not implemented yet")
	func poll() -> void:
		assert(true, "poll not implemented yet")
	func get_status() -> Status:
		assert(true, "get_status not implemented yet")
		return Status.NONE
	func read_packet() -> Packet:
		assert(true, "read_packet not implemented yet")
		return null
	func _read_packet() -> Packet:
		if _buf.size() < 2:
			return null
		
		var b1 := _buf.get(0)
		var b2 := _buf.get(1)
		_buf = _buf.slice(2)
		var cmd := (b1 & 63) * 64 | (b2 & 63)
		
		var length := _buf.find(1)
		var msg := _buf.slice(0, length)
		_buf = _buf.slice(length + 1)
		
		return Packet.new(cmd, msg)
	func write_packet(packet: Packet):
		assert(true, "write_packet not implemented yet")
	func _write_packet(packet: Packet) -> PackedByteArray:
		var buf: PackedByteArray = []
		
		var length := 2 + packet.message._buf.size()
		buf.append(((length / 4096) & 63) | 64)
		buf.append(((length / 64) & 63) | 64)
		buf.append((length & 63) | 64)
		
		buf.append(((packet.command / 64) & 63) | 64)
		buf.append((packet.command & 63) | 64)
		buf.append_array(packet.message._buf)
		
		return buf

class TCPTransport extends TransportLayer:
	var _peer: StreamPeerTCP
	
	func _init() -> void:
		_peer = StreamPeerTCP.new()

	func connect_to(uri: String) -> Error:
		var u := URI.parse(uri)
		return _peer.connect_to_host(u.host, u.port)
		
	func dispose() -> void:
		_peer.disconnect_from_host()
		_peer.free()
		_peer = null
	
	func poll() -> void:
		_peer.poll()
	
	func get_status() -> Status:
		match _peer.get_status():
			StreamPeerTCP.STATUS_NONE:
				return Status.NONE
			StreamPeerTCP.STATUS_CONNECTING:
				return Status.CONNECTING
			StreamPeerTCP.STATUS_CONNECTED:
				return Status.CONNECTED
			StreamPeerTCP.STATUS_ERROR:
				return Status.ERROR
			_:
				return Status.NONE
	
	func read_packet():
		var bytes := _peer.get_available_bytes()
		if bytes > 0:
			var data := _peer.get_data(bytes)
			_buf.append_array(data[1])
		
		return _read_packet()
	
	func write_packet(packet: Packet):
		var data := _write_packet(packet)
		_peer.put_data(data)

class WebSocketTransport extends TransportLayer:
	var _peer: WebSocketPeer
	
	func _init() -> void:
		_peer = WebSocketPeer.new()
	
	func connect_to(uri: String) -> Error:
		return _peer.connect_to_url(uri)
	
	func dispose() -> void:
		_peer.close()
		_peer.free()
		_peer = null
	
	func poll() -> void:
		_peer.poll()
	
	func get_status() -> Status:
		match _peer.get_ready_state():
			WebSocketPeer.STATE_CLOSED:
				return Status.NONE
			WebSocketPeer.STATE_CLOSING:
				return Status.ERROR
			WebSocketPeer.STATE_CONNECTING:
				return Status.CONNECTING
			WebSocketPeer.STATE_OPEN:
				return Status.CONNECTED
			_:
				return Status.NONE
	
	func read_packet():		
		var available_packets := _peer.get_available_packet_count()
		while available_packets > 0:
			_buf.append_array(_peer.get_packet())
			available_packets -= 1
		
		return _read_packet()
	
	func write_packet(packet: Packet):
		var data := _write_packet(packet)
		_peer.put_packet(data)

class URI:
	var protocol: String
	var host: String
	var port: int
	var path: String
	
	static func parse(uri: String) -> URI:
		var result := URI.new()
		var parts := uri.split("://")
		if parts.size() != 2:
			return result
		
		result.protocol = parts[0]
		var p1 := parts[1].split("/")
		if p1.size() < 1:
			return result
		elif p1.size() > 1:
			result.path = "/" + "/".join(p1.slice(1))
		
		var domain := p1[0]
		if domain.find(":") == -1:
			result.host = domain
			return result
		
		var d := domain.split(":")
		if d.size() != 2:
			return result
		
		result.host = d[0]
		result.port = int(d[1])
		
		return result

static func build_tcp_uri(host: String, port: int):
	return "tcp://%s:%d" % [host, port]
