class_name EntryBarControl
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
