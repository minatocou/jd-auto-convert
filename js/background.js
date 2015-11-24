var h='';
var userTonken=localStorage.getItem('userTonken');
chrome.runtime.onMessage.addListener(function(request, sender, sendRequest){
    if(request.action=="getCv"){
        sendRequest({html: h});
    }
});

chrome.runtime.onConnect.addListener(function(port) {
    port.onMessage.addListener(function(msg) {
        chrome.browserAction.setBadgeText({text: '222'});
        if (msg.action== "getToken"){
            $.post('http://qa.copetus.com/port/checklogin',{token:userTonken}, function(data){
                console.log(data);
                if(data.status=='success'){
                    port.postMessage({reaction: msg.action,userTonken: userTonken});
                }else{
                    port.postMessage({reaction: msg.action,userTonken: null});
                }
            },'json');
        }
        if (msg.action== "login"){
            $.post('http://qa.copetus.com/port/login',msg, function(data){
                if(data.status=='success'){
                    userTonken=data.result;
                    localStorage.setItem('userTonken',data.result);
                }
                port.postMessage({reaction: msg.action,status:data.status});
            },'json');
        }
        if(msg.action=="loginOut"){
            $.post('http://qa.copetus.com/port/logout',{token:userTonken}, function(data){
                if(data.status=='success'){
                    userTonken=null;
                    localStorage.removeItem('userTonken');
                }
                port.postMessage({reaction: msg.action,status:data.status});
            },'json');
        }
        if(msg.action=="saveCv"){
            $.post('http://qa.copetus.com/port/savetextresume',{token:userTonken,cv:msg.cv}, function(data){
                port.postMessage({reaction: msg.action,status:data.status});
            },'json');
        }
    });
});

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