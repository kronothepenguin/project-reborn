package virtual

import "sync"

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
	FlatList []NavigatorFlat
}

func (*NavigatorFlatCategoryNode) info() {}

type NavigatorFlat struct {
	FlatID      int
	Name        string
	Owner       string
	Door        string
	UserCount   int
	MaxUsers    int
	Description string
}

type NavigatorInfo struct {
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
}

func (n *Navigator) setNode(id int, info *NavigatorInfo) {
	n.Mu.Lock()
	defer n.Mu.Unlock()

	n.Nodes[id] = info

	if info.ParentId == 0 {
		return
	}

	parent, ok := n.Nodes[info.ParentId]
	if !ok {
		return
	}

	parentNode, ok := parent.Node.(*NavigatorCategoryNode)
	if !ok {
		return
	}

	parentNode.Children = append(parentNode.Children, info)
}

func (n *Navigator) load(storage Storage) {
	n.Nodes = make(map[int]*NavigatorInfo)

	n.RootUnitCatId = 3
	n.setNode(n.RootUnitCatId, &NavigatorInfo{
		NodeID:    n.RootUnitCatId,
		NodeType:  int(nodeCategory),
		Name:      "nav_publicRooms",
		UserCount: 0,
		MaxUsers:  500,
		ParentId:  0,

		Node: &NavigatorCategoryNode{Children: []*NavigatorInfo{}},
	})
	n.setNode(100, &NavigatorInfo{
		NodeID:    100,
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
	n.setNode(101, &NavigatorInfo{
		NodeID:    101,
		NodeType:  int(nodeCategory),
		Name:      "Category",
		UserCount: 0,
		MaxUsers:  100,
		ParentId:  n.RootUnitCatId,

		Node: &NavigatorCategoryNode{Children: []*NavigatorInfo{}},
	})

	n.RootFlatCatId = 4
	n.setNode(n.RootFlatCatId, &NavigatorInfo{
		NodeID:    n.RootFlatCatId,
		NodeType:  int(nodeCategory),
		Name:      "nav_privateRooms",
		UserCount: 0,
		MaxUsers:  500,
		ParentId:  0,

		Node: &NavigatorCategoryNode{Children: []*NavigatorInfo{}},
	})
	n.setNode(1000, &NavigatorInfo{
		NodeID:    1000,
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
