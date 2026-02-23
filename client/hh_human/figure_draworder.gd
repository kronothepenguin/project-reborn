# draworder.xml
class_name FigureDrawOrder
extends RefCounted

static var action_set: ActionSet

static func parse(path: String) -> bool:
	var parser := XMLParser.new()
	if parser.open(path) != OK:
		return false
	
	var dom := XMLDocumentObjectModel.new()
	if dom.build_from(parser) != OK:
		return false
	
	action_set = _parse_action_set(dom)
	if action_set == null:
		return false
	return true

static func _parse_action_set(dom: XMLDocumentObjectModel) -> ActionSet:
	return null

class ActionSet extends RefCounted:
	var action_dict: Dictionary[String, Action]
	
class Action extends RefCounted:
	var id: String
	var direction_dict: Dictionary[int, Direction]
	
class Direction extends RefCounted:
	var id: int
	var part_list: PartList
	
class PartList extends RefCounted:
	var part_list: Array[Part]
	
class Part extends RefCounted:
	var setttype: String
