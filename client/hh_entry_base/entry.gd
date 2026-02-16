extends NodeInstance

var entry_view: Node2D
var entry_bar: EntryBarControl

func construct():
	print("entry")
	# Interface
	BrokerManager.register(&"userlogin", show_entry_bar)
	BrokerManager.register(&"showHotelView", show_hotel)
	BrokerManager.register(&"IMStateChanged", update_im_icon)
	BrokerManager.execute(&"requestHotelView")
	
	# Component
	BrokerManager.register(&"enterRoom", leave_entry)
	BrokerManager.register(&"leaveRoom", enter_entry)
	BrokerManager.register(&"Initialize", update_state)

func deconstruct():
	# Interface
	BrokerManager.unregister(&"userlogin", show_entry_bar)
	BrokerManager.unregister(&"showHotelView", show_hotel)
	BrokerManager.unregister(&"IMStateChanged", update_im_icon)
	
	hide_all()
	
	# Component
	BrokerManager.unregister(&"enterRoom", leave_entry)
	BrokerManager.unregister(&"leaveRoom", enter_entry)
	BrokerManager.unregister(&"Initialize", update_state)

func show_hotel():
	if entry_view == null:
		var scene := VisualizerManager.load("entry.visual")
		entry_view = scene.instantiate()
		get_tree().current_scene.add_child(entry_view)
	
	var player := entry_view.get_node("AnimationPlayer") as AnimationPlayer
	player.play("open_view")

func hide_hotel():
	if entry_view != null:
		var player := entry_view.get_node("AnimationPlayer") as AnimationPlayer
		player.play("close_view")
		await player.animation_finished
		
		entry_view.queue_free()
		entry_view = null

func show_entry_bar():
	var scene = WindowManager.load("entry_bar.window")
	entry_bar = scene.instantiate()
	get_tree().current_scene.add_child(entry_bar)
	#tWndObj.registerProcedure(#eventProcEntryBar, me.getID(), #mouseUp)
	#me.addAnimTask(#animEntryBar)
	
	update_im_icon()
	
	#EventBroker.update_credit_count.connect(update_credit_count)
	#EventBroker.update_friend_list_icon.connect(update_friend_list_icon)
	#EventBroker.update_figure_data.connect(update_figure_data)
	#EventBroker.update_club_status.connect(update_club_status)
	
	update_entry_bar()
	
func hide_entry_bar():
	#EventBroker.update_credit_count.disconnect(update_credit_count)
	#EventBroker.update_friend_list_icon.disconnect(update_friend_list_icon)
	#EventBroker.update_figure_data.disconnect(update_figure_data)
	#EventBroker.update_club_status.disconnect(update_club_status)
	
	if entry_bar != null:
		entry_bar.queue_free()
		entry_bar = null

func hide_all():
	hide_hotel()
	hide_entry_bar()

func update_credit_count(count: int):
	pass

func update_friend_list_icon(active: bool):
	entry_bar.set_friend_list_icon(active)

func update_figure_data():
	create_my_head_icon()

func update_club_status(status: Dictionary):
	if status is not Dictionary:
		return
	if not status.has("days_left") or not status.has("prepaid_periods"):
		return
	
	var days_left: int = status["days_left"]
	var prepaid_periods: int = status["prepaid_periods"]
	
	var days: int = days_left + 31 * prepaid_periods
	
	if prepaid_periods < 0:
		entry_bar.set_club_bottom_bar_text1("club_habbo.bottombar.text.member")
		entry_bar.set_club_bottom_bar_text2("club_member")
	elif days == 0:
		entry_bar.set_club_bottom_bar_text1("club_habbo.bottombar.text.notmember")
		entry_bar.set_club_bottom_bar_text2("club_habbo.bottombar.link.notmember")
	else:
		entry_bar.set_club_bottom_bar_text1("club_habbo.bottombar.text.member")
		entry_bar.set_club_bottom_bar_text2("club_habbo.bottombar.link.member")

func create_my_head_icon():
	pass

func update_entry_bar():
	var session: Dictionary = get_tree().root.get_meta("session")
	var username: String = session["user_name"]
	var text: String = session["user_customData"]
	var credits: int = session["user_walletbalance"] if session.has("user_walletbalance") else "loading"
	var club: Dictionary = session["club_status"] if session.has("club_status") else "loading"
	
	entry_bar.set_own_habbo_name_text(username)
	entry_bar.set_own_habbo_mission_text(text)
	
	update_credit_count(credits)
	BrokerManager.execute(&"messageUpdateRequest")
	BrokerManager.execute(&"buddyUpdateRequest")
	update_club_status(club)
	create_my_head_icon()
	
	#EventBroker.message_update_request.emit()
	#EventBroker.buddy_update_request.emit()

func update_im_icon():
	pass

# Component
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
