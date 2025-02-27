// ==UserScript==
// @name         苏州大学成教在线教学平台
// @namespace    http://tampermonkey.net/
// @version      2.2
// @description  苏州大学成教在线，自动播放下一个，弹窗屏蔽，可做题目（不保证100分）
// @author       xiajie,isaac
// @match        https://cj1060-kfkc.webtrn.cn/*
// @icon         http://webtrn.cn/favicon.ico
// @grant        none
// @license      GPL
// @downloadURL https://mtmonkeyjs.netlify.app/src/sudaxuexi.js
// @updateURL https://mtmonkeyjs.netlify.app/src/sudaxuexi.js
// ==/UserScript==

(function () {
    'use strict';

    if (window.location.pathname == '/learnspace/learn/learn/templateeight/index.action') {
        console.log('进入课程详情');

        //弹窗点击
        setInterval(function () {
            if ($('.layui-layer-btn0').length > 0) {
                $('.layui-layer-btn0').click();
            }
        }, 1000);

        //是否播放页面
        setTimeout(function () {
            var text = $('.learn-menu-cur .learn-menu-text').text();
            if (text != '课件') {
                $('#courseware_main_menu a')[0].click();
            }
            setTimeout(function () {
                $('#learn-helper-main').hide();
                $('.shade-div').hide();
            }, 2000)
        }, 3000);

    }

    if (window.location.pathname == '/learnspace/learn/learn/templateeight/courseware_index.action') {
        console.log('进入视频播放');

        window.isEnd = false;
        top.isTestStart = false;
        //播放完成，点击下一节
        setInterval(function () {
            const unFinished = $(".s_point[itemtype='video']").toArray().filter(c => $(c).attr('completestate') === '0')
            let unFinishedTest = $(".s_point[itemtype='test']").toArray().filter(c => $(c).attr('completestate') === '0')
            console.log(isEnd);
            console.log(`unFinished:${unFinished.length}`)
            console.log(`unFinishedTest:${unFinishedTest.length}`)
            if (isEnd == true && unFinished !== 0) {
                isEnd = false;
                var len = $('.s_point').length;
                for (var i = 0; i < len; i++) {
                    if ($('.s_point').eq(i).hasClass('s_pointerct') == false && $('.s_point').eq(i).attr('completestate') == 0 && $('.s_point').eq(i).attr('itemtype') == 'video') {
                        var p = $('.s_point').eq(10).parent().hasClass('s_sectionwrap');
                        if (p) {
                            $('.s_point').eq(i).parent().parent().show();
                            $('.s_point').eq(i).parent().show();
                        } else {
                            $('.s_point').eq(i).parent().show();
                        }
                        $('.s_point').eq(i).click();
                        break;
                    }
                }
            }
            if (top.isTestStart === false && unFinished.length === 0 && unFinishedTest.length !== 0) {
                console.log('视频全部刷完，开始做题');
                top.isTestStart = true
                $(unFinishedTest[0]).click()
            }
            if (unFinished.length === 0 && unFinishedTest.length === 0) {
                console.log('全部刷完!!!');
            }
        }, 3000);
    }

    if (window.location.pathname == '/learnspace/learn/learn/templateeight/content_video.action') {
        console.log('播放内容页');

        //视频暂停点击
        setInterval(function () {
            if ($('#player_pause').css('display') != 'none') {
                $('#player_pause').click();
            }
        }, 1000);

        //播放完成检测
        setInterval(function () {
            var now = time_to_sec($('#screen_player_time_1').text());
            var total = time_to_sec($('#screen_player_time_2').text());
            if (now > 0 && total > 0 && (now / total) > 0.98) {
                window.parent.isEnd = true;
            }
        }, 3000);

    }

    if (window.location.pathname == '/learnspace/course/test/coursewareTest_getTestInfo.action') {
        console.log('进入做题首页');
        $(".record_submit_redo.btnBlue").click()
    }
    if (window.location.pathname == '/learnspace/course/test/coursewareTest_intoTestPage.action' || window.location.pathname == '/learnspace/course/test/coursewareTest_intoRedoTestPage.action') {
        console.log('开始做题');
        top.paperHasOtherForm = false
        top.paperfailCount = top.paperfailCount || 0
        let answer = []
        top.storeAnswer = top.storeAnswer || { greatAnswer: {}, nowAnswer: {} }
        if (top.paperfailCount === 11) {
            $(".test_item").toArray().forEach((c,i)=>{
                let title = $(c).find('.test_item_tit').contents().filter(function () { return this.nodeType === 3; }).text().trim().replace(/^\d\s.\s/,'')
                let greatA = top.storeAnswer.greatAnswer.answer.find(d=>d.title===title)
                if(greatA){//直接使用最优答案
                    let radio = $(c).find("input[type='radio']:eq(" + greatA.aIndex + ")")
                    let checkbox = $(c).find("input[type='checkbox']:eq(" + greatA.aIndex + ")")
                    radio && radio.prop('checked', true)
                    checkbox && checkbox.prop('checked', true)
                }
            })
        } else {
            $(".test_item").toArray().forEach((c, i) => {
                let radios = $(c).find("input[type='radio']")
                let checkboxs = $(c).find("input[type='checkbox']")
                let textareas = $(c).find("textarea")
                let title = $(c).find('.test_item_tit').contents().filter(function () { return this.nodeType === 3; }).text().trim().replace(/^\d\s.\s/,'')
                let randomIndex = null
                if (radios.length > 0) {
                    randomIndex = getRandomInt(0, radios.length - 1)
                    radios.eq(randomIndex).prop('checked', true)
                }
                if (checkboxs.length > 0) {
                    top.paperHasOtherForm = true
                    randomIndex = getRandomInt(0, checkboxs.length - 1)
                    checkboxs.eq(randomIndex).prop('checked', true)
                }
                if (textareas.length > 0) {
                    top.paperHasOtherForm = true
                    textareas.toArray().forEach((d, j) => {
                        $(d).prop('value', j)
                    })
                }
                answer.push({ title: title,aIndex: randomIndex })
            })
            top.storeAnswer.nowAnswer = { answer: answer, score: 0 }
        }
        $('.bank_btn.btnBlue').click()//提交
    }
    if (window.location.pathname == '/learnspace/course/test/coursewareTest_handSubmitPaperToResult.action') {
        let _score = parseInt($(".record_num_this").text())
        top.storeAnswer.nowAnswer.score = _score//记录当前回答的答案
        if (!top.paperHasOtherForm && _score === '100') {
            top.storeAnswer.greatAnswer = top.storeAnswer.nowAnswer//100就是最好的答案
            console.success(JSON.stringify(top.storeAnswer.greatAnswer));
            console.log('都做对了，提交试卷');
            $(".comf_score").click()
            $(".messager-popConfirm").click()
        } else if (!top.paperHasOtherForm && top.paperfailCount < 10) {
            if (!top.storeAnswer.greatAnswer.score || top.storeAnswer.nowAnswer.score > top.storeAnswer.greatAnswer.score) {
                top.storeAnswer.greatAnswer = top.storeAnswer.nowAnswer//记录每次最好的答案
            }
            console.log('没有全对，重新做');
            top.paperfailCount++//记录错误次数
            //记录本次答案
            setTimeout(() => {
                $(".record_submit_redo.btnBlue").click()//1秒后重新做
            }, 1000)
        } else {//超过重试次数
            if (top.paperfailCount === 10) {//再做一次
                top.paperfailCount++
                setTimeout(() => {
                    $(".record_submit_redo.btnBlue").click()//前10次都做不对，则第11次使用最优答案进行重做
                }, 1000)
            } else {//不再做了
                console.log('无法全对，直接提交');
                $(".comf_score").click()
                $(".messager-popConfirm").click()
            }
        }
    }
    if (window.location.pathname == '/learnspace/course/test/coursewareTest_intoTestAnswerPage.action') {//题目结算页面
        top.paperfailCount = 0
        top.isTestStart = false
        top.storeAnswer = { greatAnswer: {}, nowAnswer: {} }
    }

    function time_to_sec(time) {
        var s = '';
        var hour = 0;
        var min = 0;
        var sec = 0;
        if (time.split(':').length == 1) {
            sec = time.split(':')[0];
        }
        if (time.split(':').length == 2) {
            min = time.split(':')[0];
            sec = time.split(':')[1];
        }
        if (time.split(':').length == 3) {
            hour = time.split(':')[0];
            min = time.split(':')[1];
            sec = time.split(':')[2];
        }

        s = Number(hour * 3600) + Number(min * 60) + Number(sec);

        return s;
    };
    function getRandomInt(min, max) {
        // 确保参数为整数
        min = Math.ceil(min);
        max = Math.floor(max);
        // 生成随机整数
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
})();