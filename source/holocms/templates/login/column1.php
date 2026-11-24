<?php
/*---------------------------------------------------+
| HoloCMS - Website and Content Management System
+----------------------------------------------------+
| Copyright © 2008 Meth0d
+----------------------------------------------------+
| HoloCMS is provided "as is" and comes without
| warrenty of any kind.
+---------------------------------------------------*/

if (!defined("IN_HOLOCMS")) { header("Location: ../../index.php"); exit; }

?>
<?php if(getContent('enable-flash-promo') == "1"){ ?>
			<div id="process-content">
	        	<div id="column1" class="column">
				<div class="habblet-container " id="create-habbo">

						<div id="create-habbo-flash">
	<div id="create-habbo-nonflash" style="background-image: url(./web-gallery/v2/images/landing/landing_group.png)">
        <div id="landing-register-text"><a href="register.php"><span>Join now, it's free &raquo</span></a></div>
        <div id="landing-promotional-text"><span><?php echo $shortname; ?> is a virtual world where you can meet and make friends.</span></div>
    </div>
	<div class="cbb clearfix green" id="habbo-intro-nonflash">
		<h2 class="title">To get most out of <?php echo $shortname; ?>, do this:</h2>
		<div class="box-content">
			<ul>
				<li id="habbo-intro-install" style="display:none"><a href="http://www.adobe.com/go/getflashplayer">Install Flash Player 8 or higher</a></li>
				<noscript><li>Enable JavaScript</li></noscript>
			</ul>
		</div>
	</div>
</div>

<script type="text/javascript" language="JavaScript">
var swfobj = new SWFObject("http://bobblehotel.sytes.net/data/habbos_v2.swf", "ch", "396", "378", "8");
swfobj.addParam("AllowScriptAccess", "always");
swfobj.addParam("wmode", "transparent");
swfobj.addVariable("base_url", "http://bobblehotel.sytes.net/data");
swfobj.addVariable("habbos_url", "http://bobblehotel.sytes.net/data/avatar/promo_habbos_v2.xml");
swfobj.addVariable("create_button_text", "Join now, it's free &raquo;");
swfobj.addVariable("in_hotel_text", "Online now!");
swfobj.addVariable("slogan", "Bobble is a virtual world where you can meet and make friends.");
swfobj.addVariable("video_start", "PLAY VIDEO");
swfobj.addVariable("video_stop", "STOP VIDEO");
swfobj.addVariable("button_link", "register.php");
swfobj.addVariable("select_button_text", "Join now, it's free &raquo;");
swfobj.addVariable("header_text", "Create your Bobble...");
swfobj.write("create-habbo-flash");
HabboView.add(function() {
	if (deconcept.SWFObjectUtil.getPlayerVersion()["major"] >= 8) {
		try { $("habbo-intro-nonflash").hide(); } catch (e) {}
	} else {
		$("habbo-intro-install").show();
	}
});
var PromoHabbos = { track:function(n) { if (!!n && window.pageTracker) { pageTracker._trackPageview("/landingpromo/" + n); } } }
</script>
<?php } else { ?>
			<div id="process-content">
	        	<div id="column1" class="column">
				<div class="habblet-container " id="create-habbo">

						<div id="create-habbo">
	<div id="create-habbo-nonflash">
        <div id="landing-register-text"><a href="register.php"><span>Join now, it's free >></span></a></div>
        <div id="landing-promotional-text"><span><?php echo $shortname; ?> is a virtual world where you can meet and make friends.</span></div>
    </div>
</div>
<?php } ?>



				</div>
				<script type="text/javascript">if (!$(document.body).hasClassName('process-template')) { Rounder.init(); }</script>

</div>