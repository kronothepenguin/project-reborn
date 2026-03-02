extends Node

var animation: FigureAnimation
var figuredata: FigureData
var draworder: FigureDrawOrder
var partsets: FigurePartSets

func _ready() -> void:
	animation = FigureAnimation.new()
	animation.parse("res://animation.xml")
	figuredata = FigureData.new()
	figuredata.parse("res://figuredata.xml")
	draworder = FigureDrawOrder.new()
	draworder.parse("res://draworder.xml")
	partsets = FigurePartSets.new()
	partsets.parse("res://partsets.xml")
	
	$Human.animation = animation
	$Human.figuredata = figuredata
	$Human.draworder = draworder
	$Human.partsets = partsets
	
	$Human.set_figure("hd-620-1.fc-456-2.ey-789-3.hr-101-4.he-202-5.ch-300-6.lg-400-7.sh-500-8")
