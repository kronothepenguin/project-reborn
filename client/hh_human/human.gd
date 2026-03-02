@tool
class_name Human
extends Node2D

var animation: FigureAnimation
var figuredata: FigureData
var draworder: FigureDrawOrder
var partsets: FigurePartSets

var _figure: String
var _body_parts: Array[_BodyPart]

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
	for body_part in _body_parts:
		if not _settype_dir_map.has(body_part.settype.type):
			continue
		var dir := _settype_dir_map[body_part.settype.type]
		var settype := body_part.settype.type
		var setid := body_part.set_.id
		var frame := 0
		
		var filepath := "%s/h_%s_%s_%d_%d_%d" % [dir, action, settype, setid, direction, frame]
		if not FileAccess.file_exists(filepath):
			push_error("Unknown body part %s" % filepath)
			continue
		
		var image: ImageTexture = load(filepath)
		
		draw_texture(image, Vector2(0, 0), body_part.color)

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
			# TODO: verify palette id of settype at parse time
			var palette := figuredata.colors.palette_dict[settype.paletteid]
			
			var colorid := colorid_str.to_int()
			if not palette.color_dict.has(colorid):
				return false
			
			color = palette.color_dict[colorid].color
		else:
			color = Color.WHITE
		
		var body_part := _BodyPart.new()
		body_part.settype = settype
		body_part.set_ = set_
		body_part.color = color
		next_body_parts.append(body_part)
	
	next_body_parts.sort_custom(_sort_body_parts)
	_body_parts = next_body_parts
	
	queue_redraw()
	return true

func _sort_body_parts(a: _BodyPart, b : _BodyPart):
	var current_action := draworder.action_dict[action]
	var current_direction := current_action.direction_dict[direction]
	var index1 := current_direction.part_list.part_list.find_custom(_find_part.bind(a.settype.type))
	var index2 := current_direction.part_list.part_list.find_custom(_find_part.bind(b.settype.type))
	return index1 < index2

func _find_part(part: FigureDrawOrder.Part, target: String) -> bool:
	return part.settype == target

class _BodyPart extends RefCounted:
	var settype: FigureData.SetType
	var set_: FigureData.Set
	var color: Color
