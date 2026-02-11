class_name VisualizerManager

static var _item_list := {}

static func set_visual(id: String, path: String) -> void:
	_item_list.set(id, path)

static func load(id: String) -> PackedScene:
	if _item_list.has(id):
		var path := _item_list.get(id) as String
		var scene := load(path) as PackedScene
		return scene
	return null
