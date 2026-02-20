extends RefCounted

func _init() -> void:
	ResourcePackManager.add_resource(&"room", load("res://hh_room/room.tscn"))
