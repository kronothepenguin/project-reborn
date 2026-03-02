class_name XMLDocumentObjectModel
extends RefCounted

var root: _Element = _Element.new()

var _current: _Element = root

func is_text_node(node: _Node) -> bool:
	return node is _TextNode

func is_element(node: _Node) -> bool:
	return node is _Element

func build_from(parser: XMLParser) -> Error:
	while parser.read() != ERR_FILE_EOF:
		var err := _read(parser)
		if err != OK:
			return err
	return OK

func _read(parser: XMLParser) -> Error:
	match parser.get_node_type():
		XMLParser.NODE_ELEMENT:
			var element := _Element.new()
			element.name = parser.get_node_name()
			for i in range(parser.get_attribute_count()):
				element.attributes.set(
					parser.get_attribute_name(i), 
					parser.get_attribute_value(i)
				)
			_append_child(element)
			if not parser.is_empty():
				_current = element
		
		XMLParser.NODE_ELEMENT_END:
			var name := parser.get_node_name()
			if name != _current.name:
				return FAILED
			if _current == root:
				return FAILED
			_current = _current.parent
		
		XMLParser.NODE_TEXT:
			var node := _TextNode.new()
			node.data = parser.get_node_data()
			_append_child(node)
	
	return OK

func _append_child(node: _Node) -> Error:
	_current.children.append(node)
	node.parent = _current
	return OK

class _Node extends RefCounted:
	var parent: _Element

class _TextNode extends _Node:
	var data: String

class _Element extends _Node:
	var name: String
	var attributes: Dictionary[String, String] = {}
	var children: Array[_Node] = []
