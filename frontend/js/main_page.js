var USER_DATA;

$(document).ready(function() {
    getUserData();
    $('#popup_background').on('click', (e) => {
        if (e.target !== e.currentTarget) {
            return;
        }
        $('#popup_background').fadeOut(200);
    });
    if (!sessionStorage.firstVisit) {
        $('#update_info_content').show();
        $('#main_content').hide();
        sessionStorage.setItem('firstVisit', 'true');
    }
});

// получение данных о пользователе
function getUserData() {
    $.get( "/web_request?query=", function( data ) {
        USER_DATA = JSON.parse(data);
        createCompanyDropdownMenu();
    });
}

// создание выпадающего меню со списком компаний
function createCompanyDropdownMenu() {
    let companiesData = USER_DATA.org_list;
    for (company in companiesData) {
        let companyName = companiesData[company][0];
        let companyId = companiesData[company][1];
        li = $('<li>', {id: companyId, class: 'dropdown-menu-item', onclick: `showCurrentCompanyName('${companyName}', '${companyId}')`}).appendTo('#jq-dropdown-company-list .jq-dropdown-menu');
        $('<a>', {text: companyName}).appendTo(li);
    }
}

function showCurrentCompanyName(companyName, companyId) {
    $('.object-list-tree').empty();
    $('#current_company').text(companyName);
    setCookie('companyId', companyId);
    let popup = $('#popup_object_list');
    if (popup.attr('state') == 'open') {
        $('#popup_object_content').hide();
        popup.animate({ width: '0' }, 200, function() {
            popup.css({'display': 'none'});
            popup.attr('state', 'close');
        });
    }

}

function openCloseMainMenu () {
    if ($('#menu_change_state i').text() == 'arrow_forward') {
        $('.main-menu, #main_menu_content').outerWidth('220px');
        $('#body_content').outerWidth('calc(100% - 220px)');
        $('#menu_change_state i').text('arrow_back');
    }
    else {
        $('.main-menu, #main_menu_content').outerWidth('70px');
        $('#body_content').outerWidth('calc(100% - 70px)');
        $('#menu_change_state i').text('arrow_forward');
    }
}

function openPopupWindow(id) {
    $('.popup-window, .popup-fullscreen').hide();
    $(`#${id}, #popup_background`).fadeIn(200);
}

function closePopupWindow() {
    $('.popup-window, #popup_background').fadeOut(200);
}

function openCloseObjectList() {
    let popup = $('#popup_object_list');
    if (popup.attr('state') == 'close') {
        popup.css({'display': 'block'});
        if ( $('.object-list-tree').children().length == 0 ) createObjectsTree();
        popup.animate({ width: '35%' }, 200, function() {
            $('#popup_object_content').show();
            popup.attr('state', 'open');
        });
    }
    else if (popup.attr('state') == 'open') {
        $('#popup_object_content').hide();
        popup.animate({ width: '0' }, 200, function() {
            popup.css({'display': 'none'});
            popup.attr('state', 'close');
        });
    }
}

function createObjectsTree() {
    $.ajax({
        type: "POST",
        url: "/base_func",
        data: encodeURI("val_param=house_tree"),
        success: function (data) {
            var objectTree = JSON.parse(data);
            
            for (prop in objectTree) {
                li = $('<li>', {text: prop, class: 'parent-li'}).appendTo('.object-list-tree');
                parentUl = $('<ul>', {class: 'object-tree-ul hide'}).insertAfter(li);

                for (i = 0; i < objectTree[prop].length; i++) {
                    let apartData = objectTree[prop][i].split('&');
                    $('<li>', {class: 'object-tree-li',text: apartData[0], accid: apartData[1]}).appendTo(parentUl);
                }
            }

            $('.parent-li').click(function(event) {
                if ($(this).hasClass('active')) {
                    $(this).removeClass('active');
                }
                else {
                    $('.parent-li').removeClass('active');
                    $(this).addClass('active');
                }
                let currentTarget = $(this).text();
                let target = $(event.target).text();
                let ulChild = $(this).next();
                if (currentTarget == target) {
                    if (ulChild.hasClass('hide')) {
                        $('.object-tree-ul').removeClass('active').addClass('hide');
                        ulChild.removeClass('hide');
                        ulChild.removeClass('hide').addClass('active');
                    }
                    else if (ulChild.hasClass('active')) {
                        ulChild.removeClass('active').addClass('hide');                    
                    }
                }
            });

            $('#object_list_search_input').on('click', function() {
                $('.object-tree-ul.active').removeClass('active').addClass('hide');  
            });

            $('.object-tree-li').each(function() {
                $(this).click(function() {
                    if (sessionStorage.firstVisit) {
                        $('#update_info_content').hide();
                        $('#main_content').show();
                        sessionStorage.setItem('firstVisit', 'true');
                    }
                    $('#agreement_list_table, #owners_table').empty();
                    $('.jq-dropdown.dropdown-report').remove();
                    let apartNum = $(this).text();
                    let adress = $(this).parent().prev().text();
                    let accid =  $(this).attr('accid');
                    $.ajax({
                        type: "POST",
                        url: "/base_func",
                        data: encodeURI(`val_param=adr_info&val_param1=${accid}`),
                        success: function (data) {

                            dropdownNum = 1;

                            let dataObject = JSON.parse(data);
                            let agreenmentsData = dataObject[0];
                            for (prop in agreenmentsData) {
                                let propData = prop.split('&');
                                tr = $('<tr>', {'accid': propData[1], 'human_id': propData[2]}).appendTo('#agreement_list_table');
                                tdButton = $('<td>').appendTo(tr);
                                button = $('<button>', {'data-jq-dropdown': `#jq-dropdown-${dropdownNum}`, class: 'owner-document-list-btn'}).appendTo(tdButton);
                                buttonIcon = $('<i>', {class: 'material-icons', text: 'event_note'}).appendTo(button);
                                td = $('<td>', {text: propData[0]}).appendTo(tr);
                                
                                createDropdownMenu(dropdownNum, propData[1], propData[2]);
                                dropdownNum++;
                
                                for (i = 0; i < agreenmentsData[prop].length; i++) {
                                    $('<td>', {text: agreenmentsData[prop][i]}).appendTo(tr);
                                }
                            }

                            let ownersData = dataObject[1];
                            for (prop in ownersData) {
                                let propData = prop.split('&');
                                tr = $('<tr>', {'accid': propData[1], 'human_id': propData[2]}).appendTo('#owners_table');
                                tdButton = $('<td>').appendTo(tr);
                                button = $('<button>', {'data-jq-dropdown': `#jq-dropdown-${dropdownNum}`, class: 'owner-document-list-btn'}).appendTo(tdButton);
                                buttonIcon = $('<i>', {class: 'material-icons', text: 'event_note'}).appendTo(button);
                                td = $('<td>', {text: propData[0]}).appendTo(tr);

                                createDropdownMenu(dropdownNum, propData[1], propData[2]);
                                dropdownNum++;
                
                                for (i = 0; i < ownersData[prop].length; i++) {
                                    $('<td>', {text: ownersData[prop][i]}).appendTo(tr);
                                }
                            }

                            $('.dropdown-menu-item').each(function() {
                                $(this).click(function() {
                                    let repNum = $(this).attr('rep_num');
                                    let repName = $(this).text();
                                    let accid = $(this).parent().parent().attr('accid');
                                    let humanId = $(this).parent().parent().attr('humanid');

                                    if (repNum == '21' || repNum == '22') {
                                        let content = '<table id="rep_range_table"><tr><td>Дата начала</td><td><input type="text" id="start_date"></td></tr>' +
                                        '<tr><td>Дата конца</td><td><input type="text" id="final_date"></td></tr></table>' +
                                        '<div class="content-center"><div class="report-range-notification">По умолчанию будет выбран период с 01.01.2005 по 01.12.2015</div><button id="pep_range_btn" class="button-main">Выполнить</button></div>';
                                        formPopupNotFullscreen(repName, content);
                                        openPopupWindow('popup_not_fullscreen');

                                        $('#pep_range_btn').click(function() {
                                            let startDate = $('#start_date').val();
                                            let endDate = $('#final_date').val();
                                            sendReportRange(repName, repNum, accid, humanId, startDate, endDate);
                                        });

                                        $( "#start_date" ).datepicker({
                                            dateFormat: "mm.yy",
                                            changeMonth: true,
                                            changeYear: true,
                                            showButtonPanel: true,
                                            yearRange: '2005:2020',

                                            onClose: function(dateText, inst) { 
                                                $(this).datepicker('setDate', new Date(inst.selectedYear, inst.selectedMonth, 1));
                                            }
                                        });

                                        $( "#final_date" ).datepicker({
                                            dateFormat: "mm.yy",
                                            changeMonth: true,
                                            changeYear: true,
                                            showButtonPanel: true,
                                            yearRange: '2005:2020',

                                            onClose: function(dateText, inst) { 
                                                $(this).datepicker('setDate', new Date(inst.selectedYear, inst.selectedMonth, 1));
                                            }
                                        });
                                    }
                                    else {
                                        $.get(`/report?rep_num=${repNum}&accid=${accid}&humanid=${humanId}`, function (data) {
                                            $('#popup_report .popup-name-fullscreen').text(repName);
                                            $('#popup_report .popup-content').html(data);
                                            openPopupWindow('popup_report');
                                        });
                                    }
                                });
                            });
                        }
                    });

                    $('.object-tree-li').removeClass('active');
                    $(this).addClass('active');
                    $('#current_adress').text(`${adress} - ${apartNum}`);
                    let popup = $('#popup_object_list');
                    $('#popup_object_content').hide();
                    popup.animate({ width: '0' }, 200, function() {
                        popup.css({'display': 'none'});
                        popup.attr('state', 'close');
                    });
                });
            });
        }
    });
}

function objectListSearch() {
    let inputVal = $('#object_list_search_input').val();
    let reg = RegExp(inputVal, 'i');
    $('.parent-li').each(function() {
        let value = $(this).text();
        let isValid = reg.test(value);
        if (isValid) {
            $(this).show();
        }
        else {
            $(this).hide();
        }
    });
}

function createDropdownMenu(index, accid, humanid) {
    let menuHtml = `<div id="jq-dropdown-${index}" class="jq-dropdown dropdown-report jq-dropdown-tip" accid="${accid}" humanid="${humanid}">` +
        `<ul class="jq-dropdown-menu">` +
        `<li class="dropdown-menu-item" rep_num="1"><a href="#1">Форма 4</a></li>` +
        `<li class="dropdown-menu-item" rep_num="2"><a href="#2">Выписка из ФЛС</a></li>` +
        `<li class="dropdown-menu-item" rep_num="3"><a href="#3">Выписка из ФЛС без долга</a></li>` +
        `<li class="dropdown-menu-item" rep_num="4"><a href="#4">Тарифы</a></li>` +
        `<li class="dropdown-menu-item" rep_num="21"><a href="#5">Справка для суда</a></li>` +
        `<li class="dropdown-menu-item" rep_num="22"><a href="#6">Расшифровка задолженности</a></li>` +
        `</ul>` +
        `</div>`;
    $('body').append(menuHtml);
}

function formPopupNotFullscreen(header, content) {
    $('#popup_not_fullscreen .popup-name').text(header);
    $('#popup_not_fullscreen .popup-content').html(content);
}

function sendReportRange(repName, repNum, accid, humanId, startDate, endDate) {
    $.get(`/report?rep_num=${repNum}&accid=${accid}&humanid=${humanId}&dateb=${startDate}&datee=${endDate}`, function (data) {
        $('#popup_report .popup-name-fullscreen').text(repName);
        $('#popup_report .popup-content').html(data);
        openPopupWindow('popup_report');
    });
}

function printReport() {
    var printWindow = window.open('', 'PRINT');
    let printingContent = document.querySelector('#popup_report .popup-content').innerHTML;
    printWindow.document.write('<html><head><link href="/css/style_main_page.css" rel="stylesheet" type="text/css"><script src="/js/jquery-3.4.1.min.js"></script><script src="/js/print_report_page.js"></script>');
    printWindow.document.write('</head><body id="report_print">');
    printWindow.document.write(printingContent);
    printWindow.document.write('</body></html>');

    printWindow.document.close(); // necessary for IE >= 10
    printWindow.focus(); // necessary for IE >= 10*/
}

function logout() {
    if (confirm("Вы уверены, что хотите выйти?")) {
        sessionStorage.removeItem('firstVisit');
        location.assign('/');
    }
}

function openCloseInfo() {
    let info = $('#update_info_content');
    if (info.is(":hidden")) {
        $('#update_info_content').show();
        $('#main_content').hide();
    }
    else {
        $('#update_info_content').hide();
        $('#main_content').show();
    }
}

function openProfileTab(elem,tabId) {
    $('#profile_tabs .tab-button').removeClass('active');
    $(elem).addClass('active');
    $('.profile-tab-content').hide();
    $(`#${tabId}`).show();
}

function setCookie(name, value, options) {
    options = options || {};

    var expires = options.expires;

    if (typeof expires == "number" && expires) {
        var d = new Date();
        d.setTime(d.getTime() + expires * 1000);
        expires = options.expires = d;
    }
    if (expires && expires.toUTCString) {
        options.expires = expires.toUTCString();
    }

    value = encodeURIComponent(value);

    var updatedCookie = name + "=" + value;

    for (var propName in options) {
        updatedCookie += "; " + propName;
        var propValue = options[propName];
        if (propValue !== true) {
            updatedCookie += "=" + propValue;
        }
    }

    document.cookie = updatedCookie;
}

function getProjectTaskList(projectId) {
    $.get(`http://78.81.240.101:88/issues.json?project_id=${projectId}`, function (data) {
        console.log(data);
    });
}