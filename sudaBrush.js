// ==UserScript==
// @name         苏大刷题
// @namespace    https://cj1060-kfkc.webtrn.cn
// @version      0.9
// @description  刷题
// @author       isaac
// @match        https://cj1060-kfkc.webtrn.cn/learnspace/learn/learn/*
// @updateURL    https://app.xdo.icu/tampermonkey/sudaBrush.js
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    function watch(){
        setTimeout(()=>{
           try{
               closeDialog()
               if(checkLearnCompleteNow()){
                   learnNextVideo()
               }
           } catch (e){
               console.error(e)
           } finally {
               if(!top.learnComplete){
                   watch()
               }
           }
        },1000)
    }


    function closeDialog(){
        const learnHelper$=top.document.getElementById("learnHelperIframe").contentWindow.$
        let helper_page = learnHelper$("#helper-page")
        let helper_page_close_btn = learnHelper$("#helper-page .shut-btn")
        let layer_dialog = top.$(".layui-layer-dialog")
        let layer_dialog_btn = top.$(".layui-layer-dialog .layui-layer-btn0")
        if(helper_page.length>0){
            helper_page_close_btn.click()
        }
        if(layer_dialog.length>0){
            layer_dialog_btn.click()
        }
        const mainFrame=top.document.getElementById("mainCont").contentWindow.document.getElementById("mainFrame")
        if(mainFrame&&mainFrame.contentWindow){
            const mainFrame$ = mainFrame.contentWindow.$
            let jwdisplayIcon_opacity = mainFrame$('.jwdisplayIcon').css('opacity')
            let button_play = mainFrame$('.jwdisplayIcon #container_display_button_play')
            if(button_play.length>0&&jwdisplayIcon_opacity==='1'){
                button_play.click()
            }
        }
    }


    function getUnLearnList() {
        const mainCont$=top.document.getElementById("mainCont").contentWindow.$
        let learnList = mainCont$('.s_point[itemtype="video"][completestate="0"]')
        let res = []
        for(let i=0;i<learnList.length;i++){
            res.push({
                videoId: mainCont$(learnList[i]).attr('id').replace('s_point_', ''),
                completeState: parseInt(mainCont$(learnList[i]).attr('completestate')),
                title: mainCont$(learnList[i]).attr('title')
            })
        }
        if(top.nowLearnId&&res.findIndex(c=>c.videoId===top.nowLearnId)>-1){
            res.splice(res.findIndex(c=>c.videoId===top.nowLearnId),1)
        }
        return res
    }

    function checkLearnCompleteNow(){
        const mainFrame$=top.document.getElementById("mainCont").contentWindow.document.getElementById("mainFrame").contentWindow.$
        let jwdisplayIcon_opacity = mainFrame$('.jwdisplayIcon').css('opacity')
        let button_replay = mainFrame$('.jwdisplayIcon #container_display_button_replay')
        let button_pause = mainFrame$('.prism-big-play-btn.pause')
        if(jwdisplayIcon_opacity){
            return jwdisplayIcon_opacity==='1'&&button_replay.length===1
        }else {
            return button_pause.length !== 0;
        }
    }

    function learnNextVideo(){
        let learnList = getUnLearnList()
        if(learnList.length>0){
            top.nowLearnId = learnList[0].videoId
            const mainCont$=top.document.getElementById("mainCont").contentWindow.$
            mainCont$('#s_point_'+top.nowLearnId).click()
        }else{
            top.layer.alert('视频已全部学完！')
            top.learnComplete = true
        }
    }


    setTimeout(()=>{
        watch()
    },5000)

})();
