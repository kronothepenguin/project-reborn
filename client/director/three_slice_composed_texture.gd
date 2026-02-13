@tool
class_name ThreeSliceComposedTexture
extends ImageTexture

@export var left: Image:
	set(value):
		value.convert(Image.FORMAT_RGBA8)
		left = value
		_compose()
@export var middle: Image:
	set(value):
		value.convert(Image.FORMAT_RGBA8)
		middle = value
		_compose()
@export var right: Image:
	set(value):
		value.convert(Image.FORMAT_RGBA8)
		right = value
		_compose()

func _compose():
	var width: int = _sum_width(left, middle, right)
	var height: int = _max_height(left, middle, right)
	
	var l_size := left.get_size() if left != null else Vector2i.ZERO
	var m_size := middle.get_size() if middle != null else Vector2i.ZERO
	var r_size := right.get_size() if right != null else Vector2i.ZERO
	
	var image := Image.create_empty(width, height, false, Image.FORMAT_RGBA8)
	
	_blit(image, left, Rect2i(Vector2i.ZERO, l_size), Vector2i(0, 0))
	_blit(image, middle, Rect2i(Vector2i.ZERO, m_size), Vector2i(l_size.x, 0))
	_blit(image, right, Rect2i(Vector2i.ZERO, r_size), Vector2i(l_size.x + m_size.x, 0))

	set_image(image)

func _max_height(l: Image, m: Image, r: Image) -> int:
	return max(
		l.get_height() if l != null else 0,
		m.get_height() if m != null else 0,
		r.get_height() if r != null else 0
	)

func _sum_width(l: Image, m: Image, r: Image) -> int:
	return (l.get_width() if l != null else 0) \
		+ (m.get_width() if m != null else 0) \
		+ (r.get_width() if r != null else 0)

func _blit(dst: Image, src: Image, src_rect: Rect2i, dst_offset: Vector2i):
	if src == null:
		return
	dst.blit_rect(src, src_rect, dst_offset)
