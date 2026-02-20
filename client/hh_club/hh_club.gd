extends RefCounted

func _init() -> void:
	ResourcePackManager.add_resource(&"habbo_club", load("res://hh_club/club.tscn"))
