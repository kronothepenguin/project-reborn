class_name FigurePreview
extends Node

enum PartList {
	HEAD
}

func create_template_human(figure: Dictionary, size: String, dir: int):
	pass

func get_human_part_img(part_list: PartList, figure: Dictionary = {}, dir: int = 3, size: String = "h") -> Image:
	if figure.is_empty():
		figure = get_tree().root.get_meta("session").get("user_figure") as Dictionary
	create_template_human(figure, size, dir)
	var image := Image.create_empty(64, 102, false, Image.FORMAT_RGB565)
	return image

#    getObject("Figure_Preview").createHumanPartPreview(pBottomBar, "ownhabbo_icon_image", #head)
func create_human_part_preview():
	pass
