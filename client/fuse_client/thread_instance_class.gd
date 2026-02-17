@abstract class_name NodeInstance
extends Node

func _ready() -> void:
	self.construct()

func _notification(what: int) -> void:
	if what == NOTIFICATION_PREDELETE:
		self.deconstruct()

@abstract func construct() -> void

@abstract func deconstruct() -> void
