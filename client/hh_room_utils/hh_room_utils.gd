extends RefCounted

func _init() -> void:
	ResourcePackManager.add_resource(&"dialogs", load("res://hh_room_utils/dialog.gd"))
