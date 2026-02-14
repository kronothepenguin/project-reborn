extends Node

func _ready() -> void:
	var conn := Connection.new()
	add_child(conn)
	
	get_tree().root.set_meta("info", conn)
	
	var ok := init_core()
	if not ok:
		stop_client()

func init_core() -> bool:
	VariableContainer.dump("res://System Props.txt")
	
	# Unload PCK maybe?
	# resetCastLibs(0, 0)
	
	# Looks like director specific stuff to reserve memory
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
