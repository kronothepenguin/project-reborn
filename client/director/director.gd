extends Node

var _params := {}

var _members_num_map := {}
var _members := []

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

func member_exists(memname: String) -> bool:
	#if name.begins_with("res://"):
		#return FileAccess.file_exists(name)
	return _members_num_map.has(memname)

func getmemnum(memname: String) -> int:
	return _members_num_map.get(memname) if _members_num_map.has(memname) else 0

func create_member(memname: String, type: StringName) -> int:
	var m := Member.new()
	m.type = type
	_members.append(m)
	var memnum := _members.size()
	return _members_num_map.set(memname, memnum)

func remove_member(name: StringName) -> void:
	pass

func member(num: int) -> Member:
	return _members.get(num - 1) if _members.size() > num - 1 else null

class Member:
	var name: String
	var type: StringName
