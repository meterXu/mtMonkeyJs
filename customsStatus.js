// ==UserScript==
// @name         报关单状态
// @namespace    customs
// @version      1.0
// @updateURL    https://tampermonkey.isaacxu.com/jetPortal.js
// @license      LGPL-3.0
// @description  报关单状态查询
// @supportURL   https://github.com/meterXu/mtMonkeyJs
// @author       Meter
// @match        http://query.customs.gov.cn/HYW2007DataQuery/FormStatusQuery.aspx
// @require      https://code.jquery.com/jquery-2.0.0.min.js
// @run-at       document-idle
// @grant        unsafeWindow
// @grant        GM_setValue
// @grant        GM_getValue
// ==/UserScript==
let verCode = '';
let state = true;
let backUrl = 'http://192.168.12.105/yyjkwebapi/api/'
function startRobot(time){
    setTimeout(c=>{
        if(state){
            // 判断是否可以开始
            wirteLog('发现页面可爬');
            if($("#submitBtn").length===1){
                // 请求ajax
                $.ajax({
                    url:backUrl+'Cus/GetNoList',
                    type:'post',
                    dataType:'json',
                    success:function(res){
                        if(res.length>0){
                            wirteLog('正在爬取报关单号：'+res[0]['CS_NO']);
                            $("#txtDeclareFormNo").val(res[0]['CS_NO']);
                            var imgUrl = $("#verifyIdentityImage img").attr("src");
                            $.ajax({
                                url:backUrl+"Cus/GetVcode",
                                data:{
                                    imgurl:'http://query.customs.gov.cn/'+imgUrl
                                },
                                type:'post',
                                dataType:'json',
                                success:function(res){
                                    if(res.code&&res.code.length===6){
                                        wirteLog('获取验证码为：'+res.code);
                                        $("#txtVerifyNumber").val(res.code);
                                        window.setTimeout(c=>{
                                            $("#submitBtn").click();
                                        },100)
                                        wirteLog('一个批次爬取结束');
                                    }else{
                                        wirteLog('验证码为空');
                                        startRobot(100)
                                    }
                                },
                                error:function(){
                                    wirteLog('获取验证码失败');
                                    startRobot(100)
                                }
                            })
                        }
                    },
                    error:function () {
                        wirteLog('请求GetNoList出错');
                        startRobot(100);
                    }
                })

            }else{
                wirteLog('发现页面不可爬，轮询等待');
                window.setTimeout(c=>{
                    window.location.href=window.location.href;
                },8000)

            }
        }else{
            startRobot(100);
        }
    },time||100);

}

function stopRobot(){
    state = false;
}

function wirteLog(text){
    let ndt = new Date();
    let msg  = ndt.toLocaleDateString()+' '+ndt.toLocaleTimeString()+"："+text+'\r\n';
    $("#dc_log").append(msg);
    $("#dc_log")[0].scrollTop =$("#dc_log")[0].scrollHeight;
    console.log(msg);
}

(function() {
    'use strict';

    $(function(){
        $("body").append("<div id='dc_contorl'><div><div><button id='dc_btn'>暂停</button></div><div><textarea id='dc_log'></textarea></div></div>");
        $("#dc_contorl").css({
            width:'450px',
            position:'absolute',
            top:'50px',
            right:'50px'
        });
        $("#dc_log").css({
            width: '100%',
            height: '400px',
            overflow:'auto',
            resize:'none',
            'white-space':'nowrap'
        });
        $("#dc_btn").on({
            'click':function(){
                if(state){
                    state=false;
                    $(this).text('开始');
                    wirteLog('暂停');
                }else{
                    state=true;
                    $(this).text('暂停');
                    wirteLog('开始');
                }
            }
        })
        wirteLog('爬网开始...');
        startRobot();
        if($("#lblResult").length&&$("#lblResult").text()){
            let cusNo =$("#txtDeclareFormNo").val();
            let res = $("#lblResult").text();
            //保存
            $.ajax({
                url:backUrl+"Cus/SaveCusStatus",
                data:{
                    cusNo:cusNo,
                    state:res
                },
                type:'post',
                success:function(res){
                    wirteLog('入库成功！'+cusNo);
                    window.location.href = window.location.href;
                }
            })
        }

    });
})();
