# draworder.xml
class_name FigureDrawOrder
extends RefCounted

var action_dict: Dictionary[String, Action]

func parse(path: String) -> bool:
	var parser := XMLParser.new()
	if parser.open(path) != OK:
		push_error("Failed to open file: " + path)
		return false
	
	var dom := XMLDocumentObjectModel.new()
	if dom.build_from(parser) != OK:
		push_error("Failed to parse XML from: " + path)
		return false
	
	return _parse_action_set(dom)

func _parse_action_set(dom: XMLDocumentObjectModel) -> bool:
	var element: XMLDocumentObjectModel._Element
	for node in dom.root.children:
		if node is XMLDocumentObjectModel._Element and node.name == "actionSet":
			element = node
			break
	
	if element == null:
		push_error("Missing root element <actionSet>")
		return false
	
	return _parse_action_elements(element)

func _parse_action_elements(actionSet: XMLDocumentObjectModel._Element) -> bool:
	action_dict = {}
	
	for node in actionSet.children:
		if node is XMLDocumentObjectModel._Element and node.name == "action":
			if not node.attributes.has("id"):
				push_error("Action element missing 'id' attribute")
				continue
			
			var action := Action.new()
			action.id = node.attributes["id"]
			action.direction_dict = _parse_direction_elements(node)
			action_dict[action.id] = action
	
	return true

func _parse_direction_elements(action: XMLDocumentObjectModel._Element) -> Dictionary[int, Direction]:
	var direction_dict: Dictionary[int, Direction] = {}
	
	for node in action.children:
		if node is XMLDocumentObjectModel._Element and node.name == "direction":
			if not node.attributes.has("id"):
				push_error("Direction element missing 'id' attribute")
				continue
			if not node.attributes["id"].is_valid_int():
				push_error("Invalid direction id: " + node.attributes["id"])
				continue
			
			var direction := Direction.new()
			direction.id = node.attributes["id"].to_int()
			direction.part_list = _parse_part_list(node)
			direction_dict[direction.id] = direction
	
	return direction_dict

func _parse_part_list(direction: XMLDocumentObjectModel._Element) -> PartList:
	for node in direction.children:
		if node is XMLDocumentObjectModel._Element and node.name == "partList":
			return _parse_part_elements(node)
	
	push_error("Missing <partList> element in direction")
	return null

func _parse_part_elements(part_list_node: XMLDocumentObjectModel._Element) -> PartList:
	var partList := PartList.new()
	partList.part_list = []
	
	for node in part_list_node.children:
		if node is XMLDocumentObjectModel._Element and node.name == "part":
			if not node.attributes.has("set-type"):
				push_warning("Part element missing 'set-type' attribute")
				continue
			
			var part := Part.new()
			part.settype = node.attributes["set-type"]
			partList.part_list.append(part)
	
	return partList

class Action extends RefCounted:
	var id: String = ""
	var direction_dict: Dictionary[int, Direction]
	
class Direction extends RefCounted:
	var id: int = -1
	var part_list: PartList
	
class PartList extends RefCounted:
	var part_list: Array[Part]
	
class Part extends RefCounted:
	var settype: String
