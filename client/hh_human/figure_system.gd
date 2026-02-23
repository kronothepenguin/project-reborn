class_name FigureSystem
extends RefCounted

static func _on_figure_part_list_request_completed(result: int, response_code: int, headers: PackedStringArray, body: PackedByteArray) -> void:
	if result != HTTPRequest.RESULT_SUCCESS:
		push_error("error: part_list")
		ErrorManager.error(FigureSystem, "Failure while loading part list", &"_on_figure_part_list_request_completed", ErrorManager.Level.CRITICAL)
		return
	
	if not FigureData.parse_data(body):
		ErrorManager.error(FigureSystem, "Failure while parsing part list", &"_on_figure_part_list_request_completed", ErrorManager.Level.CRITICAL)
		return
	VariableContainer.set_var("figure.xml.loaded", true)

static func load_figure_part_list(url: String):
	# TODO: count graphs and pass them as query parameter to verify intregity
	HTTPRequestPool.request(url, _on_figure_part_list_request_completed)

static func parse_figure(figure_data: String, sex: String, clss: String = "user") -> Figure:
	match clss:
		"user", "pelle":
			var temp_figure := {}
			if len(figure_data) % 5 == 0 and figure_data.is_valid_int():
				@warning_ignore("integer_division")
				var part_count := len(figure_data) / 5
				for i in range(part_count):
					var part := figure_data.substr(5 * i, 5)
					var set_id := part.substr(0, 3)
					var color_id := part.substr(3)
					temp_figure[set_id] = int(color_id)
			else:
				var parts := figure_data.split(".")
				for part_data in parts:
					var data := part_data.split("-")
					if len(data) >= 3:
						#var set_type := data[0]
						var set_id := data[1]
						var color_id := data[2]
						temp_figure[set_id] = int(color_id)
			return parse_new_type_figure(temp_figure, sex)
		
		"bot":
			var temp_figure := Figure.new()
			for part in figure_data.split("&"):
				var index := part.find("=")
				if index == -1:
					continue
				var prop := part.substr(0, index)
				var desc := part.substr(index + 1)
				var items := desc.split("/")
				var value := {"model": items[0]}
				while value["model"][0] == "0":
					value["model"] = value["model"].substr(1)
				var color := desc[1].split("\n")[0]
				var cols := color.split(",")
				if len(cols) == 1:
					if cols[0].to_int() == 0:
						value["color"] = Color("EEEEEE")
					else:
						# TODO: palette index
						value["color"] = Color.WHITE
				elif len(cols) == 3:
					var r: float = cols[0].to_int() / 255.0
					var g: float = cols[1].to_int() / 255.0
					var b: float = cols[2].to_int() / 255.0
					value["color"] = Color(r, g, b)
				else:
					value["color"] = Color("EEEEEE")
				temp_figure[prop] = value
	return null

static func parse_new_type_figure(figure: Dictionary, sex: String) -> Figure:
	return null

class Figure extends RefCounted:
	pass
