class_name EntryBarControl
extends ColorRect

@onready var friend_list_button: TextureButton = %FriendListButton

func set_own_habbo_name_text(name: String):
	%OwnHabboNameText.text = name

func set_own_habbo_mission_text(text: String):
	%OwnHabboMissionText.text = text

func set_update_habbo_id_text(text: String):
	%UpdateHabboIdText.text = text

func set_club_bottom_bar_text1(text: String):
	%ClubBottomBarText1.text = text
	
func set_club_bottom_bar_text2(text: String):
	%ClubBottomBarText2.text = text

func set_friend_list_icon(active: bool):
	if active:
		%FriendListButton.texture_normal = ImageTexture.create_from_image(load("res://hh_entry_init/friend_list_icon_notification.tres"))
	else:
		%FriendListButton.texture_normal = ImageTexture.create_from_image(load("res://hh_entry_init/friend_list_icon.tres"))
