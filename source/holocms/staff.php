<?php
/*===================================================+
|| # HoloCMS - Website and Content Management System
|+===================================================+
|| # Copyright ? 2008 Meth0d. All rights reserved.
|| # http://www.meth0d.org
|+===================================================+
|| # HoloCMS is provided "as is" and comes without
|| # warrenty of any kind. HoloCMS is free software!
|+===================================================*/

$allow_guests = true;

include('core.php');
include('includes/session.php');

$pagename = "Staff Team";
$pageid = "9";

include('templates/community/subheader.php');
include('templates/community/header.php');

?>


<div id="container">
    <div id="content" style="position: relative" class="clearfix">
    <div id="column1" class="column">
                         
                <div class="habblet-container ">        
                        <div class="cbb clearfix <?php echo stripslashes(getContent('staff3-color')); ?> ">
    
                            <h2 class="title"><?php echo stripslashes(getContent('staff3-heading')); ?></h2>
                            
                        <script src="./web-gallery/static/js/credits.js" type="text/javascript"></script>
<br>
<ul id="credits-methods">
    <li id="credits-type-quick_and_easy">
        <h4 class="credits-category-quick_and_easy"><?php echo stripslashes(getContent('team1-heading')); ?></h4>
        <ul>
                <li class="clearfix even"><div id="method-44" class="credits-method-container">

                    <div class="credits-summary" >
                        <h3><?php echo stripslashes(getContent('team1-what')); ?></h3>
                        <p><?php echo stripslashes(getContent('team1')); ?></p>
                        <p class="credits-read-more" id="method-show-44" style="display: none">View the Team&raquo;</p>
                    </div>
                    <div id="method-full-44" class="credits-method-full">

                            <p><?php
$getem = mysql_query("SELECT name,mission,rank,lastvisit,figure,sex,id FROM users WHERE rank = 7 ORDER BY name") or die(mysql_error());
$staff_members = mysql_num_rows($getem);

if($staff_members < 1){
echo "<center>No Administrators to display yet.";
} else {
    while ($row = mysql_fetch_array($getem, MYSQL_NUM)) {

    if($row[2] == 7){ // = 7 or higher - Admin
    $row[2] = "Administrator";
    }

    if(empty($row[1])){
    $row[1] = "No motto";
    }

    $badge = GetUserBadge($row[0]);
    if($badge !== true){
    $badge = "<img src=\"".$cimagesurl.$badgesurl."ADM.gif\" /></a>";
    }

    $groupbadge = GetUserGroupBadge($row[6]);
    if($groupbadge !== false){
    $gbadge = "<a rel='nofollow' href='group_profile.php?id=".GetUserGroup($row[6])."'><img src='./habbo-imaging/badge.php?badge=".$groupbadge."'></a>";
    } else {
    $gbadge = "";
    }

    if(IsUserOnline($row[6])){
        $online_img = "online_anim";
                $online_caption = "Online now!";
    } else {
        $online_img = "offline";
                $online_caption = "Offline";
    }

printf("<p><img src='http://www.habbo.co.uk/habbo-imaging/avatarimage?figure=%s&size=b&action=wlk&direction=4&head_direction=3&gesture=sml&size=s' alt='%s' align='left' />
<b><a rel='nofollow' href='user_profile.php?name=%s'>%s</a></b>&nbsp;<img src='./web-gallery/v2/images/habbo_%s.gif' title='%s' alt='%s' border='0'><br />
<i>%s</i><br />
<br />
Rank: %s<br />
Last Visit: %s<br />
<br />%s&nbsp;%s<br /><br /></p>
",$row[4],$row[0],$row[0],$row[0],$online_img,$online_caption,$online_caption,stripslashes($row[1]),$row[2],$row[3], $badge, $gbadge);
    }
}
?></p>

                    </div>
                    <script type="text/javascript">
                    $("method-show-44").show();
                    $("method-full-44").hide();
                    </script>

                </div></li>
        </ul>
    </li>
<br>
    <li id="credits-type-quick_and_easy">
        <h4 class="credits-category-quick_and_easy"><?php echo stripslashes(getContent('team2-heading')); ?></h4>
        <ul>

                <li class="clearfix odd"><div id="method-1" class="credits-method-container">
                    <div class="credits-summary">

                        <h3><?php echo stripslashes(getContent('team2-what')); ?></h3>
                        <p><?php echo stripslashes(getContent('team2')); ?></p>
                        <p class="credits-read-more" id="method-show-1" style="display: none">View the Team&raquo;</p>
                    </div>
                    <div id="method-full-1" class="credits-method-full">
                            <p><?php
$getem = mysql_query("SELECT name,mission,rank,lastvisit,figure,sex,id FROM users WHERE rank = 6 ORDER BY name") or die(mysql_error());
$staff_members = mysql_num_rows($getem);

if($staff_members < 1){
echo "<center>No Moderators to display yet.";
} else {
    while ($row = mysql_fetch_array($getem, MYSQL_NUM)) {

    if($row[2] == 6){ // = 6 - Mod
    $row[2] = "Moderator";
    }

    if(empty($row[1])){
    $row[1] = "No motto";
    }

    $badge = GetUserBadge($row[0]);
    if($badge !== true){
    $badge = "<img src=\"".$cimagesurl.$badgesurl."ADM.gif\" /></a>";
    }

    $groupbadge = GetUserGroupBadge($row[6]);
    if($groupbadge !== false){
    $gbadge = "<a rel='nofollow' href='group_profile.php?id=".GetUserGroup($row[6])."'><img src='./habbo-imaging/badge.php?badge=".$groupbadge."'></a>";
    } else {
    $gbadge = "";
    }

    if(IsUserOnline($row[6])){
        $online_img = "online_anim";
                $online_caption = "Online now!";
    } else {
        $online_img = "offline";
                $online_caption = "Offline";
    }

printf("<p><img src='http://www.habbo.co.uk/habbo-imaging/avatarimage?figure=%s&size=b&action=wlk&direction=4&head_direction=3&gesture=sml&size=s' alt='%s' align='left' />
<b><a rel='nofollow' href='user_profile.php?name=%s'>%s</a></b>&nbsp;<img src='./web-gallery/v2/images/habbo_%s.gif' title='%s' alt='%s' border='0'><br />
<i>%s</i><br />
<br />
Rank: %s<br />
Last Visit: %s<br />
<br />%s&nbsp;%s<br /><br /></p>
",$row[4],$row[0],$row[0],$row[0],$online_img,$online_caption,$online_caption,stripslashes($row[1]),$row[2],$row[3], $badge, $gbadge);
    }
}
?></p>

                    </div>
                    <script type="text/javascript">
                    $("method-show-1").show();
                    $("method-full-1").hide();
                    </script>
                </div></li>
        </ul>
    </li>
<br>
    <li id="credits-type-quick_and_easy">
        <h4 class="credits-category-quick_and_easy"><?php echo stripslashes(getContent('team3-heading')); ?></h4>
        <ul>

                <li class="clearfix odd"><div id="method-2" class="credits-method-container">
                    <div class="credits-summary">

                        <h3><?php echo stripslashes(getContent('team3-what')); ?></h3>
                        <p><?php echo stripslashes(getContent('team3')); ?></p>
                        <p class="credits-read-more" id="method-show-2" style="display: none">View the Team&raquo;</p>
                    </div>
                    <div id="method-full-2" class="credits-method-full">
                            <p><?php
$getem = mysql_query("SELECT name,mission,rank,lastvisit,figure,sex,id FROM users WHERE rank = 5 ORDER BY name") or die(mysql_error());
$staff_members = mysql_num_rows($getem);


if($staff_members < 1){
echo "<center>No Experts to display yet.";
} else {
    while ($row = mysql_fetch_array($getem, MYSQL_NUM)) {

    if($row[2] == 5){ // = 5 - Gold Bobba
    $row[2] = "Bobble Expert";
    }

    if(empty($row[1])){
    $row[1] = "No motto";
    }

    $badge = GetUserBadge($row[0]);
    if($badge !== true){
    $badge = "<img src=\"".$cimagesurl.$badgesurl.$badge.".gif\" /></a>";
    }

    $groupbadge = GetUserGroupBadge($row[6]);
    if($groupbadge !== false){
    $gbadge = "<a rel='nofollow' href='group_profile.php?id=".GetUserGroup($row[6])."'><img src='./habbo-imaging/badge.php?badge=".$groupbadge."'></a>";
    } else {
    $gbadge = "";
    }

    if(IsUserOnline($row[6])){
        $online_img = "online_anim";
                $online_caption = "Online now!";
    } else {
        $online_img = "offline";
                $online_caption = "Offline";
    }

printf("<p><img src='http://www.habbo.co.uk/habbo-imaging/avatarimage?figure=%s&size=b&action=wlk&direction=4&head_direction=3&gesture=sml&size=s' alt='%s' align='left' />
<b><a rel='nofollow' href='user_profile.php?name=%s'>%s</a></b>&nbsp;<img src='./web-gallery/v2/images/habbo_%s.gif' title='%s' alt='%s' border='0'><br />
<i>%s</i><br />
<br />
Rank: %s<br />
Last Visit: %s<br />
<br />%s&nbsp;%s<br /><br /></p>
",$row[4],$row[0],$row[0],$row[0],$online_img,$online_caption,$online_caption,stripslashes($row[1]),$row[2],$row[3], $badge, $gbadge);
    }
}
?></p>
                    </div>
                    <script type="text/javascript">
                    $("method-show-2").show();
                    $("method-full-2").hide();
                    </script>
                </div></li>
        </ul>
    </li>

<script type="text/javascript">
L10N.put("credits.navi.read_more", "View the Team&raquo;");
L10N.put("credits.navi.close_fulltext", "Stop Viewing");
PaymentMethodHabblet.init();
</script>
                            
                    </div>

                </div>
                <script type="text/javascript">if (!$(document.body).hasClassName('process-template')) { Rounder.init(); }</script>

             

    </div>                    
<div id="column2" class="column">
                <div class="habblet-container ">
                        <div class="cbb clearfix <?php echo stripslashes(getContent('staff1-color')); ?> ">

                            <h2 class="title"><?php echo stripslashes(getContent('staff1-heading')); ?>
                            </h2>
                        <div id="notfound-looking-for" class="box-content">
    <p><?php echo stripslashes(getContent('staff1')); ?></p>
</div>


                    </div>
                </div>
                <script type="text/javascript">if (!$(document.body).hasClassName('process-template')) { Rounder.init(); }</script>

                <div class="habblet-container ">
                        <div class="cbb clearfix <?php echo stripslashes(getContent('staff2-color')); ?> ">

                            <h2 class="title"><?php echo stripslashes(getContent('staff2-heading')); ?>
                            </h2>
                        <div id="notfound-looking-for" class="box-content">
    <p><?php echo stripslashes(getContent('staff2')); ?></p>
</div>


                    </div>
                </div>
                <script type="text/javascript">if (!$(document.body).hasClassName('process-template')) { Rounder.init(); }</script>



<?php
include('templates/community/footer.php');    
?> 