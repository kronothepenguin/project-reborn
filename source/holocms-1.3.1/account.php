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

$allow_guests = false;

require_once('core.php');
require_once('includes/session.php');
if(function_exists(SendMUSData) !== true){ include('includes/mus.php'); }

$pagename = "Account Settings";
$body_id = "profile";
$pageid = "2";

if(isset($_GET['tab'])){
	if($_GET['tab'] < 1 || $_GET['tab'] > 5 ){
		header("Location: account.php?tab=1");
		$tab = 0;
		exit;
	} else {
		$tab = $_GET['tab'];
	}
} else {
	$tab = "1";
}

if($tab == "1"){

	if(isset($_POST['figureData'])){
		$refer = $_SERVER['HTTP_REFERER']; $pos = strrpos($refer, "account.php"); if ($pos === false) { echo "<h1>Security check failure.</h1>"; exit; }
		$new_figure = addslashes($_POST['figureData']);
		$new_gender = addslashes($_POST['newGender']);
		if($new_gender !== "M" && $new_gender !== "F"){
			$result = "An error occured. Please try again.";
			$error = "1";
		} else {
			if(empty($new_figure)){
				$result = "An error occured trying to process your request.";
				$error = "1";
			} else {
				mysql_query("UPDATE users SET figure = '".$new_figure."', sex = '".$new_gender."' WHERE name = '".$rawname."' LIMIT 1") or die(mysql_error());
				$result = "Account settings updated successfully.";
				$mylook1 = addslashes($_POST['figureData']);
				$mysex1 = addslashes($_POST['newGender']);
				@SendMUSData('UPRA' . $my_id);
			}
		}
	} else {
		$mylook1 = $myrow['figure'];
		$mysex1 = $myrow['sex'];
	}

	// Wardrobe handler
	$slot1 = mysql_query("SELECT figure,gender FROM cms_wardrobe WHERE slotid = '1' AND userid = '".$my_id."' LIMIT 1") or die(mysql_error());
	$slot1 = mysql_fetch_assoc($slot1);
	if(!empty($slot1['figure'])){ $slot1_url = "http://www.habbo.co.uk/habbo-imaging/avatarimage?figure=".$slot1['figure']."&size=s&direction=4&head_direction=4&gesture=sml"; }
	$slot2 = mysql_query("SELECT figure,gender FROM cms_wardrobe WHERE slotid = '2' AND userid = '".$my_id."' LIMIT 1") or die(mysql_error());
	$slot2 = mysql_fetch_assoc($slot2);
	if(!empty($slot2['figure'])){ $slot2_url = "http://www.habbo.co.uk/habbo-imaging/avatarimage?figure=".$slot2['figure']."&size=s&direction=4&head_direction=4&gesture=sml"; }
	$slot3 = mysql_query("SELECT figure,gender FROM cms_wardrobe WHERE slotid = '3' AND userid = '".$my_id."' LIMIT 1") or die(mysql_error());
	$slot3 = mysql_fetch_assoc($slot3);
	if(!empty($slot3['figure'])){ $slot3_url = "http://www.habbo.co.uk/habbo-imaging/avatarimage?figure=".$slot3['figure']."&size=s&direction=4&head_direction=4&gesture=sml"; }
	$slot4 = mysql_query("SELECT figure,gender FROM cms_wardrobe WHERE slotid = '4' AND userid = '".$my_id."' LIMIT 1") or die(mysql_error());
	$slot4 = mysql_fetch_assoc($slot4);
	if(!empty($slot4['figure'])){ $slot4_url = "http://www.habbo.co.uk/habbo-imaging/avatarimage?figure=".$slot4['figure']."&size=s&direction=4&head_direction=4&gesture=sml"; }
	$slot5 = mysql_query("SELECT figure,gender FROM cms_wardrobe WHERE slotid = '5' AND userid = '".$my_id."' LIMIT 1") or die(mysql_error());
	$slot5 = mysql_fetch_assoc($slot5);
	if(!empty($slot5['figure'])){ $slot5_url = "http://www.habbo.co.uk/habbo-imaging/avatarimage?figure=".$slot5['figure']."&size=s&direction=4&head_direction=4&gesture=sml"; }

} else if($tab == "2"){
	if(isset($_POST['save'])){
		if(strlen($_POST['motto']) > 32){
			$result = "Sorry, but the motto you have chosen is too long!";
			$error = "1";
			$motto = $_POST['motto']; // Do not add slashes, no database communication here.
		} else {
			$motto = htmlspecialchars(addslashes($_POST['motto']));
			mysql_query("UPDATE users SET mission = '".$motto."' WHERE name = '".$rawname."' and password = '".$rawpass."' LIMIT 1");
			$result = "Changes saved successfully.";
			$motto = $_POST['motto']; // Do not add slashes, this is for display purposes.
			@SendMUSData('UPRA' . $my_id);
		}
	} else {
		$motto = stripslashes($myrow['mission']);
	}
} else if($tab == "3"){
	if(isset($_POST['save'])){
		$pass1 = HoloHash($_POST['password']);
		$day1 = $_POST['day'];
		$month1 = $_POST['month'];
		$year1 = $_POST['year'];
		if(!is_numeric($day1) || !is_numeric($month1) || !is_numeric($year1)){ exit; }
		$formatted_dob = $day1 . "-" . $month1 . "-" . $year1;
		$mail1 = addslashes($_POST['email']);
		$themail = $mail1;
		if($pass1 == $myrow['password'] && $formatted_dob == $myrow['birth']){
		$email_check = preg_match("/^[a-z0-9_\.-]+@([a-z0-9]+([\-]+[a-z0-9]+)*\.)+[a-z]{2,7}$/i", $mail1);
			if($email_check == "1"){
				mysql_query("UPDATE users SET email = '".$mail1."' WHERE name = '".$rawname."' and password = '".$rawpass."' LIMIT 1") or die(mysql_error());
				$result = "Your e-mail address has been changed to " . stripslashes($mail1);
			} else {
				$result = "Invalid e-mail address";
				$error = "1";
			}
		} else {
			$result = "The given information doesn't match what we have on record";
			$error = "1";
		}
	} else {
		$themail = $myrow['email'];
	}
} else if($tab == "4"){
	if(isset($_POST['save'])){
		$pass1 = HoloHash($_POST['password']);
		$day1 = $_POST['day'];
		$month1 = $_POST['month'];
		$year1 = $_POST['year'];
		if(!is_numeric($day1) || !is_numeric($month1) || !is_numeric($year1)){ exit; }
		$formatted_dob = $day1 . "-" . $month1 . "-" . $year1;
		$newpass = addslashes($_POST['pass']);
		$newpass_conf = addslashes($_POST['confpass']);
		if($pass1 == $myrow['password'] && $formatted_dob == $myrow['birth']){
			if($newpass == $newpass_conf){
				if(strlen($newpass) < 6){
					$result = "Password is too short, 6 characters minimum";
					$error = "1";
				} else {
					if(strlen($newpass) > 25){
						$result = "Password is too long, 25 characters maximum";
						$error = "1";
					} else {
						$newpass = HoloHash(stripslashes($newpass));
						mysql_query("UPDATE users SET password = '".$newpass."' WHERE name = '".$rawname."' and password = '".$rawpass."' LIMIT 1") or die(mysql_error());
						$result = "Your password has been changed successfully. You will need to login again.";
					}
				}
			} else {
				$result = "The passwords don't match";
				$error = "1";
			}
		} else {
			$result = "The given information doesn't match what we have on record";
			$error = "1";
		}
	}
}

include('templates/community/subheader.php');
include('templates/community/header.php');

// Save it in a variable to avoid having to check wether this user is HC member or not each time
$hc_member = IsHCMember($my_id);

?>

<div id="container">
	<div id="content">
    <div>
<div class="content">
<div class="habblet-container" style="float:left; width:210px;">
<div class="cbb settings">

<h2 class="title">Account Settings</h2>
<div class="box-content">
            <div id="settingsNavigation">
            <ul>
		<?php
		if($tab == "1"){
                echo "<li class='selected'>Looks
                </li>";
		} else {
                echo "<li><a href='account.php?tab=1'>Looks</a>
                </li>";
		}

		if($tab == "2"){
                echo "<li class='selected'>Motto &amp; Preferences
                </li>";
		} else {
                echo "<li><a href='account.php?tab=2'>Motto &amp; Preferences</a>
                </li>";
		}

		if($tab == "3"){
                echo "<li class='selected'>Email
                </li>";
		} else {
                echo "<li><a href='account.php?tab=3'>Email</a>
                </li>";
		}

		if($tab == "4"){
                echo "<li class='selected'>Password
                </li>";
		} else {
                echo "<li><a href='account.php?tab=4'>Password</a>
                </li>";
		}

		if($tab == "5"){
                echo "<li class='selected'>Refer Options
                </li>";
		} else {
                echo "<li><a href='account.php?tab=5'>Refer Options</a>
                </li>";
		}

		/*if($tab == "6"){
                echo "<li class='selected'>Friend Management
                </li>";
		} else {
                echo "<li><a href='account.php?tab=6'>Friend Management</a>
                </li>";
		}*/
		?>
            </ul>
            </div>
</div></div>
<?php if( !IsHCMember($my_id) ){ ?>
    <div class="cbb habboclub-tryout">
        <h2 class="title">Join <?php echo $shortname; ?> Club</h2>
        <div class="box-content">
            <div class="habboclub-banner-container habboclub-clothes-banner"></div>
            <p class="habboclub-header"><?php echo $shortname; ?> Club is our VIP members-only club: absolutely no riff-raff admitted! Members enjoy a wide range of benifits, including exclusive clothes, free gifts and an extended Friend List.</p>
            <p class="habboclub-link"><a href="club.php">Check out <?php echo $shortname; ?> Club &gt;&gt;</a></p>
        </div>
    </div>
<?php } ?>
</div>

<?php if($tab == "1"){ ?>
<div class="habblet-container" style="float:left; width: 560px;">
<div class="cbb clearfix settings">

<h2 class="title">Change your looks</h2>
<div class="box-content">
            
<?php
if(!empty($result)){
	if($error == "1"){
	echo "<div class='rounded rounded-red'>";
	} else {
	echo "<div class='rounded rounded-green'>";
	}
	echo "".$result."<br />
	</div><br />";
}
?>
	<div>&nbsp;</div>
            	
<div id="settings-editor">
You need to have a Flash player installed on your computer before being able to edit your Habbo character. You can download the player from here: <a target="_blank" href="http://www.adobe.com/go/getflashplayer">http://www.adobe.com/go/getflashplayer</a>
</div>

<?php if($hc_member){ ?><div id="settings-wardrobe" style="display: none">
<ol id="wardrobe-slots">
	<li>
		<p id="wardrobe-slot-1" style="background-image: url(<?php echo $slot1_url; ?>)">
	   		<span id="wardrobe-store-1" class="wardrobe-store"></span>
	   		<span id="wardrobe-dress-1" class="wardrobe-dress"></span>
   		</p>
    </li>
	<li>
		<p id="wardrobe-slot-2" style="background-image: url(<?php echo $slot2_url; ?>)">
	   		<span id="wardrobe-store-2" class="wardrobe-store"></span>
	   		<span id="wardrobe-dress-2" class="wardrobe-dress"></span>
   		</p>
    </li>
	<li>
		<p id="wardrobe-slot-3" style="background-image: url(<?php echo $slot3_url; ?>)">
	   		<span id="wardrobe-store-3" class="wardrobe-store"></span>
	   		<span id="wardrobe-dress-3" class="wardrobe-dress"></span>
   		</p>
    </li>
	<li>
		<p id="wardrobe-slot-4" style="background-image: url(<?php echo $slot4_url; ?>)">
	   		<span id="wardrobe-store-4" class="wardrobe-store"></span>
	   		<span id="wardrobe-dress-4" class="wardrobe-dress"></span>
   		</p>
    </li>
	<li>
		<p id="wardrobe-slot-5" style="background-image: url(<?php echo $slot5_url; ?>)">
	   		<span id="wardrobe-store-5" class="wardrobe-store"></span>
	   		<span id="wardrobe-dress-5" class="wardrobe-dress"></span>
   		</p>
    </li>
</ol>

<script type="text/javascript">
<?php if(!empty($slot1['figure'])){ ?>
Wardrobe.add(1, "<?php echo $slot1['figure']; ?>", "<?php echo $slot1['gender']; ?>", true);
$("wardrobe-dress-" + 1).show();
<?php } ?>
<?php if(!empty($slot2['figure'])){ ?>
Wardrobe.add(2, "<?php echo $slot2['figure']; ?>", "<?php echo $slot2['gender']; ?>", true);
$("wardrobe-dress-" + 2).show();
<?php } ?>
<?php if(!empty($slot3['figure'])){ ?>
Wardrobe.add(3, "<?php echo $slot3['figure']; ?>", "<?php echo $slot3['gender']; ?>", true);
$("wardrobe-dress-" + 3).show();
<?php } ?>
<?php if(!empty($slot4['figure'])){ ?>
Wardrobe.add(4, "<?php echo $slot4['figure']; ?>", "<?php echo $slot4['gender']; ?>", true);
$("wardrobe-dress-" + 4).show();
<?php } ?>
<?php if(!empty($slot5['figure'])){ ?>
Wardrobe.add(5, "<?php echo $slot5['figure']; ?>", "<?php echo $slot5['gender']; ?>", true);
$("wardrobe-dress-" + 5).show();
<?php } ?>
L10N.put("profile.figure.wardrobe_replace.title", "Replace?");
L10N.put("profile.figure.wardrobe_replace.dialog", "<p\>\nAre you sure you want to replace the stored outfit with the new one?\n</p\>\n\n<p\>\n<a href=\"#\" class=\"new-button\" id=\"wardrobe-replace-cancel\"\><b\>Cancel</b\><i\></i\></a\>\n<a href=\"#\" class=\"new-button\" id=\"wardrobe-replace-ok\"\><b\>OK</b\><i\></i\></a\>\n</p\>\n\n<div class=\"clear\"\></div\>\n");
L10N.put("profile.figure.wardrobe_invalid_data", "Error! This outfit cannot be saved.");
L10N.put("profile.figure.wardrobe_instructions", "Press red arrows to save up to 5 outfits to your wardrobe. Press green arrow to select an outfit and save changes to take it into use.");
Wardrobe.init();
</script>
</div><?php } ?>

<div id="settings-hc" style="display: none">
	<div class="rounded rounded-hcred clearfix">
<a href="club.php" id="settings-hc-logo"></a>
Items marked with the Habbo Club symbol <img src="./web-gallery/v2/images/habboclub/hc_mini.png" /> are available only to Habbo Club members. <a href="club.php">Join now!</a>
	</div>
</div>

<div id="settings-oldfigure" style="display: none">
	<div class="rounded rounded-lightbrown clearfix">
Your Habbo had clothes or colors that are not selectable anymore.  
Please save your new looks here.
	</div>
</div>

<form method="post" action="account.php?tab=1" id="settings-form" style="display: none">
<input type="hidden" name="tab" value="1" />
<input type="hidden" name="__app_key" value="HoloCMS" />
<input type="hidden" name="figureData" id="settings-figure" value="<?php echo $mylook1; ?>" />
<input type="hidden" name="newGender" id="settings-gender" value="<?php echo $mysex1; ?>" />
<input type="hidden" name="editorState" id="settings-state" value="" />
<a href="#" id="settings-submit" class="new-button disabled-button"><b>Save changes</b><i></i></a>

<script type="text/javascript" language="JavaScript">
var swfobj = new SWFObject("http://www.habbo.co.uk/flash/HabboRegistration.swf", "habboreg", "435", "400", "8");
swfobj.addParam("base", "http://www.habbo.co.uk/flash/");
swfobj.addParam("wmode", "opaque");
swfobj.addParam("AllowScriptAccess", "always");
swfobj.addVariable("figuredata_url", "http://www.habbohotel.co.uk/gamedata/figuredata");
swfobj.addVariable("draworder_url", "http://www.habbohotel.co.uk/gamedata/figurepartconfig/draworder");
swfobj.addVariable("localization_url", "http://www.habbo.co.uk/figure/figure_editor_xml");
swfobj.addVariable("figure", "<?php echo $mylook1; ?>");
swfobj.addVariable("gender", "<?php echo $mysex1; ?>");

swfobj.addVariable("showClubSelections", "1");
<?php if( $hc_member ){ ?>swfobj.addVariable("userHasClub", "1");<?php } ?>

if (deconcept.SWFObjectUtil.getPlayerVersion()["major"] >= 8) {
	<?php if( !$hc_member){ ?>$("settings-editor").setStyle({ textAlign: "center"});<?php } ?>
	swfobj.write("settings-editor");
	$("settings-form").show();
	<?php if( $hc_member){ ?>$("settings-wardrobe").show();<?php } ?>
}
</script>

</form>

</div>

</div>
</div>
</div>
</div>
    </div>
<?php } else if($tab == "2"){ ?>
    <div class="habblet-container " style="float:left; width: 560px;">
        <div class="cbb clearfix settings">

            <h2 class="title">Change Your Profile</h2>
            <div class="box-content">
            


<form action="account.php?tab=2" method="post">
<input type="hidden" name="tab" value="2" />
<input type="hidden" name="__app_key" value="HoloCMS" />

<?php
if(!empty($result)){
	if($error == "1"){
	echo "<div class='rounded rounded-red'>";
	} else {
	echo "<div class='rounded rounded-green'>";
	}
	echo $result . "<br />
	</div><br />";
}
?>

<h3>Your motto</h3>

<p>
Your motto is seen by everyone, so think carefully!
</p>

<p>
<span class="label">Motto:</span>
<input type="text" name="motto" size="32" maxlength="32" value="<?php echo stripslashes($motto); ?>" id="avatarmotto" />
</p>

<?php if( IsHCMember($my_id) ){ ?>
<h3>Club Membership</h3>

<p>You are a <?php echo $shortname; ?> Club member. Your membership will expire in <b><?php echo HCDaysLeft($my_id); ?></b> days. If you would like to extend your membership, please click <a href='club.php'>here</a>.</p>
<?php }?>
<div class="settings-buttons">
<input type="submit" value="Save changes" name="save" class="submit" />
</div>

</form>

</div>
</div>
</div>
</div></div>
    </div>
<?php } else if($tab == "3"){ ?>
    <div class="habblet-container " style="float:left; width: 560px;">
        <div class="cbb clearfix settings">

            <h2 class="title">Change Your Email Settings</h2>
            <div class="box-content">

<?php
if(!empty($result)){
	if($error == "1"){
	echo "<div class='rounded rounded-red'>";
	} else {
	echo "<div class='rounded rounded-green'>";
	}
	echo "".$result."<br />
	</div><br />";
}
?>
            


<form action="account.php?tab=3" method="post" id="emailform">
<input type="hidden" name="tab" value="3" />
<input type="hidden" name="__app_key" value="HoloCMS" />

<div class="settings-step">

	<h4>1.</h4>
	<div class="settings-step-content">

<h3>Give your current details</h3>

<p>
 <label for="currentpassword">Current password:</label><br />
 <input type="password" size="32" maxlength="32" name="password" id="currentpassword" class="currentpassword " />
</p>

<div>
<div><label for="birthdate">Birthdate:</label></div>
<div id="required-birthday" ><select name="day" id="day" class="dateselector"><option value="">Day</option><option value="1">1</option><option value="2">2</option><option value="3">3</option><option value="4">4</option><option value="5">5</option><option value="6">6</option><option value="7">7</option><option value="8">8</option><option value="9">9</option><option value="10">10</option><option value="11">11</option><option value="12">12</option><option value="13">13</option><option value="14">14</option><option value="15">15</option><option value="16">16</option><option value="17">17</option><option value="18">18</option><option value="19">19</option><option value="20">20</option><option value="21">21</option><option value="22">22</option><option value="23">23</option><option value="24">24</option><option value="25">25</option><option value="26">26</option><option value="27">27</option><option value="28">28</option><option value="29">29</option><option value="30">30</option><option value="31">31</option></select> <select name="month" id="month" class="dateselector"><option value="">Month</option><option value="1">January</option><option value="2">February</option><option value="3">March</option><option value="4">April</option><option value="5">May</option><option value="6">June</option><option value="7">July</option><option value="8">August</option><option value="9">September</option><option value="10">October</option><option value="11">November</option><option value="12">December</option></select> <select name="year" id="year" class="dateselector"><option value="">Year</option><option value="2008">2008</option><option value="2007">2007</option><option value="2006">2006</option><option value="2005">2005</option><option value="2004">2004</option><option value="2003">2003</option><option value="2002">2002</option><option value="2001">2001</option><option value="2000">2000</option><option value="1999">1999</option><option value="1998">1998</option><option value="1997">1997</option><option value="1996">1996</option><option value="1995">1995</option><option value="1994">1994</option><option value="1993">1993</option><option value="1992">1992</option><option value="1991">1991</option><option value="1990">1990</option><option value="1989">1989</option><option value="1988">1988</option><option value="1987">1987</option><option value="1986">1986</option><option value="1985">1985</option><option value="1984">1984</option><option value="1983">1983</option><option value="1982">1982</option><option value="1981">1981</option><option value="1980">1980</option><option value="1979">1979</option><option value="1978">1978</option><option value="1977">1977</option><option value="1976">1976</option><option value="1975">1975</option><option value="1974">1974</option><option value="1973">1973</option><option value="1972">1972</option><option value="1971">1971</option><option value="1970">1970</option><option value="1969">1969</option><option value="1968">1968</option><option value="1967">1967</option><option value="1966">1966</option><option value="1965">1965</option><option value="1964">1964</option><option value="1963">1963</option><option value="1962">1962</option><option value="1961">1961</option><option value="1960">1960</option><option value="1959">1959</option><option value="1958">1958</option><option value="1957">1957</option><option value="1956">1956</option><option value="1955">1955</option><option value="1954">1954</option><option value="1953">1953</option><option value="1952">1952</option><option value="1951">1951</option><option value="1950">1950</option><option value="1949">1949</option><option value="1948">1948</option><option value="1947">1947</option><option value="1946">1946</option><option value="1945">1945</option><option value="1944">1944</option><option value="1943">1943</option><option value="1942">1942</option><option value="1941">1941</option><option value="1940">1940</option><option value="1939">1939</option><option value="1938">1938</option><option value="1937">1937</option><option value="1936">1936</option><option value="1935">1935</option><option value="1934">1934</option><option value="1933">1933</option><option value="1932">1932</option><option value="1931">1931</option><option value="1930">1930</option><option value="1929">1929</option><option value="1928">1928</option><option value="1927">1927</option><option value="1926">1926</option><option value="1925">1925</option><option value="1924">1924</option><option value="1923">1923</option><option value="1922">1922</option><option value="1921">1921</option><option value="1920">1920</option><option value="1919">1919</option><option value="1918">1918</option><option value="1917">1917</option><option value="1916">1916</option><option value="1915">1915</option><option value="1914">1914</option><option value="1913">1913</option><option value="1912">1912</option><option value="1911">1911</option><option value="1910">1910</option><option value="1909">1909</option><option value="1908">1908</option><option value="1907">1907</option><option value="1906">1906</option><option value="1905">1905</option><option value="1904">1904</option><option value="1903">1903</option><option value="1902">1902</option><option value="1901">1901</option><option value="1900">1900</option></select> </div>
</div>

	</div>
</div>
<div class="settings-step">

	<h4>2.</h4>
	<div class="settings-step-content">

<h3>Enter your new email address</h3>

<p>Make sure you type in your email address correctly!</p>

<p>
<label for="email">Email address:</label><br />
<input type="text" name="email" id="email" size="32" maxlength="48" value="<?php echo $themail; ?>" />
</p>

<p>
 <input name="directemail" id="directemail"  type="checkbox"> <label for="directemail">Yes, please send me <?php echo $sitename; ?> updates, including the newsletter!</label>
</p>

	</div>
</div>

<div class="settings-buttons">
<input type="submit" value="Save changes" name="save" class="submit" />
</div>

</form>

</div></div></div></div>


</div>
    </div>
<?php } else if($tab == "4"){ ?>
    <div class="habblet-container " style="float:left; width: 560px;">
        <div class="cbb clearfix settings">

            <h2 class="title">Change Your Password Settings</h2>
            <div class="box-content">

<?php
if(!empty($result)){
	if($error == "1"){
	echo "<div class='rounded rounded-red'>";
	} else {
	echo "<div class='rounded rounded-green'>";
	}
	echo "".$result."<br />
	</div><br />";
}
?>
            
<form action="account.php?tab=4" method="post" id="passwordform">
<input type="hidden" name="tab" value="4" />
<input type="hidden" name="__app_key" value="HoloCMS" />

<div class="settings-step">

	<h4>1.</h4>
	<div class="settings-step-content">

<h3>Give your current details</h3>

<p>
 <label for="currentpassword">Current password:</label><br />
 <input type="password" size="32" maxlength="32" name="password" id="currentpassword" class="currentpassword " />
</p>

<div>
<div><label for="birthdate">Birthdate:</label></div>
<div id="required-birthday" ><select name="day" id="day" class="dateselector"><option value="">Day</option><option value="1">1</option><option value="2">2</option><option value="3">3</option><option value="4">4</option><option value="5">5</option><option value="6">6</option><option value="7">7</option><option value="8">8</option><option value="9">9</option><option value="10">10</option><option value="11">11</option><option value="12">12</option><option value="13">13</option><option value="14">14</option><option value="15">15</option><option value="16">16</option><option value="17">17</option><option value="18">18</option><option value="19">19</option><option value="20">20</option><option value="21">21</option><option value="22">22</option><option value="23">23</option><option value="24">24</option><option value="25">25</option><option value="26">26</option><option value="27">27</option><option value="28">28</option><option value="29">29</option><option value="30">30</option><option value="31">31</option></select> <select name="month" id="month" class="dateselector"><option value="">Month</option><option value="1">January</option><option value="2">February</option><option value="3">March</option><option value="4">April</option><option value="5">May</option><option value="6">June</option><option value="7">July</option><option value="8">August</option><option value="9">September</option><option value="10">October</option><option value="11">November</option><option value="12">December</option></select> <select name="year" id="year" class="dateselector"><option value="">Year</option><option value="2008">2008</option><option value="2007">2007</option><option value="2006">2006</option><option value="2005">2005</option><option value="2004">2004</option><option value="2003">2003</option><option value="2002">2002</option><option value="2001">2001</option><option value="2000">2000</option><option value="1999">1999</option><option value="1998">1998</option><option value="1997">1997</option><option value="1996">1996</option><option value="1995">1995</option><option value="1994">1994</option><option value="1993">1993</option><option value="1992">1992</option><option value="1991">1991</option><option value="1990">1990</option><option value="1989">1989</option><option value="1988">1988</option><option value="1987">1987</option><option value="1986">1986</option><option value="1985">1985</option><option value="1984">1984</option><option value="1983">1983</option><option value="1982">1982</option><option value="1981">1981</option><option value="1980">1980</option><option value="1979">1979</option><option value="1978">1978</option><option value="1977">1977</option><option value="1976">1976</option><option value="1975">1975</option><option value="1974">1974</option><option value="1973">1973</option><option value="1972">1972</option><option value="1971">1971</option><option value="1970">1970</option><option value="1969">1969</option><option value="1968">1968</option><option value="1967">1967</option><option value="1966">1966</option><option value="1965">1965</option><option value="1964">1964</option><option value="1963">1963</option><option value="1962">1962</option><option value="1961">1961</option><option value="1960">1960</option><option value="1959">1959</option><option value="1958">1958</option><option value="1957">1957</option><option value="1956">1956</option><option value="1955">1955</option><option value="1954">1954</option><option value="1953">1953</option><option value="1952">1952</option><option value="1951">1951</option><option value="1950">1950</option><option value="1949">1949</option><option value="1948">1948</option><option value="1947">1947</option><option value="1946">1946</option><option value="1945">1945</option><option value="1944">1944</option><option value="1943">1943</option><option value="1942">1942</option><option value="1941">1941</option><option value="1940">1940</option><option value="1939">1939</option><option value="1938">1938</option><option value="1937">1937</option><option value="1936">1936</option><option value="1935">1935</option><option value="1934">1934</option><option value="1933">1933</option><option value="1932">1932</option><option value="1931">1931</option><option value="1930">1930</option><option value="1929">1929</option><option value="1928">1928</option><option value="1927">1927</option><option value="1926">1926</option><option value="1925">1925</option><option value="1924">1924</option><option value="1923">1923</option><option value="1922">1922</option><option value="1921">1921</option><option value="1920">1920</option><option value="1919">1919</option><option value="1918">1918</option><option value="1917">1917</option><option value="1916">1916</option><option value="1915">1915</option><option value="1914">1914</option><option value="1913">1913</option><option value="1912">1912</option><option value="1911">1911</option><option value="1910">1910</option><option value="1909">1909</option><option value="1908">1908</option><option value="1907">1907</option><option value="1906">1906</option><option value="1905">1905</option><option value="1904">1904</option><option value="1903">1903</option><option value="1902">1902</option><option value="1901">1901</option><option value="1900">1900</option></select> </div>
</div>

	</div>
</div>
<div class="settings-step">

	<h4>2.</h4>
	<div class="settings-step-content">

<h3>Choose a new password</h3>

<p>Enter your new password of choice and confirm it in the second field.</p>

<p>
<label for="pass">New password:</label><br />
<input type="password" name="pass" id="password" size="32" maxlength="48" value="" />
</p>

<p>
<label for="confpass">Confirm new password:</label><br/>
<input type="password" name="confpass" id="password" size="32" maxlength="48" value="" />
</p>

	</div>
</div>

<div class="settings-buttons">
<input type="submit" value="Save changes" name="save" class="submit" />
</div>

</form>

</div></div></div></div>


</div>
    </div>
<?php } else if($tab == "5"){ ?>
    <div class="habblet-container " style="float:left; width: 560px;">
        <div class="cbb clearfix settings">

            <h2 class="title">Refer Options</h2>
            <div class="box-content">
		<h3>Refer users and get credits</h3>
		<p>Out of credits again? Can't find staff that is willing to fill up your purse? Want to buy that shiney rare but just don't have the credits for it? Don't stress, just get a few friends to sign up on <?php echo $shortname; ?>! Do that, and your purse will be filled again in no time! Below are a few options you have at your disposal.</p>
		<h3>Referal Options</h3>
		<p>There are two ways you can use to get refers, and with that, free credits.</p>
		<p><b>1. Send your friends a link</b><br />This option is probably as easy as it gets; it basicly does step 2, but automaticly! You just send your friends a invite with the link shown below, your friends click the link, and if they complete registration, you get free credits! This is your referal link to get some easy credits:<br /><br />
		<input type="text" size="80%" disabled="disabled" value="<?php if(!empty($path)){ echo $path; } ?>register.php?refer=<?php echo $rawname; ?>"></p>
		<p><b>2. Let them fill in your name during registration</b><br />During the registration process, users can manually give the username of the person that referred them to the site. If they complete registration, that person gets credits! And that person could be you, if you have some friends that are nice enough to fill in your username.
		<h3>Today's Referal Reward</h3>
		<p>This is the amount of credits you get per user you refer. This amount may change over time.<br />
		<br />
		<b><?php echo $reward; ?></b> credits <sup>per refer</sup>
		</p>
	    </div>
	</div>
    </div>
<?php } elseif($tab == "6"){ ?>
<div id="friend-management" class="habblet-container">
                <div class="cbb clearfix settings">
                    <h2 class="title">Friend Management</h2>
                    <div id="friend-management-container" class="box-content">
                        <div id="category-view" class="clearfix">
                            <div id="search-view">
                                Search for a friend below:
				                <div id="friend-search" class="friendlist-search">
					                <input type="text" maxlength="32" id="friend_query" class="friend-search-query" />
					                <a class="friendlist-search new-button search-icon" id="friend-search-button"><b><span></span></b><i></i></a>
					            </div>
                            </div>
                            <div id="category-list">
<div id="friends-category-title">
    Friend categories
</div>

<div class="category-default category-item selected-category" id="category-item-0">Friends</div>

    <input type="text" maxlength="32" id="category-name" class="create-category" /><div id="add-category-button" class="friendmanagement-small-icons add-category-item add-category"></div>
                            </div>
                        </div>
                        <div id="friend-list" class="clearfix">
<div id="friend-list-header-container" class="clearfix">
    <div id="friend-list-header">
        <div class="page-limit">
            <div class="big-icons friend-header-icon">Friends
                <br />Show
                30 |
                <a class="category-limit" id="pagelimit-50">50</a> |
                <a class="category-limit" id="pagelimit-100">100</a>
            </div>
        </div>
    </div>
    <div id="friend-list-paging">
        </div>
    </div>


<form id="friend-list-form">
    <table id="friend-list-table" border="0" cellpadding="0" cellspacing="0">
        <tbody>
            <tr class="friend-list-header">
                <td class="friend-select" />
                <td class="friend-name table-heading">Name</td>
                <td class="friend-login table-heading">Last login</td>
                <td class="friend-remove table-heading">Remove</td>
            </tr>
           <tr class="odd">
               <td><input type="checkbox" name="friendList" value="21250220" /></td>
               <td class="friend-name">
                -Chicago,
               </td>
               <td class="friend-login" title="15/04/08 00:29">4 weeks ago</td>
               <td class="friend-remove"><div id="remove-friend-button-21250220" class="friendmanagement-small-icons friendmanagement-remove remove-friend"></div></td>
           </tr>
           <tr class="even">
               <td><input type="checkbox" name="friendList" value="21078756" /></td>
               <td class="friend-name">
                -kit-kat-2k8-
               </td>
               <td class="friend-login" title="13/03/08 16:52">1 month ago</td>
               <td class="friend-remove"><div id="remove-friend-button-21078756" class="friendmanagement-small-icons friendmanagement-remove remove-friend"></div></td>
           </tr>
           <tr class="odd">
               <td><input type="checkbox" name="friendList" value="21078758" /></td>
               <td class="friend-name">
                @nthony841
               </td>
               <td class="friend-login" title="20/01/08 14:09">3 months ago</td>
               <td class="friend-remove"><div id="remove-friend-button-21078758" class="friendmanagement-small-icons friendmanagement-remove remove-friend"></div></td>
           </tr>
           <tr class="even">
               <td><input type="checkbox" name="friendList" value="21054355" /></td>
               <td class="friend-name">
                arkonia
               </td>
               <td class="friend-login" title="19/01/08 16:31">3 months ago</td>
               <td class="friend-remove"><div id="remove-friend-button-21054355" class="friendmanagement-small-icons friendmanagement-remove remove-friend"></div></td>
           </tr>
           <tr class="odd">
               <td><input type="checkbox" name="friendList" value="12715297" /></td>
               <td class="friend-name">
                BlueEyedSarah
               </td>
               <td class="friend-login" title="06/05/08 20:11">11 hours ago</td>
               <td class="friend-remove"><div id="remove-friend-button-12715297" class="friendmanagement-small-icons friendmanagement-remove remove-friend"></div></td>
           </tr>
           <tr class="even">
               <td><input type="checkbox" name="friendList" value="21046918" /></td>
               <td class="friend-name">
                Cute-Sarah24
               </td>
               <td class="friend-login" title="20/01/08 13:38">3 months ago</td>
               <td class="friend-remove"><div id="remove-friend-button-21046918" class="friendmanagement-small-icons friendmanagement-remove remove-friend"></div></td>
           </tr>
           <tr class="odd">
               <td><input type="checkbox" name="friendList" value="20970528" /></td>
               <td class="friend-name">
                CuTiE@BeAuTi
               </td>
               <td class="friend-login" title="06/05/08 19:48">11 hours ago</td>
               <td class="friend-remove"><div id="remove-friend-button-20970528" class="friendmanagement-small-icons friendmanagement-remove remove-friend"></div></td>
           </tr>
           <tr class="even">
               <td><input type="checkbox" name="friendList" value="21192762" /></td>
               <td class="friend-name">
                Emzy313
               </td>
               <td class="friend-login" title="05/04/08 15:42">1 month ago</td>
               <td class="friend-remove"><div id="remove-friend-button-21192762" class="friendmanagement-small-icons friendmanagement-remove remove-friend"></div></td>
           </tr>
           <tr class="odd">
               <td><input type="checkbox" name="friendList" value="21033165" /></td>
               <td class="friend-name">
                emzy81
               </td>
               <td class="friend-login" title="03/05/08 08:47">3 days ago</td>
               <td class="friend-remove"><div id="remove-friend-button-21033165" class="friendmanagement-small-icons friendmanagement-remove remove-friend"></div></td>
           </tr>
           <tr class="even">
               <td><input type="checkbox" name="friendList" value="20353184" /></td>
               <td class="friend-name">
                Gabriiella.OX
               </td>
               <td class="friend-login" title="24/02/08 10:59">2 months ago</td>
               <td class="friend-remove"><div id="remove-friend-button-20353184" class="friendmanagement-small-icons friendmanagement-remove remove-friend"></div></td>
           </tr>
           <tr class="odd">
               <td><input type="checkbox" name="friendList" value="21068512" /></td>
               <td class="friend-name">
                joewoodland
               </td>
               <td class="friend-login" title="06/04/08 09:48">1 month ago</td>
               <td class="friend-remove"><div id="remove-friend-button-21068512" class="friendmanagement-small-icons friendmanagement-remove remove-friend"></div></td>
           </tr>
           <tr class="even">
               <td><input type="checkbox" name="friendList" value="21117541" /></td>
               <td class="friend-name">
                kimplusdemi
               </td>
               <td class="friend-login" title="27/01/08 12:08">3 months ago</td>
               <td class="friend-remove"><div id="remove-friend-button-21117541" class="friendmanagement-small-icons friendmanagement-remove remove-friend"></div></td>
           </tr>
           <tr class="odd">
               <td><input type="checkbox" name="friendList" value="19969767" /></td>
               <td class="friend-name">
                L-G@NI
               </td>
               <td class="friend-login" title="23/02/08 00:42">2 months ago</td>
               <td class="friend-remove"><div id="remove-friend-button-19969767" class="friendmanagement-small-icons friendmanagement-remove remove-friend"></div></td>
           </tr>
           <tr class="even">
               <td><input type="checkbox" name="friendList" value="20572923" /></td>
               <td class="friend-name">
                LukeYoung1993
               </td>
               <td class="friend-login" title="06/05/08 19:43">11 hours ago</td>
               <td class="friend-remove"><div id="remove-friend-button-20572923" class="friendmanagement-small-icons friendmanagement-remove remove-friend"></div></td>
           </tr>
           <tr class="odd">
               <td><input type="checkbox" name="friendList" value="21091541" /></td>
               <td class="friend-name">
                michael1461
               </td>
               <td class="friend-login" title="22/01/08 18:36">3 months ago</td>
               <td class="friend-remove"><div id="remove-friend-button-21091541" class="friendmanagement-small-icons friendmanagement-remove remove-friend"></div></td>
           </tr>
           <tr class="even">
               <td><input type="checkbox" name="friendList" value="21105912" /></td>
               <td class="friend-name">
                muiscmad!
               </td>
               <td class="friend-login" title="28/03/08 11:21">1 month ago</td>
               <td class="friend-remove"><div id="remove-friend-button-21105912" class="friendmanagement-small-icons friendmanagement-remove remove-friend"></div></td>
           </tr>
           <tr class="odd">
               <td><input type="checkbox" name="friendList" value="14653691" /></td>
               <td class="friend-name">
                oscmay
               </td>
               <td class="friend-login" title="06/05/08 19:13">12 hours ago</td>
               <td class="friend-remove"><div id="remove-friend-button-14653691" class="friendmanagement-small-icons friendmanagement-remove remove-friend"></div></td>
           </tr>
           <tr class="even">
               <td><input type="checkbox" name="friendList" value="21255860" /></td>
               <td class="friend-name">
                PAT-Hairy
               </td>
               <td class="friend-login" title="17/02/08 10:33">2 months ago</td>
               <td class="friend-remove"><div id="remove-friend-button-21255860" class="friendmanagement-small-icons friendmanagement-remove remove-friend"></div></td>
           </tr>
           <tr class="odd">
               <td><input type="checkbox" name="friendList" value="13810994" /></td>
               <td class="friend-name">
                Punkeh111
               </td>
               <td class="friend-login" title="04/05/08 12:57">2 days ago</td>
               <td class="friend-remove"><div id="remove-friend-button-13810994" class="friendmanagement-small-icons friendmanagement-remove remove-friend"></div></td>
           </tr>
           <tr class="even">
               <td><input type="checkbox" name="friendList" value="21064305" /></td>
               <td class="friend-name">
                rogger263
               </td>
               <td class="friend-login" title="31/03/08 21:19">1 month ago</td>
               <td class="friend-remove"><div id="remove-friend-button-21064305" class="friendmanagement-small-icons friendmanagement-remove remove-friend"></div></td>
           </tr>
           <tr class="odd">
               <td><input type="checkbox" name="friendList" value="15691750" /></td>
               <td class="friend-name">
                saen16
               </td>
               <td class="friend-login" title="20/03/08 21:15">1 month ago</td>
               <td class="friend-remove"><div id="remove-friend-button-15691750" class="friendmanagement-small-icons friendmanagement-remove remove-friend"></div></td>
           </tr>
           <tr class="even">
               <td><input type="checkbox" name="friendList" value="21019326" /></td>
               <td class="friend-name">
                shally112
               </td>
               <td class="friend-login" title="06/05/08 20:32">10 hours ago</td>
               <td class="friend-remove"><div id="remove-friend-button-21019326" class="friendmanagement-small-icons friendmanagement-remove remove-friend"></div></td>
           </tr>
           <tr class="odd">
               <td><input type="checkbox" name="friendList" value="21043557" /></td>
               <td class="friend-name">
                SonnyGirl-x
               </td>
               <td class="friend-login" title="20/01/08 16:46">3 months ago</td>
               <td class="friend-remove"><div id="remove-friend-button-21043557" class="friendmanagement-small-icons friendmanagement-remove remove-friend"></div></td>
           </tr>
           <tr class="even">
               <td><input type="checkbox" name="friendList" value="20249764" /></td>
               <td class="friend-name">
                x-stockie-x
               </td>
               <td class="friend-login" title="23/04/08 07:20">2 weeks ago</td>
               <td class="friend-remove"><div id="remove-friend-button-20249764" class="friendmanagement-small-icons friendmanagement-remove remove-friend"></div></td>
           </tr>
           <tr class="odd">
               <td><input type="checkbox" name="friendList" value="7692780" /></td>
               <td class="friend-name">
                x-x-kylie-x-x
               </td>
               <td class="friend-login" title="01/05/08 20:32">5 days ago</td>
               <td class="friend-remove"><div id="remove-friend-button-7692780" class="friendmanagement-small-icons friendmanagement-remove remove-friend"></div></td>
           </tr>
           <tr class="even">
               <td><input type="checkbox" name="friendList" value="15993314" /></td>
               <td class="friend-name">
                x.x-Leah-x.x
               </td>
               <td class="friend-login" title="02/04/08 21:36">1 month ago</td>
               <td class="friend-remove"><div id="remove-friend-button-15993314" class="friendmanagement-small-icons friendmanagement-remove remove-friend"></div></td>
           </tr>
           <tr class="odd">
               <td><input type="checkbox" name="friendList" value="20924493" /></td>
               <td class="friend-name">
                xoREDDI
               </td>
               <td class="friend-login" title="29/01/08 19:18">3 months ago</td>
               <td class="friend-remove"><div id="remove-friend-button-20924493" class="friendmanagement-small-icons friendmanagement-remove remove-friend"></div></td>
           </tr>
           <tr class="even">
               <td><input type="checkbox" name="friendList" value="20980236" /></td>
               <td class="friend-name">
                xxjadexx1008
               </td>
               <td class="friend-login" title="11/02/08 17:20">2 months ago</td>
               <td class="friend-remove"><div id="remove-friend-button-20980236" class="friendmanagement-small-icons friendmanagement-remove remove-friend"></div></td>
           </tr>
        </tbody>
    </table>
    <a class="select-all" id="friends-select-all" href="#">Select all</a> |
    <a class="deselect-all" href=#" id="friends-deselect-all">Deselect all</a>
</form>                        </div>
                        <div id="category-options" class="clearfix">
<select id="category-list-select" name="category-list">
    <option value="0">Friends</option>
</select>
<div class="friend-del"><a class="new-button red-button cancel-icon" href="#" id="delete-friends"><b><span></span>Delete selected friends</b><i></i></a></div>
<div class="friend-move"><a class="new-button" href="#" id="move-friend-button"><b><span></span>Move</b><i></i></a></div>                        </div>
                    </div>
                </div>
            </div>
        </div>

    <script type="text/javascript">

        L10N.put("friendmanagement.tooltip.deletefriends", "Are you sure you want to delete these selected friends?\n<div class=\"friendmanagement-small-icons friendmanagement-save friendmanagement-tip-delete\"\>\n    <a class=\"friends-delete-button\" id=\"delete-friends-button\"\>Delete</a\>\n</div\>\n<div class=\"friendmanagement-small-icons friendmanagement-remove friendmanagement-tip-cancel\"\>\n    <a id=\"cancel-delete-friends\"\>Cancel</a\>\n</div\>\n\n");
        L10N.put("friendmanagement.tooltip.deletefriend", "Are you sure you want to delete this friend?\n<div class=\"friendmanagement-small-icons friendmanagement-save friendmanagement-tip-delete\"\>\n    <a id=\"delete-friend-%friend_id%\"\>Delete</a\>\n</div\>\n<div class=\"friendmanagement-small-icons friendmanagement-remove friendmanagement-tip-cancel\"\>\n    <a id=\"remove-friend-can-%friend_id%\"\>Cancel</a\>\n</div\>");
        L10N.put("friendmanagement.tooltip.deletecategory", "Are you sure you want to delete this category?\n<div class=\"friendmanagement-small-icons friendmanagement-save friendmanagement-tip-delete\"\>\n    <a class=\"delete-category-button\" id=\"delete-category-%category_id%\"\>Delete</a\>\n</div\>\n<div class=\"friendmanagement-small-icons friendmanagement-remove friendmanagement-tip-cancel\"\>\n    <a id=\"cancel-cat-delete-%category_id%\"\>Cancel</a\>\n</div\>");
        new FriendManagement({ currentCategoryId: 0, pageListLimit: 30, pageNumber: 1});
    </script>        

    </div>
    </div>
<?php } else { ?>
<b>Tab appears to be valid, but no tab data found. Please report this issue.</b>
<?php } ?>

<?php

include('templates/community/footer.php');

?>