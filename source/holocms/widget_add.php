<?php
/*===================================================+
|| # HoloCMS - Website and Content Management System
|+===================================================+
|| # Copyright © 2008 Meth0d. All rights reserved.
|| # http://www.meth0d.org
|+===================================================+
|| # HoloCMS is provided "as is" and comes without
|| # warrenty of any kind. HoloCMS is free software!
|+===================================================*/

require_once('core.php');
require_once('includes/session.php');

$check = mysql_query("SELECT groupid,active FROM cms_homes_group_linker WHERE userid = '".$my_id."' AND active = '1' LIMIT 1") or die(mysql_error());
$linked = mysql_num_rows($check);
if($linked > 0){
    $link_info = mysql_fetch_assoc($check);
    $groupid = $link_info['groupid'];
    if(!is_numeric($groupid)){ exit; }
    $check = mysql_query("SELECT ownerid FROM groups_details WHERE id = '".$groupid."' LIMIT 1");
    $exists = mysql_num_rows($check);
        if($exists < 1){
            $linked = 0;
            $groupid = -1;
        } else {
            $tmp = mysql_fetch_assoc($check);
            $ownerid = $tmp['ownerid'];
            $linked = 1;
        }
}

$widgetid = $_POST['widgetId'];
$zindex = $_POST['zindex']; if(!is_numeric($zindex)){ exit; }
$privileged = $_POST['privileged']; // dunno what it is, but it's always either true or false

if(!empty($widgetid)){
    if($widgetid == "1"){ exit; } // User Profile / Group Profile; system default; can't be placed
    elseif($widgetid == "2" && $linked < 1){ $widget = "2"; }
    elseif($widgetid == "3" && $linked > 0){ $widget = "3"; }
    else { exit; }
    
    if($widget == "2" && $linked < 1){
        
        mysql_query("INSERT INTO cms_homes_stickers (userid,groupid,type,subtype,skin,x,y,z) VALUES ('".$my_id."','-1','2','2','defaultskin','20','20','".$zindex."')") or die(mysql_error());
        
        $ret_sql = mysql_query("SELECT id FROM cms_homes_stickers WHERE userid = '".$my_id."' AND groupid = '-1' AND type = '2' ORDER BY id DESC LIMIT 1") or die(mysql_error());
        $ret_row = mysql_fetch_assoc($ret_sql);
        $saved_id = $ret_row['id'];
        
        $edit = "\n<img src=\"http://images.habbohotel.co.uk/habboweb/21_5527e6590eba8f3fb66348bdf271b5a2/14/web-gallery/images/myhabbo/icon_edit.gif\" width=\"19\" height=\"18\" class=\"edit-button\" id=\"widget-" . $saved_id . "-edit\" />
<script language=\"JavaScript\" type=\"text/javascript\">
Event.observe(\"widget-".$saved_id."-edit\", \"click\", function(e) { openEditMenu(e, ".$saved_id.", \"widget\", \"widget-".$saved_id."-edit\"); }, false);
</script>\n";
        
        $groups = mysql_evaluate("SELECT COUNT(*) FROM groups_memberships WHERE userid = '".$my_id."' LIMIT 1");
		
			echo "<div class=\"movable widget GroupsWidget\" id=\"widget-".$saved_id."\" style=\" left: 20px; top: 20px; z-index: ".$zindex.";\">
<div class=\"w_skin_defaultskin\">
	<div class=\"widget-corner\" id=\"widget-".$saved_id."-handle\">
		<div class=\"widget-headline\"><h3><span class=\"header-left\">&nbsp;</span><span class=\"header-middle\">MY GROUPS (<span id=\"groups-list-size\">".$groups."</span>)</span><span class=\"header-right\">".$edit."</span></h3>
		</div>	
	</div>
	<div class=\"widget-body\">
		<div class=\"widget-content\">

<div class=\"groups-list-container\">
<ul class=\"groups-list\">";

$get_groups = mysql_query("SELECT * FROM groups_memberships WHERE userid = '".$my_id."'") or die(mysql_error());
while($membership_row = mysql_fetch_assoc($get_groups)){
	$get_groupdata = mysql_query("SELECT * FROM groups_details WHERE id = '".$membership_row['groupid']."' LIMIT 1") or die(mysql_error());
	$grouprow = mysql_fetch_assoc($get_groupdata);
	
	echo "	<li title=\"".$grouprow['name']."\" id=\"groups-list-".$saved_id."-".$grouprow['id']."\">
		<div class=\"groups-list-icon\"><a href=\"group_profile.php?id=".$grouprow['id']."\"><img src=\"./habbo-imaging/badge.php?badge=".$grouprow['badge']."\"/></a></div>
		<div class=\"groups-list-open\"></div>
		<h4>
		<a href=\"group_profile.php?id=".$membership_row['groupid']."\">".$grouprow['name']."</a>
		</h4>
		<p>
		Group created:<br />"; 
		if($membership_row['is_current'] == 1){ echo "<div class=\"favourite-group\" title=\"Favourite\"></div>\n"; }
		if($membership_row['member_rank'] > 1 && $grouprow['ownerid'] !== $my_id){ echo "<div class=\"admin-group\" title=\"Admin\"></div>\n"; }
		if($grouprow['ownerid'] == $my_id && $membership_row['member_rank'] > 1){ echo "<div class=\"owned-group\" title=\"Owner\"></div>\n"; }
		echo "<b>".$grouprow['created']."</b>
		</p>
		<div class=\"clear\"></div>
	</li>";
	
}

echo "</ul></div>

<div class=\"groups-list-loading\"><div><a href=\"#\" class=\"groups-loading-close\"></a></div><div class=\"clear\"></div><p style=\"text-align:center\"><img src=\"http://images.habbohotel.co.uk/habboweb/22_66afcf07d8b708feecf6e2e0e797ec09/19/web-gallery/images/progress_bubbles.gif\" alt=\"\" width=\"29\" height=\"6\" /></p></div>
<div class=\"groups-list-info\"></div>

		<div class=\"clear\"></div>
		</div>
	</div>
</div>
</div>

<script type=\"text/javascript\">	
document.observe(\"dom:loaded\", function() {
	new GroupsWidget('".$my_id."', '".$saved_id."');
});
</script>";
    } elseif($widget == "3" && $linked > 0){
        
        mysql_query("INSERT INTO cms_homes_stickers (userid,groupid,type,subtype,skin,x,y,z) VALUES ('".$my_id."','".$groupid."','2','3','defaultskin','20','20','".$zindex."')") or die(mysql_error());
        
        $ret_sql = mysql_query("SELECT * FROM cms_homes_stickers WHERE userid = '".$my_id."' AND groupid = '".$groupid."' AND type = '2' AND subtype = '3' ORDER BY id DESC LIMIT 1") or die(mysql_error());
        $ret_row = mysql_fetch_assoc($ret_sql);
        $saved_id = $ret_row['id'];
        
        $edit = "\n<img src=\"http://images.habbohotel.co.uk/habboweb/21_5527e6590eba8f3fb66348bdf271b5a2/14/web-gallery/images/myhabbo/icon_edit.gif\" width=\"19\" height=\"18\" class=\"edit-button\" id=\"widget-" . $saved_id . "-edit\" />
<script language=\"JavaScript\" type=\"text/javascript\">
Event.observe(\"widget-".$saved_id."-edit\", \"click\", function(e) { openEditMenu(e, ".$saved_id.", \"widget\", \"widget-".$saved_id."-edit\"); }, false);
</script>\n";
        
        $members = mysql_evaluate("SELECT COUNT(*) FROM groups_memberships WHERE groupid = '".$groupid."' AND is_pending = '0'");
        
        echo "<div class=\"movable widget MemberWidget\" id=\"widget-".$saved_id."\" style=\" left: 20px; top: 20px; z-index: ".$zindex.";\">
<div class=\"w_skin_defaultskin\">
	<div class=\"widget-corner\" id=\"widget-".$saved_id."-handle\">
		<div class=\"widget-headline\"><h3><span class=\"header-left\">&nbsp;</span><span class=\"header-middle\">Members of this group (<span id=\"avatar-list-size\">".$members."</span>)</span><span class=\"header-right\">".$edit."</span></h3>
		</div>	
	</div>
	<div class=\"widget-body\">
		<div class=\"widget-content\">\n";

//<div id=\"avatar-list-search\">
//<input type=\"text\" style=\"float:left;\" id=\"avatarlist-search-string\"/>
//<a class=\"new-button\" style=\"float:left;\" id=\"avatarlist-search-button\"><b>Search</b><i></i></a>
//</div>
echo "<br clear=\"all\"/>

<div id=\"avatarlist-content\">

<div class=\"avatar-widget-list-container\">
<ul id=\"avatar-list-list\" class=\"avatar-widget-list\">";

$get_admins = mysql_query("SELECT userid FROM groups_memberships WHERE groupid = '".$groupid."' AND is_pending = '0' AND member_rank > 1") or die(mysql_error());

while($membership = mysql_fetch_assoc($get_admins)){

	$userrow = mysql_query("SELECT id,name,figure,hbirth FROM users WHERE id = '".$membership['userid']."' LIMIT 1") or die(mysql_error());
	$found = mysql_num_rows($userrow);

	if($found > 0){
		$userrow = mysql_fetch_assoc($userrow);

		echo "<li id=\"avatar-list-".$groupid."-".$userrow['id']."\" title=\"".$userrow['name']."\">
<div class=\"avatar-list-open\">
	<a href=\"#\" id=\"avatar-list-open-link-".$groupid."-".$userrow['id']."\" class=\"avatar-list-open-link\"></a>
</div>
<div class=\"avatar-list-avatar\">
	<img src=\"http://www.habbo.co.uk/habbo-imaging/avatarimage?figure=".$userrow['figure']."&size=s&direction=2&head_direction=2&gesture=sml\" alt=\"\" />
</div>
<h4>
	<a href=\"user_profile.php?name=".$userrow['name']."\">".$userrow['name']."</a>
</h4>
<p class=\"avatar-list-birthday\">
	".$userrow['hbirth']."
</p>
<p>";
if($userrow['id'] == $ownerid){
echo "<img src=\"http://images.habbohotel.co.uk/habboweb/22_66afcf07d8b708feecf6e2e0e797ec09/19/web-gallery/images/groups/owner_icon.gif\" alt=\"\" class=\"avatar-list-groupstatus\" />";
} else {
echo "<img src=\"http://images.habbohotel.co.uk/habboweb/22_66afcf07d8b708feecf6e2e0e797ec09/19/web-gallery/images/groups/administrator_icon.gif\" alt=\"\" class=\"avatar-list-groupstatus\" />";
}
echo "</p>
</li>";
	}
}

$get_users = mysql_query("SELECT userid FROM groups_memberships WHERE groupid = '".$groupid."' AND is_pending = '0' AND member_rank < 2") or die(mysql_error());

while($membership = mysql_fetch_assoc($get_users)){

	$userrow = mysql_query("SELECT id,name,figure,hbirth FROM users WHERE id = '".$membership['userid']."' LIMIT 1") or die(mysql_error());
	$found = mysql_num_rows($userrow);

	if($found > 0){
		$userrow = mysql_fetch_assoc($userrow);

		echo "<li id=\"avatar-list-".$groupid."-".$userrow['id']."\" title=\"".$userrow['name']."\">
<div class=\"avatar-list-open\">
	<a href=\"#\" id=\"avatar-list-open-link-".$groupid."-".$userrow['id']."\" class=\"avatar-list-open-link\"></a>
</div>
<div class=\"avatar-list-avatar\">
	<img src=\"http://www.habbo.co.uk/habbo-imaging/avatarimage?figure=".$userrow['figure']."&size=s&direction=2&head_direction=2&gesture=sml\" alt=\"\" />
</div>
<h4>
	<a href=\"user_profile.php?name=".$userrow['name']."\">".$userrow['name']."</a>
</h4>
<p class=\"avatar-list-birthday\">
	".$userrow['hbirth']."
</p>
<p>
</p>
</li>";
	}
}

echo "</ul>

<div id=\"avatar-list-info\" class=\"avatar-list-info\">
<div class=\"avatar-list-info-close-container\"><a href=\"#\" class=\"avatar-list-info-close\"></a></div>
<div class=\"avatar-list-info-container\"></div>
</div>

</div>

<div id=\"avatar-list-paging\">
<input type=\"hidden\" id=\"pageNumber\" value=\"1\"/>
<input type=\"hidden\" id=\"totalPages\" value=\"1\"/>
</div>

<script type=\"text/javascript\">
document.observe(\"dom:loaded\", function() {
	window.widget".$saved_id." = new MemberWidget('".$groupid."', '".$saved_id."');
});
</script>

</div>
		<div class=\"clear\"></div>
		</div>
	</div>
</div>
</div>";
    }
    
} else { exit; }

?>