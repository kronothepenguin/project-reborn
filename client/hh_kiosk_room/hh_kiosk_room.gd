extends Node

func _ready() -> void:
	NodeManager.register_resource(&"roomkiosk", load("res://hh_kiosk_room/roomkiosk.tscn"))
