extends Node2D

enum _State {
	LOAD_PARAMS,
	LOAD_VARIABLES,
	WAIT_VARIABLES,
	LOAD_TEXTS,
	WAIT_TEXTS,
	LOAD_RESOURCE_PACKS,
	WAIT_RESOURCE_PACKS,
	INIT_MODULES,
	ERROR,
	DONE,
}

var _state: _State = _State.LOAD_VARIABLES
var _loaded: bool = false
var _err: Error = OK

func _ready() -> void:
	VariableContainer.dump("res://System Props.txt")
	
	SpecialServices.init_session()
	
	MessageBus.create(&"Initialize")
	MessageBus.register(&"requestHotelView", _init_transfer_to_hotel_view)

func _process(_delta: float) -> void:
	_state_machine()
	
	if _state == _State.ERROR or _state == _State.DONE:
		set_process(false)

func _init_transfer_to_hotel_view():
	%AnimationPlayer.play("fade_logo")

func _on_animation_player_animation_finished(_anim_name: StringName) -> void:
	MessageBus.execute(&"showHotelView")
	if OS.has_feature("web"):
		JavaScriptBridge.eval("clientReady()", true)

func _state_machine():
	match _state:
		_State.LOAD_PARAMS:
			_state = _load_params_state()
		
		_State.LOAD_VARIABLES:
			_state = _load_variables_state()
		_State.WAIT_VARIABLES:
			_state = _wait_variables_state()
		
		_State.LOAD_TEXTS:
			_state = _load_text_state()
		
		_State.LOAD_RESOURCE_PACKS:
			_state = _load_resource_packs()
		_State.WAIT_RESOURCE_PACKS:
			_state = _wait_resource_packs()
			
		_State.INIT_MODULES:
			_state = _init_modules_state()

func _load_params_state() -> _State:
	for i in range(1, 10):
		var param_bundle := Director.external_param_value("sw" + str(i))
		for param in param_bundle.split(";"):
			var index := param.find("=")
			if index == -1:
				continue
			var key := param.substr(0, index)
			var value := param.substr(index + 1)
			VariableContainer.set_var(key, value)
	return _State.LOAD_VARIABLES

func _on_external_variables_request_completed(result: int, _response_code: int, _headers: PackedStringArray, body: PackedByteArray) -> void:
	if result != HTTPRequest.RESULT_SUCCESS:
		push_error("external variables result: ", result)
		_err = FAILED
		return
	
	var path := "user://external_variables.txt"
	var f := FileAccess.open(path, FileAccess.WRITE)
	if f == null:
		_err = FileAccess.get_open_error()
		return
	f.store_buffer(body)
	f.close()
	
	_loaded = true

func _load_variables_state() -> _State:
	var url := SpecialServices.get_ext_var_path()
	if url.begins_with("res://"):
		VariableContainer.dump(url)
		return _State.LOAD_RESOURCE_PACKS # TODO: load texts
	elif url.begins_with("http"):
		_loaded = false
		HTTPRequestPool.request(url, _on_external_variables_request_completed)
		return _State.WAIT_VARIABLES
	
	push_error("error ", _state)
	return _State.ERROR

func _wait_variables_state() -> _State:
	if _err != OK:
		return _State.ERROR
	
	if not _loaded:
		return _State.WAIT_VARIABLES
	
	VariableContainer.dump("user://external_variables.txt")
	if VariableContainer.exists("client.reload.url"):
		SpecialServices.set_session_data("client_url", VariableContainer.get_var("client.reload.url"))
	return _State.LOAD_RESOURCE_PACKS # TODO: load texts

func _load_text_state() -> _State:
	return _State.ERROR

func _on_resource_packs_success(id: int) -> void:
	_loaded = true

func _on_resource_packs_failure(pck: String, err: ResourcePackLoader.Error, code: Variant) -> void:
	push_error("error loading ", pck)
	_err = FAILED

func _load_resource_packs() -> _State:
	var pack_list: Array[String] = []
	var i := 1
	while true:
		if not VariableContainer.exists("cast.entry." + str(i)):
			break
		var filename: String = VariableContainer.get_var("cast.entry." + str(i))
		pack_list.append(filename)
		i = i + 1
	print(pack_list)
	
	if len(pack_list) > 0:
		_loaded = false
		ResourcePackLoader.load_batch(pack_list, _on_resource_packs_success, _on_resource_packs_failure)
		return _State.WAIT_RESOURCE_PACKS
	
	return _State.INIT_MODULES

func _wait_resource_packs() -> _State:
	if _err != OK:
		return _State.ERROR
	
	if not _loaded:
		return _State.WAIT_RESOURCE_PACKS
	
	return _State.INIT_MODULES

func _init_modules_state() -> _State:
	ResourcePackManager.create_all()
	MessageBus.execute(&"Initialize", "initialize")
	return _State.DONE
