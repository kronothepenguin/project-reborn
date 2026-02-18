extends Node

var _wait_list := {}
var _task_list := {}
var _last_task_id := 0

var _request_pool = []

func _ready() -> void:
	var count: int = VariableContainer.get_var("net.operation.count", 2)
	for i in range(count):
		var request := HTTPRequest.new()
		add_child(request)
		_request_pool.append(request)

func start_pck_load(pcks: Array[String], permanent: bool = false, add = false, do_indexing = true) -> int:
	if len(pcks) == 0:
		return 0
	
	var wait_list = []
	for pck in pcks:
		wait_list.append(pck)
	
	var id := _last_task_id + 1
	_last_task_id = id
	_wait_list[id] = wait_list
	
	var task = {
		id = id,
		status = &"loading",
		casts = wait_list,
		callback = null,
		permanent = permanent,
	}
	_task_list[id] = task
	
	_add_next_download()
	
	return 1

func register_callback(id: int, method: Callable, argument: Variant):
	pass

func _add_next_download():
	var request: HTTPRequest = _request_pool.pop_back()
	request.request_completed.connect()
