/**
 * itable表格控件
 * 作者：Meter
 * 邮箱：xhgainxq@gmail.com
 * 说明：这个控件简单易用
 */
(function ($) {
    /**
     * 初始化控件itable
     * @param options 初始化参数
     */
    $.fn.isaacTable = function (options) {
        var res = [];//返回表格对象
        //设置默认值
        var _options = {
            checkBox: true, //是否显示复选框
            rowNumber: true, //是否显示编号
            isPagination: true, //是否显示分页
            type: "post",//ajax请求类型
            dataType: "json",//返回数据类型
            pageList: [5, 10, 15, 20],//显示条数下拉框
            param: { page: 1, rp: 5 }, //默认分页对象
            textAlign: 'left', //默认文字水平排列方式
            isCheckNull: true, //检查空值
            selectOnCheck: true, //选中数据同时选中复选框
            multipleSelect: true, //是否可以多个选择
            cellResize: true//是否可以拖拉单元格
        };
        //赋值
        _options=$.extend(_options,options);
        this.each(function (i, d) {
            res.push(inititable(i, d, _options));
        });
        return res.length>1?res:res[0];
        //初始化itable
        function inititable(i, selector, options) {
            var _this=this;
            var tableKey = "isaacTable_",//表格标识
                baseToolbarkey = "baseToolbar_",
                basefooterKey = "basefooter_",//表格底部footerbar标识
                footerInfoKey = "footerInfo_",//表格底部footerbar内分页信息标识
                selectionKey = "selection_",//表格底部footerbar内下拉框标识
                refreshKey = "refresh_",//表格底部footerbar内刷新按钮标识
                paginationKey = "pagination_";//表格底部footerbar内分页标识
            //Id复制
            var nojTableId = tableKey + i;
            options.baseToolbarId=tableKey + baseToolbarkey + i;
            options.basefooterId = tableKey + basefooterKey + i;
            options.footerInfoId = tableKey + footerInfoKey + i;
            options.selectionId = tableKey + selectionKey + i;
            options.refreshId = tableKey + refreshKey + i;
            options.paginationId = tableKey + paginationKey + i;
            //table加上底部
            if(options.isPagination){
                $("#"+options.basefooterId).remove();
                $(selector).after(
                    "<div id='" + options.basefooterId + "' class='isaac_page'>" +
                    "<div id='" + options.footerInfoId + "'></div>" +
                    "<div id='" + options.selectionId + "' class='isaac_page_left isaac_selection'></div>"+
                    "<div id='" + options.refreshId +"' class='isaac_refresh' title='刷新'></div>"+
                    "<div id='" +options.paginationId+"' class='isaac_pagination'></div>" +
                    "</div>");
            }
            if ($(selector).width() > 0) {
                $("#"+options.basefooterId).outerWidth($(selector).width());
            }
            //加载toolbar
            loadToolbar(options.toolbar);
            loadTableHeader();
            loadData();
            //获取表对象属性
            this.getOptions = function () {
                return options;
            }
            //返回选中的值集合
            this.getSelection = function () {
                var selectValue = new Array();
                $(selector).find("input[name='isaac_chk']").each(function (i, n) {
                    if (n.checked) {
                        selectValue.push(n.value);
                    }
                });
                return selectValue;
            };
            //当前页刷新数据
            this.reLoad = function () {
                loadData();
            };
            //加载第一页数据
            this.loadFirst = function () {
                options.param.page = 1;
                loadData();
            };
            //加载某一页数据
            this.loadDataPage = function (page,rp) {
                options.param.page = page;
                options.param.rp=rp||options.param.rp;
                loadData();
            };
            //加载数据，生成表，或者其他神马
            function loadData() {
                if (options.data != null) {
                    $(selector).empty();
                    $("#" + options.footerInfoId).empty();
                    $("#" + options.selectionId).empty();
                    $("#" + options.paginationId).empty();
                    if (options.ajaxSuccess) {
                        options.ajaxSuccess(options.data);
                    } else {
                        priveTable(options.data);
                    }
                    if (options.isPagination) {
                        loadPageList();
                        loadFooter(options.data);
                        loadPagination(options.data);
                    }
                    if (options.loadSuccess) {
                        options.loadSuccess(options.data);
                    }
                } else {
                    $.ajax({
                        url: options.url,
                        type: options.type,
                        dataType: options.dataType,
                        data: options.param,
                        beforeSend: function () {
                            //给table加上样式
                            $(selector).addClass("isaac_table").attr("style", "width: 100%");
                            $(selector).html("<tr><td><div class='loadDiv'><div class='loading'></div> 正在加载......</div></td></tr>");
                        },
                        success: function (data) {
                            $(selector).empty();
                            $("#" + options.footerInfoId).empty();
                            $("#" + options.selectionId).empty();
                            $("#" + options.paginationId).empty();
                            if (options.ajaxSuccess) {
                                options.ajaxSuccess(data);
                            } else {
                                priveTable(data);
                            }
                            if (options.isPagination) {
                                loadFooter(data);
                                loadPageList();
                                loadPagination(data);
                            }
                            if (options.loadSuccess) {
                                options.loadSuccess(data);
                            }
                        }
                    });
                }

            };
            //生成表
            function priveTable(data) {
                var th = "";
                var tr = "";
                if (options.rowNumber) {//是否显示编号
                    th += "<th class='isaac_number'></th>";
                }
                if (options.checkBox) {//是否显示复选框
                    th += "<th style='width:15px;'><input type='checkbox' class='isaac_chk isaac_chk_all' id='" + nojTableId + "_chkAll'/></th>";//添加单选框
                }
                for (var i = 1; i < options.columns[0].length; i++) {
                    if (options.columns[0][i].width)
                        th += "<th class='isaac_table_th' style='width:" + options.columns[0][i].width + "'><div class='isaac_table_cell'>" + options.columns[0][i].title + "</div></th>";//创建标题
                    else {
                        th += "<th class='isaac_table_th' ><div class='isaac_table_cell'>" + options.columns[0][i].title + "</div></th>";//创建标题
                    }
                }
                for (var j = 0; j < data.rows.length; j++) {
                    var td = "";
                    var numbert = parseInt((options.param.page - 1) * options.param.rp + j);//数据编号,从0开始
                    if (options.rowNumber)
                        td += "<td class='isaac_td_number'>" + (numbert + 1) + "</td>";
                    if (options.checkBox)
                        td += "<td class='t_one'><input type='checkbox' class='isaac_chk' id=" + nojTableId + "_chk_" + j + " name='isaac_chk' value=\"" + data.rows[j][options.columns[0][0].field] + "\"/></td>";
                    for (var k = 1; k < options.columns[0].length; k++) {
                        if (options.columns[0][k].formatter)
                            td += "<td>" + options.columns[0][k].formatter(data.rows[j][options.columns[0][k].field], numbert, data.rows[j]) + "</td>";
                        else {
                            if (options.isCheckNull) {
                                td += "<td>" + checkNull(data.rows[j][options.columns[0][k].field]) + "</td>";
                            } else {
                                td += "<td>" + data.rows[j][options.columns[0][k].field] + "</td>";
                            }
                        }
                    }
                    tr += "<tr>" + td + "</tr>";
                }
                $(selector).addClass("isaac_table").append("<thead><tr>" + th + "</tr></thead>" + tr);
                switch (options.textAlign) {
                    case "center":
                        $(selector).find("th:not(.t_one),td:not(.t_one)").css("text-align", 'center');
                        break;
                    default:
                        $(selector).find("th:not(.t_one),td:not(.t_one)").css("text-align", 'left');
                        break;
                }
                initSelectOnCheck();
                initChkAll();
                initCellResize();
            }

            //加载底部信息栏
            function loadFooter(data) {
                //加载左下角
                $("#" + options.footerInfoId).addClass("isaac_page_left");
                var one = (data.total == 0) ? 0 : (options.param.page - 1) * options.param.rp + 1;
                var two = options.param.page * options.param.rp <= data.total ? options.param.page * options.param.rp : data.total;
                $("#" + options.footerInfoId).append("<div class='page-txt'>第" + one + "-" + two + "条  /  共" + data.total + "条数据</div>");
            };

            //加载每页显示页数
            function loadPageList() {
                if (options.pageList && options.pageList.length > 0) {
                    var select = "<select class='isaac_selection_select'>";
                    for (var i = 0; i < options.pageList.length; i++) {
                        if(options.pageList[i]==options.param.rp){
                            select += "<option value='" + options.pageList[i] + "' selected='selected'>每页" + options.pageList[i] + "条</option>";
                        }else{
                            select += "<option value='" + options.pageList[i] + "'>每页" + options.pageList[i] + "条</option>";
                        }

                    }
                    select += "</select>";
                    $("#" +  options.selectionId).append(select);
                }
                $("#" + options.refreshId).click(function () {
                    _this.reLoad();
                });
                $("#" + options.selectionId).children("select").change(function () {
                    options.param.page = 1;
                    options.param.rp = this.value;
                    _this.reLoad();
                });
            }
            //加载分页
            function loadPagination(data) {
                //加载页数
                var pages = 0;//总页数
                if (data.total % options.param.rp == 0) {//可整除
                    pages = data.total / options.param.rp;
                } else {//不可整除
                    pages = parseInt(data.total / options.param.rp) + 1;
                }
                var li = "";
                if (options.param.page > 1) {
                    li += "<li><a data-page='first'>最前页</a></li><li><a data-page='previous'>上一页</a></li>";
                }
                switch (pages) {
                    case 0:
                        li += ""; break;
                    case 1:
                        li += "<li><a data-page='1'>" + 1 + "</a></li>"; break;
                    case 2:
                        li += "<li><a data-page='1'>" + 1 + "</a></li>" + "<li><a data-page='2'>" + 2 + "</a></li>"; break;
                    case 3:
                        li += "<li><a data-page='1'>" + 1 + "</a></li>" + "<li><a data-page='2'>" + 2 + "</a></li>" + "<li><a data-page='3'>" + 3 + "</a></li>"; break;
                    default:
                        if (options.param.page <= 3) {
                            for (var n = 1; n <= (options.param.page + 3 > pages ? pages : options.param.page + 3); n++) {
                                if (n == options.param.page)
                                    li += "<li class='isaac_pagination_active'><a>" + n + "</a></li>";
                                else
                                    li += "<li><a data data-page='"+n+"'>" + n + "</a></li>";
                            }
                        } else {
                            for (var m = options.param.page - 3; m <= (options.param.page + 3 > pages ? pages : options.param.page + 3); m++) {
                                if (m == options.param.page)
                                    li += "<li class='isaac_pagination_active'><a data-page='"+m+"'>" + m + "</a></li>";
                                else
                                    li += "<li><a data-page='"+m+"'>" + m + "</a></li>";
                            }
                        }
                }


                if (options.param.page < pages) {
                    li += "<li><a data-page='next'>下一页</a></li><li><a data-page='last'>最末页</a></li>";
                }
                $("#" + options.paginationId).append("<ul class='isaac_page_right'>"+li+"</ul>");
                $("#" + options.paginationId + " li").each(function (l) {
                    $(this).css("cursor", "pointer");
                    $(this).click(function () {
                        var gotoPage = 0;
                        switch ($(this).children('a').data('page')) {
                            case "first":
                                gotoPage = 1;
                                break;
                            case "previous":
                                gotoPage = options.param.page - 1;
                                break;
                            case "last":
                                gotoPage = pages;
                                break;
                            case "next":
                                gotoPage = options.param.page + 1;
                                break;
                            default:
                                gotoPage = parseInt(this.innerText);
                        }
                        _this.loadDataPage(gotoPage);

                    });
                });
                $("#" + options.paginationId + " li:first").addClass("isaac_li_first");
                $("#" + options.paginationId + " li:last").addClass("isaac_li_last");
                $("#" + options.paginationId + " li:contains(" + (options.param.page) + ")").addClass("isaac_pagination_active");
            };

            //加载表头
            function loadTableHeader() {
                if (options.tableHeader != null) {
                    var tableHeader= "</div><div id=" + nojTableId + "_tableHeader>"+options.tableHeader+"</div>"
                    $(selector).before(tableHeader);
                }
            }

            //加载toolbar
            function loadToolbar(data) {
                if (data != null && data.length >= 1) {
                    var toobar = "<div id='" + options.baseToolbarId + "' class='isaac_operate'>";
                    for (var i = 0; i < data.length; i++) {
                        toobar += " <a href='javascript:void(0);' id='" + options.baseToolbarId + "_" + data[i].key + "' ><i class='icon " + data[i].icon + "'></i>" + data[i].text + "</a>";
                    }
                    $(selector).before(toobar);

                    $(data).each(function (j, n) {
                        $("a[id='" + options.baseToolbarId + "_" + n.key + "']").click(function () {
                            n.handler();
                        });
                    });
                }
            }
            //初始化选中数据同时选中复选框功能
            function initSelectOnCheck() {
                if (options.selectOnCheck) {
                    if (options.checkBox) {
                        if (options.multipleSelect) {
                            $(selector).children("tbody").children("tr").each(function (i, n) {
                                $(n).find("td:not(.t_one)").click(function () {
                                    var chk = $("#" + nojTableId + "_chk_" + i)[0];
                                    if (chk.checked) {
                                        chk.checked = false;
                                    } else {
                                        chk.checked = true;
                                    }

                                });
                            });
                        } else {
                            $(selector).children("tbody").children("tr").each(function (i, n) {
                                $(n).find("td:not(.t_one)").click(function () {
                                    $(selector).find(".isaac_chk").prop("checked", false);
                                    var chk = $("#" + nojTableId + "_chk_" + i)[0];
                                    if (chk.checked) {
                                        chk.checked = false;
                                    } else {
                                        chk.checked = true;
                                    }

                                });
                            });
                        }

                    }
                }
            }
            //初始化全选功能
            function initChkAll() {
                $(selector).find(".isaac_chk_all").click(function () {
                    if (this.checked == true) {
                        $(selector).find(".isaac_chk").prop("checked", true);
                    } else {
                        $(selector).find(".isaac_chk").prop("checked", false);
                    }
                });


            };
            //初始化拖拉列宽
            function initCellResize() {
                if (options.cellResize) {
                    var oldWidth = 0;
                    var oldPointX = 0;
                    var tdPaddingLeft = 0;
                    var tdBorderLeft = 0;
                    var isResize = false;
                    $(selector).find(".isaac_table_cell").mousemove(function (ev) {//单元格鼠标移动
                        var e = ev;
                        oldWidth = this.offsetWidth;
                        if ((computePx(this) + oldWidth) - e.clientX <= 3 && (computePx(this) + oldWidth) > e.clientX) {
                            $(this).attr("style", "cursor:e-resize");
                            oldPointX = e.clientX;
                            isResize = true;
                            tdPaddingLeft = this.offsetLeft;
                            tdBorderLeft = this.offsetParent.clientLeft;
                        } else {
                            $(this).removeAttr("style");
                            isResize = false;
                        }

                    });
                    $(selector).find(".isaac_table_cell").mousedown(function (ev) {//单元格鼠标按下
                        if (isResize) {
                            var ft = this;
                            var width = $(selector)[0].offsetWidth;
                            var height = $(selector)[0].offsetHeight;
                            var top = computePy($(selector)[0]);
                            var left = computePx($(selector)[0]);
                            var div = "<div class='isaac_layout' style='width:" + width + "px;height:" + height + "px;top:" + top + "px;left:" + left + "px'>" +
                                "<div class='isaac_verticalLine' style='left:" + (oldPointX - left + 5) + "px'><div class='isaac_lineContent'>左右拖动</div></div></div>";
                            $(this).after(div);
                            $(".isaac_layout").mousemove(function (ev2) {
                                if (isResize) {
                                    var e = ev2;
                                    $(".isaac_verticalLine").css("left", (e.clientX - left));
                                    var number = oldWidth - oldPointX + e.clientX - 2;

                                    if (number < 30) {
                                        number = "亲,列宽太小了[" + (number + tdPaddingLeft + tdBorderLeft) + "]";
                                        $(".isaac_lineContent").css("background-color", "#d60000");
                                        $(".isaac_verticalLine").css("border-left-color", "#d60000");
                                    }
                                    else {
                                        number = "宽度:" + (number + tdPaddingLeft + tdBorderLeft);
                                        $(".isaac_lineContent").css("background-color", "#006dcc");
                                        $(".isaac_verticalLine").css("border-left-color", "#006dcc");
                                    }
                                    $(".isaac_lineContent").text(number);
                                }

                            });
                            $(".isaac_layout").mouseup(function (ev2) {
                                var e = ev2;
                                isResize = false;
                                var number = oldWidth - oldPointX + e.clientX - 2;
                                if (number < 30)
                                    number = 29;
                                $(ft).parent().animate({ width: (number) }, 500);
                                $(selector).unbind("mousemove");

                                $(".isaac_layout").remove();
                            });
                        }



                    });
                    $(selector).find(".datagrid-cell").mouseup(function (ev) {//单元格鼠标弹起
                        isResize = false;
                    });
                }

            }
            return this;
        }

        function computePx(dmo) {
            var x = dmo.offsetLeft;
            while (true) {
                if (dmo.offsetParent) {
                    dmo = dmo.offsetParent;
                    x += dmo.offsetLeft;
                } else {
                    break;
                }
            }
            return x;
        }

        function computePy(dmo) {
            var x = dmo.offsetTop;
            while (true) {
                if (dmo.offsetParent) {
                    dmo = dmo.offsetParent;
                    x += dmo.offsetTop;
                } else {
                    break;
                }
            }
            return x;
        }

        function checkNull(value) {
            if (value == null || value == "underfind") {
                return "";
            } else {
                return value;
            }
        }
    }
})(jQuery);