extends Node

var _process_list: Array = []

func get_machine_id() -> String:
	#TODO: store machine id
	return generate_machine_id()
	
func generate_machine_id() -> String:
	var milliseconds := str(Time.get_ticks_msec())
	var time_dict := Time.get_time_dict_from_system(true)
	var time := str(time_dict["hour"]) + str(time_dict["minute"]) + str(time_dict["second"])
	var date_dict := Time.get_date_dict_from_system(true)
	var date := str(date_dict["year"]) + str(date_dict["month"]) + str(date_dict["day"])

	var raw_machine_id := milliseconds + time + date
	var max_length := int(VariableContainer.get_var("machine.id.max.length"))
	var machine_id := raw_machine_id.substr(0, max_length)
	return machine_id

func get_movie_path() -> String:
	if OS.has_feature("editor"):
		return ""
	if OS.has_feature("web"):
		return str(JavaScriptBridge.eval("window.location.origin"))
	return ""

func get_predefined_url(url: String) -> String:
	if VariableContainer.exists("url.prefix"):
		var prefix: String = VariableContainer.get_var("url.prefix")
		if prefix.ends_with("/"):
			return url.replace("http://%predefined%/", prefix).replace("https://%predefined%/", prefix)
		else:
			return url.replace("http://%predefined%", prefix).replace("https://%predefined%", prefix)
	return url

func get_ext_var_path() -> String:
	if OS.has_feature("editor"):
		return "res://external_variables.txt"
	return VariableContainer.get_var("external.variables.txt")

func send_process_tracking(step_value):
	_process_list.append(step_value)
	if VariableContainer.exists("processlog.url"):
		var report_url := str(VariableContainer.get_var("processlog.url"))
		if report_url == "javascript" and OS.has_feature("web"):
			var console = JavaScriptBridge.get_interface("console")
			console.log(step_value)
		elif not report_url.is_empty():
			var account_id: int = VariableContainer.get_var("account_id", 0)
			var http := HTTPRequest.new()
			http.request(report_url, [], HTTPClient.METHOD_POST, "step=%d&account_id=%d" % [step_value, account_id])

func init_session() -> void:
	var session := {}
	session["client_startdate"] = Time.get_date_string_from_system(true)
	session["client_starttime"] = Time.get_unix_time_from_system()
	session["client_version"] = VariableContainer.get_var("system.version")
	session["client_url"] = "" # JavaScript.Eval
	session["client_lastclick"] = null
	get_tree().root.set_meta("session", session)

func get_session() -> Dictionary:
	return get_tree().root.get_meta("session")

func set_session_data(key: String, value: Variant) -> void:
	var session := get_session()
	session[key] = value

func build_tcp_uri(host: String, port: int) -> String:
	return "tcp://%s:%d" % [host, port]

func parse_bool(s: String) -> bool:
	match s.to_lower():
		"f", "false", "no", "0", "off":
			return false
		_:
			return true
		

func parse_uri(uri: String) -> URI:
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

class URI extends RefCounted:
	var protocol: String
	var host: String
	var port: int
	var path: String
