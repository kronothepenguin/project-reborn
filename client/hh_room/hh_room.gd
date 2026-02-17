extends RefCounted

func _init() -> void:
	NodeManager.register_resource(&"room", load("res://hh_room/room.tscn"))
