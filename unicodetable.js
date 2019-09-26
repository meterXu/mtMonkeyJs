// ==UserScript==
// @name         unicode-table去广告
// @namespace    unicode-table
// @version      1.0.0
// @license      LGPL-3.0
// @description  烦人的广告
// @author       Meter
// @include      *://unicode-table.com*
// @updateURL    https://tampermonkey.isaacxu.com/unicodetable.js
// @require      http://libs.baidu.com/jquery/2.0.0/jquery.min.js
// @supportURL   https://github.com/meterXu/mtMonkeyJs
// @run-at       document-idle
// @grant        unsafeWindow
// @grant        GM_setValue
// @grant        GM_getValue
// ==/UserScript==
(function () {
    $(".wrapper main__top-ad").hide();
    $("ins").hide();
    $("#_atssh").nextAll("div").hide();
    $("iframe").hide();
    $(function(){
    })
})();
