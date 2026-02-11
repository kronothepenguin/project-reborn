extends Node


# Called when the node enters the scene tree for the first time.
func _ready() -> void:
	pass # Replace with function body.


# Called every frame. 'delta' is the elapsed time since the previous frame.
func _process(delta: float) -> void:
	pass


func download_pck(url: String, pck_name: String):
	var http = HTTPRequest.new()
	add_child(http)
	http.request_completed.connect(on_pck_downloaded.bind(pck_name))
	
	var err = http.request(url)
	if err != OK:
		print(err)

func on_pck_downloaded(result, response_code, headers, body, pck_name):
	if response_code == 200:
		var path = "user://" + pck_name
		
		var file = FileAccess.open(path, FileAccess.WRITE)
		file.store_buffer(body)
		file.close()
		
		var success = ProjectSettings.load_resource_pack(path)
		
		if success:
			var furni_scene = load("res://export_presets.cfg")
