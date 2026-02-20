extends Node

enum Error { ERR_HTTP_RESULT, ERR_HTTP_STATUS_CODE, ERR_FILE }

var _tasks: Dictionary[int, Object] = {}

func load_batch(pcks: Array[String], success: Callable, failure: Callable) -> int:
	var task = Object.new()
	var pcks_clone := pcks.duplicate()
	task.set_meta("pcks", pcks_clone)
	task.set_meta("success", success)
	task.set_meta("failure", failure)
	_tasks[task.get_instance_id()] = task
	
	for pck in pcks_clone.duplicate():
		_start_pck_load(task.get_instance_id(), pck)
	
	return task.get_instance_id()

func _start_pck_load(id: int, pck: String):
	var filename := pck
	var extension := ".pck"
	var index := filename.find(".")
	if index > 0:
		filename = pck.substr(0, index)
		extension = pck.substr(index)
	
	var base_url := SpecialServices.get_movie_path()
	var url := base_url + filename + extension
	
	if url.begins_with("http"):
		HTTPRequestPool.request(url, _on_request_completed.bind(id, pck))
	elif OS.has_feature("editor"):
		_pck_download_completed(id, pck)

func _on_request_completed(result: int, response_code: int, _headers: PackedStringArray, body: PackedByteArray, id: int, pck: String) -> void:
	var callback = _tasks[id].get_meta("failure")
	
	if result != HTTPRequest.RESULT_SUCCESS:
		if callback is Callable:
			callback.call_deferred(pck, Error.ERR_HTTP_RESULT, result)
		return
	
	if response_code != 200:
		if callback is Callable:
			callback.call_deferred(pck, Error.ERR_HTTP_STATUS_CODE, response_code)
		return
	
	var filename := pck
	var extension := ".pck"
	var index := filename.find(".")
	if index > 0:
		filename = pck.substr(0, index)
		extension = pck.substr(index)
	
	var path := "user://" + pck + extension
	var f := FileAccess.open(path, FileAccess.WRITE)
	if f == null:
		if callback is Callable:
			callback.call_deferred(pck, Error.ERR_FILE, FileAccess.get_open_error())
		return
	f.store_buffer(body)
	f.close()
	
	ProjectSettings.load_resource_pack(path)
	_pck_download_completed(id, pck)

func _pck_download_completed(id: int, pck: String) -> void:
	ResourcePackManager.init_resource_pack(pck)
	
	var task: Object = _tasks[id]
	var pcks: Array[String] = task.get_meta("pcks")
	
	pcks.erase(pck)
	if len(pcks) == 0:
		_tasks.erase(id)
		var callback = task.get_meta("success")
		if callback is Callable:
			callback.call_deferred(id)
