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
			"input"  : $('#addsInput'),
			"button" : $('#addsButton'),
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
		UI[action].input.on('change', inputOnChange);
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
		EmptyMessage(UI[action].message);
		EmptyMessage(UI[action].error);

		// 執行對應動作
		if (action === 'adds')
			_addsButtonOnClick('adds');
		if (action === 'updates')
			_updatesButtonOnClick('updates');
		if (action === 'deletes')
			_deletesButtonOnClick('deletes');
	}

	function _addsButtonOnClick (action){
		var itemIds = config.ids[action];
		
		if (!itemIds) {
			errorHandler("請輸入 Storymap ID", UI[action].error);
			return;
		}

		// 故事地圖實體項目內容
		// 奇數項存meta 偶數項存data
		var items = new Array(); 
		
		itemIds.split(",").forEach( function (itemId){
			// 移除空白字元
			var itemId = itemId.replace(/\s/g, ''); 
			
			// 取得每一筆故事地圖「說明資料」與「實體資料」
			items.push( $.get(_itemMetaUrl(itemId), {f: 'json'}, null, "json") );			
			items.push( $.get(_itemDataUrl(itemId), {f: 'json'}, null, "json") );
		});

		Promise.all(items)
		   .then( createIndex.bind({ action: action }) )
		   .then( 
		   		writeIndex.bind({ action: action }),
		   		errorHandler.bind({ messageNode: UI[action].error })
		   	)
		   .then( writeIndexSuccess.bind({ action: action }) );
	}
	
	function _updatesButtonOnClick (){
		if (!updateId) {
			alert("請輸入 Storymap ID");
			return;
		}

	}
	
	function _deletesButtonOnClick (evt){
		if (!deleteId) {
			alert("請輸入 Storymap ID");
			return;
		}

	}

	/****************
		主功能 
	 ****************/
	function createIndex (response) {
		// 取得由哪個按鈕所引發的事件
		var action = this.action;

		var indexPackage = new Array();
		var metaset = response.filter(function (meta, index) { if( index%2 === 0) return meta}),
			dataset = response.filter(function (meta, index) { if( index%2 === 1) return meta});

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

		return new Promise(function (resolve, reject) { 
			resolve(indexPackage);
			reject('索引資料建立錯誤!');
		});
	}

	function writeIndex (indexPackage) {
		var endPoint = config.indexUrl + '/applyEdits';
		var data = null;

		console.log(indexPackage);

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

			if (idx < message.length-1 )
				info = info + message.objectId + ", ";
			else
				info = info + message.objectId;
		});

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

	function EmptyMessage (messageNode) {
		messageNode.find($('p')).empty();
		messageNode.hide();
		messageNode.addClass('hidden');
	}

	function insertMessage (message, messageNode) {
		// 寫入訊息
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