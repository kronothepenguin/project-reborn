# partsets.xml
class_name FigurePartSets
extends RefCounted

var part_set: PartSet
var active_part_set_dict: Dictionary[String, ActivePartSet]

func parse(path: String) -> bool:
	var parser := XMLParser.new()
	if parser.open(path) != OK:
		push_error("Failed to open file: " + path)
		return false
	
	var dom := XMLDocumentObjectModel.new()
	var err := dom.build_from(parser)
	if err != OK:
		push_error("Failed to parse XML from: " + path)
		return false
	
	return _parse_part_sets(dom)

func _parse_part_sets(dom: XMLDocumentObjectModel) -> bool:
	var part_sets_node: XMLDocumentObjectModel._Element = null
	for node in dom.root.children:
		if node is XMLDocumentObjectModel._Element and node.name == "partSets":
			part_sets_node = node
			break
	
	if part_sets_node == null:
		push_error("Missing root <partSets> element")
		return false
	
	part_set = _parse_part_set(part_sets_node)
	active_part_set_dict = _parse_active_part_sets(part_sets_node)
	
	return true

func _parse_part_set(part_sets_node: XMLDocumentObjectModel._Element) -> PartSet:
	for node in part_sets_node.children:
		if node is XMLDocumentObjectModel._Element and node.name == "partSet":
			part_set = PartSet.new()
			part_set.part_list = []
			
			for part_node in node.children:
				if part_node is XMLDocumentObjectModel._Element and part_node.name == "part":
					var part := _parse_part(part_node)
					if part != null:
						part_set.part_list.append(part)
			
			return part_set
	
	push_error("Missing <partSet> element")
	return null

func _parse_part(part_node: XMLDocumentObjectModel._Element) -> Part:
	if not part_node.attributes.has("set-type"):
		push_error("Part element missing 'set-type' attribute")
		return null
	
	var part := Part.new()
	part.settype = part_node.attributes["set-type"]
	
	# Atributos opcionales
	part.swim = false
	if part_node.attributes.has("swim"):
		part.swim = part_node.attributes["swim"] == "1"
	
	part.flipped_set_type = ""
	if part_node.attributes.has("flipped-set-type"):
		part.flipped_set_type = part_node.attributes["flipped-set-type"]
	
	part.remove_set_type = ""
	if part_node.attributes.has("remove-set-type"):
		part.remove_set_type = part_node.attributes["remove-set-type"]
	
	return part

func _parse_active_part_sets(part_sets_node: XMLDocumentObjectModel._Element) -> Dictionary[String, ActivePartSet]:
	var result: Dictionary[String, ActivePartSet] = {}
	
	for node in part_sets_node.children:
		if node is XMLDocumentObjectModel._Element and node.name == "activePartSet":
			if not node.attributes.has("id"):
				push_error("ActivePartSet element missing 'id' attribute")
				continue
			
			var id: String = node.attributes["id"]
			var active_part_set := ActivePartSet.new()
			active_part_set.id = id
			active_part_set.active_part_list = []  # Inicialización obligatoria
			
			for part_node in node.children:
				if part_node is XMLDocumentObjectModel._Element and part_node.name == "activePart":
					var active_part := _parse_active_part(part_node)
					if active_part != null:
						active_part_set.active_part_list.append(active_part)
			
			result[id] = active_part_set
	
	return result

func _parse_active_part(active_part_node: XMLDocumentObjectModel._Element) -> ActivePart:
	if not active_part_node.attributes.has("set-type"):
		push_error("ActivePart element missing 'set-type' attribute")
		return null
	
	var active_part := ActivePart.new()
	active_part.settype = active_part_node.attributes["set-type"]
	
	return active_part

class PartSet extends RefCounted:
	var part_list: Array[Part]

class Part extends RefCounted:
	var settype: String
	var swim: bool
	var flipped_set_type: String
	var remove_set_type: String

class ActivePartSet extends RefCounted:
	var id: String
	var active_part_list: Array[ActivePart]

class ActivePart extends RefCounted:
	var settype: String
