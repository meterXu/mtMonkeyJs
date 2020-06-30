// ==UserScript==
// @name         lightshot截图存储
// @namespace    http://tampermonkey.net/
// @require      https://code.jquery.com/jquery-2.0.0.min.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/clipboard.js/2.0.4/clipboard.min.js
// @version      1.1
// @description  lightshot base64图片转url，方便Markdown文档内插入图片
// @author       isaacXu
// @supportURL   https://github.com/meterXu/mtMonkeyJs
// @updateURL    https://tampermonkey.isaacxu.com/lightshotSave.js
// @match        https://prnt.sc/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    // Your code here...
    const baseUrl = "https://server.isaacxu.com:3001"
    removeAd();
    $(function(){
        init();
        setSaveBtnEvent();
    })


    function init(){
      let timerid =  window.setInterval(function(){
            if($(".under-image img").length>0){
                $(".social").append(`<div class="social__tw my-save-btn" style='padding:0 5px;height:20px;background-color:green;text-align:center;border-radius:4px;margin-top:-5px;cursor:pointer'>
                        <span id="saveImg" style='font-size:11px;color:#fff'>⭐ 保存</span>
                        </div>`)
                setSaveBtnEvent()
                window.clearInterval(timerid)
            }
        },1000)

    }

    function removeAd(){
        $(".additional").remove()
    }
    function setSaveBtnEvent(){
        let code = window.location.pathname;
        if(code){
            code = code.replace('/','')
        }
        searchImgUrl(code)
        $("#saveImg").on('click',function(){
            let imgbase64 = $(".under-image img").prop('src')
            let title = $(".image__title").text()||$(".image__title a").text()
            saveImg(code,title,imgbase64)
        })
    }

    function searchImgUrl(code){
        $.ajax({
            url:baseUrl+"/exca/searchImg",
            type:'get',
            data:{code:code},
            success:function(res){
                if(res&&res.success){
                    createCopyBtn(res.info.url)
                }
            }
        })
    }

    function saveImg(code,title,data){

        let user = document.querySelector("#username").innerText.replace("%username%","-")

        $.ajax({
            url:baseUrl+"/exca/saveImg",
            type:'post',
            data:{
                code:code,
                title:title,
                data:data,
                user:user
            },
            beforeSend:function(){
                $("#saveImg").text("… 正在保存")
                $(".my-save-btn").css({
                    "backgroundColor":"#676767"
                })
            },
            dataType:'json',
            success:function(res){
                if(res&&res.success){
                    $("#saveImg").text("✔ 保存成功")
                    $(".my-save-btn").css({
                        "backgroundColor":"green"
                    })
                    createCopyBtn(res.info.url)

                }else{
                    $("#saveImg").text("× 保存失败")
                    $(".my-save-btn").css({
                        "backgroundColor":"red"
                    })
                    $("#my-err-info").remove()
                    $(".social").after(`<div id='my-err-info' style='color:red'>${res.info.msg}</div>`)
                }
            },
            error:function(err){
                $("#my-err-info").remove()
                $(".social").after(`<div id='my-err-info' style='color:red'>${err.statusText}</div>`)
            }
        })
    }

    function createCopyBtn(url){
        $("#my-img-url-copy").unbind('click')
        $("#my-img-url-container").remove();
        $(".image-info").after(`<div id="my-img-url-container" style="display: flex;justify-content: center;"><input id='my-img-url' type='text' style='width:400px;height:24px;line-hieght:24px;background:#fbfbfb;outline:none;text-indent:10px' value='${url}'/>
        <button id='my-img-url-copy' type='button' style="padding: 0 10px;height: 24px;cursor: pointer;outline: none;background: #76ab74;color: #fff" data-clipboard-target="#my-img-url">复制</button>
        </div>`)
        $("#my-img-url-copy").on('click',copyUrl)
    }
    function copyUrl(){
        new ClipboardJS("#my-img-url-copy")
        $("#my-img-url-copy").text("复制成功").css({
            "background":"#bd2788"
        })
    }


})();


