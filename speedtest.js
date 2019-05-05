// ==UserScript==
// @name         测速网去广告
// @namespace    http://tampermonkey.net/
// @version      0.2
// @description  谁用谁知道
// @author       Meter
// @match        *://www.speedtest.cn/*
// @require      http://libs.baidu.com/jquery/2.0.0/jquery.min.js
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    $(".col-2,.tmall,.qrCode,.advertising-upCaption").remove();
    $("img[src='../../images/adv/index-top.png']").parent().parent().remove();
    $("img[src='/images/qq.png?da63ad6d80a46582316364f64a4627c4']").parent().parent().remove();
    $(".col-8").css({
        margin:"auto"
    })
})();
