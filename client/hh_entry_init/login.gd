extends Node2D

var _ok_to_login = false

var _latency_test_id: int = 1
var _latency_value_list: Array[int] = []
var _latency_test_timestamp_list: Dictionary[int, float] = {}
var _latency_total_value: int = 0
var _latency_value_count: int = 0
var _latency_cleared_value: int = 0
var _latency_cleared_count: int = 0
var _latency_test_interval: int = 20000
var _latency_report_index: int = 15
var _latency_report_delta: int = 100
var _latency_reported: int = 0

func _ready() -> void:
	construct_component()
	construct_handler()

func _exit_tree() -> void:
	deconstruct_component()
	deconstruct_handler()

# Component
func construct_component():
	if VariableContainer.exists("latencytest.interval"):
		_latency_test_interval = VariableContainer.get_var("latencytest.interval")
	if VariableContainer.exists("latencytest.report.index"):
		_latency_report_index = VariableContainer.get_var("latencytest.report.index")
	if VariableContainer.exists("latencytest.report.delta"):
		_latency_report_delta = VariableContainer.get_var("latencytest.report.delta")
		
	_latency_reported = false
	
	## REFERENCE - useless stuff ##
	#if variableExists("stats.tracking.javascript") then
		#createObject(#statsBrokerJs, "Statistics Broker Javascript Class")
	#end if
	#if variableExists("stats.tracking.url") then
		#createObject(#statsBroker, "Statistics Broker Class")
	#end if
	#if not objectExists(#dateFormatter) then
		#createObject(#dateFormatter, ["Date Class"])
	#end if
	## /REFERENCE - useless stuff ##
	
	# TODO: figure system
	#if not objectExists("Figure_System") then
		#if createObject("Figure_System", ["Figure System Class"]) <> 0 then
			#tURL = getVariable("external.figurepartlist.txt")
			#getObject("Figure_System").define(["type": "url", "source": tURL])
		#end if
	#end if
	# TODO: figure preview
	#if not objectExists("Figure_Preview") then
		#createObject("Figure_Preview", ["Figure Preview Class"])
	#end if
	
	var session := SpecialServices.get_session()
	session["user_rights"] = []
	MessageBus.register(&"Initialize", init_a)
	
	## REFERENCE - useless stuff ##
	#if not objectExists("Help_Tooltip_Manager") then
		#createObject("Help_Tooltip_Manager", "Help Tooltip Manager Class")
	#end if
	#if not objectExists("Ticket_Window_Manager") then
		#createObject("Ticket_Window_Manager", "Ticket Window Manager Class")
	#end if
	#if not objectExists("Oneclick_Buy_Window_Manager") then
		#createObject("Oneclick_Buy_Window_Manager", "Game Oneclick Buy Window Manager Class")
	#end if
	## /REFERENCE - useless stuff ##
	
	MessageBus.register(&"openConnection", open_connection)
	MessageBus.register(&"closeConnection", close_connection)
	MessageBus.register(&"performLogin", send_login)
	#MessageBus.register(&"loginIsOk", set_login_ok)
	
func deconstruct_component():
	_ok_to_login = false
	
	MessageBus.unregister(&"openConnection", open_connection)
	MessageBus.unregister(&"closeConnection", close_connection)
	MessageBus.unregister(&"performLogin", send_login)
	#MessageBus.unregister(&"loginIsOk", set_login_ok)
	
	#if connectionExists(getVariable("connection.info.id", #Info)) then
		#return me.disconnect()

func init_a(_1 = null):
	# TODO: wait for figurepartlist.loaded
	
	await get_tree().create_timer(1).timeout
	init_b()

func init_b() -> void:
	var use_sso := false
	if VariableContainer.exists("use.sso.ticket"):
		use_sso = VariableContainer.get_var("use.sso.ticket")
		if use_sso and VariableContainer.exists("sso.ticket"):
			var sso_ticket: String = VariableContainer.get_var("sso.ticket")
			if sso_ticket.length() > 1:
				var session := SpecialServices.get_session()
				session["sso_ticket"] = sso_ticket
				open_connection()
				return
	if not use_sso:
		# TODO: return show_login()
		print("show login")
		return
	MessageBus.execute(&"alert", { &"Msg": "Alert_generic_login_error" })

func send_login():
	pass

func open_connection():
	var host: String = VariableContainer.get_var("connection.info.host", "")
	var url: String = VariableContainer.get_var("connection.info.url", "")
	if host.is_empty() and url.is_empty():
		push_error("Invalid server parameters")
		return
		
	var uri: String
	if not host.is_empty():
		var port: int = VariableContainer.get_var("connection.info.port", 0)
		uri = SpecialServices.build_tcp_uri(host, port)
	else:
		uri = url
	
	if not ConnectionManager.create(ConnectionManager.ID_INFO, uri):
		push_error("failed to connect info")

func close_connection():
	pass

func init_latency_test():
	if _latency_test_interval <= 0:
		return
	if %LatencyTimer.is_stopped():
		%LatencyTimer.wait_time = _latency_test_interval / 1000.0
		%LatencyTimer.timeout.connect(send_latency_test)
		%LatencyTimer.start()

func send_latency_test():
	var conn := ConnectionManager.get_connection(ConnectionManager.ID_INFO)
	conn.send("TEST_LATENCY", [_latency_test_id])
	_latency_test_timestamp_list[_latency_test_id] = Time.get_unix_time_from_system()
	_latency_test_id += 1

# Handler
func construct_handler():
	network(true)
	
	#MessageBus.register(&"hideLogin", hide_login)

func deconstruct_handler():
	network(false)

func handle_disconnect(conn: ConnectionManager.Connection, packet: ConnectionManager.Packet):
	pass
	
func handle_hello(conn: ConnectionManager.Connection, packet: ConnectionManager.Packet):
	conn.send("INIT_CRYPTO")
	
func handle_server_secret_key(conn: ConnectionManager.Connection, packet: ConnectionManager.Packet):
	pass
func handle_rights(conn: ConnectionManager.Connection, packet: ConnectionManager.Packet):
	pass

func handle_login_ok(conn: ConnectionManager.Connection, packet: ConnectionManager.Packet):
	conn.send("GET_INFO")
	conn.send("GET_CREDITS")
	conn.send("GETAVAILABLEBADGES")
	conn.send("GET_POSSIBLE_ACHIEVEMENTS")
	conn.send("GET_SOUND_SETTING")
	init_latency_test()
	var session: Dictionary = get_tree().root.get_meta("session")
	session["user_logged_in"] = true
	
func handle_user_obj(conn: ConnectionManager.Connection, packet: ConnectionManager.Packet):
	pass
func handle_err(conn: ConnectionManager.Connection, packet: ConnectionManager.Packet):
	pass
func handle_user_banned(conn: ConnectionManager.Connection, packet: ConnectionManager.Packet):
	pass
	
func handle_ping(conn: ConnectionManager.Connection, packet: ConnectionManager.Packet):
	conn.send("PONG")
	
func handle_eps_notify(conn: ConnectionManager.Connection, packet: ConnectionManager.Packet):
	pass
func handle_system_broadcast(conn: ConnectionManager.Connection, packet: ConnectionManager.Packet):
	pass
func handle_checksum(conn: ConnectionManager.Connection, packet: ConnectionManager.Packet):
	pass
func handle_mod_alert(conn: ConnectionManager.Connection, packet: ConnectionManager.Packet):
	pass
func handle_available_badges(conn: ConnectionManager.Connection, packet: ConnectionManager.Packet):
	pass

func handle_session_parameters(conn: ConnectionManager.Connection, packet: ConnectionManager.Packet):
	var pairs_count := packet.message.get_int()
	if pairs_count > 0:
		var session: Dictionary = get_tree().root.get_meta("session")
		for i in range(pairs_count):
			var id := packet.message.get_int()
			match id:
				0:
					var value := packet.message.get_int()
					session["conf_coppa"] = value > 0
					session["conf_strong_coppa_required"] = value > 1
				1:
					var value := packet.message.get_int()
					session["conf_voucher"] =  value > 0
				2:
					var value := packet.message.get_int()
					session["conf_parent_email_request"] =  value > 0
				3:
					var value := packet.message.get_int()
					session["conf_parent_email_request_reregistration"] =  value > 0
				4:
					var value := packet.message.get_int()
					session["conf_allow_direct_mail"] =  value > 0
				5:
					var value := packet.message.get_string()
					print(value)
					#tDateForm.define(value)
				6:
					var value := packet.message.get_int()
					session["conf_partner_integration"] =  value > 0
				7:
					var value := packet.message.get_int()
					session["allow_profile_editing"] =  value > 0
				8:
					var value := packet.message.get_string()
					session["tracking_header"] =  value
				9:
					var value := packet.message.get_int()
					session["tutorial_enabled"] =  value
	send_login()

func handle_crypto_parameters(conn: ConnectionManager.Connection, packet: ConnectionManager.Packet):
	pass
func handle_end_of_crypto_params(conn: ConnectionManager.Connection, packet: ConnectionManager.Packet):
	pass
func handle_hotel_logout(conn: ConnectionManager.Connection, packet: ConnectionManager.Packet):
	pass
func handle_sound_setting(conn: ConnectionManager.Connection, packet: ConnectionManager.Packet):
	pass
func handle_possible_achievements(conn: ConnectionManager.Connection, packet: ConnectionManager.Packet):
	pass
func handle_achievement_notification(conn: ConnectionManager.Connection, packet: ConnectionManager.Packet):
	pass
	
func handle_latency_test(conn: ConnectionManager.Connection, packet: ConnectionManager.Packet):
	var id := packet.message.get_int()
	if not _latency_test_timestamp_list.has(id):
		return
	var delta := Time.get_unix_time_from_system() - _latency_test_timestamp_list[id]
	_latency_test_timestamp_list.erase(id)
	_latency_value_list.append(delta)
	_latency_value_count += 1
	if _latency_value_list.size() == _latency_report_index and _latency_report_index > 0:
		for value in _latency_value_list:
			_latency_total_value += value
		var latency := _latency_total_value / _latency_value_count
		for value in _latency_value_list:
			if value < 2 * latency:
				_latency_cleared_value += value
				_latency_cleared_count += 1
		var latency_cleared := _latency_cleared_value / _latency_cleared_count
		if abs(latency - _latency_reported) > _latency_report_delta or _latency_reported == 0:
			_latency_reported = latency
			conn.send("REPORT_LATENCY", [latency, latency_cleared, _latency_value_count])
		_latency_value_list = []

func network(active: bool) -> void:
	var messages: Dictionary[int, Callable] = {
		-1: handle_disconnect,
		0: handle_hello,
		1: handle_server_secret_key,
		2: handle_rights,
		3: handle_login_ok,
		5: handle_user_obj,
		33: handle_err,
		35: handle_user_banned,
		50: handle_ping,
		52: handle_eps_notify,
		139: handle_system_broadcast,
		141: handle_checksum,
		161: handle_mod_alert,
		229: handle_available_badges,
		257: handle_session_parameters,
		277: handle_crypto_parameters,
		278: handle_end_of_crypto_params,
		287: handle_hotel_logout,
		308: handle_sound_setting,
		436: handle_possible_achievements,
		437: handle_achievement_notification,
		354: handle_latency_test,
	}
	
	var commands: Dictionary[String, int] = {
		"TRY_LOGIN": 756,
		"VERSIONCHECK": 1170,
		"UNIQUEID": 813,
		"GET_INFO": 7,
		"GET_CREDITS": 8,
		"GET_PASSWORD": 47,
		"LANGCHECK": 58,
		"BTCKS": 105,
		"GETAVAILABLEBADGES": 157,
		"GETSELECTEDBADGES": 159,
		"GET_SESSION_PARAMETERS": 1817,
		"PONG": 196,
		"GENERATEKEY": 2002,
		"SSO": 204,
		"INIT_CRYPTO": 206,
		"SECRETKEY": 207,
		"GET_SOUND_SETTING": 228,
		"SET_SOUND_SETTING": 229,
		"GET_POSSIBLE_ACHIEVEMENTS": 370,
		"TEST_LATENCY": 315,
		"REPORT_LATENCY": 316,
	}
	
	if active:
		ConnectionManager.register_listeners(ConnectionManager.ID_INFO, messages)
		ConnectionManager.register_commands(ConnectionManager.ID_INFO, commands)
	else:
		ConnectionManager.unregister_listeners(ConnectionManager.ID_INFO, messages)
		ConnectionManager.unregister_commands(ConnectionManager.ID_INFO, commands)
