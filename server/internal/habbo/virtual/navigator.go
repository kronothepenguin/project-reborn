package virtual

type navigatorNodeType int

const (
	nodeCategory navigatorNodeType = iota
	nodeUnit
	nodeFlatCategory
)

type navigatorNode interface {
	info()
}

// NodeType = 0
type NavigatorCategoryNode struct {
	Children []*navigatorInfo
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
	FlatList []navigatorFlat
}

func (*NavigatorFlatCategoryNode) info() {}

type navigatorFlat struct {
	FlatID      int
	Name        string
	Owner       string
	Door        string
	UserCount   int
	MaxUsers    int
	Description string
}

type navigatorInfo struct {
	NodeID    int
	NodeType  int
	Name      string
	UserCount int
	MaxUsers  int
	ParentId  int
	Node      navigatorNode
}

type navigator struct {
	Nodes map[int]*navigatorInfo

	RootUnitCatId int
	RootFlatCatId int
}

func newNavigator() *navigator {
	return &navigator{
		Nodes: make(map[int]*navigatorInfo),
	}
}

func (n *navigator) loadMockData() {
	n.RootUnitCatId = 3
	n.Nodes[n.RootUnitCatId] = &navigatorInfo{
		NodeID:    n.RootUnitCatId,
		NodeType:  int(nodeCategory),
		Name:      "nav_publicRooms",
		UserCount: 0,
		MaxUsers:  500,
		ParentId:  0,

		Node: &NavigatorCategoryNode{
			Children: []*navigatorInfo{
				{
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
				},
			},
		},
	}

	n.RootFlatCatId = 4
	n.Nodes[n.RootFlatCatId] = &navigatorInfo{
		NodeID:    n.RootFlatCatId,
		NodeType:  int(nodeCategory),
		Name:      "nav_privateRooms",
		UserCount: 0,
		MaxUsers:  500,
		ParentId:  0,

		Node: &NavigatorCategoryNode{
			Children: []*navigatorInfo{
				{
					NodeID:    1000,
					NodeType:  int(nodeFlatCategory),
					Name:      "Category 1",
					UserCount: 0,
					MaxUsers:  50,
					ParentId:  n.RootFlatCatId,

					Node: &NavigatorFlatCategoryNode{
						FlatList: []navigatorFlat{
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
				},
			},
		},
	}
}
