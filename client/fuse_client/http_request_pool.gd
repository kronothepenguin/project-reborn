extends Node

var _pool: Array[HTTPRequest] = []
var _pending_requests: Array[Dictionary] = []

func _ready() -> void:
	# TODO: configurable amount of concurrent requests
	for i in range(10):
		var http := HTTPRequest.new()
		_pool.push_back(http)
		add_child(http)

func request(url: String, callback: Callable) -> void:
	_pending_requests.push_back({ "url": url, "callback": callback })
	_process_next_request()

func _process_next_request() -> void:
	if _pending_requests.is_empty():
		return
	
	var http := _get_request()
	if http == null:
		return
	
	var info: Dictionary = _pending_requests.pop_front()
	info["bound"] = _on_request_completed.bind(http, info)
	
	http.request_completed.connect(info["bound"])
	
	var url: String = info["url"]
	var err := http.request(url)
	if err != OK:
		push_error("Failed to start request to: %s" % url)
		_put_request(http)
		_process_next_request.call_deferred()

func _get_request() -> HTTPRequest:
	return _pool.pop_back()

func _put_request(http: HTTPRequest):
	_pool.push_back(http)

func _on_request_completed(result: int, response_code: int, headers: PackedStringArray, body: PackedByteArray, http: HTTPRequest, info: Dictionary):
	http.request_completed.disconnect(info["bound"])
	var callback = info["callback"]
	if callback is Callable:
		callback.call_deferred(result, response_code, headers, body)
	_put_request(http)
	_process_next_request.call_deferred()
