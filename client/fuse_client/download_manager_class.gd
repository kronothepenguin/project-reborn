extends Node

enum { DOWNLOAD_HTTP_COOKIE, DOWNLOAD_HTTP_REQUEST }

var _task_queue := {}
var _active_tasks := {}
var _received_tasks := []
var _complete_tasks := []

var _http_requests := []

func setup():
	var count: int = VariableContainer.get_var("net.operation.count")
	for i in range(count):
		var request := HTTPRequest.new()
		add_child(request)
		_http_requests.append(request)

func queue(uri: String, mem_name: String = uri, type: StringName = &"", force: bool = false, download_method: int = DOWNLOAD_HTTP_REQUEST, redirect_type = null, target = null) -> int:
	#print(type) # unused in godot, there is not need to preallocate memory
	uri = SpecialServices.get_predefined_url(uri)
	# TODO: cross-domain check & notify
	if _task_queue.has(mem_name) or _active_tasks.has(mem_name):
		ErrorManager.error(self, "File already downloading: %s" % mem_name, &"queue", ErrorManager.Level.MINOR)
		return -1
	
	var mem_num: int = ResourceUID.INVALID_ID
	if Director.member_exists(mem_name):
		if force:
			mem_num = Director.getmemnum(mem_name)
		else:
			return Director.getmemnum(mem_name)
	else:
		mem_num = Director.create_member(mem_name, type)
	
	if mem_num == ResourceUID.INVALID_ID:
		ErrorManager.error(self, "Failed to create member!", &"queue", ErrorManager.Level.MAJOR)
		return mem_num
	
	_received_tasks.append(mem_name)
	var temp_task := {
		"uri": uri,
		"memNum": mem_num,
		"type": type,
		"callback": null,
		"downloadMethod": download_method,
		"redirectType": redirect_type,
		"target": target,
	}
	_task_queue[mem_name] = temp_task
	update_queue()
	return mem_num

func register_callback(mem_name_or_num: Variant, method: Callable, argument: Variant):
	var task_data = search_task(mem_name_or_num)
	if not task_data:
		method.call(argument, false)
		return
	
	match task_data["status"]:
		&"complete":
			method.call(argument, true)
		&"queue":
			_task_queue[task_data["name"]]["callback"] = { &"method": method, &"argument": argument }
		&"Active":
			_active_tasks[task_data["name"]].register_callback(method, argument)

func search_task(mem_name_or_num: Variant):
	if mem_name_or_num is String:
		if not _received_tasks.has(mem_name_or_num):
			return null
		var task_data = { "name": mem_name_or_num, "number": Director.getmemnum(mem_name_or_num), "status": &"" }
		if _task_queue.has(mem_name_or_num):
			task_data["status"] = &"queue"
		elif _active_tasks.has(mem_name_or_num):
			task_data["status"] = &"Active"
		elif _complete_tasks.has(mem_name_or_num):
			task_data["status"] = &"complete"
		return task_data
	elif mem_name_or_num is int:
		return search_task(Director.member(mem_name_or_num).resource_name)
	ErrorManager.error(self, "Member's name or number expected: %s" % mem_name_or_num, &"search_task", ErrorManager.Level.MINOR)
	return {}

func update_queue():
	if _task_queue.size() == 0:
		return
	
	var requet: HTTPRequest = _http_requests.pop_back()
	if requet == null:
		return
	
	var mem_name: String = _task_queue.keys()[0]
	var task_data: Dictionary = _task_queue[mem_name]
	_task_queue.erase(mem_name)
	
	var uri: String = task_data["uri"]
	if uri.begins_with("res://"):
		_complete_tasks.append(mem_name)
		return
	
	if task_data["downloadMethod"] == DOWNLOAD_HTTP_COOKIE:
		pass
		#_active_tasks[mem_name] = HttpCookieInstance.new()
	else:
		_active_tasks[mem_name] = HTTPDownload.new(requet)
	
	_active_tasks[mem_name].define(mem_name, task_data)

func remove_active_task(mem_name: String, callback: Dictionary, success: bool = true):
	if not _active_tasks.has(mem_name):
		return
	
	var task = _active_tasks[mem_name]
	if task is HTTPDownload:
		_http_requests.push_back(task._request)
		task = null
	
	_active_tasks.erase(mem_name)
	_complete_tasks.append(mem_name)
	update_queue()
	
	if not callback:
		return
	
	var callable: Callable = callback["method"]
	var argument: Variant = callback["argument"]
	callable.call(argument, success)

class HTTPDownload extends RefCounted:
	var _request: HTTPRequest
	
	var _mem_name: String
	var _callback: Dictionary
	
	func _init(request: HTTPRequest) -> void:
		_request = request
		request.request_completed.connect(_on_request_completed)
	
	func define(mem_name: String, task_data: Dictionary) -> void:
		_mem_name = mem_name
		_callback = task_data["callback"]
		
		var url: String = task_data["uri"]
		_request.request(url)
	
	func register_callback(method: Callable, argument: Variant):
		_callback = { "method": method, "argument": argument }
	
	func _on_request_completed(result: int, response_code: int, headers: PackedStringArray, body: PackedByteArray):
		# TODO: write file
		DownloadManager.remove_active_task(_mem_name, _callback, result == HTTPRequest.RESULT_SUCCESS)
