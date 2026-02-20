extends Node

var _process_list: Array = []

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
