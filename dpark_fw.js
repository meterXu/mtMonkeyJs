// ==UserScript==
// @name         泛微自动登录
// @namespace    fw.dpark.com.cn
// @version      1.0.1
// @description  泛微自动登录
// @author       isaac
// @match        *fw.dpark.com.cn/login/Login.jsp*
// @match        *fw.dpark.com.cn/wui/theme/ecology8/page/login.jsp*
// @match        *fw.dpark.com.cn/wui/main.jsp*
// @updateURL    https://app.xdo.icu/tampermonkey/dpark_fw.js
// @require      http://libs.baidu.com/jquery/2.0.0/jquery.min.js
// @supportURL   https://github.com/meterXu/mtMonkeyJs
// @grant        GM_setValue
// @grant        GM_getValue
// ==/UserScript==

$("head").append('<link href="https://app.xdo.icu/tampermonkey/jetPortal.css" rel="stylesheet">');
$(function () {
    initSetting()
    if(window.location.pathname.toLowerCase().indexOf('login.jsp')>-1){
    const username = GM_getValue("m_p_username")
    const password = GM_getValue("m_p_passwd")
    if(username&&password){
        $("#loginid").val(username)
        $("#userpassword").val(password)
        $("#login").click()
    }
    }
})

function initSetting(){
    $("body").append("<div id='m_p_setting'>设置</div>");
    $("body").append("<div id='m_p_setting_dialog'>" +
        "<div id='m_p_setting_con'>" +
        "<h1>设置</h1>" +
        "<table>" +
        "<tr><td>保存用户名：</td><td><input id='m_p_username' style='border: 1px solid #ddd;height: 24px;line-height: 24px;text-indent: 3px;' type='text'/></td></tr>" +
        "<tr><td>保存密码：</td><td><input id='m_p_passwd' style='border: 1px solid #ddd;height: 24px;line-height: 24px;text-indent: 3px;' type='password'/></td></tr>" +
        "<tr><td colspan='2'><button id='savePortalData' type='button'>保存</button> <button id='closeMPDialog' type='button'>关闭</button></td></tr>" +
        "</table>" +
        "</div></div>");
    $("#m_p_setting").click(function () {
        let userName = GM_getValue("m_p_username");
        let passwd = GM_getValue("m_p_passwd");
        $("#m_p_username").val(userName);
        $("#m_p_passwd").val(passwd);
        $("#m_p_setting_dialog").show();
    });
    $("#savePortalData").click(function () {
        let userName = $("#m_p_username").val();
        let passwd = $("#m_p_passwd").val();
        GM_setValue("m_p_username", userName);
        GM_setValue("m_p_passwd", passwd);
        mAlert('保存成功');
    });
    $("#closeMPDialog").click(function () {
        $("#m_p_setting_dialog").hide();
    })
}

function mAlert(msg) {
    $("body").append("<div class='m_dialog'><div class='m_dialog_con'>" + msg + "</div></div>");
    $(".m_dialog").css({
        position: 'absolute',
        left: "0",
        top: "0",
        right: '0',
        bottom: '0',
        background: "none",
        zIndex: "998",
        textAlign: "center"
    });
    $(".m_dialog_con").css({
        width: "94px",
        height: "30px",
        lineHeight: "30px",
        marginTop: "30px",
        background: "#fff",
        display: "inline-block",
        boxShadow: "0px 1px 3px #393a39"
    });
    window.setTimeout(() => {
        $(".m_dialog").remove();
        window.location.href = window.location.href
    }, 1000);
}
