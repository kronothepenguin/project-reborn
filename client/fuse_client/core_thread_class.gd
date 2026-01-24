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

var external_variables: Resource

func _ready() -> void:
	print("ready")
	construct()

func _notification(what: int) -> void:
	if what == NOTIFICATION_PREDELETE:
		deconstruct()

func _process(_delta: float) -> void:
	update()

func construct():
	#var session: Dictionary = {
		#"client_startdate": Time.get_date_string_from_system(true),
		#"client_starttime": Time.get_time_string_from_system(true),
		#"client_version": "",
		#"client_url": "",
		#"client_lastclick": null,
	#}
	EventBrokerBehavior.request_hotel_view.connect(init_transfer_to_hotel_view)
	fading_logo = false
	logo_start_time = 0
	return self.update_state(State.LOAD_VARIABLES)

func deconstruct():
	#TODO: timeout
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
	return true

func hide_logo():
	if logo != null:
		logo.queue_free()
		logo = null
	return true

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
	pass

func update():
	if fading_logo:
		var blend := 0.0
		if logo != null:
			logo.modulate.a -= 0.1
			blend = logo.modulate.a
		if blend <= 0:
			set_process(false)
			fading_logo = false
			self.hide_logo()
			EventBrokerBehavior.show_hotel_view.emit()
			if OS.has_feature("web"):
				JavaScriptBridge.eval("clientReady()", true)

func asset_download_callbacks(asset_id: State, success: bool):
	if not success:
		match asset_id:
			State.LOAD_VARIABLES, State.LOAD_TEXTS, State.LOAD_CASTS:
				#TODO: fatal
				pass
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
			for i in range(1, 10):
				print(System.external_param_value("sw" + str(i)))
			#TODO: dynamic load external vars
			#external_variables = load("res://external_variables.txt")
			#TODO: return registerDownloadCallback(tMemNum, #assetDownloadCallbacks, me.getID(), tstate)
			return self.asset_download_callbacks(state, true)
		State.LOAD_PARAMS:
			VariableContainer.dump("res://external_variables.txt")
			for i in range(1, 10):
				var ext_param := System.external_param_value("sw" + str(i))
				var params := ext_param.split(";")
				for param in params:
					var idx := param.find("=")
					if idx == -1:
						continue
					var key := param.substr(0, idx)
					var value := param.substr(idx + 1)
					VariableContainer.set_var(key, value)
			#if variableExists("client.reload.url") then
				#getObject(#session).set("client_url", obfuscate(getVariable("client.reload.url")))
	  		#end if
			self.update_state(State.LOAD_TEXTS)
		State.LOAD_TEXTS:
			#tURL = getVariable("external.texts.txt")
			#tMemName = tURL
			#if tMemName = EMPTY then
			#return me.updateState("load_casts")
			#end if
			#tMemNum = queueDownload(tURL, tMemName, #field)
			#TODO: return registerDownloadCallback(tMemNum, #assetDownloadCallbacks, me.getID(), tstate)
			self.asset_download_callbacks(state, true)
		State.LOAD_CASTS:
			#TODO: dump texts
			var cast_list := []
			var i := 1
			while true:
				if not VariableContainer.exists("cast.entry." + str(i)):
					break
				var filename: String = VariableContainer.get_var("cast.entry." + str(i))
				cast_list.append(filename)
				i = i + 1
			print(cast_list)
			if cast_list.size() > 0:
				for cast in cast_list:
					var path: String = "res://" + cast + "/" + cast + ".tscn"
					if !FileAccess.file_exists(path):
						continue
					var scene := load(path)
					var instance = scene.instantiate()
					get_tree().current_scene.add_child(instance)
				#tLoadID = startCastLoad(tCastList, 1, VOID, VOID, 1)
				#if getVariable("loading.bar.active") then
				  #showLoadingBar(tLoadID, [#buffer: #window, #locY: 500, #width: 300])
				#end if
				#return registerCastloadCallback(tLoadID, #assetDownloadCallbacks, me.getID(), tstate)
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
			EventBrokerBehavior.initialize.emit("initialize")
	
func fullscreen_refresh():
	pass
