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

///////////////////////////////////////////////////////////////////////////////////////////////
define("IN_HOLOCMS", TRUE);
session_start();

// #########################################################################
// Start the initalization process

@include('./config.php');
@include('../config.php');
include('includes/version.php');

mysql_connect("$sqlhostname", "$sqlusername", "$sqlpassword")or die("<br><font size='2' face='Tahoma'><b>HoloCMS Configuration Error:</b><br>I was unable to connect to the provided MySQL server. Please review the error message above for details.</font>");
mysql_select_db("$sqldb")or die("<br><font size='2' face='Tahoma'><b>HoloCMS Configuration Error:</b><br>Unable to select the database you provided. Either I do not have premission to connect to that database, or the database doesn't exist.</font>");

///////////////////////////////////////////////////////////////////////////////////////////////

function dbquery($query) {
	$result = @mysql_query($query);
	if (!$result) {
		echo mysql_error();
		return false;
	} else {
		return $result;
	}
}

///////////////////////////////////////////////////////////////////////////////////////////////

//$step = $_GET['step'];
//if($step < 0 || $step > 5 || !is_numeric($step)){ $step = 0; }
//if($step > 1){ @include('config.php'); }

///////////////////////////////////////////////////////////////////////////////////////////////

echo "<!DOCTYPE html PUBLIC \"-//W3C//DTD XHTML 1.0 Transitional//EN\" \"http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd\">
<html xmlns=\"http://www.w3.org/1999/xhtml\">
<head>
<meta http-equiv=\"Content-Type\" content=\"text/html; charset=utf-8\" />
<title>HoloCMS - Upgrading</title>
<link rel=\"shortcut icon\" href=\"favicon.ico\" type=\"image/vnd.microsoft.icon\" />
<link rel=\"stylesheet\" href=\"web-gallery/v2/styles/install.css\" type=\"text/css\" />

</head>
<body>
<h1 id=\"logo\"><img alt=\"HoloCMS\" src=\"housekeeping/images/holocms-logo.png\" /></h1>\n";

///////////////////////////////////////////////////////////////////////////////////////////////

if($step == 0){
	if(isset($_POST['update'])) {
	mysql_query("CREATE TABLE IF NOT EXISTS `cms_banners` (
  `id` int(35) NOT NULL auto_increment,
  `text` varchar(50) NOT NULL,
  `banner` varchar(255) NOT NULL,
  `url` varchar(255) NOT NULL,
  `status` smallint(1) NOT NULL default '0',
  PRIMARY KEY  (`id`)
) ENGINE=MyISAM  DEFAULT CHARSET=latin1 AUTO_INCREMENT=6 ;") or die(mysql_error());

mysql_query("INSERT DELAYED INTO `cms_banners` (`id`, `text`, `banner`, `url`, `status`) VALUES
(1, 'HoloCMS, succesfully installed or upgraded!', 'http://images.habbohotel.nl/c_images/album1663/cheerthumb.gif', 'news.php?id=2', 1),
(2, 'Discussion time! Talk with other Holos!', 'http://images.habbohotel.nl/c_images/album824/weekagendathumb.gif', 'forum.php', 1);") or die(mysql_error());

		mysql_query("ALTER TABLE `vouchers` CHANGE `voucher` `voucher` VARCHAR( 20 ) CHARACTER SET latin1 COLLATE latin1_general_ci NOT NULL ,
CHANGE `type` `type` ENUM( 'item', 'credits' ) CHARACTER SET latin1 COLLATE latin1_general_ci NOT NULL DEFAULT 'credits',
CHANGE `credits` `credits` VARCHAR( 255 ) NULL DEFAULT NULL;") or die(mysql_error());

error_reporting(0);
$sql = mysql_query("SELECT noob FROM users LIMIT 1");
if(mysql_num_rows($sql) == 0) {
mysql_query("ALTER TABLE `users` ADD `noob` INT( 1 ) NOT NULL DEFAULT '0';");
}

$sql = mysql_query("SELECT loader FROM cms_system LIMIT 1");
if(mysql_num_rows($sql) == 0) {
	mysql_query("ALTER TABLE `cms_system` ADD `loader` INT( 1 ) NOT NULL DEFAULT '1' AFTER `admin_notes` ;") or die(mysql_error());
}
error_reporting(1);

mysql_query("ALTER TABLE `users` DROP `online`;") or die(mysql_error());

mysql_query("ALTER TABLE `users` ADD `online` INT( 30 ) NOT NULL ;") or die(mysql_error());
	
	echo "<b>Succesfully upgraded.<br></b>You can delete this file: in this version (Version ".$holocms['version']." ".$holocms['stable']." [".$holocms['title']."]) it <b>isn't necessary</b> because no files go lost and no files are going to be \"re-written\".<br><br>";
	} ?>
Update to the newest database - no data are going to be lost.<br>This is version: <?php echo "".$holocms['version']." ".$holocms['stable']." [".$holocms['title']."]"; ?><br>
<form method="post">
<input type="submit" name="update" value="Update to newest database!">
</form>
<?php }

///////////////////////////////////////////////////////////////////////////////////////////////

echo "\n</body>
</html>";

?>