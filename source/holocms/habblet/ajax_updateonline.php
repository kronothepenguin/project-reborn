<?php

@include("config.php");
@include("../config.php");

mysql_connect($sqlhostname, $sqlusername, $sqlpassword)or die("<br><font size='2' face='Tahoma'><b>HoloCMS Configuration Error:</b><br>I was unable to connect to the provided MySQL server. Please review the error message above for details.</font>");
mysql_select_db($sqldb)or die("<br><font size='2' face='Tahoma'><b>HoloCMS Configuration Error:</b><br>Unable to select the database you provided. Either I do not have premission to connect to that database, or the database doesn't exist.</font>");

$online = 0;
$rooms = 0;
$message = "{online} online in {rooms} rooms";

$sql = mysql_query("SELECT * FROM system LIMIT 1");
$row = mysql_fetch_assoc($sql);
$online = $row['onlinecount'];
$rooms = $row['activerooms'];

$message = str_replace("{online}", $online, $message);
$message = str_replace("{rooms}", $rooms, $message);

echo $message;
?>