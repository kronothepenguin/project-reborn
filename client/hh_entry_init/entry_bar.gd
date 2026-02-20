extends ColorRect

var _friend_list_icon: InkTexture2D = InkTexture2D.new(load("res://hh_interface/579_friend_list_icon.png"), InkTexture2D.Ink.MATTE_8, Color.WHITE)
var _friend_list_icon_notification: InkTexture2D = InkTexture2D.new(load("res://hh_interface/579_friend_list_icon.png"), InkTexture2D.Ink.MATTE_8, Color.WHITE)

func set_own_habbo_name_text(name: String):
	%OwnHabboNameLabel.text = name

func set_own_habbo_mission_text(text: String):
	%OwnHabboMissionLabel.text = text

func set_update_habbo_id_text(text: String):
	%UpdateHabboIdLabel.text = text

func set_club_bottom_bar_text1(text: String):
	%ClubBottomBarLabel1.text = text
	
func set_club_bottom_bar_text2(text: String):
	%ClubBottomBarLabel2.text = text

func set_friend_list_icon(active: bool):
	if active:
		%FriendListButton.texture_normal = _friend_list_icon_notification
	else:
		%FriendListButton.texture_normal = _friend_list_icon


func _on_club_button_pressed() -> void:
	MessageBus.execute(&"show_clubinfo")

func _on_im_button_pressed() -> void:
	MessageBus.execute(&"toggle_im")

func _on_friend_list_button_pressed() -> void:
	MessageBus.execute(&"toggle_friend_list")

func _on_hotel_navigation_button_pressed() -> void:
	MessageBus.execute(&"show_hide_navigator")

func _on_events_button_pressed() -> void:
	MessageBus.execute(&"show_hide_roomevents")

func _on_catalogue_button_pressed() -> void:
	MessageBus.execute(&"show_hide_catalogue")

func _on_controller_button_pressed() -> void:
	MessageBus.execute(&"toggle_ig")

func _on_help_button_pressed() -> void:
	MessageBus.execute(&"openGeneralDialog", "help")
