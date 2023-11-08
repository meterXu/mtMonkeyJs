// ==UserScript==
// @name         苏大刷题
// @namespace    https://cj1060-kfkc.webtrn.cn
// @version      0.3
// @description  刷题
// @author       isaac
// @match        https://cj1060-kfkc.webtrn.cn/learnspace/learn/learn/templatetwo/index.action*
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
               watch()
           }
        },1000)
    }


    function closeDialog(){
        const learnHelper$=top.document.getElementById("learnHelperIframe").contentWindow.$
        const mainFrame$=top.document.getElementById("mainCont").contentWindow.document.getElementById("mainFrame").contentWindow.$
        let helper_page = learnHelper$("#helper-page")
        let helper_page_close_btn = learnHelper$("#helper-page .shut-btn")
        let jwdisplayIcon_opacity = mainFrame$('.jwdisplayIcon').css('opacity')
        let button_play = mainFrame$('.jwdisplayIcon #container_display_button_play')
        let layer_dialog = top.$(".layui-layer-dialog")
        let layer_dialog_btn = top.$(".layui-layer-dialog .layui-layer-btn0")
        if(helper_page.length>0){
            helper_page_close_btn.click()
        }
        if(layer_dialog.length>0){
            layer_dialog_btn.click()
        }
        if(button_play.length>0&&jwdisplayIcon_opacity==='1'){
            button_play.click()
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
        if(res){
            if(top.nowLearnId){
                res.splice(res.findIndex(c=>c.videoId===top.nowLearnId))
            }
            return res
        }else{
            return null
        }
    }

    function checkLearnCompleteNow(){
        const mainFrame$=top.document.getElementById("mainCont").contentWindow.document.getElementById("mainFrame").contentWindow.$
        let jwdisplayIcon_opacity = mainFrame$('.jwdisplayIcon').css('opacity')
        let button_replay = mainFrame$('.jwdisplayIcon #container_display_button_replay')
        return jwdisplayIcon_opacity==='1'&&button_replay.length===1
    }

    function learnNextVideo(){
        let learnList = getUnLearnList()
        if(learnList){
            top.nowLearnId = learnList[0].videoId
            const mainCont$=top.document.getElementById("mainCont").contentWindow.$
            mainCont$('#s_point_'+top.nowLearnId).click()
        }else{
            console.log('已全部学完')
        }
    }


    setTimeout(()=>{
        watch()
    },5000)

})();
