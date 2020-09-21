// ==UserScript==
// @name         信用中国-统一社会信用代码
// @namespace    http://www.creditchina.gov.cn
// @version      1.0.3
// @license      LGPL-3.0
// @description  获取信用中国网统一社会信用代码
// @author       isaac
// @updateURL    https://tampermonkey.isaacxu.com/creditCode.js
// @match        https://www.creditchina.gov.cn/xinyongfuwu/tongyishehuixinyongdaimachaxunzhuanlan/shehuixinyongdaimachaxun/index.html
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
    let rp=10;
    let timer=null;
    let sleepTime=1000*60*5;
    let baseUrl='http://localhost:3000';
    let action={
        search:'/getData',
        update:'/updateData'
    };
    $(function(){
        initData();
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
            if(i<datas.length){
                getData(datas,i);
                i++;
            }else{
                if(timer){
                    inDb(datas,c=>{
                        window.clearTimeout(timer)
                        initData();
                    });
                }
            }
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
        $(".scs-input-group input").val(datas[index].trade_name);
        doSearch((res)=>{
            console.log(`[${new Date().toLocaleString()}]数据抓取成功`)
            if(res.results&&res.results.length>0){
                datas[index].social_credit_code=res.results[0].creditCode
                datas[index].trade_full_name=res.results[0].entname
            }
            initGet(datas);
        },(error)=>{
            console.log(`[${new Date().toLocaleString()}]数据抓取失败`)
            initGet(datas);
        });
    }

    creditService.societyCodeSearch=function(param){
        var options={};
        if(param.keyword!=undefined) options.keyword=param.keyword;
        if(param.filterManageDept) options.filterManageDept=param.filterManageDept;
        if(param.filterOrgan) options.filterOrgan=param.filterOrgan;
        if(param.filterDivisionCode) options.filterDivisionCode=param.filterDivisionCode;
        if(param.page) options.page=param.page;
        options.pageSize=param.pageSize || 10;
        $.ajax({
            url: config.IP + 'public_search/getCreditCodeFacades',
            type:'GET',
            dataType:'json',
            async:false,
            data:options,
            cache:false,
            success:function(data){
                param.callback&& param.callback(data);
                param.successCallback && param.successCallback(data);
            },
            error:function(error){
                param.failed&& param.failed(error);
                param.errorCallback && param.errorCallback(error);
            },
            complete:function(data){
                param.completeCallback && completeCallback(data);
            }
        })
    }

    function doSearch(callback,failed) {
        creditService.searchOptions = {'page': 1, 'successCallback': creditService.societyCodeCheckSuccess};
        creditService.searchOptions.keyword = $.trim($('.scs-input-group input').val());
        creditService.searchOptions.filterManageDept = $('.scs-partments input').attr('_code') || '0';
        creditService.searchOptions.filterOrgan = $('.scs-organiztion input').attr('_code') || '0';
        creditService.searchOptions.callback=callback;
        creditService.searchOptions.failed=failed;
        if (!$('.scs-province input').attr('_code')) {
            creditService.searchOptions.filterDivisionCode = '0';
        } else if ($('.scs-province input').attr('_code') && !$('.scs-city input').attr('_code')) {
            creditService.searchOptions.filterDivisionCode = $('.scs-province input').attr('_code');
        } else if ($('.scs-province input').attr('_code') && $('.scs-city input').attr('_code') && !$('.scs-area input').attr('_code')) {
            creditService.searchOptions.filterDivisionCode = $('.scs-city input').attr('_code');
        } else {
            creditService.searchOptions.filterDivisionCode = $('.scs-area input').attr('_code');
        }
        var deptName = $.trim($('.scs-partments input').val()) || '',
            orgName = $.trim($('.scs-organiztion input').val()) || '',
            location = $('.scs-province input').val() + $('.scs-city input').val() + $('.scs-area input').val();
        $('.result-des span').text((creditService.searchOptions.keyword ? ' > ' + creditService.searchOptions.keyword : '') + '' + (deptName ? ' > ' + deptName : '') + '' + (orgName ? ' > ' + orgName : '') + '' + (location ? ' > ' + location : ''));
        $('.scs-search-panel').slideUp();
        creditService.societyCodeSearch(creditService.searchOptions);
    }

    function getInterval() {
        let rd = Math.floor(Math.random()*10-4);
        if(rd<=3){
            rd=3
        }
        return rd*1000;
    }
})();
