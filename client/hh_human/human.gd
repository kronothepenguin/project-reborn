@tool
class_name Human
extends Node2D

var animation: FigureAnimation
var figuredata: FigureData
var draworder: FigureDrawOrder
var partsets: FigurePartSets

var _figure: String
var _body_parts: Array[_BodyPart]
var _textures: Array[ImageTexture]
var _rects: Array[Rect2]
var _colors: Array[Color]
var _offsets_cache: Dictionary[String, Dictionary]

var action: String = "std"
var direction: int = 3

var _settype_dir_map: Dictionary[String, String] = {
	"ca": "res://hh_human_acc_chest",
	"ea": "res://hh_human_acc_eye",
	"fa": "res://hh_human_acc_face",
	"he": "res://hh_human_acc_head",
	"wa": "res://hh_human_acc_waist",
	"lh": "res://hh_human_body",
	"rh": "res://hh_human_body",
	"bd": "res://hh_human_body",
	"hd": "res://hh_human_body",
	"sd": "res://hh_human_body",
	"ey": "res://hh_human_face",
	"fc": "res://hh_human_face",
	"hrb": "res://hh_human_hair",
	"hr": "res://hh_human_hair",
	"ha": "res://hh_human_hats",
	"ri": "res://hh_human_item",
	"lg": "res://hh_human_leg",
	"ls": "res://hh_human_shirt",
	"rs": "res://hh_human_shirt",
	"ch": "res://hh_human_shirt",
	"sh": "res://hh_human_shoe",
}

func _draw() -> void:
	for i in _textures.size():
		draw_texture_rect(_textures[i], _rects[i], false, _colors[i])

func _build_textures() -> void:
	_textures.clear()
	_rects.clear()
	for body_part in _body_parts:
		if not _settype_dir_map.has(body_part.settype.type):
			continue
		var part := body_part.part
		var dir := _settype_dir_map[part.type]
		var frame := 0
		
		var filepath := "%s/h_%s_%s_%d_%d_%d.png" % [dir, action, part.type, part.id, direction, frame]
		if not FileAccess.file_exists(filepath):
			push_error("Unknown body part %s" % filepath)
			continue

		var image := Image.load_from_file(filepath)
		if image.get_format() != Image.FORMAT_RGBA8:
			image.convert(Image.FORMAT_RGBA8)
		Inker.apply_ink(image, Inker.Ink.MATTE_8, Color.WHITE)
		var texture := ImageTexture.create_from_image(image)
		var name := "h_%s_%s_%d_%d_%d" % [action, part.type, part.id, direction, frame]
		var offset := _get_offset(dir, name)
		_textures.append(texture)
		_rects.append(Rect2(offset.x, offset.y, image.get_width(), image.get_height()))
		_colors.append(body_part.color)

func set_figure(figure: String) -> void:
	if _parse_figure(figure):
		_figure = figure

func _parse_figure(value: String) -> bool:
	var next_body_parts: Array[_BodyPart]
	var body_parts := value.split(".")
	for part in body_parts:
		var parts := part.split("-")
		if len(parts) != 3:
			return false
		
		var settype_str := parts[0]
		var setid_str := parts[1]
		var colorid_str := parts[2]
		
		if not setid_str.is_valid_int() or not colorid_str.is_valid_int():
			return false
		
		var index := figuredata.sets.settype_list.find_custom(func (_settype: FigureData.SetType): return _settype.type == settype_str)
		if index == -1:
			return false
		
		var settype := figuredata.sets.settype_list[index]
		
		var setid := setid_str.to_int()
		if not settype.set_dict.has(setid):
			return false
		
		var set_ := settype.set_dict[setid]
		var color: Color
		if set_.colorable:
			if not figuredata.colors.palette_dict.has(settype.paletteid):
				return false
			
			var palette := figuredata.colors.palette_dict[settype.paletteid]
			
			var colorid := colorid_str.to_int()
			if not palette.color_dict.has(colorid):
				return false
			
			color = palette.color_dict[colorid].color
		else:
			color = Color.WHITE
		
		for p in set_.part_list:
			var body_part := _BodyPart.new()
			body_part.part = p
			body_part.settype = settype
			body_part.set_ = set_
			body_part.color = color
			next_body_parts.append(body_part)
	
	next_body_parts.sort_custom(_sort_body_parts)
	_body_parts = next_body_parts
	_build_textures()
	queue_redraw()
	return true

func _sort_body_parts(a: _BodyPart, b : _BodyPart):
	var current_action := draworder.action_dict[action]
	var current_direction := current_action.direction_dict[direction]
	var index1 := current_direction.part_list.part_list.find_custom(_find_part.bind(a.part.type))
	var index2 := current_direction.part_list.part_list.find_custom(_find_part.bind(b.part.type))
	return index1 < index2

func _get_offset(dir: String, name: String) -> Vector2:
	if not _offsets_cache.has(dir):
		var json_path := dir + "/offsets.json"
		var json_text := FileAccess.get_file_as_string(json_path)
		if json_text.is_empty():
			_offsets_cache[dir] = {}
		else:
			_offsets_cache[dir] = JSON.parse_string(json_text)
	var offsets: Dictionary = _offsets_cache[dir]
	if offsets.has(name):
		var arr: Array = offsets[name]
		return Vector2(-arr[0], -arr[1])
	return Vector2.ZERO

func _find_part(part: FigureDrawOrder.Part, target: String) -> bool:
	return part.settype == target

class _BodyPart extends RefCounted:
	var settype: FigureData.SetType
	var part: FigureData.Part
	var set_: FigureData.Set
	var color: Color
