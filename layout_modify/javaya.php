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
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="<?php echo $this->language; ?>" lang="<?php echo $this->language; ?>" dir="<?php echo $this->direction; ?>" >
<head>
	<jdoc:include type="head" />

	<link rel="stylesheet" href="templates/system/css/general.css" type="text/css" />
	<link rel="stylesheet" href="templates/<?php echo $this->template ?>/css/template.css" type="text/css" />
	<link rel="stylesheet" href="templates/<?php echo $this->template ?>/css/<?php echo $this->params->get('templateVariation'); ?>.css" type="text/css" />
	<link rel="shortcut icon" href="templates/<?php echo $this->template?>/favicon.ico" />

	<link rel="stylesheet" type="text/css" href="rs/css/common.css" media="screen, projection" />
	<link rel="stylesheet" type="text/css" href="rs/css/smallslider.css" media="screen, projection" />
	<link rel="stylesheet" type="text/css" href="rs/css/lab.css" media="screen, projection" />

	<!-- vendor lib -->
	<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/semantic-ui/2.4.1/semantic.min.css">
	<script
	  src="https://code.jquery.com/jquery-3.5.1.min.js"
	  integrity="sha256-9/aliU8dGd2tb6OSsuzixeV4y/faTqgFtohetphbbj0="
	  crossorigin="anonymous"></script>
	<script src="https://cdnjs.cloudflare.com/ajax/libs/semantic-ui/2.4.1/semantic.min.js"></script>
	
	<!-- smallslider.js -->
	<script type="text/javascript" src="rs/js/jquery.smallslider.js"></script>
	<script type="text/javascript">
	    $(document).ready(function(){ 
	 		$('#flashbox').smallslider({onImageStop:false, switchEffect:'fadeOut',switchEase: 'aseOutQuad", ',switchPath: 'left', switchMode: 'hover', showText:false, showButtons:false });
	    });
	</script>
</head>

<body>     

<div id="jv-wrap-mid">
	<div id="jv-mid">

		<!-- start header -->
		<div id="jv-header">
			<div id="jv-banner">
				<jdoc:include type="modules" name="banner" />
			</div>

			<div id="jv-gtop-function">
				<table width="0" border="0" cellpadding="5">
					<tr>
						<td align="right">
							<div id="jv-topnav">
								<jdoc:include type="modules" name="topnav" />
							</div>
						</td>
					</tr>
					
					<tr>
						<td align="right">
							<div id="jv-search">
								<div class="jv-searchbox">
									<jdoc:include type="modules" name="user4" />
								</div>
							</div>
						</td>
					</tr>
				</table>
			</div>		     
		</div>
		<!-- end header -->
	
		<!-- start gmenu -->
		<div class="jv-gmenu">
			<div class="jv-topmenu">
				<jdoc:include type="modules" name="user3" />
			</div>
		</div>
    	<!-- end gmenu -->
	
		<!-- start Live Message -->
		<script>
			var liveUrl = "https://services6.arcgis.com/ZQ3vYRJIbpufErto/arcgis/rest/services/%E7%9B%B4%E6%92%AD%E5%85%AC%E5%91%8A%E8%A8%8A%E6%81%AF/FeatureServer/0/1";

			$.get(liveUrl, {f: "json"}).then(function (response){
				var data = JSON.parse(response);
				
				// 直播資訊
				var liveInfo = {
					topic   : data.feature.attributes["主題"],
					speaker : data.feature.attributes["講者"],
					time    : data.feature.attributes["開始時間"],
					link    : data.feature.attributes["直播連結"],
					period  : data.feature.attributes["長度_分_"]
				};
				
				// JS時間
				// 1970 年 1 月 1 日 00:00:00 開始的毫秒整數（Integer）值
				var pre30min = liveInfo.time - 1800*1000; // 直播前30分鐘
				var endTime =  liveInfo.time + (liveInfo.period*60*1000);

				// 目前時間
				var now = Date.now();

				if ( (now >= pre30min) && (now <= endTime) ) {
					console.log("Hello")
					$("#liveWebinar").append( getliveMessage(liveInfo) );
				}
			});

			function getliveMessage (info) {
				var hour = new Date(info.time).getHours().toString();
				var min = new Date(info.time).getMinutes();
				    min = (min < 10)? ("0" + min): min.toString();
				
				return "<i class='youtube red icon'></i><a href='" + info.link + 
					"'>直播： 「" + info.topic + "」於 "+ hour + ":" + min + " 開始，歡迎踴躍參與</a>";
			}
		</script>

		<div id="liveWebinar" class="ui center aligned container"></div>
		<!-- end Live Message -->

		<!-- start index_banner -->
		<div class="banner" style="position: relative;">
			<jdoc:include type="modules" name="index_banner" />
		</div>
	    <!-- end index_banner -->

    	<!-- start news -->
		<style>
			.ui.cards .ui.image {
				overflow: hidden;
			}
			.ui.cards .ui.image img {
				transform: scale(1, 1);
				transition: all .5s ease-out;
			}
			.ui.cards .ui.image img:hover {
				transform: scale(1.1, 1.1);
			}
		</style>

		<script>
			var divs = [
				{ id: "#newsWall",   groupId: "fd77bb84eb19489b9caecdebcfe5c2a0" },
				{ id: "#courseWall", groupId: "fd77bb84eb19489b9caecdebcfe5c2a0" }
			];

			divs.forEach(function (div) {
				createWallItems(div.groupId, div.id);
			});

			function createWallItems (groupId, divId) {
				getGroupItems(groupId).then(function (response){
					var items = response.results;
					
					items.forEach(function (item){
						$(divId).append( creatCardElementHTML(item) );
					});
				});		
			}

			function getGroupItems (groupId, sortField, sortOrder, portalUrl) {
				// 檢查是否存在連線到私有雲
				portalUrl = !(portalUrl) ? "https://www.arcgis.com" : portalUrl;

				// 檢查參數是否存在
				sortField = !(sortField) ? "add" : sortField; // add, created ...
				sortOrder = !(sortOrder) ? "desc": sortOrder; // asc, desc
				
				// 取得服務端點網址
				var endpoint = portalUrl + "/sharing/rest/content/groups/" + groupId + "/search";

				return $.get(endpoint, {
					// 參數設定請參考 REST API - Group Search 文件
					// https://developers.arcgis.com/rest/users-groups-and-items/group-search.htm
					f: "json",
					num: 100,
					sortField: sortField,
					sortOrder: sortOrder
				}, null, "json");
			}

			function getThumbnailUrl (id, thumbnail) {
				return "https://www.arcgis.com/sharing/rest/content/items/" + 
					   id + "/info/" + thumbnail + "?w=400";
			}

			function creatCardElementHTML (item) {
				var snippet = !(item.description)? item.snippet : item.description;

				return "<div class='ui blue card column'><div class='ui image'><a href='" + 
						item.url + "' target='_blank'><img src='" + getThumbnailUrl(item.id, item.thumbnail) + 
						"' alt='' /></a></div><div class='content'><div class='header'><a href='" +
						item.url + "' target='_blank'>" + item.title + "</a></div><br><div class='descript'>" + 
						snippet + "</div></div><div class='extra content'>" + createTagsHTML(item.tags) + 
						"</div></div>";
			}

			function createTagsHTML (tags) {
				var result = "";

				tags.forEach(function (tag){
					result += "<a class='ui small label'>" + tag + "</a>";
				});
				return result;
			}
		</script>

		<div class="ui two column centered padded grid">
			<div class="column">
				<h3 class="ui blue horizontal divider header">最新消息</h3>	
			</div>
		</div>		

		<div id="newsWall" class="ui centered cards"></div>
		<!-- end news -->
	
		<br><br>

		<!-- start course -->
		<div class="ui two column centered padded grid">
			<div class="column">
				<h3 class="ui blue horizontal divider header">
					快速上手
				</h3>	
			</div>
		</div>		

		<div id="courseWall" class="ui centered cards"></div>
		<!-- end course -->
		
		<!-- start content -->		
		<?php if ($this->getBuffer('message')) : ?>
		<div class="error ui grid">
			<h2>
				<?php echo JText::_('Message'); ?>
			</h2>
			<jdoc:include type="message" />
		</div>
		<?php endif; ?>

		<jdoc:include type="component" />
	</div>
	<!-- end mid -->

	<!-- start bottom-->
	<div id="jv-wrap-bottom">
		<div id="jv-bottom">
		  <div class="jv-footermenu">
		  	<jdoc:include type="modules" name="footer" />
		  </div>
		</div><!-- end bottom -->
	</div>
	
	<jdoc:include type="modules" name="debug" />
</body>
</html>