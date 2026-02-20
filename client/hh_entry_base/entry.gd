extends Node

var _entry_view: Node2D

func _ready() -> void:
	construct_interface()
	construct_component()

func _exit_tree() -> void:
	deconstruct_interface()
	deconstruct_component()

# Interface
func construct_interface():
	MessageBus.register(&"userlogin", show_entry_bar)
	MessageBus.register(&"showHotelView", show_hotel)
	MessageBus.register(&"IMStateChanged", update_im_icon)
	MessageBus.execute(&"requestHotelView")

func deconstruct_interface():
	MessageBus.unregister(&"userlogin", show_entry_bar)
	MessageBus.unregister(&"showHotelView", show_hotel)
	MessageBus.unregister(&"IMStateChanged", update_im_icon)
	
	hide_all()

func show_hotel():
	if _entry_view == null:
		var path: String = VariableContainer.get_var("entry.visual")
		var scene: PackedScene = load(path)
		_entry_view = scene.instantiate()
		add_child(_entry_view)
		move_child(_entry_view, %Rect.get_index())
	
	%EntryAnimationPlayer.play("open_view")

func hide_hotel():
	if _entry_view != null:
		%EntryAnimationPlayer.play("close_view")
		await %EntryAnimationPlayer.animation_finished
		
		_entry_view.queue_free()
		_entry_view = null

func show_entry_bar():
	if not %EntryBar.is_visible_in_tree():
		%EntryBar.show()
		%EntryBarAnimationPlayer.play("animate_entry_bar")
	
	# TODO: disable events
	
	update_im_icon()
	# TODO: room icon bar manager
	MessageBus.register(&"updateCreditCount", update_credit_count)
	MessageBus.register(&"updateFriendListIcon", update_friend_list_icon)
	MessageBus.register(&"updateFigureData", update_entry_bar)
	MessageBus.register(&"updateClubStatus", update_club_status)
	update_entry_bar()
	
func hide_entry_bar():
	MessageBus.unregister(&"updateCreditCount", update_credit_count)
	MessageBus.unregister(&"updateFriendListIcon", update_friend_list_icon)
	MessageBus.unregister(&"updateFigureData", update_entry_bar)
	MessageBus.unregister(&"updateClubStatus", update_club_status)
	
	%EntryBar.hide()
	
	# TODO: room icon bar manager	

func hide_all():
	hide_hotel()
	hide_entry_bar()

func update_entry_bar():
	var session := SpecialServices.get_session()
	var username: String = session["user_name"]
	var text: String = session["user_customData"]
	var credits: int = session["user_walletbalance"] if session.has("user_walletbalance") else "loading"
	var club: Dictionary = session["club_status"] if session.has("club_status") else "loading"
	
	%EntryBar.set_own_habbo_name_text(username)
	%EntryBar.set_own_habbo_mission_text(text)
	
	# TODO: deactive all icons if first init
	
	update_credit_count(credits)
	MessageBus.execute(&"messageUpdateRequest")
	MessageBus.execute(&"buddyUpdateRequest")
	update_club_status(club)
	create_my_head_icon()

func update_credit_count(_count: int):
	pass

func update_club_status(status: Dictionary):
	if status is not Dictionary:
		return
	if not status.has("days_left") or not status.has("prepaid_periods"):
		return
	
	var days_left: int = status["days_left"]
	var prepaid_periods: int = status["prepaid_periods"]
	
	var days: int = days_left + 31 * prepaid_periods
	
	if prepaid_periods < 0:
		%EntryBar.set_club_bottom_bar_text1("club_habbo.bottombar.text.member")
		%EntryBar.set_club_bottom_bar_text2("club_member")
	elif days == 0:
		%EntryBar.set_club_bottom_bar_text1("club_habbo.bottombar.text.notmember")
		%EntryBar.set_club_bottom_bar_text2("club_habbo.bottombar.link.notmember")
	else:
		%EntryBar.set_club_bottom_bar_text1("club_habbo.bottombar.text.member")
		%EntryBar.set_club_bottom_bar_text2("club_habbo.bottombar.link.member")

func update_friend_list_icon(active: bool):
	%EntryBar.set_friend_list_icon(active)

func bounce_im_icon():
	pass

func create_my_head_icon():
	pass

func update_im_icon():
	pass

func flash_im_icon():
	pass

# Component
func construct_component():
	MessageBus.register(&"enterRoom", leave_entry)
	MessageBus.register(&"leaveRoom", enter_entry)
	MessageBus.register(&"Initialize", update_state)

func deconstruct_component():
	MessageBus.unregister(&"enterRoom", leave_entry)
	MessageBus.unregister(&"leaveRoom", enter_entry)
	MessageBus.unregister(&"Initialize", update_state)
	update_state("reset")

func enter_entry():
	update_state(&"hotelView")
	update_state(&"entryBar")
	
func leave_entry():
	update_state("reset")
	
func update_state(state: StringName):
	match state:
		"reset":
			hide_all()
		&"hotelView", "initialize":
			show_hotel()
		&"entryBar":
			show_entry_bar()
