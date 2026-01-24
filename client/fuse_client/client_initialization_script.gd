extends Node

func _ready() -> void:
	var ok := init_core()
	if not ok:
		stop_client()

func init_core() -> bool:
	# dumpVariableField("System Props")
	# resetCastLibs(0, 0)
	# getResourceManager().preIndexMembers()
	# dumpTextField("System Texts")
	var core_thread := CoreThread.new()
	get_tree().current_scene.add_child(core_thread)
	return true

func stop_client() -> void:
	if OS.is_debug_build():
		pass

func reset_client() -> void:
	get_tree().reload_current_scene()
	pass
