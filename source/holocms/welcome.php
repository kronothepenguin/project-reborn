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

$check = mysql_query("SELECT noob FROM users WHERE id='".$my_id."'");
$row = mysql_fetch_assoc($check);

if($row['noob'] != 0) {
header("location:../index.php");

?>

<html>
<head>
  <title>Redirecting...</title>
  <meta http-equiv="content-type" content="text/html; charset=ISO-8859-1">
  <style type="text/css">body { background-color: #e3e3db; text-align: center; font: 11px Verdana, Arial, Helvetica, sans-serif; } a { color: #fc6204; }</style>
<link href="./web-gallery/maintenance/style.css" type="text/css" rel="stylesheet" />

<!--[if IE]>
<link href="./web-gallery/maintenance/ie-all.css" type="text/css" rel="stylesheet" />
<![endif]-->
<!--[if lt IE 7]>
<link href="./web-gallery/maintenance/ie6.css" type="text/css" rel="stylesheet" />
<![endif]-->
</head>
<body>
</body>
</html>
<?php
}else{


$pagename = $name;
$pageid = "3";

// Header for minimail

include('templates/community/subheader.php');
include('templates/community/header.php');
?>

<div id="container">
	<div id="content" style="position: relative" class="clearfix">
	<div id="content" style="position: relative" class="clearfix">
    <div id="column1" class="column">
				<div class="habblet-container ">
						<div class="cbb clearfix red ">

							<h2 class="title">Welcome to <?php echo $sitename; ?>!
							</h2>
						<div id="roomselection-welcome-intro" class="box-content">
<table border="0" width="420" id="table1" cellspacing="0" cellpadding="0">
	<tr>
		<td height="20" background="web-gallery/v2/images/welcome/news_top.gif">&nbsp;</td>
	</tr>
	<tr>
		<td background="web-gallery/v2/images/welcome/news_middle.gif" align="center">
Welcome to Bobble, the funnest and friendliest hotel around.<br>
Be sure to read and follow these rules.<br>
<br><br>
<b>DO:</b><br>
Have fun.<br>
Meet and make new friends.<br>
Create awesome rooms.<br>
Be helpful and kind to other members.<br>
Enjoy the hotel.<br>
<br>
<b>DO NOT:</b><br>
Abuse, harass, or bully other members.<br>
Ask to be staff. (Moderator, Administrator, Manager)<br>
Beg staff for credits or furni.<br>
Clone accounts, or have more than 1 account without permission.<br>
Be racist to other members.<br>
Use the Call For Help because you are bored.<br>
Ask staff to give you furniture that hasn't been released yet.<br>
Sell your account or furniture for a different hotel.<br>
Threaten to hack us, or try and script the hotel.<br>
Give passwords to members, which result in you getting hacked.<br>
Scam furniture.<br>
Be rude to other members.<br>
Give out <u>ANY</u> personal information.<br>
Advertise other hotels.<br>
Spam our discussion board.<br>
<br><br>
If you follow these rules, nothing bad will happen.
<br>
<b>Welcome, and Enjoy <?php echo $sitename; ?>!</b></td>
	</tr>
	<tr>
		<td background="web-gallery/v2/images/welcome/news_bottom.gif" height="29">&nbsp;</td>
	</tr>
</table>
<br />
				<table style="width: 100%">
					<tr align="center">
						<td style="width: 15%">
<img id="error-image" src="./web-gallery/v2/images/frank_welcome.gif" /></td>
						<td style="width: 35%">Thanx to rickymenier on RZ for the page :]</td>
							<td style="width: 50%">
							<a class="new-button fill" align="right" onclick="habboclub.buttonClick; return false;" href="me.php"><b>Continue to Hotel</b><i></i></a>
							</td>
					</tr>
				</table>
</div>
					</div>
				</div>
				<script type="text/javascript">if (!$(document.body).hasClassName('process-template')) { Rounder.init(); }</script>

</div>
<div id="column2" class="column">
				<div class="habblet-container ">

						<div class="cbb clearfix lightgreen">

<div class="welcome-intro clearfix">
	<img alt="Prince-Cutie9" src="http://www.habbo.co.uk/habbo-imaging/avatarimage?figure=<?php echo $myrow['figure']; ?>&size=b&action=crr=667&direction=3&head_direction=3&gesture=srp
" width="64" height="110" class="welcome-habbo" />
    <div id="welcome-intro-welcome-user"  >Welcome, <?php echo $name; ?>!</div>
    <div id="welcome-intro-welcome-party" class="box-content">Thanks for registering. You have been given a set amount of coins to spend, so spend wisely and have fun. Enjoy <?php echo $sitename; ?>!</div>
</div>

</div>



				</div>
				<script type="text/javascript">if (!$(document.body).hasClassName('process-template')) { Rounder.init(); }</script>

				<div class="habblet-container ">





				</div>
				<script type="text/javascript">if (!$(document.body).hasClassName('process-template')) { Rounder.init(); }</script>

				<div class="habblet-container ">





				</div>
				<script type="text/javascript">if (!$(document.body).hasClassName('process-template')) { Rounder.init(); }</script>

				<div class="habblet-container ">





				</div>
				<script type="text/javascript">if (!$(document.body).hasClassName('process-template')) { Rounder.init(); }</script>

				<div class="habblet-container ">
						<div class="cbb clearfix green ">

							<h2 class="title">Got Shockwave?
							</h2>
						<div class="welcome-shockwave clearfix box-content">
    <div id="welcome-shockwave-text">When you open <?php echo $sitename; ?> for the first time you might need to install Shockwave. But don't worry, it's as easy as 1-2-3!</div>
    <div id="welcome-shockwave-logo"><img src="web-gallery/v2/images/welcome/shockwave.gif" alt="shockwave" /></div>
</div>


					</div>
				</div>
				<script type="text/javascript">if (!$(document.body).hasClassName('process-template')) { Rounder.init(); }</script>

</div>
<script type="text/javascript">
HabboView.run();
</script>
<div id="column3" class="column">
				<div class="habblet-container ">

						<div class="ad-container">
<br>
</div>



				</div>
				<script type="text/javascript">if (!$(document.body).hasClassName('process-template')) { Rounder.init(); }</script>

</div>

<!--[if lt IE 7]>
<script type="text/javascript">
Pngfix.doPngImageFix();
</script>
<![endif]-->
<?php

include('templates/community/footer.php');
}
?>