// ==UserScript==
// @name         测速网去广告
// @namespace    http://tampermonkey.net/
// @version      1.0.4
// @description  谁用谁知道
// @author       isaac
// @match        *://www.speedtest.cn/*
// @updateURL    https://app.xdo.icu/tampermonkey/speedtest.js
// @require      http://libs.baidu.com/jquery/2.0.0/jquery.min.js
// @supportURL   https://github.com/meterXu/mtMonkeyJs
// @grant        none
// ==/UserScript==

(function () {
    'use strict';
    $(".col-2,.tmall,.qrCode,.advertising-upCaption,.advertisingSpace,.speed-top-ads").remove();
    $("img[src='../../images/adv/index-top.png']").parent().parent().remove();
    $("img[src='/images/qq.png?da63ad6d80a46582316364f64a4627c4']").parent().parent().remove();
    $(".col-8").css({
        margin: "auto"
    })
})();

$(function () {
    $(".right-bottom-pop").hide();
    let iframes = $("iframe").parent();
    iframes.each((i, c) => {
        if (c.tagName.toLowerCase() === 'ins') {
            c.style.display = 'none';
        }
    });
})
