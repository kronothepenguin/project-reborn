extends Node

func _ready() -> void:
	construct()

func _exit_tree() -> void:
	deconstruct()

func construct() -> void:
	MessageBus.register(&"enterRoom", show_mod_tool_button)
	MessageBus.register(&"leaveRoom", hide_mod_tool_button)
	MessageBus.register(&"userClicked", userClicked)
	MessageBus.register(&"gamesystem_constructed", hide_mod_tool_button)
	MessageBus.register(&"gamesystem_deconstructed", hide_mod_tool_button)
	
func deconstruct() -> void:
	MessageBus.unregister(&"enterRoom", show_mod_tool_button)
	MessageBus.unregister(&"leaveRoom", hide_mod_tool_button)
	MessageBus.unregister(&"userClicked", userClicked)
	MessageBus.unregister(&"gamesystem_constructed", hide_mod_tool_button)
	MessageBus.unregister(&"gamesystem_deconstructed", hide_mod_tool_button)

func show_mod_tool_button():
	if not get_tree().root.get_meta(&"session").has("user_rights"):
		return
	if not get_tree().root.get_meta(&"session").get("user_rights").has("fuse_kick"):
		return
	%ModToolButton.show()
	
func hide_mod_tool_button():
	%ModToolButton.hide()

func hide_alert():
	pass

func stop_alert():
	pass

func show_cry_window():
	pass

func userClicked():
	pass

func show_mod_tool_window() -> void:
	pass

func _on_modtool_button_pressed() -> void:
	show_mod_tool_window()
