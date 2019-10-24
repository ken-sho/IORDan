var USER_DATA;
var OBJECT_DATA;
var DROPDOWN_NUM = 1; 
var CURRENT_OBJECT_DATA = {};

$(document).ready(function() {
    sessionStorage.setItem('printMode', 'off');
    getProjectTaskList("web_deb");
    getNewsList();
    showCurrentCompany();
    setInputRadio();
    $('.gifplayer').gifplayer({ label: '<i class="material-icons help-gif-icon">play_arrow</i>' });

    $('#popup_background').on('click', (e) => {
        if (e.target !== e.currentTarget) {
            return;
        }
        else {
            $('#popup_background').fadeOut(200);
        }
    });
    if (!sessionStorage.firstVisit) {
        getUserData([createCompanyDropdownMenu, getUpdateList]);
        $('#update_info_content').show();
        $('#main_content').hide();
        sessionStorage.setItem('firstVisit', 'true');
    }
    else {
        getUserData([createCompanyDropdownMenu, initializationPopupControl, getUpdateList]);
    }

    $('#add_contact_phone_number').inputmask("(999)999-99-99");

    $("#report_fast_access_start_date, #report_fast_access_end_date").datepicker({
        dateFormat: "mm.yy",
        changeMonth: true,
        changeYear: true,
        showButtonPanel: true,
        yearRange: '2005:2020',

        onClose: function (dateText, inst) {
            $(this).datepicker('setDate', new Date(inst.selectedYear, inst.selectedMonth, 1));
        }
    });

    $('#sub_search_input').focus((e) => {
        let valueLength = $('#sub_search_input').val().length;
        if (valueLength >= 3) { 
            $('#fast_search_menu').show();
        }
    })
});

// получение данных о пользователе
function getUserData(callback) {
    $.get( "/web_request?query=", function( data ) {
        USER_DATA = JSON.parse(data);

        if (!isEmpty(callback)) {
            for (func of callback) {
                func();
            }
        }
    });
}

function showCurrentCompany() {
    let currentCompany = sessionStorage['currentCompany'];
    if(currentCompany) {
        $('#current_company').text(currentCompany);
        $('#popup_control .popup-fullscreen-name').text('Управление ' + currentCompany);
    }
    else {
        $('.li-change-events').addClass('li-disabled');
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
    $('.li-change-events').removeClass('li-disabled');
    $('.object-list-tree').empty();
    $('#current_company').text(companyName);
    $('#popup_control .popup-fullscreen-name').text('Управление ' + companyName);
    setCookie('companyId', companyId);
    initializationPopupControl();
    sessionStorage.setItem('currentCompanyId', companyId);
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
    $('.popup-with-menu').each(function() {
        if ($(this).attr('id') !== 'popup_control') {
            $(this).hide();
        }
    });
    $('.popup-window, .popup-fullscreen').hide();
    $(`#${id}, #popup_background`).fadeIn(200);

    if (id == 'popup_search') {
        setOffsetFastSearchMenu();
    }
}

function closePopupWindow(popupId) {
    $(`#${popupId}, #popup_background`).fadeOut(200);
    $('#popup_report .popup-content').empty();
}

function openPopupWithMenu(popupId) {
    $('.popup-with-menu').hide();
    $(`#${popupId}`).fadeIn(200);
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
    $('.popup-with-menu').each(function() {
        if ($(this).attr('id') !== 'popup_control') {
            $(this).hide();
        }
    });
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
                    let li = $('<li>', {class: 'object-tree-li', text: apartData[0], accid: apartData[1]}).appendTo(parentUl);
                    if (apartData[2] !== 'white') {
                        li.css({'color' : apartData[2]});
                    }
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
                        let accid = $(this).attr('accid');
                        CURRENT_OBJECT_DATA.apartNum = $(this).text();
                        CURRENT_OBJECT_DATA.adress = $(this).parent().prev().text();
                        CURRENT_OBJECT_DATA.accid = accid;

                        getObjectData();

                        if ($('#update_info_content').is(':visible')) {
                            $('#update_info_content').hide();
                            $('#main_content').show();
                        }

                        if ($('#main_content .header-icons').is(':hidden')) {
                            $('#main_content .header-icons').show();
                        }

                        $('.jq-dropdown.dropdown-report').remove();                        

                        $('.object-tree-li').removeClass('active');
                        $(this).addClass('active');
                        $('#current_adress').text(`${CURRENT_OBJECT_DATA.adress} - ${CURRENT_OBJECT_DATA.apartNum}`);
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

function getObjectData() {
    $.ajax({
        type: "POST",
        url: "/base_func",
        data: encodeURI(`val_param=adr_info&val_param1=${CURRENT_OBJECT_DATA.accid}`),
        success: function (data) {
                        
            OBJECT_DATA = JSON.parse(data);

            getObjectAgreementsData();

            getObjectOwnersData();

            getObjectInfoData();

            getObjectContactsData();

            getObjectNotationsData();

            createMainCalendar();

            createSelectWithPeople('add_contact_select');

            clickDropdownMenu();
        }
    });
}

function refreshObjectData(callback) {
    $.ajax({
        type: "POST",
        url: "/base_func",
        data: encodeURI(`val_param=adr_info&val_param1=${CURRENT_OBJECT_DATA.accid}`),
        success: function (data) {
            OBJECT_DATA = JSON.parse(data);
            for (func of callback) {
                func();
            }
        }
    });
}

function clickDropdownMenu() {
    $('.dropdown-report .dropdown-menu-item').each(function () {
        $(this).click(function () {
            const repNum = $(this).attr('rep_num');
            const repName = $(this).attr('rep_name');
            const repType = $(this).attr('rep_type');
            const accid = $(this).parent().parent().attr('accid');
            const humanId = $(this).parent().parent().attr('humanid');

            const reportId = `${repType}_${repNum}`;
            setPrintNotation(reportId);



            if (repType == 'report') {
                let content = '<table id="rep_range_table"><tr><td>Дата начала</td><td><input type="text" id="start_date"></td></tr>' +
                    '<tr><td>Дата конца</td><td><input type="text" id="final_date"></td></tr></table>' +
                    '<div class="content-center"><div class="notification">По умолчанию будет выбран период с 01.01.2005 по 01.12.2015</div><button id="pep_range_btn" class="button-main">Выполнить</button></div>';
                formPopupNotFullscreen(repName, content);
                openPopupWindow('popup_not_fullscreen');

                $('#pep_range_btn').click(function () {
                    let startDate = $('#start_date').val();
                    let endDate = $('#final_date').val();
                    sendReportRange(repName, repNum, repType, accid, humanId, startDate, endDate);
                });

                $("#start_date, #final_date").datepicker({
                    dateFormat: "mm.yy",
                    changeMonth: true,
                    changeYear: true,
                    showButtonPanel: true,
                    yearRange: '2005:2020',

                    onClose: function (dateText, inst) {
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

function setPrintNotation(reportId) {
    let reportsList = getCurrentCompanyReportsArray();
    const printNotation = reportsList[reportId].print_notation;
    sessionStorage.setItem('printNotation', printNotation);
}

function getObjectAgreementsData() {

    $('#agreement_list_table').empty();

    let agreementsData = OBJECT_DATA[0];
    let agreementsPeopleArr = [];

    $('<tr>').append(
        $('<th>'),
        $('<th>', {text: 'ФИО'}),
        $('<th>', {text: 'Наименование договора'}),
    ).appendTo('#agreement_list_table');

    for (prop in agreementsData) {
        let propData = prop.split('&');
        tr = $('<tr>', { 'accid': propData[1], 'human_id': propData[2] }).appendTo('#agreement_list_table');
        tdButton = $('<td>').appendTo(tr);
        button = $('<button>', { 'data-jq-dropdown': `#jq-dropdown-${DROPDOWN_NUM}`, class: 'owner-document-list-btn' }).appendTo(tdButton);
        buttonIcon = $('<i>', { class: 'material-icons', text: 'event_note' }).appendTo(button);
        td = $('<td>', { text: propData[0] }).appendTo(tr);

        agreementsPeopleArr.push(`${propData[0]}&${propData[2]}`);

        createDropdownMenu(DROPDOWN_NUM, propData[1], propData[2], getCurrentCompanyReportsArray());
        DROPDOWN_NUM++;

        for (i = 0; i < agreementsData[prop].length; i++) {
            $('<td>', { text: agreementsData[prop][i] }).appendTo(tr);
        }
    }

    CURRENT_OBJECT_DATA.agreementsPeople = agreementsPeopleArr;

}

function getObjectOwnersData() {

    $('#owners_table, #add_agreement_owner_select').empty();

    let ownersData = OBJECT_DATA[1];
    let ownersPeopleArr = [];

    $('<tr>').append(
        $('<th>'),
        $('<th>', {text: 'ФИО'}),
        $('<th>', {text: 'Дата рождения'}),
        $('<th>', {text: 'Дата прописки'}),
        $('<th>', {text: 'Доп. инфо'}),
        $('<th>'),
    ).appendTo('#owners_table');

    for (prop in ownersData) {
        let propData = prop.split('&');
        tr = $('<tr>', { 'accid': propData[1], 'human_id': propData[2] }).append(
            $('<td>').append(
                $('<button>', { 'data-jq-dropdown': `#jq-dropdown-${DROPDOWN_NUM}`, class: 'owner-document-list-btn' }).append(
                    $('<i>', { class: 'material-icons', text: 'event_note' })
                )
            ),
            $('<td>', { text: propData[0] })
        ).appendTo('#owners_table');

        ownersPeopleArr.push(`${propData[0]}&${propData[2]}`);

        $('<option>', {text: propData[0], humanId: propData[2]}).appendTo('#add_agreement_owner_select');

        for (i = 0; i < ownersData[prop].length; i++) {
            if (i == 2) {
                let td =  $('<td>').appendTo(tr);
                let ownerInfoArray = ownersData[prop][i];
                if (ownerInfoArray[0] !== '') {
                    $('<i>', {class: 'material-icons owner-info-unsubdate', text: 'domain_disabled', title: `Дата выписки: ${ownerInfoArray[0]}`}).appendTo(td);
                }
                if (ownerInfoArray[1] !== '') {
                    $('<i>', {class: 'material-icons owner-info-birthplace', text: 'person_pin_circle', title: `Место рождения: ${ownerInfoArray[1]}`}).appendTo(td);
                }
            }
            else {
                $('<td>', { text: ownersData[prop][i] }).appendTo(tr);
            }
        }

        $('<td>', { text: '' }).append(
            $('<i>', { class: 'material-icons owner-edit-icon', humanId: propData[2], text: 'edit', title: 'Редактировать' })
        ).appendTo(tr);

        createDropdownMenu(DROPDOWN_NUM, propData[1], propData[2], getCurrentCompanyReportsArray());
        DROPDOWN_NUM++;
    }

    CURRENT_OBJECT_DATA.ownersPeople = ownersPeopleArr;
    clickIconEditOwner();
}

function getObjectInfoData() {

    let data = OBJECT_DATA[2];

    $('#obj_info_content, #obj_info_notation, #edit_object_info_table').empty();
    for (prop in data) {
        $('#middle_content .header').text(`ЛС: ${prop.replace('ls','')}`);
        $('#report_fast_access_ls').val(`${prop.replace('ls','')}`);

        let infoData = data[prop];

        for (prop in infoData) {
            if (prop == 'Примечание из старой системы') {
                $('<div>').append(
                    $('<span>', {class: 'obj-info-key', text: `${prop}: `}),
                    $('<span>', {class: 'obj-info-value', text: infoData[prop]})
                ).appendTo($('#obj_info_notation'));
            }
            else {
                if (prop == 'Образования задолженности') {
                    if (infoData[prop] !== '') CURRENT_OBJECT_DATA.debtDate = infoData[prop];

                    $('<tr>').append(
                        $('<td>', {text: prop, class: 'table-input-name'}),
                        $('<td>').append(
                            $('<input>', {currentValue: infoData[prop], value: RemakeDateFormatToInput(infoData[prop]), class: 'input-main', type: 'date'})
                        )
                    ).appendTo('#edit_object_info_table');
                }

                if (prop == '№ СП или № ИЛ') {
                    $('<tr>').append(
                        $('<td>', {text: prop, class: 'table-input-name'}),
                        $('<td>').append(
                            $('<input>', {currentValue: infoData[prop], value: infoData[prop], class: 'input-main', type: 'text'})
                        )
                    ).appendTo('#edit_object_info_table');
                }
                $('<div>', {class: 'obj-info-block'}).append(
                    $('<span>', {class: 'obj-info-key', text: `${prop}: `}),
                    $('<span>', {class: 'obj-info-value', text: infoData[prop]})
                ).appendTo($('#obj_info_content'));
            }
        }
    }
}

function getObjectContactsData() {
    $('#contacts_list, #edit_contact_select').empty();
    let contactsData = OBJECT_DATA[3];

    if (!isEmpty(contactsData)) {
        $('<table>', {id: 'object_contacts_table'}).append(
            $('<tr>').append(
                $('<th>', {text: 'Данные контакта'}),
                $('<th>', {text: 'Тип'}),
                $('<th>', {text: 'Контакт'})
            )
        ).appendTo('#contacts_list');
    }
    else {
        $('<div>', {class: 'notification', text: 'Контакты отсутствуют'}).appendTo('#contacts_list');
    }

    for (contact in contactsData) {
        let contactData = contact.split('&');
        let contactName = contactData[0];
        let contactId = contactData[1];
        let contactType = contactData[2];

        switch(contactType) {
            case 'cellphone':
                contactType = 'Мобильный';
                break;
            case 'phone':
                contactType = 'Стационарный';
                break;
            case 'email':
                contactType = 'Email';
                break;
        }

        $('<tr>').append(
            $('<td>', {text: contactName}),
            $('<td>', {text: contactType}),
            $('<td>', {text: contactsData[contact]})
        ).appendTo('#object_contacts_table');

        $('<option>', {text: `${contactName} - ${contactsData[contact]}`, contactId: contactId, 'type': contactType, 'fio': contactName, 'number': contactsData[contact]}).appendTo('#edit_contact_select');
    }

    changeEditContact();

}

function changeEditContact() {
    let contactType = $('#edit_contact_select option:selected').attr('type');

    switch(contactType) {
        case 'Мобильный':
            contactType = 'cellphone';
            break;
        case 'Стационарный':
            contactType = 'phone';
            break;
        case 'Email':
            contactType = 'email';
            break;
    }

    let contact = $('#edit_contact_select option:selected').attr('number');
    $(`#edit_contact_phone_type option[value=${contactType}]`).attr('selected', 'true');
    $('#edit_contact_phone_number').val(contact);
}

function  getObjectPeopleArr() {
    let agreementsPeople = CURRENT_OBJECT_DATA.agreementsPeople;
    let ownersPeople = CURRENT_OBJECT_DATA.ownersPeople;

    let peopleArr = agreementsPeople.concat(ownersPeople.filter(i=>agreementsPeople.indexOf(i)===-1));

    return peopleArr;
}

function getObjectNotationsData() {

    $('#notations_list').empty();

    let notationsData = OBJECT_DATA[4];

    if (!isEmpty(notationsData)) {
        for (elem in notationsData) {
            const notation = notationsData[elem];
            const id = elem;
            const value = notation.value;
            const author = notation.author;
            const creationTime = notation.creation_time;

            $('<div>', {id: id, class: 'notation-block'}).append(
                $('<div>', {class: 'notation-content', text: value}),
                $('<div>', {class: 'notation-creation-time', text: `Добавил: ${author} ${creationTime}`})
            ).appendTo('#notations_list');
        }
    }
    else {
        $('<div>', {class: 'notification', text: 'Примечания отсутствуют'}).appendTo('#notations_list');
    }
}

function addObjectNotation() {
    event.preventDefault();

    let value = $('#add_object_notation_input').val();
    let accid = CURRENT_OBJECT_DATA.accid;

    if (value !== '') {
        encodeURIstring = encodeURI(`/base_func?val_param=addchg_accnote&val_param1=${accid}&val_param2=add&val_param3=${value}`);
        $.post(encodeURIstring, function (data) {
            console.log(data);
            refreshObjectData([getObjectNotationsData]);
            // closePopupWindow();
            // refreshObjectData([getObjectOwnersData, clickDropdownMenu]);
            // $('#add_owner_name, #add_owner_birth_date').val('');
        });
    }
    else {
        $('#add_object_notation_input').fadeOut(100).fadeIn(100).fadeOut(100).fadeIn(100);
    }
}

function createSelectWithPeople(selectId) {
    $('#add_contact_select').empty();

    let peopleArr = getObjectPeopleArr();

    for (let person of peopleArr) {
        let splittedPerson = person.split('&');
        let personName = splittedPerson[0];
        let personId = splittedPerson[1];

        $('<option>', {text: personName, humanId: personId}).appendTo(`#${selectId}`);
    }
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
    for (elem in reportsArr) {
        const report = reportsArr[elem];
        $('<li>', {class: 'dropdown-menu-item', rep_name:  report.rep_name, rep_num: report.rep_num, rep_type: report.rep_type}).append(
            $('<a>', {text: report.rep_name})
        ).appendTo($(`#jq-dropdown-${index} ul`));
    }
}

function createDropdownMenuReportTree(index, reportsArr) {
    $('<div>', {id: `jq-dropdown-${index}`, class: 'jq-dropdown dropdown-report jq-dropdown-tip'}).append(
        $('<ul>', {class: 'jq-dropdown-menu'})
    ).appendTo($('body'));
    for (elem in reportsArr) {
        const report = reportsArr[elem];
        $('<li>', {class: 'dropdown-menu-item', rep_name:  report.rep_name, rep_num: report.rep_num, rep_type: report.rep_type}).append(
            $('<a>', {text: report.rep_name})
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
    $(`#${tabsId}_content .tab-content`).hide();
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
    $('#tasks_list').empty();
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
        let exportData = table.getExportData()['table_to_export']['xlsx'];
        exportData.data.forEach(element => {
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
            });
        })
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

        createDropdownMenuReportTree('objects-list', getCurrentCompanyReportsArray());

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

function clickIconEditOwner() {
    $('.owner-edit-icon').on('click', function() {
        let ownerName = $(this).parent().prevAll().eq(3).text();
        let ownerBirthDate = $(this).parent().prevAll().eq(2).text();
        let subDate = $(this).parent().prevAll().eq(1).text();
        let unsubDate = '';
        let birthPlace = '';
        if ($(this).parent().prev().find('.owner-info-unsubdate').length > 0) {
            unsubDate = $('.owner-info-unsubdate').attr('title').replace('Дата выписки: ', '');
        }
        if ($(this).parent().prev().find('.owner-info-birthplace').length > 0) {
            birthPlace = $('.owner-info-birthplace').attr('title').replace('Место рождения: ', '');
        }
        let humanId = $(this).attr('humanId');
        $('#edit_owner_btn').attr('humanId', humanId);
        $('#edit_owner_name').val(ownerName);
        $('#edit_owner_birth_date').val(RemakeDateFormatToInput(ownerBirthDate));
        $('#edit_owner_subscribe_date').val(RemakeDateFormatToInput(subDate));
        $('#edit_owner_unsubscribe_date').val(RemakeDateFormatToInput(unsubDate));
        $('#edit_owner_birth_place').val(birthPlace);
        openPopupWindow('popup_edit_owner');
    });
}

function editOwnerRequest() {
    event.preventDefault();
    let accid = CURRENT_OBJECT_DATA.accid;
    let name = $('#edit_owner_name').val();
    let date = $('#edit_owner_birth_date').val();
    let subDate = $('#edit_owner_subscribe_date').val();
    let unsubDate = $('#edit_owner_unsubscribe_date').val();
    let birthPlace = $('#edit_owner_birth_place').val();
    let humanId = $('#edit_owner_btn').attr('humanId');
    if (date !== '') {
        let birthDate = $('#edit_owner_birth_date').val().split('-');
        date = `${birthDate[2]}.${birthDate[1]}.${birthDate[0]}`;
    }
    if (subDate !== '') {
        let splittedDate = subDate.split('-');
        subDate = `${splittedDate[2]}.${splittedDate[1]}.${splittedDate[0]}`;
    }
    if (unsubDate !== '') {
        let splittedDate = unsubDate.split('-');
        unsubDate = `${splittedDate[2]}.${splittedDate[1]}.${splittedDate[0]}`;
    }
    if ($('#edit_owner_name').val() == '') {
        $('#edit_owner_name').attr('placeholder', 'Заполните поле');
        $('#edit_owner_name').fadeOut(100).fadeIn(100).fadeOut(100).fadeIn(100);
    }
    else {
        encodeURIstring = encodeURI(`/base_func?val_param=addchg_human&val_param1=${accid}&val_param2=${name}&val_param3=${date}&val_param4=chg&val_param5=${humanId}&val_param6=${subDate}&val_param7=${unsubDate}&val_param8=${birthPlace}`);
        $.post(encodeURIstring, function (data) {
            if (data == 'success') {
                closePopupWindow();
                refreshObjectData([getObjectOwnersData, clickDropdownMenu]);
            }
        });
    }
}

function addNewOwner() {
    event.preventDefault();
    let accid = CURRENT_OBJECT_DATA.accid;
    let name = $('#add_owner_name').val();
    let date = RemakeDateFormatFromInput($('#add_owner_birth_date').val());
    let subDate = RemakeDateFormatFromInput($('#add_owner_subscribe_date').val());
    let unsubDate = RemakeDateFormatFromInput($('#add_owner_unsubscribe_date').val());
    let birthPlace = $('#add_owner_birth_place').val();

    if ($('#add_owner_name').val() == '') {
        $('#add_owner_name').attr('placeholder', 'Заполните поле');
        $('#add_owner_name').fadeOut(100).fadeIn(100).fadeOut(100).fadeIn(100);
    }
    else {
        encodeURIstring = encodeURI(`/base_func?val_param=addchg_human&val_param1=${accid}&val_param2=${name}&val_param3=${date}&val_param4=add&val_param5=0&val_param6=${subDate}&val_param7=${unsubDate}&val_param8=${birthPlace}`);
        $.post(encodeURIstring, function (data) {
            if (data == 'success') {
                closePopupWindow();
                refreshObjectData([getObjectOwnersData, clickDropdownMenu]);
                $('#add_owner_name, #add_owner_birth_date').val('');
            }
        });
    }
}

function addNewAgreement() {
    event.preventDefault();
    let accid = CURRENT_OBJECT_DATA.accid;
    let owner = '';
    let birthDate = '';
    let humanId = $('#add_agreement_owner_select option:selected').attr('humanId');
    let agreementName = $('#add_agreement_name').val();
    let part = $('#add_agreement_part').val();
    if ($('input[name="owner"]:checked').val() == 'no') {
        owner = $('#add_agreement_fio').val();
        birthDate = $('#add_agreement_birth_date').val();
        if (birthDate !== '') {
            let splittedDate = birthDate.split('-');
            birthDate = `${splittedDate[2]}.${splittedDate[1]}.${splittedDate[0]}`;
        }
        humanId = '0';
    }
    let agreementDate = $('#add_agreement_date').val();
    if (agreementDate !== '') {
        let splittedDate = agreementDate.split('-');
        agreementDate = `${splittedDate[2]}.${splittedDate[1]}.${splittedDate[0]}`;
    }
    encodeURIstring = encodeURI(`/base_func?val_param=addchg_kvdocs&val_param1=${accid}&val_param2=${owner}&val_param3=${birthDate}&val_param4=add&val_param5=${agreementName}&val_param6=${agreementDate}&val_param7=${humanId}&val_param8=${part}`);
    $.post(encodeURIstring, function (data) {
        if (data == 'success') {
            closePopupWindow();
            refreshObjectData([getObjectAgreementsData]);
            $('#add_agreement_name, #add_agreement_date, #add_agreement_part, #add_agreement_fio, #add_agreement_birth_date').val('');
        }
    });
}

function editObjectInfo() {
    event.preventDefault();
    let accid = CURRENT_OBJECT_DATA.accid;

    let requestsNum = 0;

    $('#edit_object_info_table tr').each(function() {
        let paramName = $(this).find('.table-input-name').text();
        let currentValue = $(this).find('.input-main').attr('currentvalue');
        let newValue = $(this).find('.input-main').val();
        if ($(this).find('.input-main').attr('type') == 'date') {
            newValue = RemakeDateFormatFromInput(newValue);
        }

        if (newValue !== currentValue) {
            requestsNum++;
            encodeURIstring = encodeURI(`/base_func?val_param=chg_place_val&val_param1=${accid}&val_param2=${paramName}&val_param3=${newValue}`);
            $.post(encodeURIstring, function(data) {
            })
        }
    });

    if (requestsNum > 0) {
        closePopupWindow();
        refreshObjectData([getObjectInfoData]);
    }
    else {
        closePopupWindow();
    }

}

function addNewContact() {
    event.preventDefault();
    let accid = CURRENT_OBJECT_DATA.accid;
    let contactName, humanId;
    let number = $('#add_contact_phone_number').val();
    let contactType = $('#add_contact_phone_type').val();

    if ($('input[name="contact"]:checked').val() == 'no') {
        contactName = $('#add_contact_select').val();
        humanId = $('#add_contact_select option:selected').attr('humanid');

        if ($('#add_contact_phone_number').inputmask("isComplete")) {
            addContactRequest();
        }
        else {
            $('#add_contact_phone_number').attr('placeholder', 'Заполните поле');
            $('#add_contact_phone_number').fadeOut(100).fadeIn(100).fadeOut(100).fadeIn(100);
        }
    }
    else {
        contactName = $('#add_contact_name').val();
        humanId = 0;
        
        if ($('#add_contact_phone_number').inputmask("isComplete") && $('#add_contact_name').val() !== '') {
            addContactRequest();
        }
        else {
            if ($('#add_contact_name').val() == '') {
                $('#add_contact_name').attr('placeholder', 'Заполните поле');
                $('#add_contact_name').fadeOut(100).fadeIn(100).fadeOut(100).fadeIn(100);
            }

            if (!$('#add_contact_phone_number').inputmask("isComplete")) {
                $('#add_contact_phone_number').attr('placeholder', 'Заполните поле');
                $('#add_contact_phone_number').fadeOut(100).fadeIn(100).fadeOut(100).fadeIn(100);
            }
        }

    }

    function addContactRequest() {
        encodeURIstring = encodeURI(`/base_func?val_param=addchg_contact&val_param1=${accid}&val_param2=${contactName}&val_param3=${number}&val_param4=add&val_param5=${contactType}&val_param6=${humanId}&val_param7=0`);
        $.post(encodeURIstring, function (data) {
            if (data == 'success') {
                refreshObjectData([getObjectContactsData]);
                showSuccessMessage('Контакт успешно добавлен!', 'add_contact_btn');
            }
        });
    }
}

function editContact() {
    event.preventDefault();
    let accid = CURRENT_OBJECT_DATA.accid;
    let number = $('#edit_contact_phone_number').val();
    let contactId = $('#edit_contact_select option:selected').attr('contactid');
    let contactType = $('#add_contact_phone_type').val();

    if ($('#edit_contact_phone_number').val() == '') {
        $('#edit_contact_phone_number').attr('placeholder', 'Заполните поле');
        $('#edit_contact_phone_number').fadeOut(100).fadeIn(100).fadeOut(100).fadeIn(100);
    }
    else {
        editContactRequest();
    }

    function editContactRequest() {
        encodeURIstring = encodeURI(`/base_func?val_param=addchg_contact&val_param1=${accid}&val_param2=0&val_param3=${number}&val_param4=chg&val_param5=${contactType}&val_param6=0&val_param7=${contactId}`);
        $.post(encodeURIstring, function (data) {
            if (data == 'success') {
                refreshObjectData([getObjectContactsData]);
                showSuccessMessage('Контакт успешно сохранен!', 'edit_contact_btn');
            }
        });
    }
}

function addReport() {
    event.preventDefault();
    let reportArray = [];
    const validateinputsArray = [];

    $('#report_fast_access_reports_list input[type="checkbox"]').each(function() {
        if ($(this).prop('checked') == true) {
            let repNum = $(this).attr('rep_num');
            let repType = $(this).attr('rep_type');
            reportArray.push(`${repNum}|${repType}`);
        }
    });

    let ownType = $('#report_fast_access_own_select').val();
    let fioValue;

    if (ownType == 'one') {
        fioInput = $('#report_fast_access_fio');
        validateinputsArray.push(fioInput);
        fioValue = fioInput.val();
    }
    else if (ownType == 'together') {
        let fioArray = [];
        $('#report_fast_access_owners_list tr input[name="fio"]').each(function() {
            fioArray.push($(this).val());
            validateinputsArray.push($(this));
        });
        fioValue = fioArray;
    }
    else if (ownType == 'part') {
        let fioPartArray = [];
        $('#report_fast_access_owners_list tr').each(function() {
            let fio = $(this).find('input[name="fio"]').val();
            let part = $(this).find('input[name="part"]').val();
            let elemArray = `${fio} доля ${part}`;
            fioPartArray.push(elemArray);
            validateinputsArray.push($(this).find('input[name="fio"]'));
            validateinputsArray.push($(this).find('input[name="part"]'));
        });
        fioValue = fioPartArray;
    }

    let lsInput = $('#report_fast_access_ls');
    validateinputsArray.push(lsInput);
    const lsValue = lsInput.val();
    let repName = $('#report_fast_access_select option:selected').attr('rep_name');
    let repType = reportArray;
    let startDate = $('#report_fast_access_start_date').val();
    let endDate = $('#report_fast_access_end_date').val();

    if (validateFormInputs([validateinputsArray])) {
        let encodeURIstring = encodeURI(`/report?multi=${fioValue}&rtype=${repType}&rnum=0&accid=${lsValue}&humanid=&dateb=${startDate}&datee=${endDate}`);
        $.get(encodeURIstring, function (data) {
            $('#popup_report .popup-name-fullscreen').text(repName);
            $('#popup_report .popup-content').html(data);
            openPopupWindow('popup_report');
        });
    }
}

function addIssue() {
    event.preventDefault();

    const subjectInput = $('#add_issue_subject');
    const descriptionTextarea = $('#add_issue_description');

    const validateArray = [subjectInput, descriptionTextarea];

    const subject = subjectInput.val();
    const trackerId = $('#add_issue_tracker').val();
    const priorityId = $('#add_issue_priority').val();
    const description = descriptionTextarea.val();

    if (validateFormInputs([validateArray])) {
        const issue = {
            "issue": {
                "project_id": "web_deb",
                "subject": subject,
                "priority_id": priorityId,
                "tracker_id": trackerId,
                "description": description
            }
        };

        $.ajax({
            url: '/redmine?request=/issues.json?key=2f61a40033781606b1508aa4dc66568a50bdf7f0',
            type: 'POST',
            data: JSON.stringify(issue),
            contentType: 'application/json',
            success: function(data) {
                showSuccessMessage('Задача успешно добавлена!', 'add_task_btn');
                clearFormInputs([validateArray]);
                getProjectTaskList("web_deb");
            }
        });
    }
    
}

function addOwnerReportFastAccess() {
    event.preventDefault();
    let ownersNumber = $('#report_fast_access_owners_list tr').length;
    if (ownersNumber < 5) {
        $('<tr>', {id: `report_fast_access_owner_${ownersNumber}`}).append(
            $('<td>').append(
                $('<input>', {name: 'fio', type: 'text', class: 'input-main'})
            ),
            $('<td>', {class: 'add-report-part'}).append(
                $('<input>', {name: 'part', type: 'text', class: 'input-main add-report-part-input', placeholder: 'Доля'})
            )
        ).appendTo('#report_fast_access_owners_list');

        if (ownersNumber == 4) $('#fast_access_add_owner_btn').attr('disabled', true);
    }

    let ownType = $('#report_fast_access_own_select').val();

    if (ownType == 'together') {
        $('.add-report-part').hide();
    }
    else if (ownType == 'part') {
        $('.add-report-part').show();
    }
}

function createMainCalendar() {
    $("#main_calendar").datepicker({
        dateFormat: "mm.yy",
        changeMonth: true,
        changeYear: true,
        showButtonPanel: true,
        yearRange: '2005: +1',
    });

    if (CURRENT_OBJECT_DATA.debtDate) {
        let debtDate = CURRENT_OBJECT_DATA.debtDate.split('.');
        let debtDateMonth = debtDate[1];
        let debtDateYear = debtDate[2];
        $("#main_calendar").datepicker("setDate", new Date(debtDateYear, debtDateMonth - 1));
    }

    getMainTable();
    mainCalendarChangeDate();
}

function mainCalendarChangeDate() {
    $('#main_calendar .ui-datepicker-prev, #main_calendar .ui-datepicker-next, #main_calendar .ui-datepicker-current').click(function() {
        getMainTable();
        mainCalendarChangeDate();
    });

    $('#main_calendar .ui-datepicker-month, #main_calendar .ui-datepicker-year').change(function () {
        getMainTable();
        mainCalendarChangeDate();
    });
}

function getMainCalendarValue() {
    let month = +$('#main_calendar .ui-datepicker-month').val() + 1;
    if ( month < 10) month = `0${month}`;
    let year = $('#main_calendar .ui-datepicker-year').val();
    let calendarValue = `${month}.${year}`;
    return calendarValue;
}

function getMainTable() {
    let date = getMainCalendarValue();
    let accid = CURRENT_OBJECT_DATA.accid;

    $.post(`/base_func?val_param=account_history&val_param1=${accid}&val_param2=${date}`, function (data) {
        $('#bottom_content').html(data);
    });
}

// Задать обработчики для инпутов radio
function setInputRadio() {
    $('input[name=owner]').change(function() {
        if (this.value == 'yes') {
            $('.add-agreement-no-owner').hide();
            $('.add-agreement-owner').show();
        }
        else if (this.value == 'no') {
            $('.add-agreement-no-owner').show();
            $('.add-agreement-owner').hide();
        }
    });

    $('input[name=contact]').change(function() {
        if (this.value == 'yes') {
            $('.add-new-contact').hide();
            $('.add-contact').show();
        }
        else if (this.value == 'no') {
            $('.add-new-contact').show();
            $('.add-contact').hide();
        }
    });
}

// Переделать формат даты для инпута
function RemakeDateFormatToInput(date) {
    let splitedDate = date.split('.');
    let newDate = `${splitedDate[2]}-${splitedDate[1]}-${splitedDate[0]}`;
    return newDate;
}

// Переделать формат даты из инпута
function RemakeDateFormatFromInput(date) {
    if (date !== '') {
        let splittedDate = date.split('-');
        newDate = `${splittedDate[2]}.${splittedDate[1]}.${splittedDate[0]}`;
        return newDate;
    }
    else {
        return date;
    }
}

function changeContactType(selectId, inputId) {
    let selector = $(`#${selectId}`);
    $(`#${inputId}`).val('');
    switch(selector.val()) {
        case 'cellphone':
            $(`#${inputId}`).inputmask("(999)999-99-99");
            break;
        case 'phone':
            $(`#${inputId}`).inputmask("8 9999 999-999");
            break;
        case 'email':
            $(`#${inputId}`).inputmask({
                mask: "*{1,20}[.*{1,20}][.*{1,20}][.*{1,20}]@*{1,20}[.*{2,6}][.*{1,2}]",
                greedy: false,
                onBeforePaste: function (pastedValue, opts) {
                  pastedValue = pastedValue.toLowerCase();
                  return pastedValue.replace("mailto:", "");
                },
                definitions: {
                  '*': {
                    validator: "[0-9A-Za-z!#$%&'*+/=?^_`{|}~\-]",
                    casing: "lower"
                  }
                }
              });
            break;
    }
}

function isEmpty(obj) {
    for (let key in obj) {
        return false;
    }
    return true;
}

function showSuccessMessage(message, after) {
    if (!$(`#${after}`).next().hasClass('notification-success')) {
        let notification = $('<div>', {class: 'notification-success', text: message});
        $(`#${after}`).after(notification);

        function removeNotification() {
            notification.fadeOut(2000, () => {notification.remove()})
        }

        setTimeout(removeNotification, 3000);
    }
}

function showLoadingMessage(id, message, after) {
    if (!$(`#${after}`).next().hasClass('notification-loading')) {
        let loader = $('<div>', {class: 'loading-circle-small', style: 'float: left'});
        let notification = $('<div>', {id: `${id}`, class: 'notification-loading'}).append(
            $('<div>', {class: 'notification-loading-content'}).append(
                $('<div>', {class: 'notification-loading-icon'}).append(loader),
                $('<div>', {class: 'notification-loading-text', text: message})
            )
        );
        $(`#${after}`).after(notification);
    }
}

function removeLoadingMessage(id) {
    $(`#${id}`).remove();
}

function getCurrentCompanyReportsArray() {
    let currentCompanyId = getCookie('companyId');
    companyKey = 'id' + currentCompanyId;
    let companyReportsData = USER_DATA.reportsList;
    return companyReportsData[companyKey];
}

function fillSelectFromReportsArray(selectId, array) {
    for (report of array) {
        $('<option>', {text: report.rep_name, rep_name: report.rep_name, rep_num: report.rep_num, rep_type: report.rep_type}).appendTo($(`#${selectId}`));
    }
}

function fillSelectFromCompanyArray(selectId, array) {
    for (company of array) {
        $('<option>', {text: company[0], company_id: company[1]}).appendTo($(`#${selectId}`));
    }
}

function initializationPopupControl() {

    resizeTwoDiv('control_reports', `reports_list`, 'report_fast_access', '11');

    $('#report_fast_access_reports_list, #control_files_list .block-content, #report_settings_select_menu ul, #proccess_file_company_select').empty();
    let reportsArr = getCurrentCompanyReportsArray();
    
    for (elem in reportsArr) {
        const report = reportsArr[elem];
        $('<tr>').append(
            $('<td>').append(
                $('<input>', {type: 'checkbox', id: `report_fast_access_${report.rep_num}_${report.rep_type}`, rep_name: report.rep_name, rep_num: report.rep_num, rep_type: report.rep_type}),
                $('<label>', {for: `report_fast_access_${report.rep_num}_${report.rep_type}`, text: report.rep_name})
            )
        ).appendTo($('#report_fast_access_reports_list'));

        $('<li>', {rep_name: report.rep_name, rep_num: report.rep_num, rep_type: report.rep_type, print_notation: report.print_notation}).append(
            $('<a>').append(
                $('<span>', {text: report.rep_name})
            )
        ).appendTo('#report_settings_select_menu ul');
    }

    const reportsSettingsFirstreportLi = $('#report_settings_select_menu ul li:first-child');
    reportsSettingsFirstreportLi.addClass('active');
    const firstReportRepNum = reportsSettingsFirstreportLi.attr('rep_num');
    const firstReportRepType = reportsSettingsFirstreportLi.attr('rep_type');
    const firstReportNotation = reportsSettingsFirstreportLi.attr('print_notation');
    getReportPreview(firstReportRepNum, firstReportRepType);
    $('#print_notation_textarea').val(firstReportNotation.replace(/<br ?\/?>/g, '\n'));


    let companyArr = USER_DATA.orgList;
    fillSelectFromCompanyArray('proccess_file_company_select', companyArr);
    $('#files_upload_input').change(function() {
        $('#number_of_uploaded_files').text('Выбрано файлов: ' + $(this).prop('files').length);
    });

    $('#report_fast_access_own_select').change(function() {
        if ($(this).val() == 'one') {
            $('.report-fast-access-part-owners').hide();
            $('.report-fast-access-one-owner').show();
        }
        else if ($(this).val() == 'together') {
            $('.report-fast-access-part-owners').show();
            $('.report-fast-access-one-owner, .add-report-part').hide();
        }
        else if ($(this).val() == 'part') {
            $('.report-fast-access-part-owners, .add-report-part').show();
            $('.report-fast-access-one-owner').hide();
        }
    });

    getControlFilesList();
    changeTabControlReportSettings();
}

function changePrintNotation() {
    $('#print_notation_textarea').attr('disabled', false);
    $('#save_print_notation').show();
    $('#change_print_notation').hide();
}

function savePrintNotation() {
    const currentReportLi = $('#report_settings_select_menu ul li.active');
    $('#print_notation_textarea').attr('disabled', true);
    $('#save_print_notation').hide();
    $('#change_print_notation').show();

    let currentCompanyId = getCookie('companyId');
    let notationValue = $('#print_notation_textarea').val().replace(/\n/g, "<br>");
    let repNum = currentReportLi.attr('rep_num');
    let repType = currentReportLi.attr('rep_type');
    encodeURIstring = encodeURI(`/base_func?val_param=sprav_note_chg&val_param1=${currentCompanyId}&val_param2=${repType}&val_param3=${repNum}&val_param4=${notationValue}`);
    $.post(encodeURIstring, function (data) {
        if (data == 'success') {
            getUserData();
            showSuccessMessage('Примечание для печати успешно сохранено!', 'save_print_notation');
        }
    });
    
}

function getControlFilesList() {
    $.get('/filelist', function( data ) {
        let filesList = JSON.parse(data);

        let sortedfilesList = filesList.sort(function (a, b) {
            var dateA = new Date(a.creationTime), dateB = new Date(b.creationTime)
            return dateB - dateA //сортировка по убывающей дате
        })

        let table = $('<table>', {id: 'control_files_list_table'}).append(
            $('<tr>').append(
                $('<th>', {text: 'Имя файла'}),
                $('<th>', {text: 'Загружено'}),
                $('<th>', {text: 'Действия'})
            )
        );

        for (file of sortedfilesList) {
            let fileName = file.name;
            let date = new Date (file.creationTime);

            let day = date.getDate();
            if (day < 10) {
                day = `0${day}`;
            }

            let month = date.getMonth() + 1;
            if (month < 10) {
                month = `0${month}`;
            }

            let year = date.getFullYear();

            let hours = date.getHours();
            if (hours < 10) {
                hours = `0${hours}`;
            }

            let minutes = date.getMinutes();
            if (minutes < 10) {
                minutes = `0${minutes}`;
            }

            let seconds = date.getSeconds()
            if (seconds < 10) {
                seconds = `0${seconds}`;
            }

            let fileUploadDate = `${day}.${month}.${year} ${hours}:${minutes}:${seconds}`;


            $('<tr>', {filename: fileName}).append(
                $('<td>', {text: fileName}),
                $('<td>', {text: fileUploadDate}),
                $('<td>').append(
                    $('<button>', {class: 'primary-btn', onclick: `chooseCompanyForFile('${fileName}')`}).append(
                        $('<i>', {class: 'material-icons', text: 'file_upload', title: 'Обработать'})
                    ),
                    $('<button>', {class: 'primary-btn', onclick: `deleteControlFile('${fileName}')`}).append(
                        $('<i>', {class: 'material-icons', text: 'delete_outline', title: 'Удалить файл'})
                    )
                )
            ).appendTo(table);
        }

        $('#control_files_list .block-content').html(table);
    });
}

function deleteControlFile(fileName) {
    if (confirm(`Вы уверены, что хотите удалить файл ${fileName}?`)) {
        let encodeURIstring = encodeURI(`/opfile?attr=del&fname=${fileName}`);
        $.post(encodeURIstring, function(data) {
            if (data == 'success') {
                $(`#control_files_list_table tr[filename='${fileName}']`).remove();
            }
        });
    }
}

function chooseCompanyForFile(fileName) {
    $('#popup_process_control_file .popup-name').text(fileName);
    $('#process_file_btn').attr('file_name', fileName);
    openPopupWindow('popup_process_control_file');
}

function clearForm(formName) {
    event.preventDefault();
    $(`form[name="${formName}"] input`).val('');
    $(`form[name="${formName}"] input[type="checkbox"]`).prop('checked', false);

    if (formName == 'report_fast_access') {
        $('#report_fast_access_owners_list tr').not(':first').remove();
        $('#fast_access_add_owner_btn').attr('disabled', false);
    }
}

function processFile() {
    event.preventDefault();
    let companyId = $('#proccess_control_file_select option:selected').attr('company_id');
    let fileName = $('#process_file_btn').attr('file_name');
    let encodeURIstring = encodeURI(`/opfile?attr=runformat&org_id=${companyId}&fname=${fileName}`);
    showLoadingMessage('file_process_loading_message','Подождите, файл обрабатывается...', 'process_file_btn');
    $.post(encodeURIstring, function(data) {
        if (data == 'success') {
            closePopupWindow('popup_process_control_file');
            removeLoadingMessage('file_process_loading_message');
        }
    });
}

function DatepickerSetCurrentDate(inputId) {
    let input = $(`#${inputId}`);
    if (input.val() !== '') {
        let currentDate = input.val().split('.');
        let debtDateMonth = currentDate[0];
        let debtDateYear = currentDate[1];
        $(`#${inputId}`).datepicker("setDate", new Date(debtDateYear, debtDateMonth - 1));
    }
}

function uploadFiles() {
    event.preventDefault();

    let files = $('#files_upload_input').prop('files');
    if (files.length > 0) {
        let loader = $('<div>', {style: 'height: 30px; padding-top: 4px;'}).append(
            $('<div>', {style: 'width: 35%; float: left; text-align: right'}).append(
                $('<div>', {class: 'loading-circle-small', style: 'float: right'})
            ),
            $('<div>', {style: 'width: 65%; float: left; text-align: left; padding-left: 5px; padding-top: 3px;'}).append(
                $('<span>', {id: 'uploaded_files_number', style: 'color: green'})
            )
        );
    
        loader.appendTo('form[name = "files_upload"]');

        let uploadedFilesNum = 0;
        for (file of files) {

            let formdata = new FormData();
            formdata.append("file", file);

            $.ajax({
                type: "POST",
                url: '/upload',
                data: formdata,
                contentType: false,
                processData: false,
                success: (data) => {
                    if (data == 'success') {
                        uploadedFilesNum++;
                        $('#uploaded_files_number').text(`Файлов загружено: ${uploadedFilesNum}`);
                        getControlFilesList();
                    }
                }
            });
        }
        $('#number_of_uploaded_files').text('Выбрано файлов: 0');
        loader.fadeOut(2000, () => {loader.remove()});
    }
    else {
        $('#number_of_uploaded_files').fadeOut(100).fadeIn(100).fadeOut(100).fadeIn(100);
    }
}

function resizeTwoDiv(parentDiv, firstDiv, SecondDiv, error) {
    $(`#${firstDiv}`).resizable({
        "handles": "e"
    });

    $(`#${firstDiv}`).resize(() => {
        resize();
    });

    $(window).resize(() => {
        resize();
    });

    function resize() {
        let parentWidth = $(`#${parentDiv}`).width();
        let resizableElemWidth = $(`#${firstDiv}`).width();
        let modWidth = parentWidth - resizableElemWidth - error;
        $(`#${SecondDiv}`).width(modWidth);
    }
}

function keyupSearch() {
    let input = $('#sub_search_input');
    let valueLength = input.val().length;
    let parentDiv = $('#fast_search_menu ul');

    if (valueLength >= 3) {
        parentDiv.empty();
        let searchValue = input.val();
        let currentCompanyId = getCookie('companyId');
        encodeURIstring = encodeURI(`/base_func?val_param=fast_find&val_param1=${searchValue}&val_param2=${currentCompanyId}`);
        $.post(encodeURIstring, function (data) {
            if (data !== '') {
                let searchListArray = JSON.parse(data);
                for (elem of searchListArray) {
                    let dataArray = elem.split('&');
                    let name = dataArray[0];
                    let accid = dataArray[1];
                    let adress = dataArray[2];
                    $('<li>', {text: name, accid: accid, adress: adress}).appendTo(parentDiv);
                }

                $('#fast_search_menu ul li').each(function() {
                    $(this).on('click', function() {
                        let value = $(this).text();
                        let adress = $(this).attr('adress');
                        let accid = $(this).attr('accid');
                        input.val(value);
                        $('#sub_search_btn').attr('accid', accid);
                        $('#sub_search_btn').attr('adress', adress);

                        $('#fast_search_menu').hide();
                    });
                })

                $('#fast_search_menu').show();
            }
            else {
                $('#fast_search_menu').hide();
            }
        });
    }
    else {
        parentDiv.empty();
        $('#fast_search_menu').hide();
    }
}

function setOffsetFastSearchMenu() {
    let relativeElement = $('#sub_search_input');
    let menu = $('#fast_search_menu');

    let top = relativeElement.offset().top + 40;
    let left = relativeElement.offset().left;

    menu.css({top: top, left: left});
}

function clickFastSearch() {
    event.preventDefault();
    if ($('#sub_search_input').val() !== '') {
        let accid = $('#sub_search_btn').attr('accid');
        let adress = $('#sub_search_btn').attr('adress');
        CURRENT_OBJECT_DATA.accid = accid;
        getObjectData();
        $('#current_adress').text(adress);
    
        if ($('#main_content .header-icons').is(':hidden')) {
            $('#main_content .header-icons').show();
        }
    
        closePopupWindow('popup_search');
        $('#sub_search_input').val('');
    }
}

function changeTabHelpMenu(tabId) {
    let tabContent = $(`#dropdown_help_menu_${tabId}`);
    if (tabContent.hasClass('active')) {
        tabContent.removeClass('active');
    }
    else {
        $('.dropdown-help-menu-tab-content').removeClass('active');
        tabContent.addClass('active');    
    }
}

function getNewsList() {
    createContentLoader('#news_content .info-block-content');

    $.post('/base_func?val_param=news_portal&val_param1=1', function (data) {
        let newsList = JSON.parse(data).news;
        for (elem in newsList) {
            let news = newsList[elem];
            let name = news.name;
            let content = news.content;
            let creationDate = news.created;
            $('<div>', {class: 'news-block'}).append(
                $('<div>', {class: 'news-header', text: name}),
                $('<div>', {class: 'news-content'}).append(content),
                $('<div>', {class: 'news-creation-date', text: `Добавлено: ${creationDate}`})

            ).appendTo('#news_list');

        }
    });
    removeContentLoader('#news_content .info-block-content', '#news_list');
}

function getUpdateList() {
    createContentLoader('#updates_content .info-block-content');
    const headCompanyId = USER_DATA.head_company;

    $.post(`/base_func?val_param=news_portal&val_param1=${headCompanyId}`, function (data) {
        let updatesList = JSON.parse(data).news;
        for (elem in updatesList) {
            let update = updatesList[elem];
            let name = update.name;
            let content = update.content;
            let creationDate = update.created;
            $('<div>', {class: 'news-block'}).append(
                $('<div>', {class: 'news-header', text: name}),
                $('<div>', {class: 'news-content'}).append(content),
                $('<div>', {class: 'news-creation-date', text: `Добавлено: ${creationDate}`})
            ).appendTo('#updates_list');
        }
    });
    removeContentLoader('#updates_content .info-block-content', '#updates_list');
}

function changeTabControlReportSettings() {
    let tabsCollection = $('#report_settings_select_menu ul li');
    tabsCollection.on('click', function() {
        tabsCollection.removeClass('active');
        $(this).addClass('active');

        const repNum = $(this).attr('rep_num');
        const repType = $(this).attr('rep_type');
        const printNotation = $(this).attr('print_notation');

        getReportPreview(repNum, repType);
        $('#print_notation_textarea').val(printNotation.replace(/<br ?\/?>/g, '\n'));

    });
}

function getReportPreview(repNum, repType) {
    const divForContent = $('#report_settings_preview .block-content');
    $.get(`/report?rnum=${repNum}&rtype=${repType}&accid=201287&humanid=401245&dateb=&datee=`, function (data) {
        divForContent.html(data);
    });
}

function validateFormInputs([inputsArray]) {

    let valid = true;

    for (input of inputsArray) {
        if (!input.val()) {
            input.fadeOut(100).fadeIn(100).fadeOut(100).fadeIn(100);
            valid = false;
        }
    }

    return valid;
}

function clearFormInputs([inputsArray]) {
    for (input of inputsArray) {
        input.val('');
    }
}