extends Node

var _params := {}

var _members := {}

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

func _get_member_id(memname: String) -> int:
	var id: Variant = _members.find_key(memname)
	if id is int:
		return id
	var uid := ResourceUID.path_to_uid(memname)
	return ResourceUID.text_to_id(uid)

func _get_member_name(memnum: int) -> String:
	if _members.has(memnum):
		return _members[memnum]
	return ""

func member_exists(memname: String) -> bool:
	return _members.find_key(memname) != null or ResourceUID.path_to_uid(memname) != memname

func getmemnum(memname: String) -> int:
	if not member_exists(memname):
		return ResourceUID.INVALID_ID
	return _get_member_id(memname)

func create_member(memname: String, type: StringName) -> int:
	if member_exists(memname):
		return _get_member_id(memname)
	var id := ResourceUID.create_id()
	ResourceUID.add_id(id, memname)
	_members[id] = memname
	return id

func remove_member(memname: StringName) -> void:
	if not member_exists(memname):
		return
	var id := _get_member_id(memname)
	if ResourceUID.has_id(id):
		ResourceUID.remove_id(id)
	_members.erase(id)

func member(memnum: int) -> Resource:
	var r := Resource.new()
	var memname: String
	if _members.has(memnum):
		memname = _members[memnum]
	elif ResourceUID.has_id(memnum):
		var uid := ResourceUID.id_to_text(memnum)
		memname = ResourceUID.uid_to_path(uid)
	r.resource_name = memname
	return r
