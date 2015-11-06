var h='';
chrome.runtime.onMessage.addListener(function(request, sender, sendRequest){
    console.log(request.action);
    if(request.action=="login"){
        httpRequest('msg.json', function(status){
            console.log(status);
        });
    }
    if(request.action=="hello"){
        sendRequest({html: h});
    }
});

chrome.runtime.onConnect.addListener(function(port) {

    // This will get called by the content script we execute in
    // the tab as a result of the user pressing the browser action.
    port.onMessage.addListener(function(info) {
        if(info.action=='hello')
            port.postMessage({html: h});
    });
});

function saveJd(tabid,info){
}



function httpRequest(url, callback){
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4) {
            callback(true);
        }
    }
    xhr.onerror = function(){
        callback(false);
    }
    xhr.send();
}

//setInterval(function(){
//    chrome.browserAction.setBadgeText({text: '222'});
//    httpRequest('msg.json', function(status){
//        chrome.browserAction.setBadgeText({text: status});
//    });
//},1000);

$(function(){
    $.get('template.html',function(data){
        h=data;
    })
})