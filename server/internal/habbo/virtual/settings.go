package virtual

type Settings struct {
	Coppa int

	Voucher int

	ParentEmailRequest               int
	ParentEmailRequestReregistration int

	AllowDirectMail int

	DateFormat string

	PartnerIntegration int

	ProfileEditing int

	TrackingHeader string

	TutorialEnabled int

	FriendListLimit    int
	FriendRequestLimit int
}

func (c *Settings) load(storage Storage) {
	c.Coppa = 2
	c.Voucher = 1
	c.ParentEmailRequest = 1
	c.ParentEmailRequestReregistration = 1
	c.AllowDirectMail = 1
	c.DateFormat = "dd-mm-yyyy"
	c.PartnerIntegration = 1
	c.ProfileEditing = 1
	c.TrackingHeader = "/"
	c.TutorialEnabled = 1
	c.FriendListLimit = 50
	c.FriendRequestLimit = 50
}
