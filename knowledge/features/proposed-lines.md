---
type: Note
title: Proposed spec lines
description: The spec lines proposed from the test reports, each with the tests that prove it, for the user to review.
---

Read this file, or `git diff main..spec-lines -- knowledge/features`.
Tell the master which lines to change or drop.

# accounts

- A visitor opens `/register`: the newsletter starts ticked, and the choice sent is saved with the account. [TestRegisterPageStartsWithTheNewsletterChecked, TestRegisterStoresTheNewsletterChoice]
- A visitor opens `/register`: the date lists offer the days 1 to 31, the months by name and the years back to 1900. [TestRegisterPageOffersTheDates]
- A visitor opens `/register` with a look from the landing promo: the editor starts on that look, and a bad look is ignored. [TestRegisterPageStartsOnTheLookOfTheLandingWidget]
- A visitor opens the registration form: the name field has the focus with Holo's tip, and the details wait closed under an overlay. [browser: register, 8 checks]
- A visitor checks a name with Enter, Tab or the button: it is checked in place; a free name opens the details and moves the focus to the password, and changing the name closes them. [browser: register, 5 checks]
- A visitor types in a field or leaves it: it turns red or green at once with Holo's tip, and a new value or a click elsewhere clears the mark. [browser: register, 18 checks]
- A visitor presses Done with fields missing: the red box shows, and the tip names the last failing field in Holo's order. [browser: register, 7 checks]
- A visitor under 6 presses Done: Holo's bubble says it is too young. [browser: register, part of 3 checks]
- A child gives its own address or an invalid one as the parent's: the form is refused. [browser: register, part of 3 checks]
- A visitor registers from a banned address: the ban shows as the form's error with 422, and no account is made. [TestRegisterFromABannedIPShowsTheBan]
- A visitor opens `/register?refer=<habbo name>`: the form carries the referrer through a refusal. [TestReferralComesFromTheLinkThroughTheForm]
- A visitor registers with a referral that names an unknown or archived habbo, or the registration is refused: no referral is written. [TestReferralOfAnUnknownHabboIsIgnored, TestAnArchivedHabboEarnsNoReferral, TestRejectedRegistrationPaysNoReferral]
- A visitor sends the form with a blank, long or invalid name, a long password, an impossible birth date or one before 1920 or in the future, the terms unticked, or a look that is not a figure and a gender: the form is refused, and nothing is made. [TestRegisterRejections, TestValidateLook, TestValidateBornOn]
- A visitor sends the form with several problems: every problem shows at once. [TestRegisterShowsEveryProblemAtOnce]
- The server refuses the form: it comes back with the name checked and the details open. [browser: register, 1 check]
- A visitor opens the terms from the form: they open in a new window, and the form stays. [browser: register, 2 checks]
- A visitor registers: the look the editor drew is saved. [browser: register, part of 2 checks; signed-out, 1 check]
- The look editor starts: Done stays enabled. [browser: register, part of 2 checks]
- Requests arrive at the same moment: every limit holds, one habbo per name, one referral reward per account, and no habbo past the limit. [TestRegisterSameNameAtOnce, TestReferralIsPaidOnceForRegistrationsAtOnce, TestAddHabboKeepsTheLimitForRequestsAtOnce]
- A visitor signs in with a blank field, an unknown habbo or a wrong password: one Holo message shows on the landing page with 422, no session starts, and the name stays as typed, spaces included. [TestSignInFailures, TestSignInDoesNotTrimTheUsername, TestFailedSignInKeepsTheLanding, TestLoginRejectsWrongPasswordsAndUnknownHabbos]
- A signed-in visitor opens `/register` or a reset link: the site sends it to `/me`. [TestRegisterSendsSignedInVisitorsToMe, TestResetSendsSignedInVisitorsToMe]
- A guest opens a page or sends a form that needs a session: it is sent to sign in at `/`, and a call from a page's script answers 401. [TestMeNeedsASession, TestMeSendsGuestsHome, TestAccountSendsGuestsHome, TestAccountPagesSendGuestsHome, TestHabbosNeedASession, TestTheFurniPageNeedsASession, TestMottoNeedsASession, TestTheStoreNeedsASession, TestTagsNeedASession, TestGuestsCannotBuyAGroup, TestOnlyASignedInHabboRedeems, TestMembershipActionsNeedASessionAndAGroup, TestAGuestCannotTagItself, TestThePreviewShowsBBCode, TestTheWardrobeTakesSignedInPostsFromTheSite, TestRequireSession]
- `auth.secureCookies` is off: the session cookie is sent without Secure. [TestSecureCookiesFollowTheSetting]
- A session stays idle past its lifetime, or a browser sends an unknown or malformed cookie: the visitor is a guest, and the cookie is cleared. [TestSessionsClearBadAndExpiredCookies]
- A signed-in visitor opens a page: the session's lifetime starts again. [TestSessionsSlideTheExpiry]
- A banned user signs in with a wrong password: the wrong-password message shows, and the ban stays hidden. [TestLoginHidesBansFromWrongPasswords]
- A user holds a timed ban and a permanent ban: the ban shown is the permanent one. [TestActiveBanRules]
- A banned user signs out: the ban shows, and the session ends. [TestSigningOutWhileBannedShowsTheBan]
- A banned user opens a page while the site is closed: the ban shows in place of the maintenance page, and the session ends. [TestBanComesBeforeMaintenance]
- Mail is off and a visitor sends `/forgot`: the same answer shows. [TestForgotWithoutMailStillAnswers]
- A visitor sends `/forgot`: the form keeps what was typed. [TestForgotKeepsWhatWasTyped]
- A visitor opens a malformed or unknown reset link: it is refused. [TestResetWithABadLink, TestResetPasswordRejectsMalformedTokens]
- A visitor types new passwords that differ or break the password rule through a link: the reset is refused, and the link keeps working. [TestResetRejections, TestResetPasswordChecksThePasswordFirst]
- A visitor sets a new password through one of several links: the other links stop working. [TestResetPasswordEndsTheOtherResetsOfTheUser]
- A user opens `/account`: the looks tab opens. [TestAccountOpensOnLooks]
- A user opens the email tab: it shows the address and the newsletter choice. [TestEmailPageShowsTheAccount]
- A user changes the email to an invalid one: Holo's message shows, and the email stays. [TestEmailRefusals]
- A user changes the password to one outside 6 to 25 characters or unlike its confirmation: Holo's message shows, and the password and the session stay. [TestPasswordRefusals, TestChangePasswordValidates]
- A user adds a habbo with a taken, blank, invalid or `MOD-` name, or a bad look: Holo's message shows, and no habbo is made. [TestAddHabboRefusals]
- A user adds a habbo with no look sent: the habbo gets the default look. [TestAddHabboUsesTheDefaultLookWithoutAnEditor]
- A user switches to or archives a habbo of another user, or one already archived: it is refused with 403. [TestSwitchRefusesAnotherUsersHabbo, TestAnotherUsersHabboCannotBeArchived, TestArchivingAHabboTwiceIsRefused]
- A user archives a habbo with a wrong password: "That is not your password.", and the habbo stays. [TestArchivingNeedsThePassword]
- A habbo is archived: it leaves the header's count of registered habbos and the landing's promo. [TestArchivedHabbosLeaveTheCounts]
- A guest opens the landing's promo feed: it holds at most 10 random habbos, each with Holo's imager options, and none in an empty hotel. [TestPromoFeedDescribesAHabbo, TestPromoFeedShowsAtMostTenRandomHabbos, TestPromoFeedOfAnEmptyHotel]
- A guest opens `/` with JavaScript off: the sign-in box, the join link and "Enable JavaScript" show. [browser: signed-out, 4 checks]

# habbos

- A habbo clicks its motto on `/me`: the field opens holding the motto, with the focus, and Cancel leaves without saving. [browser: me, 4 checks]
- A habbo reads an alert on `/me`: its line breaks show. [browser: me, 1 check]
- A habbo dismisses another habbo's alert: the alert stays. [TestMeCannotDismissAnotherHabbosAlert]
- A habbo without the club opens `/me`: Holo's "Join <short name> club »" offer shows. [browser: me, 1 check]
- A habbo changes its look within the first five seconds: the change counts once they end. [browser: looks, part of 7 checks]
- The five seconds have passed and the editor draws a look the club allows: Save changes opens at once and the notice goes; a forbidden look closes Save changes. [browser: looks, part of 7 checks]
- A habbo outside the club opens Looks wearing club items: the club notice shows, and Save changes stays closed. [browser: looks, part of 7 checks]
- A habbo saves a look with no figure, a bad figure or a bad gender: Holo's error shows, and the old look stays. [TestLooksRefusesABadLook]
- A habbo types a motto on `/account/profile`: the field takes 32 characters at most. [browser: details, 1 check]
- Staff open the habbo list: it comes in pages with Newer and Older links, and the pages count only the habbos the search finds. [TestTheListComesInPages, TestPagesDoNotCountWhatTheSearchHides]
- Staff read the habbo list: the last activity reads as Holo's column, seconds under 10 minutes, minutes up to 100 minutes, hours up to 24 hours, then days. [TestActivityReadsAsHolosColumn]
- Staff open an archived habbo: it shows as archived in the list, on its page and among its owner's habbos. [TestArchivedHabbosStayListedForStaff]
- Staff without `housekeeping.usersEdit` open a habbo: the page shows the habbo without edit forms. [TestTheHabboPageShowsFormsToEditorsAlone]
- Staff with `housekeeping.usersEdit` save a user's email, birth date, newsletter, tickets and film: they are saved, and one log row lists the fields that changed. [TestEditingAUser]
- Staff save a bad or taken email, a bad or future birth date, or tickets or film outside 0 to 2147483647: Holo's message refuses it, and nothing is saved or logged. [TestABadUserIsRefused]
- Staff save a motto over 38 characters, a bad figure or a bad gender: the change is refused, and nothing is saved or logged. [TestABadHabboIsRefused]
- Staff post fields beyond the forms', such as credits, level, name or owner: those fields stay as they are. [TestOnlyListedFieldsAreEdited]
- Staff restore a habbo that is not archived: "This habbo is not archived." [TestAHabboThatIsNotArchivedIsNotRestored]

# club

- A habbo buys months, then presses another buy button: the dialog counts the purse after the purchase, without a reload. [browser: club, 1 check]
- A habbo asks for a number of months other than 1, 3 or 6: one month is bought. [TestAnyOtherNumberOfMonthsBuysOne]
- A user with no club period wears `HC1` that staff gave: the badge stays. [TestHC1LeavesWhenTheClubEnds]
- A member hovers over the wardrobe: Holo's instructions show the number of slots, and leaving hides them. [browser: looks, 2 checks]
- A member presses a red arrow over a stored outfit: Holo's question asks first; Cancel keeps the outfit, and OK replaces it. [browser: looks, 3 checks]
- A member presses a green arrow: the outfit the editor already shows changes nothing, and one pressed while the editor loads is applied once the editor has drawn. [browser: looks, 2 checks]
- A habbo without the club opens Looks: a Join box shows in place of the wardrobe. [browser: looks, 1 check]
- Staff save a club price, the days of a month, the months limit or the wardrobe slots outside its bounds: the value is refused. [TestTheEconomySettingsKeepTheirBounds]

# economy

- A visitor opens `/credits`: the green box stands in the first column, and the purse above the blue box in the second. [browser: credits, 1 check]
- A habbo redeems a code: the purse shows the new balance and Holo's answer, green on success, in place of the field, without a reload. [browser: credits, 1 check]
- A Moderator opens Vouchers: they create and delete vouchers. [TestModeratorsManageVouchers]
- Staff save a Credits Page box outside its bounds: the value is refused. [TestTheEconomySettingsKeepTheirBounds]

# homes

- A visitor opens the home of an archived habbo: Holo's `Page not found!` page shows, and an edit of that home answers 404. [TestAHomeNobodyHasIsNotFound, TestAnArchivedHabbosHomeCannotBeEdited]
- A visitor opens the home of a banned user: Holo's banned page shows. [TestABannedUsersHomeSaysSo]
- A visitor searches a name in the header: the home of that habbo opens, and an empty search shows `Page not found!`. [TestTheHeadersSearchOpensAHome]
- The owner saves an item off the playground or a background it lacks: the save is refused. [TestSavingTheLayout]
- The owner saves the home with background 0: the home has no background. [TestSavingTheLayout]
- A habbo places a sticker: one copy leaves the inventory, "all" places every copy, and with none left it is refused. [TestPlacingAStickerTakesItFromTheInventory]
- A habbo places a background, an item it lacks, or an item off the playground: it is refused. [TestOnlyStickersAndNotesArePlaced]
- A habbo re-skins a sticker, or an item not on the home: it is refused. [TestAStickerTakesNoSkin]
- The owner removes a sticker in the editor: it leaves the home at once, without a save, and stays gone after Cancel. [browser: homes, 1 check]
- A habbo places a note longer than `homes.noteMaxLength`, or with a skin it may not use: it is refused, and the inventory stays. [TestANoteHasALengthAndASkin]
- A habbo places a note: the answer carries the note formatted, so it shows at once. [TestAPlacedNoteAnswersWithItsHTML]
- A habbo opens the Webstore: it lists Holo's categories, and a category lists only the items on sale. [TestTheStoreListsHolosCategories, TestACategoryListsWhatIsSold]
- A habbo buys an item that is not on sale: the purchase is refused. [TestWhatIsNotSoldCannotBeBought]
- A habbo buys a note pack: five notes go to the inventory. [TestANotePackGivesFiveNotes]
- A user archives a habbo: the background of its home goes back to the user's inventory too, and the profile widget stays. [TestArchivingReturnsTheHomesStickersAndNotes]
- Staff add an item: its kind follows the art's folder, sticker or background, whatever the category. [TestTheKindComesFromTheFolder]
- Staff add an item with a price from 0 to 2147483647: the item is saved at that price, with its name trimmed. [TestTheNameIsTrimmedAndAPriceCanBeZero]
- Staff open the store: it lists the art, the categories, and each item with its category selected. [TestThePageListsWhatTheFormsNeed]
- The store has no categories: it opens empty, and a new item is refused with "This category does not exist." [TestTheStoreWorksWithoutCategories]

# groups

- A habbo opens the group purchase from the page or from the header's My Groups: Holo's form shows the price and the badge. [browser: groups, part of 3 checks]
- A habbo presses Back after a refused purchase: the form comes back empty. [browser: groups, part of 3 checks]
- A habbo joins a full Regular group: "This group is full.", and archived members leave the count. [TestAFullRegularGroupTakesNoOne]
- A habbo with `groups.maxMemberships` memberships and requests joins any group, one it is in included: Holo's limit message shows before any other answer. [TestTheMembershipLimitComesFirstAndCountsRequests]
- A habbo with a waiting request is archived: its request leaves the count and the list of requests. [TestMembersAndRequestsLeaveOutArchivedHabbos]
- A habbo makes a group its favourite, or leaves a group, while it is not a member: it is refused. [TestLeavingAndTheFavourite]
- A habbo cancels one of Holo's group dialogs: nothing changes. [browser: groups, 1 check]
- An admin ticks members: Give rights turns on for members, Revoke rights for admins and Remove for anyone; with nobody ticked, every action is off. [browser: groups, 4 checks]
- Anyone opens a group's home: it writes nothing, and a waiting request stays. [TestViewingAGroupWritesNothing]
- Anyone opens an Exclusive group's home: it shows Holo's Exclusive icon. [TestAnExclusiveGroupShowsItsIcon]
- An admin opens Edit on a group's home: Holo's menu offers Settings, Members, Badge and Modify page. [browser: groups, 1 check]
- An admin opens Modify page: the skins come in Holo's order, with the club and staff skins for those who may use them. [TestTheGroupEditMenuKeepsHolosSkinOrder]
- An admin edits a group's home: the Group information widget's menu offers its skins, without Remove. [browser: groups, part of 4 checks]
- An admin edits a group's home with Group Members placed: it shows greyed out in the inventory. [browser: groups, part of 4 checks]
- An admin edits a group's home: Holo's warning marks only the items another user placed. [browser: groups, part of 4 checks]
- A habbo presses the minus of the info box in a MY GROUPS widget: the list comes back. [browser: groups, part of 2 checks]

# forum

- A board has no thread: it says so; a board of stickies alone is not empty. [TestAnEmptyBoardSaysSo]
- A post is deleted: its thread's row shows the post before it as the last one, with one reply less. [TestCountsAndLastPostsFollowTheirPosts]
- A signed-in habbo opens a closed thread: Holo's Closed Thread shows in place of Post reply. [browser: forum, part of 3 checks]
- A habbo presses Post reply: the form opens under the posts, and the button hides. [browser: forum, 1 check]
- Staff open the Discussion Board Module: Forum Enabled, Smilies Enabled and Spam Check (30 seconds) show in Holo's order, and Group Purchasing Enabled stays in the general options. [TestTheDiscussionBoardModuleHasHolosFields]
- A habbo reports a post that does not exist: Holo's "Invalid post specified" shows with 404, and nothing is written. [TestReportsOfMissingPostsAndByGuestsWriteNothing]

# news

- Anyone opens an article without an author: it shows no author. [TestAnArticleWithoutAnAuthorHasNone]
- Staff open the news: the articles show newest first, with title, summary, date and author. [TestTheListIsNewestFirst]
- Staff format a selection with the toolbar: the story holds that BBCode, and an untouched story keeps its BBCode. [browser: housekeeping-news, 3 checks]
- Staff type, pick or upload a top-story picture: the preview follows the field, and a thumbnail in Uploaded fills the field and the preview. [browser: housekeeping-news, part of 5 checks]
- Staff drag or zoom a picture in Cut: it follows the drag up to the picture's edge, and zoom keeps the middle of the frame. [browser: housekeeping-news, part of 3 checks]
- Staff upload a picture: every article stays as it is until one is saved with the picture. [TestAnUploadLeavesTheArticleAlone]
- Staff open Uploaded with no picture uploaded: it says so. [browser: housekeeping-news, part of 5 checks]
- Staff save an article with an uploaded picture as its top story: the article links the picture, and another address unlinks it. [TestAnArticleLinksItsUploadedPicture]
- Staff save an article whose picture was deleted meanwhile: it is refused with what was typed, and nothing changes. [TestAPictureDeletedMeanwhileIsRefused]
- Staff open Uploaded Images at a page past the last: the last page shows, and a page that is no number shows the first. [browser: housekeeping-images, 1 check]
- Staff open Uploaded Images without JavaScript: every picture is listed. [browser: housekeeping-images, 1 check]
- Staff click an article named in Uploaded Images: its edit form opens. [browser: housekeeping-images, 1 check]

# community

- Staff add a banner with no text: it is saved. [TestABannerNeedsNoText]
- Staff save a banner with any status other than 1: it is disabled. [TestTheStatusIsHolos]
- A hotel with no staff: the staff page lists nobody. [TestNoStaffYet]
- A member's chosen habbo is archived: the staff page shows the member's first habbo. [TestTheStaffListShowsEachMemberOnceUnderTheHighestListedGroup]
- Every habbo of a member is archived: the staff page leaves the member out. [TestTheStaffListShowsEachMemberOnceUnderTheHighestListedGroup]
- Anyone reads a staff member's Last Visit: it is the last time a session saw the habbo, else its last sign-in. [TestTheLastVisitIsTheLastTimeTheHabboWasSeen]

# tags

- A visitor opens the landing, or fails to sign in there: the tag cloud shows. [TestTheLandingCarriesTheTagCloud]

# moderation

- Staff open Bans: the active bans show, and an expired or lifted ban leaves the list. [TestTheListShowsActiveBans]
- Staff save Question Length in the Help settings form: it takes 1 to 65535 characters, the forum's post limit (decision holo-port/0109). [TestTheHelpSettingStopsAtTheForumsLimit, TestTheHelpFormHoldsTheQuestionLength]
- A habbo presses Close in the Help Tool window: it shuts. [browser: forum, part of 2 checks; help, 1 check]
- A habbo clicks another report flag while the Help Tool window is open: the window moves to the new report. [browser: forum, part of 2 checks]
- Staff refresh Help Queries: "Overview refreshed." [TestRefreshingTheOverview]
- A holder of `housekeeping.help` opens the Me page: it counts the help requests not closed. [TestMeShowsTheHelpCountToHelpStaff]
- Staff pick up a closed request: it is refused with "already picked up". [TestAClosedTicketCannotBePickedUp]
- Staff without `housekeeping.help` open the alert form for a request: the form opens without the request. [TestTheAlertFormHidesATicketFromThoseWhoCannotReadIt]

# ranks

- Staff open, change or delete something that does not exist, or name a habbo that is not the user's: the answer is 404, and nothing changes. [TestDeletingAGroupThatDoesNotExistIsNotFound, TestMembershipPostsNeedARealGroupAndUser, TestDeletingAnImageThatDoesNotExist, TestEditingAnItemThatDoesNotExistIsNotFound, TestAHabboThatDoesNotExistIsNotFound, TestAHabboWithoutTransactionsHasAnEmptyLedger, TestAnUnknownSectionIsNotFound, TestTheFormNamesOneOfTheUsersHabbos, TestAttributesNameOneOfTheUsersHabbos]
- A holder of `housekeeping.accessGroups` opens Access Groups: every staff member shows with their group. [TestTheStaffList]
- A manager gives a group or a user an attribute outside the catalogue, or a user a fuse directly: "Only the attributes of the catalogue can be given.", and nothing changes. [TestOnlyTheCatalogueCanBeGiven, TestOnlyTheCatalogueFusesCanBeGiven, TestOnlyTheCatalogueCanBeGivenDirectly, TestFusesAreNotGivenDirectly]
- Staff save anything unchanged: nothing is written, and the staff log gains no row. [TestSavingAGroupUnchangedLogsNothing, TestRemovingSomeoneWhoIsNotAMemberChangesNothing, TestChangingTheDisplayHabbo, TestSavingABannerUnchangedLogsNothing, TestSavingAnArticleUnchangedLogsNothing, TestSavingAnItemUnchangedLogsNothing, TestSavingTheSameNoteChangesNothing]
- Staff read a staff log row: it names the user by its first habbo, and the target by the habbo it names. [TestStaffLogsNameTheActorAndTheTarget]
- Staff open an empty Staff Logs: one empty page shows, with no Newer or Older link. [TestAnEmptyLogHasOnePage]

# navigator

- A habbo searches for `%` or `_`: the rooms whose name holds that character come up. [TestSearchRoomsMatchesTheNameOrTheOwner]
- An owner, or staff with `fuse_see_all_roomowners`, searches by the owner's name: the room that hides its owner comes up. [TestASearchNeverGivesAHiddenOwnerAway]
- A habbo adds a room it already holds to its favourites: the room is listed once. [TestAFavouriteNamesOneRoomOnce]

# rooms

- A habbo heads for another room before a door answers: the late answer leaves it outside. [TestAHabboIsAdmittedOnlyWhereItHeads]
- A room ban reaches its end: the habbo enters again, and a second ban sets the new end. [TestARoomBanEnds]
- A room's height map marks each tile: `x` blocks it, and a digit or `A` to `H` gives its height; a habbo walks only on open tiles. [TestTheFloorReadsTheHeightMapAsTheClientDoes]
- A habbo ignores a habbo it already ignores: the list holds it once. [TestAnIgnoreList]

# furnis

- A furni's name, description or text holds a character the client reads as a separator: it shows with a space in its place, and the rest of the message stays whole. [TestAProductLineByKindOfItem, TestAHandValueKeepsItsPlace]
- A habbo places a furni on a rug: it stands on it; on a seat, a bed or a flat solid, it stays in the hand. [TestWhereMoreFurniMayStand]
- A furni faces east or west: its length and width swap on the floor. [TestAFurniCoversTilesByItsDirection]
- Furni stand stacked on a tile: the highest, and of two as high the newer, decides whether a habbo walks, sits or lies there. [TestTheHighestFurniDecidesATile]

# hotel-login

- A guest asks for a ticket: none is made. [TestSSOTicketNeedsASession]
- A client connects: it gets HELLO first. [TestServeSendsHelloFirst]
- The server has a message the client would read wrongly, such as a character 1 in its body or an id past 4095: it sends none of it. [TestEncodePacketRefusesABodyThatHoldsTheCharacter1, TestEncodePacketRefusesAnIdBeyondTwoB64Characters]
- A client sends a malformed or cut-short packet: only its session closes. [TestReadPacketRefusesALengthTooShortForTheId, TestReadPacketCutShort, TestServeClosesTheSessionOnAMalformedLength, TestServeClosesTheSessionOnAPacketCutShort, TestInfoClosesOnlyTheSessionWithAMalformedLength]
- A client sends a command no handler takes: the server logs its name and goes on. [TestServeLogsAPacketThatNoHandlerTakesAndGoesOn, TestInfoSendsHelloAndLogsAnUnhandledCommandByName]
- A client sends any packet: the log leaves its body out (decision server/0021). [TestServeNeverLogsABody, TestInfoNeverLogsABody]
- A client sends commands: they run in the order it sent them, and its messages arrive in the order the server sent them. [TestServeRunsTheHandlerOfEachIdInOrder, TestTheOutboxKeepsTheOrderOfTheMessages, TestEndWritesWhatWasSentBefore]
- A client stops reading its messages: it is closed. [TestAClientThatStopsReadingIsClosed]
- Two clients play at once: each runs at its own pace. [TestSessionsDoNotWaitOnEachOther]
- A client sends a habbo's command before LOGIN_OK: it gets no answer. [TestCommandsOfALoggedInHabboWaitForTheLogin]
- A client sends a latency test: it gets its id back. [TestTheLatencyTestInBytes]
- A client asks for the server's date: it gets today's date. [TestTheServerDate]
- Staff set the ping timeout no longer than the ping interval: the value is refused. [TestThePingTimeoutIsLongerThanTheInterval]

# client

- A client connects over TCP or a WebSocket: bytes travel both ways, text frames carry their bytes, and a close on either side ends the session. [TestConnCarriesBytesBothWays, TestConnClosesWhenTheClientCloses, TestConnClosesWhenTheServerCloses, TestConnClosesWhenTheHandlerReturns, TestWebSocketReadsTextFramesAsTheirBytes]
- A WebSocket without an Origin header connects: it is refused. [TestWebSocketRefusesAMissingOrigin]

# hotel-settings

- Staff save an address setting: an ad takes nothing or an absolute http or https URL, the housekeeping address a path or such a URL, and the imager a URL with a path and no query; anything else is refused. [TestAnAdIsEmptyOrAnAbsoluteURL, TestHousekeepingURLTakesAPathOrAURL, TestImagerTakesAPath]
- Mail has a host and a from address: mails go through that server, signed in with `mail.username` when it is set. [TestSendDeliversAMessage, TestSendAuthenticatesWhenConfigured]
- Mail has no host or no from address: no mail goes out. [TestSendWithoutAHostIsDisabled, TestSendNeedsAFromAddress]
- The mail server does not answer: the mail is given up. [TestSendGivesUpOnAServerThatDoesNotAnswer]
- Staff open any settings form: it offers the settings, without the startup keys of `config.json` or the hidden settings. [TestNoFormOffersWhatHasNoPlaceThere]
- Staff write a BBCode box in the settings: the editor shows it as the site will; without JavaScript it is a plain field. [browser: housekeeping-settings, 2 checks]
- The site is closed: its files, such as pictures and styles, still load. [TestMaintenance]
- A hotel without setting rows: every setting holds its default. [TestLoadWithoutRowsHoldsDefaultsAndConfig]
- A stored setting holds a bad value, a key nothing declares, or a `config.json` key: it is ignored, the default or the config value applies, and the log names it once per reason. [TestInvalidRowsAreIgnoredAndLogged, TestReloadLogsABadRowOnce, TestUndeclaredAndConfigRowsAreIgnoredAndLogged]
- Stored settings break a rule together: those rows go back to their defaults, and the log names them. [TestRowsBreakingARuleGoBackToTheirDefaults, TestRowBreakingARuleWithADefaultIsIgnored]

# installer

- The config step gets a bad value, such as a port out of range: no `config.json` and no database are written. [TestCreateRejectsAnInvalidConfig, TestConfigureRefusesAnInvalidConfig]
- The config step meets a `config.json` that already exists: it is refused, and nothing is written. [TestCreateRefusesAnExistingFile]
- The administrator step gets a password shorter than 6 characters: the form is refused with "Passwords are 6 to 25 characters." [TestCreateAdministratorValidates, TestInstallation]
- The administrator step gets a malformed email, an email with a display name, no birth date, or a birth date in the future or before 1920: the form is refused. [TestCreateAdministratorValidates, TestInstallation]
- The hotel holds several access groups that manage access: the administrator joins the highest of them, Administrator. [TestCreateAdministratorJoinsTheHighestGroupThatManagesAccess]
- No access group can manage access: the administrator step is refused, and no user is created. [TestCreateAdministratorNeedsAGroupForIt]

# updates

- A hotel stands at its last automatic update: staff sign in, and the update page lists the waiting updates. [TestTheUpdatePageOpensOnTheDatabaseStartUpLeaves]
- The game server starts with an update waiting: it loads the navigator and the catalogue once every update is applied (decisions server/0064, server/0098). [TestTheNavigatorWaitsForTheUpdates]
- `config.json` holds every current key: the update page lists nothing to add or drop, and saving leaves the file as it was. [TestDifferencesFindsNothingInACurrentFile]

# platform

- A program starts: it reads `config.json` from its working directory only, whatever the environment variables hold. [TestLoadUsesWorkingDirectory, TestNoEnvironmentVariableConsulted]
- `config.json` is not valid JSON or cannot be read: the program stops, and the error names `config.json`. [TestLoadRejectsInvalidJSON, TestLoadRejectsUnreadableFile]
- `config.json` lacks a key or holds one nothing reads: the program uses the default and leaves the file as it was. [TestLoadLeavesExistingFileByteIdentical, runKeyCases "missing key"]
- A key of `config.json` has a wrong type, a value out of range, two equal game ports, or `proxy.enabled` with no trusted proxy: the program stops, and the error names `config.json`, the key and what it expects. [TestStoreKeys, TestCMSKeys, TestHousekeepingKeys, TestProxyKeys, TestServerKeys, TestRebornKeys, TestServerRefusesInfoAndMUSOnOnePort, TestProxyEnabledNeedsATrustedProxy, TestValidateHost, TestValidatePort, TestValidatePath, TestValidateTrusted, TestRealIPRejectsInvalidTrustedEntries]
- A game port is taken: the game server stops with an error. [TestStartReturnsAnErrorWhenItCannotListen, TestServeTCPReturnsNilOnceTheListenerCloses, TestServeTCPReturnsAFailedAccept]
- A client connects to the MUS port: the server logs what it sends and never answers (decision server/0023). [TestMusLogsWhatItReceivesAndNeverAnswers]
- Housekeeping and the CMS share one mux: each serves its own pages and files, and one sign-in opens both. [TestItSharesAMuxWithTheCMS]
- Staff sign in on the site and open housekeeping on its own port: housekeeping knows them and the active habbo, and signing out on the site ends housekeeping too. [browser: together, 3 checks]
- A task is scheduled every N seconds, minutes, hours or days: it first runs one interval later, then once each interval. [TestEveryRunsOnceEachInterval, TestEveryMultipliesTheUnit, TestEverySecondsCountsSeconds]
- A scheduled run fails or panics: the failure is logged, and the task keeps its schedule. [TestAFailedRunIsLoggedAndKeepsTheSchedule]
- A run outlasts its interval: the task runs once at a time and skips the runs it covers. [TestATaskNeverOverlapsItself]
- A scheduled task is stopped: it runs no more, not even a tick that was already due. [TestStopEndsTheTask, TestAPendingTickDoesNotOutliveStop]
- A scheduled task is stopped during a run: that run is cancelled. [TestStopCancelsARunInProgress]

# look-and-feel

- A visitor opens the maintenance page: the title is the bare short name. [browser: maintenance, 1 check]
- A signed-in habbo opens a page: the title reads `<short name> ~ <habbo name>`. [browser: signed-out, 1 check; me, 1 check]
- Staff read their previous login: it is their last successful sign-in before the newest, and failed sign-ins do not count. [TestPreviousLoginIsTheOneBeforeTheNewest]
- Staff read the clock box: the local and server times tick each second. [browser: housekeeping-admin, 1 check]
- Staff follow any link of housekeeping's tabs and menu boxes: the page opens. [browser: housekeeping-admin, 1 check]
- Staff read a data list in housekeeping: its rows alternate in shade. [browser: housekeeping-admin, 1 check]
- A text holds BBCode tags in any case: each turns into its HTML. [TestFormatTags, TestFormatIgnoresCase, TestFormatFollowsHolosPasses]
- A text holds line breaks: they show as line breaks. [TestFormatLineBreaks]
- A text holds an unknown or unclosed tag: it stays as typed. [TestFormatUnclosed]
- A link tag holds an address other than http or https: it stays as typed. [TestFormatLinks]
- A colour tag holds a name outside Holo's colours: it stays as typed. [TestFormatColours]
- A text holds HTML: it shows escaped. [TestFormatEscapes]
- A text holds a smiley: it shows as its picture, found before the text is escaped. [TestFormatSmilies, TestFormatFindsSmiliesBeforeEscaping]
- Any text is formatted: the HTML that comes out is well formed. [TestFormatIsWellFormed]

# checks

- A Go project that fails vet, `make check` runs: it fails and names the file. [TestGoProjectThatFailsVetFails]
- A Go project that does not build, `make check` runs: it fails and shows the build error. [TestGoProjectThatFailsToBuildFails]
- A package script that fails, `make check` runs: it fails. [TestPackageScriptThatFailsFails]
- `make check` runs at the root: it leaves out the browser suites. [TestRootRunsEveryProjectAndTheKnowledgeCheck]
- One project wrong, `make check` runs at the root: it stops before the knowledge check. [TestRootFailsAndNamesTheProjectThatFails]
- A name is empty, starts with a digit, or holds a capital, an underscore or a slash: `make create` refuses it. [TestValidateName]
- A name whose Go package would not compile in the template, such as a keyword, `main` or a name the template uses: a template with Go refuses it and names the Go package, and a client accepts it. [TestValidateNameRefusesNamesWhoseGoPackageCannotCompile, TestTakenHoldsTheNamesTheTemplatesUse]
- The name is `internal`, `testdata` or `vendor`: a template with Go refuses it, and a client accepts it. [TestValidateNameRefusesNamesTheGoToolTreatsSpecially]
- A name holds a dash: its folders keep the dash, its Go package drops it, and the project compiles. [TestWriteDropsTheDashFromThePackageName, TestWriteGeneratesFormattedFiles]
- A new project gets ports from its name: the same ports each time, in separate app, Astro and Vite ranges. [TestPorts, TestVitePortOfTheDecisionExample]
- `make create` runs as a dry run: it lists only the folders and servers its template has. [TestPlanFollowsTheTemplate]
- `make create` makes a backend: it holds no frontend files; a client holds no Go and no apps/ folder. [TestWriteGeneratesTheBackendShape, TestWriteGeneratesTheClientShape]

# Replaced

- accounts: "A banned user signs in with the right password: the ban page shows the reason and the end, or "This ban does not expire.", with 403."
  becomes "A banned user signs in with the right password: the landing page shows "You have been banned!" with the reason and the end, or "This ban does not expire.", as the sign-in error with 422, and no session starts." [TestSignInShowsTheBan]
- accounts: "A user is banned while signed in: the next page ends the session and shows the ban."
  becomes "A user is banned while signed in: the next page ends the session and shows the ban page with the reason and the end, with 403." [TestBanEndsTheSessionOnTheNextPage]
- look-and-feel: "A visitor opens a signed-out page: the title reads `<short name> ~ Home`, and `/register` reads `<short name> ~ Register`."
  becomes "A visitor opens a signed-out page other than the maintenance page: the title reads `<short name> ~ Home`, and `/register` reads `<short name> ~ Register`." [browser: maintenance, 1 check]

# Left out, for you to decide

- accounts: "A session expires: the next scheduled run deletes it." [TestDeleteExpiredSessions]: no user sees it.
- accounts: "A user whose password was saved under older hash settings signs in: the sign-in succeeds." [TestLoginRehashesOldPasswords]: close to a detail.
- economy: "Staff open the transactions of a habbo whose user has none: the ledger is empty." [TestAHabboWithoutTransactionsHasAnEmptyLedger]: a trivial edge.
- club: "A new hotel: `club.price1Month`, `club.price3Months` and `club.price6Months` are 20, 50 and 80 credits, `club.daysPerMonth` is 31 and `club.maxMonths` is 6." [TestTheEconomySettingsHoldHolosValues]: default values, as the groups line below.
- club: "A new hotel: `homes.wardrobeSlots` is 5." [TestTheEconomySettingsHoldHolosValues]: a default value, as the groups line below.
- groups: "Staff open the Groups settings form of a new hotel: it holds Holo's numbers, price 20, 3 groups owned, 10 memberships, 500 members, names of 25 and descriptions of 200 characters." [TestTheGroupsFormHoldsHolosNumbers]: default values.
- hotel-settings: "A new hotel: every game setting holds the value its feature's spec names." [TestTheGameSettingsHoldTheirDefaults]: default values; too wide.
- groups: "An admin removes the Group information widget: it stays on the home, back in its corner with the default skin." [TestTheGroupInformationWidgetGoesBackToItsCorner]: the two agree in the code: the editor's menu hides Remove for the profile and Group information widgets (`packages/cms/src/components/homes/home-editor.svelte`), and `POST /homes/{id}/items/{item}/delete` (`packages/cms/internal/router/homes_items_delete.go`) moves either widget back to 25, 25 in the default skin when a request names it, as Holo wrote them again in their corner. The spec holds the browser line; the server line covers a request sent by hand.
- look-and-feel: "Anyone opens a page: Holo's title, headings, labels and columns show, with its tab, sub-tab or menu place marked." [browser: about 44 checks]: one line for about 44 checks; each feature could hold its own texts instead.
- look-and-feel: "Anyone opens a page of the site or of housekeeping: no request fails and no script error is thrown." [browser: 26 suites, 37 checks]: reads as a guard.
- look-and-feel: "A visitor opens a page: every picture it shows loads." [browser: club, 1 check]: reads as a guard, as the line above.
- look-and-feel: "A page shows a select whose options the server fills in: it shows only the options, with no stray marker text." [TestResolversRemoveTheSvelteSelectMarker]: a detail of the page templates.
- hotel-login: "A client and the server write and read numbers, flags, strings and packet frames: each reads exactly what the other wrote, as the client's own scripts do." [TestVL64, TestB64, TestString, TestReadPacketReadsTheClientsCommands, and 15 more]: protocol plumbing.
- ranks: "A page's address asks for a message with no matching change: no message shows." [TestAMessageShowsOnlyACode, TestAMessageShowsOnlyARealBan, TestAMessageShowsOnlyAnAmount, TestAPlainPageHasNoMessage]: a detail.
- moderation: "Staff read Help Queries: each habbo links to its home by its escaped name." [TestTheQueueLinksToAHomeByItsEscapedName]: a detail.
