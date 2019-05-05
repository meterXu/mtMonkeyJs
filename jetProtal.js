// ==UserScript==
// @name         jetProtal
// @namespace    jetProtal
// @version      0.2
// @description  try to take over the world!
// @author       Meter
// @match        http://portal.dcjet.com.cn:8989/Portal/Index/Index/Index
// @match        http://portal.dcjet.com.cn:8989/Login.aspx
// @match        http://portal.dcjet.com.cn:8989/Login.aspx?logout=1
// @require      http://libs.baidu.com/jquery/2.0.0/jquery.min.js
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    $(".user-box").empty();
    $("body").append("<div id='me_content'><button id='quickOperation' type='button'>快捷操作</button></div>");
    $("#me_content").css({
        position: "absolute",
        bottom: 65,
        left: 60,
        zIndex:999
    });
    $("#quickOperation").css({
        background: "#90ce88",
        cursor: "pointer",
        border: 0,
        height: 80,
        width: 80,
        borderRadius: 80,
        color:"#fff",
        outline: "none"
    });
    setVerificationCode();
})();

function setVerificationCode(){
    if(window.location.href.indexOf('Login.aspx')>-1){
        let newTime = new Date();
        let verMonth = newTime.getMonth()+1;
        let verDate = newTime.getDate();
        switch (verMonth) {
            case 1:
            case 3:
            case 5:
            case 7:
            case 8:
            case 10:
            case 12:
            {
                if(verDate === 31){
                    verDate = 1
                }else{
                    verDate++
                }
                if(verMonth === 12){
                    verMonth = 1
                }else{
                    verMonth++
                }
            }break;
            case 4:
            case 6:
            case 9:
            case 11:
            {
                if(verDate === 30){
                    verDate = 1
                }else{
                    verDate++
                }
                verMonth++
            }break;
            case 2:{
                if(newTime.getFullYear()%4===0&&newTime.getFullYear()%400===0){
                    if(verDate === 29){
                        verDate = 1
                    }else{
                        verDate++;
                    }
                }else{
                    if(verDate === 28){
                        verDate = 1
                    }else{
                        verDate++;
                    }
                }
                verMonth++;
            }break;
        }
        if(verDate < 10){
            verDate = '0' + verDate.toString();
        }
        if(verMonth < 10){
            verMonth = '0' + verMonth.toString();
        }
        $('#txtVerificationCode').val(verDate + verMonth)
    }
}
