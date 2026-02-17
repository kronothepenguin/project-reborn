extends RefCounted

func _init() -> void:
	NodeManager.register_resource(&"roomkiosk", load("res://hh_kiosk_room/roomkiosk.tscn"))
