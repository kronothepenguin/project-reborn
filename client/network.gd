extends Node

@export var websocket_url = "wss://echo.websocket.org"

var socket = WebSocketPeer.new()

# Called when the node enters the scene tree for the first time.
func _ready() -> void:
	var err = socket.connect_to_url(websocket_url)
	if err == OK:
		print("Connecting to %s..." % websocket_url)
		await get_tree().create_timer(2).timeout
		socket.send_text("Test packet")
	else:
		push_error("Unable to connect")
		set_process(false)


# Called every frame. 'delta' is the elapsed time since the previous frame.
func _process(delta: float) -> void:
	socket.poll()
	
	var state = socket.get_ready_state()
	
	if state == WebSocketPeer.STATE_OPEN:
		while socket.get_available_packet_count():
			var packet = socket.get_packet()
			if socket.was_string_packet():
				var packet_text = packet.get_string_from_utf8()
				print("< Got text data from server: %s" % packet_text)
			else:
				print("< Got binary data from server: %d bytes" % packet.size())
	elif state == WebSocketPeer.STATE_CLOSING:
		pass
	elif state == WebSocketPeer.STATE_CLOSED:
		var code = socket.get_close_code()
		print("WebSocket closed with code: %d. Clean: %s" % [code, code != -1])
		set_process(false)
