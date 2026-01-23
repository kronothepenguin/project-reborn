class_name CoreThread
extends Node

enum State {
	LOAD_VARIABLES,
	LOAD_PARAMS,
	LOAD_TEXTS,
	LOAD_CASTS,
	VALIDATE_RESOURCES,
	INIT_THREADS,
}

var logo: Sprite2D
var fading_logo: bool
var logo_start_time: int

var crap_fix: Sprite2D
var crap_fixing: bool
var crap_fix_region_invalidated: bool

func _ready() -> void:
	construct()

func _notification(what: int) -> void:
	if what == NOTIFICATION_PREDELETE:
		deconstruct()

func _process(delta: float) -> void:
	update()

func construct():
	var session: Dictionary = {
		"client_startdate": Time.get_date_string_from_system(true),
		"client_starttime": Time.get_time_string_from_system(true),
		"client_version": "",
		"client_url": "",
		"client_lastclick": null,
	}
	EventBroker.RequestHotelView.connect(init_transfer_to_hotel_view)
	EventBroker.InvalidateCrapFixRegion.connect(invalidate_crap_fixer)
	fading_logo = false
	logo_start_time = 0
	var texture: Texture2D = load("res://fuse_client/89_crap.fixer.png")
	crap_fix = Sprite2D.new()
	crap_fix.texture = texture
	crap_fix.scale = Vector2(560 / texture.get_width(), 75 / texture.get_height())
	crap_fix.z_index = -2000000000
	crap_fix.position = Vector2(-1, 0)
	crap_fix.visible = false
	get_tree().current_scene.add_child(crap_fix)
	crap_fixing = false
	crap_fix_region_invalidated = true
	#TODO: fullscreen sprite
	return self.update_state(State.LOAD_VARIABLES)

func deconstruct():
	print("deconstruct")
	#TODO: timeout
	EventBroker.InvalidateCrapFixRegion.disconnect(invalidate_crap_fixer)
	crap_fix.queue_free()
	crap_fix = null
	return self.hide_logo()

func show_logo():
	var texture: Texture2D = load("res://Internal_4_Logo.png")
	
	logo = Sprite2D.new()
	logo.texture = texture
	
	logo.modulate.a = 0.9
	logo.z_index = -20000001
	
	var viewport_size := get_viewport().get_visible_rect().size
	logo.position = Vector2(
		viewport_size.x / 2,
		(viewport_size.y / 2) - texture.get_height()
	)
	
	get_tree().current_scene.add_child(logo)
	
	logo_start_time = Time.get_ticks_msec()

func hide_logo():
	logo.queue_free()
	logo = null

func init_transfer_to_hotel_view():
	var show_logo_for_ms := 1000
	var logo_now_show_ms := Time.get_ticks_msec() - logo_start_time
	if logo_now_show_ms < show_logo_for_ms:
		await get_tree().create_timer((show_logo_for_ms - logo_now_show_ms) / 1000.0).timeout
	await get_tree().create_timer(2).timeout
	init_update()

func init_update():
	fading_logo = true
	set_process(true)

func invalidate_crap_fixer():
	crap_fix_region_invalidated = true

func update():
	if fading_logo:
		var blend := 0
		if logo != null:
			logo.modulate.a -= 0.1
			blend = logo.modulate.a
		if blend <= 0:
			if not crap_fixing:
				set_process(false)
			fading_logo = false
			self.hide_logo()
			EventBroker.ShowHotelView.emit()
			#TODO: callJavaScriptFunction("clientReady")
	if crap_fixing:
		if crap_fix != null:
			if crap_fix_region_invalidated:
				crap_fix.visible = true
				match crap_fix.position.x:
					0:
						crap_fix.position = Vector2(-1, 0)
					-1:
						crap_fix.position = Vector2(0, 0)
					_:
						crap_fix.position = Vector2(0, 0)
				crap_fix_region_invalidated = 0

func asset_download_callbacks(asset_id: State, success: bool):
	match asset_id:
		State.LOAD_VARIABLES:
			self.update_state(State.LOAD_PARAMS)
		State.LOAD_TEXTS:
			self.update_state(State.LOAD_CASTS)
		State.LOAD_CASTS:
			self.update_state(State.VALIDATE_RESOURCES)
		State.VALIDATE_RESOURCES:
			self.update_state(State.VALIDATE_RESOURCES)

func update_state(state: State):
	match state:
		State.LOAD_VARIABLES:
			self.show_logo()
			#TODO: sw parameters
			#TODO: external_variables.txt
			#TODO: return registerDownloadCallback(tMemNum, #assetDownloadCallbacks, me.getID(), tstate)
		State.LOAD_PARAMS:
			#TODO: dump external variables
			#TODO: set sw parameters
			#puppetTempo(getIntVariable("system.tempo", 30))
			self.update_state(State.LOAD_TEXTS)
		State.LOAD_TEXTS:
			if false:
				self.update_state(State.LOAD_CASTS)
			#TODO: return registerDownloadCallback(tMemNum, #assetDownloadCallbacks, me.getID(), tstate)
		State.LOAD_CASTS:
			#TODO: dump texts
			#TODO: check for cast.entry.#
			if 0 > 0:
				#TODO: return registerCastloadCallback(tLoadID, #assetDownloadCallbacks, me.getID(), tstate)
				pass
			else:
				return self.update_state(State.INIT_THREADS)
		State.VALIDATE_RESOURCES:
			#TODO: check for cast.entry.#
			if 0 > 0:
				#TODO: return registerCastloadCallback(tLoadID, #assetDownloadCallbacks, me.getID(), tstate)
				pass
			else:
				return self.update_state(State.INIT_THREADS)
		State.INIT_THREADS:
			#TODO: getThreadManager().initAll()
			EventBroker.Initialize.emit("initialize")
	
func fullscreen_refresh():
	pass
