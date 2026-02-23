extends Node

enum { ID_INFO, ID_MUS }

var _listeners: Dictionary[int, Dictionary] = {}
var _commands: Dictionary[int, Dictionary] = {}

var _conn_info: ConnectionInstace = null
var _conn_mus: MultiuserInstance = null

func _process(_delta: float) -> void:
	_process_connection(ID_INFO)
	_process_connection(ID_MUS)

func _process_connection(id: int) -> void:
	var conn := get_connection(id)
	if conn == null:
		return
	
	conn._transport.poll()
	
	if conn._transport.get_status() == Transport.Status.ERROR:
		ErrorManager.error(self, "connection lost " + str(id), &"_process_connection", ErrorManager.Level.CRITICAL)
		remove(id)
		return
	
	var packet := conn.read_packet()
	if packet == null:
		return
	
	if not _listeners.has(id):
		ErrorManager.error(self, "missing listeners " + str(id), &"_process_connection", ErrorManager.Level.MINOR)
		return
	
	var handlers: Dictionary[int, Array] = _listeners[id]
	if not handlers.has(packet.command):
		ErrorManager.error(self, "missing handlers " + str(packet.command), &"_process_connection", ErrorManager.Level.MINOR)
		return
	
	var callback_list: Array[Callable] = handlers[packet.command]
	for callback in callback_list:
		callback.call_deferred(conn, packet)

func create(id: int, uri: String) -> bool:
	var transport: Transport
	if uri.begins_with("tcp://"):
		transport = TCPTransport.new()
	elif uri.begins_with("ws://") or uri.begins_with("wss://"):
		transport = WebSocketTransport.new()
	else:
		return false
	
	var err := transport.connect_to(uri)
	if err != OK:
		return false
	
	match id:
		ID_INFO:
			_conn_info = ConnectionInstace.new(transport)
		ID_MUS:
			_conn_mus = MultiuserInstance.new(transport)
		_:
			return false
	
	return true

func remove(id: int) -> bool:
	match id:
		ID_INFO:
			if _conn_info == null:
				return true
			if _conn_info._transport != null:
				_conn_info._transport.dispose()
				_conn_info._transport = null
			_conn_info = null
		ID_MUS:
			if _conn_mus == null:
				return true
			if _conn_mus._transport != null:
				_conn_mus._transport.dispose()
				_conn_mus._transport = null
			_conn_mus = null
		_:
			return false
	return true

func get_connection(id: int) -> Connection:
	match id:
		ID_INFO:
			return _conn_info
		ID_MUS:
			return _conn_mus
	return null

func register_listeners(id: int, messages: Dictionary[int, Callable]) -> void:
	if not _listeners.has(id):
		_listeners[id] = {} as Dictionary[int, Array]
	var prev: Dictionary[int, Array] = _listeners[id]
	for msg in messages:
		var callback := messages[msg]
		if not prev.has(msg):
			prev[msg] = [] as Array[Callable]
		prev[msg].append(callback)

func unregister_listeners(id: int, messages: Dictionary[int, Callable]) -> void:
	if not _listeners.has(id):
		return
	var prev: Dictionary[int, Array] = _listeners[id]
	for msg in messages:
		var callback := messages[msg]
		if not prev.has(msg):
			continue
		prev[msg].erase(callback)

func register_commands(id: int, commands: Dictionary[String, int]):
	if not _commands.has(id):
		_commands[id] = {} as Dictionary[String, int]
	var prev: Dictionary[String, int] = _commands[id]
	prev.merge(commands)

func unregister_commands(id: int, commands: Dictionary[String, int]):
	if not _commands.has(id):
		return
	var prev: Dictionary[String, int] = _commands[id]
	for cmd in commands:
		prev.erase(cmd)

class Short extends RefCounted:
	var _val: int
	
	func _init(val: int) -> void:
		_val = val & 0xffff
	
	func value() -> int:
		return _val

class Message extends RefCounted:
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
		@warning_ignore("integer_division")
		var b1 := (v / 64) | 64
		var b2 := (v & 63) | 64
		_buf.append(b1)
		_buf.append(b2)
	
	func get_int() -> int:
		var b := _buf.get(0) & 63
		@warning_ignore("integer_division")
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
		@warning_ignore("integer_division")
		v = v / 4
		while v != 0:
			byte_count += 1
			buf.append((v & 63) | 64)
			@warning_ignore("integer_division")
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
		@warning_ignore("integer_division")
		var b1 := (msg.size() / 64) | 64
		var b2 := (msg.size() & 63) | 64
		_buf.append(b1)
		_buf.append(b2)
		_buf.append_array(msg)

class Packet extends RefCounted:
	var command: int
	var message: Message
	
	func _init(cmd: int, msg: PackedByteArray) -> void:
		command = cmd
		message = Message.new(msg)

@abstract class Transport extends RefCounted:
	@warning_ignore("unused_private_class_variable")
	var _buf: PackedByteArray = []
	
	enum Status { NONE, CONNECTING, CONNECTED, ERROR }
	
	@abstract func connect_to(_uri: String) -> Error
	
	@abstract func dispose() -> void
	
	@abstract func poll() -> void
	
	@abstract func get_status() -> Status
	
	@abstract func read_bytes() -> PackedByteArray
	
	@abstract func write_bytes(data: PackedByteArray) -> void

class TCPTransport extends Transport:
	var _peer: StreamPeerTCP
	
	func _init() -> void:
		_peer = StreamPeerTCP.new()

	func connect_to(uri: String) -> Error:
		var u := SpecialServices.parse_uri(uri)
		return _peer.connect_to_host(u.host, u.port)
		
	func dispose() -> void:
		_peer.disconnect_from_host()
		#_peer.free()
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
	
	func read_bytes() -> PackedByteArray:
		var bytes := _peer.get_available_bytes()
		if bytes > 0:
			var data := _peer.get_data(bytes)
			_buf.append_array(data[1])
		
		return _buf
	
	func write_bytes(data: PackedByteArray) -> void:
		_peer.put_data(data)

class WebSocketTransport extends Transport:
	var _peer: WebSocketPeer
	
	func _init() -> void:
		_peer = WebSocketPeer.new()
	
	func connect_to(uri: String) -> Error:
		return _peer.connect_to_url(uri)
	
	func dispose() -> void:
		_peer.close()
		#_peer.free()
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
	
	func read_bytes() -> PackedByteArray:
		var available_packets := _peer.get_available_packet_count()
		while available_packets > 0:
			_buf.append_array(_peer.get_packet())
			available_packets -= 1
		
		return _buf
	
	func write_bytes(data: PackedByteArray) -> void:
		_peer.put_packet(data)

@abstract class Connection extends RefCounted:
	var _transport: Transport
	
	func _init(transport: Transport) -> void:
		_transport = transport
	
	@abstract func read_packet() -> Packet
	
	@abstract func write_packet(packet: Packet) -> void
	
	@abstract func send(cmd: String, msg: Variant = []) -> void

class ConnectionInstace extends Connection:
	func read_packet() -> Packet:
		var buf := _transport.read_bytes()
		if buf.size() < 2:
			return null
		
		var b1 := buf.get(0)
		var b2 := buf.get(1)
		buf = buf.slice(2)
		var cmd := (b1 & 63) * 64 | (b2 & 63)
		
		var length := buf.find(1)
		var msg := buf.slice(0, length)
		
		_transport._buf = buf.slice(length + 1)
		
		return Packet.new(cmd, msg)
	
	func write_packet(packet: Packet) -> void:
		var buf: PackedByteArray = []
		
		var length := 2 + packet.message._buf.size()
		@warning_ignore("integer_division")
		buf.append(((length / 4096) & 63) | 64)
		@warning_ignore("integer_division")
		buf.append(((length / 64) & 63) | 64)
		buf.append((length & 63) | 64)
		
		@warning_ignore("integer_division")
		buf.append(((packet.command / 64) & 63) | 64)
		buf.append((packet.command & 63) | 64)
		buf.append_array(packet.message._buf)
		
		_transport.write_bytes(buf)
	
	func send(cmd: String, msg: Variant = []) -> void:
		if not _transport:
			return
		
		var commands := ConnectionManager._commands[ID_INFO]
		if not commands.has(cmd):
			return
		
		var opcode: int = commands[cmd]
		var packet := Packet.new(opcode, [])
		match typeof(msg):
			TYPE_STRING:
				packet.message.put_content(msg)
			TYPE_ARRAY:
				for arg in msg:
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
		
		write_packet(packet)

class MultiuserInstance extends Connection:
	func read_packet() -> Packet:
		return null
	
	func write_packet(_packet: Packet) -> void:
		return
	
	func send(cmd: String, msg: Variant = []) -> void:
		return
