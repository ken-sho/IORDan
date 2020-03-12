// "use strict";

var USER_DATA;
var OBJECT_DATA;
var DROPDOWN_NUM = 1; 
var CURRENT_OBJECT_DATA = {};
var OBJECT_TREE_TEMPLATES;
var COMPANY_OBJECTS_DATA;

$(document).ready(function() {
    sessionStorage.setItem('printMode', 'off');
    getProjectTaskList("web_deb");
    getNewsList();
    showCurrentCompany();
    setInputRadio();
    createRegistryCalendar();
    $('.gifplayer').gifplayer({ label: '<i class="material-icons help-gif-icon">play_arrow</i>' });

    $('#popup_background').on('click', (e) => {
        if (e.target !== e.currentTarget) {
            return;
        }
        else {
            $('#popup_background, .popup-window').fadeOut(200);
        }
    });

    $('#popup_background_layer2').on('click', (e) => {
        if (e.target !== e.currentTarget) {
            return;
        }
        else {
            $('#popup_background_layer2, .popup-window_layer2').fadeOut(200);
        }
    });

    if (!sessionStorage.noFirstVisit) {
        $('#update_info_content').show();
        $('#info_page').addClass('active');
        $('#obj_content').hide();
    }
    else {
        $('#home_page').addClass('active');
    }

    getUserData([getUserRightsData, createCompanyDropdownMenu, getUpdateList]);

    $('#add_contact_phone_number').inputmask("(999)999-99-99");

    $("#report_fast_access_start_date, #report_fast_access_end_date").datepicker({
        dateFormat: "mm.yy",
        changeMonth: true,
        changeYear: true,
        showButtonPanel: true,
        yearRange: '2005:2020',
        beforeShow: function(input, inst) {
            $('#ui-datepicker-div').addClass('input-datepicker');
        },

        onClose: function (dateText, inst) {
            $(this).datepicker('setDate', new Date(inst.selectedYear, inst.selectedMonth, 1));
        }
    });

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

    mainCalendarChangeDate();

    $('.main-menu li').on('click', function() {
        if (!$(this).hasClass('active'))  {
            $('.main-menu li').removeClass('active');
            $(this).addClass('active');
        }
    });

    const currentCompany = getCookie('companyId');
    if (currentCompany == undefined) {
        $('#main_search_input').attr('disabled', true);
        $('#main_search_input').val('Выберите компанию');
        $('.li-change-events').addClass('li-disabled');
    }

    $('#add_agreement_owner_icon').on('click', function() {
        openPopupWindow('popup_add_agreement');
    });

    $('#obj_agreements_btn').click(function() {
        if ($(this).hasClass('button-secondary')) {
            $('#owners_table').hide();
            $('#agreement_list_table').show();

            $('#add_agreement_owner_icon').off('click');
            $('#add_agreement_owner_icon').on('click', function() {
                openPopupWindow('popup_add_agreement');
            });

            $('#obj_owners_btn').toggleClass('button-primary button-secondary');
            $(this).toggleClass('button-secondary button-primary');
        }
    });

    $('#obj_owners_btn').click(function() {
        if ($(this).hasClass('button-secondary')) {
            $('#owners_table').show();
            $('#agreement_list_table').hide();

            $('#add_agreement_owner_icon').off('click');
            $('#add_agreement_owner_icon').on('click', function() {
                openPopupWindow('popup_add_owner');
            });

            $('#obj_agreements_btn').toggleClass('button-primary button-secondary');
            $(this).toggleClass('button-secondary button-primary');
        }
    });

    $('#object_communication_select').change(function() {
        if (this.value == 'Другое') {
            $('#object_communication_textarea_tr').show();
        }
        else {
            $('#object_communication_textarea_tr').hide();
        }
    });
});

// получение данных о пользователе
function getUserData(callback) {
    $.get( "/web_request?query=", function( data ) {
        USER_DATA = JSON.parse(data);

        $('#obj_create_reminder').on('click', function() {
            if (USER_DATA.user_login == 'demo') {
                alert('Разного рода уведомления. По типу квартиросъёмщик «попросил связаться завтра», «обещал внести оплату такого-то числа» или любое другое по требованию заказчика. Программа напомнит об этом событии пользователю.');
            }
            else {
                alert('Недостаточно прав');
            }
        });

        if (USER_DATA.org_list.length == 1) {
            const companyName = USER_DATA.org_list[0].name;
            const companyId = USER_DATA.org_list[0].id;

            chooseCompany('', companyName, companyId);
        }

        if (!isEmpty(callback)) {
            for (const func of callback) {
                func();
            }
        }
    });
}

function getUserRightsData() {
    $.get( "/web_request?query=user_rights", function( data ) {
        const userRightsData = JSON.parse(data);
        USER_DATA = Object.assign(USER_DATA, userRightsData);
        acceptColorTheme();
        showUserLogin();

        if (getCookie('companyId')) {
            if (USER_DATA.org_list.length > 1) {
                initializationPopupControl();
                getObjectsTreeData();
                initializeUserRight();
            }
        }
        else {
            removeContentLoader('body', '#page_body');
        }

        sessionStorage.setItem('noFirstVisit', 'true');
    });
}

function initializeUserRight() {
    const userRights = USER_DATA.u_right;


    if(!isEmpty(userRights)) {
        if (userRights.includes(1)) {
            getControlFilesList();
            getControlProcessedFilesList();
            getControlPerformedFilesList();
            $('#control_files_tab').removeClass('default-hidden');
        }
        if (userRights.includes(2)) {
            getRegistryList('regular');
            selectRegistriesTypeHandler();
            $('#control_registry_tab').removeClass('default-hidden');
        }    
    }
    else {
        getControlFilesList();
        getControlProcessedFilesList();
        getControlPerformedFilesList();
        getRegistryList('regular');
        selectRegistriesTypeHandler();
        $('.default-hidden').removeClass('default-hidden');
        getCompanyDocumentsList();
    }
}

function showCurrentCompany() {
    let currentCompany = sessionStorage['currentCompany'];
    if (currentCompany) {
        $('#main_menu_company_name').text(currentCompany);
        $('#popup_control .popup-fullscreen-name').text('Управление ' + currentCompany);
    }
}

// создание выпадающего меню со списком компаний
function createCompanyDropdownMenu() {
    let companiesData = USER_DATA.org_list;
    for (const company of companiesData) {
        let companyId = company.id;
        let companyName = company.name;
        const li = $('<li>', {id: companyId, class: 'dropdown-menu-item', onclick: `chooseCompany(this, '${companyName}', '${companyId}')`}).appendTo('#jq-dropdown-company-list .jq-dropdown-menu');
        $('<a>', {text: companyName}).appendTo(li);
    }

    $('#jq-dropdown-company-list .dropdown-menu-item').each(function() {
        $(this).on('click', function() {
            $('#jq-dropdown-company-list .dropdown-menu-item').removeClass('active');
            $(this).addClass('active');
        });
    });
}

function chooseCompany(li, companyName, companyId) {
    if(!$(li).hasClass('active')) {
        $('#main_search_input').attr('disabled', false);
        $('#main_search_input').val('');
        $('.li-change-events').removeClass('li-disabled');
        $('.object-list-tree').empty();
        $('#main_menu_company_name').text(companyName);
        $('#popup_control .popup-fullscreen-name').text('Управление ' + companyName);
        setCookie('companyId', companyId);
        initializationPopupControl();
        initializeUserRight();
        getObjectsTreeData();
        sessionStorage.setItem('currentCompanyId', companyId);
        sessionStorage.setItem('currentCompany', companyName);
    }
}

function openCloseMainMenu () {
    if ($('#menu_change_state i').text() == 'arrow_forward') {
        $('.main-menu, #main_menu_content').width('260px');
        $('#body_content, .popup-with-menu').width('calc(100% - 260px)');
        $('#menu_change_state i').text('arrow_back');

    }
    else {
        $('.main-menu, #main_menu_content').width('56px');
        $('#body_content, .popup-with-menu').width('calc(100% - 56px)');
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

function openPopupWindowLayer2(id) {
    $('.popup-window-layer2').hide();
    $(`#${id}, #popup_background_layer2`).fadeIn(200);

    if (id == 'popup_search') {
        setOffsetFastSearchMenu();
    }
}

function closePopupWindow(popupId) {
    $(`#${popupId}, #popup_background`).fadeOut(200);
    $('#popup_report .popup-content').empty();
    $('.main-menu li').removeClass('active');
    $('#home_page').addClass('active');

    // if (popupId !== 'popup_add_task' && popupId !== 'popup_process_control_file' && popupId !== 'popup_not_fullscreen' && popupId != 'popup_objects_group_users' && popupId != 'popup_objects_group' && popupId !== 'popup_add_edit_registry_entry' && popupId !== 'popup_processed_file_template' && popupId !== 'popup_performed_file_template' && popupId !== 'popup_report' && popupId !== 'popup_create_object_group')  {
    //     openHomePage();
    // }
}

function closePopupWindowLayer2(popupId) {
    $(`#${popupId}, #popup_background_layer2`).fadeOut(200);
    $('#popup_report .popup-content').empty();
}

function closePopupWindowWithConfirm(popupId) {
    if (confirm(`Все внесенные изменения будут потеряны. Вы уверены, что хотите закрыть окно?`)) {
        $(`#${popupId}, #popup_background`).fadeOut(200);
        $('#popup_report .popup-content').empty();
    }
}

function openPopupWithMenu(popupId) {
    $('.popup-with-menu').hide();
    $(`#${popupId}`).css({ 'display': 'block' });
    let popup = $('#popup_object_list');
    if (popup.attr('state') == 'open') {
        closeObjectList();
    }
}

function openCloseObjectList() {
    $('.popup-with-menu').each(function() {
        if ($(this).attr('id') !== 'popup_control') {
            $(this).hide();
        }
    });
    const popup = $('#popup_object_list');
    if (popup.attr('state') == 'close') {
        popup.css({'display': 'block'});
        popup.animate({ width: '35%' }, 200, function() {
            $('#popup_object_content').show();
            popup.attr('state', 'open');
            // if ( $('.object-list-tree').children().length == 0 ) getObjectsTreeData();
        });
    }
    else if (popup.attr('state') == 'open') {
        closeObjectList();
    }
}

function closeObjectList() {
    const popup = $('#popup_object_list');
    $('#popup_object_content').hide();
    popup.animate({ width: '0' }, 200, function () {
        popup.css({ 'display': 'none' });
        popup.attr('state', 'close');
    });
    $('.main-menu li').removeClass('active');
    $('#home_page').addClass('active');
}

function getObjectsTreeData() {
    $('.object-list-tree, #control_object_groups_left_column .block-content').empty();
    createContentLoader('#object_list_tree');
    createContentLoader('#control_object_groups_left_column .block-content');
    $.ajax({
        type: "POST",
        url: "/base_func",
        data: encodeURI("val_param=house_tree"),
        success: function (data) {
            COMPANY_OBJECTS_DATA = JSON.parse(data).object_tree.object_list;
            createObjectsTree(data);
            removeContentLoader('#object_list_tree', '.object-list-tree');
        }
    });
}

function createObjectsTree(data) {

    const templateSelect = $('#choose_template_select');

    var objectTree = JSON.parse(data).object_tree;
    const objectList = objectTree.object_list;
    OBJECT_TREE_TEMPLATES = objectTree.templates;
    const controlUl = $('<ul>', {id: 'create_object_group_ul'});

    for (const prop in objectList) {
        const objectData = prop.split('&');
        const li = $('<li>', { text: objectData[0], class: 'parent-li' }).appendTo('.object-list-tree');
        $('<input>', {type: 'checkbox', class: 'object-tree-parent-li-input'}).prependTo(li);
        const parentUl = $('<ul>', { class: 'object-tree-ul hide' }).insertAfter(li);

        const controlLi = $('<li>', {class: 'parent-li', text: objectData[0]}).appendTo(controlUl);
        $('<input>', {type: 'checkbox', id: `object_${objectData[1]}`,object_id: objectData[1]}).prependTo(controlLi);

        for (i = 0; i < objectList[prop].length; i++) {
            const apartData = objectList[prop][i].split('&');
            const li = $('<li>', { class: 'object-tree-li', text: apartData[0], accid: apartData[1] }).appendTo(parentUl);
            $('<input>', {type: 'checkbox', class: 'object-tree-apartament-input'}).prependTo(li);
            if (apartData[2] !== 'white') {
                li.css({ 'color': apartData[2]});
            }
        }
    }

    $('#create_object_group_objects_list').html(controlUl);

    $('#create_object_group_ul li').each(function () {
        $(this).on('click', function (e) {
            let input = $(this).find('input');
            if (e.target !== e.currentTarget) {
                return;
            }
            input.trigger('click');
        });
    });


    $('#jq-dropdown-objects-list ul').empty();

    const reportsArr = getCurrentCompanyReportsArray();

    for (const elem in reportsArr) {
        const report = reportsArr[elem];
        $('<li>', {class: 'dropdown-menu-item', rep_name:  report.rep_name, rep_num: report.rep_num, rep_type: report.rep_type}).append(
            $('<a>', {text: report.rep_name})
        ).appendTo($('#jq-dropdown-objects-list ul'));
    }

    // createDropdownMenuReportTree('objects-list', getCurrentCompanyReportsArray());

    $('#jq-dropdown-objects-list .dropdown-menu-item').each(function() {
        $(this).click(function() {
            let repNum = $(this).attr('rep_num');
            let repType = $(this).attr('rep_type');
            let accids = createAccidsArray().toString();
            const reportId = `${repType}_${repNum}`;
            setPrintNotation(reportId);

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

    templateSelect.empty();

    for (const template in OBJECT_TREE_TEMPLATES) {
        const name = template;
        $('<option>', { text: name }).appendTo('#choose_template_select');
    }

    const currentTemplateName = templateSelect.val();
    const currentTemplateDescription = OBJECT_TREE_TEMPLATES[currentTemplateName];
    $('#choose_template_description').text(currentTemplateDescription);


    $('#object_list_settings_left, #object_list_settings_right').show();

    $('#object_list_tree .parent-li').click(function (event) {
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

    $('#object_list_search_input').on('click', function () {
        $('.object-tree-ul.active').removeClass('active').addClass('hide');
    });

    $('.object-tree-li').each(function () {
        $(this).on('click', function (e) {
            if (isActivePrintMode()) {
                let input = $(this).find('input');
                if (e.target !== e.currentTarget) {
                    return;
                }
                input.trigger('click');
            }
            else {
                let accid = $(this).attr('accid');
                CURRENT_OBJECT_DATA.apartNum = $(this).text();
                CURRENT_OBJECT_DATA.adress = $(this).parent().prev().text();
                CURRENT_OBJECT_DATA.accid = accid;

                getObjectData();

                if ($('#update_info_content').is(':visible')) {
                    $('#update_info_content').hide();
                    $('#obj_content').show();
                }

                if (!isEmpty(CURRENT_OBJECT_DATA)) {
                    $('#obj_info .header-manipulation').show();
                    $('#obj_agreements_btn, #obj_owners_btn').prop('disabled', false);
                }

                $('.jq-dropdown.dropdown-report').remove();

                $('.object-tree-li').removeClass('active');
                $(this).addClass('active');
                $('.main-menu li').removeClass('active');
                $('#home_page').addClass('active');
                $('#obj_adress').text(`${CURRENT_OBJECT_DATA.adress} - ${CURRENT_OBJECT_DATA.apartNum}`);
                let popup = $('#popup_object_list');
                $('#popup_object_content').hide();
                popup.animate({ width: '0' }, 200, function () {
                    popup.css({ 'display': 'none' });
                    popup.attr('state', 'close');
                });
            }
        });
    });

    removeContentLoader('body', '#page_body');
}

function getObjectData() {
    $('#obj_ls_info .icon-count').remove();
    $('#agreements_owners_content, #obj_main_table, #add_agreement_owner_select, #obj_additional_info .block-content').empty();
    createContentLoader('#obj_agreements_info .block-content');
    createContentLoader('#obj_main_table');
    createContentLoader('#obj_additional_info .block-content');
    
    $.ajax({
        type: "POST",
        url: "/base_func",
        data: encodeURI(`val_param=adr_info&val_param1=${CURRENT_OBJECT_DATA.accid}`),
        success: function (data) {
                        
            OBJECT_DATA = JSON.parse(data);

            getObjectAgreementsData();

            getObjectRegistrationsData();

            removeContentLoader('#obj_agreements_info .block-content', '#agreements_owners_content');

            getObjectInfoData();

            getObjectContactsData();

            getObjectNotationsData();

            getObjectCommunicationsData();

            getMainTable();

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
            for (const func of callback) {
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
                let content = '<table id="rep_range_table"><tr><td>Дата начала</td><td><input type="text" id="start_date" class="input-main"></td></tr>' +
                    '<tr><td>Дата конца</td><td><input type="text" id="final_date" class="input-main"></td></tr></table>' +
                    '<div class="content-center"><div class="notification">По умолчанию будет выбран период с 01.01.2005 по 01.12.2015</div><button id="pep_range_btn" class="button-primary">Выполнить</button></div>';
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
                    beforeShow: function(input, inst) {
                        $('#ui-datepicker-div').addClass('input-datepicker');
                    },

                    onClose: function (dateText, inst) {
                        $(this).datepicker('setDate', new Date(inst.selectedYear, inst.selectedMonth, 1));
                    }
                });
            }
            else {
                createContentLoader('#popup_report .popup-content');
                openPopupWindow('popup_report');
                $.get(`/report?rnum=${repNum}&rtype=${repType}&accid=${accid}&humanid=${humanId}`, function (data) {
                    $('#popup_report .popup-name-fullscreen').text(repName);
                    $('#popup_report .popup-content').html(data);
                    if (repNum == '2' || repNum == '3') {
                        $('#popup_report table').addClass('export-table-border');
                        // createButtonToExport(createFileToExport);
                    }
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

    $('#agreement_list_table').remove();

    const table = $('<table>', {id: 'agreement_list_table'});

    if ($('#obj_agreements_btn').hasClass('button-secondary')) table.hide();

    let agreementsData = OBJECT_DATA.agreements;
    let agreementsPeopleArr = [];
    const agreementsCount = Object.keys(agreementsData).length;
    $("#obj_agreements_btn").text(`Договора (${agreementsCount})`); 

    $('<tr>').append(
        $('<th>'),
        $('<th>', {text: 'ФИО'}),
        $('<th>', {text: 'Наименование договора'})
    ).appendTo(table);

    for (const prop in agreementsData) {
        let propData = prop.split('&');
        tr = $('<tr>', { 'accid': propData[1], 'human_id': propData[2] }).appendTo(table);
        tdButton = $('<td>').appendTo(tr);
        // button = $('<button>', { 'data-jq-dropdown': `#jq-dropdown-${DROPDOWN_NUM}`, class: 'owner-document-list-btn' }).appendTo(tdButton);
        buttonIcon = $('<i>', { class: 'material-icons', 'data-jq-dropdown': `#jq-dropdown-${DROPDOWN_NUM}`, text: 'event_note' }).appendTo(tdButton);
        td = $('<td>', { text: propData[0] }).appendTo(tr);

        agreementsPeopleArr.push(`${propData[0]}&${propData[2]}`);

        createDropdownMenu(DROPDOWN_NUM, propData[1], propData[2], getCurrentCompanyReportsArray());
        DROPDOWN_NUM++;

        for (i = 0; i < agreementsData[prop].length; i++) {
            $('<td>', { text: agreementsData[prop][i] }).appendTo(tr);
        }
    }

    table.appendTo('#agreements_owners_content');

    CURRENT_OBJECT_DATA.agreementsPeople = agreementsPeopleArr;

}

function getObjectRegistrationsData() {

    $('#owners_table').remove();

    let registrationsData = OBJECT_DATA.registrations;
    let ownersPeopleArr = [];
    const registrationsCount = Object.keys(registrationsData).length;
    $("#obj_owners_btn").text(`Прописанные (${registrationsCount})`);

    const table = $('<table>', {id: 'owners_table'});

    if ($('#obj_owners_btn').hasClass('button-secondary')) table.hide();

    $('<tr>').append(
        $('<th>'),
        $('<th>', {text: 'ФИО'}),
        $('<th>', {text: 'Дата рождения'}),
        $('<th>', {text: 'Дата прописки'}),
        $('<th>', {text: 'Доп. инфо'}),
        $('<th>')
    ).appendTo(table);

    for (const registrationKey in registrationsData) {
        let registrationData = registrationKey.split('&');
        const registrationValue = registrationsData[registrationKey];
        tr = $('<tr>', { 'accid': registrationData[1], 'human_id': registrationData[2], 'author': registrationValue.author, 'creation_time': registrationValue.creation_time}).append(
            $('<td>').append(
                $('<i>', { 'data-jq-dropdown': `#jq-dropdown-${DROPDOWN_NUM}`, class: 'material-icons', text: 'event_note' })
            ),
            $('<td>', { text: registrationData[0] }),
            $('<td>', {text: registrationValue.birth_date}),
            $('<td>', {text: registrationValue.registration_date})
        ).appendTo(table);

        const td = $('<td>').appendTo(tr);


        if (registrationValue.unregistration_date !== '') {
            $('<i>', {class: 'material-icons owner-info-unsubdate', text: 'business', title: `Дата выписки: ${registrationValue.unregistration_date}`}).appendTo(td);
        }

        if (registrationValue.birth_place !== '') {
            $('<i>', {class: 'material-icons owner-info-birthplace', text: 'person_pin_circle', title: `Место рождения: ${registrationValue.birth_place}`}).appendTo(td);
        }

        ownersPeopleArr.push(`${registrationData[0]}&${registrationData[2]}`);

        $('<option>', {text: registrationData[0], humanId: registrationData[2]}).appendTo('#add_agreement_owner_select');

        $('<td>', { text: '' }).append(
            $('<i>', { class: 'material-icons owner-edit-icon', humanId: registrationData[2], text: 'edit', title: 'Редактировать' })
        ).appendTo(tr);

        createDropdownMenu(DROPDOWN_NUM, registrationData[1], registrationData[2], getCurrentCompanyReportsArray());
        DROPDOWN_NUM++;
    }

    table.appendTo('#agreements_owners_content');

    CURRENT_OBJECT_DATA.ownersPeople = ownersPeopleArr;
    clickIconEditOwner();
}

function getObjectInfoData() {

    let data = OBJECT_DATA.information;

    const table = $('<table>', {id: 'obj_additional_info_table'});

    for (const prop in data) {
        $('#obj_ls_info .header').text(`ЛС: ${prop.replace('ls','')}`);
        $('#report_fast_access_ls').val(`${prop.replace('ls','')}`);

        let infoData = data[prop];

        for (const prop in infoData) {

            if (prop == 'Образования задолженности') {
                if (infoData[prop] !== '') CURRENT_OBJECT_DATA.debtDate = infoData[prop];
            }

            $('<tr>').append(
                $('<td>', {text: prop}),
                $('<td>', {text: infoData[prop]})
            ).appendTo(table);

            $('#obj_additional_info .block-content').html(table);

            // if (prop == 'Примечание из старой системы') {
            //     $('<div>').append(
            //         $('<span>', {class: 'obj-info-key', text: `${prop}: `}),
            //         $('<span>', {class: 'obj-info-value', text: infoData[prop]})
            //     ).appendTo($('#obj_info_notation'));
            // }
            // else {
            //     if (prop == 'Образования задолженности') {
            //         if (infoData[prop] !== '') CURRENT_OBJECT_DATA.debtDate = infoData[prop];

            //         $('<tr>').append(
            //             $('<td>', {text: prop, class: 'table-input-name'}),
            //             $('<td>').append(
            //                 $('<input>', {currentValue: infoData[prop], value: RemakeDateFormatToInput(infoData[prop]), class: 'input-main', type: 'date'})
            //             )
            //         ).appendTo('#edit_object_info_table');
            //     }

            //     if (prop == '№ СП или № ИЛ') {
            //         $('<tr>').append(
            //             $('<td>', {text: prop, class: 'table-input-name'}),
            //             $('<td>').append(
            //                 $('<input>', {currentValue: infoData[prop], value: infoData[prop], class: 'input-main', type: 'text'})
            //             )
            //         ).appendTo('#edit_object_info_table');
            //     }
            //     $('<div>', {class: 'obj-info-block'}).append(
            //         $('<span>', {class: 'obj-info-key', text: `${prop}: `}),
            //         $('<span>', {class: 'obj-info-value', text: infoData[prop]})
            //     ).appendTo($('#obj_info_content'));
            // }
        }
    }
}

function getObjectContactsData() {
    $('#contacts_list, #edit_contact_select').empty();
    let contactsData = OBJECT_DATA.contacts;

    if (!isEmpty(contactsData)) {
        const myDiv= $('<div>', {class: 'icon-count', text: Object.keys(contactsData).length})
        $('<div>', {class: 'icon-count', text: Object.keys(contactsData).length}).appendTo('#obj_contacts_icon');

        $('<table>', {id: 'object_contacts_table'}).append(
            $('<tr>').append(
                $('<th>', {text: 'Данные контакта'}),
                $('<th>', {text: 'Тип'}),
                $('<th>', {text: 'Контакт'})
            )
        ).appendTo('#contacts_list');

        for (const contact in contactsData) {
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
    else {
        $('<div>', {class: 'notification', text: 'Контакты отсутствуют'}).appendTo('#contacts_list');
    }
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

    $('#object_notations_list').empty();

    let notationsData = OBJECT_DATA.notations;

    if (!isEmpty(notationsData)) {
        for (const elem in notationsData) {
            const notation = notationsData[elem];
            const id = elem;
            const value = notation.value;
            const author = notation.author;
            const creationTime = notation.creation_time;

            $('<div>', {id: id, class: 'obj-notation'}).append(
                $('<div>', {class: 'notation-content', text: value}),
                $('<div>', {class: 'notation-creation-time', text: `Добавил: ${author} ${creationTime}`})
            ).appendTo('#object_notations_list');
        }

        $('<div>', {class: 'icon-count', text: Object.keys(notationsData).length}).appendTo('#obj_notations_icon');
    }
    else {
        $('<div>', {class: 'notification', text: 'Примечания отсутствуют'}).appendTo('#object_notations_list');
    }
}

function addObjectNotation() {
    event.preventDefault();

    let value = $('#add_object_notation_input').val();
    let accid = CURRENT_OBJECT_DATA.accid;

    if (value !== '') {
        encodeURIstring = encodeURI(`/base_func?val_param=addchg_accnote&val_param1=${accid}&val_param2=add&val_param3=${value}`);
        $.post(encodeURIstring, function (data) {
            refreshObjectData([getObjectNotationsData]);
        });

        $('#add_object_notation_input').val('');
    }
    else {
        $('#add_object_notation_input').fadeOut(100).fadeIn(100).fadeOut(100).fadeIn(100);
    }
}

function getObjectCommunicationsData() {

    $('#object_communications_list').empty();

    let communicationsData = OBJECT_DATA.communications;

    if (!isEmpty(communicationsData)) {
        for (const elem in communicationsData) {
            const communication = communicationsData[elem];
            const id = elem;
            const value = communication.value;
            const author = communication.author;
            const creationTime = communication.creation_time;

            $('<div>', {id: id, class: 'obj-notation'}).append(
                $('<div>', {class: 'notation-content', text: value}),
                $('<div>', {class: 'notation-creation-time', text: `Добавил: ${author} ${creationTime}`})
            ).appendTo('#object_communications_list');
        }

        $('<div>', {class: 'icon-count', text: Object.keys(communicationsData).length}).appendTo('#obj_communications_icon');
    }
    else {
        $('<div>', {class: 'notification', text: 'Коммуникации отсутствуют'}).appendTo('#object_communications_list');
    }
}

function addObjectCommunication() {
    event.preventDefault();

    let selectValue = $('#object_communication_select').val();
    const accid = CURRENT_OBJECT_DATA.accid;
    
    if (selectValue == 'Другое') {
        selectValue = $('#object_communication_textarea').val();
    }

    if (selectValue !== '') {
        encodeURIstring = encodeURI(`/base_func?val_param=addchg_accnote&val_param1=${accid}&val_param2=add_communication&val_param3=${selectValue}`);
        $.post(encodeURIstring, function (data) {
            $('#object_communication_textarea').val('');
            refreshObjectData([getObjectCommunicationsData]);
            showPopupNotification('Коммуникация успешно добавлена!')
        });
    }
    else {
        $('#object_communication_textarea').fadeOut(100).fadeIn(100).fadeOut(100).fadeIn(100);
    }
}

function createSelectWithPeople(selectId) {
    $('#add_contact_select').empty();

    const peopleArr = getObjectPeopleArr();

    for (const person of peopleArr) {
        const splittedPerson = person.split('&');
        const personName = splittedPerson[0];
        const personId = splittedPerson[1];

        $('<option>', {text: personName, humanId: personId}).appendTo(`#${selectId}`);
    }
}

function objectListSearch() {
    const inputVal = $('#object_list_search_input').val();
    const reg = RegExp(inputVal, 'i');
    $('.parent-li').each(function() {
        const value = $(this).text();
        const isValid = reg.test(value);
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
    for (const elem in reportsArr) {
        const report = reportsArr[elem];
        $('<li>', {class: 'dropdown-menu-item', rep_name:  report.rep_name, rep_num: report.rep_num, rep_type: report.rep_type}).append(
            $('<a>', {text: report.rep_name})
        ).appendTo($(`#jq-dropdown-${index} ul`));
    }
}

function createDropdownMenuForFile(menuNum, liArr, fileId, orgId) {
    $('<div>', {id: `jq-dropdown-${menuNum}`, class: 'jq-dropdown jq-dropdown-tip jq-dropdown-anchor-right'}).append(
        $('<ul>', {class: 'jq-dropdown-menu'})
    ).appendTo($('body'));
    for (const template of liArr) {
        $('<li>', {class: 'dropdown-menu-item', onclick: `initializationProcessedFileTemplate(${fileId}, ${orgId}, ${template.number})`}).append(
            $('<a>', {text: template.name})
        ).appendTo($(`#jq-dropdown-${menuNum} ul`));
    }
}

function createDropdownMenuReportTree(index, reportsArr) {
    $('<div>', {id: `jq-dropdown-${index}`, class: 'jq-dropdown dropdown-report jq-dropdown-tip'}).append(
        $('<ul>', {class: 'jq-dropdown-menu'})
    ).appendTo($('body'));
    for (const elem in reportsArr) {
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
    createContentLoader('#popup_report .popup-content');
    openPopupWindow('popup_report');

    $.get(`/report?rnum=${repNum}&rtype=${repType}&accid=${accid}&humanid=${humanId}&dateb=${startDate}&datee=${endDate}`, function (data) {
        $('#popup_report .popup-name-fullscreen').text(repName);
        $('#popup_report .popup-content').html(data);
        if (repNum == '21') {
            // createButtonToExport(createFileToExport);
        }
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

function printObjectsGroup() {
    var printWindow = window.open('', 'PRINT');
    let printingContent = document.querySelector('#popup_objects_group .popup-content').innerHTML;
    printWindow.document.write('<html><head><link href="/css/style_main_page.css" rel="stylesheet" type="text/css"><script src="/js/jquery-3.4.1.min.js"></script><script src="/js/print_objects_group_page.js"></script>');
    printWindow.document.write('</head><body id="report_print">');
    printWindow.document.write(printingContent);
    printWindow.document.write('</body></html>');
    printWindow.document.close(); // necessary for IE >= 10
    printWindow.focus(); // necessary for IE >= 10*/
}

function printRegistry() {
    var printWindow = window.open('', 'PRINT');
    let printingContent = document.querySelector('#registry_settings_content .block-content').innerHTML;
    printWindow.document.write('<html><head><link href="/css/style_main_page.css" rel="stylesheet" type="text/css"><script src="/js/jquery-3.4.1.min.js"></script><script src="/js/print_registry_page.js"></script>');
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

// function openCloseInfo() {
//     let info = $('#update_info_content');
//     if (info.is(":hidden")) {
//         $('#update_info_content').show();
//         $('#obj_content').hide();
//     }
//     else {
//         $('#update_info_content').hide();
//         $('#obj_content').show();
//     }
// }

function openHomePage() {
    $('#update_info_content, .popup-with-menu').hide();
    $('#obj_content').show();
}

function openInfoPage() {
    $('#update_info_content').show();
    $('#obj_content, .popup-with-menu').hide();
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

    for (const propName in options) {
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
    // createContentLoader('#redmine_content .info-block-content');
    $.get(`/redmine?request=/issues.json?project_id=${projectId}`, function (data) {
        let taskList = JSON.parse(data);
        for (const elem in taskList.issues) {
            let task = taskList.issues[elem];
            let id = task.id, tracker = task.tracker, name = task.subject, description = task.description, priority = task.priority, author = task.author;
            
            $('<div>', {class: 'news-block'}).append(
                $('<div>', {class: 'news-header', text: name}),
                $('<div>', {class: 'task-content-table'}).append(
                    $('<table>', {id: `task_${id}`, class: 'task-table'}).append(
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
                            $('<td>', {class: 'task-description', text: description, colspan: 3})
                        )
                    )
                )
            ).appendTo('#tasks_list');
        }
        // removeContentLoader('#redmine_content .info-block-content', '#tasks_list');
    });
}

function createContentLoader(parentDivSelector) {
    $('<div>', {class: 'center-content', parent_div: parentDivSelector}).append(
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

function showTextCenter(parentDiv, text) {
    const textDiv = $('<div>', {class: 'center-content'}).append(
        $('<div>', {class: 'center-content-text', text:  text})
    );
    $(`#${parentDiv}`).html(textDiv);
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

    if  (isActivePrintMode()) {
        $('.object-list-tree input').prop('checked', false);
        $('#print_mode_object_num').hide();
    }

    objectListSearch();
}

function switchToggle(toggleId) {

    let toggle = $(`#${toggleId}`);
    let state = toggle.attr('state');
    if (state == 'off') {

        // $('.object-tree-li').removeClass('active');
        sessionStorage.setItem('printMode', 'on');

        toggle.text('radio_button_checked');
        toggle.attr('state', 'on');
        toggle.css({'color': '#0091EA'});

        $('#objects_list_reports, #print_mode_object_num, .object-tree-apartament-input, .object-tree-parent-li-input').show();
    }
    else {
        sessionStorage.setItem('printMode', 'off');

        toggle.text('radio_button_unchecked');
        toggle.attr('state', 'off');
        toggle.css({'color': '#263238'});
        $('#objects_list_reports, #print_mode_object_num, .object-tree-apartament-input, .object-tree-parent-li-input').hide();
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

function isActivePrintMode() {
    let printMode = sessionStorage.getItem('printMode');
    if (printMode == 'on') return true;
    else return false;
}

function clickIconEditOwner() {
    $('.owner-edit-icon').on('click', function() {
        const ownerName = $(this).parent().prevAll().eq(3).text();
        const ownerBirthDate = $(this).parent().prevAll().eq(2).text();
        const subDate = $(this).parent().prevAll().eq(1).text();
        let unsubDate = '';
        let birthPlace = '';
        const author = $(this).parent().parent().attr('author');
        const creationTime = $(this).parent().parent().attr('creation_time');
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
        $('#edit_owner_creation_time').text(`Добавил: ${author} ${creationTime}`)
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
                showPopupNotification('Прописанный успешно отредактирован!');
                closePopupWindow();
                refreshObjectData([getObjectRegistrationsData, clickDropdownMenu]);
            }
            else if (data == 'lock_value') {
                showPopupNotification('Прописанного редактировать нельзя, так как с момента его добавления прошло более 24 часов!');
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
                refreshObjectData([getObjectRegistrationsData, clickDropdownMenu]);
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
                showPopupNotification('Контакт успешно добавлен!')

                // const notationCount = $('#obj_contacts_icon .icon-count');

                // if (notationCount) {
                //     notationCount.text(Number(notationCount.text())++);
                // }
                // else {
                //     $('<div>', { class: 'icon-count', text: '1' }).appendTo('#obj_notations_icon');
                // }
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
                showPopupNotification('Контакт успешно сохранен!');
            }
            else if (data == 'lock_value') {
                showPopupNotification('Контакт редактировать нельзя, так как с момента его добавления прошло более 24 часов!');
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

    if (validateFormInputs(validateinputsArray)) {
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

// function createMainCalendar() {
//     $("#main_calendar").datepicker({
//         dateFormat: "mm.yy",
//         changeMonth: true,
//         changeYear: true,
//         showButtonPanel: true,
//         yearRange: '2005: +1',
//     });

//     if (CURRENT_OBJECT_DATA.debtDate) {
//         let debtDate = CURRENT_OBJECT_DATA.debtDate.split('.');
//         let debtDateMonth = debtDate[1];
//         let debtDateYear = debtDate[2];
//         $("#main_calendar").datepicker("setDate", new Date(debtDateYear, debtDateMonth - 1));
//     }

//     getMainTable();
// }

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

function getCalendarValue(calendarId) {
    let month = +$(`#${calendarId} .ui-datepicker-month`).val() + 1;
    if ( month < 10) month = `0${month}`;
    let year = $(`#${calendarId} .ui-datepicker-year`).val();
    let calendarValue = `${month}.${year}`;
    return calendarValue;
}

function getMainTable() {

    $('#obj_main_table').empty();
    createContentLoader('#obj_main_table');

    let date = getCalendarValue('main_calendar');
    let accid = CURRENT_OBJECT_DATA.accid;

    $.post(`/base_func?val_param=account_history&val_param1=${accid}&val_param2=${date}`, function (data) {
        $('#obj_main_table').html(data);
        if ($('#main_calendar').is(':hidden')) $('#main_calendar').show();
    });
}

function createRegistryCalendar() {
    $("#registry_settings_calendar").datepicker({
        dateFormat: "mm.yy",
        changeMonth: true,
        changeYear: true,
        showButtonPanel: true,
        yearRange: '2005: +1',
    });

    registryCalendarChangeDate();
}

function registryCalendarChangeDate() {

    const handler = function() {
        getRegistryList('regular');
        registryCalendarChangeDate();
    }

    $('#registry_settings_calendar .ui-datepicker-prev, #registry_settings_calendar .ui-datepicker-next, #registry_settings_calendar .ui-datepicker-current').on('click', handler)
    $('#registry_settings_calendar .ui-datepicker-month, #registry_settings_calendar .ui-datepicker-year').on('change', handler);
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
    for (const key in obj) {
        return false;
    }
    return true;
}

function inObject(elem, obj) {
    for (const key of obj) {
        if (elem == key) {
            return true;
        }
    }
    return false;
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
    const companyKey = 'id' + currentCompanyId;
    let companyReportsData = USER_DATA.reports_list;
    return companyReportsData[companyKey];
}

function fillSelectFromReportsArray(selectId, array) {
    for (const report of array) {
        $('<option>', {text: report.rep_name, rep_name: report.rep_name, rep_num: report.rep_num, rep_type: report.rep_type}).appendTo($(`#${selectId}`));
    }
}

function fillSelectFromCompanyArray(selectId, array) {
    for (const company of array) {
        $('<option>', {text: company.name, company_id: company.id}).appendTo($(`#${selectId}`));
    }
}

function initializationPopupControl() {
    resizeTwoDiv('control_reports', `reports_list`, 'report_fast_access', '11');

    $('#report_fast_access_reports_list, #report_settings_select_menu ul, #proccess_file_company_select').empty();
    let reportsArr = getCurrentCompanyReportsArray();
    
    if (!isEmpty(reportsArr)) {
        for (const report in reportsArr) {
            $('<tr>').append(
                $('<td>').append(
                    $('<input>', {type: 'checkbox', id: `report_fast_access_${reportsArr[report].rep_num}_${reportsArr[report].rep_type}`, rep_name: reportsArr[report].rep_name, rep_num: reportsArr[report].rep_num, rep_type: reportsArr[report].rep_type}),
                    $('<label>', {for: `report_fast_access_${reportsArr[report].rep_num}_${reportsArr[report].rep_type}`, text: reportsArr[report].rep_name})
                )
            ).appendTo($('#report_fast_access_reports_list'));
    
            $('<li>', {rep_id: `${reportsArr[report].rep_type}_${reportsArr[report].rep_num}`}).append(
                $('<a>').append(
                    $('<span>', {text: reportsArr[report].rep_name})
                )
            ).appendTo('#report_settings_select_menu ul');
        }

        changeTabControlReportSettings();
        $('#report_settings_select_menu ul li:first-child').trigger('click');
    }

    let companyArr = USER_DATA.org_list;
    fillSelectFromCompanyArray('proccess_file_company_select', companyArr);
    const currentCompanyId = getCookie('companyId');
    $(`#proccess_file_company_select option[company_id=${currentCompanyId}]`).attr('selected','selected');

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

    getObjectsGroupsList();
}

function initializeSettingItem(parent, settingName, settingContent, callback) {
    $('<div>',  {class: 'setting-item'}).append(
        $('<h5>', {text: settingName}),
        settingContent
    ).appendTo(parent);

    if (!isEmpty(callback)) {
        for (const func of callback) {
            func();
        }
    }
}

function changePrintNotation() {
    $('#print_notation_textarea').attr('disabled', false);
    $('#save_print_notation').show();
    $('#change_print_notation').hide();
}

function savePrintNotation(reportId) {
    const reportsArr = getCurrentCompanyReportsArray();
    const report = reportsArr[reportId];

    $('#print_notation_textarea').attr('disabled', true);
    $('#save_print_notation').hide();
    $('#change_print_notation').show();

    let currentCompanyId = getCookie('companyId');
    let notationValue = $('#print_notation_textarea').val().replace(/\n/g, "<br>");
    encodeURIstring = encodeURI(`/base_func?val_param=sprav_note_chg&val_param1=${currentCompanyId}&val_param2=${report.rep_type}&val_param3=${report.rep_num}&val_param4=${notationValue}`);
    $.post(encodeURIstring, function (data) {
        if (data == 'success') {
            getUserData();
            showPopupNotification('Примечание для печати успешно сохранено!');
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

        let table = $('<table>', {id: 'control_files_list_table', class: 'block-table'}).append(
            $('<tr>').append(
                $('<th>', {text: 'Имя'}),
                $('<th>', {text: 'Загружено'}),
                $('<th>', {text: 'Действия'})
            )
        );

        for (const file of sortedfilesList) {
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
                    $('<i>', {class: 'material-icons file-table-icon', text: 'file_upload', title: 'Обработать', onclick: `chooseCompanyForFile('${fileName}')`}),
                    $('<i>', {class: 'material-icons file-table-icon', text: 'delete', title: 'Удалить файл', onclick: `deleteControlFile('${fileName}')`})

                )
            ).appendTo(table);
        }

        $('#control_files_list .block-content').html(table);
    });
}

function getControlProcessedFilesList() {
    $.post('/base_func?val_param=loader_file_list', function(data) {
        const files = JSON.parse(data).files;

        let table = $('<table>', {id: 'control_processed_files_list_table', class: 'block-table'}).append(
            $('<tr>').append(
                $('<th>', {text: 'Имя'}),
                $('<th>', {text: 'Лист'}),
                $('<th>', {text: 'Компания'}),
                $('<th>', {text: 'Загружено'}),
                $('<th>', {text: 'Действия'})
            )
        );

        if (!isEmpty(files)) {
            for (const file of files) {
                const fileId = file.id;
                const fileName = file.file_name;
                const sheetName = file.sheet_name;
                const creationTime = file.creation_time;
                const orgName = file.org_name;
                let orgId;

                for (const company of USER_DATA.org_list) {
                    if (company.name == orgName) {
                        orgId = company.id;
                    }
                }
    
                $('<tr>', {file_id: fileId}).append(
                    $('<td>', {text: fileName}),
                    $('<td>', {text: sheetName}),
                    $('<td>', {text: orgName}),
                    $('<td>', {text: creationTime}),
                    $('<td>').append(
                            $('<i>', {class: 'material-icons file-table-icon', text: 'remove_red_eye', title: 'Превью', 'data-jq-dropdown': `#jq-dropdown-${DROPDOWN_NUM}`}),
                            $('<i>', {class: 'material-icons file-table-icon', text: 'delete', title: 'Удалить файл', onclick: `deleteControlProcessedFile(${fileId}, '${fileName}')`})
                    )
                ).appendTo(table);

                createDropdownMenuForFile(DROPDOWN_NUM, USER_DATA.head_company.bank_templates, fileId, orgId);

                DROPDOWN_NUM++;
            }
        }

        $('#control_processed_files_list .block-content').html(table);
    })
}

function getControlPerformedFilesList() {
    $.post('/base_func?val_param=document_list', function(data) {
        const files = JSON.parse(data).files;

        let table = $('<table>', {id: 'control_processed_files_list_table', class: 'block-table'}).append(
            $('<tr>').append(
                $('<th>', {text: 'Тип'}),
                $('<th>', {text: 'Компания'}),
                $('<th>', {text: 'Сумма'}),
                $('<th>', {text: 'Загружено'}),
                $('<th>', {text: 'Действия'})
            )
        );

        if(!isEmpty(files)) {
            for (const file of files) {
                const fileId = file.id;
                const fileType = file.type;
                const fileSum = file.summ;
                const fileAuthor = file.author;
                const baseFile = file.base_file;
                const orgName = file.org_name;
                const creationTime = file.creation_time;

                $('<tr>', {file_id: fileId, title: baseFile}).append(
                    $('<td>', {text: fileType}),
                    $('<td>', {text: orgName}),
                    $('<td>', {text: fileSum}),
                    $('<td>', {text: creationTime}),
                    $('<td>').append(
                            $('<i>', {class: 'material-icons file-table-icon', text: 'remove_red_eye', title: 'Превью', onclick: `initializationPerformedFile('${fileId}', '${fileType}')`}),
                            $('<i>', {class: 'material-icons file-table-icon', text: 'settings_backup_restore', title: 'Откатить файл', onclick: `deleteControlPerformedFile('${fileId}', '${fileType}')`})
                    )
                ).appendTo(table);
            }
        }

        $('#control_performed_files_list .block-content').html(table);

    });
}

function initializationProcessedFileTemplate(fileId, companyId, templateNum) {

    $('#template_table, #template_total_td').empty();
    $('#popup_processed_file_template, #popup_background').fadeIn(200);
    createContentLoader('#template_table');


    $.get(`/bank_template?pid=${fileId}&orgid=${companyId}&templ_name=${templateNum}`, function (data) {
        if (data == 'error_no_row') {
            showTextCenter('template_table', 'Неверный шаблон для загрузки');
        }
        else {
            const tableData = JSON.parse(data);
            const theadData = tableData.thead;
            const tbodyData = tableData.tbody;

            if (!isEmpty(tbodyData)) {

                let errorsCounter, rowsCounter, creditsCounter;
                errorsCounter = rowsCounter = creditsCounter = 0;

                const documentData = {};



                const table = $('<table>', { class: 'template-table' }).append(
                    $('<thead>').append(
                        $('<tr>').append(
                            $('<th>')
                        )
                    ),
                    $('<tbody>')
                )

                for (const cell of theadData) {
                    $('<th>', { text: cell }).appendTo(table.find('thead tr'))
                }

                for (const row of tbodyData) {
                    documentData[row.id] = row.accid;

                    const tr = $('<tr>', { row_id: row.id, accid: row.accid, credit: row.credit });

                    $('<td>', { class: 'column-table-main' }).append(
                        $('<input>', { type: 'checkbox', class: 'template-checkbox' }).attr('checked', true)
                    ).appendTo(tr);

                    rowsCounter++;
                    creditsCounter += Number(row.credit);

                    for (i = 0; i < theadData.length; i++) {
                        $('<td>').appendTo(tr);
                    }

                    for (const cell in row.cells) {
                        const tdIndex = theadData.indexOf(cell) + 2;
                        const currentTd = tr.find(`td:nth-child(${tdIndex})`);
                        if (cell == 'Адрес') {
                            if (row.cells[cell] == 'error') {
                                currentTd.append(
                                    $('<button>', { class: 'add-template-adress button-primary', text: 'Добавить' })
                                )

                                errorsCounter++;
                            }
                            else {
                                currentTd.addClass('add-template-adress');
                                currentTd.text(row.cells[cell]);
                                currentTd.attr('title', 'Нажмите, чтобы изменить адрес')
                            }
                        }
                        else {
                            currentTd.text(row.cells[cell]);
                        }
                    }

                    tr.appendTo(table.find('tbody'));
                }

                initializationTemplateTotal(rowsCounter, creditsCounter, errorsCounter);

                table.on('click', function (event) {
                    let target = event.target;
                    let parentTr = $(target).parent().parent();
                    const trCredit = parentTr.attr('credit');
                    let trId = parentTr.attr('row_id');

                    if ($(target).hasClass('template-checkbox')) {
                        let tagretChecked = $(target).prop('checked');
                        const trAccid = parentTr.attr('accid');

                        if (tagretChecked == false) {
                            parentTr.addClass('tr-inactive');
                            parentTr.find('button').attr('disabled', true);
                            delete documentData[trId];

                            rowsCounter--;
                            creditsCounter -= Number(trCredit);

                            if (trAccid == '') {
                                errorsCounter--;
                            }

                            initializationTemplateTotal(rowsCounter, creditsCounter, errorsCounter);
                        }
                        else {
                            parentTr.removeClass('tr-inactive');
                            parentTr.find('button').attr('disabled', false);
                            documentData[trId] = trAccid;

                            rowsCounter++;
                            creditsCounter += Number(trCredit);

                            if (trAccid == '') {
                                errorsCounter++;
                            }

                            initializationTemplateTotal(rowsCounter, creditsCounter, errorsCounter);
                        }
                    }
                    else if ($(target).hasClass('add-template-adress')) {
                        $('#ardess_template_search_btn').off('click');
                        let parentTd = $(target).parent();

                        if ($(target).is('td')) {
                            parentTd = $(target);
                            parentTr = $(target).parent();
                            trId = parentTr.attr('row_id');
                        }

                        const trAccid = parentTr.attr('accid');

                        openPopupWindowLayer2('popup_add_ardess_template');

                        $('#ardess_template_search_btn').on('click', function (event) {
                            event.preventDefault();
                            const adress = $(this).attr('adress');
                            const accid = $(this).attr('accid');
                            if (adress !== undefined) {

                                if (trAccid == '') {
                                    errorsCounter--;
                                }

                                parentTd.text(adress);
                                parentTr.attr('accid', accid);
                                documentData[trId] = accid;

                                parentTd.addClass('add-template-adress');

                                initializationTemplateTotal(rowsCounter, creditsCounter, errorsCounter);

                                closePopupWindowLayer2('popup_add_ardess_template');
                                $('#ardess_template_search_input').val('');
                            }
                        })
                    }
                    else if ($(target).is('td')) {
                        let parentTd = $(target).parent();
                        parentTd.find('.template-checkbox').trigger('click');
                    }
                });

                $('#template_table').html(table);

                function initializationTemplateTotal(rowsNum, creditsSum, errorsNum) {
                    const td = $('#template_total_td');

                    if (errorsNum !== 0) {
                        td.html(`<b>Итог:</b> выбрано строк - <b>${rowsNum}</b>, сумма - <b>${creditsSum.toFixed(2)}</b>, отсутствует адресов - <b style="color:red">${errorsNum}</b>`);
                    }
                    else {
                        if ($('#submit_template').length) {
                            td.html(`<b>Итог:</b> выбрано строк - <b>${rowsNum}</b>, сумма - <b>${creditsSum.toFixed(2)}</b>`);
                            $('<button>', { id: 'submit_template', class: 'button-secondary', text: 'Провести платежный документ' }).appendTo(td);

                            $('#submit_template').on('click', function () {
                                sendBankDocumentData();
                            })
                        }
                        else {
                            td.html(`<b>Итог:</b> выбрано строк - <b>${rowsNum}</b>, сумма - <b>${creditsSum.toFixed(2)}</b>`);
                            $('<button>', { id: 'submit_template', class: 'button-secondary', text: 'Провести платежный документ' }).appendTo(td).fadeOut(150).fadeIn(150).fadeOut(150).fadeIn(150);

                            $('#submit_template').on('click', function () {
                                sendBankDocumentData();
                            })
                        }
                    }
                }

                function sendBankDocumentData() {
                    const creditSum = creditsCounter.toFixed(2);
                    $.ajax({
                        type: 'POST',
                        url: `/bank_template?&doc_id=${fileId}&num=${templateNum}&doc_summ=${creditSum}`,
                        data: JSON.stringify(documentData),
                        success: function (data) {
                            if (data == 'success') {
                                getControlProcessedFilesList();
                                getControlPerformedFilesList();
                                closePopupWindow('popup_processed_file_template');
                            }
                        }
                    });
                }
            }
            else {
                showTextCenter('template_table', 'Неверный шаблон для загрузки');
            }
        }
    });
}

function initializationPerformedFile(fileId, fileName) {
    $('#popup_performed_file_template .popup-content').empty();
    $('#popup_performed_file_template .popup-name').text(fileName);
    $('#popup_performed_file_template, #popup_background').fadeIn(200);
    createContentLoader('#popup_performed_file_template .popup-content');

    $.post(`/base_func?val_param=document_rec&val_param1=${fileId}`, function (data) {
        $('#popup_performed_file_template .popup-content').html(data);
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

function deleteControlProcessedFile(fileId, fileName) {
    if (confirm(`Вы уверены, что хотите удалить файл ${fileName}?`)) {
        let encodeURIstring = encodeURI(`/base_func?val_param=delfilepart&val_param1=${fileId}`);
        $.post(encodeURIstring, function(data) {
            if (data == 'success') {
                $(`#control_processed_files_list_table tr[file_id='${fileId}']`).remove();
            }
        });
    }
}

function deleteControlPerformedFile(fileId, fileName) {
    if (confirm(`Вы уверены, что хотите удалить файл ${fileName}?`)) {
        let encodeURIstring = encodeURI(`/base_func?val_param=rollback_bank&val_param1=${fileId}`);
        $.post(encodeURIstring, function(data) {
            if (data == 'success') {
                // $(`#control_performed_files_list_table tr[file_id='${fileId}']`).remove();
                getControlProcessedFilesList();
                getControlPerformedFilesList();
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
    let companyId = $('#proccess_file_company_select option:selected').attr('company_id');
    let fileName = $('#process_file_btn').attr('file_name');
    let encodeURIstring = encodeURI(`/opfile?attr=runformat&org_id=${companyId}&fname=${fileName}`);
    showLoadingMessage('file_process_loading_message','Подождите, файл обрабатывается...', 'process_file_btn');
    $.post(encodeURIstring, function(data) {
        if (data == 'success') {
            $(`#control_files_list_table tr[filename='${fileName}']`).remove();
            closePopupWindow('popup_process_control_file');
            getControlProcessedFilesList();
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
        const progressBarDiv = $('<div>', {id: 'file_download_progress_bar'}).prependTo('#control_files_upload .block-content');

        let uploadedFilesNum = 0;

        function uploadFile(index) {
            let formdata = new FormData();
            formdata.append("file", files[index]);

            $.ajax({
                type: "POST",
                url: '/upload',
                data: formdata,
                contentType: false,
                processData: false,
                xhr: function () {
                    var xhr = $.ajaxSettings.xhr();
                    uploadedFilesNum++;
                    $('#number_of_uploaded_files').text(`Файлы загружаются, подождите: ${uploadedFilesNum}/${files.length}`);
                    xhr.upload.onprogress = function (event) { 
                        console.log(`progress ${uploadedFilesNum}: Отправлено ${event.loaded} из ${event.total}, ${event.loaded / event.total * 100}%`)
                        progressBarDiv.width(`${event.loaded / event.total * 100}%`);
                    };
                    xhr.upload.onload = function () {
                        progressBarDiv.width('0');
                    };
                    return xhr;
                },
                success: (data) => {
                    if (data == 'success') {
                        getControlFilesList();

                        if(index !== files.length - 1) {
                            uploadFile(index + 1);
                        }
                        else {
                            $('#number_of_uploaded_files').text(`Файлов загружено: ${uploadedFilesNum}/${files.length}`);
                        }
                    }
                }
            });
        }

        uploadFile(0);
    }
    else {
        $('#number_of_uploaded_files').fadeOut(100).fadeIn(100).fadeOut(100).fadeIn(100);
    }
}

// function uploadFiles() {
//     event.preventDefault();

//     let files = $('#files_upload_input').prop('files');
//     if (files.length > 0) {
//         const progressBarDiv = $('<div>', {id: 'file_download_progress_bar'}).prependTo('#control_files_upload .block-content');

//         let uploadedFilesNum = 0;


//         for (file of files) {
//             console.log(file);

//             let formdata = new FormData();
//             formdata.append("file", file);

//             $.ajax({
//                 type: "POST",
//                 url: '/upload',
//                 data: formdata,
//                 contentType: false,
//                 processData: false,
//                 xhr: function () {
//                     // get the native XmlHttpRequest object
//                     var xhr = $.ajaxSettings.xhr();
//                     uploadedFilesNum++;
//                     $('#number_of_uploaded_files').text(`Файлы загружаются, подождите: ${uploadedFilesNum}/${files.length}`);
//                     // set the onprogress event handler
//                     xhr.upload.onprogress = function (event) { 
//                         console.log(`progress ${uploadedFilesNum}: Отправлено ${event.loaded} из ${event.total}, ${event.loaded / event.total * 100}%`)
//                         progressBarDiv.width(`${event.loaded / event.total * 100}%`);
//                     };
//                     // set the onload event handler
//                     xhr.upload.onload = function () {
//                         console.log('DONE!')
//                         progressBarDiv.width('0');
//                     };
//                     // return the customized object
//                     return xhr;
//                 },
//                 success: (data) => {
//                     if (data == 'success') {
//                         getControlFilesList();
//                         if (uploadedFilesNum == files.length) {
//                             $('#number_of_uploaded_files').text(`Файлов загружено: ${uploadedFilesNum}/${files.length}`);
//                         }
//                     }
//                 }
//             });
//         }
//     }
//     else {
//         $('#number_of_uploaded_files').fadeOut(100).fadeIn(100).fadeOut(100).fadeIn(100);
//     }
// }

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

function keyupSearch(inputId, menuId, searchBtnId) {
    let input = $(`#${inputId}`);
    let valueLength = input.val().length;
    let parentDiv = $(`#${menuId} ul`);

    if (valueLength >= 3) {
        parentDiv.empty();
        let searchValue = input.val();
        let currentCompanyId = getCookie('companyId');
        encodeURIstring = encodeURI(`/base_func?val_param=fast_find&val_param1=${searchValue}&val_param2=${currentCompanyId}`);
        $.post(encodeURIstring, function (data) {
            if (data !== '') {
                let searchListArray = JSON.parse(data);
                for (const elem of searchListArray) {
                    let dataArray = elem.split('&');
                    let name = dataArray[0];
                    let accid = dataArray[1];
                    let adress = dataArray[2];
                    $('<li>', {text: name, accid: accid, adress: adress}).appendTo(parentDiv);
                }

                $(`#${menuId} ul li`).each(function() {
                    $(this).on('click', function() {
                        let value = $(this).text();
                        let adress = $(this).attr('adress');
                        let accid = $(this).attr('accid');
                        input.val(value);
                        $(`#${searchBtnId}`).attr('accid', accid);
                        $(`#${searchBtnId}`).attr('adress', adress);

                        $(`#${menuId}`).hide();
                    });
                })

                $(`#${menuId}`).show();
            }
            else {
                $(`#${menuId}`).hide();
            }
        });
    }
    else {
        parentDiv.empty();
        $(`#${menuId}`).hide();
    }
}

function searchInputValue(input, valueType) {
    // const input = $(`#${inputId}`);
    const valueLength = input.val().length;
    
    if (valueLength >= 3) {
        const searchValue = input.val();

        input.siblings().remove();

        const divList = $('<div>', {class: 'popup-search-list'}).append(
            $('<ul>', {class: 'popup-search-list-ul'})
        );

        encodeURIstring = encodeURI(`/base_func?val_param=fast_find&val_param1=${searchValue}&val_param2=${getCookie('companyId')}`);
        $.post(encodeURIstring, function (data) {
            if (data !== '') {
                let searchListArray = JSON.parse(data);
                for (const elem of searchListArray) {
                    const dataArray = elem.split('&');
                    const name = dataArray[0];
                    const accid = dataArray[1];
                    const adress = dataArray[2];
                    const ls = dataArray[3];
                    $('<li>', {text: name, accid: accid, adress: adress, ls: ls}).appendTo(divList.find('ul'));
                }

                input.after(divList);

                divList.find('li').each(function() {
                    $(this).on('click', function() {
                        const ls = $(this).attr('ls');
                        input.val(ls);
                        input.siblings().remove();
                    });
                });

                divList.show();
            }
        });
    }
    else {
        input.siblings().remove();
    }
}

function mainSearchKeyup(inputId, menuId) {
    let input = $(`#${inputId}`);
    let valueLength = input.val().length;
    let parentDiv = $(`#${menuId} ul`);

    if (valueLength >= 3) {
        parentDiv.empty();
        let searchValue = input.val();
        let currentCompanyId = getCookie('companyId');
        encodeURIstring = encodeURI(`/base_func?val_param=fast_find&val_param1=${searchValue}&val_param2=${currentCompanyId}`);
        $.post(encodeURIstring, function (data) {
            if (data !== '') {
                let searchListArray = JSON.parse(data);
                for (const elem of searchListArray) {
                    let dataArray = elem.split('&');
                    let name = dataArray[0];
                    let accid = dataArray[1];
                    let adress = dataArray[2];
                    $('<li>', {text: name, accid: accid, adress: adress}).appendTo(parentDiv);
                }

                $(`#${menuId} ul li`).each(function() {
                    $(this).on('click', function() {
                        let adress = $(this).attr('adress');
                        let accid = $(this).attr('accid');
                        input.val('');
                        openHomePage();

                        $('#obj_agreements_btn, #obj_owners_btn').prop('disabled', false);

                        CURRENT_OBJECT_DATA.accid = accid;
                        getObjectData();
                        $('#obj_adress').text(adress);
                        if ($('#obj_info .header-manipulation').is(':hidden')) {
                            $('#obj_info .header-manipulation').show();
                        }

                        $(`#${menuId}`).hide();
                    });
                })

                $(`#${menuId}`).show();
            }
            else {
                $(`#${menuId}`).hide();
            }
        });
    }
    else {
        parentDiv.empty();
        $(`#${menuId}`).hide();
    }

    // input.focusout(function() {
    //     $(`#${menuId}`).hide();
    // });
}

function setOffsetFastSearchMenu() {
    let relativeElement = $('#sub_search_input');
    let menu = $('#fast_search_menu');

    let top = relativeElement.offset().top + 40;
    let left = relativeElement.offset().left;

    menu.css({top: top, left: left});
}

// function clickFastSearch() {
//     event.preventDefault();
//     if ($('#sub_search_input').val() !== '') {
//         let accid = $('#sub_search_btn').attr('accid');
//         let adress = $('#sub_search_btn').attr('adress');
//         CURRENT_OBJECT_DATA.accid = accid;
//         getObjectData();
//         $('#obj_adress').text(adress);
    
//         if ($('#main_content .header-manipulation').is(':hidden')) {
//             $('#main_content .header-manipulation').show();
//         }
    
//         closePopupWindow('popup_search');
//         $('#sub_search_input').val('');
//     }
// }

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
        for (const elem in newsList) {
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
    const headCompanyId = USER_DATA.head_company.id;

    $.post(`/base_func?val_param=news_portal&val_param1=${headCompanyId}`, function (data) {
        let updatesList = JSON.parse(data).news;
        for (const elem in updatesList) {
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
        $('#report_settings .block-content').empty();
        tabsCollection.removeClass('active');
        $(this).addClass('active');

        const reportsArr = getCurrentCompanyReportsArray();
        const repId = $(this).attr('rep_id');

        const report = reportsArr[repId];

        getReportPreview(report.rep_num, report.rep_type);

        if ('state' in report) {
            const stateSettingContent = $('<div>').append(
                $('<label>', {class: 'checkbox-container', text: 'Вкл.'}).append(
                    $('<input>', {id: 'report_setting_report_on', class: 'checkbox', type: 'checkbox'}),
                    $('<span>', {class: 'checkmark'})
                ),
                $('<label>', {class: 'checkbox-container', text: 'Выкл.'}).append(
                    $('<input>', {id: 'report_setting_report_off',class: 'checkbox', type: 'checkbox'}),
                    $('<span>', {class: 'checkmark'})
                )
            )

            function changeDisplayReport() {
                const displayOnInput = $('#report_setting_report_on');
                const displayOffInput = $('#report_setting_report_off');

                displayOnInput.on('click', function() {
                    if (displayOnInput.prop('checked')) {
                        displayOffInput.prop('checked', false);
                    }
                    else {
                        displayOnInput.prop('checked', true);
                    }
                });

                displayOffInput.on('click', function() {
                    if (displayOffInput.prop('checked')) {
                        displayOnInput.prop('checked', false);
                    }
                    else {
                        displayOffInput.prop('checked', true);
                    }
                });
            }

            initializeSettingItem('#report_settings .block-content', 'Отображение', stateSettingContent, [changeDisplayReport]);

            if (report.state == 'on') {
                $('#report_setting_report_on').prop('checked', true);
            }
            else {
                $('#report_setting_report_off').prop('checked', true);
            }
        }

        if ('print_notation' in report) {
            const stateSettingContent = $('<div>').append(
                $('<textarea>', {id: 'print_notation_textarea', class: 'fixed-textarea', rows:'2', disabled: 'true'}),
                $('<div>').append(
                    $('<button>', {id: 'change_print_notation', class: 'button-primary', onclick: 'changePrintNotation()', text: 'Изменить'}),
                    $('<button>', {id: 'save_print_notation', class: 'button-primary', onclick: `savePrintNotation('${repId}')`, text: 'Сохранить'})
                )
            )
            initializeSettingItem('#report_settings .block-content', 'Примечание для печати', stateSettingContent);
            $('#print_notation_textarea').val(report.print_notation.replace(/<br ?\/?>/g, '\n'));
        }

        if (report.rep_type == 'report') {
            initializeSettingItem('#report_settings .block-content', 'Даты по умолчанию', '');
        }

    });
}

function getReportPreview(repNum, repType) {
    const divForContent = $('#report_settings_preview .block-content');
    $.get(`/report?rnum=${repNum}&rtype=${repType}&accid=201287&humanid=401245&dateb=&datee=`, function (data) {
        divForContent.html(data);
    });
}

function validateFormInputs(inputsArray) {
    let valid = true;

    for (input of inputsArray) {
        if (!input.val()) {
            input.fadeOut(100).fadeIn(100).fadeOut(100).fadeIn(100);
            valid = false;
        }
    }

    return valid;
}

function clearFormInputs(inputsArray) {
    for (const input of inputsArray) {
        input.val('');
    }
}

function applyTemplateObjectList() {
    event.preventDefault();
    closePopupWindow('popup_object_list_settings');

    const name = $('#choose_template_select').val();

    $('.object-list-tree').empty();
    createContentLoader('#object_list_tree');
    $.ajax({
        type: "POST",
        url: "/base_func",
        data: encodeURI(`val_param=house_tree&val_param1=${name}`),
        success: function (data) {
            createObjectsTree(data);
            removeContentLoader('#object_list_tree', '.object-list-tree');
            $('#current_template_name').text(name);
            $('#clear_template_btn').attr('disabled', false);
        }
    });
}

function changeTemplateSelect() {
    const name = $('#choose_template_select').val();
    const description = OBJECT_TREE_TEMPLATES[name];
    $('#choose_template_description').text(description);
}

function clearTemplateObjectList() {
    event.preventDefault();
    $('.object-list-tree').empty();
    closePopupWindow('popup_object_list_settings');
    $('#current_template_name').text('Отсутствует');
    $('#clear_template_btn').attr('disabled', true);
    getObjectsTreeData();
}

function getRegistriesData(callback) {
    $.post( "/base_func?val_param=registries_list", function( data ) {
        registriesData = JSON.parse(data);

        if (!isEmpty(callback)) {
            for (const func of callback) {
                func();
            }
        }
    });
}

function chooseDarkTheme() {
    const checkbox = $('#dark_theme_checkbox');

    if (checkbox.prop('checked')) {
        $(document.documentElement).attr('theme', 'dark');
        $('#default_theme_checkbox').prop('checked', false);
        localStorage.setItem('color_theme', 'dark');
        changeColorTheme('dark');
    }
    else {
        checkbox.prop('checked', true);
    }
}

function chooseDefaultTheme() {
    const checkbox = $('#default_theme_checkbox');

    if (checkbox.prop('checked')) {
        $(document.documentElement).removeAttr('theme')
        $('#dark_theme_checkbox').prop('checked', false);
        localStorage.setItem('color_theme', 'default');
        changeColorTheme('default');
    }
    else {
        checkbox.prop('checked', true);
    }
}

function changeColorTheme(theme) {
    encodeURIstring = encodeURI(`/base_func?val_param=chg_user_attr&val_param1=color_theme&val_param2=${theme}`);
    $.post(encodeURIstring, function (data) {
    });
}

function acceptColorTheme() {
    const theme = USER_DATA.color_theme;

    if (theme) {
        if ( theme == 'dark') {
            $('#dark_theme_checkbox').prop('checked', true);
            $(document.documentElement).attr('theme', 'dark');
            $('#default_theme_checkbox').prop('checked', false);
            localStorage.setItem('color_theme', 'dark');
        }
    }
}

function changeUserPassword() {
    event.preventDefault();

    const currentPassword = $('#change_login_input');
    const newPassword = $('#change_password_input');
    const newPasswordRepeat = $('#change_password_repeat_input');

    const validateinputsArray = [currentPassword, newPassword, newPasswordRepeat ];

    if (validateFormInputs(validateinputsArray)) {
        if (newPassword.val() == newPasswordRepeat.val()){
            const encodeURIstring = encodeURI(`/base_func?val_param=chg_passwd&val_param1=${currentPassword.val()}&val_param2=${newPassword.val()}`);
            $.post(encodeURIstring, function (data) {
                if (data == 'wrong_pwd') {
                    showPopupNotification('Текущий пароль введен не верно!');
                }
                else if (data == 'success') {
                    showPopupNotification('Пароль успешно изменен! Вы будете перенаправлены на страницу входа.');
                    clearFormInputs(validateinputsArray);
                    setTimeout(logout, 4000);

                    function logout() {
                        location.reload();
                    }
                }
            });
        }
        else {
            showPopupNotification('Новый пароль и подтверждение пароля не совпадают!');
        }
    }
}

function cancelUserPassword() {
    event.preventDefault();

    const currentPassword = $('#change_login_input');
    const newPassword = $('#change_password_input');
    const newPasswordRepeat = $('#change_password_repeat_input');

    const validateinputsArray = [currentPassword, newPassword, newPasswordRepeat ];

    clearFormInputs(validateinputsArray);
}

function showUserLogin() {
    $('#popup_profile .popup-fullscreen-name').text(`Профиль пользователя ${USER_DATA.user_login}`);
}

function createPopupNotification(message) {
    const notification = $('<div>', { class: 'popup-notification' }).append(
        $('<span>', {class: 'icon'}).append(
            $('<i>', {class: 'material-icons', text: 'notifications'})
        ),
        $('<span>', {class: 'content', text: message}),
        $('<span>', {class: 'notification-close'}).append(
            $('<i>', {class: 'material-icons', text: 'close', title: 'Закрыть уведомление'}).on('click', function() {
                removePopupNotification(notification);
            })
        )
    );
    return notification;
}

function removePopupNotification(notification) {
    notification.animate({
        right: -365
    }, 500, () => {
        if (notification.prev('.popup-notification').length) {
            notification.prevAll('.popup-notification').animate({
                bottom: '-=60'
            }, 400);
        }
        notification.remove();
    });
}

function showPopupNotification(message) {
    const notification = createPopupNotification(message);

    if ($('.popup-notification').length) {
        $('.popup-notification').animate({
            bottom: '+=60'
        }, 400, function () {
            addPopupNotification();
        });
    }
    else {
        addPopupNotification();
    }

    function addPopupNotification() {
        notification.appendTo('body');
        notification.animate({
            right: 0
        }, 400, () => {
            // setTimeout(removePopupNotification(notification), 4000);
        });
    }
}


function createRegistrySettingsPopup() {
    if ($('#popup_registry_settings').length) {
        $('#popup_registry_settings').remove();
    }
    
    $('<div>', {id: 'popup_registry_settings', class: 'popup-window'}).append(
        $('<div>', {class: 'popup-header'}).append(
            $('<div>', {class: 'popup-name', text: 'Отображение столбцов в реестре'}),
            $('<div>', {class: 'popup-close'}).append(
                $('<i>',  {class: 'material-icons', text: 'close'}).on('click', () => {closePopupWindow('popup_registry_settings')})
                )
        ),
        $('<div>',  {class: 'popup-content'})
        ).appendTo('#popup_background')
    } 

    function getObjectsGroupsList() {
    $('#control_object_groups .block-content, #add_objects_group_user_select').empty();
    createContentLoader('#control_object_groups .block-content');
    $.post('/base_func?val_param=house_group_list', (data) => {
        const objectsGroupsData = JSON.parse(data);

        if(!isEmpty(objectsGroupsData.users_list)) {
            for (const user of objectsGroupsData.users_list) {
                const userData = user.split('&');
                $('<option>', {text: userData[0], user_id: userData[1]}).appendTo('#add_objects_group_user_select');
            }
        }
        
        if (!isEmpty(objectsGroupsData.house_groups)) {
            const table = $('<table>', {class: 'block-table'}).append(
                $('<tr>').append(
                    $('<th>', {text: 'Название группы'}),
                    $('<th>', {text: 'Автор'}),
                    $('<th>', {text: 'Дата создания'}),
                    $('<th>', {text: 'Действия'})
                )
                );
    
                for (const group in objectsGroupsData.house_groups) {
                const groupData = objectsGroupsData.house_groups[group];
                const tr = $('<tr>').append(
                    $('<td>', {text: group}),
                    $('<td>', {text: groupData.author}),
                    $('<td>', {text: groupData.creation_date})
                );
                
                const manipulationTd = $('<td>')
                
                $('<i>', {class: 'material-icons', text: 'supervisor_account', title: 'Управление пользователями', onclick: `showObjectGroupUsers(${groupData.number})`}).appendTo(manipulationTd);

                if (groupData.author == USER_DATA.user_login) {
                    $('<i>', {class: 'material-icons', text: 'delete', title: 'Удалить', onclick: `deleteObjectsGroup('${group}')`}).appendTo(manipulationTd);
                }

                manipulationTd.appendTo(tr);
                
                tr.on('click', function(e) {
                    if (e.target.nodeName !== 'TD') {
                        return;
                    }
                    showObjectsGroup(group, groupData.objects_list);
                });
                
                tr.appendTo(table);
            }
            
            $('#control_object_groups .block-content').html(table);
        }
        else {
            showTextCenter('control_object_groups .block-content', 'Группы объектов отсутствуют');
        }
    });
    
    function showObjectsGroup(name, objectsList) {
        const popupContent = $('#popup_objects_group .popup-content');
        popupContent.empty();
        $('#popup_objects_group .popup-name').html(`Группа объектов "${name}"`);
        openPopupWindow('popup_objects_group');
        createContentLoader(popupContent);

        const content = $('<div>');
        
        $('<p>', {align: 'center', text: name, style: 'font-weight:bold'}).appendTo(content);

        const table = $('<table>', {class: 'report-table', style: 'text-align: center'});

        $('<tr>').append(
            $('<th>', {text: 'Адрес'}),
            $('<th>', {text: 'Список квартир'}),
            $('<th>', {text: 'Кол-во квартир'})
        ).appendTo(table);

        let apartamentsAmount = 0;

        for (const object of objectsList) {
            const objectData = object.split('&');
            $('<tr>').append(
                $('<td>', {text: objectData[0]}),
                $('<td>', {text: objectData[1]}),
                $('<td>', {text: objectData[2]})
            ).appendTo(table);
            
            apartamentsAmount = apartamentsAmount + Number(objectData[2]);
        }
        
        $('<tr>').append(
            $('<td>', {text: `Итого: домов - ${objectsList.length}, квартир - ${apartamentsAmount}`, style: 'font-weight: bold', colspan:  '3'})
        ).appendTo(table);
        
        table.appendTo(content);
        
        popupContent.html(content);
    }
}

function getObjectsGroupUsersList(groupNumber) {
    $('#objects_group_users_list').empty();
    
    $.post(`/base_func?val_param=house_group_usr&val_param1=${groupNumber}`, function (data) {
        const usersData = JSON.parse(data).users_list;
        
        if (!isEmpty(usersData)) {
            for (const userData of usersData) {
                const user = userData.split('&');
                $('<div>', {class: 'objects-group-user'}).append(
                    $('<div>', {class: 'objects-group-user-name', text: user[0]}),
                    $('<div>', {class: 'objects-group-user-delete'}).append(
                        $('<i>', {class: 'material-icons', text: 'delete', title: 'Удалить', onclick: `deleteObjectsGroupUser(${groupNumber}, '${user[0]}', ${user[1]})`})
                        )
                ).appendTo('#objects_group_users_list');
            }
        }
        else {
            $('<div>', {class: 'notification', text: 'Пользователи отсутствуют'}).appendTo('#objects_group_users_list');
        }    
    });
}

function showObjectGroupUsers(groupNumber) {
    openPopupWindow('popup_objects_group_users');

    getObjectsGroupUsersList(groupNumber);
    $('#add_objects_group_user_btn').off('click')
    $('#add_objects_group_user_btn').on('click', function() {
        addObjectsGroupUser(groupNumber);
    });
}

function addObjectsGroupUser(groupNumber) {
    event.preventDefault();
    const userId = $('#add_objects_group_user_select option:selected').attr('user_id');
    if (userId) {
        const encodeURIstring = encodeURI(`/base_func?val_param=add_usr_hsgrlst&val_param1=add&val_param2=${groupNumber}&val_param3=${userId}`);
        $.post(encodeURIstring, function (data) {
            if (data  == 'success') {
                $('#add_objects_group_user_select option:first-child').prop('selected', true);
                getObjectsGroupUsersList(groupNumber);
                showPopupNotification('Пользователь успешно привязан к группе объектов!'); 
            }
            else if (data == 'already_exist') {
                showPopupNotification('Данный пользователь уже привязан к этой группе объектов!');
            }
        });
    }
    else {
        showPopupNotification('Выберите пользователя из списка!');
    }
}

function deleteObjectsGroupUser(groupNumber, userName, userId) {
    if (confirm(`Вы уверены, что хотите удалить Пользователя ${userName} из этой группы объектов?`)) {
        const encodeURIstring = encodeURI(`/base_func?val_param=add_usr_hsgrlst&val_param1=del&val_param2=${groupNumber}&val_param3=${userId}`);
        $.post(encodeURIstring, function (data) {
            getObjectsGroupUsersList(groupNumber);
            showPopupNotification(`Пользователь ${userName} успешно удален!`);
        });
    }
}

function getRegistryList(type) {
    $('#registy_add_entry_btn, #registry_print_icon, #registry_lock_icon, #registry_settings_icon, #registy_convert_to_excel_btn, #no_registries_div').remove();
    let calendarValue = getCalendarValue('registry_settings_calendar');
    let registryUl;

    if (type == 'regular') {
        $('#registry_settings_calendar, #regular_registries_ul').show();
        $('#constant_registries_ul').hide();
        registryUl = $('#regular_registries_ul');
        calendarValue = getCalendarValue('registry_settings_calendar');
    }
    else if (type == 'constant') {
        $('#registry_settings_calendar, #regular_registries_ul').hide();
        $('#constant_registries_ul').show();
        registryUl = $('#constant_registries_ul');
        calendarValue = '';
    }
    registryUl.empty();
    $.post(`/base_func?val_param=ree_reestrs&val_param1=${type}&val_param2=${calendarValue}`, (data) => {
        const registryList = JSON.parse(data);
        console.log(registryList)

        if (!isEmpty(registryList)) {
            createRegistrySettingsPopup();

            for (const registry of registryList) {
                const li = $('<li>', {registry_id: registry.id}).append(
                    $('<a>').append(
                        $('<span>', {text: registry.name})
                    )
                ).appendTo(registryUl);

                li.on('click', function () {
                    const tabsCollection = registryUl.find('li');
                    tabsCollection.removeClass('active');
                    $(this).addClass('active');
                    getRegistryData(registry.id, registry.name, type, registry.doc_type);
                })
            }

            const firstClildLi = registryUl.find('li:first-child');;
            firstClildLi.addClass('active');
            firstClildLi.trigger('click');
        }
        else {
            $('#registry_settings_content .block-content').empty();

            $('<div>', {id: 'no_registries_div', style: 'text-align: center'}).append(
                $('<p>', {text: 'Реестры отсутствуют', style: 'font-size: 16px'}),
                $('<p>').append(
                    $('<button>', {class: 'button-secondary', text: 'Создать'})
                )
            ).appendTo('#registry_settings_select_menu');
        }
    });
}

function initializeRegistrySettings(registryId, registryData) {
    $('#popup_registry_settings .popup-content').empty();
    const div = $('<div>', {style: 'height: 500px; overflow: auto'});
    const table = $('<table>', {id: 'registry_column_settings_table', class: 'table-form'});

    $('<tr>').append(
        $('<th>', {text: 'Столбец'}),
        $('<th>', {text: 'Отображение'})
    ).appendTo(table);

    for (const elem of registryData) {
        const tr = $('<tr>');
        $('<td>', {text: elem.name}).appendTo(tr);
        const td = $('<td>').appendTo(tr);
        const div = $('<div>', {style: 'width: max-content; margin: auto'}).appendTo(td);
        const labelOn = $('<label>', {class: 'checkbox-container', text: 'Вкл.', style: 'float: left; margin-right: 10px; display: block; text-align: center'}).appendTo(div);
        const inputOn = $('<input>', {class: 'checkbox', type: 'checkbox', value: 'on', column: elem.name}).appendTo(labelOn);
        $('<span>', {class: 'checkmark'}).appendTo(labelOn);

        const labelOff = $('<label>', {class: 'checkbox-container', text: 'Выкл.', style: 'float: left; margin-right: 10px; display: block; text-align: center'}).appendTo(div);
        const inputOff = $('<input>', {class: 'checkbox', type: 'checkbox',  value: 'off', column: elem.name}).appendTo(labelOff);
        $('<span>', {class: 'checkmark'}).appendTo(labelOff);

        const isHidden = (elem.hidden == 'true');

        if (isHidden) {
            inputOff.prop('checked', true);
        }
        else {
            inputOn.prop('checked', true);
        }

        addEventOnOffToggle(inputOn, inputOff);

        tr.appendTo(table);
    }

    table.appendTo(div);

    div.appendTo('#popup_registry_settings .popup-content');

    $('<div>', {class: 'form-submit-btn'}).append(
        $('<button>', {id: 'registry_column_settings_btn', class: 'button-primary', text: 'Сохранить'})
    ).appendTo('#popup_registry_settings .popup-content');
}

function addEventOnOffToggle(inputOn, inputOff) {
    inputOn.on('click', function() {
        if (inputOn.prop('checked')) {
            inputOff.prop('checked', false);
        }
        else {
            inputOn.prop('checked', true);
        }
    });

    inputOff.on('click', function() {
        if (inputOff.prop('checked')) {
            inputOn.prop('checked', false);
        }
        else {
            inputOff.prop('checked', true);
        }
    });
}


function getRegistryData(registryId, registryName, registryType, documentType) {
    $('#registry_print_icon').off('click');
    $('#registy_add_entry_btn, #registry_print_icon, #registry_lock_icon, #registry_settings_icon, #registy_convert_to_excel_btn, #no_registries_div').remove();
    $('#registry_settings_content .block-content, #add_registry_entry_table').empty();
    createContentLoader('#registry_settings_content .block-content');
    $.post(`/base_func?val_param=ree_recodrs&val_param1=${registryId}&val_param2=${documentType}`, (data) => {
        const registryData = JSON.parse(data);
        displayRegistry(registryData, registryId, registryName, registryType, documentType);
    });
}

function displayRegistry(data, registryId, registryName, registryType, documentType) {
    const thead = data.thead;
    const tbody = data.tbody;
    const tfoot = data.tfooter;
    const registryBlocked  = data.blocked;

    const registryIsBlocked = (registryBlocked == 'true');

    initializeRegistrySettings(registryId, thead);

    let theadData = [];

    const table = $('<table>', {id: 'registry_table', class: 'main-table'}).append(
        $('<thead>').append(
            $('<tr>')
        ),
        $('<tbody>')
    );

    const addEntryTable = $('<table>', { id: 'add_registry_entry_table', class: 'main-table' }).append(
        $('<tr>'),
        $('<tr>'),
        $('<tr>'),
        $('<tr>'),
        $('<tr>'),
        $('<tr>')
    );

    const firstRowElems = ['ЛС', 'Месяц', 'Год', 'Номер платёжки', 'Дата платёжки', 'Примечание'];

    for (const th of thead) {
        const thElem = $('<th>', {text: th.name}).appendTo(table.find('thead tr'));

        const isHidden = (th.hidden == 'true');

        if(isHidden) {
            thElem.css({'display': 'none'});
        }

        const nameProp = { 'name': th.name };
        theadData.push(nameProp);

        if (inObject(th.name, firstRowElems)) {
            if (th.name == 'Примечание') {
                $('<td>', {text: th.name, colspan: thead.length - 4, class: 'td-bold'}).appendTo(addEntryTable.find('tr:nth-child(1)'));
                $('<td>', {colspan: thead.length - 4}).append(
                    $('<input>', {type: 'text', class: 'table-td-input', name: th.name, value_type: th.type})
                ).appendTo(addEntryTable.find('tr:nth-child(2)'));
            }
            else {
                $('<td>', {text: th.name, class: 'td-bold'}).appendTo(addEntryTable.find('tr:nth-child(1)'));
                $('<td>').append(
                    $('<input>', {type: 'text', class: 'table-td-input', name: th.name, value_type: th.type})
                ).appendTo(addEntryTable.find('tr:nth-child(2)'));
            }
        }
        else if (th.name == 'Итого') {
            $('<td>', {text: `Итого`, colspan: thead.length, class: 'td-bold'}).appendTo(addEntryTable.find('tr:nth-child(5)'));
            $('<td>', {colspan: thead.length}).append(
                $('<input>', {id: 'add_entry_total_sum', type: 'text', class: 'table-td-input', name: th.name, value_type: th.type})
            ).appendTo(addEntryTable.find('tr:nth-child(6)'));
        }
        else {
            if (th.name !== 'Автор' && th.name !== 'Адрес') {
                $('<td>', {text: th.name, class: 'td-bold'}).appendTo(addEntryTable.find('tr:nth-child(3)'));
                $('<td>').append(
                    $('<input>', {type: 'text', class: 'table-td-input', name: th.name, value_type: th.type})
                ).appendTo(addEntryTable.find('tr:nth-child(4)'));
            }
        }
    }

    if (!registryIsBlocked) {
        $('<th>', {text: 'Действия'}).appendTo(table.find('thead tr'));
    }

    if (!isEmpty(tbody)) {
        for (const entry of tbody) {
            const tr = $('<tr>');

            let editEntryData = theadData.slice();
            for (const index in entry.data) {
                const td = $('<td>', { text: entry.data[index]}).appendTo(tr);
                editEntryData[index].value = entry.data[index];

                const isHidden = (thead[index].hidden == 'true');

                if(isHidden) {
                    td.css({'display': 'none'});
                }
            }

            let entryData = {};
            for (const elem of editEntryData) {
                entryData[elem.name] = elem.value;
            }

            const tdOperation = $('<td>');
            tdOperation.appendTo(tr);

            if (entry.status == 'delete') {
                tr.find('td').addClass('delete-td');
            }
            else {
                if (!registryIsBlocked) {    
                    const editEntryIcon = $('<i>', { class: 'material-icons', text: 'edit', title: 'Изменить' }).appendTo(tdOperation);
                    editEntryIcon.on('click', function() {
                        openEditRegistryEntryPopup(registryId, entry.id, entryData);
                    });
                    $('<i>', { class: 'material-icons', text: 'delete', title: 'Удалить'}).on('click', function() {
                        deleteRegistryEntry(registryId, entry.id, registryName, registryType, documentType)
                    }).appendTo(tdOperation);
    
                }
            }



            tr.appendTo(table.find('tbody'));
        }
    }

    if (!isEmpty(tfoot)) {
        for (const row of tfoot) {
            const tr = $('<tr>');
            for (const index in row) {
                const tdElem = $('<td>', { class: 'table-tfoot-td', text: row[index] }).appendTo(tr);

                const isHidden = (thead[index].hidden == 'true');

                if (isHidden) {
                    tdElem.css({ 'display': 'none' });
                }
            }

            tr.appendTo(table.find('tbody'));
        }
    }

    addEntryTable.prependTo('#popup_add_edit_registry_entry .popup-content');

    const headerManipulation = $('#registry_settings_content .header-manipulation');

    if (!$('#registy_add_entry_btn').length) {
        if (!registryIsBlocked) {
            $('<button>', {id: 'registy_add_entry_btn', class: 'button-primary', style: 'float: right', title: 'Добавить запись в реестр', text: 'Добавить запись'}).appendTo(headerManipulation);
        }
        $('<button>', {id: 'registy_convert_to_excel_btn', class: 'excel-button', title: 'Конвертировать в Excel', text: 'Excel'}).appendTo(headerManipulation);
        $('<i>', {id: 'registry_settings_icon', class: 'material-icons', title: 'Настройки', text: 'settings'}).on('click', () => {openPopupWindow('popup_registry_settings')}).appendTo(headerManipulation);
        $('<i>', {id: 'registry_print_icon', class: 'material-icons', title: 'Печать', text: 'print'}).appendTo(headerManipulation);

        if (registryType == 'regular') {
            if (registryIsBlocked) {
                $('<i>', {id: 'registry_lock_icon', class: 'material-icons', title: 'Реестр закрыт', text: 'lock'}).appendTo(headerManipulation);
            }
            else {
                const lockIcon = $('<i>', {id: 'registry_lock_icon', class: 'material-icons', title: 'Реестр открыт. Нажмите, чтобы закрыть реестр', text: 'lock_open'}).appendTo(headerManipulation);
                lockIcon.on('click', function() { 
                    blockRegistry(registryId, registryName, registryType, documentType);
                });
            }
        }

    }


    $('#add_registry_entry_table input').each(function() {
        const input = $(this);
        const valueType = $(this).attr('value_type')
        if (valueType == 'numeric') {
            input.inputmask('numeric', {
                rightAlign: false
            });
        }
        else if (valueType == 'date') {
            input.inputmask('99.99.9999')
        }
    });

    $("#add_registry_entry_table input[name='ЛС']").keyup(function() {
        searchInputValue($(this), 'valueType');
    });
    $('#registry_settings_content .block-content').html(table);
    $('#registry_print_icon').on('click', function() {
        printRegistry();
    });

    $('#registy_add_entry_btn').off('click');
    $('#registy_add_entry_btn').on('click', () => {
        openAddRegistryEntryPopup(registryId, registryName, registryType, documentType);
    });

    $('#registry_column_settings_btn').off('click');
    $('#registry_column_settings_btn').on('click', () => {
        saveRegisrtrySettings(registryId, registryName, registryType, documentType);
    });

    $('#registy_convert_to_excel_btn').off('click');
    $('#registy_convert_to_excel_btn').on('click', () => {
        const table = $('#registry_settings_content .block-content');
        let convertibleContent = table.clone();
        const hiddenTdCollection = convertibleContent.find('td, th');
        hiddenTdCollection.each(function() {
            if ($(this).css('display') == 'none' || $(this).hasClass('delete-td')) {
                $(this).remove()
            }
        });

        if (!registryIsBlocked) {
            convertibleContent.find('th:last-child').remove();
            convertibleContent.find('td:last-child').remove();
        }

        const fileName = `реестр_${registryName}_${sessionStorage['currentCompany']}`.replace(/ /g, '_');
        console.log(fileName)

        convertContentToExcel(convertibleContent.html(), fileName);
    });
}

function openAddRegistryEntryPopup(registryId, registryName, registryType, documentType) {
    $('#popup_add_edit_registry_entry .popup-name').text('Добавить запись в реестр');
    $('#add_registry_entry_btn').text('Добавить');
    $('#add_registry_entry_table input').val('');
    $('#add_entry_total_sum').attr('disabled', false);

    $('#add_registry_entry_btn').off('click');
    $('#add_registry_entry_btn').on('click', () => {
        addRegistryEntry(registryId, registryName, registryType, documentType);
    });

    const inputCollection = $('#add_registry_entry_table').find('tr:nth-child(4) input');
    inputCollection.each(function() {
        $(this).off('keyup');
        $(this).on('keyup', function() {
            $('#add_entry_total_sum').val(sumUpInputValues(inputCollection));
            inputCollection.each(function() {
                if ($(this).val() !== '') {
                    $('#add_entry_total_sum').attr('disabled', true);
                    return false;
                }
                else {
                    $('#add_entry_total_sum').attr('disabled', false);
                }
            });

        });
    });

    $('#add_entry_total_sum').on('keyup', function() {
        if ($(this).val() !== '') {
            inputCollection.each(function() {
                $(this).val('');
                $(this).attr('disabled', true);
            });
        }
        else {
            inputCollection.each(function() {
                $(this).attr('disabled', false);
            });
        }
    });

    openPopupWindow('popup_add_edit_registry_entry');
}

function openEditRegistryEntryPopup(registryId, entryId, entryData) {
    $('#popup_add_edit_registry_entry .popup-name').text('Изменить запись в реестре');
    $('#add_registry_entry_btn').text('Сохранить');
    $('#add_entry_total_sum').attr('disabled', true);

    $('#add_registry_entry_btn').off('click');
    $('#add_registry_entry_btn').on('click', () => {
        editRegistryEntry(registryId, entryId, registryName, registryType, documentType);
    });

    $('#add_registry_entry_table input').each(function() {
        const inputName = $(this).attr('name');
        $(this).val(entryData[inputName]);
    });

    const inputCollection = $('#add_registry_entry_table').find('tr:nth-child(4) input');
    inputCollection.each(function() {
        $(this).off('keyup');
        $(this).on('keyup', function() {
            $('#add_entry_total_sum').val(sumUpInputValues(inputCollection));
        });
    });

    openPopupWindow('popup_add_edit_registry_entry')
}

function sumUpInputValues(inputCollection) {
    let totalSum = 0;

    for (const input of inputCollection) {
        const value = input.value;

        if  (value !== '') {
            totalSum += Number(value);
        }
    }

    if (totalSum == 0) {
        return '';
    }

    return totalSum;
}

function saveRegisrtrySettings(registryId, registryName, registryType, documentType) {
    let dataObj = {};
    
    $('#registry_column_settings_table input').each(function() {
        const input = $(this);
        if (input.prop('checked')) {
            const columnName = input.attr('column');
            const state =  input.attr('value');

            let hidden;

            if (state == 'on') {
                hidden = false;
            }
            else if (state == 'off') {
                hidden = true;
            }

            dataObj[columnName] = hidden;
        }
    });

    $.ajax({
        url: `/base_func?val_param=chgthead_reereestrs&val_param1=${registryId}`,
        type: 'POST',
        data: JSON.stringify(dataObj),
        contentType: 'application/json',
        success: function() {
            closePopupWindow('popup_registry_settings');
            showPopupNotification('Отображение столбцов в реестре успешно сохранено!');
            getRegistryData(registryId, registryName, registryType, documentType);
        }
    });
} 

function addRegistryEntry(registryId, registryName, registryType, documentType) {
    event.preventDefault();
    const validateinputsArray = [];

    let paymentNum;
    let paymentData;
    let ls;
    let month;
    let year;
    let notation;
    let sumArr = [];
    const totalSum = $('#add_entry_total_sum').val();

    $('#add_registry_entry_table input').each(function() {
        const input = $(this);
        const inputName = $(this).prop('name');

        if (inputName == 'Номер платёжки') {
            paymentNum = input.val();
        }
        else if (inputName == 'Дата платёжки') {
            paymentData = input.val();
            validateinputsArray.push(input);
        }
        else if (inputName == 'ЛС') {
            ls = input.val();
            validateinputsArray.push(input);
        }
        else if (inputName == 'Месяц') {
            month = input.val();
            validateinputsArray.push(input);
        }
        else if (inputName == 'Год') {
            year = input.val();
            validateinputsArray.push(input);
        }
        else if (inputName == 'Примечание') {
            notation = input.val();
        }
        else {
            if (input.attr('id') !== 'add_entry_total_sum') {
                sumArr.push(input.val());
            }
        }
    });

    if (validateFormInputs(validateinputsArray)) {
        const encodeURIstring = encodeURI(`/base_func?val_param=addchg_ree_recodrs&val_param1=${registryId}&val_param2=${ls}&val_param3=${month}&val_param4=${year}&val_param5=${paymentNum}&val_param6=${paymentData}&val_param7=${notation}&val_param8=${sumArr}&val_param9=add&val_param10=${totalSum}`);

        $.post(encodeURIstring, (data) => {
            if (data == 'wrong_ls') {
                showPopupNotification('Значение ЛС не найдено в базе данных!');
            }
            else if (data == 'success') {
                closePopupWindow('popup_add_edit_registry_entry');
                getRegistryData(registryId, registryName, registryType, documentType);
                showPopupNotification('Запись в реестр успешно добавлена!');
            }
        });
    }
    else {
        showPopupNotification('Отсутствует значение ЛС, Месяц или Год!');
    }
}

function editRegistryEntry(registryId, entryId, registryName, registryType, documentType) {
    event.preventDefault();
    const validateinputsArray = [];

    let paymentNum;
    let paymentData;
    let ls;
    let month;
    let year;
    let notation;
    let sumArr = [];
    const totalSum = $('#add_entry_total_sum').val();

    $('#add_registry_entry_table input').each(function() {
        const input = $(this);
        const inputName = $(this).prop('name');

        if (inputName == 'Номер платёжки') {
            paymentNum = input.val();
        }
        else if (inputName == 'Дата платёжки') {
            paymentData = input.val();
            validateinputsArray.push(input);
        }
        else if (inputName == 'ЛС') {
            ls = input.val();
            validateinputsArray.push(input);
        }
        else if (inputName == 'Месяц') {
            month = input.val();
            validateinputsArray.push(input);
        }
        else if (inputName == 'Год') {
            year = input.val();
            validateinputsArray.push(input);
        }
        else if (inputName == 'Примечание') {
            notation = input.val();
        }
        else {
            if (input.attr('id') !== 'add_entry_total_sum') {
                sumArr.push(input.val());
            }
        }
    });

    if (validateFormInputs(validateinputsArray)) {
        const encodeURIstring = encodeURI(`/base_func?val_param=addchg_ree_recodrs&val_param1=${entryId}&val_param2=${ls}&val_param3=${month}&val_param4=${year}&val_param5=${paymentNum}&val_param6=${paymentData}&val_param7=${notation}&val_param8=${sumArr}&val_param9=chg&val_param10=${totalSum}`);

        $.post(encodeURIstring, (data) => {
            if (data == 'wrong_ls') {
                showPopupNotification('Значение ЛС не найдено в базе данных!');
            }
            else if (data == 'success') {
                closePopupWindow('popup_add_edit_registry_entry');
                getRegistryData(registryId, registryName, registryType, documentType);
                showPopupNotification('Запись в реестре успешно изменена!');
            }
            else if (data == 'wrong_user') {
                showPopupNotification('У Вас нет прав на изменение этой записи!')
            }
            else if (data == 'already_deleted') {
                getRegistryData(registryId, registryName, registryType, documentType);
                showPopupNotification('Данная запись уже удалена из реестра!'); 
            }
        });
    }
    else {
        showPopupNotification('Отсутствует значение ЛС, Месяц или Год!');
    }
}

function deleteRegistryEntry(registryId, entryId, registryName, registryType, documentType) {
    if (confirm(`Вы уверены, что хотите удалить запись из реестра?`)) {
        const encodeURIstring = encodeURI(`/base_func?val_param=addchg_ree_recodrs&val_param1=${entryId}&val_param2=&val_param3=&val_param4=&val_param5=&val_param6=&val_param7=&val_param8=&val_param9=del&val_param10=`);
    
        $.post(encodeURIstring, (data) => {
            if (data == 'success') {
                getRegistryData(registryId, registryName, registryType, documentType);
                showPopupNotification('Запись из реестра успешно удалена!');
            }
            else if (data == 'wrong_user') {
                showPopupNotification('У Вас нет прав на удаление этой записи!')
            }
            else if (data == 'already_deleted') {
                getRegistryData(registryId, registryName, registryType, documentType);
                showPopupNotification('Данная запись уже удалена из реестра!'); 
            }
        });
    }
}

function blockRegistry(registryId, registryName, registryName, registryType, documentType) {
    if (confirm(`Вы уверены, что хотите закрыть реестр "${registryName}"?`)) {
        encodeURIstring = encodeURI(`/base_func?val_param=ree_reestrs_close&val_param1=${registryId}`);
        $.post(encodeURIstring, function (data) { 
            if (data == 'success') {
                showPopupNotification(`Реестр "${registryName}" успешно закрыт!`);
                getRegistryData(registryId, registryName, registryType, documentType);
            }
            else if (data == 'already_close') {
                showPopupNotification(`Реестр "${registryName}" уже закрыт!`);
            }
            else if (data == 'no_rule') {
                showPopupNotification(`У Вас нет прав на закрытие реестра "${registryName}"!`);
            }
        });
    }
}

function createObjectGroup() {
    event.preventDefault();

    const objectsIdArray = [];

    $('#create_object_group_ul input:checked').each(function() {
        objectsIdArray.push($(this).attr('object_id'));
    });

    if (validateFormInputs([$('#object_group_name')])) {
        if  (objectsIdArray.length < 2) {
            showPopupNotification('Выбирите минимум 2 объекта для создания группы!');
        }
        else {
            const groupName = $('#object_group_name').val();
            encodeURIstring = encodeURI(`/base_func?val_param=house_groups&val_param1=add&val_param2=${groupName}&val_param3=${objectsIdArray}`);
            $.post(encodeURIstring, function (data) {
                if (data == 'group_exist') {
                    showPopupNotification('Группа с таким именем уже существует! Пожалуйста, укажите другое имя.');
                }
                else if (data == 'success') {
                    closePopupWindow('popup_create_object_group');
                    $('#object_group_name').val('');
                    $('#create_object_group_ul input:checked').prop('checked', false);
                    showPopupNotification('Группа объектов успешно создана!');
                    getObjectsGroupsList();
                }
            });
        }
    }    
}

function deleteObjectsGroup(groupName) {
    if (confirm(`Вы уверены, что хотите удалить группу объектов "${groupName}"?`)) {
        const encodeURIstring = encodeURI(`/base_func?val_param=house_groups&val_param1=del&val_param2=${groupName}&val_param3=`);
        $.post(encodeURIstring, function (data) {
            getObjectsGroupsList();
            showPopupNotification(`Группа объектов "${groupName}" успешно удалена!`);
        });
    }
}

function changeRegistryLock(registryId) {
    const status = $('registry_lock_icon').attr('lock');
    encodeURIstring = encodeURI(`/base_func?val_param=chg_ree_reestrs_stt&val_param1=${status}&val_param2=${registryId}`);
    $.post(encodeURIstring, function (data) {

    });
}

function convertContentToExcel(content, fileName) {
    showPopupNotification('Загрузка файла начнется автоматически!');
    $.ajax({
        url: encodeURI(`/conver?type=xls&file_name=${fileName}`),
        type: 'POST',
        data: content,
        contentType: 'application/json',
        success: function(data) {
            window.location = data;
        }
    });
}

function selectRegistriesTypeHandler() {
    $('#registry_type_select').on('change', function() {
        if ($(this).val() == 'regular') {
            getRegistryList('regular');
        }
        else if ($(this).val() == 'constant') {
            getRegistryList('constant');
        }
    });
}

function getCompanyDocumentsList() {
    $.post('/report_srv?attr=list', function(data) {
        const documentsList = JSON.parse(data);
        console.log(documentsList)
        if (!isEmpty(documentsList)) {
            showCompanyDocumentsList(documentsList);
        }
        else {
            showTextCenter('control_documents .block-content', 'Отчеты отсутствуют');
        }
    });
}

function showCompanyDocumentsList(data) {
    $('#control_documents .block-content').empty();
    const table = $('<table>', {id: 'control_documents_list_table', class: 'block-table'});
    for (const document in data) {
        const tr = $('<tr>').append(
            $('<td>', {text: document})
        ).appendTo(table);

        tr.on('click',  function() {
            initializeCompanyDocumentPopupWindow(document, data[document].interface, data[document].fnk_name);
        });
    }
    table.appendTo('#control_documents .block-content');
}

function initializeCompanyDocumentPopupWindow(documentName, interfaceData, funcName) {
    $('#popup_company_document_settings .block-content').empty();
    $('#popup_company_document_settings .popup-name').html(documentName);

    const parentDiv = $('<div>', {class: 'content-center'});

    for (const line in interfaceData) {
        const div = $('<div>', {class: 'company-document-div'});
        for (const elem of interfaceData[line]) {
            console.log(elem)
            if (elem.type == 'input') {
                const input = $('<input>', {type: elem.input_type, parameter_name: elem.parameter_name}).appendTo(div);
                input.before($('<span>', {text: elem.interface_name}));
            }
        }

        div.appendTo(parentDiv);
    }

    $('<div>', {class: 'form-submit-btn'}).append(
        $('<button>', {class: 'button-primary', text: 'Выполнить'}).on('click', function() {
            getCompanyDocument(funcName, documentName);
        })
    ).appendTo(parentDiv);

    $('#popup_company_document_settings .popup-content').html(parentDiv);

    openPopupWindow('popup_company_document_settings');

}

function getCompanyDocument(funcName, documentName) {

    let parametersData =  {};
    const validateinputsArray = [];

    $('#popup_company_document_settings input').each(function() {
        const input = $(this);
        validateinputsArray.push(input);


        if (input.val() !== '') {
            parametersData[input.attr('parameter_name')] = RemakeDateFormatFromInput(input.val());
        }
    })

    console.log(parametersData);

    if (validateFormInputs(validateinputsArray)) {
        $('#popup_company_document .popup-content').empty();
        $('#popup_company_document .popup-name').html(documentName);
        openPopupWindow('popup_company_document');
        createContentLoader('#popup_company_document .popup-content');
        $.ajax({
            type: 'POST',
            url: encodeURI(`/report_srv?attr=${funcName}`),
            data: JSON.stringify(parametersData),
            success: function(data) {
                $('#popup_company_document .popup-content').html(data);

                $('#document_convert_to_excel_btn').off('click');
                $('#document_convert_to_excel_btn').on('click', function() {
                    convertContentToExcel(data, documentName);
                });
            }
        });
    }
}