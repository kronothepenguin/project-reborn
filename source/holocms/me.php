<?php
/*---------------------------------------------------+
| HoloCMS - Website and Content Management System
+----------------------------------------------------+
| Copyright © 2008 Meth0d
+----------------------------------------------------+
| HoloCMS is provided "as is" and comes without
| warrenty of any kind. 
+---------------------------------------------------*/

include('core.php');
include('includes/session.php');
include('includes/news_headlines.php');

if($_GET['do'] == "RemoveFeedItem" && is_numeric($_GET['key'])){ // ex. me.php?do=RemoveFeedItem&key=5
    mysql_query("DELETE FROM cms_alerts WHERE userid = '".$my_id."' AND id = '".$_GET['key']."' ORDER BY id ASC LIMIT 1") or die(mysql_error());
}

$pagename = $name;
$pageid = "1";

// Header for minimail
$messages = mysql_evaluate("SELECT COUNT(*) FROM cms_minimail WHERE userid = '".$my_id."'") or $messages = 0;
header("X-JSON: {\"totalMessages\":".$messages."}");

include('templates/community/subheader.php');
include('templates/community/header.php');

// Query tags
$fetch_tags = mysql_query("SELECT tag,id FROM cms_tags WHERE ownerid = '".$my_id."' LIMIT 20") or die(mysql_error());
$tags_num = mysql_num_rows($fetch_tags);

	// Create the random tag questions array
	$randomq[] = "What is your favourite TV show?";
	$randomq[] = "Who is your favourite actor?";
	$randomq[] = "Who is your favourite actress?";
	$randomq[] = "Do you have a nickname?";
	$randomq[] = "What is your favorite song?";
	$randomq[] = "How do you describe yourself?";
	$randomq[] = "What is your favorite band?";
	$randomq[] = "What is your favorite comic?";
	$randomq[] = "What are you like?";
	$randomq[] = "What is your favorite food?";
	$randomq[] = "What sport you play?";
	$randomq[] = "Who was your first love?";
	$randomq[] = "What is your favorite movie?";
	$randomq[] = "Cats, dogs, or something more exotic?";
	$randomq[] = "What is your favorite color?";
	// Add new questions below this line
	$randomq[] = "Do you have a favorite staff member?";

// Select a random question from the array above
srand ((double) microtime() * 1000000);
$chosen = rand(0,count($randomq)-1);

// Appoint the variable
$tag_question = $randomq[$chosen];

?>

<div id="container">
	<div id="content">
    <div id="column1" class="column">
				<div class="habblet-container ">		
	
						<div id="new-personal-info" style="background-image:url(./web-gallery/v2/images/personal_info/hotel_views/htlview_br.png)" />
	<div id="enter-hotel">
<?php if($enable_status_image == "0" || $enable_status_image == "1" & $online == "online"){ ?>
		<div class="open">
		<?php
		if(getContent('client-widescreen') == "1"){
        $wide_enabled = true;
} else {
        $wide_enabled = false;
}
?>
				<a href="client.php<?php if($wide_enabled == false){ echo "?wide=false"; } ?>" target="client" onclick="openOrFocusHabbo(this); return false;">Enter <?php echo $shortname; ?><i></i></a>
			<b></b>
		</div>
<?php } else { ?>
<div class="closed">
	<span>Hotel Closed</span>
	<b></b>
</div>
<?php } ?>
	</div>
	
	<div id="habbo-plate">
		<a href="account.php?tab=1">
			<img alt="<?php echo $name; ?>" src="http://www.habbo.co.uk/habbo-imaging/avatarimage?figure=<?php echo $myrow['figure']; ?>&size=b&direction=3&head_direction=3&gesture=sml" width="64" height="110" />
		</a>
	</div>

	<div id="habbo-info">
		<div id="motto-container" class="clearfix">			
			<strong><?php echo $name; ?>:</strong>
			<div>
				<span title="Click to enter your motto/ status"><?php if(!empty($myrow['mission'])){ echo stripslashes($myrow['mission']); } else { echo "Click here to enter your motto"; } ?></span>
				<p style="display: none"><input type="text" length="30" name="motto" value="<?php echo stripslashes($myrow['mission']); ?>"/></p>
			</div>
		</div>
		<div id="motto-links" style="display: none"><a href="#" id="motto-cancel">Cancel</a></div>
	</div>
	
	<ul id="link-bar" class="clearfix">
		<li class="change-looks"><a href="account.php?tab=1">Change looks &raquo;</a></li>		
		<li class="credits">
			<a href="credits.php"><?php echo $myrow['credits']; ?></a> credits
		</li>		
		<li class="club">
                	<a href="club.php"><?php if( !IsHCMember($my_id) ){ echo "Join " . $shortname . " club &raquo;</a>"; } else { echo HCDaysLeft($my_id) . " </a>HC days"; }?>
		</li>
	</ul>		
	
	<div id="habbo-feed">
		<ul id="feed-items">
                    
<?php

if($user_rank > 5){
    $alerts = mysql_evaluate("SELECT COUNT(*) FROM cms_help WHERE picked_up = '0'");
    if($alerts > 0){
            echo "            <li class=\"small\" id=\"feed-group-discussion\">
            	<strong>Staff Message</strong><br />There "; if($alerts == 1){ echo "is"; } else { echo "are"; } echo " <strong><a href='./housekeeping/index.php?p=helper' target='_self'>" . $alerts . "</a></strong> non-picked up help quer"; if($alerts > 1){ echo "ies"; } else { echo "y"; } echo ".
            </li>";
    }
}

$tmp = mysql_query("SELECT * FROM cms_alerts WHERE userid = '".$my_id."' ORDER BY id ASC LIMIT 1") or die(mysql_error());
$alerts = mysql_num_rows($tmp);

	if($alerts > 0){

		$row = mysql_fetch_assoc($tmp);

		$id = $row['id'];
		$type = $row['type'];

		if($type == 1){
		$heading = "Notification";
		} elseif($type == 2){
		$heading = "Message from " . $shortname . " Staff";
		} else {
                $heading = "undefined";
                }

?>
<li id="feed-item-campaign" class="contributed">
    <a href="#" class="remove-feed-item" id="remove-feed-item-<?php echo $row['id']; ?>" title="Remove notification">Remove notification</a>
	<div>
			<b><?php echo $heading; ?></b><br />
			<?php echo stripslashes(nl2br(trim(stripslashes($row['alert'])))); ?>
	</div>
</li>	 
<?php
	}

            
        $dob = $myrow['birth'];
        $bits = explode("-", $dob);
        $day = $bits[0];
        $month2 = $bits[1];
        $year2 = $bits[2];
        
	if($day == $today && $month2 == $month && getContent('birthday-notifications') == "1"){

        $age = $year - $year2;

	// If we have haxxorz that bypassed the age check (only javascript validates it), they may be like, what,
	// one year old, so instead of showing 'happy 1th birthday', we properly show 'happy 1st birthday' etc.
	if($age == 1 || $age == 21){
	$age = $age . "st";
	} elseif($age == 2 || $age == 22){
	$age = $age . "nd";
	} elseif($age == 3 || $age = 33){
	$age = $age . "rd";
	} else {
	$age = $age . "th";
	}
?>

<li id="feed-birthday">
	<div>
			Happy <?php echo $age; ?> birthday, <?php echo $name; ?>!<br />We hope you have a great day today.
	</div>
</li>
<?php
	}
?>	        
              
	        <li class="small" id="feed-lastlogin">
                Last signed in:
                <?php echo $myrow['lastvisit']; ?>
	        </li>


		</ul>
	</div>
	<p class="last"></p>
</div>
																
<script type="text/javascript">
	HabboView.add(function() {
		L10N.put("personal_info.motto_editor.spamming", "Don\'t spam me, bro!");
		PersonalInfo.init("");
	});
</script>

	
				</div>
				<?php /*
								<script type="text/javascript">if (!$(document.body).hasClassName('process-template')) { Rounder.init(); }</script>
			 
				<div class="habblet-container " id="roomselection">		
						<div class="cbb clearfix rooms ">
	
							<h2 class="title">Select your room!
							</h2>
						<div id="roomselection-plp-intro" class="box-content">
Hey! You haven't chosen your pre-decorated room, which comes with free furniture! Choose one below:
</div>

<ul id="roomselection-plp" class="clearfix">
	<li class="top">
	<a class="roomselection-select new-button green-button" href="client.php?createRoom=0" target="client" onclick="return RoomSelectionHabblet.create(this, 0);"><b>Select</b><i></i></a>	
	</li>
	<li class="top">
	<a class="roomselection-select new-button green-button" href="client.php?createRoom=1" target="client" onclick="return RoomSelectionHabblet.create(this, 1);"><b>Select</b><i></i></a>	
	</li>
	<li class="top">
	<a class="roomselection-select new-button green-button" href="client.php?createRoom=2" target="client" onclick="return RoomSelectionHabblet.create(this, 2);"><b>Select</b><i></i></a>	
	</li>
	<li class="bottom">
	<a class="roomselection-select new-button green-button" href="client.php?createRoom=3" target="client" onclick="return RoomSelectionHabblet.create(this, 3);"><b>Select</b><i></i></a>	
	</li>
	<li class="bottom">
	<a class="roomselection-select new-button green-button" href="client.php?createRoom=4" target="client" onclick="return RoomSelectionHabblet.create(this, 4);"><b>Select</b><i></i></a>	
	</li>
	<li class="bottom">
	<a class="roomselection-select new-button green-button" href="client.php?createRoom=5" target="client" onclick="return RoomSelectionHabblet.create(this, 5);"><b>Select</b><i></i></a>	
	</li>
</ul>

<script type="text/javascript">
L10N.put("roomselection.hide.title", "Hide room selection");
L10N.put("roomselection.old_user.done", "And you\'re done! Habbo Hotel will now open in a new window and you\'ll be redirected to your room in no time!");
HabboView.add(RoomSelectionHabblet.initClosableHabblet);
</script>
	
						
							
					</div>
				</div> */ ?>
				
				<script type="text/javascript">if (!$(document.body).hasClassName('process-template')) { Rounder.init(); }</script>
<?php /* START OF MINIMAIL shit			 
				<div class="habblet-container minimail" id="mail">		
						<div class="cbb clearfix blue ">
	
							<h2 class="title">My Messages
							</h2>
						<div id="minimail">
    <div class="minimail-contents">
    <a href="#" class="new-button compose"><b>Compose</b><i></i></a>
<div class="clearfix labels nostandard">
    <ul class="box-tabs">
        <li  class="selected"><a href="#" label="inbox">Inbox <b class="minimail-unread">(<b>1</b>)</b></a><span class="tab-spacer"></span></li>
        <li ><a href="#" label="sent">Sent</a><span class="tab-spacer"></span></li>
        <li ><a href="#" label="trash">Trash</a><span class="tab-spacer"></span></li>
    </ul>
</div>


<div id="message-list" class="label-inbox">
<div class="new-buttons clearfix">
	<div class="labels inbox-refresh"><a href="#" class="new-button green-button" label="inbox" style="float: left; margin: 0"><b>Refresh</b><i></i></a></div>
</div>
<div style="clear: both; height: 1px"></div>

<div class="navigation">
    <div class="unread-selector"><input type="checkbox" class="unread-only"/> only unread</div>
        <div class="progress"></div>
        <p>
        1 - 1 of 1
        </p>
</div>

	<div class="message-item unread " id="msg-5cb1be27-3956-430a-b6f0-e9130dade539">
		<div class="message-preview" status="unread">
			<span class="message-tstamp" isotime="2008-05-22T17:40:28" title="22-May-2008 18:40:28">
			    5 minutes ago
			</span>
			<img src="/habbo-imaging/avatar/hr-678-37.hd-626-9.ch-680-98.lg-696-102.sh-906-89.he-1605-87.ca-1803-95.wa-2003-95,s-3.g-0.d-2.h-2.a-0,ed259777cdbcb04d530ae2484bcfe4f1.gif" width="27" height="30"/> 
			<span class="message-sender" title="oscmay">oscmay</span>
			
			<span class="message-subject" title="hi">&ldquo;hi&rdquo;</span>
		</div>
		<div class="message-body" style="display: none;">
		    <div class="contents"></div>
            <div class="message-body-bottom"></div>
		</div>		
	</div>

<div class="navigation">
        <div class="progress"></div>
        <p>
        1 - 1 of 1
        </p>
</div>

</div>	</div>
	<div id="message-compose-wait"></div>
    <form style="display: none" id="message-compose">
        <div>To</div>
        <div id="message-recipients-container" class="input-text" style="width: 426px; margin-bottom: 1em">
        	<input type="text" value="" id="message-recipients" />
        	<div class="autocomplete" id="message-recipients-auto">
        		<div class="default" style="display: none;">Type the name of your friend</div>
        		<ul class="feed" style="display: none;"></ul>
        	</div>
        </div>
        <div>Subject<br/>
        <input type="text" style="margin: 5px 0" id="message-subject" class="message-text" maxlength="100" tabindex="2" />
        </div>
        <div>Message<br/>
        <textarea style="margin: 5px 0" rows="5" cols="10" id="message-body" class="message-text" tabindex="3"></textarea>
        </div>
        <div class="new-buttons clearfix">
            <a href="#" class="new-button preview"><b>Preview</b><i></i></a>
            <a href="#" class="new-button send"><b>Send</b><i></i></a>
        </div>
    </form>	
</div>
<script type="text/javascript">
	L10N.put("minimail.compose", "Compose").put("minimail.cancel", "Cancel")
		.put("bbcode.colors.red", "Red").put("bbcode.colors.orange", "Orange")
    	.put("bbcode.colors.yellow", "Yellow").put("bbcode.colors.green", "Green")
    	.put("bbcode.colors.cyan", "Cyan").put("bbcode.colors.blue", "Blue")
    	.put("bbcode.colors.gray", "Grey").put("bbcode.colors.black", "Black")
    	.put("minimail.empty_body.confirm", "Are you sure you want to send the message with an empty body?")
    	.put("bbcode.colors.label", "Colours").put("linktool.find.label", " ")
    	.put("linktool.scope.habbos", "Habbo").put("linktool.scope.rooms", "Room")
    	.put("linktool.scope.groups", "Group").put("minimail.report.title", "Report message to moderators");

    L10N.put("date.pretty.just_now", "just now");            
    L10N.put("date.pretty.one_minute_ago", "1 minute ago");            
    L10N.put("date.pretty.minutes_ago", "{0} minutes ago");            
    L10N.put("date.pretty.one_hour_ago", "1 hour ago");            
    L10N.put("date.pretty.hours_ago", "{0} hours ago");            
    L10N.put("date.pretty.yesterday", "yesterday");            
    L10N.put("date.pretty.days_ago", "{0} days ago");            
    L10N.put("date.pretty.one_week_ago", "1 week ago");            
    L10N.put("date.pretty.weeks_ago", "{0} weeks ago");            
	new MiniMail({ pageSize: 10, 
	   total: 1, 
	   friendCount: 0, 
	   maxRecipients: 10, 
	   messageMaxLength: 20, 
	   bodyMaxLength: 4096,
	   secondLevel: false});
</script>
	
						
							
					</div>
				</div>
				<script type="text/javascript">if (!$(document.body).hasClassName('process-template')) { Rounder.init(); }</script>*/ ?>
			 
				<div class="habblet-container ">		
	
						
	
						
					
				</div>
				<script type="text/javascript">if (!$(document.body).hasClassName('process-template')) { Rounder.init(); }</script>			 

<div class="habblet-container ">		
						<div class="cbb clearfix blue ">
<div class="box-tabs-container clearfix">
    <h2>Groups</h2>
    <ul class="box-tabs">
        <li id="tab-2-1"><a href="#">Hot Groups</a><span class="tab-spacer"></span></li>
        <li id="tab-2-2" class="selected"><a href="#">My Groups</a><span class="tab-spacer"></span></li>
    </ul>
</div>
    <div id="tab-2-1-content"  style="display: none">
    		<div class="progressbar"><img src="./web-gallery/images/progress_bubbles.gif" alt="" width="29" height="6" /></div>
    		<a href="randomgroups.php?sp=plain" class="tab-ajax"></a>
    </div>
    <div id="tab-2-2-content" >
    

         <div id="groups-habblet-info" class="habblet-content-info">
                View the groups you are in, create your own group, or get some inspiration from the 'Hot Groups'-tab!
         </div>

    <div id="groups-habblet-list-container" class="habblet-list-container groups-list">

<?php
$get_em = mysql_query("SELECT * FROM groups_memberships WHERE userid = '".$my_id."' AND is_pending= '0' ") or die(mysql_error());
$groups = mysql_num_rows($get_em);

echo "\n    <ul class=\"habblet-list two-cols clearfix\">";

$num = 0;

while($row = mysql_fetch_assoc($get_em)){
	$num++;

	if(IsEven($num)){
		$pos = "right";
		$rights++;
	} else {
		$pos = "left";
		$lefts++;
	}

	if(IsEven($lefts)){
		$oddeven = "odd";
	} else {
		$oddeven = "even";
	}

	$group_id = $row['groupid'];
	$check = mysql_query("SELECT * FROM groups_details WHERE id = '".$group_id."' LIMIT 1");
	$groupdata = mysql_fetch_assoc($check);

	echo "            <li class=\"".$oddeven." ".$pos."\" style=\"background-image: url(./habbo-imaging/badge.php?badge=".$groupdata['badge'].")\">\n            	\n                \n                <a class=\"item\" href=\"group_profile.php?id=".$group_id."\">".stripslashes($groupdata['name'])."</a>\n            </li>";
}

$rights_should_be = $lefts;
if($rights !== $rights_should_be){
	echo "<li class=\"".$oddeven." right\"><div class=\"item\">&nbsp;</div></li>";
}

echo "\n    </ul>";
?>

		<div class="habblet-button-row clearfix"><a class="new-button" id="purchase-group-button" href="#"><b>Create/buy a Group</b><i></i></a></div>
    </div>

    <div id="groups-habblet-group-purchase-button" class="habblet-list-container"></div>

<script type="text/javascript">
    $("purchase-group-button").observe("click", function(e) { Event.stop(e); GroupPurchase.open(); });
</script>





    </div>

					</div>
				</div>
				<script type="text/javascript">if (!$(document.body).hasClassName('process-template')) { Rounder.init(); }</script>


<div class="habblet-container ">		
						<div class="cbb clearfix green ">
<div class="box-tabs-container clearfix">
    <h2>Tags</h2>
    <ul class="box-tabs">
        <li id="tab-3-1"><a href="#">Others Like...</a><span class="tab-spacer"></span></li>
        <li id="tab-3-2" class="selected"><a href="#">My Tags</a><span class="tab-spacer"></span></li>
    </ul>
</div>
    <div id="tab-3-1-content"  style="display: none">
    		<div class="progressbar"><img src="http://images.habbohotel.co.uk/habboweb/21_5527e6590eba8f3fb66348bdf271b5a2/14/web-gallery/images/progress_bubbles.gif" alt="" width="29" height="6" /></div>
    		<a href="tagcloud.php?sp=plain" class="tab-ajax"></a>
    </div>
    <div id="tab-3-2-content" >
    <div id="my-tag-info" class="habblet-content-info">
        <?php if($tags_num > 19){ echo "Tag limit reached. You need you remove one of your tags before adding another."; } elseif($tags_num == 0){ echo "You have no tags. Answer the question below or just add a tag of your choice."; } elseif($tags_num < 20){ echo "You haven't used up all your tags yet - add some more!"; } ?>
    </div>
<div class="box-content">
    <div class="habblet" id="my-tags-list">

<?php if($tags_num > 0){
            echo "<ul class=\"tag-list make-clickable\"> ";
	while($row = mysql_fetch_assoc($fetch_tags)){
                    printf("<li><a href=\"tags.php?tag=%s\" class=\"tag\" style=\"font-size:10px\">%s</a>\n
                        <a class=\"tag-remove-link\"\n
                        title=\"Remove tag\"\n
                        href=\"#\"></a></li>\n", $row['tag'], $row['tag']);
	}
            echo "</ul>";
} ?>

<?php if($tags_num < 20){ ?>
     <form method="post" action="tags_ajax.php?key=add" onsubmit="TagHelper.addFormTagToMe();return false;" >
    <div class="add-tag-form clearfix">
		<a  class="new-button" href="#" id="add-tag-button" onclick="TagHelper.addFormTagToMe();return false;"><b>Add tag</b><i></i></a>
        <input type="text" id="add-tag-input" maxlength="20" style="float: right"/>
        <em class="tag-question"><?php echo $tag_question; ?></em>
    </div>
    <div style="clear: both"></div> 
    </form>
<?php } ?>
    </div>
</div>

<script type="text/javascript">
document.observe("dom:loaded", function() {
    TagHelper.setTexts({
        tagLimitText: "You\'ve reached the tag limit - delete one of your tags if you want to add a new one.",
        invalidTagText: "Invalid tag",
        buttonText: "OK"
    });
        TagHelper.init('21063711');
});
</script>
    </div>

					</div>
				</div>
				<script type="text/javascript">if (!$(document.body).hasClassName('process-template')) { Rounder.init(); }</script>
			 
</div>
<div id="column2" class="column">
				<div class="habblet-container ">		
	
						
	
						
					
				</div>
				<script type="text/javascript">if (!$(document.body).hasClassName('process-template')) { Rounder.init(); }</script>
			 
				<div class="habblet-container ">		
	
						
	
						
					
				</div>
				<script type="text/javascript">if (!$(document.body).hasClassName('process-template')) { Rounder.init(); }</script>
			 
				<div class="habblet-container news-promo">		
						<div class="cbb clearfix notitle ">
	
							
						<div id="newspromo">
        <div id="topstories">
	        <div class="topstory" style="background-image: url(<?php echo $news_1_topstory; ?>)">
	            <h4>Latest news</h4>
	            <h3><a href="news.php?id=<?php echo $news_1_id; ?>"><?php echo $news_1_title; ?></a></h3>
	            <p class="summary">
	            <?php echo $news_1_snippet; ?>
	            </p>
	            <p>
	                <a href="news.php?id=<?php echo $news_1_id; ?>">Read more &raquo;</a>
	            </p>
	        </div>
	        <div class="topstory" style="background-image: url(<?php echo $news_2_topstory; ?>); display: none">
	            <h4>Latest news</h4>
	            <h3><a href="news.php?id=<?php echo $news_2_id; ?>"><?php echo $news_2_title; ?></a></h3>
	            <p class="summary">
	            <?php echo $news_2_snippet; ?>
	            </p>
	            <p>
	                <a href="news.php?id=<?php echo $news_2_id; ?>">Read more &raquo;</a>
	            </p>
	        </div>
        </div>
        <ul class="widelist">
            <li class="even">
                <a href="news.php?id=<?php echo $news_3_id; ?>"><?php echo $news_3_title; ?></a><div class="newsitem-date"><?php echo $news_3_date; ?></div>
            </li>            
            <li class="odd">
                <a href="news.php?id=<?php echo $news_4_id; ?>"><?php echo $news_4_title; ?></a><div class="newsitem-date"><?php echo $news_4_date; ?></div>
            </li>            
            <li class="last"><a href="news.php">More news &raquo;</a></li>            
        </ul>
</div>
<script type="text/javascript">
	document.observe("dom:loaded", function() { NewsPromo.init(); });
</script>
	
						
					</div>
				</div>
				<script type="text/javascript">if (!$(document.body).hasClassName('process-template')) { Rounder.init(); }</script>

				<div class="habblet-container ">		
						<div class="cbb clearfix green ">
<div class="box-tabs-container clearfix">
    <h2>Reccomended Rooms</h2>
    <ul class="box-tabs">
    </ul>
</div>
    <div id="tab-0-2-content" >

<div id="rooms-habblet-list-container-h105" class="recommendedrooms-lite-habblet-list-container">
        <ul class="habblet-list">

<?php
$i = 0;
$getem = mysql_query("SELECT * FROM rooms WHERE owner IS NOT NULL ORDER BY RAND() LIMIT 5") or die(mysql_error());

while ($row = mysql_fetch_assoc($getem)) {
    if($row['owner'] !== ""){ // Public Rooms (and possibly bugged rooms) have no owner, thus do not display them
        $i++;

        if(IsEven($i)){
            $even = "odd";
        } else {
            $even = "even";
        }

        // Calculate percentage
        if($row['incnt_max'] == 0){ $row['incnt_max'] = 1; }
        $data[$i] = ($row['incnt_now'] / $row['incnt_max']) * 100;

        // Base room icon based on this - percantage levels may not be habbolike
        if($data[$i] == 99 || $data[$i] > 99){
            $room_fill = 5;
        } elseif($data[$i] > 65){
            $room_fill = 4;
        } elseif($data[$i] > 32){
            $room_fill = 3;
        } elseif($data[$i] > 0){
            $room_fill = 2;
        } elseif($data[$i] < 1){
            $room_fill = 1;
        }
        
        printf("<li class=\"%s\">
    <span class=\"clearfix enter-room-link room-occupancy-%s\" title=\"Go to room\" roomid=\"%s\">
	    <span class=\"room-enter\">Enter</span>
	    <span class=\"room-name\">%s</span>
	    <span class=\"room-description\">%s</span>              
		<span class=\"room-owner\">Owner: <a href=\"user_profile.php?name=%s\">%s</a></span>
    </span>
</li>", $even, $room_fill, $row['id'], stripslashes($row['name']), stripslashes($row['descr']), $row['owner'], $row['owner']); 
    }
}
?>

        </ul>
            <div class="clearfix"></div>
</div>
<script type="text/javascript">
L10N.put("show.more", "Show more rooms");
L10N.put("show.less", "Show fewer rooms");
var roomListHabblet_h105 = new RoomListHabblet("rooms-habblet-list-container-h105", "room-toggle-more-data-h105", "room-more-data-h105");
</script>
    </div>

					</div>
				</div>
				<script type="text/javascript">if (!$(document.body).hasClassName('process-template')) { Rounder.init(); }</script>



</div>

<script type="text/javascript">
	HabboView.add(LoginFormUI.init);
</script>

<div id="column3" class="column">
				<div class="habblet-container ">		
	
						<div class="ad-container">
<?php $sql = mysql_query("SELECT * FROM cms_banners WHERE status = '1' ");

while($row = mysql_fetch_assoc($sql)) { ?>
<a target="blank" href="<?php echo $row['url']; ?>"><img src="<?php echo $row['banner']; ?>"></a><br>
<a target="blank" href="<?php echo $row['url']; ?>"><?php echo stripslashes($row['text']); ?></a><br>
<?php } ?>
<br>
</div>
	
						
					
				</div>
				<script type="text/javascript">if (!$(document.body).hasClassName('process-template')) { Rounder.init(); }</script>
			 
				<div class="habblet-container ">		
	
						<div class="ad-container">

</div>
	
						
					
				</div>
				<script type="text/javascript">if (!$(document.body).hasClassName('process-template')) { Rounder.init(); }</script>
			 
</div>

<?php

include('templates/community/footer.php');

?>

