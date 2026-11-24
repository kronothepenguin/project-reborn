<?php
/*---------------------------------------------------+
| HoloCMS - Website and Content Management System
+----------------------------------------------------+
| Copyright © 2008 Meth0d
+----------------------------------------------------+
| HoloCMS is provided "as is" and comes without
| warrenty of any kind. 
+---------------------------------------------------*/

if (!defined("IN_HOLOCMS")) { header("Location: ../index.php"); exit; }

function SendMUSData($data){
echo $data;

$configsql = mysql_query("SELECT * FROM cms_system LIMIT 1");
$config = mysql_fetch_assoc($configsql);

$mus_ip = $config['ip'];
$mus_port = FetchServerSetting('mus_port');

$sock = fsockopen($mus_ip, $mus_port, $errnum, $errstr, $timeout);

	if(!is_resource($sock)){
	return false;
	} else {
	fputs($sock, $data);
	}

fclose($sock);
}

?>