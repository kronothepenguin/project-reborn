extends RefCounted

func _init() -> void:
	ResourcePackManager.add_resource(&"hobba", load("res://hh_shared/hobba.tscn"))
	ResourcePackManager.add_resource(&"error_report", load("res://hh_shared/error_report.tscn"))
	ResourcePackManager.add_resource(&"external_link", load("res://hh_shared/external_link.tscn"))
