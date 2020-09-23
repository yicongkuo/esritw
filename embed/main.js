$(document).ready(function(){ 
    // 側欄初始化
    $('.ui.sidebar').sidebar('attach events', '.toc.item');

    // 產生直播訊息
    var liveUrl = "https://services6.arcgis.com/ZQ3vYRJIbpufErto/arcgis/rest/services/%E7%9B%B4%E6%92%AD%E5%85%AC%E5%91%8A%E8%A8%8A%E6%81%AF/FeatureServer/0/1";
    $.get(liveUrl, {f: "json"}).then(createLiveMessage);
    
    iframeResize ();

    $(window).on('resize', function () {
        iframeResize ();
    });
    
    /**************************************
        functions
     **************************************/
    function createLiveMessage (response) {
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

        if ( (now >= pre30min) && (now <= endTime) ) 
            $("#liveWebinar").append( getliveMessage(liveInfo) );
    }

    function getliveMessage (info) {
        var hour = new Date(info.time).getHours().toString();
        var min = new Date(info.time).getMinutes();
            min = (min < 10)? ("0" + min): min.toString();
        
        return "<i class='youtube red icon'></i><a href='" + info.link + 
            "'>直播： 「" + info.topic + "」於 "+ hour + ":" + min + " 開始，</a>";
    }

    function iframeResize () {
        var bodyScrollHeight = document.body.scrollHeight;
        var menuHeight = 0;
        
        if (document.body.clientWidth > 760) {
            menuHeight = parseFloat( $('#large-menu').css('height') );
            $("iframe").css('margin-top', menuHeight + 'px');
            $("iframe").css('height', bodyScrollHeight - menuHeight + 'px');
        }
        else {
            menuHeight = parseFloat( $('#small-menu').css('height') );
            $("iframe").css('margin-top', '0px');
            $("iframe").css('height', bodyScrollHeight - menuHeight + 'px');

            $('#small-menu').css('margin-bottom', '0px');
        }

        console.log(bodyScrollHeight, menuHeight);
    }
});