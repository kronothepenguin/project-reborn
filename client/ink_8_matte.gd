@tool
extends Sprite2D

@export_tool_button("Execute") var ink_action = _ink_matte

@export var background: Color;

func _ink_matte() -> void:
	if not texture:
		push_warning("Not texture loaded")
		return
	
	var image := texture.get_image()
	image.convert(Image.FORMAT_RGBA8)
	
	var width := image.get_width()
	var height := image.get_height()
	
	var visited := []
	for i in range(width):
		visited.append([])
		for j in range(height):
			visited[i].append(false)
	
	var stack := []
	for x in range(width):
		stack.push_back(Vector2i(x, 0))
		stack.push_back(Vector2i(x, height - 1))
	for y in range(height):
		stack.push_back(Vector2i(0, y))
		stack.push_back(Vector2i(width - 1, y))
	
	while stack.size() > 0:
		var current: Vector2i = stack.pop_back()
		if current.x < 0 or current.x >= width or current.y < 0 or current.y >= height:
			continue
		if visited[current.x][current.y]:
			continue
		
		visited[current.x][current.y] = true
		
		if image.get_pixelv(current).is_equal_approx(background):
			image.set_pixelv(current, Color(0, 0, 0, 0))
			
			stack.push_back(current + Vector2i(1, 0))
			stack.push_back(current + Vector2i(-1, 0))
			stack.push_back(current + Vector2i(0, 1))
			stack.push_back(current + Vector2i(0, -1))
	
	texture = ImageTexture.create_from_image(image)
