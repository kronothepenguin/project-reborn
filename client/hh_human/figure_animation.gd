# animation.xml
class_name FigureAnimation
extends RefCounted

var action_dict: Dictionary[String, Action]

func parse(path: String) -> bool:
	var parser := XMLParser.new()
	if parser.open(path) != OK:
		return false
	
	var dom := XMLDocumentObjectModel.new()
	if dom.build_from(parser) != OK:
		return false
	
	return _parse_animation_set(dom)
	
func _parse_animation_set(dom: XMLDocumentObjectModel) -> bool:
	var element: XMLDocumentObjectModel._Element
	for node in dom.root.children:
		if node is XMLDocumentObjectModel._Element and node.name == "animationSet":
			element = node
			break
	
	if element == null:
		push_error("Missing <animationSet> element")
		return false
	
	return _parse_action_elements(element)

func _parse_action_elements(animationSet: XMLDocumentObjectModel._Element) -> bool:
	action_dict = {}
	for node in animationSet.children:
		if node is XMLDocumentObjectModel._Element and node.name == "action":
			if not node.attributes.has("id"):
				continue
			
			var action := Action.new()
			action.id = node.attributes["id"]
			action.part_list = _parse_part_elements(node)
			action_dict[action.id] = action
		# else return error
	return true

func _parse_part_elements(action: XMLDocumentObjectModel._Element) -> Array:
	var part_list: Array[Part]
	for element in action.children:
		if element is XMLDocumentObjectModel._Element and element.name == "part":
			if not element.attributes.has("set-type"):
				continue
			
			var part := Part.new()
			part.settype = element.attributes["set-type"]
			part.frame_list = _parse_frame_elements(element)
			part_list.append(part)
	return part_list

func _parse_frame_elements(part: XMLDocumentObjectModel._Element) -> Array[Frame]:
	var frame_list: Array[Frame] = []
	for element in part.children:
		if element is XMLDocumentObjectModel._Element and element.name == "frame":
			if not element.attributes.has("number"):
				continue
			if not element.attributes["number"].is_valid_int():
				continue
			var frame := Frame.new()
			frame.number = element.attributes["number"].to_int()
			frame_list.append(frame)
	return frame_list

class Action extends RefCounted:
	var id: String
	var part_list: Array[Part]
	
class Part extends RefCounted:
	var settype: String
	var frame_list: Array[Frame]
	
class Frame extends RefCounted:
	var number: int
