class_name FigureData
extends RefCounted

static var _palettes: Dictionary[int, Dictionary] = {}
static var _colors: Dictionary[int, Color] = {}
static var _sets: Dictionary[int, Dictionary] = {}
static var _settypes: Dictionary[String, Dictionary] = {}

static func reset() -> void:
	pass

static func parse_data(buffer: PackedByteArray) -> bool:
	reset()	
	var parser := XMLParser.new()
	parser.open_buffer(buffer)
	var element_stack: Array[Dictionary] = []
	while parser.read() != ERR_FILE_EOF:
		var data = null
		match parser.get_node_type():
			XMLParser.NODE_ELEMENT:
				var element := { 
					"name": parser.get_node_name(),
					"attributes": {} as Dictionary[String, String],
				} as Dictionary[String, Variant]
				for index in range(parser.get_attribute_count()):
					element["attributes"][parser.get_attribute_name(index)] = parser.get_attribute_value(index)
				element_stack.push_back(element)
			XMLParser.NODE_ELEMENT_END:
				var last_element: Dictionary[String, Variant] = element_stack.pop_back()
				if last_element["name"] != parser.get_node_name():
					# Malformed XML
					reset()
					return false
			XMLParser.NODE_TEXT:
				data = parser.get_node_data()
		
		if len(element_stack) < 3:
			continue
		
		var is_valid := false
		if element_stack[0]["name"] == "figuredata" and element_stack[1]["name"] == "colors":
			is_valid = parse_colors(element_stack.slice(2), data)
		if element_stack[0]["name"] == "figuredata" and element_stack[1]["name"] == "sets":
			is_valid = parse_sets(element_stack.slice(2), data)
		
		if not is_valid:
			reset()
			return false
		
	return true

static func parse_colors(element_stack: Array[Dictionary], data: Variant) -> bool:
	var palette_element: Dictionary[String, Variant] = element_stack[0]
	if palette_element["name"] != "palette":
		return false
	if not palette_element["attributes"].has("id"):
		return false
	
	if len(element_stack) < 2:
		return true
	
	var color_element: Dictionary[String, Variant] = element_stack[1]
	if color_element["name"] != "color":
		return false
	if not color_element["attributes"].has("id"):
		return false
	
	if data == null:
		return true
	
	var color_attributes: Dictionary[String, String] = color_element["attributes"]
	var color_id := color_attributes["id"].to_int()
	if _colors.has(color_id):
		return false
	
	var color := Color(data)
	_colors[color_id] = color
	
	var palette_attributes: Dictionary[String, String] = palette_element["attributes"]
	var palette_id := palette_attributes["id"].to_int()
	if not _palettes.has(palette_id):
		_palettes[palette_id] = {} as Dictionary[int, Color]
	_palettes[palette_id].set(color_id, color)
	
	return true

static func parse_sets(element_stack: Array[Dictionary], data: Variant) -> bool:
	var settype_element: Dictionary[String, Variant] = element_stack[0]
	if settype_element["name"] != "settype":
		return false
	if not settype_element["attributes"].has("type"):
		return false
	if not settype_element["attributes"].has("paletteid"):
		return false
	
	if len(element_stack) < 2:
		return true
	
	var set_element: Dictionary[String, Variant] = element_stack[1]
	if set_element["name"] != "set":
		return false
	if not set_element["attributes"].has("id"):
		return false
	if not set_element["attributes"].has("colorable"):
		return false
	
	if len(element_stack) < 3:
		return true
	
	var element: Dictionary[String, Variant] = element_stack[2]
	var set_data: Dictionary[String, Variant]
	match element["name"]:
		"part":
			if not element["attributes"].has("id"):
				return false
			if not element["attributes"].has("type"):
				return false
			if not element["attributes"].has("colorable"):
				return false
			var element_attributes: Dictionary[String, String] = element["attributes"]
			var part_id := element_attributes["id"].to_int()
			var part_type := element_attributes["type"]
			var part_colorable := SpecialServices.parse_bool(element_attributes["colorable"])
			set_data["part"] = {
				"id": part_id,
				"type": part_type,
				"colorable": part_colorable,
			} as Dictionary[String, Variant]
		"hiddenlayers":
			if len(element_stack) < 4:
				return true
			
			var layer_element = element_stack[3]
			if layer_element["name"] != "layer":
				return false
			if not layer_element["attributes"].has("parttype"):
				return false
				
			var layer_attributes: Dictionary[String, String] = layer_element["attributes"]
			var layer_parttype := layer_attributes["parttype"]
			set_data["hiddenlayer"] = layer_parttype
		_:
			return false
	
	var settype_attributes: Dictionary[String, String] = settype_element["attributes"]
	var settype_type := settype_attributes["type"]
	if not _settypes.has(settype_type):
		_settypes[settype_type] = {}
	
	var set_attributes: Dictionary[String, String] = set_element["attributes"]
	var set_id := set_attributes["id"].to_int()
	if not _sets.has(set_id):
		_sets[set_id] = {} as Dictionary[String, Variant]
	var setv := _sets[set_id]
	setv["settype"] = settype_type
	if not setv.has("parts"):
		setv["parts"] = [] as Array[Dictionary]
	if set_data.has("part"):
		setv["parts"].append(set_data["part"])
	if not setv.has("hiddenlayers"):
		setv["hiddenlayers"] = [] as Array[String]
	if set_data.has("hiddenlayer"):
		setv["hiddenlayers"].append(set_data["hiddenlayer"])
	
	var settype_paletteid := settype_attributes["paletteid"].to_int()
	var settype: Dictionary[String, Variant] = {
		"paletteid": settype_paletteid
	}
	_settypes[settype_type] = settype
	
	return true

#var parser = XMLParser.new()
#parser.open("path/to/file.svg")
#while parser.read() != ERR_FILE_EOF:
	#if parser.get_node_type() == XMLParser.NODE_ELEMENT:
		#var node_name = parser.get_node_name()
		#var attributes_dict = {}
		#for idx in range(parser.get_attribute_count()):
			#attributes_dict[parser.get_attribute_name(idx)] = parser.get_attribute_value(idx)
		#print("The ", node_name, " element has the following attributes: ", attributes_dict)
