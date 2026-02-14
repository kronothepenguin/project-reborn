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
	construct()

func _notification(what: int) -> void:
	if what == NOTIFICATION_PREDELETE:
		deconstruct()

func construct():
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
	#if not objectExists("Figure_System") then
		#if createObject("Figure_System", ["Figure System Class"]) <> 0 then
			#tURL = getVariable("external.figurepartlist.txt")
			#getObject("Figure_System").define(["type": "url", "source": tURL])
		#end if
	#end if
	#if not objectExists("Figure_Preview") then
		#createObject("Figure_Preview", ["Figure Preview Class"])
	#end if
	## /REFERENCE - useless stuff ##
	
	var session: Dictionary = get_tree().root.get_meta("session")
	session["user_rights"] = []
	
	EventBroker.initialize.connect(init_a)
	
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
	
	#EventBroker.open_connection.connect(open_connection)
	#EventBroker.close_connection.connect(close_connection)
	#EventBroker.perform_login.connect(send_login)
	#EventBroker.login_is_ok.connect(set_login_ok)
	## /REFERENCE - useless stuff ##
	
	# handler
	var conn: Connection = get_tree().root.get_meta("info")
	
	conn.register_message(-1, handle_disconnect)
	conn.register_message(0, handle_hello)
	conn.register_message(1, handle_server_secret_key)
	conn.register_message(2, handle_rights)
	conn.register_message(3, handle_login_ok)
	conn.register_message(5, handle_user_obj)
	conn.register_message(33, handle_err)
	conn.register_message(35, handle_user_banned)
	conn.register_message(50, handle_ping)
	conn.register_message(52, handle_eps_notify)
	conn.register_message(139, handle_system_broadcast)
	conn.register_message(141, handle_checksum)
	conn.register_message(161, handle_mod_alert)
	conn.register_message(229, handle_available_badges)
	conn.register_message(257, handle_session_parameters)
	conn.register_message(277, handle_crypto_parameters)
	conn.register_message(278, handle_end_of_crypto_params)
	conn.register_message(287, handle_hotel_logout)
	conn.register_message(308, handle_sound_setting)
	conn.register_message(436, handle_possible_achievements)
	conn.register_message(437, handle_achievement_notification)
	conn.register_message(354, handle_latency_test)
	
	conn.register_command("TRY_LOGIN", 756)
	conn.register_command("VERSIONCHECK", 1170)
	conn.register_command("UNIQUEID", 813)
	conn.register_command("GET_INFO", 7)
	conn.register_command("GET_CREDITS", 8)
	conn.register_command("GET_PASSWORD", 47)
	conn.register_command("LANGCHECK", 58)
	conn.register_command("BTCKS", 105)
	conn.register_command("GETAVAILABLEBADGES", 157)
	conn.register_command("GETSELECTEDBADGES", 159)
	conn.register_command("GET_SESSION_PARAMETERS", 1817)
	conn.register_command("PONG", 196)
	conn.register_command("GENERATEKEY", 2002)
	conn.register_command("SSO", 204)
	conn.register_command("INIT_CRYPTO", 206)
	conn.register_command("SECRETKEY", 207)
	conn.register_command("GET_SOUND_SETTING", 228)
	conn.register_command("SET_SOUND_SETTING", 229)
	conn.register_command("GET_POSSIBLE_ACHIEVEMENTS", 370)
	conn.register_command("TEST_LATENCY", 315)
	conn.register_command("REPORT_LATENCY", 316)
	
func deconstruct():
	_ok_to_login = false
	
	EventBroker.initialize.disconnect(init_a)
	
	#if connectionExists(getVariable("connection.info.id", #Info)) then
		#return me.disconnect()
	
	#EventBroker.open_connection.disconnect(open_connection)
	#EventBroker.close_connection.disconnect(close_connection)
	#EventBroker.perform_login.disconnect(send_login)
	#EventBroker.login_is_ok.disconnect(set_login_ok)

## Interface
func show_login():
	var session: Dictionary = get_tree().root.get_meta("session")
	session["username"] = ""
	session["password"] = ""

## Component
func init_a():
	# TODO: wait for figurepartlist.loaded
	
	await get_tree().create_timer(1).timeout
	init_b()

func init_b():
	var use_sso := false
	if VariableContainer.exists("use.sso.ticket"):
		use_sso = VariableContainer.get_var("use.sso.ticket")
		if use_sso and VariableContainer.exists("sso.ticket"):
			var sso_ticket: String = VariableContainer.get_var("sso.ticket")
			if sso_ticket.length() > 1:
				var session: Dictionary = get_tree().root.get_meta("session")
				session["sso_ticket"] = sso_ticket
				return open_connection()
	if not use_sso:
		return show_login()
	EventBroker.alert.emit({ "msg": "Alert_generic_login_error" })

func open_connection():
	var host: String = VariableContainer.get_var("connection.info.host", "")
	var url: String = VariableContainer.get_var("connection.info.url", "")
	if host.is_empty() and url.is_empty():
		printerr("Invalid server parameters")
		return
		
	var uri: String
	if not host.is_empty():
		var port: int = VariableContainer.get_var("connection.info.port", 0)
		uri = Connection.build_tcp_uri(host, port)
	else:
		uri = url
	
	var conn: Connection = get_tree().root.get_meta("info")
	var err := conn.connect_to(uri)
	if err != OK:
		printerr("Failed to connect!")
		return

func close_connection():
	pass

func send_login():
	pass

func set_login_ok():
	pass

func init_latency_test():
	if _latency_test_interval <= 0:
		return
	if %LatencyTimer.is_stopped():
		%LatencyTimer.wait_time = _latency_test_interval / 1000.0
		%LatencyTimer.timeout.connect(send_latency_test)
		%LatencyTimer.start()

func send_latency_test():
	var conn: Connection = get_tree().get_meta("info")
	conn.send("TEST_LATENCY", [_latency_test_id])
	_latency_test_timestamp_list[_latency_test_id] = Time.get_unix_time_from_system()
	_latency_test_id += 1

## Handler
func handle_disconnect(conn: Connection, packet: Connection.Packet):
	pass
	
func handle_hello(conn: Connection, packet: Connection.Packet):
	conn.send("INIT_CRYPTO")
	
func handle_server_secret_key(conn: Connection, packet: Connection.Packet):
	pass
func handle_rights(conn: Connection, packet: Connection.Packet):
	pass

func handle_login_ok(conn: Connection, packet: Connection.Packet):
	conn.send("GET_INFO")
	conn.send("GET_CREDITS")
	conn.send("GETAVAILABLEBADGES")
	conn.send("GET_POSSIBLE_ACHIEVEMENTS")
	conn.send("GET_SOUND_SETTING")
	init_latency_test()
	var session: Dictionary = get_tree().root.get_meta("session")
	session["user_logged_in"] = true
	
func handle_user_obj(conn: Connection, packet: Connection.Packet):
	pass
func handle_err(conn: Connection, packet: Connection.Packet):
	pass
func handle_user_banned(conn: Connection, packet: Connection.Packet):
	pass
	
func handle_ping(conn: Connection, packet: Connection.Packet):
	conn.send("PONG")
	
func handle_eps_notify(conn: Connection, packet: Connection.Packet):
	pass
func handle_system_broadcast(conn: Connection, packet: Connection.Packet):
	pass
func handle_checksum(conn: Connection, packet: Connection.Packet):
	pass
func handle_mod_alert(conn: Connection, packet: Connection.Packet):
	pass
func handle_available_badges(conn: Connection, packet: Connection.Packet):
	pass

func handle_session_parameters(conn: Connection, packet: Connection.Packet):
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

func handle_crypto_parameters(conn: Connection, packet: Connection.Packet):
	pass
func handle_end_of_crypto_params(conn: Connection, packet: Connection.Packet):
	pass
func handle_hotel_logout(conn: Connection, packet: Connection.Packet):
	pass
func handle_sound_setting(conn: Connection, packet: Connection.Packet):
	pass
func handle_possible_achievements(conn: Connection, packet: Connection.Packet):
	pass
func handle_achievement_notification(conn: Connection, packet: Connection.Packet):
	pass
	
func handle_latency_test(conn: Connection, packet: Connection.Packet):
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
