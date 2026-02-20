extends RefCounted

func _init() -> void:
	ResourcePackManager.add_resource(&"entry", load("res://hh_entry_base/entry.tscn"))
