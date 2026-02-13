@tool
class_name NinePatchComposedTexture
extends ImageTexture

@export var top_left: Image:
	set(value):
		top_left = value
		_compose()
@export var top_middle: Image:
	set(value):
		top_middle = value
		_compose()
@export var top_right: Image:
	set(value):
		top_right = value
		_compose()

@export var middle_left: Image:
	set(value):
		middle_left = value
		_compose()
@export var middle_middle: Image:
	set(value):
		middle_middle = value
		_compose()
@export var middle_right: Image:
	set(value):
		middle_right = value
		_compose()

@export var bottom_left: Image:
	set(value):
		bottom_left = value
		_compose()
@export var bottom_middle: Image:
	set(value):
		bottom_middle = value
		_compose()
@export var bottom_right: Image:
	set(value):
		bottom_right = value
		_compose()

func _compose():	
	var lw := _min_width(top_left, middle_left, bottom_left)
	var mw := _min_width(top_middle, middle_middle, bottom_middle)
	var rw := _min_width(top_right, middle_right, bottom_right)
	
	var th := _min_height(top_left, top_middle, top_right)
	var mh := _min_height(middle_left, middle_middle, middle_right)
	var bh := _min_height(bottom_left, bottom_middle, bottom_right)
	
	var width: int = max(lw + mw + rw, 1)
	var height: int = max(th + mh + bh, 1)
	
	var image := Image.create_empty(width, height, false, Image.FORMAT_RGBA8)
	
	_blit(image, top_left, Rect2i(0, 0, lw, th), Vector2i(0, 0))
	_blit(image, top_middle, Rect2i(0, 0, mw, th), Vector2i(lw, 0))
	_blit(image, top_right, Rect2i(_right_offset_x(top_right, rw), 0, rw, th), Vector2i(lw + mw, 0))
	
	_blit(image, middle_left, Rect2i(0, 0, lw, mh), Vector2i(0, th))
	_blit(image, middle_middle, Rect2i(0, 0, mw, mh), Vector2i(lw, th))
	_blit(image, middle_right, Rect2i(_right_offset_x(middle_right, rw), 0, rw, mh), Vector2i(lw + mw, th))
	
	_blit(image, bottom_left, Rect2i(0, _bottom_offset_y(bottom_left, bh), lw, bh), Vector2i(0, th + mh))
	_blit(image, bottom_middle, Rect2i(0, _bottom_offset_y(bottom_middle, bh), mw, bh), Vector2i(lw, th + mh))
	_blit(image, bottom_right, Rect2i(_right_offset_x(bottom_right, rw), _bottom_offset_y(bottom_right, bh), rw, bh), Vector2i(lw + mw, th + mh))
	
	set_image(image)

func _min_width(left: Image, middle: Image, right: Image) -> int:
	return min(
		left.get_width() if left != null else 0,
		middle.get_width() if middle != null else 0,
		right.get_width() if right != null else 0
	)

func _min_height(left: Image, middle: Image, right: Image) -> int:
	return min(
		left.get_height() if left != null else 0,
		middle.get_height() if middle != null else 0,
		right.get_height() if right != null else 0
	)

func _right_offset_x(image: Image, rw: int) -> int:
	if not image:
		return 0
	return image.get_width() - rw

func _bottom_offset_y(image: Image, bh: int) -> int:
	if not image:
		return 0
	return image.get_height() - bh

func _blit(dst: Image, src: Image, src_rect: Rect2i, dst_offset: Vector2i):
	if src == null:
		return
	dst.blit_rect(src, src_rect, dst_offset)
