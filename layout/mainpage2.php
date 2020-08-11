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
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="<?php echo $this->language; ?>" lang="<?php echo $this->language; ?>" dir="<?php echo $this->direction; ?>" >
<head>
<jdoc:include type="head" />

<link rel="stylesheet" href="templates/system/css/general.css" type="text/css" />
<link rel="stylesheet" href="templates/javanya/css/template.css" type="text/css" />
<link rel="stylesheet" href="templates/<?php echo $this->template ?>/css/<?php echo $this->params->get('templateVariation'); ?>.css" type="text/css" />
<link rel="stylesheet" href="templates/<?php echo $this->template ?>/css/<?php echo $this->params->get('columnStyle'); ?>_style.css" type="text/css" />
<link rel="stylesheet" href="templates/<?php echo $this->template ?>/css/<?php echo $this->params->get('leadingBackground'); ?>_bg.css" type="text/css" />
<link rel="stylesheet" href="templates/<?php echo $this->template ?>/css/<?php echo $this->params->get('borderStyle'); ?>_bs.css" type="text/css" />
<link rel="shortcut icon" href="templates/<?php echo $this->template?>/favicon.ico" />

<link rel="stylesheet" type="text/css" href="rs/css/common.css" media="screen, projection" />
<link rel="stylesheet" type="text/css" href="rs/css/smallslider.css" media="screen, projection" />
<link rel="stylesheet" type="text/css" href="rs/css/lab.css" media="screen, projection" />
<script type="text/javascript" src="rs/js/jquery-1.4.2.min.js"></script>
<script type="text/javascript" src="rs/js/jquery.smallslider.js"></script>
<script type="text/javascript">
    $(document).ready(function(){ 
 		$('#flashbox').smallslider({onImageStop:false, switchEffect:'fadeOut',switchEase: 'aseOutQuad", ',switchPath: 'left', switchMode: 'hover', showText:false, showButtons:false});
    });
</script>
<?php 
if($this->countModules('left and right') == 0) $contentwidth = "full";
if($this->countModules('left or right') == 1) $contentwidth = "half";
if($this->countModules('left and right') == 1) $contentwidth = "narrow";
?>
</head>

<body>

<!--
<div id="jv-wrap-top">
	<div id="jv-top"></div>
</div>
-->

<div id="jv-wrap-mid">
	<div id="jv-mid">
	<!-- start header -->
		<div id="jv-header">
		<div id="jv-banner"><jdoc:include type="modules" name="banner" /></div>
		     <div id="jv-gtop-function">
			  <table width="0" border="0" cellpadding="5">
                <tr>
				  <td align="right"><div id="jv-topnav"><jdoc:include type="modules" name="topnav" /></div></td>
			    </tr>
                 <tr>
				  <td align="right">
				  <div id="jv-search">
			   <div class="jv-searchbox"><jdoc:include type="modules" name="user4" /></div>
			 </div></td>
				 </tr>
			</table>
			</div>
			
			
		     
		</div>
	<!-- end header -->
	
	<!-- start gmenu -->
		<div class="jv-gmenu">
		  <div class="jv-topmenu"><jdoc:include type="modules" name="user5" /></div>
		</div>
    <!-- end gmenu -->
	<!-- start index_banner -->
		<div class="jv-main_banner"><jdoc:include type="modules" name="index_banner" /></div>
    <!-- end index_banner -->
	
	<!-- start path -->
		
		<div id="jv-path"><jdoc:include type="module" name="breadcrumbs" />	</div>
		<!--	<div id="jv-feed"><jdoc:include type="modules" name="syndicate" /> </div>
		</div><div class="clr">
		</div>
		-->
		<!-- end path -->
		
	
		
		<!-- start content -->		
		<div id="jv-main">
		<div id="jv-maininside">
		 	<?php if($this->countModules('left')) : ?>	
			<div id="jv-left">
				<jdoc:include type="modules" name="left" style="xhtml" />
			</div>
			<?php endif; ?>	
			
			<?php if($this->countModules('right')) : ?>	
			<div id="jv-right">
				<jdoc:include type="modules" name="right" style="xhtml" />
			</div>
			<?php endif; ?>
						
	
			<div id="jv-content<?php echo $contentwidth; ?>"> 
				<?php if ($this->getBuffer('message')) : ?>
				<div class="error">
					<h2>
						<?php echo JText::_('Message'); ?>
					</h2>
					<jdoc:include type="message" />
				</div>
				<?php endif; ?>
			<jdoc:include type="component" />
			</div>
		</div>
		</div> <!-- end main content -->	
	</div>
	<!-- end mid -->



<!-- start bottom-->
<div id="jv-wrap-bottom">
	<div id="jv-bottom">
	  <div class="jv-footermenu"><jdoc:include type="modules" name="footer" /></div>
	</div><!-- end bottom -->

<jdoc:include type="modules" name="debug" />
</body>
</html>
