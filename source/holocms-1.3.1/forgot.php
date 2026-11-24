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

session_start();

if(!session_is_registered(username)){

include("locale/".$language."/login.php");

include('templates/login/subheader.php');
include('templates/login/header.php');

if(isset($_POST['actionForgot'])){
    $forgot_name = addslashes($_POST['forgottenpw-username']);
    $forgot_mail = addslashes($_POST['forgottenpw-email']);
    $sql_forgot = mysql_query("SELECT password FROM users WHERE name = '".$forgot_name."' and email = '".$forgot_mail ."'") or die(mysql_error());
    $sql_num = mysql_num_rows($sql_forgot);
    if($sql_num > 0){
        $result = $locale['forgot_mail_send'];
        $sql_row = mysql_fetch_assoc($sql_forgot);
        $teh_pass = $sql_row['password'];

	$subject = $shortname . " - Forgot password";
	$message = "Hello " . stripslashes($forgot_name) . ",\nThis is a password reminder you or someone else requested. If you did not request a password reminder, don't worry, just delete and ignore this e-mail, as no changes will be made that may affect you.\n\nUsername: ".$forgot_name."\nPassword: ".$teh_pass."\n\nWe hope to see you soon!";
	$headers = 'From: ' . $shortname . ' Mailer <no-reply@sulake.com>' . "\r\n" .
 	   'Reply-To: webmaster@example.com' . "\r\n" .
 	   'X-Mailer: PHP/' . phpversion();

	mail($forgot_mail, $subject, $message, $headers);
    } else {
	$result = $locale['forgot_error_invalid'];
    }
}

// Special CSS formatting is required here to properly display the page.
?>
<style type="text/css">
		div.left-column { float: left; width: 50% }
		div.right-column { float: right; width: 49% }
		label { display: block }
		input { width: 98% }
		input.process-button { width: auto; float: right }
	</style>

			<div id="process-content">
	        	<div class="left-column">

<?php if(!empty($result)){ ?>
<div class="cbb clearfix white">
    <div class="box-content">

        <p><?php echo "<div align='center'><b>".$result."</b></div>"; ?></p>

    </div>
</div>
<?php } ?>

<div class="cbb clearfix">
    <h2 class="title"><?php echo $locale['forgot_pass']; ?></h2>
    <div class="box-content">

        <p><?php echo $locale['forgot_pass_content']; ?></p>

        <div class="clear"></div>

        <form method="post" action="forgot.php" id="forgottenpw-form">
            <p>
            <label for="forgottenpw-username"><?php echo $locale['forgot_username']; ?></label>
            <input type="text" name="forgottenpw-username" id="forgottenpw-username" value="<?php echo $_POST['forgottenpw-username']; ?>" />
            </p>

            <p>
            <label for="forgottenpw-email"><?php echo $locale['forgot_email']; ?></label>
            <input type="text" name="forgottenpw-email" id="forgottenpw-email" value="<?php echo $_POST['forgottenpw-email']; ?>" />
            </p>

            <p>
            <input type="submit" value="<?php echo $locale['forgot_button']; ?>" name="actionForgot" class="submit process-button" id="forgottenpw-submit" />
            </p>
            <input type="hidden" value="default" name="origin" />
        </form>
    </div>
</div>

</div>


<div class="right-column">

<div class="cbb clearfix">
    <h2 class="title"><?php echo $locale['forgot_false_alarm']; ?></h2>
    <div class="box-content">
        <p><?php echo $locale['forgot_false_alarm_content']; ?></p>
        <p><a href="index.php"><?php echo $locale['forgot_back']; ?> &raquo;</a></p>
    </div>
</div>

</div>

<?php

} else {

include('templates/login/subheader.php');
include('templates/login/header.php');

?>

<div id="process-content">
	        	<div class="action-error flash-message">
	<div class="rounded">
		<strong>Please <a href='logout.php'>log out</a> to use this feature.</strong>
	</div>
</div>

<div style="text-align: center">
	
	<div style="width:100px; margin: 10px auto"><a href="index.php" id="logout-ok" class="new-button fill"><b>Back</b><i></i></a></div>

<div id="column1" class="column">              
</div>
<div id="column2" class="column">
</div>

</div>

<?php

}

include('templates/login/footer.php');

?>
