// ==UserScript==
// @name         报关单状态查询
// @namespace    customs
// @version      1.3
// @updateURL    https://tampermonkey.isaacxu.com/customsStatus.js
// @license      LGPL-3.0
// @description  报关单状态查询
// @supportURL   https://github.com/meterXu/mtMonkeyJs
// @author       Meter
// @match        http://query.customs.gov.cn/HYW2007DataQuery/FormStatusQuery.aspx
// @require      https://code.jquery.com/jquery-2.0.0.min.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/jquery.form/4.2.2/jquery.form.min.js
// @run-at       document-idle
// @grant        unsafeWindow
// @grant        GM_setValue
// @grant        GM_getValue
// ==/UserScript==
let state = true;
let dataNum = 8;
let dataIndex = 0;
let backUrl = 'http://work.isaacxu.com/yyjkwebapi/api/';
let resArray = [];
let waitTime = 0;
let requireData = null;
let defaultWaitTime = waitTime;
let isResetViewSate = true;
function startRobot(time) {
    if (state) {
        // 判断是否可以开始
        wirteLog('开始爬网');
        if ($("#submitBtn").length === 1) {
            $.ajax({
                url: backUrl + 'Cus/GetNoList',
                type: 'post',
                dataType: 'json',
                data: {
                    dataNum: dataNum
                },
                success: function (res) {
                    if (res) {
                        $("#totalCrawl").text(parseInt(res.crawled)+parseInt(res.unCrawl));
                        $("#crawled").text(res.crawled);
                        $("#unCrawl").text(res.unCrawl);
                        if(res.data.length > 0){
                            requireData=res.data;
                            window.setTimeout(c=>realPost(),waitTime*1000);
                        }
                    }
                },
                error: function () {
                    wirteLog('请求GetNoList出错');
                    startRobot(time||1000);
                }
            })
        } else {
            let reTime = new RegExp('(?<=\\().*(?=秒后)','g');
            let execsTime = reTime.exec($('body').text());
            if(execsTime){
                waitTime =  waitTime =parseFloat(execsTime[0]);
            }else{
                waitTime = 60;
            }
            wirteLog('发现页面不可爬，轮询等待'+waitTime+'秒');
            window.setTimeout(c => {
                window.location.href = window.location.href;
            }, waitTime*1000)
        }
    } else {
        startRobot(time||1000);
    }
}

function realPost() {
    if(!isResetViewSate){
        resetViewState();
    }
    if(isResetViewSate){
        isResetViewSate=false;
        wirteLog('开始爬取报关单号：' + requireData[dataIndex]['CS_NO']);
        $("#txtDeclareFormNo").val(requireData[dataIndex]['CS_NO']);
        var imgUrl = $("#verifyIdentityImage img").attr("src");
        $.ajax({
            url: backUrl + "Cus/GetVcode",
            data: {
                imgurl: 'http://query.customs.gov.cn/' + imgUrl
            },
            async:true,
            type: 'post',
            dataType: 'json',
            beforeSend: function () {
                wirteLog('开始获取验证码');
            },
            success: function (res) {
                if (res.code && res.code.length === 6) {
                    wirteLog('获取验证码为：' + res.code);
                    $("#txtVerifyNumber").val(res.code);
                    window.setTimeout(c => {
                        $("#submitBtn").click();
                    }, 0)
                } else {
                    wirteLog('['+(dataIndex+1)+']验证码不正确：' + res.code);
                    resArray.push({
                        cusNo: $("#txtDeclareFormNo").val(),
                        state: null
                    });
                    rungoon();
                }
            },
            error: function () {
                wirteLog('['+(dataIndex+1)+']获取验证码失败');
                resArray.push({
                    cusNo: $("#txtDeclareFormNo").val(),
                    state: null
                });
                rungoon();
            }
        })
    }else{
        wirteLog('等待'+waitTime+'秒');
        window.setTimeout(c => realPost(),waitTime*1000);
    }
}

function wirteLog(text) {
    if($("#dc_log").val()&&$("#dc_log").val().length>=5000){
        $("#dc_log").val("");
    }else{
        let ndt = new Date();
        let msg = ndt.toLocaleDateString() + ' ' + ndt.toLocaleTimeString() + "：" + text + '\r\n';
        $("#dc_log").val($("#dc_log").val()+msg);
        $("#dc_log")[0].scrollTop = $("#dc_log")[0].scrollHeight;
    }
}

function initElement() {
    $("body").append("<div id='dc_contorl'><div>" +
        "<div><label>总共：</label><label id='totalCrawl'></label><label>，已爬取：</label><label id='crawled'></label><label>，未爬取：</label><label id='unCrawl'></label></div>" +
        "<div><button id='dc_btn'></button></div>" +
        "<div><textarea id='dc_log'></textarea></div>" +
        "</div>");
    $("#dc_contorl div").css({
        "margin-bottom":"10px"
    });
    $("#crawled").css({
        'color':'red'
    });
    $("#unCrawl").css({
        'color':'green'
    });
    $("#dc_contorl").css({
        width: '450px',
        position: 'absolute',
        top: '50px',
        right: '50px'
    });
    $("#dc_log").css({
        width: '100%',
        height: '400px',
        overflow: 'auto',
        resize: 'none',
        'white-space': 'nowrap'
    });
    $('#dc_btn').text(state?'暂停':'开始');
    $("#dc_btn").on({
        'click': function () {
            if (state) {
                state = false;
                $(this).text(state?'暂停':'开始');
                wirteLog('暂停');
            } else {
                state = true;
                $(this).text(state?'暂停':'开始');
                wirteLog('开始');
            }
        }
    });
}

function resetViewState() {
    $.ajax({
        url: 'http://query.customs.gov.cn/HYW2007DataQuery/FormStatusQuery.aspx',
        type: 'get',
        async: false,
        beforeSend:function(){
            wirteLog('开始重置viewState');
        },
        success: function (data) {
            setViewState(data)
        }
    });
}

function setViewState(data) {
    let reImg = /(?<=\<img src\=\").*(?=\" align=\"absmiddle\")/g;
    let reView = new RegExp('(?<=__VIEWSTATE" value=").*(?=" />)', 'g');
    var reAction = new RegExp('(?<=__EVENTVALIDATION" value=").*(?=" />)', 'g');
    let execs = reImg.exec(data);
    let viewExecs = reView.exec(data);
    let actionExecs = reAction.exec(data);
    if (execs && viewExecs && actionExecs) {
        wirteLog('重置viewState成功');
        isResetViewSate=true;
        waitTime=defaultWaitTime;
        let newUrl = execs[0];
        newUrl = newUrl.replace(/&amp;/g, "&");
        $("img[align='absmiddle']").attr('src', newUrl);
        $("#__VIEWSTATE").val(viewExecs[0]);
        $("#__EVENTVALIDATION").val(actionExecs[0]);
    } else {
        wirteLog('重置viewState失败');
        wirteLog(data);
        isResetViewSate=false;
        let reTime = new RegExp('(?<=\\().*(?=秒后)','g');
        let execsTime = reTime.exec(data);
        if(execsTime){
            waitTime=parseFloat(execsTime[0]);
        }else{
            waitTime=60;
        }
    }
}

function setForm() {
    let reResult = new RegExp('(?<=lblResult" class="color04">).*(?=</span)', 'g');
    $('#form1').append('<input type="hidden" name="submitBtn" value="查询"/>');
    $('#form1').on('submit', function (e) {
        e.preventDefault(); // prevent native submit
        $(this).ajaxSubmit({
            success: function (data) {
                let execRe = reResult.exec(data);
                if (execRe) {
                    wirteLog('['+(dataIndex+1)+']爬取到结果：' + execRe);
                    resArray.push({
                        cusNo: $("#txtDeclareFormNo").val(),
                        state: execRe
                    });
                    setViewState(data)
                } else {
                    let execRe = reResult.exec(data);
                    if (execRe) {
                        wirteLog('['+(dataIndex+1)+']爬取到结果：' + execRe);
                        resArray.push({
                            cusNo: $("#txtDeclareFormNo").val(),
                            state: execRe
                        });
                        setViewState(data)
                    }else {
                        wirteLog('['+(dataIndex+1)+']未爬取到结果');
                        resArray.push({
                            cusNo: $("#txtDeclareFormNo").val(),
                            state: null
                        });
                        if (data.indexOf('验证码错误') > -1) {
                            wirteLog('验证码错误')
                            setViewState(data)
                        } else {
                            if (data.length < 300) {
                                wirteLog(data)
                            }
                        }
                    }
                }
                rungoon();
            },
            error: function () {
                wirteLog('提交表单失败');
                resArray.push({
                    cusNo: $("#txtDeclareFormNo").val(),
                    state: null
                });
                rungoon();
            }
        })
    });
}

function rungoon() {
    if (resArray.length === dataNum) {
        saveDataToDb();
    }else{
        dataIndex++;
        if (dataIndex < dataNum) {
            wirteLog('等待'+waitTime+'秒');
            window.setTimeout(c => realPost(requireData),waitTime*1000);
        }
    }
}

function saveDataToDb(callback) {
    wirteLog('该批次准备入库');
    let saveData = resArray.filter(c => c.state !== null);
    let cusNos = [];
    let states = [];
    if (saveData.length > 0) {
        for (let i in saveData) {
            cusNos.push(saveData[i].cusNo);
            states.push(saveData[i].state);
        }
        $.ajax({
            url: backUrl + "Cus/SaveCusStatus",
            data: {
                cusNos: cusNos.join(','),
                states: states.join(',')
            },
            type: 'post',
            beforeSend: function () {
                wirteLog('该批次开始入库');
            },
            success: function (res) {
                wirteLog('该批次入库成功');
            },
            error: function () {
                wirteLog('该批次入库失败');
            },
            complete:function () {
                wirteLog('一个批次爬网结束');
                dataIndex=0;
                resArray=[];
                requireData=null;
                startRobot(waitTime*1000);
            }
        })
    } else {
        wirteLog('该批次入库数据条数为0');
        wirteLog('一个批次爬网结束');
        dataIndex=0;
        resArray=[];
        startRobot(waitTime*1000);
    }

}

(function () {
    'use strict';
    $(function () {
        initElement();
        setForm();
        startRobot();
    });
})();
