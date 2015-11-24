
$(function(){
    var port = chrome.runtime.connect({name: "con"});
    port.postMessage({action: "getToken"});
    port.onMessage.addListener(function(response) {
        if(response.reaction=='getToken' && response.userTonken){
            $('.login-box').hide();
            $('.msg-box').show();
        }
        if(response.reaction=='login' && response.status=='success'){
            $('.login-box').hide();
            $('.msg-box').show();
        }
        if(response.reaction=='loginOut' && response.status=='success'){
            $('.login-box').show();
            $('.msg-box').hide();
        }
        $('#userName').val(localStorage.getItem('userName'));
    });
    $('#login-btn').on('click',function(){
        var userName=$('#userName').val();
        var passWord=$('#passWord').val();
        localStorage.setItem('userName',userName);
        port.postMessage({action: "login",userName:userName,passWord:passWord});
    })
    $('#login-out-btn').on('click',function(){
        port.postMessage({action: "loginOut"});
    })
})