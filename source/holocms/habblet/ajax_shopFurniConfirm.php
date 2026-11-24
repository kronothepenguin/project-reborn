<?php
/*===================================================+
|| # HoloCMS - Website and Content Management System
|+===================================================+
|| # Copyright � 2008 Meth0d. All rights reserved.
|| # http://www.meth0d.org
|+===================================================+
|| # HoloCMS is provided "as is" and comes without
|| # warrenty of any kind. HoloCMS is free software!
|+===================================================+
|| # HoloShop 1.0 Coded By Yifan Lu
|| # HoloShop 2.0 Coded By iJames
|+===================================================*/

include('../core.php');
$ipisinban = mysql_num_rows(mysql_query("Select * from cms_ban_shop where id='".$my_id."'"));
$reasonsql = mysql_fetch_assoc(mysql_query("Select * from cms_ban_shop where id='".$my_id."'"));
$reason = $reasonsql['reason'];


if(!isset($_SESSION['username'])){ echo "<p>\nPlease log in first.\n</p>\n\n<p>\n<a href=\"#\" class=\"new-button\" onclick=\"habboclub.closeSubscriptionWindow(); return false;\"><b>Done</b><i></i></a>\n</p>"; exit; }
if($ipisinban > 0){ echo"<img src=\"./web-gallery/images/catalogue/banned.gif\" style=\"float:left;padding-right:30px;\"/><br /><br /><p>\nYou've been banned from ".$shortname."'s shop.<br />\n The reason for this is: ".$reason."\n</p>\n\n<p>\n<a href=\"#\" class=\"new-button\" onclick=\"habboclub.closeSubscriptionWindow(); return false;\"><b>Done</b><i></i></a>\n</p>";; exit;}
$id = FilterText($_POST['optionNumber']);

$row = mysql_fetch_assoc(mysql_query("SELECT * FROM catalogue_items WHERE tid = '".$id."' LIMIT 1"));
$cct = $row['name_cct'];
$replacers = array("*", ".");
$image = str_replace($replacers, "_", "$cct");
$filename = "../web-gallery/images/catalogue/".$image.".png";
$filename2 = "../web-gallery/images/catalogue/".$image.".gif";
$ammount_get= mysql_fetch_assoc(mysql_query("SELECT * FROM cms_shop_settings"));
$quantity_allowed = $ammount_get['maxiumfurniz'];
if (file_exists($filename)){
	$extention = 'png';
}elseif(file_exists($filename2)){
	$extention = 'gif';
}else{
	$image = 'placeholder';
	$extention = 'png';
} 
?>
<div id="hc_confirm_box">
    <img src="./web-gallery/images/catalogue/<?php echo $image; echo '.'; echo $extention;?>" alt="" align="left" style="margin:10px;" />
<p><b><?php echo $row['catalogue_name']; ?></b></p>
<p>How many <?php echo $row['catalogue_name']; ?>, do you wish to purchase?<p>
<div style="color:#A1A1A1;"><i>Please note you are restricted to purchase over <?php echo $quantity_allowed ?> furni's at a time.</i></div>
<form action="./shop_furni.php?category=<?php echo $row['catalogue_id_page']; ?>" method="post" name="buyfurni">
	<input type="text" name="quantity" value="" />
	<input type="hidden" name="furniID" value="<?php echo $row['tid']; ?>" />
</p>
<p>
<p>
<a id="cancel-button" class="new-button red-button cancel-icon" href="#" onclick="habboclub.closeSubscriptionWindow(); return false;"><b><span></span>Cancel</b><i></i></a>
<a id="save-button" class="new-button green-button save-icon" onclick="document.buyfurni.submit();" style="float:left;"><b><span></span>Purchase</b></b><i></i></a>
<!-- Commented out by iJames due to new buttons -->
<!--<a href="#" class="new-button" onclick="habboclub.closeSubscriptionWindow(); return false;">
<b>Cancel</b><i></i></a>
<input type="submit" value="Go" id="save-button" class="new-button green-button save-icon" /> -->
<!-- Commented out by iJames due to new buttons -->
</form>
</p>
</div>

<div class="clear"></div>



