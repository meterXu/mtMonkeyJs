// ==UserScript==
// @name         企查查-统一社会信用代码
// @namespace    http://www.creditchina.gov.cn
// @version      1.0.0
// @license      LGPL-3.0
// @description  获取企查查网统一社会信用代码
// @author       isaac
// @include      *://www.qichacha.com/search*
// @include      *://www.qichacha.com/firm*
// @updateURL    https://tampermonkey.isaacxu.com/businessCheck.js
// @require      http://libs.baidu.com/jquery/2.0.0/jquery.min.js
// @supportURL   https://github.com/meterXu/mtMonkeyJs
// @run-at       document-idle
// @grant        unsafeWindow
// @grant        GM_setValue
// @grant        GM_getValue
// ==/UserScript==
(function () {
    'use strict';
    let requireCrawl = null;
    let i=0;
    let rp=1;
    let timer=null;
    let sleepTime=1000*60;
    let baseUrl='http://localhost:3000';
    let action={
        search:'/getData',
        update:'/updateData'
    };
    $(function(){
        let key = getRequest()['key']
        let iscompany = window.location.href.indexOf('firm')>-1
        if(key&&key!='xxx'){
            openNewTab();
        }else if(iscompany){
            setTimeout(c=>{
                inDb([{
                    trade_code:localStorage.getItem('trade_code'),
                    social_credit_code:$.trim($(".ntable:first tr:eq(3) td:eq(1)").text()),
                    trade_full_name:$(".title  h1").text(),
                }],c=>{
                    window.opener=null;
                    window.open('','_self');
                    window.close();
                });
            },1000);

        }else{
            initData();
        }
    });

    function initData(){
        $.ajax({
            url:baseUrl+action.search,
            type:'get',
            dataType:'json',
            data:{page:1,rp:rp},
            success:function(res){
                timer=null;
                i=0;
                $("#showRcount").remove();
                $("body").append(`<div id="showRcount" style="position: fixed;top: 200px;right: 0px;padding: 0 10px;min-width: 100px;height: 40px;line-height: 40px;text-align: center;font-size: 16px;background: cadetblue;">剩余抓取数量：<span style="color:#fff;font-weight: bold">${res.rCount}</span></div>`)
                if(res.data&&res.data.length>0){
                    initGet(res.data);
                }else{
                    setTimeout(c=>{
                        initData()
                    },sleepTime)
                }
            }
        });
    }

    function initGet(datas){
        let interval=getInterval();
        console.log(`[${new Date().toLocaleString()}]${interval/1000}秒后开始抓取数据`)
        timer=window.setTimeout(c=>{
            getData(datas,i);
        },interval);
    }

    function inDb(datas,callback){
        $.ajax({
            url:baseUrl+action.update,
            type:'put',
            dataType:'json',
            data:{entityList:datas},
            success:function(res){
                if(res.success){
                    console.log(`[${new Date().toLocaleString()}]更新数据成功`)
                }
            },
            complete:function(){
                callback&&callback()
            }
        });
    }

    function getData(datas,index){
        localStorage.setItem('trade_code',datas[index].trade_code);
        $("#headerKey").val(datas[index].trade_name);
        $(".input-group-btn button").trigger('click')
    }

    function getInterval() {
        let rd = Math.floor(Math.random()*10-4);
        if(rd<=3){
            rd=3
        }
        return (10+rd)*1000;
    }

    function getRequest () {
        var url = location.search; //获取url中"?"符后的字串
        var theRequest = new Object();
        theRequest.count = 0;
        if (url.indexOf("?") != -1) {
            var str = url.substr(1);
            var strs = str.split("&");
            for (let i = 0; i < strs.length; i++) {
                theRequest[strs[i].split("=")[0]] = decodeURIComponent(strs[i].split("=")[1]);
                theRequest.count++;
            }
        }
        return theRequest;
    }

    function openNewTab(){
        if(parseInt($.trim($("#countOld .text-danger").text()))>0){
            let url=$("#search-result tr:first .ma_h1").prop("href")
            window.open(url,"_blank")
            initData();
        }
    }

})();
