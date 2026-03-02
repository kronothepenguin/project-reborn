extends Node

@export_file("*.xml") var animationpath: String
@export_file("*.xml") var draworderpath: String
@export_file("*.xml") var figuredatapath: String
@export_file("*.xml") var partsetspath: String

func _ready() -> void:
	print(animationpath)
	print(draworderpath)
	print(figuredatapath)
	print(partsetspath)
	
	var figure_animation := FigureAnimation.new()
	if not figure_animation.parse(animationpath):
		push_error("figure animation error")
	
	var figure_draworder := FigureDrawOrder.new()
	if not figure_draworder.parse(draworderpath):
		push_error("figure draworder error")
	
	var figure_data := FigureData.new()
	if not figure_data.parse(figuredatapath):
		push_error("figure data error")
	
	var figure_partsets := FigurePartSets.new()
	if not figure_partsets.parse(partsetspath):
		push_error("figure partsets error")
	
