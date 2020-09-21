// ==UserScript==
// @name         天眼查-统一社会信用代码
// @namespace    http://www.creditchina.gov.cn
// @version      1.0.0
// @license      LGPL-3.0
// @description  获取天眼查网统一社会信用代码
// @author       isaac
// @include      *://www.tianyancha.com/search*
// @include      *://www.tianyancha.com/company/*
// @updateURL    https://tampermonkey.isaacxu.com/skyeye.js
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
    let sleepTime=1000*60*5;
    let baseUrl='http://localhost:3000';
    let action={
        search:'/getData',
        update:'/updateData'
    };
    $(function(){
        let key = getRequest()['key']
        let iscompany = window.location.href.indexOf('company')>-1
        if(key){
            openNewTab();
        }else if(iscompany){
            setTimeout(c=>{
                inDb([{
                    trade_code:localStorage.getItem('trade_code'),
                    social_credit_code:$(".block-data table:eq(1) tr:eq(2) td:eq(1)").text(),
                    trade_full_name:$("h1[class='name']").text(),
                }],c=>{
                    window.opener=null;
                    window.open('','_self');
                    window.close();
                });
            },5000);

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
        $("#header-company-search").val(datas[index].trade_name);
        $(".search-group .input-group-btn:first").trigger('click')
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
        if($(".result-list .search-item").length>0){
            let url=$(".result-list .search-item:first .select-none").prop('href')
            window.open(url,"_blank")
            initData();
        }
    }

})();
