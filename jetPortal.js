// ==UserScript==
// @name         捷通portal考勤提醒
// @namespace    jetPortal
// @version      1.4.13
// @updateURL    https://tampermonkey.isaacxu.com/jetPortal.js
// @license      LGPL-3.0
// @description  我爱上班！！！
// @supportURL   https://github.com/meterXu/mtMonkeyJs
// @author       isaac
// @match        http://portal.dcjet.com.cn:8989/Portal/Index/Index/Index
// @match        http://portal.dcjet.com.cn:8989/Login.aspx
// @match        http://portal.dcjet.com.cn:8989/Login.aspx?logout=1
// @require      https://code.jquery.com/jquery-2.0.0.min.js
// @run-at       document-idle
// @grant        unsafeWindow
// @grant        GM_setValue
// @grant        GM_getValue
// ==/UserScript==

let todayWorkTime = {
    startWorkTime: null,
    endWorkTime: null,
    workStartState: null,
    workEndState: null,
};
let ruleWorkTime = {
    startWorkTime: null,
    endWorkTime: null,
};
const staticTime = {
    machineErrorTime: 60000,//机器误差时间
    siestaTime: 3600000,//午休事件
    requireWorkTime: 27000000,//需要工作时间
    firstStartWork: new Date(getToday() + " 08:30:00").valueOf(),//最早上班时间
    lastStartWork: new Date(getToday() + " 09:30:59").valueOf(),//最晚上班时间
    lastEndWork: new Date(getToday() + " 18:00:00"),//最晚下班时间
    weekday: [1, 2, 3, 4, 5]//周一至周五
};
let beatObj = {};
let userInfo = {};
$("head").append('<link href="https://server.isaacxu.com:4443/tampermonkey/jetPortal.css" rel="stylesheet">');
// $("head").append('<link href="http://localhost/mtMonkeyJs/jetPortal.css" rel="stylesheet">');
(function () {
    showSetting();
    setQuickOperation();
    setVerificationCode();
    loginBeat();
    getUserInfo();
    setNoticePermission();
})();
function showSetting() {
    $("body").append("<div id='m_p_setting'>设置</div>");
    $("body").append("<div id='m_p_setting_dialog'>" +
        "<div id='m_p_setting_con'>" +
        "<h1>设置</h1>" +
        "<table>" +
        "<tr><td>保存用户名：</td><td><input id='m_p_username' style='border: 1px solid #ddd;height: 24px;line-height: 24px;text-indent: 3px;' type='text'/></td></tr>" +
        "<tr><td>保存密码：</td><td><input id='m_p_passwd' style='border: 1px solid #ddd;height: 24px;line-height: 24px;text-indent: 3px;' type='password'/></td></tr>" +
        "<tr><td colspan='2'><button id='savePortalData' type='button'>保存</button> <button id='closeMPDialog' type='button'>关闭</button></td></tr>" +
        "</table>" +
        "</div></div>");
    $("#m_p_setting").click(function () {
        let userName = GM_getValue("m_p_username");
        let passwd = GM_getValue("m_p_passwd");
        $("#m_p_username").val(userName);
        $("#m_p_passwd").val(passwd);
        $("#m_p_setting_dialog").show();
    });
    $("#savePortalData").click(function () {
        let userName = $("#m_p_username").val();
        let passwd = $("#m_p_passwd").val();
        GM_setValue("m_p_username", userName);
        GM_setValue("m_p_passwd", passwd);
        mAlert('保存成功');
    });
    $("#closeMPDialog").click(function () {
        $("#m_p_setting_dialog").hide();
    })
}
function setVerificationCode() {
    if (window.location.href.indexOf('Login.aspx') > -1) {
        let newTime = new Date();
        let verMonth = newTime.getMonth() + 1;
        let verDate = newTime.getDate();
        switch (verMonth) {
            case 1:
            case 3:
            case 5:
            case 7:
            case 8:
            case 10:
            case 12:
            {
                if (verDate === 31) {
                    verDate = 1
                } else {
                    verDate++
                }
                if (verMonth === 12) {
                    verMonth = 1
                } else {
                    verMonth++
                }
            } break;
            case 4:
            case 6:
            case 9:
            case 11:
            {
                if (verDate === 30) {
                    verDate = 1
                } else {
                    verDate++
                }
                verMonth++
            } break;
            case 2: {
                if (newTime.getFullYear() % 4 === 0 && newTime.getFullYear() % 400 === 0) {
                    if (verDate === 29) {
                        verDate = 1
                    } else {
                        verDate++;
                    }
                } else {
                    if (verDate === 28) {
                        verDate = 1
                    } else {
                        verDate++;
                    }
                }
                verMonth++;
            } break;
        }
        if (verDate < 10) {
            verDate = '0' + verDate.toString();
        }
        if (verMonth < 10) {
            verMonth = '0' + verMonth.toString();
        }
        $('#txtVerificationCode').val(verDate.toString() + verMonth.toString());
        autoLogin();
    }
}
function autoLogin() {
    let userName = GM_getValue("m_p_username");
    let passwd = GM_getValue("m_p_passwd");
    let vCode = $("#txtVerificationCode").val();
    $("#txtUserName").val(userName);
    $("#txtPassword").val(passwd);
    if (userName && passwd && vCode) {
        $("#btnLogin").click();
    }
}
function setQuickOperation() {
    if (window.location.href.indexOf('Index/Index/Index') > -1) {
        $(".user-box").hide();
        $(".left-side-inner").append('<div class="workInfo">'+
            '<dl>'+
            '<dd>上班时间:</dd>'+
            '<dt id="startTime" class="load-data">-</dt>'+
            '<dd>拟下班时间:</dd>'+
            '<dt id="endTime" class="load-data">-</dt>'
            +'</dl>'
            +'</div>'+
            '<div class="quick-operation">' +
            '<ul class="operation">' +
            '<li><span data-href="/Portal/WorkSpace/BillApply/Index" data-pagecode="Work-bench">工作台</span></li>'+
            '<li><span data-href="/Portal/HrManager/HrManpowerEmployeeWork/Index" data-pagecode="HR-ManpowerEmployeeWork">刷卡</span></li>'+
            '<li><span data-href="/Portal/WorkList/WorkList/Index" data-pagecode="Portal-WorkList">报工</span></li>'+
            '<li><span data-href="/Portal/GAManager/GaExpense/Index" data-pagecode="FINANCE_MANAGE">财务</span></li>'+
            '<li><span data-href="/Portal/ITMManage/ItmServerApply/Index" data-pagecode="ITM-Manage">IT</span></li>'+
            '</ul>'
            +'</div>');
        // evnet
        $(".operation li").click(function(){
            event.stopPropagation();
            let a = $(this).find('span');
            let url = a.data('href');
            let pageCode = a.data('pagecode');
            let title = a.text();
            base.tabs.add(pageCode,title,url)
        });
        $(".quick-operation").click(function(){
            let operState = $(".operation").attr('disabled',true).attr("class");
            if(operState === 'operation'){
                $(".operation").addClass('operation_show');
                $(".operation").attr('disabled',false)
            }
            if(operState === 'operation operation_show'){
                $(".operation").addClass('operation_hide')
                setTimeout(c=>{
                    $(".operation").removeClass('operation_hide operation_show')
                    $(".operation").attr('disabled',false);
                },1000)
            }
        })
    }
}
function loginBeat() {
    if (window.location.href.indexOf("Index/Index/Index") > 1) {
        $.ajax({
            url: "http://portal.dcjet.com.cn:8989/Portal/Index/Index/Index",
            type: 'GET',
            success: function (res) {
                if (!res || res.indexOf("修改密码") < 0) {
                    window.location.href = "http://portal.dcjet.com.cn:8989/Login.aspx?logout=1";
                }
            }
        })
    }
    window.setTimeout(loginBeat, 1000 * 60 * 10)
}
function getUserInfo() {
    if (window.location.href.indexOf("Index/Index/Index") > 1) {
        userInfo.name = $(".user-info").text();
        $.ajax({
            url: "http://portal.dcjet.com.cn:8989/Portal/WorkSpace/HrExtarLeave/GetUserNameAutoComplete",
            type: "POST",
            data: {
                selectValue: userInfo.name
            },
            dataType: 'json',
            success(res) {
                if (res.length > 0) {
                    userInfo.code = res[0].Value;
                }
                getTodayWorkTimeBeat();
                endWorkBeat();
            }
        })
    }
}
function getTodayWorkTimeBeat() {
    if (window.location.href.indexOf("Index/Index/Index") > 1 && userInfo.code ) {
        if(!todayWorkTime.startWorkTime)
        $.ajax({
            url: 'http://portal.dcjet.com.cn:8989/Portal/HrManager/HrManpowerEmployeeWork/LoadIndexData',
            type: 'POST',
            data: {
                "UserNameName": userInfo.name,
                "SearchEntity.Employeename": userInfo.code,
                "SearchEntity.Begintime": getToday(),
                "SearchEntity.Endtime": getToday(),
                "SearchEntity._PageIndex": 1,
                "SearchEntity._PageSize": 1,
                "SearchEntity._OrderName": "INSERT_TIME",
                "SearchEntity._OrderDirection": "asc"
            },
            dataType: "json",
            success: function (data) {
                if (data.rows && data.rows.length > 0) {
                    if (data.rows[0]["BeginDate"]) {
                        let startWorkTime = data.rows[0]["BeginDate"].replace(/\/Date\(|\)/g, '');
                        startWorkTime = parseInt(startWorkTime);
                        ruleWorkTime.startWorkTime = startWorkTime;
                        if (startWorkTime >= staticTime.lastStartWork) {
                            todayWorkTime.startWorkTime = staticTime.lastStartWork;
                            todayWorkTime.workStartState = 0;//迟到
                        } else if (startWorkTime <= staticTime.firstStartWork) {
                            todayWorkTime.startWorkTime = staticTime.firstStartWork;
                            todayWorkTime.workStartState = 1;//早到
                        } else {
                            todayWorkTime.startWorkTime = startWorkTime;
                            todayWorkTime.workStartState = 2;//正常上班
                        }
                    } else if (new Date().valueOf() >= staticTime.lastStartWork) {
                        todayWorkTime.workStartState = 3;//上班没有刷卡记录，或者刷卡机未同步
                    }
                    if (data.rows[0]["EndDate"] && parseJsonDate(data.rows[0]["EndDate"], "yyyy-MM-dd HH:mm") !== parseJsonDate(data.rows[0]["BeginDate"], "yyyy-MM-dd HH:mm")) {
                        let endWorkTime = data.rows[0]["EndDate"].replace(/\/Date\(|\)/g, '');
                        endWorkTime = parseInt(endWorkTime);
                        ruleWorkTime.endWorkTime = endWorkTime;
                        // if (endWorkTime - todayWorkTime.startWorkTime - staticTime.siestaTime < staticTime.requireWorkTime) {
                        //     todayWorkTime.workEndState = 0;//早退
                        // } else {
                        //     todayWorkTime.workEndState = 1;//正常下班
                        // }
                        todayWorkTime.workEndState = 1;//正常下班
                        todayWorkTime.endWorkTime = endWorkTime;

                    } else {
                        todayWorkTime.workEndState = 2;//下班未刷卡，或者刷卡机未同步
                    }
                }
            },
            finally:function(){
                window.setTimeout(getTodayWorkTimeBeat, 1000 * 600);//10分钟查询一次上下班时间
            }
        });
        if(getToday() !== localStorage.getItem("p_n_date")){
            resetData()
            window.setTimeout(getTodayWorkTimeBeat, 1000 * 600);//10分钟查询一次上下班时间
        }
    }
}

function endWorkBeat() {
    let nowTime = (new Date()).valueOf();
    let _startWorkTime = null;
    let _endWorkTime = null;
    if (todayWorkTime.workStartState === 0 && localStorage.getItem("p_n_l_state") !== "1" && staticTime.weekday.indexOf(new Date().getDay()) > -1) {
        let noticeCon = '上班时间：' + new Date(ruleWorkTime.startWorkTime).toLocaleString() + "[迟到]";
        sendNotice("警告-今天迟到了！", noticeCon, nowTime);
        localStorage.setItem("p_n_l_state", "1");
        localStorage.setItem('p_n_l_time',(new Date()).toLocaleString())
    }
    // if (todayWorkTime.workEndState === 0 && localStorage.getItem("p_n_f_state") !== "1" && staticTime.weekday.indexOf(new Date().getDay()) > -1) {
    //     let noticeCon = '下班时间：' + new Date(ruleWorkTime.endWorkTime).toLocaleString() + "[早退]";
    //     sendNotice("警告-今天早退了！", noticeCon, nowTime);
    //     localStorage.setItem("p_n_f_state", "1");
    //     localStorage.setItem('p_n_f_time',(new Date()).toLocaleString())
    // }
    if (todayWorkTime.startWorkTime) { // 正常，迟到，早到
        _startWorkTime = todayWorkTime.startWorkTime;
    } else if(todayWorkTime.workStartState === 3){ //未刷卡
        _startWorkTime = staticTime.firstStartWork;
    }
    if(_startWorkTime){
        _endWorkTime = _startWorkTime + staticTime.siestaTime + staticTime.requireWorkTime + staticTime.machineErrorTime;
    }
    $("#startTime").text(todayWorkTime.startWorkTime == null ? "..." : (parseJsonDate(new Date(ruleWorkTime.startWorkTime),'HH:mm:ss')+"["+startWorkStateText(todayWorkTime.workStartState)+"]"));
    $("#endTime").text(_endWorkTime == null ? "..." : parseJsonDate(new Date(_endWorkTime),'HH:mm:ss'));
    if (_endWorkTime && nowTime >= _endWorkTime
        && todayWorkTime.workEndState === 2
        && localStorage.getItem("p_n_state") !== "1"
        && staticTime.weekday.indexOf(new Date().getDay()) > -1) {//今天时间到了，下班未刷卡，周一-周五，未通知
        //通知下班
        let noticeCon = '上班时间为:' + (todayWorkTime.startWorkTime == null ? "-" : new Date(todayWorkTime.startWorkTime).toLocaleString()) + "[" + startWorkStateText(todayWorkTime.workStartState) + "]" +
            '\r\n应下班时间为:' + new Date(_endWorkTime).toLocaleString();
        sendNotice("提醒-今天可以下班啦！", noticeCon, nowTime);
        localStorage.setItem("p_n_date", getToday());
        localStorage.setItem("p_n_state", "1");
        localStorage.setItem('p_n_time',(new Date()).toLocaleString())
    }
    let id = null
    if(!todayWorkTime.workStartState){
        id = window.setTimeout(endWorkBeat, 1000 * 1);//下班计算心跳1秒一次
    }else{
        id = window.setTimeout(endWorkBeat, 1000 * 5);//下班计算心跳5秒一次
    }
    beatObj.endWorkBeat = id;
}
function startWorkStateText(state) {
    switch (state) {
        case 0: {
            return "迟到"
        }
        case 1: {
            return "早到"
        }
        case 2: {
            return "正常"
        }
        case 3: {
            return "未刷卡"
        }
        default:{
            return "未知"
        }
    }
}

function endWorkStateText(state) {
    switch (state) {
        case 0: {
            return "早退";
        }
        case 1: {
            return "正常";
        }
        case 2: {
            return "未刷卡"
        }
        default:{
            return "未知"
        }
    }
}

function getToday() {
    let ntime = new Date();
    return parseJsonDate(ntime, "yyyy-MM-dd")
}
function parseJsonDate(dateJson, formatter) {
    let dateTime = new Date();
    if (typeof (dateJson) === "object") {
        dateTime = dateJson;
    } else if (typeof (dateJson) === "number") {
        dateTime = new Date(dateJson);
    } else if (typeof (dateJson) === "string") {
        dateTime = dateJson.replace(/\/Date\(|\)/g, '');
        dateTime = new Date(parseInt(dateTime));
    }
    let year = dateTime.getFullYear();
    let month = dateTime.getMonth() + 1;
    let date = dateTime.getDate();
    let hours = dateTime.getHours();
    let minutes = dateTime.getMinutes();
    let seconds = dateTime.getSeconds();
    if (month < 10) {
        month = "0" + month;
    }
    if (date < 10) {
        date = "0" + date;
    }
    if (hours < 10) {
        hours = "0" + hours;
    }
    if (minutes < 10) {
        minutes = "0" + minutes;
    }
    if (seconds < 10) {
        seconds = "0" + seconds;
    }
    switch (formatter) {
        case "yyyy-MM-dd HH:mm": {
            return year + "-" + month + "-" + date + " " + hours + ":" + minutes;
        }
        case "yyyy-MM-dd": {
            return year + "-" + month + "-" + date;
        }
        case "HH:mm:ss": {
            return hours + ":" + minutes+":"+seconds;
        }
        case "yyyy-MM-dd HH:mm:ss":
        default: {
            return year + "-" + month + "-" + date + " " + hours + ":" + minutes + ":" + seconds;
        }
    }
}
function sendNotice(title, msg, tag) {
    if (window.location.href.indexOf('Index/Index/Index') > -1) {
        window.open(encodeURI("https://server.isaacxu.com:4443/webNotice/notice.html?title=" + title + "&msg=" + msg + "&tag=" + tag + "&forever=1"), "_blank");
    }
}
function setNoticePermission() {
    if (window.location.href.indexOf('Login.aspx') > -1) {
        window.open(encodeURI("https://server.isaacxu.com:4443/webNotice/setPermission.html"), "_blank");
    }
}
function mAlert(msg) {
    $("body").append("<div class='m_dialog'><div class='m_dialog_con'>" + msg + "</div></div>");
    $(".m_dialog").css({
        position: 'absolute',
        left: "0",
        top: "0",
        right: '0',
        bottom: '0',
        background: "none",
        zIndex: "998",
        textAlign: "center"
    });
    $(".m_dialog_con").css({
        width: "94px",
        height: "30px",
        lineHeight: "30px",
        marginTop: "30px",
        background: "#fff",
        display: "inline-block",
        boxShadow: "0px 1px 3px #393a39"
    });
    window.setTimeout(() => {
        $(".m_dialog").remove();
    }, 1000);
}
function resetData() {
    localStorage.setItem("p_n_date", getToday());
    localStorage.setItem("p_n_state", "0");
    localStorage.setItem("p_n_l_state", "0");
    localStorage.setItem("p_n_f_state", "0");
    staticTime.firstStartWork = new Date(getToday() + " 08:30:00").valueOf();//最早上班时间
    staticTime.lastStartWork = new Date(getToday() + " 09:30:59").valueOf();//最晚上班时间
    staticTime.lastEndWork = new Date(getToday() + " 18:00:00");//最晚下班时间
    todayWorkTime.startWorkTime = null;
    todayWorkTime.endWorkTime = null;
    todayWorkTime.workStartState = null;
    todayWorkTime.workEndState = null;
}
