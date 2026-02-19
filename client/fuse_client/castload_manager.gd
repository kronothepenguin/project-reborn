extends Node

const INVALID_ID = 0

var _task_list := {}
var _id_count := 0

enum { _STATUS_LOADING, _STATUS_COMPLETED }

func start_pck_load(pcks: Array[String], permanent: bool = false, add = false, do_indexing = true) -> int:
	if len(pcks) == 0:
		return INVALID_ID
	
	_id_count = _id_count + 1 if _id_count + 1 != INVALID_ID else _id_count + 2
	var id := _id_count
	
	var task = {
		id = id,
		status = _STATUS_LOADING if not OS.has_feature("editor") else _STATUS_COMPLETED,
		pcks = pcks.duplicate(),
		callback = null,
		permanent = permanent,
	}
	_task_list[id] = task
	
	if not OS.has_feature("editor"):
		for pck in task["pcks"]:
			var url := _create_url(pck)
			HTTPRequestPool.request(url, _on_request_completed.bind(task, pck))
	
	return id

func register_callback(id: int, method: Callable, argument: Variant):
	if not _task_list.has(id):
		return
	pass

func _create_url(pck: String) -> String:
	var filename := pck.trim_prefix("/")
	var extension := ".pck"
	
	var index := filename.rfind(".")
	if index > 0:
		filename = filename.substr(0, index)
		extension = filename.substr(index)
	
	var base := SpecialServices.get_movie_path()
	
	return base + filename + extension

func _on_request_completed(result: int, response_code: int, headers: PackedStringArray, body: PackedByteArray, task: Dictionary, pck: String):
	var success: bool = result == HTTPRequest.RESULT_SUCCESS and response_code == 200
	
	var filepath := "user://" + pck + ".pck"
	var file := FileAccess.open(filepath, FileAccess.WRITE)
	if file:
		file.store_buffer(body)
		file.close()
		ProjectSettings.load_resource_pack(filepath)
	
	task["pcks"].erase(pck)
	if len(task["pcks"]) == 0:
		task["status"] = &"completed"
		_on_task_completed.call_deferred(task, success)

func _on_task_completed(task: Dictionary, success: bool):
	var callback = task["callback"]
	if callback is Dictionary:
		callback["method"].call(callback["argument"], success)
