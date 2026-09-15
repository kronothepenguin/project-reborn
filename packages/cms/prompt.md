/speckit.specify CMS, the content management system:

1. index view:
- signed out layout
- header, logo, online users count -- online users are connected to server, not logged users --, 
- register banner
- login card, username + password inputs, remember me checkbox, sign in button, register link, forgot password link. form is http. on failure show errors in index view, on success redirect to "me view"
- tag section, shows users' tags with weight and font-size based on how many users have the tag
- footer, homepage link, terms of service link, privacy policy link, copyright

2. register view:
- signed out layout
- username card, username input, search button to make ajax request for username 
availability
- details card, password input, confirm password input, birth date selects, email input, confirm email input, newsletter checkbox, terms of service subbox with checkbox.
- avatar figure box, provide options between girls and boys.
- exit registration link (back to index), continue submit button (http form submit). on failure show errors in register view, on success redirect to "me view".
- footer, homepage link, terms of service link, privacy policy link, copyright

3. signed out layout:
- card centered horizontally and vertically

4. signed in layout:
- top navbar box, my friends popover, my groups popover, my rooms popover, help link, sign out link. popovers are dynamic, load the contents using ajax.
- enter client link (opens window popup to "client view"), search input + search buton to find other users
- navbar, me link, community link, credits link, housekeeping link (admin only). selected page shows link as span text

5. me view:
- signed in layout
- subnav box, homepage link, my page link, account settings link, club link. selected subpage shows text as span
- avatar card, link-button to open client window, username span, span + input to modify motto using ajax call, change look link, credits link, join club link, last signed in time
- my messages card, inbox tab, sent tab, trash tab, compose button, refresh button. only read checkbox. fully functional ajax mailbox
- avatars, invite friends tab, search avatar tab. the search avatar tab has input + button to do an ajax search for other users
- events card, categories select, ajax search for in-game room events
- news card, slider with 3 news, the first one shows up bg image, title + summary + read more link, second news bottom title + description, third news bottom title + description. more news link.
- recommended card, i don't have info now
- tags card, my tags tab with tags list and input + button for adding tag using ajax, others like... tab with input + button for searching tags.
- groups card, my groups tab with create/buy a group button that opens a dialog with group name input + group description textbox + cancel button + purchase button,
