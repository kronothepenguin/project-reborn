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

$allow_guests = true;

include('core.php');
include('includes/session.php');

$pagename = "Credits";
$pageid = "6";
$body_id = "home";

include('templates/community/subheader.php');
include('templates/community/header.php');

$get_cc = mysql_query("SELECT * FROM users WHERE credits IS NOT NULL AND rank < 5 ORDER BY credits DESC LIMIT 10") or die(mysql_error());

?>

<div id='container'>
<div id='content'>
<div id='column1' class='column'><div class='habblet-container '>        
<div class='cbb clearfix green '>
    
<h2 class='title'><?php echo HoloText(getContent('credits2-heading'), true); ?></h2>
<p class='credits-countries-select'><br /><?php echo HoloText(getContent('credits2'), true); ?><br /><br /></p>
</div>
</div>

<div class='habblet-container '>        
<div class='cbb clearfix blue '>
    
<h2 class='title'>Refer Options</h2>
<p class='credits-countries-select'><br /><b>1. Send your friends a link</b><br />This option is probably as easy as it gets; it basically does step 2, but automatically! You just send your friends an invite with the link shown below, your friends click the link, and if they complete registration, you get free credits! This is your referral link to get some easy credits:<br /><br />
        <input type="text" size="60%" README value="<?php if(!empty($path)){ echo $path; } ?>register.php?referral=<?php echo $my_id; ?>"><br /><br />
        <b>2. Let them fill in your name during registration</b><br />During the registration process, users can manually give the username of the person that referred them to the site. If they complete registration, that person gets credits! And that person could be you, if you have some friends that are nice enough to fill in your username.</p>
</div>
 </div>

                <script type='text/javascript'>if (!$(document.body).hasClassName('process-template')) { Rounder.init(); }</script>
             
</div>
<div id="column2" class="column">
                <div class="habblet-container ">        
                        <div class="cbb clearfix brown ">
    
                            <h2 class="title">Your purse
                            </h2>
                        <div id="purse-habblet">
                                                    <?php if($logged_in){ ?>
    <form method="post" action="credits.php" id="voucher-form">
<ul>
    <li class="even icon-purse">
        <div>You currently have:</div>
        <span class="purse-balance-amount"><?php echo $myrow['credits']; ?> Credits</span>
        <div class="purse-tx"><a href="transactions.php">Account transactions</a></div>
    </li>

    <li class="odd">
        <div class="box-content">
            <div>Enter redemption code:</div>
            <input type="text" name="voucherCode" value="" id="purse-habblet-redeemcode-string" class="redeemcode" />
            <a href="#" id="purse-redeemcode-button" class="new-button purse-icon" style="float:left"><b><span></span>Submit</b><i></i></a>
        </div>
    </li>
</ul>
<div id="purse-redeem-result">
</div>    </form>
        <?php } else { ?>
        <div class="box-content">You need to be logged in to see the purse.</div>
        <?php } ?>
</div>

<script type="text/javascript">
    new PurseHabblet();
</script>
    
                        
                    </div>
                </div>
                <script type="text/javascript">if (!$(document.body).hasClassName('process-template')) { Rounder.init(); }</script>
             
                <div class="habblet-container ">        
    
                        
    
                        
                    
                </div>
                <script type="text/javascript">if (!$(document.body).hasClassName('process-template')) { Rounder.init(); }</script>             

                <div class='habblet-container '>        
                        <div class='cbb clearfix red '>
    
                            <h2 class='title'>Leaderboard</h2>
                        <div id='credits-promo' class='box-content credits-info'>
    <div class='credit-info-text clearfix'>
    
<div class='tableborder'> 
 <table cellpadding='4' cellspacing='0' width='100%'> 
 <tr> 
  <td class='tablesubheader' width='50%' align='center'><b>Username</b></td> 
  <td class='tablesubheader' width='50%' align='center'><b>Credits</b></td>   
 </tr> 

<?php

while($row = mysql_fetch_assoc($get_cc)){ 
    printf(" <tr> 
  <td class='tablerow1' align='center'><a href=\"user_profile.php?name=%s\">%s</a></td> 
  <td class='tablerow2' align='center'>%s</td>
</tr>", $row['name'], $row['name'], $row['credits']); 
} 
?> 

 </table>
</div>

</div>
    
                        
                    </div>
                </div></div>


                <script type='text/javascript'>if (!$(document.body).hasClassName('process-template')) { Rounder.init(); }</script>
             
                             
</div>

<script type="text/javascript">
HabboView.run();
</script>    
                </div>
                <script type="text/javascript">if (!$(document.body).hasClassName('process-template')) { Rounder.init(); }</script>
<?php

include('templates/community/footer.php');

?> 