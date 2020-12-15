$(document).ready(function(){
	// Global setting variable
	var config = {
		indexUrl: "https://services6.arcgis.com/ZQ3vYRJIbpufErto/ArcGIS/rest/services/%E5%AE%98%E7%B6%B2%E6%96%87%E7%AB%A0%E7%B4%A2%E5%BC%95/FeatureServer/0",
		ids: {
			adds: "",
			updates: "",
			deletes: ""
		}
	};

	// 定義並初始化元件
	var UI = {
		adds: {
			"message": $('#addsMsg .ui.positive.message'),
			"error"  : $('#addsMsg .ui.negative.message')
		},
		updates: {
			"input"  : $('#updatesInput'),
			"button" : $('#updatesButton'),
			"message": $('#updatesMsg .ui.positive.message'),
			"error"  : $('#updatesMsg .ui.negative.message')
		},
		deletes: {
			"input"  : $('#deletesInput'),
			"button" : $('#deletesButton'),
			"message": $('#deletesMsg .ui.positive.message'),
			"error"  : $('#deletesMsg .ui.negative.message')	
		}		
	}; 

	initUI ();
	
	/**************** 
		定義事件 
	 ****************/
	for (action in UI) {
		if (UI[action].input)
			UI[action].input.on('change', inputOnChange);
		if (UI[action].button)
			UI[action].button.on('click', buttonOnClick);
	}
	
	/****************
		事件處理函數 
	 ****************/
	function inputOnChange(evt) {
		var action = this.id.replace('Input', '');

		// 將使用者輸入的 ID值存入全域變數 config.ids
		config.ids[action] = this.value;
	}

	function buttonOnClick (evt) {
		action = this.id.replace('Button', '');

		// 清除對應動作的訊息內容
		actions = ['adds', 'updates', 'deletes'];
		EmptyAllMessage(actions);

		// 執行對應動作
		if (action === 'updates')
			_updatesButtonOnClick('updates');
		if (action === 'deletes')
			_deletesButtonOnClick('deletes');
	}

	function _updatesButtonOnClick (action){
		var itemIds = config.ids[action];
		
		if (!itemIds) {
			errorHandler("請輸入 Storymap ID", UI[action].error);
			return;
		}

		queryExistItems(itemIds)
		  .then(classifyIds.bind({ requestIds: itemIds }))
		  .then(queryItems)
		  .then(buildIndex);
	}
	
	function _deletesButtonOnClick (action){
		var itemIds = config.ids[action];
		
		if (!itemIds) {
			errorHandler("請輸入 Storymap ID", UI[action].error);
			return;
		}

		var bindData = {
			action: "deletes",
			messageNode: UI["deletes"].error
		};

		queryExistItems(itemIds)
		  .then(getDeleteObjectIds)
		  .then(buildDeleteIndex.bind(bindData))
  	      .then( 
	      	writeIndex.bind(bindData), 
	      	errorHandler.bind(bindData) 
	      )
	      .then( writeIndexSuccess.bind(bindData) );

	}

	/****************
		主功能 
	 ****************/
	function queryExistItems (itemIds) {
		var sql = "", counts = itemIds.split(",").length;

		// 產生查詢條件
		itemIds.split(",").forEach( function (itemId, index){
			// 移除空白字元
			var itemId = itemId.replace(/\s/g, '');
			// 產生where自
			if (index <  (counts-1) )
				sql += "itemId='" + itemId + "' OR ";
			if (index === (counts-1) )
				sql += "itemId='" + itemId + "'" ;
		});

		return $.ajax({
			type: "GET",
			url: config.indexUrl + '/query',
			data: {
				f: 'json',
				where: sql,
				outFields: "OBJECTID, itemId",
				returnGeometry: false
			},
			dataType: 'json'
		});
	}

	function getDeleteObjectIds (response) {
		var ids = new Object();

		ids.deletes = response.features.map(function (item) { 
			return item.attributes.itemId;
		});
		
		ids.deletesObjIds = response.features.map(function (item) { 
			return item.attributes.OBJECTID;
		});

		return new Promise(function (resolve, reject) {
			resolve(ids);
			reject('取得要刪除的Id步驟錯誤');
		});
	}

	function classifyIds (response) {
		var ids = new Object();
		
		ids.updates = response.features.map(function (item) { 
			return item.attributes.itemId;
		});
		
		ids.updatesObjIds = response.features.map(function (item) { 
			return item.attributes.OBJECTID;
		});
		
		ids.adds = new Array();
		this.requestIds.split(',').map(function (id) { 
			var requestId = id.replace(/\s/g, '');
			if ( !ids.updates.includes(requestId) )
				ids.adds.push(requestId);
		});
		
		return new Promise(function (resolve, reject) {
			resolve(ids);
			reject('分類Id錯誤');
		});
	} 
	
	function queryItems (ids) {
		var items = new Object();

		// 故事地圖實體項目內容
		// 奇數項存meta 偶數項存data
		items.adds = new Array();
		items.updates = new Array();
		
		if (ids.adds.length > 0) {
			ids.adds.forEach(function (itemId) {
				// 取得每一筆故事地圖「說明資料」與「實體資料」
				items.adds.push( $.get(_itemMetaUrl(itemId), {f: 'json'}, null, "json") );			
				items.adds.push( $.get(_itemDataUrl(itemId), {f: 'json'}, null, "json") );
			});
		}

		if (ids.updates.length > 0) {
			ids.updates.forEach(function (itemId) {
				// 取得每一筆故事地圖「說明資料」與「實體資料」
				items.updates.push( $.get(_itemMetaUrl(itemId), {f: 'json'}, null, "json") );
				items.updates.push( $.get(_itemDataUrl(itemId), {f: 'json'}, null, "json") );
			});
		}

		return new Promise(function (resolve, reject) {
			resolve({ ids: ids, items: items});
		});
	}

	function buildDeleteIndex (ids) {
		// ids.deletes
		// ids.deletesObjIds
		this.ids = ids;

		return new Promise(function (resolve, reject) {
			resolve(ids.deletesObjIds);
		});
	}

	function buildIndex (data) {
		var ids = data.ids;
		var	updatesItems = data.items.updates;
		var	addsItems = data.items.adds;

		// add items
		if (addsItems.length > 0)
			buildIndexProcess(addsItems, "adds", ids);
		
		// update items
		if (updatesItems.length > 0)
			buildIndexProcess(updatesItems, "updates", ids);	
	}

	function buildIndexProcess (items, action, ids) {
		var bindData = new Object;
			bindData.action = action;
			bindData.messageNode =  UI[action].error;
			bindData.ids = ids;

		Promise.all(items)
	      .then( createIndex.bind(bindData) )
	      .then( 
	      	writeIndex.bind(bindData), 
	      	errorHandler.bind(bindData) 
	      )
	      .then( writeIndexSuccess.bind(bindData) );
	}

	function createIndex (response) {
		// 取得由哪個按鈕所引發的事件
		var action = this.action;

		var indexPackage = new Array();
		var metaset = response.filter(function (meta, index) { 
			if( index%2 === 0) 
				return meta; 
		});
		var dataset = response.filter(function (data, index) { 
			if( index%2 === 1) return data; 
		});

		metaset.forEach(function (meta, i) {
			if (meta.error) {
				errorHandler(meta.error, UI[action].error);
				return;
			}

			var indexData = new Object();
				indexData.attributes = new Object();

			// 取得故事地圖全文文字
			var postFullText = _contentIndex( dataset[i] );

			// 寫入資訊
			indexData.attributes.title = meta.title;
			indexData.attributes.summary = !(meta.descript)? postFullText.substring(0, 100): meta.descript;
			indexData.attributes.content = postFullText;
			indexData.attributes.keywords = !(meta.tags)? "": meta.tags.join();
			indexData.attributes.author = meta.owner;
			indexData.attributes.created = new Date(meta.created);
			indexData.attributes.modified = new Date(meta.modified);
			indexData.attributes.isDeleted = 0; // 0:未刪除  1:已刪除
			indexData.attributes.isDrafted = 0; // 0:已完稿  1:草稿
			indexData.attributes.thumbnail = _thumbnailUrl(meta.id, meta.thumbnail);
			indexData.attributes.itemId = meta.id;

			indexPackage.push(indexData);
		}.bind(this));

		if (action === 'updates') {
			this.ids.updatesObjIds.forEach(function (ObjId, idx) {
				indexPackage[idx].attributes["OBJECTID"] = ObjId;
			});
		}

		return new Promise(function (resolve, reject) { 
			resolve(indexPackage);
			reject('索引資料建立錯誤!');
		});
	}

	function writeIndex (indexPackage) {
		var endPoint = config.indexUrl + '/applyEdits';
		var data = null;

		if (this.action === 'adds')
			data = { adds: JSON.stringify(indexPackage), f: "json" };

		if (this.action === 'updates')
			data = { updates: JSON.stringify(indexPackage), f: "json" };

		if (this.action === 'deletes')
			data = { deletes: JSON.stringify(indexPackage), f: "json" };

		return $.ajax({
			type: "POST",
			url: endPoint,
			data: data,
			dataType: 'json'
		});
	}

	function writeIndexSuccess (response) {
		// 判斷使用者行為
		var action = this.action;
		
		// 伺服器回傳錯誤訊息
		if (response.error) {
			errorHandler(response.error, UI[action].error);
			return;
		}

		// 設定回傳訊息
		var info = ""; // 執行成功的訊息
		var messages = null;

		if (action === "adds")
			messages = response.addResults;	
		if (action === 'updates')
			messages = response.updateResults;
		if (action === 'deletes')
			messages = response.deleteResults; 

		messages.forEach(function (message, idx){
			if(message.error){
				errorHandler(message.error.description, UI[action].error);
				return;
			}

			if (idx < messages.length-1 ) {
				info = info + message.objectId + 
					   ": " + this.ids[action][idx] + "<br/>";
			}
			else {
				info = info + message.objectId + 
					   ": " + this.ids[action][idx];
			}
			
		}.bind(this));

		if (info) {
			insertMessage(info, UI[action].message);	
		}
	}

	function errorHandler (errorObj, messageNode) {
		var errMessage = "";

		// 產生錯誤訊息
		if ( typeof(errorObj) === "string" ) {
			errMessage = errorObj;
		}
		else if (errorObj.details.length > 0) {
			errMessage = errorObj.details.join(" ");
		}
		else {
			errMessage = errorObj.message;
		}

		// 寫入錯誤訊息
		var messageNode = !(messageNode)? (this.messageNode):(messageNode);
		messageNode.find($('p')).append(errMessage);
		
		// 顯示錯誤訊息
		messageNode.show();
		messageNode.removeClass('hidden');
	}

	function EmptyAllMessage (actions) {
		actions.forEach(function (action) {
			EmptyMessage(UI[action].message);
			EmptyMessage(UI[action].error);
		});
	}

	function EmptyMessage (messageNode) {
		messageNode.find($('p')).empty();
		messageNode.hide();
		messageNode.addClass('hidden');
	}

	function insertMessage (message, messageNode) {
		// 寫入訊息
		message += ' ';
		messageNode.find($('p')).append(message);

		// 顯示訊息
		messageNode.show();
		messageNode.removeClass('hidden');
	}

	function initUI () {
		// 初始化訊息關閉功能
		$('.message .close').on('click', function() {
			$(this).closest('.message').transition('fade');
		});

		$('.ui.message').hide();
	}

	/****************
		取得item資訊
	 ****************/
	function _itemMetaUrl (itemId) {
		return "https://www.arcgis.com/sharing/rest/content/items/" + 
				itemId;
	}

	function _itemDataUrl (itemId) {
		return "https://www.arcgis.com/sharing/rest/content/items/" + 
				itemId + '/data';
	}

	function _thumbnailUrl (id, thumbnail) {
		return "https://www.arcgis.com/sharing/rest/content/items/" + 
	       id + "/info/" + thumbnail + "?w=400";
	}
	function _contentIndex (itemData) {
		var content = "";

		for (key in itemData.nodes) {
			var data = itemData.nodes[key];
			
			if (data.type === "text") 
				content = content + deleteHtmlTag(data.data.text) + "\n";
				
		}

		return content;
	}

	function deleteHtmlTag(text){
		//去掉所有的html標記
		return text.replace(/<[^>]+>/g,"");
	}

}); // End of $(document)