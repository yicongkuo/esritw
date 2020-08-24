<?php
/**
 * @copyright	Copyright (C) 2005 - 2007 Open Source Matters. All rights reserved.
 * @license		GNU/GPL, see LICENSE.php
 * Joomla! is free software. This version may have been modified pursuant
 * to the GNU General Public License, and as distributed it includes or
 * is derivative of works licensed under the GNU General Public License or
 * other free or open source software licenses.
 * See COPYRIGHT.php for copyright notices and details.
 */

// no direct access
defined( '_JEXEC' ) or die( 'Restricted access' );
?>
<!DOCTYPE html>
<html xml:lang="<?php echo $this->language; ?>" lang="<?php echo $this->language; ?>" dir="<?php echo $this->direction; ?>" >
<head>
	<jdoc:include type="head" />

    <!-- device dectect -->
    <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">

	<!-- vendor lib -->
	<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/semantic-ui/2.4.1/semantic.min.css">
	<script
	  src="https://code.jquery.com/jquery-3.5.1.min.js"
	  integrity="sha256-9/aliU8dGd2tb6OSsuzixeV4y/faTqgFtohetphbbj0="
	  crossorigin="anonymous"></script>
	<script src="https://cdnjs.cloudflare.com/ajax/libs/semantic-ui/2.4.1/semantic.min.js"></script>

	<!-- custom style -->
	<link rel="stylesheet" href="templates/<?php echo $this->template ?>/css/template.css" type="text/css" />
	
	<!-- custom script -->
	<script>
        $(document).ready(function(){ 
            // 側欄初始化
            $('.ui.sidebar').sidebar('attach events', '.toc.item');
        });
	</script>
</head>

<body>
	<!-- 大螢幕主選單 -->
	<jdoc:include type="modules" name="top" />
	
	<!-- 小螢幕側欄選單 -->
	<jdoc:include type="modules" name="left" />
	
	<div class="pusher">
		<!-- 小螢幕主選單 -->
		<jdoc:include type="modules" name="user1" />

		<!-- 大螢幕二層選單 -->
		<jdoc:include type="modules" name="user2" />
	
		<!-- 小螢幕二層選單 -->
		<jdoc:include type="modules" name="user3" />
	
		
		<!-- 頁面內容-->
		<jdoc:include type="component" />

		<!-- 頁尾-->
		<jdoc:include type="modules" name="syndicate" />
	</div>
</body>
</html>