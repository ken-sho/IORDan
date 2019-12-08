var USER_DATA;
var OBJECT_DATA;
var DROPDOWN_NUM = 1; 
var CURRENT_OBJECT_DATA = {};
var OBJECT_TREE_TEMPLATES;


$(document).ready(function() {
    createContentLoader('body');
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

    if (!sessionStorage.firstVisit) {
        getUserData([getUserRightsData, createCompanyDropdownMenu, getUpdateList]);
        $('#update_info_content').show();
        $('#info_page').addClass('active');
        $('#obj_content').hide();
        sessionStorage.setItem('firstVisit', 'true');
    }
    else {
        getUserData([getUserRightsData, createCompanyDropdownMenu, initializationPopupControl, getUpdateList]);
        $('#home_page').addClass('active');
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

    // $('#sub_search_input').focus((e) => {
    //     let valueLength = $('#sub_search_input').val().length;
    //     if (valueLength >= 3) { 
    //         $('#fast_search_menu').show();
    //     }
    // })

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
    })

    $('input[name=agreements_owners]').change(function() {
        if (this.value == 'agreements') {
            $('#owners_table').hide();
            $('#agreement_list_table').show();

            $('#add_agreement_owner_icon').off('click');
            $('#add_agreement_owner_icon').on('click', function() {
                openPopupWindow('popup_add_agreement');
            });
        }
        else if (this.value == 'owners') {
            $('#owners_table').show();
            $('#agreement_list_table').hide();

            $('#add_agreement_owner_icon').off('click');
            $('#add_agreement_owner_icon').on('click', function() {
                openPopupWindow('popup_add_owner');
            });
        }
    });
});

// получение данных о пользователе
function getUserData(callback) {
    $.get( "/web_request?query=", function( data ) {
        USER_DATA = JSON.parse(data);

        const companiesData = USER_DATA.org_list;

        if (companiesData.length == 1) {
            const companyName = companiesData[0].name;
            const companyId = companiesData[0].id;

            chooseCompany(companyName, companyId);
        }

        if (!isEmpty(callback)) {
            for (func of callback) {
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
        removeContentLoader('body', '#page_body');
    });
}

function showCurrentCompany() {
    let currentCompany = sessionStorage['currentCompany'];
    if(currentCompany) {
        // $('#current_company').text(currentCompany);
        $('#popup_control .popup-fullscreen-name').text('Управление ' + currentCompany);
    }
    else {
        // $('.li-change-events').addClass('li-disabled');
    }
}

// создание выпадающего меню со списком компаний
function createCompanyDropdownMenu() {
    let companiesData = USER_DATA.org_list;
    for (company of companiesData) {
        let companyId = company.id;
        let companyName = company.name;
        li = $('<li>', {id: companyId, class: 'dropdown-menu-item', onclick: `chooseCompany('${companyName}', '${companyId}')`}).appendTo('#jq-dropdown-company-list .jq-dropdown-menu');
        $('<a>', {text: companyName}).appendTo(li);
    }
}

function chooseCompany(companyName, companyId) {
    $('#main_search_input').attr('disabled', false);
    $('#main_search_input').val('');
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

    if (popupId !== 'popup_add_task')  {
        openHomePage();
    }
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
        if ( $('.object-list-tree').children().length == 0 ) getObjectsTreeData();
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
        $('.main-menu li').removeClass('active');
        $('#home_page').addClass('active');
    }
}

function getObjectsTreeData() {
    $('.object-list-tree').empty();
    createContentLoader('#object_list_tree');
    $.ajax({
        type: "POST",
        url: "/base_func",
        data: encodeURI("val_param=house_tree"),
        success: function (data) {
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

    for (prop in objectList) {
        li = $('<li>', { text: prop, class: 'parent-li' }).appendTo('.object-list-tree');
        $('<input>', {type: 'checkbox', class: 'object-tree-parent-li-input'}).prependTo(li);
        parentUl = $('<ul>', { class: 'object-tree-ul hide' }).insertAfter(li);

        for (i = 0; i < objectList[prop].length; i++) {
            let apartData = objectList[prop][i].split('&');
            let li = $('<li>', { class: 'object-tree-li', text: apartData[0], accid: apartData[1] }).appendTo(parentUl);
            $('<input>', {type: 'checkbox', class: 'object-tree-apartament-input'}).prependTo(li);
            if (apartData[2] !== 'white') {
                li.css({ 'color': apartData[2] });
            }
        }
    }

    $('<i>', { id: 'objects_list_reports', 'data-jq-dropdown': '#jq-dropdown-objects-list', class: 'material-icons-outlined object-search-icon', text: 'print'}).appendTo($('#object_list_settings_right'));
    $('<div>', {id: 'print_mode_object_num'}).appendTo($('#object_list_settings_right'));

    createDropdownMenuReportTree('objects-list', getCurrentCompanyReportsArray());

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

    for (template in OBJECT_TREE_TEMPLATES) {
        const name = template;
        $('<option>', { text: name }).appendTo('#choose_template_select');
    }

    const currentTemplateName = templateSelect.val();
    const currentTemplateDescription = OBJECT_TREE_TEMPLATES[currentTemplateName];
    $('#choose_template_description').text(currentTemplateDescription);


    $('#object_list_settings_left, #object_list_settings_right').show();

    $('.parent-li').click(function (event) {
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
                    $('#obj_content').show();
                }

                if ($('#obj_info .header-icons').is(':hidden')) {
                    $('#obj_info .header-icons, #agreements_radio, #owners_radio').show();
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
}

function getObjectData() {
    $.ajax({
        type: "POST",
        url: "/base_func",
        data: encodeURI(`val_param=adr_info&val_param1=${CURRENT_OBJECT_DATA.accid}`),
        success: function (data) {
                        
            OBJECT_DATA = JSON.parse(data);

            getObjectAgreementsData();

            getObjectRegistrationsData();

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
    for (report of reportsList) {
        if (report.id == reportId) {
            const printNotation = report.print_notation;
            sessionStorage.setItem('printNotation', printNotation);
        }
    }
}

function getObjectAgreementsData() {

    $('#agreement_list_table').empty();

    let agreementsData = OBJECT_DATA.agreements;
    let agreementsPeopleArr = [];
    const agreementsCount = Object.keys(agreementsData).length;
    $("label[for='agreements_radio']").text(`Договора (${agreementsCount})`); 

    $('<tr>').append(
        $('<th>'),
        $('<th>', {text: 'ФИО'}),
        $('<th>', {text: 'Наименование договора'}),
    ).appendTo('#agreement_list_table');

    for (prop in agreementsData) {
        let propData = prop.split('&');
        tr = $('<tr>', { 'accid': propData[1], 'human_id': propData[2] }).appendTo('#agreement_list_table');
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

    CURRENT_OBJECT_DATA.agreementsPeople = agreementsPeopleArr;

}

function getObjectRegistrationsData() {

    $('#owners_table, #add_agreement_owner_select').empty();

    let registrationsData = OBJECT_DATA.registrations;
    let ownersPeopleArr = [];
    const registrationsCount = Object.keys(registrationsData).length;
    $("label[for='owners_radio']").text(`Прописанные (${registrationsCount})`); 

    $('<tr>').append(
        $('<th>'),
        $('<th>', {text: 'ФИО'}),
        $('<th>', {text: 'Дата рождения'}),
        $('<th>', {text: 'Дата прописки'}),
        $('<th>', {text: 'Доп. инфо'}),
        $('<th>'),
    ).appendTo('#owners_table');

    for (registrationKey in registrationsData) {
        let registrationData = registrationKey.split('&');
        const registrationValue = registrationsData[registrationKey];
        tr = $('<tr>', { 'accid': registrationData[1], 'human_id': registrationData[2] }).append(
            $('<td>').append(
                $('<i>', { 'data-jq-dropdown': `#jq-dropdown-${DROPDOWN_NUM}`, class: 'material-icons', text: 'event_note' })
            ),
            $('<td>', { text: registrationData[0] }),
            $('<td>', {text: registrationValue.birth_date}),
            $('<td>', {text: registrationValue.registration_date})
        ).appendTo('#owners_table');

        const td = $('<td>').appendTo(tr);


        if (registrationValue.unregistration_date !== '') {
            $('<i>', {class: 'material-icons owner-info-unsubdate', text: 'domain_disabled', title: `Дата выписки: ${registrationValue.unregistration_date}`}).appendTo(td);
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

    CURRENT_OBJECT_DATA.ownersPeople = ownersPeopleArr;
    clickIconEditOwner();
}

function getObjectInfoData() {

    let data = OBJECT_DATA.information;

    $('#obj_additional_info_table').empty();
    for (prop in data) {
        $('#obj_ls_info .header').text(`ЛС: ${prop.replace('ls','')}`);
        $('#report_fast_access_ls').val(`${prop.replace('ls','')}`);

        let infoData = data[prop];

        for (prop in infoData) {

            $('<tr>').append(
                $('<td>', {text: prop}),
                $('<td>', {text: infoData[prop]})
            ).appendTo('#obj_additional_info_table');

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
    $('#obj_notations_icon .icon-count').remove();

    let notationsData = OBJECT_DATA.notations;

    if (!isEmpty(notationsData)) {
        for (elem in notationsData) {
            const notation = notationsData[elem];
            const id = elem;
            const value = notation.value;
            const author = notation.author;
            const creationTime = notation.creation_time;

            $('<div>', {id: id, class: 'obj-notation'}).append(
                $('<div>', {class: 'notation-content', text: value}),
                $('<div>', {class: 'notation-creation-time', text: `Добавил: ${author} ${creationTime}`})
            ).appendTo('#notations_list');
        }

        $('<div>', {class: 'icon-count', text: Object.keys(notationsData).length}).appendTo('#obj_notations_icon');
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
            refreshObjectData([getObjectNotationsData]);
        });

        const notationCount = $('.icon-with-count .icon-count');

        if (notationCount) {
            notationCount.text(Number(notationCount.text())++);
        }
        else {
            $('<div>', {class: 'icon-count', text: '1'}).appendTo('#obj_notations_icon');
        }

        $('#add_object_notation_input').val('');
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

function createDropdownMenuForFile(menuNum, liArr, fileId, orgId) {
    $('<div>', {id: `jq-dropdown-${menuNum}`, class: 'jq-dropdown jq-dropdown-tip jq-dropdown-anchor-right'}).append(
        $('<ul>', {class: 'jq-dropdown-menu'})
    ).appendTo($('body'));
    for (template of liArr) {
        $('<li>', {class: 'dropdown-menu-item', onclick: `initializationProcessedFileTemplate(${fileId}, ${orgId}, ${template.number})`}).append(
            $('<a>', {text: template.name})
        ).appendTo($(`#jq-dropdown-${menuNum} ul`));
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
    // createContentLoader('#redmine_content .info-block-content');
    $.get(`/redmine?request=/issues.json?project_id=${projectId}`, function (data) {
        let taskList = JSON.parse(data);
        for (elem in taskList.issues) {
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
                refreshObjectData([getObjectRegistrationsData, clickDropdownMenu]);
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
        $('#obj_main_table').html(data);
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
    let companyReportsData = USER_DATA.reports_list;
    return companyReportsData[companyKey];
}

function fillSelectFromReportsArray(selectId, array) {
    for (report of array) {
        $('<option>', {text: report.rep_name, rep_name: report.rep_name, rep_num: report.rep_num, rep_type: report.rep_type}).appendTo($(`#${selectId}`));
    }
}

function fillSelectFromCompanyArray(selectId, array) {
    for (company of array) {
        $('<option>', {text: company.name, company_id: company.id}).appendTo($(`#${selectId}`));
    }
}

function initializationPopupControl() {

    resizeTwoDiv('control_reports', `reports_list`, 'report_fast_access', '11');

    $('#report_fast_access_reports_list, #control_files_list .block-content, #report_settings_select_menu ul, #proccess_file_company_select').empty();
    let reportsArr = getCurrentCompanyReportsArray();
    
    if (!isEmpty(reportsArr)) {
        for (report of reportsArr) {
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

    }


    let companyArr = USER_DATA.org_list;
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
    getControlProcessedFilesList();
    getControlPerformedFilesList();
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

        let table = $('<table>', {id: 'control_files_list_table', class: 'block-table'}).append(
            $('<tr>').append(
                $('<th>', {text: 'Имя'}),
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
                    $('<i>', {class: 'material-icons file-table-icon', text: 'file_upload', title: 'Обработать', onclick: `chooseCompanyForFile('${fileName}')`}),
                    $('<i>', {class: 'material-icons file-table-icon', text: 'delete_outline', title: 'Удалить файл', onclick: `deleteControlFile('${fileName}')`})

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
            for (file of files) {
                const fileId = file.id;
                const fileName = file.file_name;
                const sheetName = file.sheet_name;
                const creationTime = file.creation_time;
                const orgName = file.org_name;
                let orgId;

                for (company of USER_DATA.org_list) {
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
                            $('<i>', {class: 'material-icons file-table-icon', text: 'delete_outline', title: 'Удалить файл', onclick: `deleteControlProcessedFile(${fileId}, '${fileName}')`})
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
            for (file of files) {
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
    let errorsCounter, rowsCounter, creditsCounter;
    errorsCounter = rowsCounter = creditsCounter = 0;

    const documentData = {};
    
    $('#template_table, #template_total_td').empty();
    $('#popup_processed_file_template, #popup_background').fadeIn(200);
    createContentLoader('#template_table');

    $.get(`/bank_template?pid=${fileId}&orgid=${companyId}&templ_name=${templateNum}`, function (data) {
        const tableData = JSON.parse(data);
        const theadData = tableData.thead;
        const tbodyData = tableData.tbody;

        const table = $('<table>', {class: 'template-table'}).append(
            $('<thead>').append(
                $('<tr>').append(
                    $('<th>')
                )
            ),
            $('<tbody>')
        )

        for (cell of theadData) {
            $('<th>', { text: cell }).appendTo(table.find('thead tr'))
        }

        for (row of tbodyData) {
            documentData[row.id] = row.accid;

            const tr = $('<tr>', {row_id: row.id, accid: row.accid, credit: row.credit})
            $('<td>', {class: 'column-table-main'}).append(
                $('<input>', {type: 'checkbox', class: 'template-checkbox'}).attr('checked', true)
            ).appendTo(tr);

            rowsCounter++;
            creditsCounter += Number(row.credit);

            for (cell of row.cells) {
                if (cell == 'error') {
                    $('<td>').append(
                        $('<button>', {class: 'add-template-adress-btn button-primary', text: 'Добавить'})
                    ).appendTo(tr);

                    errorsCounter++;
                }
                else {
                    $('<td>', {text: cell}).appendTo(tr);
                }
            }

            tr.appendTo(table.find('tbody'));
        }

        initializationTemplateTotal(rowsCounter, creditsCounter, errorsCounter);

        table.on('click', function(event) {
            let target = event.target;
            let parentTr = $(target).parent().parent();
            const trCredit = parentTr.attr('credit');
            const trId = parentTr.attr('row_id');

            if ($(target).hasClass('template-checkbox')) {
                const trAccid = parentTr.attr('accid');
                let tagretChecked = $(target).prop('checked');
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
            else if ($(target).hasClass('add-template-adress-btn button-primary')) {
                let parentTd = $(target).parent();
                openPopupWindowLayer2('popup_add_ardess_template');
                $('#ardess_template_search_btn').on('click', function(event) {
                    event.preventDefault();
                    const adress = $(this).attr('adress');
                    const accid = $(this).attr('accid');
                    if (adress !== undefined) {
                        parentTd.text(adress);
                        parentTr.attr('accid', accid);
                        documentData[trId] = accid;

                        errorsCounter--;

                        initializationTemplateTotal(rowsCounter, creditsCounter, errorsCounter);

                        closePopupWindowLayer2('popup_add_ardess_template');
                        $('#ardess_template_search_input').val('');
                        $( "#ardess_template_search_btn").unbind( "click" );

                    }
                })
            }
            else if ($(target).is('td')) {
                let parentTd = $(target).parent();
                parentTd.find('.template-checkbox').trigger('click');           
            }
        });

        $('#template_table').html(table);
    });

    function initializationTemplateTotal(rowsNum, creditsSum, errorsNum) {
        const td = $('#template_total_td');

        if (errorsNum !== 0) {
            td.html(`<b>Итог:</b> выбрано строк - <b>${rowsNum}</b>, сумма - <b>${creditsSum.toFixed(2)}</b>, отсутствует адресов - <b style="color:red">${errorsNum}</b>`);
        }
        else {
            if ($('#submit_template').length) {
                td.html(`<b>Итог:</b> выбрано строк - <b>${rowsNum}</b>, сумма - <b>${creditsSum.toFixed(2)}</b>`);
                $('<button>', { id:'submit_template', class: 'button-secondary', text: 'Провести платежный документ'}).appendTo(td);

                $('#submit_template').on('click', function() {
                    sendBankDocumentData();
                })
            }
            else {
                td.html(`<b>Итог:</b> выбрано строк - <b>${rowsNum}</b>, сумма - <b>${creditsSum.toFixed(2)}</b>`);
                $('<button>', { id:'submit_template', class: 'button-secondary', text: 'Провести платежный документ'}).appendTo(td).fadeOut(150).fadeIn(150).fadeOut(150).fadeIn(150);

                $('#submit_template').on('click', function() {
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
                        $('#number_of_uploaded_files').text(`Файлов загружено: ${uploadedFilesNum}`);
                        getControlFilesList();
                    }
                }
            });
        }
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
                for (elem of searchListArray) {
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
                for (elem of searchListArray) {
                    let dataArray = elem.split('&');
                    let name = dataArray[0];
                    let accid = dataArray[1];
                    let adress = dataArray[2];
                    $('<li>', {text: name, accid: accid, adress: adress}).appendTo(parentDiv);
                }

                $(`#${menuId} ul li`).each(function() {
                    $(this).on('click', function() {
                        // let value = $(this).text();
                        let adress = $(this).attr('adress');
                        let accid = $(this).attr('accid');
                        input.val('');
                        openHomePage();

                        CURRENT_OBJECT_DATA.accid = accid;
                        getObjectData();
                        $('#obj_adress').text(adress);
                        if ($('#obj_info .header-icons').is(':hidden')) {
                            $('#obj_info .header-icons').show();
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
    
//         if ($('#main_content .header-icons').is(':hidden')) {
//             $('#main_content .header-icons').show();
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
    const headCompanyId = USER_DATA.head_company.id;

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
            for (func of callback) {
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
        console.log(data);
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

    if (validateFormInputs([validateinputsArray])) {
        if (newPassword.val() == newPasswordRepeat.val()){
            const encodeURIstring = encodeURI(`/base_func?val_param=chg_passwd&val_param1=${currentPassword.val()}&val_param2=${newPassword.val()}`);
            $.post(encodeURIstring, function (data) {
                console.log(data);
                if (data == 'wrong_pwd') {
                    showPopupNotification('Текущий пароль введен не верно!');
                }
                else if (data == 'success') {
                    showPopupNotification('Пароль успешно изменен! Вы будете перенаправлены на страницу входа.');
                    clearFormInputs([validateinputsArray]);
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

    clearFormInputs([validateinputsArray]);
}

function showUserLogin() {
    $('#popup_profile .popup-fullscreen-name').text(`Профиль пользователя ${USER_DATA.user_login}`);
}

function createPopupNotification(message) {
    const notification = $('<div>', { class: 'popup-notification' }).append(
        $('<span>', {class: 'icon'}).append(
            $('<i>', {class: 'material-icons', text: 'notification_important'})
        ),
        $('<span>', {class: 'content', text: message})
    );
    return notification;
}

function showPopupNotification(message) {
    const notification = createPopupNotification(message);

    if ($('.popup-notification').length) {
        $('.popup-notification').animate({
            bottom: '+=52'
        }, 500, function () {
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
        }, 500, () => {
            setTimeout(removePopupNotification, 4000);
        });
    }

    function removePopupNotification() {
        notification.animate({
            opacity: 0
        }, 500, () => {
            notification.remove();
        });
    }
}