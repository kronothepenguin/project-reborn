extends RefCounted

func _init() -> void:
	NodeManager.register_resource(&"habbo_club", load("res://hh_club/club.tscn"))
