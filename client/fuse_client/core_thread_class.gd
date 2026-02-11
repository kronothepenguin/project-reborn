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
	construct()

func _notification(what: int) -> void:
	if what == NOTIFICATION_PREDELETE:
		deconstruct()

func _process(_delta: float) -> void:
	update()

func construct():
	var session := {}
	session["client_startdate"] = Time.get_date_string_from_system(true)
	session["client_starttime"] = Time.get_unix_time_from_system()
	session["client_version"] = VariableContainer.get_var("system.version")
	session["client_url"] = "" # JavaScript.Eval
	session["client_lastclick"] = null
	get_tree().root.set_meta("session", session)
	
	#createObject(#headers, getClassVariable("variable.manager.class"))
	#createObject(#classes, getClassVariable("variable.manager.class"))
	#createObject(#cache, getClassVariable("variable.manager.class"))
	
	EventBroker.request_hotel_view.connect(init_transfer_to_hotel_view)
	
	# TODO: better use godot natives
	fading_logo = false
	logo_start_time = 0
	return self.update_state(State.LOAD_VARIABLES)

func deconstruct():
	#TODO: timeout
	
	EventBroker.request_hotel_view.disconnect(init_transfer_to_hotel_view)
	
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
			EventBroker.show_hotel_view.emit()
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
				var param_bundle := Director.external_param_value("sw" + str(i))
				if param_bundle.length() == 0:
					continue
				for param in param_bundle.split(";"):
					var index := param.find("=")
					if index == -1:
						continue
					var key = param.substr(0, index)
					var value = param.substr(index + 1)
					match key:
						"client.fatal.error.url", "client.allow.cross.domain", "client.notify.cross.domain", "external.variables.txt", "processlog.url", "account_id":
							VariableContainer.set_var(key, value)
			
			#TODO: dynamic load external vars
			#external_variables = load("res://external_variables.txt")
			#TODO: return registerDownloadCallback(tMemNum, #assetDownloadCallbacks, me.getID(), tstate)
			return self.asset_download_callbacks(state, true)
		State.LOAD_PARAMS:
			VariableContainer.dump("res://external_variables.txt")
			for i in range(1, 10):
				var param_bundle := Director.external_param_value("sw" + str(i))
				if param_bundle.length() == 0:
					continue
				for param in param_bundle.split(";"):
					var index := param.find("=")
					if index == -1:
						continue
					var key := param.substr(0, index)
					var value := param.substr(index + 1)
					VariableContainer.set_var(key, value)
			
			var session: Dictionary = get_tree().root.get_meta("session")
			if VariableContainer.exists("client.reload.url"):
				session["client_url"] = VariableContainer.get_var("client.reload.url")
			
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
				#tLoadID = startCastLoad(tCastList, 1, VOID, VOID, 1)
				#if getVariable("loading.bar.active") then
				  #showLoadingBar(tLoadID, [#buffer: #window, #locY: 500, #width: 300])
				#end if
				
				return asset_download_callbacks(state, true)
				#return registerCastloadCallback(tLoadID, #assetDownloadCallbacks, me.getID(), tstate)
			else:
				return self.update_state(State.INIT_THREADS)
		State.VALIDATE_RESOURCES:
			#TODO: check for cast.entry.#
			var cast_list := []
			var i := 1
			while true:
				if not VariableContainer.exists("cast.entry." + str(i)):
					break
				var filename: String = VariableContainer.get_var("cast.entry." + str(i))
				cast_list.append(filename)
				i = i + 1
			
			var new_list := cast_list
			#if count(tCastList) > 0 then
				#repeat with tCast in tCastList
				  #if not castExists(tCast) then
					#tNewList.add(tCast)
				  #end if
				#end repeat
			#end if
			
			if new_list.size() > 0:
				#TODO: return registerCastloadCallback(tLoadID, #assetDownloadCallbacks, me.getID(), tstate)
				return self.update_state(State.INIT_THREADS)
			else:
				return self.update_state(State.INIT_THREADS)
		State.INIT_THREADS:
			var cast_list := []
			var i := 1
			while true:
				if not VariableContainer.exists("cast.entry." + str(i)):
					break
				var filename: String = VariableContainer.get_var("cast.entry." + str(i))
				cast_list.append(filename)
				i = i + 1
			
			# equivalent of getThreadManager().initAll()
			for cast in cast_list:
				var path: String = "res://" + cast + "/" + cast + ".tscn"
				if !FileAccess.file_exists(path):
					continue
				var node := load(path)
				var instance = node.instantiate()
				get_tree().current_scene.add_child(instance)
			
			EventBroker.initialize.emit("initialize")
