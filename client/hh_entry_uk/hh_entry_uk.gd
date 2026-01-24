extends Node2D


# Called when the node enters the scene tree for the first time.
func _ready() -> void:
	#registerMessage(#userlogin, me.getID(), #showEntryBar)
	EventBrokerBehavior.show_hotel_view.connect(show_hotel)
	#registerMessage(#IMStateChanged, me.getID(), #updateIMIcon)
	EventBrokerBehavior.request_hotel_view.emit()

func show_hotel() -> void:
	$AnimationPlayer.play("open_view")
