extends Node

@export_file("*.xml") var animationpath: String
@export_file("*.xml") var draworderpath: String
@export_file("*.xml") var figuredatapath: String
@export_file("*.xml") var partsetspath: String

func _ready() -> void:
	pass





# figuredata.xml
class _FigureData extends RefCounted:
	var colors: Colors
	var sets: Sets
	
	class Colors extends RefCounted:
		var palette_dict: Dictionary[int, Palette]
		
		class Palette extends RefCounted:
			var id: int
			var color_dict: Dictionary[int, PaletteColor]
			
			# <color>
			class PaletteColor extends RefCounted:
				var id: int
				var index: int
				var club: bool
				var selectable: bool
				var color: Color # text content
	
	class Sets extends RefCounted:
		var settype_list: Array[SetType]
		
		class SetType extends RefCounted:
			var type: String
			var paletteid: int
			var mandatory: bool
			var set_dict: Dictionary[int, Set]
			
			class Set extends RefCounted:
				var id: int
				var gender: String
				var club: bool
				var colorable: bool
				var selectable: bool
				var part_list: Array[Part]
				var hiddenlayers: HiddenLayers
				
				class Part extends RefCounted:
					var id: int
					var type: String
					var colorable: bool
				
				class HiddenLayers extends RefCounted:
					var layer: Layer
					
					class Layer extends RefCounted:
						var parttype: String

# partsets.xml
class PartSets extends RefCounted:
	var part_set: PartSet
	var active_part_set_dict: Dictionary[String, ActivePartSet]
	
	class PartSet extends RefCounted:
		var part_list: Array[Part]
		
		class Part extends RefCounted:
			var settype: String
			var swim: bool
			var flipped_set_type: String
			var remove_set_type: String
	
	class ActivePartSet extends RefCounted:
		var id: String
		var active_part_list: Array[ActivePart]
		
		class ActivePart extends RefCounted:
			var settype: String
