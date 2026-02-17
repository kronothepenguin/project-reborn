extends RefCounted

func _init() -> void:
	NodeManager.register_resource(&"entry", load("res://hh_entry_base/entry.tscn"))
