extends Control

enum _State {
	LOAD_XMLS,
	WAIT_XMLS,
	INIT,
	DONE,
	ERROR,
}

const _XML_KEYS := ["animation.xml", "figuredata.xml", "draworder.xml", "partsets.xml"]

var _state: _State = _State.LOAD_XMLS
var _xml_data: Dictionary[String, PackedByteArray] = {}
var _pending_xmls: int = 0

var _animation: FigureAnimation
var _figuredata: FigureData
var _draworder: FigureDrawOrder
var _partsets: FigurePartSets

var _current_figure: Dictionary[String, Dictionary] = {}

func _process(_delta: float) -> void:
	match _state:
		_State.LOAD_XMLS:
			_state = _load_xmls()
		_State.WAIT_XMLS:
			if _pending_xmls <= 0:
				_state = _State.INIT
		_State.INIT:
			_state = _init_preview()
		_State.DONE, _State.ERROR:
			set_process(false)

func _resolve_url(path: String) -> String:
	if path.begins_with("res://") or path.begins_with("http://") or path.begins_with("https://"):
		return path
	if path.begins_with("/"):
		return Director.the_base_path() + path.lstrip("/")
	return Director.the_movie_path() + path.lstrip("./")

func _load_xmls() -> _State:
	if OS.has_feature("editor"):
		for key in _XML_KEYS:
			var path := "res://external/" + key
			var parser := XMLParser.new()
			if parser.open(path) != OK:
				push_error("Failed to open: ", path)
				return _State.ERROR
			_xml_data[key] = FileAccess.get_file_as_bytes(path)
		return _State.INIT

	_pending_xmls = _XML_KEYS.size()
	for key in _XML_KEYS:
		var url := Director.external_param_value(key)
		if url.is_empty():
			push_error("Missing param: ", key)
			return _State.ERROR
		url = _resolve_url(url)
		HTTPRequestPool.request(url, _on_xml_loaded.bind(key))
	return _State.WAIT_XMLS

func _on_xml_loaded(result: int, response_code: int, _headers: PackedStringArray, body: PackedByteArray, key: String) -> void:
	if result != HTTPRequest.RESULT_SUCCESS or response_code != 200:
		push_error("Failed to load: ", key, " result=", result, " code=", response_code)
		_state = _State.ERROR
		return
	_xml_data[key] = body
	_pending_xmls -= 1

func _parse_xml_buffer(parser: XMLParser, data: PackedByteArray) -> bool:
	return parser.open_buffer(data) == OK

func _init_preview() -> _State:
	_animation = FigureAnimation.new()
	var p := XMLParser.new()
	if not _parse_xml_buffer(p, _xml_data["animation.xml"]):
		push_error("Failed to parse animation.xml")
		return _State.ERROR
	var dom := XMLDocumentObjectModel.new()
	if dom.build_from(p) != OK:
		return _State.ERROR
	_animation._parse_animation_set(dom)

	_figuredata = FigureData.new()
	p = XMLParser.new()
	if not _parse_xml_buffer(p, _xml_data["figuredata.xml"]):
		push_error("Failed to parse figuredata.xml")
		return _State.ERROR
	dom = XMLDocumentObjectModel.new()
	if dom.build_from(p) != OK:
		return _State.ERROR
	_figuredata._parse_figuredata(dom)

	_draworder = FigureDrawOrder.new()
	p = XMLParser.new()
	if not _parse_xml_buffer(p, _xml_data["draworder.xml"]):
		push_error("Failed to parse draworder.xml")
		return _State.ERROR
	dom = XMLDocumentObjectModel.new()
	if dom.build_from(p) != OK:
		return _State.ERROR
	_draworder._parse_action_set(dom)

	_partsets = FigurePartSets.new()
	p = XMLParser.new()
	if not _parse_xml_buffer(p, _xml_data["partsets.xml"]):
		push_error("Failed to parse partsets.xml")
		return _State.ERROR
	dom = XMLDocumentObjectModel.new()
	if dom.build_from(p) != OK:
		return _State.ERROR
	_partsets._parse_part_sets(dom)

	%Human.animation = _animation
	%Human.figuredata = _figuredata
	%Human.draworder = _draworder
	%Human.partsets = _partsets

	_build_ui()

	var initial_figure := Director.external_param_value("figure", "hd-620-1")
	%Human.set_figure(initial_figure)

	return _State.DONE

func _build_ui() -> void:
	for settype in _figuredata.sets.settype_list:

		var hbox := HBoxContainer.new()
		var label := Label.new()
		label.text = settype.type
		label.custom_minimum_size.x = 30
		hbox.add_child(label)

		var set_option := OptionButton.new()
		set_option.name = "set_" + settype.type
		for set_id in settype.set_dict:
			var set_: FigureData.Set = settype.set_dict[set_id]
			if not set_.selectable:
				continue
			set_option.add_item(str(set_id), set_id)
		set_option.item_selected.connect(_on_set_selected.bind(settype))
		hbox.add_child(set_option)

		if settype.paletteid > 0 and _figuredata.colors.palette_dict.has(settype.paletteid):
			var color_option := OptionButton.new()
			color_option.name = "color_" + settype.type
			var palette := _figuredata.colors.palette_dict[settype.paletteid]
			for color_id in palette.color_dict:
				var pc: FigureData.PaletteColor = palette.color_dict[color_id]
				if pc.selectable:
					color_option.add_item(str(color_id), color_id)
			color_option.item_selected.connect(_on_color_selected.bind(settype))
			hbox.add_child(color_option)

		%SetList.add_child(hbox)

func _on_set_selected(index: int, settype: FigureData.SetType) -> void:
	var option: OptionButton = %SetList.find_child("set_" + settype.type, true, false)
	if option == null:
		return
	var set_id := option.get_item_id(index)
	var color_id := 1
	if _current_figure.has(settype.type):
		color_id = _current_figure[settype.type].get("color", 1)
	_current_figure[settype.type] = {"set": set_id, "color": color_id}
	_apply_figure()

func _on_color_selected(index: int, settype: FigureData.SetType) -> void:
	var option: OptionButton = %SetList.find_child("color_" + settype.type, true, false)
	if option == null:
		return
	var color_id := option.get_item_id(index)
	if _current_figure.has(settype.type):
		_current_figure[settype.type]["color"] = color_id
	else:
		_current_figure[settype.type] = {"set": 1, "color": color_id}
	_apply_figure()

func _apply_figure() -> void:
	var parts: PackedStringArray = []
	for type in _current_figure:
		var entry: Dictionary = _current_figure[type]
		parts.append("%s-%d-%d" % [type, entry["set"], entry["color"]])
	if parts.size() > 0:
		%Human.set_figure(".".join(parts))
