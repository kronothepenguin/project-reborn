extends Node2D

func _ready() -> void:
	NodeManager.register_resource(&"core", CoreThread)
	
	ClientInitialization.init_core()
