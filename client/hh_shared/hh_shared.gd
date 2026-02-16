extends Node

func _ready() -> void:
	NodeManager.register_resource(&"hobba", load("res://hh_shared/hobba.tscn"))
	NodeManager.register_resource(&"error_report", load("res://hh_shared/error_report.tscn"))
	NodeManager.register_resource(&"external_link", load("res://hh_shared/external_link.tscn"))
	queue_free()
