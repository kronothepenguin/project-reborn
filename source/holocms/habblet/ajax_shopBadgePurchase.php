<?php
/*===================================================+
|| # HoloCMS - Website and Content Management System
|+===================================================+
|| # Copyright © 2008 Meth0d. All rights reserved.
|| # http://www.meth0d.org
|+===================================================+
|| # HoloCMS is provided "as is" and comes without
|| # warrenty of any kind. HoloCMS is free software!
|+===================================================+
|| # HoloShop 1.0 Coded By Yifan Lu
|| # HoloShop 2.0 Coded By iJames
|+===================================================*/

include('../core.php');
if(function_exists(SendMUSData) !== true){ include('../includes/mus.php'); }
$id = FilterText($_POST['optionNumber']);

$row = mysql_fetch_assoc(mysql_query("SELECT * FROM cms_badge_shop WHERE id = '".$id."' LIMIT 1"));

if($myrow['credits'] < $row['cost']){
	$msg = "You don't have enough credits to complete this purchase.";
} else {
	if($row['minrank'] >= $userrow['rank']){
		$check = mysql_query("SELECT * FROM users_badges WHERE userid = '".$my_id."' AND badgeid = '".$row['image']."'");
		if(mysql_num_rows($check) == 0){
			mysql_query("INSERT INTO users_badges (userid,badgeid,iscurrent) VALUES ('".$my_id."','".$row['image']."','0')");
			mysql_query("INSERT INTO cms_transactions (userid,amount,date,descr) VALUES ('".$my_id."','".$row['cost']."','".$date_full."','Purchased the badge ".$row['name']."')") or die(mysql_error());
			$coinsleft = $myrow['credits']-$row['cost'];
			mysql_query("UPDATE users SET credits = '".$coinsleft."' WHERE id = '".$my_id."' LIMIT 1");
			// updates teh badges for the lulz :D
			@SendMusData('UPRS' . $my_id);
			// katsjing sound
            @SendMUSData('UPRC' . $my_id);
			$msg = "You have successfully purchased the badge ".$row['image'];
		}else{
			$msg = "You already own this badge!";
		}
	}else{
		$msg = "You do not have premission to buy this badge!";
	}
}

?>


<div id="hc_confirm_box">

    <?if ($costum == 0){ ?>
						<img src="<?php echo $cimagesurl.$badgesurl.$row['image'].".gif"; ?>" />
						<? }else{ ?>
						<? // Get some of the badges from habbo uk, w00t :D?>
						<img src="http://images.habbohotel.co.uk/c_images/album1584/<? echo $row['image']; ?>.gif" />
						<? } ?>
<p><b><?php echo $row['name']; ?></b></p>
<p><?php echo $msg; ?></p>

<p>
<a href="#" class="new-button" onclick="habboclub.closeSubscriptionWindow(); return false;">
<b>Done</b><i></i></a>
</p>

</div>

<div class="clear"></div>



