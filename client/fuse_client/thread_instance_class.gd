@abstract class_name NodeInstance
extends Node2D

func _ready() -> void:
	self.construct()

func _notification(what: int) -> void:
	if what == NOTIFICATION_PREDELETE:
		self.deconstruct()

@abstract func construct() -> void

@abstract func deconstruct() -> void
