extends Node

var animation: FigureAnimation
var figuredata: FigureData
var draworder: FigureDrawOrder
var partsets: FigurePartSets

func _ready() -> void:
	animation = FigureAnimation.new()
	animation.parse("res://external/animation.xml")
	figuredata = FigureData.new()
	figuredata.parse("res://external/figuredata.xml")
	draworder = FigureDrawOrder.new()
	draworder.parse("res://external/draworder.xml")
	partsets = FigurePartSets.new()
	partsets.parse("res://external/partsets.xml")
	
	$Human.animation = animation
	$Human.figuredata = figuredata
	$Human.draworder = draworder
	$Human.partsets = partsets
	
	$Human.set_figure("hd-620-1")
