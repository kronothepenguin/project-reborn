@tool
class_name InkImage
extends Image

@export var base: Image:
	set(value):
		value.convert(Image.FORMAT_RGBA8)
		base = value
		_apply_ink()

@export var ink: Inker.Ink = Inker.Ink.COPY_0:
	set(value):
		ink = value
		_apply_ink()

@export var color_key: Color = Color.WHITE:
	set(value):
		color_key = value
		_apply_ink()

func _apply_ink():
	if not base:
		return
	
	var image := Image.create_from_data(base.get_width(), base.get_height(), false, Image.FORMAT_RGBA8, base.get_data())
	Inker.apply_ink(image, ink, color_key)
	set_data(image.get_width(), image.get_height(), false, Image.FORMAT_RGBA8, image.get_data())
