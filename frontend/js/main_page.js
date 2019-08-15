var USER_DATA;

$(document).ready(function() {
    sessionStorage.setItem('printMode', 'off');
    getUserData();
    getProjectTaskList("web_deb");
    showCurrentCompany();
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

function showCurrentCompany() {
    let currentCompany = sessionStorage['currentCompany'];
    if(currentCompany) {
        $('#current_company').text(currentCompany);
    }
}

// создание выпадающего меню со списком компаний
function createCompanyDropdownMenu() {
    let companiesData = USER_DATA.orgList;
    for (company in companiesData) {
        let companyName = companiesData[company][0];
        let companyId = companiesData[company][1];
        li = $('<li>', {id: companyId, class: 'dropdown-menu-item', onclick: `chooseCompany('${companyName}', '${companyId}')`}).appendTo('#jq-dropdown-company-list .jq-dropdown-menu');
        $('<a>', {text: companyName}).appendTo(li);
    }
}

function chooseCompany(companyName, companyId) {
    $('.object-list-tree').empty();
    $('#current_company').text(companyName);
    $('#popup_control .popup-fullscreen-name').text('Управление ' + companyName);
    setCookie('companyId', companyId);
    sessionStorage.setItem('currentCompany', companyName);
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
        $('.main-menu, #main_menu_content').width('220px');
        $('#body_content, .popup-with-menu').width('calc(100% - 220px)');
        $('#menu_change_state i').text('arrow_back');

    }
    else {
        $('.main-menu, #main_menu_content').width('70px');
        $('#body_content, .popup-with-menu').width('calc(100% - 70px)');
        $('#menu_change_state i').text('arrow_forward');
    }
}

function openPopupWindow(id) {
    $('.popup-window, .popup-with-menu, .popup-fullscreen').hide();
    $(`#${id}, #popup_background`).fadeIn(200);
}

function closePopupWindow() {
    $('.popup-window, .popup-with-menu, #popup_background').fadeOut(200);
    $('#popup_report .popup-content').empty();
}

function openPopupWithMenu(popupId) {
    $('.popup-with-menu').hide();
    $(`#${popupId}`).show();
    let popup = $('#popup_object_list');
    if (popup.attr('state') == 'open') {
        $('#popup_object_content').hide();
        popup.animate({ width: '0' }, 200, function () {
            popup.css({ 'display': 'none' });
            popup.attr('state', 'close');
        });
    }
}

function openCloseObjectList() {
    $('.popup-with-menu').hide();
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
    createContentLoader('#object_list_tree');
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
            removeContentLoader('#object_list_tree', '.object-list-tree');
            $('#object_list_settings_left, #object_list_settings_right').show();

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
                $(this).on('click', function(e) {
                    if (getPrintMode()) {
                        let input = $(this).find('input');
                        if (e.target !== e.currentTarget) {
                            return;
                        }
                        if (!input.prop('checked')) {
                            input.prop('checked', true);
                        }
                        else {
                            input.prop('checked', false);
                        }
                    }
                    else {
                        if ($('#update_info_content').is(':visible')) {
                            $('#update_info_content').hide();
                            $('#main_content').show();
                        }

                        if ($('#main_content .header-icons').is(':hidden')) {
                            $('#main_content .header-icons').show();
                        }

                        $('#agreement_list_table, #owners_table').empty();
                        $('.jq-dropdown.dropdown-report').remove();
                        let apartNum = $(this).text();
                        let adress = $(this).parent().prev().text();
                        let accid =  $(this).attr('accid');
                        $('#add_owner_btn').attr('accid', accid);
                        $.ajax({
                            type: "POST",
                            url: "/base_func",
                            data: encodeURI(`val_param=adr_info&val_param1=${accid}`),
                            success: function (data) {
    
                                dropdownNum = 1;
    
                                let dataObject = JSON.parse(data);
                                let agreenmentsData = dataObject[0];
    
    
                                let currentCompanyId = getCookie('companyId');
                                companyKey = 'id' + currentCompanyId;
                                let companyReportsData = USER_DATA.reportsList;
                                let currentCompanyReportsArr = companyReportsData[companyKey];
    
                                for (prop in agreenmentsData) {
                                    let propData = prop.split('&');
                                    tr = $('<tr>', {'accid': propData[1], 'human_id': propData[2]}).appendTo('#agreement_list_table');
                                    tdButton = $('<td>').appendTo(tr);
                                    button = $('<button>', {'data-jq-dropdown': `#jq-dropdown-${dropdownNum}`, class: 'owner-document-list-btn'}).appendTo(tdButton);
                                    buttonIcon = $('<i>', {class: 'material-icons', text: 'event_note'}).appendTo(button);
                                    td = $('<td>', {text: propData[0]}).appendTo(tr);
                                    
                                    createDropdownMenu(dropdownNum, propData[1], propData[2], currentCompanyReportsArr);
                                    dropdownNum++;
                    
                                    for (i = 0; i < agreenmentsData[prop].length; i++) {
                                        $('<td>', {text: agreenmentsData[prop][i]}).appendTo(tr);
                                    }
                                }
    
                                let ownersData = dataObject[1];
                                for (prop in ownersData) {
                                    let propData = prop.split('&');
                                    tr = $('<tr>', {'accid': propData[1], 'human_id': propData[2]}).append(
                                        $('<td>').append(
                                            $('<button>', {'data-jq-dropdown': `#jq-dropdown-${dropdownNum}`, class: 'owner-document-list-btn'}).append(
                                                $('<i>', {class: 'material-icons', text: 'event_note'})
                                            )
                                        ),
                                        $('<td>', {text: propData[0]})
                                    ).appendTo('#owners_table');

                                    for (i = 0; i < ownersData[prop].length; i++) {
                                        $('<td>', {text: ownersData[prop][i]}).appendTo(tr);
                                    }

                                    $('<td>', {text: ''}).append(
                                        $('<i>', {class: 'material-icons owner-edit-icon', text: 'edit', title: 'Редактировать'})
                                    ).appendTo(tr);
    
                                    createDropdownMenu(dropdownNum, propData[1], propData[2], currentCompanyReportsArr);
                                    dropdownNum++;
                                }
                                // editOwners();
                                // addNewOwner();

                                let objectInfoData = dataObject[2];
                                displayObjInfo(objectInfoData);
    
                                $('.dropdown-report .dropdown-menu-item').each(function() {
                                    $(this).click(function() {
                                        let repNum = $(this).attr('rep_num');
                                        let repName = $(this).attr('rep_name');
                                        let repType = $(this).attr('rep_type');
                                        let accid = $(this).parent().parent().attr('accid');
                                        let humanId = $(this).parent().parent().attr('humanid');
    
                                        if (repType == 'report') {
                                            let content = '<table id="rep_range_table"><tr><td>Дата начала</td><td><input type="text" id="start_date"></td></tr>' +
                                            '<tr><td>Дата конца</td><td><input type="text" id="final_date"></td></tr></table>' +
                                            '<div class="content-center"><div class="report-range-notification">По умолчанию будет выбран период с 01.01.2005 по 01.12.2015</div><button id="pep_range_btn" class="button-main">Выполнить</button></div>';
                                            formPopupNotFullscreen(repName, content);
                                            openPopupWindow('popup_not_fullscreen');
    
                                            $('#pep_range_btn').click(function() {
                                                let startDate = $('#start_date').val();
                                                let endDate = $('#final_date').val();
                                                sendReportRange(repName, repNum, repType, accid, humanId, startDate, endDate);
                                            });
    
                                            $( "#start_date, #final_date" ).datepicker({
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
                                            $.get(`/report?rnum=${repNum}&rtype=${repType}&accid=${accid}&humanid=${humanId}`, function (data) {
                                                $('#popup_report .popup-name-fullscreen').text(repName);
                                                $('#popup_report .popup-content').html(data);
                                                if (repNum == '2' || repNum == '3') {
                                                    $('#popup_report table').addClass('export-table-border');
                                                    createButtonToExport(createFileToExport);
                                                }
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
                    }
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

function createDropdownMenu(index, accid, humanid, reportsArr) {
    $('<div>', {id: `jq-dropdown-${index}`, class: 'jq-dropdown dropdown-report jq-dropdown-tip', accid: accid, humanid: humanid}).append(
        $('<ul>', {class: 'jq-dropdown-menu'})
    ).appendTo($('body'));
    for (report in reportsArr) {
        $('<li>', {class: 'dropdown-menu-item', rep_name:  reportsArr[report].repName, rep_num: reportsArr[report].repNum, rep_type: reportsArr[report].repType}).append(
            $('<a>', {text: reportsArr[report].repName})
        ).appendTo($(`#jq-dropdown-${index} ul`));
    }
}

function createDropdownMenuReportTree(index, reportsArr) {
    $('<div>', {id: `jq-dropdown-${index}`, class: 'jq-dropdown dropdown-report jq-dropdown-tip'}).append(
        $('<ul>', {class: 'jq-dropdown-menu'})
    ).appendTo($('body'));
    for (report in reportsArr) {
        $('<li>', {class: 'dropdown-menu-item', rep_name:  reportsArr[report].repName, rep_num: reportsArr[report].repNum, rep_type: reportsArr[report].repType}).append(
            $('<a>', {text: reportsArr[report].repName})
        ).appendTo($(`#jq-dropdown-${index} ul`));
    }
}

function formPopupNotFullscreen(header, content) {
    $('#popup_not_fullscreen .popup-name').text(header);
    $('#popup_not_fullscreen .popup-content').html(content);
}

function sendReportRange(repName, repNum, repType, accid, humanId, startDate, endDate) {
    $.get(`/report?rnum=${repNum}&rtype=${repType}&accid=${accid}&humanid=${humanId}&dateb=${startDate}&datee=${endDate}`, function (data) {
        $('#popup_report .popup-name-fullscreen').text(repName);
        $('#popup_report .popup-content').html(data);
        if (repNum == '21') {
            console.log($.parseHTML(data));
            createButtonToExport(createFileToExport);
        }
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
        sessionStorage.clear();
        deleteCookie('companyId');
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

function openTabs(tabsId, elem, tabId) {
    $(`#${tabsId} .tab-button`).removeClass('active');
    $(elem).addClass('active');
    $(`#${tabsId}_content .profile-tab-content`).hide();
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

function getCookie(name) {
    let matches = document.cookie.match(new RegExp(
        "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
    ));
    return matches ? decodeURIComponent(matches[1]) : undefined;
}

function deleteCookie(name) {
    setCookie(name, "", {
      'max-age': -1
    })
  }

function getProjectTaskList(projectId) {
    createContentLoader('#redmine_content .info-block-content');
    $.get(`/redmine?request=/issues.json?project_id=${projectId}`, function (data) {
        let taskList = JSON.parse(data);
        for (elem in taskList.issues) {
            let task = taskList.issues[elem];
            let id = task.id, tracker = task.tracker, name = task.subject, description = task.description, priority = task.priority, author = task.author;
            
            $('<table>', {id: `task_${id}`, class: 'task-table'}).append(
                $('<tr>').append(
                    $('<th>', {class: 'task-name', text: name, colspan: 3}),
                ),
                $('<tr>', {class: 'task-thead'}).append(
                    $('<th>', {text: 'Тип'}),
                    $('<th>', {text: 'Приоритет'}),
                    $('<th>', {text: 'Автор'})
                ),
                $('<tr>').append(
                    $('<td>', {text: tracker.name}),
                    $('<td>', {text: priority.name}),
                    $('<td>', {text: author.name})
                ),
                $('<tr>').append(
                    $('<td>', {class: 'task-description', text: description, colspan: 3}),
                )
            ).appendTo('#tasks_list');
        }
        removeContentLoader('#redmine_content .info-block-content', '#tasks_list');
    });
}

function createContentLoader(parentDivSelector) {
    $('<div>', {class: 'content-loading', parent_div: parentDivSelector}).append(
        $('<div>', {class: 'loading'}).append(
            $('<div>', {class: 'loading-circle'}),
            $('<div>', {class: 'loading-header', text: 'Загрузка...'})
        )
    ).appendTo($(parentDivSelector));
}

function removeContentLoader(parentDivSelector, contentDivSelector) {
    $(`[parent_div='${parentDivSelector}']`).remove();
    $(contentDivSelector).show();
}

function createButtonToExport(callback) {
    if (!$('button').is('#export_button')) {
        $('<button>', {id: 'export_button', text: 'Экспорт в XLSX'}).prependTo($('.popup-report-operation'));
    }
    callback();
}

function createFileToExport() {
    $('#export_button').off('click');
    $('#export_button').on('click', function() {
        let table = $('#table_to_export').tableExport({
            formats:["xlsx"],
            exportButtons: false,
            filename: `sprav_${getReportDateMark()}`,
            sheetname: 'sheetname'
        });
        console.log(table.getExportData());
        let exportData = table.getExportData()['table_to_export']['xlsx'];
        exportData.data.forEach(element => {
            // console.log(element);
            element.forEach(cell => {
                if (cell != null && cell.v !== '*ИП - Индивидуальное потребление.' && cell.v !== '*ОП - Общедомовое потребление.' && cell.v !== 'Представитель ООО "Центр взыскания долгов" по доверенности' && cell.v !== '/________________________/.') {
                    cell.s = {
                        border: {
                            top:	{ style: 'thin' },
                            bottom:	{ style: 'thin' },
                            left:	{ style: 'thin' },
                            right:	{ style: 'thin' }
                        }
                    };
                }
            console.log(cell);
            });
        })
        // console.log(exportData.data);
        table.export2file(exportData.data, exportData.mimeType, exportData.filename, exportData.fileExtension);
    });
}

function getReportDateMark() {
    let date = new Date();
    let currentDay = date.getDate().toString();
    let currentMonth = (date.getMonth() + 1).toString();
    let currentYear = date.getFullYear().toString();
    let currentHours = date.getHours().toString();
    if (currentHours < 10) {
        currentHours = `0${currentHours}`;
    }
    let currentMinutes = date.getMinutes().toString();
    if (currentMinutes < 10) {
        currentMinutes = `0${currentMinutes}`;
    }
    let currentSeconds = date.getSeconds().toString();
    if (currentSeconds < 10) {
        currentSeconds = `0${currentSeconds}`;
    }
    let currentDate = currentDay + currentMonth + currentYear + currentHours + currentMinutes + currentSeconds;

    return currentDate; 
}

function clearObjectSearchInput() {
    $('#object_list_search_input').val('');
    $('#object_list_search_input').focus();
    objectListSearch();
}

function switchToggle(toggleId) {
    let toggle = $(`#${toggleId}`);
    let state = toggle.attr('state');
    if (state == 'off') {
        $('.object-tree-li').removeClass('active');
        sessionStorage.setItem('printMode', 'on');

        toggle.text('toggle_on');
        toggle.attr('state', 'on');
        toggle.css({'color': 'green'});
        $('<button>', {id: 'objects_list_reports', class: 'object-tree-btn'}).append(
            $('<i>', { 'data-jq-dropdown': '#jq-dropdown-objects-list', class: 'material-icons object-search-icon', text: 'event_note'})
        ).prependTo($('#object_list_settings_right'));
        $('<div>', {id: 'print_mode_object_num'}).prependTo($('#object_list_settings_right'));
        $('#object_list_tree .parent-li').each(function() {
            $('<input>', {type: 'checkbox', class: 'object-tree-parent-li-input'}).prependTo($(this));
        });
        $('#object_list_tree .object-tree-li').each(function() {
            $('<input>', {type: 'checkbox', class: 'object-tree-apartament-input'}).prependTo($(this));
        });

        let currentCompanyId = getCookie('companyId');
        companyKey = 'id' + currentCompanyId;
        let companyReportsData = USER_DATA.reportsList;
        let currentCompanyReportsArr = companyReportsData[companyKey];
        createDropdownMenuReportTree('objects-list', currentCompanyReportsArr);

        $('#jq-dropdown-objects-list .dropdown-menu-item').each(function() {
            $(this).click(function() {
                let repNum = $(this).attr('rep_num');
                let repType = $(this).attr('rep_type');
                let accids = createAccidsArray().toString();

                createContentLoader('#popup_report .popup-content');
                openPopupWindow('popup_report');
                $.get(`/report?multi=true&rnum=${repNum}&rtype=${repType}&accid=${accids}&humanid=`, function (data) {
                    $('#popup_report .popup-name-fullscreen').text('');
                    $('#popup_report .popup-content').html(data);
                });
            });
        });

        $('.object-tree-parent-li-input').each(function() {
            $(this).on('click', function() {
                let childInputs = ($(this).parent().next().find('.object-tree-apartament-input'));
                if ($(this).prop('checked')) {
                    childInputs.prop('checked', true);
                }
                else {
                    childInputs.prop('checked', false);
                }
            });
        });
        showSelectedObjectNum();
    }
    else {
        sessionStorage.setItem('printMode', 'off');

        toggle.text('toggle_off');
        toggle.attr('state', 'off');
        toggle.css({'color': 'black'});
        $('#objects_list_reports, #jq-dropdown-objects-list, #print_mode_object_num').remove();
        $('.object-tree-apartament-input, .object-tree-parent-li-input').remove();
    }
}

function createAccidsArray() {
    let accidsArray = [];
    $('.object-tree-apartament-input').each(function() {
        if ($(this).prop('checked')) {
            let accid = $(this).parent().attr('accid');
            accidsArray.push(accid);
        }
    });
    return accidsArray;
}

function showSelectedObjectNum() {
    $('.object-tree-parent-li-input, .object-tree-apartament-input, .object-tree-li').each(function() {
        $(this).on('click', function() {
            let objectNum = $('.object-tree-apartament-input:checked').length;
            if (objectNum > 0) {
                $('#print_mode_object_num').text(`Выбрано: ${objectNum}`);
                $('#print_mode_object_num').css({'display': 'inline-block'});
            }
            else {
                $('#print_mode_object_num').hide();
            }
        });
    });
}

function getPrintMode() {
    let printMode = sessionStorage.getItem('printMode');
    if (printMode == 'on') return true;
    else return false;
}

function displayObjInfo(data) {
    $('#obj_info_content, #obj_info_notation').empty();
    for (prop in data) {
        $('#middle_content .header').text(`ЛС: ${prop.replace('ls','')}`);

        let infoData = data[prop];

        for (prop in infoData) {
            if (prop == 'Примечание из старой системы') {
                $('<div>').append(
                    $('<span>', {class: 'obj-info-key', text: `${prop}: `}),
                    $('<span>', {class: 'obj-info-value', text: infoData[prop]})
                ).appendTo($('#obj_info_notation'));
            }
            else {
                $('<div>', {class: 'obj-info-block'}).append(
                    $('<span>', {class: 'obj-info-key', text: `${prop}: `}),
                    $('<span>', {class: 'obj-info-value', text: infoData[prop]})
                ).appendTo($('#obj_info_content'));
            }
        }
    }
}

function editOwners() {
    $('.owner-edit-icon').on('click', function() {
        let ownerName = $(this).parent().prev().prev().text();
        let ownerBirthDate = $(this).parent().prev().text().split('.');
        $('#edit_owner_name').val(ownerName);
        $('#edit_owner_birth_date').val(`${ownerBirthDate[2]}-${ownerBirthDate[1]}-${ownerBirthDate[0]}`);
        openPopupWindow('popup_edit_owner');
    });
}

function addNewOwner() {
    $('#add_owner_btn').on('click', function() {
        event.preventDefault();
        let accid = $(this).attr('accid');
        let name = $('#add_owner_name').val();
        let birthDate = $('#add_owner_birth_date').val().split('-');
        let date = `${birthDate[2]}.${birthDate[1]}.${birthDate[0]}`;
        console.log(accid, name, date);
        $.get(`/base_func?val_param='addchg_human', val_param1=${accid}, val_param2=${name},  val_param3=${date}, val_param4='add', val_param5=0`, function (data) {
            console.log(data);
        });
    });
}