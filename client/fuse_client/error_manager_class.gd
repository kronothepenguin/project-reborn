extends Node

enum Level { MINOR = 0, MAJOR = 1, CRITICAL = 2 }

var _debug_level := 1
var _error_cache := []
var _cache_size := 30
var _error_dialog_level := Level.CRITICAL
var _fatal_reported := 0
var _client_error_list := []
var _server_error_list := []
var _fatal_report_param_order := [
	"error", "version", "build", "os", "host", "port", 
	"client_version", "mus_errorcode", "error_id"
]

func _init() -> void:
	if VariableContainer.exists("client.debug.level"):
		_error_dialog_level = VariableContainer.get_var("client.debug.level")
		if Level.find_key(_error_dialog_level) == null:
			_error_dialog_level = Level.CRITICAL

func error(object_ref: Object, message: String, method: StringName, error_level: Level = Level.MINOR) -> void:
	var object_str := str(object_ref)
	message = message if message != "" else "Unknown"
	method = method if method != &"" else &"Unknown"
	
	var lines := message.split("\n")
	
	var timestamp: String = Time.get_datetime_string_from_system(true)
	var error_text: String = "\n"
	error_text += "\tTime:    %s\n" % timestamp
	error_text += "\tMethod:  %s\n" % method
	error_text += "\tObject:  %s\n" % object_str
	error_text += "\tMessage: %s\n" % lines[0]
	
	_client_error_list.append("%s-%s-%s-%s" % [timestamp, method, object_str, lines[0]])
	
	for line in lines.slice(1):
		error_text += "\t         %s\n" % line
	
	_error_cache.append(error_text)
	if _error_cache.size() > _cache_size:
		_error_cache.remove_at(0)
	
	# Muestra según nivel de debug
	match _debug_level:
		1, 2:
			print_rich("[color=red]Error:[/color] %s" % error_text)
		3:
			pass
			#BrokerManager.emit(&"debugdata", "Error: %s" % error_text)
		_:
			print_rich("[color=red]Error:[/color] %s" % error_text)
	
	if Level.find_key(error_level) == null:
		error_level = Level.MINOR
	if error_level >= _error_dialog_level:
		error_text  = "Method: %s\n" % method
		error_text += "Object: %s\n" % object_str
		error_text += "Message:%s\n" % lines[0]
		#BrokerManager.execute_message(&"showErrorMessage", "client", error_text)

## Registra un error del servidor
#func server_error(error_dict: Dictionary) -> void:
	#if error_dict.has("error_id") and error_dict.has("error_msg_id"):
		#var error_str = "%s-%s-%s" % [error_dict["error_id"], error_dict["error_msg_id"], Time.get_unix_time_from_system()]
		#server_error_list.append(error_str)

## Obtiene últimos errores del cliente (limitado)
#func get_client_errors() -> String:
	#var error_str = ""
	#for err in client_error_list:
		#error_str += err + ";"
	
	#var max_length = 1000
	#if error_str.length() > max_length:
		#error_str = error_str.right(max_length)
	#
	#return error_str

## Obtiene últimos errores del servidor (limitado)
#func get_server_errors() -> String:
	#var error_str = ""
	#for err in server_error_list:
		#error_str += err + ";"
	#
	#var max_length = 1000
	#if error_str.length() > max_length:
		#error_str = error_str.right(max_length)
	#
	#return error_str

func set_debug_level(level: int) -> bool:
	_debug_level = level
	return true

## Imprime el cache de errores
#func print_errors():
	#print_rich("[color=yellow]Errors:[/color]\n%s" % "\n".join(error_cache))

## Maneja error fatal
#func fatal_error(error_data: Dictionary = {}) -> void:
	#handle_fatal_error(error_data)

## Genera ID de error único
#func make_error_id() -> String:
	#var session_obj = Engine.get_meta("session_object", null)
	#var user_id = 0
	#if session_obj is Dictionary and session_obj.has("user_user_id"):
		#user_id = int(session_obj["user_user_id"]) % 10000
	#
	#var src2 = randi() % 10000
	#var src_padded = str(user_id).pad_zeros(4)
	#var src2_padded = str(src2).pad_zeros(4)
	#return src_padded + src2_padded

## Procesa error fatal y envía reporte
#func handle_fatal_error(error_data: Dictionary = {}) -> void:
	#var error_url = Engine.get_meta("client.fatal.error.url", "")
	#var params = ""
	#
	#if not error_data.is_empty():
		## Añade datos de contexto
		#error_data["version"] = Engine.get_version_info()["string"]
		#error_data["build"] = OS.get_engine_version()
		#error_data["os"] = OS.get_name()
		#error_data["client_version"] = ProjectSettings.get_setting("application/config/name", "Unknown")
		#error_data["client_errors"] = get_client_errors()
		#error_data["server_errors"] = get_server_errors()
		#error_data["client_uptime"] = OS.get_ticks_msec() / 1000.0
		#error_data["error_id"] = make_error_id()
		#
		## Ordena los parámetros según prioridad
		#var ordered_params: Dictionary = {}
		#for key in fatal_report_param_order:
			#if error_data.has(key):
				#ordered_params[key] = error_data[key]
		#
		## Añade parámetros restantes
		#for key in error_data:
			#if not ordered_params.has(key):
				#ordered_params[key] = error_data[key]
		#
		## Construye cadena de consulta
		#var first = true
		#for key in ordered_params:
			#var value = str(ordered_params[key])
			#var encoded_key = key.uri_encode()
			#var encoded_value = value.uri_encode()
			#
			#if first:
				#params += "?%s=%s" % [encoded_key, encoded_value]
				#first = false
			#else:
				#params += "&%s=%s" % [encoded_key, encoded_value]
		#
		## Guarda para depuración
		#ProjectSettings.set_meta("ClientFatalParams", params)
	#
	#show_error_dialog("A critical error occurred. The application will now close.")
	#
	## Reporta si no se ha hecho antes
	#if error_url != "" and not fatal_reported:
		## Nota: Godot no tiene openNetPage. Esto sería una solicitud HTTP.
		## var http_request = HTTPRequest.new()
		## add_child(http_request)
		## http_request.request(error_url + params)
		#fatal_reported = true
#
### Muestra diálogo de error (simulado)
#func show_error_dialog(message: String = "") -> bool:
	#print_rich("[color=red][FATAL ERROR][/color] %s" % message)
	## Aquí iría la lógica para mostrar UI nativa de Godot si se requiere
	#return true
#
### Limpia el estado
#func clear():
	#error_cache.clear()
	#client_error_list.clear()
	#server_error_list.clear()
	#fatal_reported = false
