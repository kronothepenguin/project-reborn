extends Node

func _ready() -> void:
	NodeManager.register_resource(&"entry", load("res://hh_entry_base/entry.tscn"))
	queue_free()
