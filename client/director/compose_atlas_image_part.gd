@tool
class_name ComposeAtlasImagePart
extends Resource

@export var image: Image

@export var flip_h: bool = false:
	set(value):
		flip_h = value
		_flip_horizontal()

func _flip_horizontal():
	if not image:
		return
	
	image = Image.create_from_data(image.get_width(), image.get_height(), image.has_mipmaps(), image.get_format(), image.get_data())
	image.flip_x()
