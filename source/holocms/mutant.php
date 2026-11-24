<?php
/*-----------------------------------
  Created by Superfun
  Version 1.2
  
  Since holocms works on the real habbo flash, this script works up to R/V 33
  Any higher version may not work with it...
  
  Thanks to TomSpits for reminding of total naked habbo's.
  Thanks to NitroHabbz for reminding shoes are required too.
-----------------------------------*/

function check_male($settingsfigure){
	$array1 = array('180', '207', '205', '190', '185', '195', '200', '206', '208', '209');
	$array2 = array('1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30');
	$array3 = array('145', '125', '165', '676', '105', '155', '681', '115', '170', '679', '135', '110', '889', '891', '892', '893', '802', '828', '830', '831', '829', '678', '677');
	$array4 = array('31', '32', '33', '34', '35', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46', '47', '48', '49', '50', '51', '52', '53', '54', '55', '56', '57', '58', '59', '60', '61', '1316');
	$array5 = array('100');
	$array6 = array('1010', '1003', '1018', '1020', '1022', '1021', '1023', '1002', '1005', '1004', '1009', '1013', '1019', '1011', '1012');
	$array7 = array('62', '63', '64', '65', '66', '67', '68', '69', '70','72', '73', '74', '75', '76', '77', '78', '79', '80', '81', '82', '83', '84', '85', '86', '87', '88', '89', '90', '91', '92', '93', '94', '95', '96', '97', '98', '99', '100', '101', '102', '103', '104', '105', '106', '107', '108', '109', '110', '1315');
	$array8 = array('1006', '1017', '1007', '1014', '1001', '1008', '1015', '1016', '1024', '1025', '1026', '1027');
	$array9 = array('1606', '1605', '1602', '1603', '1609');
	$array10 = array('1601', '1607', '1604', '1608', '1610');
	$array11 = array('1404', '1401', '1403');
	$array12 = array('1402', '1405', '1406');
	$array13 = array('1202', '1208', '1206', '1204', '1205', '1209');
	$array14 = array('1201', '1203', '1207', '1210', '1211', '1212');
	$array15 = array('876', '210', '267', '245', '878', '220', '260', '255', '875', '262', '240', '250', '877', '215', '230', '266', '235', '265', '225', '807', '804', '803', '809', '808', '805', '806', '886', '887');
	$array16 = array('1803', '1806', '1805', '1801', '1804', '1815');
	$array17 = array('1810', '1809', '1802', '1808', '1811', '1807', '1812', '1813', '1814', '1816', '1817', '1818', '1819');
	$array18 = array('280', '285', '270', '281', '275');
	$array19 = array('300', '305', '295', '290', '905', '906', '908');
	$array20 = array('2009', '2004');
	$array21 = array('2012', '2007', '2006', '1011', '2008', '2002', '2001', '2003', '2005');

	$data1 = array('hr' => '0', 'hd' => '0', 'ch' => '0', 'lg' => '0', 'sh' => '0', 'ha' => '0', 'he' => '0', 'ea' => '0', 'fa' => '0', 'ca' => '0', 'wa' => '0');
	$data2 = array('hr' => '1', 'hd' => '1', 'ch' => '1', 'lg' => '1', 'sh' => '1', 'ha' => '1', 'he' => '1', 'ea' => '1', 'fa' => '1', 'ca' => '1', 'wa' => '1', 'else' => '1');
	
	$string = $settingsfigure;
	$string = explode('.', $string);

	foreach ($string as &$value) {
		$ding = explode('-', $value);
		if($ding[0] == 'hd'){
			if($data1['hd'] == "0"){
				if(in_array($ding[1], $array1)){
					if(in_array($ding[2], $array2)){
						$data2['hd'] = '1';
					}else{
						$data2['hd'] = '0';
					}
				}else{
					$data2['hd'] = '0';
				}
				$data1['hd'] = '1';
			}else{
				$data2['hd'] = '0';
			}
		}elseif($ding[0] == 'hr'){
			if($data1['hr'] == "0"){
				if(in_array($ding[1], $array3)){
					if(in_array($ding[2], $array4)){
						$data2['hr'] = '1';
					}else{
						$data2['hr'] = '0';
					}
				}else{
					if(in_array($ding[1], $array5)){
						$data2['hr'] = '1';
					}else{
						$data2['hr'] = '0';
					}
				}
				$data1['hr'] = '1';
			}else{
				$data2['hr'] = '0';
			}
		}elseif($ding[0] == 'ha'){
			if($data1['ha'] == "0"){
				if(in_array($ding[1], $array6)){
					if(in_array($ding[2], $array7)){
						$data2['ha'] = '1';
					}else{
						$data2['ha'] = '0';
					}
				}else{
					if(in_array($ding[1], $array8)){
						$data2['ha'] = '1';
					}else{
						$data2['ha'] = '0';
					}
				}
				$data1['ha'] = '1';
			}else{
				$data2['ha'] = '0';
			}
		}elseif($ding[0] == 'he'){
			if($data1['he'] == "0"){
				if(in_array($ding[1], $array9)){
					if(in_array($ding[2], $array7)){
						$data2['he'] = '1';
					}else{
						$data2['he'] = '0';
					}
				}else{
					if(in_array($ding[1], $array10)){
						$data2['he'] = '1';
					}else{
						$data2['he'] = '0';
					}
				}
				$data1['he'] = '1';
			}else{
				$data2['he'] = '0';
			}
		}elseif($ding[0] == 'ea'){
			if($data1['ea'] == "0"){
				if(in_array($ding[1], $array11)){
					if(in_array($ding[2], $array7)){
						$data2['ea'] = '1';
					}else{
						$data2['ea'] = '0';
					}
				}else{
					if(in_array($ding[1], $array12)){
						$data2['ea'] = '1';
					}else{
						$data2['ea'] = '0';
					}
				}
				$data1['ea'] = '1';
			}else{
				$data2['ea'] = '0';
			}
		}elseif($ding[0] == 'fa'){
			if($data1['fa'] == "0"){
				if(in_array($ding[1], $array13)){
					if(in_array($ding[2], $array7)){
						$data2['fa'] = '1';
					}else{
						$data2['fa'] = '0';
					}
				}else{
					if(in_array($ding[1], $array14)){
						$data2['fa'] = '1';
					}else{
						$data2['fa'] = '0';
					}
				}
				$data1['fa'] = '1';
			}else{
				$data2['fa'] = '0';
			}
		}elseif($ding[0] == 'ch'){
			if($data1['ch'] == "0"){
				if(in_array($ding[1], $array15)){
					if(in_array($ding[2], $array7)){
						$data2['ch'] = '1';
					}else{
						$data2['ch'] = '0';
					}
				}else{
					$data2['ch'] = '0';
				}
				$data1['ch'] = '1';
			}else{
				$data2['ch'] = '0';
			}
		}elseif($ding[0] == 'ca'){
			if($data1['ca'] == "0"){
				if(in_array($ding[1], $array16)){
					if(in_array($ding[2], $array7)){
						$data2['ca'] = '1';
					}else{
						$data2['ca'] = '0';
					}
				}else{
					if(in_array($ding[1], $array17)){
						$data2['ca'] = '1';
					}else{
						$data2['ca'] = '0';
					}
				}
				$data1['ca'] = '1';
			}else{
				$data2['ca'] = '0';
			}
		}elseif($ding[0] == 'lg'){
			if($data1['lg'] == "0"){
				if(in_array($ding[1], $array18)){
					if(in_array($ding[2], $array7)){
						$data2['lg'] = '1';
					}else{
						$data2['lg'] = '0';
					}
				}else{
					$data2['lg'] = '0';
				}
				$data1['lg'] = '1';
			}else{
				$data2['lg'] = '0';
			}	
		}elseif($ding[0] == 'sh'){
			if($data1['sh'] == "0"){
				if(in_array($ding[1], $array19)){
					if(in_array($ding[2], $array7)){
						$data2['sh'] = '1';
					}else{
						$data2['sh'] = '0';
					}
				}else{
					$data2['sh'] = '0';
				}
				$data1['sh'] = '1';
			}else{
				$data2['sh'] = '0';
			}
		}elseif($ding[0] == 'wa'){
			if($data1['wa'] == "0"){
				if(in_array($ding[1], $array20)){
					if(in_array($ding[2], $array7)){
						$data2['wa'] = '1';
					}else{
						$data2['wa'] = '0';
					}
				}else{
					if(in_array($ding[1], $array21)){
						$data2['wa'] = '1';
					}else{
						$data2['wa'] = '0';
					}
				}
				$data1['wa'] = '1';
			}else{
				$data2['wa'] = '0';
			}
		}else{
			$data['else'] = '1';
		}
		
	}
	//$wrong = 'hr-100-.hd-180-1.ch-210-66.lg-285-77.sh-300-91';
	
	if(in_array('0', $data2)){
		return false;//$wrong;
	}else{
		if($data1['ch'] == '1' AND $data1['hd'] == '1' AND $data1['lg'] == '1' AND $data1['sh']){
			return true;
		}else{
			return false;
		}
	}
}

function check_female($settingsfigure){
	$array1 = array('620', '626', '625', '610', '600', '615', '627', '605', '628', '629');
	$array2 = array('1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30');
	$array3 = array('550', '676', '1002', '500', '555', '681', '510', '505', '540', '530', '515', '679', '575', '520', '545', '890', '891', '892', '893', '840', '837', '834', '836', '811', '833', '838', '835', '678', '832', '839', '677');
	$array4 = array('31', '32', '33', '34', '35', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46', '47', '48', '49', '50', '51', '52', '53', '54', '55', '56', '57', '58', '59', '60', '61', '1316');
	$array6 = array('1010', '1003', '1022', '1021', '1023', '1002', '1005', '1004', '1009', '1013', '1011', '1012');
	$array7 = array('62', '63', '64', '65', '66', '67', '68', '69', '70','72', '73', '74', '75', '76', '77', '78', '79', '80', '81', '82', '83', '84', '85', '86', '87', '88', '89', '90', '91', '92', '93', '94', '95', '96', '97', '98', '99', '100', '101', '102', '103', '104', '105', '106', '107', '108', '109', '110', '1315');
	$array8 = array('1018', '1020', '1006', '1017', '1007', '1014', '1001', '1008', '1015', '1019', '1016', '1024', '1025', '1026', '1027');
	$array9 = array('1606', '1605', '1602', '1603', '1609');
	$array10 = array('1601', '1607', '1604', '1608', '1610');
	$array11 = array('1404', '1401', '1403');
	$array12 = array('1402', '1405', '1406');
	$array13 = array('1202', '1208', '1206', '1205', '1209');
	$array14 = array('1204', '1201', '1203', '1207', '1210', '1211', '1212');
	$array15 = array('680', '675', '690', '679', '665', '685', '670', '645', '640', '655', '882', '881', '880', '669', '691', '660', '650', '635', '630', '816', '813', '812', '815', '823', '818', '814', '819', '824', '825', '822', '821', '826', '820', '817', '883', '884', '888', '887', '885');

	$array22 = array('667');
	
	$array16 = array('1803', '1806', '1805', '1801', '1804', '1815');
	$array17 = array('1810', '1809', '1802', '1808', '1811', '1807', '1812', '1813', '1814', '1816', '1817', '1818', '1819');
	$array18 = array('715', '696', '710', '720', '700', '705', '695', '827', '716');
	$array19 = array('740', '735', '730', '725', '905', '906', '907');
	$array20 = array('2009', '2004');
	$array21 = array('2012', '2007', '2006', '2011', '2008', '2002', '2001', '2003', '2010', '2005');

	$data1 = array('hr' => '0', 'hd' => '0', 'ch' => '0', 'lg' => '0', 'sh' => '0', 'ha' => '0', 'he' => '0', 'ea' => '0', 'fa' => '0', 'ca' => '0', 'wa' => '0');
	$data2 = array('hr' => '1', 'hd' => '1', 'ch' => '1', 'lg' => '1', 'sh' => '1', 'ha' => '1', 'he' => '1', 'ea' => '1', 'fa' => '1', 'ca' => '1', 'wa' => '1', 'else' => '1');
	
	$string = $settingsfigure;
	$string = explode('.', $string);

	foreach ($string as &$value) {
		$ding = explode('-', $value);
		if($ding[0] == 'hd'){
			if($data1['hd'] == "0"){
				if(in_array($ding[1], $array1)){
					if(in_array($ding[2], $array2)){
						$data2['hd'] = '1';
					}else{
						$data2['hd'] = '0';
					}
				}else{
					$data2['hd'] = '0';
				}
				$data1['hd'] = '1';
			}else{
				$data2['hd'] = '0';
			}
		}elseif($ding[0] == 'hr'){
			if($data1['hr'] == "0"){
				if(in_array($ding[1], $array3)){
					if(in_array($ding[2], $array4)){
						$data2['hr'] = '1';
					}else{
						$data2['hr'] = '0';
					}
				}else{
					$data2['hr'] = '0';
				}
				$data1['hr'] = '1';
			}else{
				$data2['hr'] = '0';
			}
		}elseif($ding[0] == 'ha'){
			if($data1['ha'] == "0"){
				if(in_array($ding[1], $array6)){
					if(in_array($ding[2], $array7)){
						$data2['ha'] = '1';
					}else{
						$data2['ha'] = '0';
					}
				}else{
					if(in_array($ding[1], $array8)){
						$data2['ha'] = '1';
					}else{
						$data2['ha'] = '0';
					}
				}
				$data1['ha'] = '1';
			}else{
				$data2['ha'] = '0';
			}
		}elseif($ding[0] == 'he'){
			if($data1['he'] == "0"){
				if(in_array($ding[1], $array9)){
					if(in_array($ding[2], $array7)){
						$data2['he'] = '1';
					}else{
						$data2['he'] = '0';
					}
				}else{
					if(in_array($ding[1], $array10)){
						$data2['he'] = '1';
					}else{
						$data2['he'] = '0';
					}
				}
				$data1['he'] = '1';
			}else{
				$data2['he'] = '0';
			}
		}elseif($ding[0] == 'ea'){
			if($data1['ea'] == "0"){
				if(in_array($ding[1], $array11)){
					if(in_array($ding[2], $array7)){
						$data2['ea'] = '1';
					}else{
						$data2['ea'] = '0';
					}
				}else{
					if(in_array($ding[1], $array12)){
						$data2['ea'] = '1';
					}else{
						$data2['ea'] = '0';
					}
				}
				$data1['ea'] = '1';
			}else{
				$data2['ea'] = '0';
			}
		}elseif($ding[0] == 'fa'){
			if($data1['fa'] == "0"){
				if(in_array($ding[1], $array13)){
					if(in_array($ding[2], $array7)){
						$data2['fa'] = '1';
					}else{
						$data2['fa'] = '0';
					}
				}else{
					if(in_array($ding[1], $array14)){
						$data2['fa'] = '1';
					}else{
						$data2['fa'] = '0';
					}
				}
				$data1['fa'] = '1';
			}else{
				$data2['fa'] = '0';
			}
		}elseif($ding[0] == 'ch'){
			if($data1['ch'] == "0"){
				if(in_array($ding[1], $array15)){
					if(in_array($ding[2], $array7)){
						$data2['ch'] = '1';
					}else{
						$data2['ch'] = '0';
					}
				}else{
					if(in_array($ding[1], $array22)){
						$data2['ch'] = '1';
					}else{
						$data2['ch'] = '0';
					}
				}
				$data1['ch'] = '1';
			}else{
				$data2['ch'] = '0';
			}
		}elseif($ding[0] == 'ca'){
			if($data1['ca'] == "0"){
				if(in_array($ding[1], $array16)){
					if(in_array($ding[2], $array7)){
						$data2['ca'] = '1';
					}else{
						$data2['ca'] = '0';
					}
				}else{
					if(in_array($ding[1], $array17)){
						$data2['ca'] = '1';
					}else{
						$data2['ca'] = '0';
					}
				}
				$data1['ca'] = '1';
			}else{
				$data2['ca'] = '0';
			}
		}elseif($ding[0] == 'lg'){
			if($data1['lg'] == "0"){
				if(in_array($ding[1], $array18)){
					if(in_array($ding[2], $array7)){
						$data2['lg'] = '1';
					}else{
						$data2['lg'] = '0';
					}
				}else{
					$data2['lg'] = '0';
				}
				$data1['lg'] = '1';
			}else{
				$data2['lg'] = '0';
			}	
		}elseif($ding[0] == 'sh'){
			if($data1['sh'] == "0"){
				if(in_array($ding[1], $array19)){
					if(in_array($ding[2], $array7)){
						$data2['sh'] = '1';
					}else{
						$data2['sh'] = '0';
					}
				}else{
					$data2['sh'] = '0';
				}
				$data1['sh'] = '1';
			}else{
				$data2['sh'] = '0';
			}
		}elseif($ding[0] == 'wa'){
			if($data1['wa'] == "0"){
				if(in_array($ding[1], $array20)){
					if(in_array($ding[2], $array7)){
						$data2['wa'] = '1';
					}else{
						$data2['wa'] = '0';
					}
				}else{
					if(in_array($ding[1], $array21)){
						$data2['wa'] = '1';
					}else{
						$data2['wa'] = '0';
					}
				}
				$data1['wa'] = '1';
			}else{
				$data2['wa'] = '0';
			}
		}else{
			$data['else'] = '1';
		}
		
	}
	//$wrong = 'hr-500-42.hd-600-1.ch-680-73.lg-695-77.sh-735-66';
	
	if(in_array('0', $data2)){
		return false;
	}else{
		if($data1['ch'] == '1' AND $data1['hd'] == '1' AND $data1['lg'] == '1' AND $data1['sh']){
			return true;
		}else{
			return false;
		}
	}
}

function checkmutant($settingsfigure, $gender){
	if($gender == 'M'){
		return check_male($settingsfigure);
	}elseif($gender == 'F'){
		return check_female($settingsfigure);
	}
}
?>