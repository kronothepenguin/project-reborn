package hhphoto

import "github.com/kronothepenguin/project-reborn/internal/app/game/protocol"

const FILM = "FILM"

func Register(registry protocol.Registry) {
	registry.Commands().Register(FILM, 4)
}

// TODO: RegisterMUS
