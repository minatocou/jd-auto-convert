var pageBtn=$('<input type="button" class="page-btn" value="保存到Copetus" / >').appendTo('body')
pageBtn.on('click',function(){
    //chrome.tabs.create( { url:chrome.extension.getURL('./jd.html'), index:(S.tab.index+1), selected:false }, function(tab){
    //    setTimeout(function(){_send2Spliter(tab); },50 );
    //});

    var info = {
        "title": document.title,
        "selection": window.getSelection().toString()
    };

    chrome.runtime.connect().postMessage(info);
})
