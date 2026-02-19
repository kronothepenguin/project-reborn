package hhbuffer

import "github.com/kronothepenguin/project-reborn/internal/app/habbo/protocol"

const STUFFDATAUPDATE = "STUFFDATAUPDATE"
const ACTIVEOBJECT_REMOVE = "ACTIVEOBJECT_REMOVE"
const ACTIVEOBJECT_UPDATE = "ACTIVEOBJECT_UPDATE"
const REMOVEITEM = "REMOVEITEM"
const UPDATEITEM = "UPDATEITEM"

func Register(registry protocol.Registry) {
	registry.Commands().Register(STUFFDATAUPDATE, 88)
	registry.Commands().Register(ACTIVEOBJECT_REMOVE, 94)
	registry.Commands().Register(ACTIVEOBJECT_UPDATE, 95)
	registry.Commands().Register(REMOVEITEM, 84)
	registry.Commands().Register(UPDATEITEM, 85)
}
