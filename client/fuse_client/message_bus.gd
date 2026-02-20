extends Node

var _item_list := {}

func create(message: StringName) -> bool:
	if _item_list.has(message):
		ErrorManager.error(self, "Broker task already exists: %s" % message, &"create", ErrorManager.Level.MAJOR)
		return false
	
	_add_signal(message)
	return true

func remove(message: StringName) -> bool:
	if not _item_list.has(message):
		ErrorManager.error(self, "Broker task not found: %s" % message, &"remove", ErrorManager.Level.MINOR)
		return false
	
	_remove_signal(message)
	return true

func register(message: StringName, callable: Callable) -> bool:
	if not _item_list.has(message):
		_add_signal(message)
	
	var sig: Signal = _item_list[message]
	sig.connect(callable)
	
	return true

func unregister(message: StringName, callable: Callable) -> bool:
	if not _item_list.has(message):
		return false
	
	var sig: Signal = _item_list[message]
	if sig.is_connected(callable):
		sig.disconnect(callable)
	
	return true

func execute(message: StringName, ...args: Array[Variant]) -> bool:
	if not _item_list.has(message):
		return false
	
	var sig: Signal = _item_list[message]
	sig.emit.callv(args)
	
	return true

func _add_signal(message: StringName) -> void:
	add_user_signal(message)
	_item_list[message] = Signal(self, message)

func _remove_signal(message: StringName) -> void:
	var sig: Signal = _item_list[message]
	for conn in sig.get_connections():
		sig.disconnect(conn.callable)
	_item_list.erase(message)
