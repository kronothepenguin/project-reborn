extends RefCounted

func _init() -> void:
	NodeManager.register_resource(&"dialogs", load("res://hh_room_utils/dialog.gd"))
