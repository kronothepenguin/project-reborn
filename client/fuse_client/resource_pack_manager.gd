extends Node

var _resources: Dictionary[StringName, Resource] = {}
var _instances: Dictionary[StringName, Variant] = {}

func init_resource_pack(pck: String) -> void:
	var path := "res://" + pck + "/" + pck.get_file() + ".gd"
	if not ResourceLoader.exists(path):
		return
	var script: GDScript = load(path)
	script.new()

func add_resource(id: StringName, node: Variant) -> void:
	_resources.set(id, node)

func create(id: StringName):
	if not _resources.has(id) or _instances.has(id):
		return
	
	var resource = _resources.get(id)
	var instance = null
	
	if resource is GDScript: # Component and Handler
		instance = resource.new()
	if resource is PackedScene: # Support counterpart of "Interface"
		instance = resource.instantiate()
	
	if instance == null:
		return
	
	add_child(instance)
	_instances.set(id, instance)

func destoy(id: StringName):
	if not _instances.has(id):
		return
	
	var instance = _instances.get(id)
	_instances.erase(id)
	remove_child(instance)

func create_all():
	for id in _resources.keys():
		create(id)
