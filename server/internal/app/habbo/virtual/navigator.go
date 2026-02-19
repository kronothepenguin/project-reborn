package virtual

import (
	"errors"
	"fmt"
	"log/slog"
	"maps"
	"slices"
	"strings"
	"sync"
)

var ErrNavigatorNodeNotExists = errors.New("node not exists")

type navigatorNodeType int

const (
	nodeCategory navigatorNodeType = iota
	nodeUnit
	nodeFlatCategory
)

type NavigatorNode interface {
	info()
}

// NodeType = 0
type NavigatorCategoryNode struct {
	Mu sync.RWMutex

	Children []*NavigatorInfo
}

func (*NavigatorCategoryNode) info() {}

// NodeType = 1
type NavigatorUnitNode struct {
	UnitStrID    string
	Port         int
	Door         int
	Casts        []string
	UsersInQueue int
	IsVisible    bool
}

func (*NavigatorUnitNode) info() {}

// NodeType = 2
type NavigatorFlatCategoryNode struct {
	Mu sync.RWMutex

	FlatList []NavigatorFlat
}

func (*NavigatorFlatCategoryNode) info() {}

type NavigatorFlat struct {
	Mu sync.RWMutex

	FlatID      int
	Name        string
	Owner       string
	Door        string // "open", "closed", "password"
	UserCount   int
	MaxUsers    int
	Description string
}

type NavigatorInfo struct {
	Mu sync.RWMutex

	NodeID    int
	NodeType  int
	Name      string
	UserCount int
	MaxUsers  int
	ParentId  int
	Node      NavigatorNode
}

type Navigator struct {
	Mu sync.RWMutex

	Nodes map[int]*NavigatorInfo

	RootUnitCatId int
	RootFlatCatId int

	insertId int
	maxId    int
}

func (n *Navigator) Recommended() []*NavigatorFlat {
	flats := n.getFlats()
	var result []*NavigatorFlat
	for _, flat := range flats {
		if flat.UserCount > 0 {
			result = append(result, flat)
		}
	}
	slices.SortFunc(result, func(a *NavigatorFlat, b *NavigatorFlat) int {
		return -(a.UserCount - b.UserCount)
	})
	return result
}

func (n *Navigator) Filter(query string) []*NavigatorFlat {
	flats := n.getFlats()
	slog.Debug("flats", slog.String("flats", fmt.Sprintf("%+v", flats)))
	var result []*NavigatorFlat
	for _, flat := range flats {
		if flat.Owner == query || strings.Contains(flat.Name, query) {
			result = append(result, flat)
		}
	}
	return result
}

func (n *Navigator) getFlats() []*NavigatorFlat {
	root := n.Nodes[n.RootFlatCatId]
	root.Mu.RLock()
	rootNode := root.Node.(*NavigatorCategoryNode)
	root.Mu.RUnlock()

	rootNode.Mu.RLock()
	defer rootNode.Mu.RUnlock()
	nodes := slices.Clone(rootNode.Children)
	i := 0

	flatSet := make(map[*NavigatorFlat]struct{})
	for {
		if i >= len(nodes) {
			break
		}

		info := nodes[i]
		i += 1

		switch n := info.Node.(type) {
		case *NavigatorCategoryNode:
			n.Mu.RLock()
			defer n.Mu.RUnlock()
			nodes = slices.Concat(nodes, n.Children)

		case *NavigatorFlatCategoryNode:
			for j := range n.FlatList {
				flat := &n.FlatList[j]
				flat.Mu.RLock()
				flatSet[flat] = struct{}{}
				flat.Mu.RUnlock()
			}
		}
	}

	flats := slices.Collect(maps.Keys(flatSet))
	return flats
}

func (n *Navigator) AddNode(info *NavigatorInfo) int {
	n.setNode(n.insertId, info)
	id := n.insertId

	n.Mu.RLock()
	minId := 0
	if n.RootUnitCatId > n.RootFlatCatId {
		minId = n.RootUnitCatId + 1
	} else {
		minId = n.RootFlatCatId + 1
	}
	n.Mu.RUnlock()

	n.Mu.Lock()
	n.insertId++
	if n.insertId < 0 {
		n.insertId = minId
	}
	for i := minId; i <= n.maxId; i++ {
		if _, exists := n.Nodes[i]; !exists {
			n.insertId = i
			break
		}
	}
	n.Mu.Unlock()

	return id
}

func (n *Navigator) RemoveNode(id int) error {
	info := n.getNode(id)
	if info == nil {
		return ErrNavigatorNodeNotExists
	}

	n.Mu.Lock()
	delete(n.Nodes, id)
	if n.maxId == id {
		n.maxId = id - 1
	}
	n.Mu.Unlock()

	info.Mu.Lock()
	info.NodeID = 0
	info.Mu.Unlock()

	parent := n.getParentNode(info)
	if parent == nil {
		return nil
	}

	parentNode, ok := parent.Node.(*NavigatorCategoryNode)
	if !ok {
		return nil
	}

	parentNode.Mu.Lock()
	parentNode.Children = slices.DeleteFunc(parentNode.Children, func(child *NavigatorInfo) bool {
		return child == info
	})
	parentNode.Mu.Unlock()

	return nil
}

func (n *Navigator) setNode(id int, info *NavigatorInfo) {
	n.Mu.Lock()
	n.Nodes[id] = info
	n.Mu.Unlock()

	info.Mu.Lock()
	info.NodeID = id
	info.Mu.Unlock()

	if id > n.maxId {
		n.maxId = id
	}

	n.Mu.RLock()
	parent, exists := n.Nodes[info.ParentId]
	n.Mu.RUnlock()
	if !exists {
		return
	}

	parentNode, ok := parent.Node.(*NavigatorCategoryNode)
	if !ok {
		return
	}

	parentNode.Mu.Lock()
	parentNode.Children = append(parentNode.Children, info)
	parentNode.Mu.Unlock()
}

func (n *Navigator) getNode(id int) *NavigatorInfo {
	n.Mu.RLock()
	defer n.Mu.RUnlock()

	info, exists := n.Nodes[id]
	if !exists {
		return nil
	}

	return info
}

func (n *Navigator) getParentNode(info *NavigatorInfo) *NavigatorInfo {
	n.Mu.RLock()
	defer n.Mu.RUnlock()

	parent, exists := n.Nodes[info.ParentId]
	if !exists {
		return nil
	}

	return parent
}

func (n *Navigator) load(storage Storage) {
	n.Nodes = make(map[int]*NavigatorInfo)

	n.RootUnitCatId = 3
	n.RootFlatCatId = 4
	n.insertId = 5

	n.setNode(n.RootUnitCatId, &NavigatorInfo{
		NodeID:    n.RootUnitCatId,
		NodeType:  int(nodeCategory),
		Name:      "nav_publicRooms",
		UserCount: 0,
		MaxUsers:  500,
		ParentId:  0,

		Node: &NavigatorCategoryNode{Children: []*NavigatorInfo{}},
	})
	n.setNode(n.RootFlatCatId, &NavigatorInfo{
		NodeID:    n.RootFlatCatId,
		NodeType:  int(nodeCategory),
		Name:      "nav_privateRooms",
		UserCount: 0,
		MaxUsers:  500,
		ParentId:  0,

		Node: &NavigatorCategoryNode{Children: []*NavigatorInfo{}},
	})

	n.AddNode(&NavigatorInfo{
		NodeType:  int(nodeUnit),
		Name:      "nav_venue_ballroom_name",
		UserCount: 0,
		MaxUsers:  25,
		ParentId:  n.RootUnitCatId,

		Node: &NavigatorUnitNode{
			UnitStrID:    "nav_venue_ballroom_name",
			Port:         0,
			Door:         0,
			Casts:        []string{"hh_room_ballroom"},
			UsersInQueue: 0,
			IsVisible:    true,
		},
	})
	n.AddNode(&NavigatorInfo{
		NodeType:  int(nodeCategory),
		Name:      "Category",
		UserCount: 0,
		MaxUsers:  100,
		ParentId:  n.RootUnitCatId,

		Node: &NavigatorCategoryNode{Children: []*NavigatorInfo{}},
	})
	n.AddNode(&NavigatorInfo{
		NodeType:  int(nodeFlatCategory),
		Name:      "Category 1",
		UserCount: 0,
		MaxUsers:  50,
		ParentId:  n.RootFlatCatId,

		Node: &NavigatorFlatCategoryNode{
			FlatList: []NavigatorFlat{
				{
					FlatID:      10000,
					Name:        "$name",
					Owner:       "$owner",
					Door:        "$door",
					UserCount:   0,
					MaxUsers:    25,
					Description: "$description",
				},
			},
		},
	})
}
