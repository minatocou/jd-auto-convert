
$(function(){
    $('#login-btn').on('click',function(){
        chrome.runtime.sendMessage({action:"login"});
    })
})