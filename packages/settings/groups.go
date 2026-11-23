package settings

import "slices"

// Group is a set of settings an administrator edits together.
type Group struct {
	ID     string // "registration"
	Title  string // "Registration"
	Fields []Field
}

// Field is one setting of a group, with its label and its help. Kind comes from
// the declaration: switch for a bool, number for an int, choice for a string with
// Choices, and text for every other string.
type Field struct {
	Key      string // "registration.maxPerIp"
	Label    string // "Habbos Per Address"
	Help     string
	Kind     string // text, number, switch, choice
	Choices  []Choice
	Required bool
}

// Choice is one value a choice field takes, with its label.
type Choice struct {
	Value string
	Label string
}

// ungrouped are the settings no group holds: the note belongs to housekeeping's
// dashboard.
var ungrouped = []string{"housekeeping.note"}

// staffBoxChoices are the colours a box of the staff page takes, as Holo's
// content tool offered them.
var staffBoxChoices = []Choice{
	{Value: "red", Label: "Red"},
	{Value: "blue", Label: "Blue"},
	{Value: "white", Label: "White (no Header)"},
	{Value: "green", Label: "Green"},
}

// Groups lists every group, in housekeeping's order. Each call returns a new
// list, so a caller may change what it gets.
func Groups() []Group {
	groups := []Group{
		{
			ID: "site", Title: "General Configuration",
			Fields: []Field{
				{Key: "site.name", Label: "Sitename", Help: "This is the full name of your site, eg. 'Reborn Hotel'.", Required: true},
				{Key: "site.shortName", Label: "Shortname", Help: "This is the 'shortname' of your site, eg. 'Reborn'.", Required: true},
				{Key: "site.url", Label: "Site Address", Help: "This is the address of your site, eg. 'https://hotel.example.com'. Reset mails link to it, and Housekeeping sends guests there to sign in.", Required: true},
				{Key: "site.housekeepingUrl", Label: "Housekeeping Address", Help: "The address the site's Housekeeping links open: a path when they share a port, eg. '/housekeeping', or a full address when Housekeeping has its own, eg. 'https://hotel.example.com:18465/housekeeping'.", Required: true},
			},
		},
		{
			ID: "maintenance", Title: "Turn your site on/off",
			Fields: []Field{
				{Key: "site.maintenance", Label: "Close Site", Help: "If enabled, your site will be closed and show a maintenance page to regular users. Administrators can still login on that page."},
			},
		},
		{
			ID: "hotel", Title: "Turn your hotel on/off",
			Fields: []Field{
				{Key: "game.closed", Label: "Close Hotel", Help: "If enabled, the game keeps its doors closed, also after a restart."},
			},
		},
		{
			ID: "auth", Title: "Sign-in and Sessions",
			Fields: []Field{
				{Key: "auth.secureCookies", Label: "Secure Cookies", Help: "This sends the session cookie over HTTPS only. Disable it only for a hotel without HTTPS."},
				{Key: "auth.sessionIdleMinutes", Label: "Session Length", Help: "The minutes without a request after which a session ends."},
				{Key: "auth.rememberDays", Label: "Remember Me", Help: "The days a session lasts when the visitor asks to be remembered."},
				{Key: "auth.loginMaxFailures", Label: "Failed Sign-ins", Help: "The failed sign-ins after which an address or a user has to wait."},
				{Key: "auth.loginWindowMinutes", Label: "Failed Sign-in Window", Help: "The minutes during which failed sign-ins count."},
				{Key: "auth.passwordMinLength", Label: "Shortest Password", Help: "The fewest characters in a new password."},
				{Key: "auth.passwordMaxLength", Label: "Longest Password", Help: "The most characters in a new password."},
				{Key: "auth.resetTokenMinutes", Label: "Reset Link Lifetime", Help: "The minutes a password reset link works."},
				{Key: "auth.resetMaxActive", Label: "Reset Links Per Account", Help: "The most unexpired reset links an account can hold."},
			},
		},
		{
			ID: "registration", Title: "Registration",
			Fields: []Field{
				{Key: "registration.startCredits", Label: "Start Credits", Help: "The credits a new habbo starts with."},
				{Key: "registration.maxHabbosPerUser", Label: "Habbos Per User", Help: "The most habbos one user can own."},
				{Key: "registration.maxPerIp", Label: "Habbos Per Address", Help: "The most habbos one address can register."},
				{Key: "registration.ipWindowHours", Label: "Address Window", Help: "The hours during which that limit counts."},
				{Key: "registration.defaultFigure", Label: "Default Figure", Help: "The look of a habbo registered without one."},
				{Key: "registration.defaultGender", Label: "Default Gender", Help: "M or F, for a habbo registered without one."},
			},
		},
		{
			ID: "referral", Title: "Referrals",
			Fields: []Field{
				{Key: "referral.enabled", Label: "Referrals Enabled", Help: "This determines whether a referral pays the habbo who referred."},
				{Key: "referral.reward", Label: "Referral Reward", Help: "The credits a referral pays."},
			},
		},
		{
			ID: "mail", Title: "Password reset mail",
			Fields: []Field{
				{Key: "mail.host", Label: "Mail Host", Help: "The host of the mail server. Without one, no mail goes out."},
				{Key: "mail.port", Label: "Mail Port", Help: "The port of the mail server."},
				{Key: "mail.username", Label: "Mail Username", Help: "The name to sign in to the mail server with."},
				{Key: "mail.password", Label: "Mail Password", Help: "The password to sign in to the mail server with. Leave it blank to keep the current one."},
				{Key: "mail.from", Label: "Mail Sender", Help: "The address mails come from."},
			},
		},
		{
			ID: "imaging", Title: "Avatar Imaging",
			Fields: []Field{
				{Key: "imaging.avatarUrl", Label: "Avatar Imager", Help: "The address that draws habbos, without a query."},
			},
		},
		{
			ID: "homes", Title: "Homes",
			Fields: []Field{
				{Key: "homes.maxItems", Label: "Items Per Home", Help: "The most stickers, notes and widgets one home can hold."},
				{Key: "homes.noteMaxLength", Label: "Note Length", Help: "The most characters in a note."},
				{Key: "homes.maxTags", Label: "Tags Per Habbo", Help: "The most tags one habbo can have."},
				{Key: "homes.wardrobeSlots", Label: "Wardrobe Slots", Help: "The most outfits a club member can keep in the wardrobe of each habbo."},
			},
		},
		{
			ID: "groups", Title: "Groups",
			Fields: []Field{
				{Key: "groups.price", Label: "Group Price", Help: "The credits a new group costs."},
				{Key: "groups.maxOwned", Label: "Groups Per User", Help: "The most groups the habbos of one user can own together."},
				{Key: "groups.maxMemberships", Label: "Memberships Per Habbo", Help: "The most groups one habbo can be a member of or ask to join."},
				{Key: "groups.maxMembers", Label: "Members Per Regular Group", Help: "The most members a Regular group takes. Unlimited groups have no limit."},
				{Key: "groups.nameMaxLength", Label: "Group Name Length", Help: "The most characters in a group's name."},
				{Key: "groups.descriptionMaxLength", Label: "Group Description Length", Help: "The most characters in a group's description."},
			},
		},
		{
			ID: "club", Title: "Club",
			Fields: []Field{
				{Key: "club.price1Month", Label: "1 Month Price", Help: "The credits 1 month of the club costs."},
				{Key: "club.price3Months", Label: "3 Months Price", Help: "The credits 3 months of the club cost."},
				{Key: "club.price6Months", Label: "6 Months Price", Help: "The credits 6 months of the club cost."},
				{Key: "club.daysPerMonth", Label: "Days Per Month", Help: "The days one month of the club lasts."},
			},
		},
		{
			ID: "help", Title: "Help",
			Fields: []Field{
				{Key: "help.messageMaxLength", Label: "Question Length", Help: "The most characters in the question of a help request."},
			},
		},
		{
			ID: "game", Title: "Game",
			Fields: []Field{
				{Key: "game.clientVersion", Label: "Client Version", Help: "The version the game client must send, the client.version.id of its external variables."},
				{Key: "game.coppa", Label: "COPPA", Help: "0 off, 1 on, 2 strong."},
				{Key: "game.vouchers", Label: "Vouchers", Help: "This tells the game client that vouchers can be redeemed."},
				{Key: "game.parentEmailRequest", Label: "Parent's E-mail", Help: "This tells the game client to ask for a parent's e-mail at registration."},
				{Key: "game.parentEmailReregistration", Label: "Parent's E-mail Again", Help: "This tells the game client to ask for a parent's e-mail at re-registration."},
				{Key: "game.directMail", Label: "Direct Mail", Help: "This tells the game client that habbos may get mail from the hotel."},
				{Key: "game.dateFormat", Label: "Date Format", Help: "How the game client writes dates, with dd, mm and yyyy."},
				{Key: "game.partnerIntegration", Label: "Partner Integration", Help: "This tells the game client that the hotel works with a partner site."},
				{Key: "game.profileEditing", Label: "Profile Editing", Help: "This shows the game client's links to change a habbo's looks."},
				{Key: "game.trackingHeader", Label: "Tracking Header", Help: "The text the game client puts before each tracking point it reports."},
				{Key: "game.tutorial", Label: "Tutorial", Help: "This lets the game client run its tutorial."},
				{Key: "game.pingSeconds", Label: "Ping Every", Help: "How many seconds pass between the server's pings to each game client."},
				{Key: "game.pongTimeoutSeconds", Label: "Ping Timeout", Help: "How many seconds a game client may leave the pings unanswered before the server closes it. It must be longer than Ping Every."},
				{Key: "game.maxRoomsPerHabbo", Label: "Rooms per Habbo", Help: "How many rooms a habbo may own."},
				{Key: "game.maxFavouriteRooms", Label: "Favourite Rooms", Help: "How many rooms a habbo may keep among its favourites."},
				{Key: "game.categoryMaxRooms", Label: "Rooms per Category", Help: "How many habbo rooms the navigator lists in one category."},
				{Key: "game.searchMaxRooms", Label: "Rooms per Search", Help: "How many rooms a search in the navigator returns."},
				{Key: "game.roomBanMinutes", Label: "Room Ban Minutes", Help: "How many minutes an owner's ban keeps a habbo out of a room."},
				{Key: "game.chatHistoryDays", Label: "Chat History Days", Help: "How many days what habbos say in rooms is kept for staff."},
				{Key: "game.loadingAdImage", Label: "Loading Ad Image", Help: "The address of the picture shown while a room loads; empty for none."},
				{Key: "game.loadingAdLink", Label: "Loading Ad Link", Help: "Where a click on the loading picture goes."},
				{Key: "game.roomAdImage", Label: "Room Ad Image", Help: "The address of the picture shown in a room; empty for none."},
				{Key: "game.roomAdLink", Label: "Room Ad Link", Help: "Where a click on the room's picture goes."},
				{Key: "game.outboxSize", Label: "Outbox Size", Help: "How many messages may wait for a client before the server closes it, as a client that stopped reading."},
				{Key: "game.chatRange", Label: "Chat Range", Help: "How many tiles away habbos read a habbo's chat; farther ones see a bubble without the words."},
				{Key: "game.chatMaxLength", Label: "Chat Line Length", Help: "How many characters of a chat, shout or whisper the server keeps."},
				{Key: "game.maxIgnoredHabbos", Label: "Ignored Habbos", Help: "How many habbos a habbo may ignore; one more drops the oldest."},
				{Key: "game.roomEventTypes", Label: "Room Event Types", Help: "How many types of room events there are, named by the client's texts roomevent_type_1 and on."},
				{Key: "game.maxSpectators", Label: "Spectators", Help: "How many spectators may watch a full room at once."},
				{Key: "game.maxRoomFurni", Label: "Furni In A Room", Help: "How many furni a habbo room holds; one more stays in the hand."},
				{Key: "game.maxStackHeight", Label: "Stack Height", Help: "How high a furni may stand on a stack of others."},
				{Key: "game.presentNoteMaxLength", Label: "Present Note Length", Help: "How many characters a present's note keeps; a longer one is cut."},
				{Key: "game.postItMaxLength", Label: "Post-it Length", Help: "How many characters a post-it holds; a longer one is not saved."},
				{Key: "game.maxTradeFurni", Label: "Trade Size", Help: "How many furni one habbo may offer in a trade."},
			},
		},
		{
			// HoloCMS's Recycler Options, with its labels and its help (decision server/0119). Holo kept the three
			// times in minutes and did not say so.
			ID: "recycler", Title: "Recycler Options",
			Fields: []Field{
				{Key: "recycler.enabled", Label: "Enable recycler"},
				{Key: "recycler.minOwnedMinutes", Label: "Minimum owned time", Help: "The minimum required amount of time since the furniture was bought before it can be used with the recycler. In minutes; 0 takes any furniture."},
				{Key: "recycler.sessionMinutes", Label: "Session length", Help: "The length of a recycler session. In minutes."},
				{Key: "recycler.timeoutMinutes", Label: "Session expire length", Help: "In minutes, from the start of the session; it must be longer than the session length. After it the reward is lost and the furniture comes back."},
			},
		},
		{
			ID: "features", Title: "Manage Site Content",
			Fields: []Field{
				{Key: "features.landingPromo", Label: "Landing Promo Enabled", Help: "This determines whether the promo on the login page will be displayed. If disabled, the join button is shown."},
				{Key: "features.birthdayNotifications", Label: "Birthday Notifications Enabled", Help: "This will determine whether a 'Happy birthday' message will be shown on a user's birthday."},
				{Key: "features.clientWideScreen", Label: "Client in Widescreen", Help: "This determines whether the game client should display in widescreen mode or not."},
				{Key: "features.clientLoader", Label: "Client Loader Enabled", Help: "This determines whether 'opening' and the site's shortname show while the game client loads."},
				{Key: "features.tagFight", Label: "Tag Fight Enabled", Help: "This determines whether the Tag Fight will be shown on the tags page."},
				{Key: "features.groupPurchase", Label: "Group Purchasing Enabled", Help: "This determines whether new groups can be created or not."},
				{Key: "club.maxMonths", Label: "HC Months Limit", Help: "This will limit the allowed amount of subscribed Club months per user at once to this number. Set to '0' to have no limit."},
			},
		},
		{
			ID: "staffPage", Title: "Staff Module",
			Fields: []Field{
				{Key: "staffPage.box1Body", Label: "Staff Content Box 1", Help: "The text within a content box on the staff page (if enabled). BBCode is allowed here."},
				{Key: "staffPage.box1Color", Label: "Staff Content Box 1 Color", Help: "Only valid colors defined in CSS such as 'orange', 'blue', etc", Choices: staffBoxChoices},
				{Key: "staffPage.box1Heading", Label: "Staff Content Box 1 Heading", Help: "The title (heading) of Staff Content Box 1.", Required: true},
				{Key: "staffPage.box2Body", Label: "Staff Content Box 2", Help: "The text within a content box on the staff page (if enabled). BBCode is allowed here."},
				{Key: "staffPage.box2Color", Label: "Staff Content Box 2 Color", Help: "Only valid colors defined in CSS such as 'orange', 'blue', etc", Choices: staffBoxChoices},
				{Key: "staffPage.box2Heading", Label: "Staff Content Box 2 Heading", Help: "The title (heading) of Staff Content Box 2.", Required: true},
				{Key: "features.staffPage", Label: "Staff Module Enabled", Help: "This determines whether the Staff Module (/staff) will be displayed/enabled."},
			},
		},
		// Holo's content tool sorted a category by title, so Holo's misspelt
		// Credit Content Box 2 Heading comes first.
		{
			ID: "creditsPage", Title: "Credits Page",
			Fields: []Field{
				{Key: "creditsPage.box2Heading", Label: "Credit Content Box 2 Heading", Help: "The title (heading) of Credit Content Box 2.", Required: true},
				{Key: "creditsPage.box1Body", Label: "Credits Content Box 1", Help: "The text within a content box on the credits page. BBCode is allowed here."},
				{Key: "creditsPage.box1Heading", Label: "Credits Content Box 1 Heading", Help: "The title (heading) of Credit Content Box 1.", Required: true},
				{Key: "creditsPage.box2Body", Label: "Credits Content Box 2", Help: "The text within a content box on the credits page. BBCode is allowed here."},
			},
		},
		{
			ID: "forum", Title: "Discussion Board Module",
			Fields: []Field{
				{Key: "features.forum", Label: "Forum Enabled", Help: "This determines whether the Discussion Board will be shown/enabled."},
				{Key: "features.smilies", Label: "Smilies Enabled", Help: "This determines whether Smilies will be shown on the Discussion Board and on Homes."},
				{Key: "forum.spamSeconds", Label: "Spam Check", Help: "The seconds a habbo must wait after a post before starting a thread or replying again. 0 turns the check off."},
			},
		},
	}
	for _, g := range groups {
		for i, f := range g.Fields {
			g.Fields[i].Choices = slices.Clone(f.Choices)
			g.Fields[i].Kind = kindOf(f)
		}
	}
	return groups
}

// kindOf names the field's kind from its declaration's type; an undeclared key
// has none.
func kindOf(f Field) string {
	switch catalogue[f.Key].def.(type) {
	case bool:
		return "switch"
	case int:
		return "number"
	case string:
		if len(f.Choices) > 0 {
			return "choice"
		}
		return "text"
	}
	return ""
}

// choiceValues lists the values of choices, for the validator of the setting
// that offers them.
func choiceValues(choices []Choice) []string {
	values := make([]string, len(choices))
	for i, c := range choices {
		values[i] = c.Value
	}
	return values
}
