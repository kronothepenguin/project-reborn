extends RefCounted

func _init() -> void:
	ResourcePackManager.add_resource(&"roomkiosk", load("res://hh_kiosk_room/roomkiosk.tscn"))
