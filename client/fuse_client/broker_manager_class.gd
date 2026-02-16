extends Node

var _last_executed_message: StringName = &""
var _item_list := {}

func create(message: StringName) -> bool:
	if _item_list.has(message):
		ErrorManager.error(self, "Broker task already exists: %s" % message, &"create", ErrorManager.Level.MAJOR)
		return false
	add_user_signal(message)
	_item_list[message] = Signal(self, message)
	return true

func remove(message: StringName) -> bool:
	if not _item_list.has(message):
		ErrorManager.error(self, "Broker task not found: %s" % message, &"remove", ErrorManager.Level.MINOR)
		return false
	
	var sig: Signal = _item_list[message]
	for conn in sig.get_connections():
		sig.disconnect(conn.callable)
	
	_item_list.erase(message)
	
	return true

func register(message: StringName, callable: Callable) -> bool:
	if not _item_list.has(message):
		add_user_signal(message)
		_item_list[message] = Signal(self, message)
	
	var sig: Signal = _item_list[message]
	sig.connect(callable)
	
	return true

func unregister(message: StringName, callable: Callable) -> bool:
	if not _item_list.has(message):
		return false
	
	var sig: Signal = _item_list[message]
	if sig.is_connected(callable):
		sig.disconnect(callable)
	
	if not sig.has_connections():
		remove(message)
	
	return true

func execute(message: StringName, ...args: Array[Variant]) -> bool:
	if not _item_list.has(message):
		return false
	
	_last_executed_message = message
	
	var sig: Signal = _item_list[message]
	sig.emit.callv(args)
	
	return true
