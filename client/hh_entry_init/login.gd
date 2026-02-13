extends Node2D

var _ok_to_login = false

var _latency_test_id: int = 1
var _latency_value_list: Array[int] = []
var _latency_test_timestamp_list: Array[float] = []
var _latency_total_value: int = 0
var _latency_value_count: int = 0
var _latency_cleared_value: int = 0
var _latency_cleared_count: int = 0
var _latency_test_timer: Timer
var _latency_test_interval: int = 0
var _latency_report_index: int = 0
var _latency_report_delta: int = 0
var _latency_reported: bool = false

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
	pass

func close_connection():
	pass

func send_login():
	pass

func set_login_ok():
	pass
