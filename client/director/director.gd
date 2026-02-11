extends Node

var _params := {}

func _init():
	if OS.has_feature("web"):
		_read_from_json()
	else:
		_read_from_cmdline()

func _read_from_cmdline():
	for arg in OS.get_cmdline_args():
		if arg.contains("="):
			var pair = arg.split("=")
			_params[pair[0].trim_prefix("--")] = pair[1]
		else:
			#TODO: parse "--key value" properly
			_params[arg.trim_prefix("--")] = ""

func _read_from_json():
	var s: String = JavaScriptBridge.eval("JSON.stringify(PARAMS || {})", true)
	if s == null or s == "":
		return
	
	var json: Dictionary = JSON.parse_string(s)
	for key in json:
		_params[key] = String(json[key])

func external_param_value(key: String, default = "") -> String:
	if key in _params:
		return _params[key]
	return default
