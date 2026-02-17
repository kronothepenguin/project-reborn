extends Node

func init_core() -> bool:
	VariableContainer.dump("res://System Props.txt")
	DownloadManager.setup()
	
	# Unload PCK maybe?
	# resetCastLibs(0, 0)
	
	# Can be use to check already downloaded files and clean local cache
	#if not getResourceManager().preIndexMembers() then
		#return stopClient()
	#end if
	
	# dumpTextField("System Texts")
	
	#if not getThreadManager().create(#core, #core) then
		#return stopClient()
	#end if
	NodeManager.create(&"core")
	
	return true

func stop_client() -> void:
	if OS.is_debug_build():
		pass

func reset_client() -> void:
	get_tree().reload_current_scene()
	pass
