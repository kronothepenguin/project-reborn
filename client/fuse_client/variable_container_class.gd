class_name VariableContainer

static var _item_list := {}

static func set_var(variable: String, value):
	_item_list[variable] = value

static func get_var(variable: String, default = null):
	if _item_list.has(variable):
		return _item_list[variable]
	return default

static func exists(variable: String) -> bool:
	return _item_list.has(variable)

static func dump(path: String, delimiter := "\n", override := true) -> void:
	var file := FileAccess.open(path, FileAccess.READ)
	while not file.eof_reached():
		var line := file.get_line().strip_edges()
		
		if line.begins_with("#") or line.is_empty():
			continue
		
		var idx := line.find("=")
		if idx == -1:
			continue
		
		var key := line.substr(0, idx).strip_edges()
		var raw_value := line.substr(idx + 1).strip_edges()
		var value = _parse_value(raw_value)
		
		if override or not _item_list.has(key):
			_item_list[key] = value
	file.close()

static func _parse_value(v: String):
	if v.begins_with("#"):
		return StringName(v.substr(1))
	if v.is_valid_int():
		return v.to_int()
	if v.is_valid_float():
		return v.to_float()
	return v
