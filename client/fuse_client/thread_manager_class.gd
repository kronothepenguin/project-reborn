# "thread_manager_class" is kept to comparison with LingoScript counterpart
# NodeManager
extends Node

var _resources := {}
var _nodes := {}

func register_resource(id: StringName, node: Variant) -> void:
	_resources.set(id, node)

func create(id: StringName):
	init_thread(id)

func init_thread(id: StringName):
	if not _resources.has(id) or _nodes.has(id):
		return
	var resource = _resources.get(id)
	var thread_obj
	if resource is GDScript: # Component and Handler
		thread_obj = resource.new()
		add_child(thread_obj)
	if resource is PackedScene: # Support counterpart of "Interface"
		thread_obj = resource.instantiate()
		add_child(thread_obj)
	_nodes.set(id, thread_obj)

func init_all():
	for id in _resources.keys():
		init_thread(id)
