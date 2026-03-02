# figuredata.xml
class_name FigureData
extends RefCounted
	
var colors: Colors
var sets: Sets

func parse(path: String) -> bool:
	var parser := XMLParser.new()
	if parser.open(path) != OK:
		push_error("Failed to open file: " + path)
		return false
	
	var dom := XMLDocumentObjectModel.new()
	if dom.build_from(parser) != OK:
		push_error("Failed to parse XML from: " + path)
		return false
	
	return _parse_figuredata(dom)

func _parse_figuredata(dom: XMLDocumentObjectModel) -> bool:
	var figuredata_element: XMLDocumentObjectModel._Element
	for node in dom.root.children:
		if node is XMLDocumentObjectModel._Element and node.name == "figuredata":
			figuredata_element = node
			break
	
	if figuredata_element == null:
		push_error("Missing <figuredata> element")
		return false
	
	if not _parse_colors(figuredata_element):
		return false
		
	if not _parse_sets(figuredata_element):
		return false
	
	return true

func _parse_colors(figuredata_element: XMLDocumentObjectModel._Element) -> bool:
	var colors_element: XMLDocumentObjectModel._Element = null
	for node in figuredata_element.children:
		if node is XMLDocumentObjectModel._Element and node.name == "colors":
			colors_element = node
			break
	
	if colors_element == null:
		push_error("Missing <colors> element")
		return false
	
	colors = Colors.new()
	colors.palette_dict = _parse_palette_elements(colors_element)
	
	return true

func _parse_palette_elements(colors_element: XMLDocumentObjectModel._Element) -> Dictionary[int, Palette]:
	var palette_dict: Dictionary[int, Palette] = {}
	for node in colors_element.children:
		if node is XMLDocumentObjectModel._Element and node.name == "palette":
			if not node.attributes.has("id"):
				push_error("Palette element missing 'id' attribute")
				continue
			var palette := _parse_palette(node)
			if palette != null:
				colors.palette_dict[palette.id] = palette
	return palette_dict

func _parse_palette(palette_node: XMLDocumentObjectModel._Element) -> Palette:
	var palette := Palette.new()
	palette.id = palette_node.attributes["id"].to_int()
	palette.color_dict = {}
	
	for node in palette_node.children:
		if node is XMLDocumentObjectModel._Element and node.name == "color":
			var color := _parse_palette_color(node)
			if color != null:
				palette.color_dict[color.id] = color
	
	return palette

func _parse_palette_color(color_node: XMLDocumentObjectModel._Element) -> PaletteColor:
	if not color_node.attributes.has("id") or not color_node.attributes.has("index"):
		push_error("Color element missing required attributes")
		return null
	
	var color := PaletteColor.new()
	color.id = color_node.attributes["id"].to_int()
	color.index = color_node.attributes["index"].to_int()
	color.club = color_node.attributes.get("club", "0") == "1"
	color.selectable = color_node.attributes.get("selectable", "0") == "1"
	
	for child in color_node.children:
		if child is XMLDocumentObjectModel._TextNode:
			var hex_color: String = child.data
			if hex_color.length() == 6:
				color.color = Color("#" + hex_color)
			else:
				push_warning("Invalid color format: " + hex_color)
				color.color = Color.WHITE
	
	return color

func _parse_sets(figuredata_element: XMLDocumentObjectModel._Element) -> bool:
	var sets_node: XMLDocumentObjectModel._Element = null
	for node in figuredata_element.children:
		if node is XMLDocumentObjectModel._Element and node.name == "sets":
			sets_node = node
			break
	
	if sets_node == null:
		push_error("Missing <sets> element")
		return false
	
	sets = Sets.new()
	sets.settype_list = []
	
	for node in sets_node.children:
		if node is XMLDocumentObjectModel._Element and node.name == "settype":
			var settype := _parse_settype(node)
			if settype != null:
				sets.settype_list.append(settype)
	
	return true

func _parse_settype(settype_node: XMLDocumentObjectModel._Element) -> SetType:
	if not settype_node.attributes.has("type"):
		push_error("Settype element missing 'type' attribute")
		return null
	
	var settype := SetType.new()
	settype.type = settype_node.attributes["type"]
	settype.paletteid = settype_node.attributes.get("paletteid", "0").to_int()
	settype.mandatory = settype_node.attributes.get("mandatory", "0") == "1"
	settype.set_dict = {}
	
	for node in settype_node.children:
		if node is XMLDocumentObjectModel._Element and node.name == "set":
			var set_ := _parse_set(node)
			if set_ != null:
				settype.set_dict[set_.id] = set_
	
	return settype

func _parse_set(set_node: XMLDocumentObjectModel._Element) -> Set:
	if not set_node.attributes.has("id"):
		push_error("Set element missing 'id' attribute")
		return null
	
	var set_ := Set.new()
	set_.id = set_node.attributes["id"].to_int()
	set_.gender = set_node.attributes.get("gender", "U")
	set_.club = set_node.attributes.get("club", "0") == "1"
	set_.colorable = set_node.attributes.get("colorable", "0") == "1"
	set_.selectable = set_node.attributes.get("selectable", "0") == "1"
	set_.part_list = []
	set_.hiddenlayers = null
	
	# Parsear las partes y hiddenlayers
	for node in set_node.children:
		if node is XMLDocumentObjectModel._Element:
			if node.name == "part":
				var part := _parse_part(node)
				if part != null:
					set_.part_list.append(part)
			elif node.name == "hiddenlayers":
				set_.hiddenlayers = _parse_hiddenlayers(node)
	
	return set_

func _parse_part(part_node: XMLDocumentObjectModel._Element) -> Part:
	if not part_node.attributes.has("id") or not part_node.attributes.has("type"):
		push_error("Part element missing required attributes")
		return null
	
	var part := Part.new()
	part.id = part_node.attributes["id"].to_int()
	part.type = part_node.attributes["type"]
	part.colorable = part_node.attributes.get("colorable", "0") == "1"
	
	# Manejar el atributo index si está presente
	if part_node.attributes.has("index"):
		part.index = part_node.attributes["index"].to_int()
	
	return part

func _parse_hiddenlayers(hiddenlayers_node: XMLDocumentObjectModel._Element) -> HiddenLayers:
	var hiddenlayers := HiddenLayers.new()
	hiddenlayers.layer_list = []
	
	for node in hiddenlayers_node.children:
		if node is XMLDocumentObjectModel._Element and node.name == "layer":
			if node.attributes.has("parttype"):
				var layer := Layer.new()
				layer.parttype = node.attributes["parttype"]
				hiddenlayers.layer_list.append(layer)
	
	return hiddenlayers

class Colors extends RefCounted:
	var palette_dict: Dictionary[int, Palette]

class Palette extends RefCounted:
	var id: int
	var color_dict: Dictionary[int, PaletteColor]

# <color>
class PaletteColor extends RefCounted:
	var id: int
	var index: int
	var club: bool
	var selectable: bool
	var color: Color # text content

class Sets extends RefCounted:
	var settype_list: Array[SetType]

class SetType extends RefCounted:
	var type: String
	var paletteid: int
	var mandatory: bool
	var set_dict: Dictionary[int, Set]

class Set extends RefCounted:
	var id: int
	var gender: String
	var club: bool
	var colorable: bool
	var selectable: bool
	var part_list: Array[Part]
	var hiddenlayers: HiddenLayers

class Part extends RefCounted:
	var id: int
	var type: String
	var colorable: bool
	var index: int

class HiddenLayers extends RefCounted:
	var layer_list: Array[Layer]

class Layer extends RefCounted:
	var parttype: String
