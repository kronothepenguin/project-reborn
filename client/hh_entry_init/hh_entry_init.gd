extends RefCounted

func _init() -> void:
	ResourcePackManager.add_resource(&"login", load("res://hh_entry_init/login.tscn"))
