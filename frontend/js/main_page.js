// "use strict"; 

var USER_DATA;
var OBJECT_DATA;
var DROPDOWN_NUM = 1; 
var CURRENT_OBJECT_DATA = {};
var OBJECTS_TREE_DATA;
var IdRegStr;
var IDAccid;
var registryData;
var filesRegistry;
var COUNT_ID = 0;
var C_REG_DATA = {};
var office_admin_active = false;

$(document).ready(function() {  
    sessionStorage.setItem('printMode', 'off');
    // getProjectTaskList("web_deb");
    toggleBlock ()
    getChatPopup();
    getNewsList();
    showCurrentCompany();
    setInputRadio();
    createRegistryCalendar();
    initializeLogData();
    $('.gifplayer').gifplayer({ label: '<i class="material-icons help-gif-icon">play_arrow</i>' });

    $('#popup_background').on('click', (e) => {
        if (e.target !== e.currentTarget) {
            return;
        }
        else {
            $('#popup_background, .popup-window').fadeOut(200);
            if($(e.target).find('#popup_object_files_registry .file-block')){
                 $('#popup_object_files_registry .file-block').remove();
            }
        }
    });

    const objectNumDiv = $('#print_mode_object_num');
    objectNumDiv.text('Выбрано: 0');
    
    objectNumDiv.on('click', () => {
        const objectNum = $('.object-tree-apartament-input:checked').length;
        
        if (objectNum > 0) {
            $('.object-list-tree input').prop('checked', false);
            objectNumDiv.attr('title', 'Нажмите, чтобы выбрать все');
            $('#objects_list_reports').hide();
        }
        else {
            $('.object-list-tree input').prop('checked', true);
            objectNumDiv.attr('title', 'Нажмите, чтобы отменить выбор');
            if ($('#objects_list_reports').is(':hidden')) {
                $('#objects_list_reports').fadeOut(200).fadeIn(200).fadeOut(200).fadeIn(200);
            }
        }
        
        showPrintingObjectsNum();
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
        // $('#popup_info').show();
        // $('#update_info_content').show();
        $('#home_page').addClass('active');
        $('#obj_content').show();
    }
    else {
        $('#home_page').addClass('active');
    }

    getUserData([getUserRightsData, createCompanyDropdownMenu, getUpdateList]);
    initializeUserSettings();

    $('#add_contact_phone_number').inputmask("(999)999-99-99");

    $("#report_fast_access_start_date, #report_fast_access_end_date").datepicker({
        dateFormat: "mm.yy",
        changeMonth: true,
        changeYear: true,
        showButtonPanel: true,
        yearRange: '2005:2021',
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

    if (getCookie('history_table_mode') == undefined) {
        setCookie('history_table_mode', 'client');
    }

    $('#history_calendar_navigation p').append(createCheckboxToggle(
        {
            name: 'Клиент', value: 'client', checked: getCookie('history_table_mode') == 'client', callback: function(input) {
                setCookie('history_table_mode', input.val());
                getObjectHistoryData([createObjectHistoryTable, initializeAccountHistorySettings]);
            }
        },
        {
            name: 'Оборотка', value: 'turnover', checked: getCookie('history_table_mode') == 'turnover', callback: function(input) {
                setCookie('history_table_mode', input.val());
                getObjectHistoryData([createObjectHistoryTable, initializeAccountHistorySettings]);
            }
        }
    ));

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

    const currentCompany = getCookie('companyId'); // смотрим есть ли в куках companyId
    if (currentCompany == undefined) { // если нет companyId, то
        $('#main_search_input').attr('disabled', true);// Поисковик не работает
        $('#main_search_input').val('Выберите компанию'); // предлагает выбрать компанию
        $('#main_menu li[title="КОМПАНИИ"]').addClass('blinking');//  добавляет классы не активности
        $('.li-change-events').addClass('li-disabled');
    }

    $('#add_agreement_icon').on('click', function() {
        // openPopupWindow('popup_add_agreement');
        addAgrData()
    });

    $('#add_owner_icon').on('click', function() {

        createInfRegData();
        $("<i>", {id:"owner_btn_cancel_save", class:"material-icons", text: 'cancel', title: 'Отменить'}).on("click", () => {
            $("#obj_list_group").find(".block-content").empty();
            $("#owner_btn_cancel_save").hide();
            $("#add_owner_btn").hide();
            showPopupNotification('alert', 'Создание прописанного отменено!');
        }).css({"margin-right": "10px"}).appendTo("#obj_list_group .form-submit-btn");

        $("#owner_btn_edit").hide(); // скрыть кнопку редактировать

        $("#obj_list_group .notification").css('display', "block"); // показать соообщение о полях

        $("#owner_creation_time").hide();

        $('#owner_name, #owner_birth_date, #owner_subscribe_date, #owner_unsubscribe_date, #owner_birth_place, #owner_snils, #owner_inn').removeAttr("disabled"); // разблокировать инпуты

        const saveBtn = $("<i>", {id:"add_owner_btn", class:"material-icons", text:"person_add", title: "Создать пользователя"}).appendTo("#obj_list_group .form-submit-btn").css('margin-right', '12px'); // создать кнопку сохранения файлов
        saveBtn.fadeOut(100).fadeIn(100).fadeOut(100).fadeIn(100);

        saveBtn.on("click", addNewOwner);

        // openPopupWindow('popup_add_owner');
    });

    $('#object_communication_select').change(function() {
        if (this.value == 'Другое') {
            $('#object_communication_textarea_tr').show();
        }
        else {
            $('#object_communication_textarea_tr').hide();
        }
    });

    postIdReccid ();

    setInterval(() => {
        checkSession();
    }, 600000);
});

function checkSession() {
    $.post('/chck_sid', (data) => {
        const session = JSON.parse(data);
        console.log('session info',session);

        if (!session.is_active) {
            location.reload();
        }
    })
}

function initializeUserSettings() {
    const ObjectListSettingTable = $('<table>', {class: 'table-form table-settings'});

    let currentValue = 'on';
    let currValDebt = 'on';

    if (localStorage.hasOwnProperty('display_city') && localStorage.getItem('display_city') == 'off') {
        currentValue = 'off';
        localStorage.setItem('display_city', 'off');
    } else {
        localStorage.setItem('display_city', 'on');
    }
    if (localStorage.hasOwnProperty('debt_less_1000') && localStorage.getItem('debt_less_1000') == 'off') {
        currValDebt = 'off';
    }

    createTrWithToggle('Отображение города', displayCityHandler, currentValue).appendTo(ObjectListSettingTable);
    createTrWithToggle('Долг менее 1000 руб.', displayCityHandler2, currValDebt).appendTo(ObjectListSettingTable);

    $('#object_list_settings_tab').append(createUserSettingDiv('', ObjectListSettingTable));

    function displayCityHandler(elem) {
        addPropertyToStorage('local', 'display_city', elem.attr('value'));
        getObjectsTreeData([]);
    }
    function displayCityHandler2(elem) {
        addPropertyToStorage('local', 'debt_less_1000', elem.attr('value'));
        getObjectsTreeData([]);
    }
}

function createUserSettingDiv(settingName, settingContent) {
    const div = $('<div>');

    if (settingName !== '') {
        $('<h3>', {text: settingName}).appendTo(div);
    }
    settingContent.appendTo(div);

    return div;
}

function createTrWithToggle(toggleName, toggleHandler, currentValue) {
    const tr = $('<tr>');
    $('<td>', {text: toggleName}).appendTo(tr);
    const td = $('<td>').appendTo(tr);
    const div = $('<div>', {style: 'width: max-content; margin: auto'}).appendTo(td);
    const labelOn = $('<label>', {class: 'checkbox-container', text: 'Вкл.', style: 'float: left; margin-right: 10px; display: block; text-align: center'}).appendTo(div);
    const inputOn = $('<input>', {class: 'checkbox', type: 'checkbox', value: 'on'}).appendTo(labelOn);
    $('<span>', {class: 'checkmark'}).appendTo(labelOn);

    inputOn.on('click', function() {
        if ($(this).prop('checked')) {
            toggleHandler($(this));
        }
    })

    const labelOff = $('<label>', {class: 'checkbox-container', text: 'Выкл.', style: 'float: left; margin-right: 10px; display: block; text-align: center'}).appendTo(div);
    const inputOff = $('<input>', {class: 'checkbox', type: 'checkbox',  value: 'off'}).appendTo(labelOff);
    $('<span>', {class: 'checkmark'}).appendTo(labelOff);

    inputOff.on('click', function() {
        if ($(this).prop('checked')) {
            toggleHandler($(this));
        }
    })

    if (currentValue == 'on') {
        inputOn.prop('checked', true);
    }
    else if (currentValue == 'off') {
        inputOff.prop('checked', true);
    }

    addEventOnOffToggle(inputOn, inputOff);

    return tr;
}

function addPropertyToStorage(storageType, key, value) {
    if (storageType == 'local') {
        localStorage.setItem(key, value);
    }
    else if (storageType == 'session') {
        sessionStorage.setItem(key, value);
    }
}

// получение данных о пользователе
function getUserData(callback) {
    $.get( "/web_request?query=", function( data ) {
        USER_DATA = JSON.parse(data);
        console.log(USER_DATA)

        $('#obj_create_reminder').on('click', function() {
            if (USER_DATA.login == 'demo') {
                alert('Разного рода уведомления. По типу квартиросъёмщик «попросил связаться завтра», «обещал внести оплату такого-то числа» или любое другое по требованию заказчика. Программа напомнит об этом событии пользователю.');
            }
            else {
                alert('Недостаточно прав');
            }
        });

        // if (USER_DATA.org_list.length == 1) {
        //     const companyName = USER_DATA.org_list[0].name;
        //     const companyId = USER_DATA.org_list[0].id;

        //     chooseCompany('', companyName, companyId);
        // }

        if (!isEmpty(callback)) {
            for (const func of callback) {
                func();
            }
        }
    });
}

class Label {
    constructor(root, name, value, isEditable = false) {
        this._name = name;
        this._value = value;
        this._isEditable = isEditable;

        this._content = this._createNode(root);
    }

    set value(val) {
        this._value = val;
        this._content.text(val);
    }

    get name() {
        return this._name;
    }

    get value() {
        return this._value;
    }

    get isEditable() {
        return this._isEditable;
    }

    _createNode(root) {
        const name = $('<div>', {class: 'info-name', text: `${this.name}:`});
        const content = $('<div>', {class: 'info-content', text: this.value});

        $('<div>', {class: 'profile-info-row'}).append(name, content).appendTo(root);

        if (this.isEditable)
            content.css({ 'color': 'var(--third-color)' });

        return content;
    }
};

class UserInfoPopup {
    constructor(rootId, data, callback) {
        this._rootId = rootId;

        const popup = createPopupLayout('Редактировать основные данные', rootId);
        
        const table = $('<table>', {class: 'table-form'});

        for (const elem in data) {
            if (data[elem].editable) {
                const tr = $('<tr>').append(
                    $('<td>', { class: 'table-input-name', text: elem }),
                    $('<td>').append(
                        $('<input>', { class: 'input-main', type: 'text', name: data[elem].name}).val(data[elem].value)
                    )
                ).appendTo(table);

                if ('mask' in data[elem]) {
                    addInputmask(tr.find('input'), data[elem].mask);
                }
            }
        }

        table.appendTo(popup.find('.popup-content'));
        const mapToName = (name) => {
            for (const key in data) {
                const value = data[key];
                if (value.name && value.name === name)
                    return key;
            }

            throw `UserInfoPopup: unable to map parameter's name ${name}`
        };

        $('<div>', {class: 'form-submit-btn'}).append(
            $('<button>', {id: '', class: 'button-primary', text: 'Сохранить'}).on('click', () => {
                let dataObj = {};
                const inputsCollection = table.find('input');
                for (const input of inputsCollection) {
                    dataObj[$(input).attr('name')] = $(input).val();
                }
                console.log(dataObj);

                $.ajax({
                    url: '/base_func?val_param=chg_user_attr',
                    type: 'POST',
                    data: JSON.stringify(dataObj),
                    contentType: 'application/json',
                    success: function(data) {
                        closePopupWindow(rootId);
                        popup.remove();
                        const changes = {};
                        for (const key in dataObj)
                            changes[mapToName(key)] = dataObj[key];
                        callback(changes);
                        showPopupNotification('notification', 'Основные данные сохранены успешно!');
                    }
                });
            })
        ).appendTo(popup.find('.popup-content'))

        popup.appendTo('#popup_background');
    }

    show() {
        openPopupWindow(this._rootId);
    }
};

class UserInfoWidget {
    constructor(root, name, isNavigation, dict) {
        this._block = this._createNode(root, name, isNavigation);
        this._data = dict;
        this._labels = {};
        for (const key in dict) {
            const value = dict[key];
            const label = new Label(this._block, key, value.value, value.editable);
            this._labels[key] = label;
        }

    }

    _handleNewData(changes) {
        for (const key in changes) {
            const label = this._labels[key];

            if (label)
            {
                label.value = changes[key];
                this._data[key].value = changes[key];
            }
            else
            {
                throw `UserInfoWidget: can't find label for ${key}`;
            }
        }
    }

    _onChangeButton() {
        new UserInfoPopup(
            "popup_edit_user_basic_data",
            this._data,
            (data) => this._handleNewData(data)).show();
    }

    _createNode(root, name, isNavigation) {
        const block = $('<div>');

        const header = $('<div>', { class: 'block-header' })
        header.append($('<h3>', { text: name }));
        header.appendTo(block);
        
        const content = $('<div>', {class: 'block-content'})
        content.appendTo(block);
    
        if (isNavigation) {
            const navigationBlock = $('<div>', {class: 'block-navigation'});
            navigationBlock.appendTo(block);

            content.height('calc(100% - 60px)');

            $('<button>', {id: '', class: 'button-primary', text: 'Изменить'}).on('click', () => {
                this._onChangeButton();
            }).appendTo(navigationBlock);
        }

        block.appendTo(root);
        return content;
    }
}

function getUserRightsData() {
    $.get( "/web_request?query=user_rights", function( data ) {
        const userRightsData = JSON.parse(data);
        console.log(userRightsData);
        USER_DATA = Object.assign(USER_DATA, userRightsData);
        const userData = { 'Логин': { value: USER_DATA.login }, 'ФИО': { value: USER_DATA.full_name, editable: true, mask: 'fio', name: 'fio' }, 'Роль': { value: USER_DATA.account_type }, 'Email': { value: USER_DATA.email, editable: true , mask: 'email', name: 'email'}, 'Телефон': { value: USER_DATA.phone, editable: true , mask: 'mobile number', name: 'phone'} };
        showUserLogin();
        initializeUserProfileBasicData2(userData);
        initializeUserProfileChangePassword();
        initializeUserProfileSettings();

        

        if (getCookie('companyId')) {
            if (USER_DATA.org_list.length > 1) {
                initializationPopupControl();
                getObjectsTreeData([initializeObjectsTreeFilters]);
                initializeUserRight();
            }
        }
        else {
            removeContentLoader('body', '#page_body');
        }

        sessionStorage.setItem('noFirstVisit', 'true');
    });
}

function unique(arr) {
    let result = [];      
    for (let str of arr) {
      if (!JSON.stringify(result.includes(str))) {
        result.push(str);
      }
    }      
    return result;
}

function Unique(A)
{
    var n = A.length, k = 0, B = [];
    for (var i = 0; i < n; i++) 
     { var j = 0;
       while (j < k && JSON.stringify(B[j]) !== JSON.stringify(A[ i ])) j++;
       if (j == k) B[k++] = A[ i ];
     }
    return B;
}

function initializeUserRight() {
    const userRights = USER_DATA.rights;

    if(!isEmpty(userRights)) {
        if (userRights.includes(1)) {
            getControlFilesList();
            getControlProcessedFilesList();
            getControlPerformedFilesList();
            $('#control_files_tab').removeClass('default-hidden');
        }
        if (userRights.includes(2)) {
            getRegistryList(() => { });
            selectRegistriesTypeHandler();
            $('#control_registry_tab').removeClass('default-hidden');
        }    
    }
    else {
        getControlFilesList();
        getControlProcessedFilesList();
        getControlPerformedFilesList();
        getRegistryList(() => { });
        selectRegistriesTypeHandler();
        $('.default-hidden').removeClass('default-hidden');
        getCompanyDocumentsList();
    }
}

function initializeUserProfileBasicData2(data) {
    new UserInfoWidget($('#profile_settings'), 'Основные данные', true, data);
}

function initializeUserProfileBasicData(data) {
    const block = createBlockforGridTab('Основные данные', true);

    for (const elem in data) {
        const div = $('<div>', {class: 'profile-info-row'}).append(
            $('<div>', {class: 'info-name', text: `${elem}:`}),
            $('<div>', {class: 'info-content', text: data[elem].value})
        ).appendTo(block.find('.block-content'));

        if (data[elem].editable) {
            div.find('.info-content').css({ 'color': 'var(--third-color)' });
        }
    }

    $('<button>', {id: '', class: 'button-primary', text: 'Изменить'}).on('click', () => {
        openPopupWindow(popupId);
    }).appendTo(block.find('.block-navigation'));

    block.appendTo('#profile_settings');

    
    const popupId = 'popup_edit_user_basic_data';
    const popup = createPopupLayout('Редактировать основные данные', popupId);

    const table = $('<table>', {class: 'table-form'});

    for (const elem in data) {
        if (data[elem].editable) {
            const tr = $('<tr>').append(
                $('<td>', { class: 'table-input-name', text: elem }),
                $('<td>').append(
                    $('<input>', { class: 'input-main', type: 'text', name: data[elem].name}).val(data[elem].value)
                )
            ).appendTo(table);

            if ('mask' in data[elem]) {
                addInputmask(tr.find('input'), data[elem].mask);
            }
        }
    }

    table.appendTo(popup.find('.popup-content'));

    $('<div>', {class: 'form-submit-btn'}).append(
        $('<button>', {id: '', class: 'button-primary', text: 'Сохранить'}).on('click', () => {
            let dataObj = {};
            const inputsCollection = table.find('input');
            for (const input of inputsCollection) {
                dataObj[$(input).attr('name')] = $(input).val();
            }
            console.log(dataObj);

            $.ajax({
                url: '/base_func?val_param=chg_user_attr',
                type: 'POST',
                data: JSON.stringify(dataObj),
                contentType: 'application/json',
                success: function(data) {
                    closePopupWindow(popupId);
                    showPopupNotification('notification', 'Основные данные сохранены успешно!');
                }
            });
        })
    ).appendTo(popup.find('.popup-content'))


    popup.appendTo('#popup_background');
}

function initializeUserProfileChangePassword() {
    const block = createBlockforGridTab('Изменить пароль', true);

    const blockContent = $('<form>', {name: 'change_login_password'}).append(
        $('<table>', {class: 'table-form'}).append(
            $('<tr>').append(
                $('<td>').append(
                    $('<input>', {id: 'change_login_input', type: 'password', class: 'input-main', placeholder: 'Текущий пароль'})
                )
            ),
            $('<tr>').append(
                $('<td>').append(
                    $('<input>', {id: 'change_password_input', type: 'password', class: 'input-main', placeholder: 'Новый пароль'})
                )
            ),
            $('<tr>').append(
                $('<td>').append(
                    $('<input>', {id: 'change_password_repeat_input', type: 'password', class: 'input-main', placeholder: 'Подтвердить пароль'})
                )
            )
        )
    ).appendTo(block.find('.block-content'));

    $('<button>', {id: 'save_login_password', class: 'button-primary', text: 'Сохранить', style: 'margin-right: 5px'}).on('click', () => {
        changeUserPassword();
    }).appendTo(block.find('.block-navigation'));

    $('<button>', {id: 'cancel_login_passford', class: 'button-secondary', text: 'Отменить'}).on('click', () => {
        cancelUserPassword();
    }).appendTo(block.find('.block-navigation'));

    block.appendTo('#profile_settings');
}

function initializeUserProfileSettings() {
    const block = createBlockforGridTab('Цветовая схема', false);

    const blockContent = $('<div>', {id: 'color_theme_setting'}).append(
        $('<div>').append(
            $('<label>', {class: 'checkbox-container', text: 'По умолчанию'}).append(
                $('<input>', {id: 'default_theme_checkbox', type: 'checkbox', class: 'checkbox', checked: 'checked'}).on('click', () => {
                    chooseDefaultTheme();
                }),
                $('<span>', {class: 'checkmark'})
            ),
            $('<div>', {id: 'color_palette_default', class: 'color-palette'}).append(
                $('<div>', {class: 'palette-color-1'}),
                $('<div>', {class: 'palette-color-2'}),
                $('<div>', {class: 'palette-color-3'})
            )
        ),
        $('<div>').append(
            $('<label>', {class: 'checkbox-container', text: 'Ночной режим'}).append(
                $('<input>', {id: 'dark_theme_checkbox', type: 'checkbox', class: 'checkbox'}).on('click', () => {
                    chooseDarkTheme();
                }),
                $('<span>', {class: 'checkmark'})
            ),
            $('<div>', {id: 'color_palette_dark', class: 'color-palette'}).append(
                $('<div>', {class: 'palette-color-1'}),
                $('<div>', {class: 'palette-color-2'}),
                $('<div>', {class: 'palette-color-3'})
            )
        )
    ).appendTo(block.find('.block-content'));

    
    block.appendTo('#profile_settings');
    acceptColorTheme();
}

function createBlockforGridTab(name, isNavigation) {
    const block = $('<div>');
    const header = $('<div>', { class: 'block-header' }).append(
        $('<h3>', { text: name })
    ).appendTo(block);
    
    const content = $('<div>', {class: 'block-content'}).appendTo(block);

    if (isNavigation) {
        content.height('calc(100% - 60px)');
        $('<div>', {class: 'block-navigation'}).appendTo(block);
    }

    return block;
}

function toggleBlock () { 
    const toggleSet = $("#check-box2");
    const history = $(`#history_calendar , #obj_main_table`);
    const agremeents = $(`#obj_agreements_info, #owners_table, #agreement_list_table`);
    
    if (localStorage.getItem("toogle_history_agreements") == "history") {
        toggleSet.prop("checked", false);
        history.show();
        agremeents.hide();
        $("#popup_object_history_settings .name").text("Настройки таблицы истории");
        $(".header-title").text("Режим таблицы истории");

    }  else {
        $(".header-title").text("Режим паспортного стола");
        $("#popup_object_history_settings .name").text("Настройки паспортного стола");
        toggleSet.prop("checked", true); 
        history.hide();
        agremeents.show();        
    }   

    toggleSet.on("change", () => {
        if(toggleSet.prop("checked")){
            $(".header-title").text("Режим паспортного стола");
            $("#popup_object_history_settings .name").text("Настройки паспортного стола");
            history.hide();
            agremeents.show();
            localStorage.setItem("toogle_history_agreements", "agremeents");
        } else {
            $("#popup_object_history_settings .name").text("Настройки таблицы истории");
            $(".header-title").text("Режим таблицы истории");
            localStorage.setItem("toogle_history_agreements", "history");
            history.show();
            agremeents.hide();
        }
    });
    
 }

 function createInfRegData (ownerName = "", ownerBirthDate = "", subDate = "", unsubDate = "", birthPlace = "", current = ""){
    let authorText;
    let creationTimeText;
     if(current == ""){
        authorText = USER_DATA.login;
        let date = new Date()
        creationTimeText = date.toLocaleString('ru-RU');
     } else{
        authorText = $(current).attr('author');
        creationTimeText = $(current).attr('creation_time');
     }

    const parent = "#obj_list_group .block-content";
    $(parent).empty();
    $("#obj_list_group .form-submit-btn").remove();

    const formBlock = $("<form>", {name: "owner"}).appendTo(parent);

    const table = $("<table>", {class: "table-form"}).appendTo(formBlock);
    const tbody = $("<tbody>").append(
        $("<tr>").append(
            $("<td>", {class:"table-input-name", text: "ФИО *"}),
            $("<td>", {colspan: "3"}).append(
                $("<input>", {id:"owner_name",  type:"text", class:"input-main"}).val(ownerName).attr("disabled", "true")
            )
        ),
        $("<tr>").append(
            $("<td>", {class:"table-input-name", text: "Дата рождения"}),
            $("<td>", {colspan: "3"}).append(
                $("<input>", {id:"owner_birth_date",  type:"date", class:"input-main birth-date"}).val(ownerBirthDate).attr("disabled", "true")
            )
        ),
        $("<tr>").append(
            $("<td>", {class:"table-input-name", text: "Дата прописки"}),
            $("<td>").append(
                $("<input>", {id:"owner_subscribe_date",  type:"date", class:"input-main"}).val(subDate).attr("disabled", "true")
            ),
            $("<td>", {class:"table-input-name", text: "Дата выписки"}),
            $("<td>").append(
                $("<input>", {id:"owner_unsubscribe_date",  type:"date", class:"input-main"}).val(unsubDate).attr("disabled", "true")
            )
        ),
        $("<tr>").append(
            $("<td>", {class:"table-input-name", text: "Место рождения"}),
            $("<td>", {colspan:"3"}).append(
                $("<textarea>", {id:"owner_birth_place", class:"form-textarea", rows:"3"}).val(birthPlace).attr("disabled", "true")
            )
        ),
        $("<tr>").append(
            $("<td>", {class:"table-input-name", text: "СНИЛС"}),
            $("<td>", {colspan:"3"}).append(
                $("<input>", {id:"owner_snils",  type:"text", class:"input-main"}).attr("disabled", "true").inputmask('999-999-999 99')
            )
        ),
        $("<tr>").append(
            $("<td>", {class:"table-input-name", text: "ИНН"}),
            $("<td>", {colspan:"3"}).append(
                $("<input>", {id:"owner_inn",  type:"text", class:"input-main"}).attr("disabled", "true").inputmask('999999999999')
            )
        )

    ).appendTo(table);
    
    $("<div>", { class:"form-submit-btn"}).append(
        $("<i>", {id:"owner_btn_cancel", class:"material-icons", text: 'cancel', title: 'Отменить'}).on("click", () => {
            createInfRegData(ownerName, ownerBirthDate, subDate, unsubDate, birthPlace, current);
            showPopupNotification('alert', 'Редактирование прописанного отменено!');
        }).css({"display": "none","margin-right": "10px"}),
        $("<i>", {id:"owner_btn_save", class:"material-icons", text: 'save', title: 'Сохранить'}).on("click", editOwnerRequest).css({"display": "none","margin-right": "10px"}),
        $("<i>", {id:"owner_btn_edit", class:"material-icons", text: "edit", title: 'Редактировать'}).on("click", () => clickIconEditOwner(ownerName, ownerBirthDate, subDate, unsubDate, birthPlace, current)).css("margin-right", "10px")
    ).appendTo("#obj_list_group .block-header-with-manipulation");

    $("<div>", { class:"notification", text: "Поля, отмеченные звездочкой (*), обязательны для заполнения"}).appendTo(parent).css("display", "none");

    const creationTime = $("<div>", { class:"notification", id:"owner_creation_time" ,text: `Добавил: ${authorText} ${creationTimeText}`}).appendTo(formBlock);
 }

 function createAgrData (agreementsData){
     console.log(agreementsData);
     $("#owner_btn_edit").hide();
     $("#add_agreement_btn, #cancel_agreement_btn").hide();

    const parent = "#obj_list_group .block-content";
    $(parent).empty();
    const parentDiv = $('<div>', {class: "obj_list_item"}).appendTo(parent);
    for (i = 0; i < agreementsData.length; i++) {
        $('<span>', {text: agreementsData[i] }).css("padding-right","10px").appendTo(parentDiv);
    }
    
 }

 function addAgrData(){
    const parent = "#obj_list_group .block-content";
    $(parent).empty();
    $("#obj_list_group .form-submit-btn").remove();

    const formBlock = $("<form>", {name: "add_agreement"}).appendTo(parent);

    const table = $("<table>", {class: "table-form"}).appendTo(formBlock);
    const tbody = $("<tbody>").append(
        $("<tr>").append(
            $("<td>", {class:"table-input-name", text: "Собственник прописан?"}),
            $("<td>", {colspan: "3"}).append(
                $("<input>", {id:"owner_yes",  type:"radio", name:"owner", value:"yes"}).prop("checked", "true"),
                $("<label>", {for: "owner_yes", text: "Да"}),
                $("<input>", {id:"owner_no",  type:"radio", name:"owner", value:"no"}),
                $("<label>", {for: "owner_no", text: "Нет"})
            )
        ),
        $("<tr>", {class:"add-agreement-owner"}).append(
            $("<td>", {class:"table-input-name", text: "Собственник"}),
            $("<td>", {colspan: "3"}).append(
                $("<select>", {id:"add_agreement_owner_select", class:"input-main"})
            )
        ),
        $("<tr>", {class:"add-agreement-no-owner"}).append(
            $("<td>", {class:"table-input-name", text: "ФИО *"}),
            $("<td>", {colspan: "3"}).append(
                $("<input>", {id:"add_agreement_fio", type:"text", class:"input-main"})
            )
        ),
        $("<tr>", {class:"add-agreement-no-owner"}).append(
            $("<td>", {class:"table-input-name", text: "Дата рождения"}),
            $("<td>", {colspan: "3"}).append(
                $("<input>", {id:"add_agreement_birth_date", type:"date", class:"input-main"})
            )
        ),
        $("<tr>").append(
            $("<td>", {class:"table-input-name", text: "Наименование договора *"}),
            $("<td>", {colspan: "3"}).append(
                $("<input>", {id:"add_agreement_name", type:"text", class:"input-main"})
            )
        ),
        $("<tr>").append(
            $("<td>", {class:"table-input-name", text: "Дата договора *"}),
            $("<td>", {colspan: "3"}).append(
                $("<input>", {id:"add_agreement_date", type:"date", class:"input-main"})
            ),
            $("<td>", {class:"table-input-name", text: "Доля"}),
            $("<td>", {colspan: "3"}).append(
                $("<input>", {id:"add_agreement_part", type:"text", class:"input-main"})
            )
        )
    ).appendTo(table);

    $("<div>", { class:"notification", text: "Поля, отмеченные звездочкой (*), обязательны для заполнения"}).appendTo(parent).css("display", "none");

    let registrationsData = OBJECT_DATA.registrations;
    for (const registrationKey in registrationsData) {
        let registrationData = registrationKey.split('&');    
        $('<option>', {text: registrationData[0], humanId: registrationData[2]}).appendTo('#add_agreement_owner_select');
    }

    $("<div>", {class:"form-submit-btn"}).append(
        $("<i>", {id:"add_agreement_btn", class:"material-icons", text: "note_add", title: 'Добавить договор'}).on("click", addNewAgreement).css("margin-right", "10px"),
        $("<i>", {id:"cancel_agreement_btn", class:"material-icons", text: 'cancel', title: 'Отменить'}).on("click", () => {
            $("#obj_list_group").find(".block-content").empty();
            $("#add_agreement_btn, #cancel_agreement_btn").hide();
            showPopupNotification('alert', 'Создание собственника отменено!');
        }) 
    ).appendTo("#obj_list_group .block-header-with-manipulation");

    setInputRadio();
 }

function createContentBlock(name, styles) {
    const block = $('<div>', {class: 'block'});
    const header = $('<div>', { class: 'block-header' }).append(
        $('<div>', { class: 'header', text: name })
    ).appendTo(block);
    
    const content = $('<div>', {class: 'block-content'}).appendTo(block);

    block.css(styles);

    return block;
}


function showCurrentCompany() { // показать текущую компанию. 
    const currentCompany = localStorage['currentCompany']; // получить значение текущей компании
    if (currentCompany) { // если значение true сделать следующее
        $('#main_menu_company_name').text(currentCompany); //изменить текст в названии компании
        $('#popup_control .popup-fullscreen-name').text('Управление ' + currentCompany); // и в шапке в управлении
        $('#popup_registry .popup-fullscreen-name').text('Реестры ' + currentCompany);
    }
}

// создание выпадающего меню со списком компаний
function createCompanyDropdownMenu() {
    let companiesData = USER_DATA.org_list;
    for (const company of companiesData) {
        let companyId = company.id;
        let companyName = company.name;
        const li = $('<li>', {id: companyId, class: 'dropdown-menu-item'}).appendTo('#jq-dropdown-company-list .jq-dropdown-menu');
        li.on('click', function() {
            chooseCompany($(this), companyName, companyId);
            $('#jq-dropdown-company-list .dropdown-menu-item').removeClass('active');
            $(this).addClass('active');
        })
        $('<a>', {text: companyName}).appendTo(li);

        if (USER_DATA.org_list.length == 1) {
            chooseCompany(li, companyName, companyId);
        }
    }
}

function chooseCompany(li, companyName, companyId) {
    if(!li.hasClass('active')) {
        $('<span>', {class: 'text-center-small', text: 'Выберите реестр из списка или создайте новый'}).appendTo('#registry_settings_content .block-content');
        $('#main_search_input').attr('disabled', false);
        $('#main_search_input').val('');
        $('#main_menu li[title="КОМПАНИИ"]').removeClass('blinking');
        $('.li-change-events').removeClass('li-disabled');
        $('.object-list-tree').empty();
        $('#main_menu_company_name').text(companyName);
        $('#popup_control .popup-fullscreen-name').text('Управление ' + companyName);
        $('#popup_registry .popup-fullscreen-name').text('Реестры ' + companyName);
        setCookie('companyId', companyId);
        initializationPopupControl();
        initializeUserRight();
        getObjectsTreeData([initializeObjectsTreeFilters]);
        localStorage.setItem('currentCompanyId', companyId);
        localStorage.setItem('currentCompany', companyName);
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
    $('.popup-window, .popup-fullscreen').hide();
    if(office_admin_active){
        console.log("active");
        $("<div>", {id:"popup_background_2"}).appendTo("#popup_background").on('click', (e) => {
            if (e.target !== e.currentTarget) {
                return;                
            }
            else {
                $('#popup_background_2').remove();
                $('.popup-window').fadeOut(200);
                if($(e.target).find('#popup_object_files_registry .file-block')){
                    $('#popup_object_files_registry .file-block').remove();
                }
                office_admin_active = false;
            }
        });
        $(`#${id}`).css({    
            "position": "absolute",
            "z-index": "90",
            "left": "32%"
        });
        if(id == "popup_object_files_registry"){
            $(`#${id}`).css({    
                "position": "absolute",
                "z-index": "90",
                "left": "14%"
            }); 
        }
        $("#popup_office_administration").show();
    }
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
    if(office_admin_active){
        $('#popup_background_2').remove();
        $("#popup_office_administration").fadeIn(200);
        office_admin_active = false;
        $(`#${popupId}`).fadeOut(200);
    } else{
        $(`#${popupId}, #popup_background`).fadeOut(200);   
        $('#popup_report .content').empty();
        $('.main-menu li').removeClass('active');
        $('#home_page').addClass('active');
        if(popupId == 'popup_object_files_registry'){
            $('#popup_object_files_registry .file-block').remove();
        }  
    }

    
}

function closePopupWindowLayer2(popupId) {
    $(`#${popupId}, #popup_background_layer2`).fadeOut(200);
    $('#popup_report .content').empty();
}

function closePopupWindowWithConfirm(popupId) {
    if (confirm(`Все внесенные изменения будут потеряны. Вы уверены, что хотите закрыть окно?`)) {
        $(`#${popupId}, #popup_background`).fadeOut(200);
        $('#popup_report .content').empty();
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

function getObjectsTreeData(callback) {
    $('.object-list-tree, #control_object_groups_left_column .block-content').empty();
    createContentLoader('#object_list_tree');
    createContentLoader('#control_object_groups_left_column .block-content');

    if (sessionStorage.getItem('printMode') == 'on') {
        switchToggle('object_list_toggle');
    }

    const data = {};
    const isSelected = [];
    const lS = localStorage;

    if(lS.hasOwnProperty('debt_less_1000') && lS.getItem('debt_less_1000') == 'off' ){
        data.debt_less_1000 = "off";
        lS.setItem('debt_less_1000', 'off');

    } else {
        data.debt_less_1000 = "on";
        lS.setItem('debt_less_1000', 'on');
    }

    $("#object_list_template input").each((index, input) => {
        if($(input).prop("checked")){
            isSelected[index] = input;
        }
    });

    if(lS.getItem('debt_less_1000') == 'on' && lS.getItem('display_city') == 'on' && isSelected.length <= 0){
        $("#icon-setting").find("span").remove();
        console.log("Оба дефолт")
    } else {
        $("#icon-setting").append($("<span>", {class: "material-icons", text: "stars"}));       
        console.log("Изменение")
    } 
    
    $.ajax({
        type: "POST",
        url: "/base_func?fnk_name=objects_tree_filters",
        data: JSON.stringify(data),
        success: function (data) {
            OBJECTS_TREE_DATA = JSON.parse(data);
            console.log(JSON.parse(data))
            createObjectsTree(OBJECTS_TREE_DATA[0].objects_list);            
            if (!isEmpty(callback)) {
                for (const func of callback) {
                    func();
                }
            }
            removeContentLoader('#object_list_tree', '.object-list-tree');
        }
    });
}

function createObjectsTree(objectsList) {
    // const objectList = objectTree.object_list;
    const controlUl = $('<ul>', {id: 'create_object_group_ul'});
    console.log(objectsList);
    for (const object of objectsList) {
        let objectAdress = `${object.city} ${object.street} ${object.house}`;
        
        if (localStorage.hasOwnProperty('display_city') && localStorage.getItem('display_city') == 'off') {
            objectAdress = `${object.street} ${object.house}`;
        }

        const li = $('<li>', { text: objectAdress, class: 'parent-li' }).appendTo('.object-list-tree');
        $('<input>', {type: 'checkbox', class: 'object-tree-parent-li-input'}).prependTo(li);
        const parentUl = $('<ul>', { class: 'object-tree-ul hide' }).insertAfter(li);

        const controlLi = $('<li>', {class: 'parent-li', text: `${object.city} ${object.street} ${object.house}`}).appendTo(controlUl);
        $('<input>', {type: 'checkbox', id: `object_${object.id}`, object_id: object.id}).prependTo(controlLi);

        for (const apartment of object.apartments) {
            const apartData = apartment.split('&');
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

            const createLoader = (registry, callback) => {
                createContentLoader('#popup_report .content');
                openPopupWindow('popup_report');
                $.get(`/report?multi=true&rnum=${repNum}&rtype=${repType}&accid=${accids}&humanid=&createRegistry=${registry}`, function (data) {
                    $('#popup_report .name').text('');
                    $('#popup_report .content').html(data);
                    callback();
                });
            };

            
            if (confirm('Создать реестр массовой печати?')) {
                createLoader(true, function () {
                    if ($('#registry_type_select').val() == 'regular') {
                        getRegistryList(() => { });
                    }
                });
            }
            else {   
                createLoader(false, function () { });
            }
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
            $(".header-toggle, .header-title").css("display","inline-flex");
            $("#obj_content .header-manipulation-agr").css("display","block");
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

                $('#obj_ls_info .header').attr('did', accid);

                getObjectData();

                if ($('#update_info_content').is(':visible')) {
                    $('#update_info_content').hide();
                    $('#obj_content').show();
                }

                if (!isEmpty(CURRENT_OBJECT_DATA)) {
                    
                    $('#obj_info .header-manipulation').show();
                    // $('#obj_agreements_btn, #obj_owners_btn').prop('disabled', false);
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

    showSelectedObjectNum();
    removeContentLoader('body', '#page_body');
}

function initializeObjectsTreeFilters() {
    let filters = OBJECTS_TREE_DATA;
    filters.shift();
    let selectedFilters = [];
    let selectedFiltersConst = [];
    $('#object_list_template').empty();

    $.each(filters, function(index, element){
 
        let filtersListDiv; 
        let parentDiv;
        
        if(element.title !== "Статические фильтры"){
            parentDiv = $("<div>", {class: "header-div"}).text(element.title).appendTo('#object_list_template');

            let dropIcon = $('<i>', {class: 'material-icons', title: 'Развернуть фильтр', text: 'add_circle_outline' }).appendTo(parentDiv);    
                      
            let helpIcon = $("<i>", {  class: "material-icons", title: "Справка", text: "help_outline" }).appendTo(parentDiv);
            if(element.title == "Исключающие фильтры"){
               helpIcon.attr("data-jq-dropdown","#jq-dropdown-exception-filter"); 
            } else if(element.title == "Включающие фильтры"){
               helpIcon.attr("data-jq-dropdown","#jq-dropdown-including-filter");
            }
            
            
            filtersListDiv = $('<div>', { class: 'border-block-default accordion' });
            filtersListDiv.attr("active", false);
            parentDiv.css("cursor", "pointer");

            function DropDownDiv(e) {
                if($(e.nextSibling).attr("active") == "false"){
                    $(".accordion").each((e,i)=>{
                        $(i.children).each((j, chekeds) => {
                            $(chekeds.firstChild.firstElementChild).prop('checked', false);
                        });
                        if($(i).attr("active") == "true"){
                            $(i).slideUp();
                            $(i).attr("active", false);
                            $(i.previousElementSibling.firstElementChild).text('add_circle_outline');
                            $(i.previousElementSibling).removeClass("header-div-active");
                        }
                    });
                    $(e).addClass("header-div-active");
                    $(e.nextSibling).attr("active", true);
                    $(e.nextSibling).slideDown();
                    $(e.firstElementChild).text("remove_circle_outline");
                    selectedFilters = [];
                } else if($(e.nextSibling).attr("active") == "true"){
                    $(e.nextSibling).slideUp();
                    $(e.nextSibling).attr("active", false);
                    $(e.firstElementChild).text("add_circle_outline");
                    $(e).removeClass("header-div-active");
                    selectedFilters = [];
                } 
            }

            parentDiv.on("click", (e) => {
                DropDownDiv(e.target);  
            });
            dropIcon.on("click", (e) => {
                DropDownDiv(e.target.parentElement);
            })
        } else {
            filtersListDiv = $('<div>', { class: 'border-block-default-constant' }); 
            parentDiv = $("<div>", {class: "header-constant-div"}).text(element.title).appendTo('#object_list_template'); 
            let helpIcon = $("<i>", {  class: "material-icons", title: "Справка", text: "help_outline" }).appendTo(parentDiv);
            helpIcon.attr("data-jq-dropdown","#jq-dropdown-stat-filter");      
        }

        if(element.title == "Исключающие фильтры"){
            filtersListDiv.slideUp();
        } else if(element.title == "Включающие фильтры"){
            filtersListDiv.slideUp();
        }   
       
        $.each(element.list, function(jndex, filter){
            const input = $('<input>', { type: 'checkbox', class: 'checkbox' });

            if (element.title == "Статические фильтры"){
                input.on('change', () => {
                const isSelected = input.prop('checked');
                    if (isSelected) {
                        selectedFiltersConst.push(filter.value);
                    }
                    else {
                        selectedFiltersConst.pop(filter.value);
                    }
                });
            } else {
                input.on('change', () => {
                const isSelected = input.prop('checked');
                    if (isSelected) {
                        selectedFilters.push(filter.value);
                    }
                    else {
                        selectedFilters.pop(filter.value);
                    }
                });
            }
            
            const span = $('<span>', { class: 'checkmark' });
            const label = $('<label>', { class: 'checkbox-container', text: filter.name, style: 'font-size: 16px' }).append(input, span);
            const div = $('<div>').append(label);
            div.appendTo(filtersListDiv);
        });
            filtersListDiv.appendTo('#object_list_template');
    });

    const inputStyle = 'width: 60px; text-align: center; margin: 0px 5px';
    const filterSumDiv = $('<div>', {class: 'border-block-sum'});
    const fromInput = $('<input>', {type: 'text', class: 'input-main', style: inputStyle});
    const toInput = $('<input>', {type: 'text', class: 'input-main', style: inputStyle});
    filterSumDiv.append('Сумма от', fromInput, 'до', toInput, 'руб.');
    filterSumDiv.appendTo('#object_list_template');

    const lS = localStorage;

    const submitBtn = $('<button>', {class: 'button-primary', text: 'Применить'}).on('click', () => {
        
        const data = {};

        if(lS.hasOwnProperty('debt_less_1000') && lS.getItem('debt_less_1000') == 'off'){
            data.debt_less_1000 = "off";
            lS.setItem('debt_less_1000', 'off');  
        } else {
            data.debt_less_1000 = "on";
            lS.setItem('debt_less_1000', 'on');
        }
        
        if (fromInput.val() !== '' || toInput.val() !== '') {

            data.filters = [...selectedFilters, ...selectedFiltersConst];
            console.log(data)
            data.sum = {from: fromInput.val(), to: toInput.val()};
            // настройка звездочки на иконке "настройки".
            if(lS.getItem('debt_less_1000') == 'on' && lS.getItem('display_city') == 'on' && data.filters.length <= 0 && !data.sum){
                $("#icon-setting").find("span").remove();
            } else {
                $("#icon-setting").append($("<span>", {class: "material-icons", text: "stars"}));       
            }   
            sendFilters(data);
        }
        else {
            data.filters = [...selectedFilters, ...selectedFiltersConst];
            console.log(data)
            // настройка звездочки на иконке "настройки".
            if(lS.getItem('debt_less_1000') == 'on' && lS.getItem('display_city') == 'on' && data.filters.length <= 0){
                $("#icon-setting").find("span").remove();
            } else {
                $("#icon-setting").append($("<span>", {class: "material-icons", text: "stars"}));       
            }   
            sendFilters(data);
        }
    });

    const clearCheked = $("<button>", { class: 'button-secondary', text: 'Очистить'}).on('click', () => {
        $('#object_list_template input:checked').prop('checked', false);
        selectedFilters = [];
        selectedFiltersConst = [];
        $('.border-block-sum input').each((i,el) => {
            $(el).val('');
            console.log(el);
        });
    });
    clearCheked.css("margin-right","5px");
       
    const submitBtnDiv = $('<div>', {class: 'form-submit-btn'}).append(clearCheked, submitBtn);
    submitBtnDiv.appendTo('#object_list_template');


    function sendFilters(data) {
        console.log(data);
        closePopupWindow('popup_object_list_settings');
        createContentLoader('#object_list_tree');
        $('.object-list-tree, #control_object_groups_left_column .block-content').empty();
        $.ajax({
            type: 'POST',
            url: '/base_func?fnk_name=objects_tree_filters',
            data: JSON.stringify(data),
            success: function (data) {
                console.log(JSON.parse(data));
                if(JSON.parse(data) != null){
                    createObjectsTree(JSON.parse(data)[0].objects_list);
                    removeContentLoader('#object_list_tree', '.object-list-tree');  
                } else {
                    showPopupNotification('alert', 'Данные по указанным фильтрам отсутствуют!');
                }
                
            }
        });
    }  
}
// получение данных  с сервера
function getObjectData() {

    $('#obj_ls_info .icon-count').remove();
    $('#agreements_contract_content, #obj_main_table, #add_agreement_owner_select, #obj_additional_info .block-content, #obj_list_group .block-content').empty();
    $("#update_agreement_icon").hide();
    createContentLoader('#obj_agreements_info .block-content');
    createContentLoader('#obj_main_table');
    createContentLoader('#obj_additional_info .block-content');
    
    $.ajax({
        type: "POST",
        url: "/base_func?fnk_name=adr_info",
        data: JSON.stringify({accid: CURRENT_OBJECT_DATA.accid}),
        success: function (data) {
            
            OBJECT_DATA = JSON.parse(data);
            console.log(OBJECT_DATA)

            initializeObjectFiles();

            initializeOfficeAdministration();

            initializeObjectReputation();

            getObjectAgreementsData();

            getObjectRegistrationsData();

            removeContentLoader('#obj_agreements_info .block-content', '#agreements_contract_content');

            getObjectInfoData();

            getObjectContactsData();

            getObjectNotationsData();

            getObjectCommunicationsData();

            getObjectHistoryData([createObjectHistoryTable, initializeAccountHistorySettings]);

            createSelectWithPeople('add_contact_select');

            clickDropdownMenu();
        }
    });
}
// работа с файлами адресов
function initializeObjectFiles() {

    const popupId = 'popup_object_files';

    $(`#${popupId}, #obj_files_icon`).remove();

    const uploadedFilesRepository = {};

    const filesIcon = $('<div>', {id: 'obj_files_icon', class: 'icon-with-count'}).append(
        $('<i>', {class: 'material-icons', title: 'Файлы', text: 'folder_open' }).on('click', () => {
            openPopupWindow(popupId);
        })
    ).appendTo('#obj_ls_info .header-manipulation');
        
    if (!isEmpty(OBJECT_DATA.files)) {
        const counterIcons = $('<div>', { class: 'icon-count', text: OBJECT_DATA.files.length, title: 'Файлы' }).appendTo(filesIcon);
        addEventListenersToCounterIcons(counterIcons);
    }

    const popupLayout = createPopupLayout('Файлы', popupId);
    popupLayout.appendTo('#popup_background');

    const popupContent = $(popupLayout).find('.popup-content');

    const filesDownloadDiv = $('<div>', { id: 'object_files_upload' });
    const uploadFormBlock = createContentBlock('Загрузка', { 'width': '100%', 'height': '120px' }).appendTo(filesDownloadDiv);
    const numberUploadedFilesDiv = $('<div>', { style: 'height: 50%' }).append(
        $('<span>', { text: 'Выбрано файлов: 0', style: 'display: flex; align-items: center; height: 100%' })
    ).appendTo(uploadFormBlock.find('.block-content'));
    uploadFormBlock.find('.block-content').css({ 'position': 'relative' });

    const chooseFilesButton = $('<button>', { class: 'button-primary', style: 'margin-right: 5px' }).append(
        $('<label>', { for: 'object_files_input', text: 'Выбрать файлы' })
    );

    const filesInput = $('<input>', { id: 'object_files_input', type: 'file', style: 'display: none', multiple: 'true' });
    filesInput.on('change', () => {
        const files = filesInput.prop('files');
        numberUploadedFilesDiv.find('span').text(`Выбрано файлов: ${files.length}`);
        uploadFilesListBlockContent.empty();
        if (files.length > 0) {
            for (const file of files) {
                const fileNameDiv = $('<div>', { style: 'padding-bottom: 5px' }).append(
                    $('<span>', { text: file.name, style: 'color: var(--third-color)' })
                );
                const fileTypeDiv = $('<div>').append(
                    $('<select>', { class: 'input-main', file_name: file.name })
                )
                const fileDiv = $('<div>', { class: 'file-block' }).append(fileNameDiv, fileTypeDiv);

                fileDiv.appendTo(uploadFilesListBlockContent);
                
                uploadedFilesRepository[file.name] = fileDiv;
                
                const fileTypesSelect = fileTypeDiv.find('select');

                $('<option>', { text: 'Выбрать тип файла', disabled: 'true', selected: 'true' }).appendTo(fileTypesSelect);
                for (const type of OBJECT_DATA.upload_file_types) {
                    $('<option>', { text: type.name, value: type.value }).appendTo(fileTypesSelect);
                }

                if (file.type == 'text/xml') {
                    fileTypesSelect.val('rosreester');

                    for (const option of fileTypesSelect.find('option')) {
                        if ($(option).val() !== 'rosreester') {
                            $(option).attr('disabled', true);
                        }
                    }
                }
                else {
                    for (const option of fileTypesSelect.find('option')) {
                        if ($(option).val() == 'rosreester') {
                            $(option).attr('disabled', true);
                        }
                    }
                }

            }
        }
        else {
            $('<span>', { class: 'text-center-small', text: 'Выберите файлы для загрузки' }).appendTo(uploadFilesListBlockContent);
        }
    });

    const uploadFilesButton = $('<button>', { class: 'button-secondary', text: 'Загрузить' });
    uploadFilesButton.on('click', () => {
        const fileTypesObj = {};

        for (const select of uploadFilesListBlockContent.find('select')) {
            const fileName = $(select).attr('file_name');
            let fileType = $(select).val();

            fileTypesObj[fileName] = fileType;
        }

        let typesCorrect = true;

        for (const elem in fileTypesObj) {
            const type = fileTypesObj[elem];
            console.log(type)
            if (type == null || type == '') {
                typesCorrect = false;
                break;
            }
        }

        if (typesCorrect) {
            const files = filesInput.prop('files');
            const parentNode = uploadFormBlock.find('.block-content');
            const filesInfoNode = numberUploadedFilesDiv.find('span');
            let count = 0;
            const callback = (data) => {
                const fileObj = JSON.parse(data);
                initializeFilesList([fileObj]);
                uploadedFilesRepository[fileObj.name].remove();
                count++;
                if (count == files.length) {
                    filesInput.val('');
                }

                if (filesIcon.find('.icon-count').length == 0) {
                    const counterIcons = $('<div>', { class: 'icon-count', text: '1', title: 'Файлы' }).appendTo(filesIcon);
                }
                else {
                    const numberOfFiles = filesIcon.find('.icon-count').text();
                    filesIcon.find('.icon-count').text(parseInt(numberOfFiles) + 1);
                }
            };
            let AccidRessid = CURRENT_OBJECT_DATA.accid;
            uploadFiles(files, fileTypesObj, parentNode, filesInfoNode, AccidRessid, callback);

        }
        else {
            showPopupNotification('alert', 'Укажите типы для всех загружаемых файлов!');
        };
    });

    const navigateButtonsDiv = $('<div>', { style: 'height: 50%' }).append(chooseFilesButton, filesInput, uploadFilesButton);
    navigateButtonsDiv.appendTo(uploadFormBlock.find('.block-content'));

    const uploadFilesListBlock = createContentBlock('Список загружаемых файлов', { 'width': '100%', 'height': 'calc(100% - 130px)', 'margin-top': '10px' }).appendTo(filesDownloadDiv);
    const uploadFilesListBlockContent = $(uploadFilesListBlock).find('.block-content');
    $('<span>', { class: 'text-center-small', text: 'Выберите файлы для загрузки' }).appendTo(uploadFilesListBlockContent);
    filesDownloadDiv.appendTo(popupContent);

    const filesList = $('<div>', { id: 'object_files_list' });
    const filesListBlock = createContentBlock('Список файлов', { 'width': '100%', 'height': '100%' }).appendTo(filesList);
    filesList.appendTo(popupContent);

    function initializeFilesList(files) {
        for (const file of files) {
            const fileDiv = $('<div>', { class: 'file-block' }).append(
                $('<div>', { style: 'display: flex; align-items: center' }).append(
                    $('<div>', { class: 'file-type' }).append(
                        $('<span>', { text: `${file.type}` })
                    )
                ),
                $('<div>', { style: 'display: flex; align-items: center; margin: 5px 0px' }).append(
                    $('<div>', { class: 'file-name' }).append(
                        $('<span>', { text: file.name })
                    ),
                    $('<div>', { class: 'file-operation' }).append(
                        $('<i>', { class: 'material-icons', text: 'remove_red_eye', title: 'Открыть'}).on('click', () => {
                            $.ajax({
                                type: 'GET',
                                url: file.path,
                                xhrFields: {
                                    responseType: 'blob'
                                },
                                success: (data) => {
                                    blob = data.slice(0, data.size, "image/jpeg");
                                    const url = window.URL.createObjectURL(blob);
                                    console.log(url)
                                    window.open(url, '_blank');
                                    window.URL.revokeObjectURL(url);
                                }
                            });
                        }),
                        $('<i>', { class: 'material-icons', text: 'save', title: 'Скачать' }).on('click', () => {
                            showPopupNotification('notification', 'Загрузка файла начнется автоматически!');
                            $.ajax({
                                type: 'GET',
                                url: file.path,
                                xhrFields: {
                                    responseType: 'blob'
                                },
                                success: (data) => {
                                    var a = document.createElement('a');
                                    var url = window.URL.createObjectURL(data);
                                    a.href = url;
                                    a.download = file.name;
                                    document.body.append(a);
                                    a.click();
                                    a.remove();
                                    window.URL.revokeObjectURL(url);
                                }
                            });
                        })

                    )
                ),
                $('<div>', { style: 'display: flex; align-items: center' }).append(
                    $('<div>', { class: 'file-creation' }).append(
                        $('<span>', { text: `Загрузил: ${file.author} ${file.creation_time}` })
                    )
                )
            );

            if (files.length == 1) {
                fileDiv.hide();
                fileDiv.prependTo(filesListBlock.find('.block-content'));
                fileDiv.fadeIn(400);

            }
            else {
                fileDiv.prependTo(filesListBlock.find('.block-content'));
            }
        }
    }

    initializeFilesList(OBJECT_DATA.files);
}
// работа с файлами реестров

function openFilesRegistryPopup(registryId, registryName, registryType, documentType){
    
    $('#popup_object_files_registry .popup-name').text('Файлы');

    const uploadedFilesRepository = {};

    const numberUploadedFilesDiv = $("#popup_object_files_registry #files_counter");

    const uploadFilesListBlockContent = $('#popup_object_files_registry #files_upload_list');

    const uploadFormBlock = $("#upload_form_content");

    const filesInput = $('#popup_object_files_registry #object_files_reg_input');
    filesInput.off('change');
    filesInput.on('change', () => {
        const files = filesInput.prop('files');
        numberUploadedFilesDiv.find('span').text(`Выбрано файлов: ${files.length}`);
        uploadFilesListBlockContent.empty();
        if (files.length > 0) {
            for (const file of files) {
                const fileNameDiv = $('<div>', { style: 'padding-bottom: 5px' }).append(
                    $('<span>', { text: file.name, style: 'color: var(--third-color)' })
                );
                const fileTypeDiv = $('<div>').append(
                    $('<select>', { class: 'input-main', file_name: file.name })
                )
                const fileDiv = $('<div>', { class: 'file-block' }).append(fileNameDiv, fileTypeDiv);

                fileDiv.appendTo(uploadFilesListBlockContent);

                uploadedFilesRepository[file.name] = fileDiv;

                const fileTypesSelect = fileTypeDiv.find('select');

                $('<option>', { text: 'Выбрать тип файла', disabled: 'true', selected: 'true' }).appendTo(fileTypesSelect);
                for (const type of registryData.upload_file_types) {
                    $('<option>', { text: type.name, value: type.value }).appendTo(fileTypesSelect);
                }

                if (file.type == 'text/xml') {
                    fileTypesSelect.val('rosreester');

                    for (const option of fileTypesSelect.find('option')) {
                        if ($(option).val() !== 'rosreester') {
                            $(option).attr('disabled', true);
                        }
                    }
                }
                else {
                    for (const option of fileTypesSelect.find('option')) {
                        if ($(option).val() == 'rosreester') {
                            $(option).attr('disabled', true);
                        }
                    }
                }

            }
        }
        else {
            $('<span>', { class: 'text-center-small', text: 'Выберите файлы для загрузки' }).appendTo(uploadFilesListBlockContent);
        }    
    });

    const filesListBlock = $("#object_files_list .block-content");

    const uploadFilesButton =  $("#button_upload_files");
    uploadFilesButton.off("click");
    uploadFilesButton.on("click", () => {
        const fileTypesObj = {};

        for (const select of uploadFilesListBlockContent.find('select')) {
            const fileName = $(select).attr('file_name');
            let fileType = $(select).val();

            fileTypesObj[fileName] = fileType;
        }

        let typesCorrect = true;

        for (const elem in fileTypesObj) {
            const type = fileTypesObj[elem];
            console.log(type)
            if (type == null || type == '') {
                typesCorrect = false;
                break;
            }
        }

        if (typesCorrect) {
            const files = filesInput.prop('files');
            const parentNode = uploadFormBlock;
            const filesInfoNode = numberUploadedFilesDiv.find('span');
            let count = 0;
            const callback = (data) => {
                const fileObj = JSON.parse(data);
                initializeFilesList([fileObj]);
                uploadedFilesRepository[fileObj.name].remove();
                count++;
                if (count == files.length) {
                    filesInput.val('');
                }
                $(".material_counts").each(function(index, elem){            
                    if($(elem).attr("idregstr") == IdRegStr){
                        $(elem).text("folder");
                    }
                });
                filesInput.val("");
                getRegistryData(registryId, registryName, registryType, documentType);
            };
            let AccidRessid = `${IDAccid}@${IdRegStr}`;
            uploadFiles(files, fileTypesObj, parentNode, filesInfoNode, AccidRessid, callback);
        }
        else {
            showPopupNotification('alert', 'Укажите типы для всех загружаемых файлов!');
        };
    });

    function initializeFilesList(files) {
        for (const file of files) {
            const fileDiv = $('<div>', { class: 'file-block' }).append(
                $('<div>', { style: 'display: flex; align-items: center' }).append(
                    $('<div>', { class: 'file-type' }).append(
                        $('<span>', { text: `${file.type}` })
                    )
                ),
                $('<div>', { style: 'display: flex; align-items: center; margin: 5px 0px' }).append(
                    $('<div>', { class: 'file-name' }).append(
                        $('<span>', { text: file.name })
                    ),
                    $('<div>', { class: 'file-operation' }).append(
                        $('<i>', { class: 'material-icons', text: 'remove_red_eye', title: 'Открыть'}).on('click', () => {
                            $.ajax({
                                type: 'GET',
                                url: file.path,
                                xhrFields: {
                                    responseType: 'blob'
                                },
                                success: (data) => {
                                    blob = data.slice(0, data.size, "image/jpeg");
                                    const url = window.URL.createObjectURL(blob);
                                    console.log(url)
                                    window.open(url, '_blank');
                                    window.URL.revokeObjectURL(url);
                                }
                            });
                        }),
                        $('<i>', { class: 'material-icons', text: 'save', title: 'Скачать' }).on('click', () => {
                            showPopupNotification('notification', 'Загрузка файла начнется автоматически!');
                            $.ajax({
                                type: 'GET',
                                url: file.path,
                                xhrFields: {
                                    responseType: 'blob'
                                },
                                success: (data) => {
                                    var a = document.createElement('a');
                                    var url = window.URL.createObjectURL(data);
                                    a.href = url;
                                    a.download = file.name;
                                    document.body.append(a);
                                    a.click();
                                    a.remove();
                                    window.URL.revokeObjectURL(url);
                                }
                            });
                        })

                    )
                ),
                $('<div>', { style: 'display: flex; align-items: center' }).append(
                    $('<div>', { class: 'file-creation' }).append(
                        $('<span>', { text: `Загрузил: ${file.author} ${file.creation_time}` })
                    )
                )
            );

            if (files.length == 1) {
                fileDiv.hide();
                fileDiv.prependTo(filesListBlock);
                fileDiv.fadeIn(400);

            }
            else {
                fileDiv.prependTo(filesListBlock);
                
            }
        }
    }
    if(!isEmpty(filesRegistry)){
        initializeFilesList(filesRegistry);
    }
    filesInput.val(""); 
    numberUploadedFilesDiv.find('span').text(`Выбрано файлов: 0`);
        
    
    openPopupWindow('popup_object_files_registry');
}

function initializeObjectReputation() {

    $('#object_reputation_indicator').remove();

    let reputationIcon = 'radio_button_unchecked';
    let iconColor = 'yellow';
    let iconTitle = 'Нейтральная репутация (желтый)';

    const reputation = OBJECT_DATA.reputation;
    if (reputation == 'bad') {
        reputationIcon = 'sentiment_dissatisfied';
        iconColor = 'red';
        iconTitle = 'Плохая репутация (красный)';
    }
    else if (reputation == 'good') {
        reputationIcon = 'sentiment_satisfied';
        iconColor = 'green';
        iconTitle = 'Хорошая репутация (зеленый)';
    }

    const changeReputationContent = $('<div>', {id: 'jq-dropdown-change-object-reputation', class: 'jq-dropdown jq-dropdown-tip jq-dropdown-anchor-right'}).append(
        $('<div>', {class: 'jq-dropdown-panel'}).append(
            $('<div>', {class: 'object-reputation-elem', value: 'good'}).append(
                $('<span>').append(
                    $('<i>', {class: 'material-icons', text: 'sentiment_satisfied', style: 'color: green; vertical-align: middle'})
                ),
                $('<span>', {text: 'Хорошая репутация'})
            ).on('click',  function() {changeObjectReputation($(this))}),
            $('<div>', {class: 'object-reputation-elem', value: 'neutral'}).append(
                $('<span>').append(
                    $('<i>', {class: 'material-icons', text: 'radio_button_unchecked', style: 'color: yellow; vertical-align: middle'})
                ),
                $('<span>', {text: 'Нейтральная репутация'})
            ).on('click',  function() {changeObjectReputation($(this))}),
            $('<div>', {class: 'object-reputation-elem', value: 'bad'}).append(
                $('<span>').append(
                    $('<i>', {class: 'material-icons', text: 'sentiment_dissatisfied', style: 'color: red; vertical-align: middle'})
                ),
                $('<span>', {text: 'Плохая репутация'})
            ).on('click',  function() {changeObjectReputation($(this))})
        )
    )

    changeReputationContent.find(`div[value=${reputation}]`).addClass('active');

    changeReputationContent.appendTo('body');

    $('<i>', {id: 'object_reputation_indicator', class: 'material-icons', title: `${iconTitle}. Нажмите, чтобы изменить`, text: reputationIcon, style: `color:${iconColor}`, 'data-jq-dropdown' : '#jq-dropdown-change-object-reputation'}).appendTo('#obj_ls_info .header-manipulation');

}

function changeObjectReputation(elem) {
    const reputationValue = elem.attr('value');

    $('.object-reputation-elem').removeClass('active');
    elem.addClass('active');

    $.post(encodeURI(`/base_func?val_param=chg_reputation&val_param1=${CURRENT_OBJECT_DATA.accid}&val_param2=${reputationValue}`), function(data) {
        OBJECT_DATA.reputation = reputationValue;
        $('#jq-dropdown-change-object-reputation').jqDropdown('hide');

        let reputationIcon = 'radio_button_unchecked';
        let iconColor = 'yellow';
        let iconTitle = 'Нейтральная репутация (желтый)';

        const reputation = OBJECT_DATA.reputation;
        if (reputation == 'bad') {
            reputationIcon = 'sentiment_dissatisfied';
            iconColor = 'red';
            iconTitle = 'Плохая репутация (красный)';
        }
        else if (reputation == 'good') {
            reputationIcon = 'sentiment_satisfied';
            iconColor = 'green';
            iconTitle = 'Хорошая репутация (зеленый)';
        }

        $('#object_reputation_indicator').attr('title', `${iconTitle}. Нажмите, чтобы изменить`);
        $('#object_reputation_indicator').css({'color': `${iconColor}`});
        $('#object_reputation_indicator').text(reputationIcon);

        showPopupNotification('notification', 'Репутация успешно изменена!');
    });
}

function initializeOfficeAdministration() {
    const registryUl = $('<ul>');
    const registryType = "constant";
    let calendarValue = getCalendarValue('registry_settings_calendar');
    const uniqueClass = "_office"
    createRegistrySettingsPopup(uniqueClass);
    registryUl.empty();
    $.post(`/base_func?val_param=ree_reestrs&val_param1=${registryType}&val_param2=${calendarValue}`, (data) => {
        const registryList = JSON.parse(data);

        if (!isEmpty(registryList)) {
            

            for (const registry of registryList) {
                let registryName = registry.name;

                const li = $('<li>', {registry_id: registry.id}).append(
                    $('<a>').append(
                        $('<span>', {text: registryName})
                    )
                ).appendTo(registryUl);

                if (registry.status == 'Обработан') {
                    $('<i>', {class: 'material-icons', text: 'lock', style: 'font-size: 20px'}).appendTo(li.find('span'));
                    li.attr('title', 'Реестр закрыт');
                }
                li.off('click');
                li.on('click', function () {
                    const tabsCollection = registryUl.find('li');
                    tabsCollection.removeClass('active');
                    $(this).addClass('active');
                    $("#add_container").remove();
                    const saveScroll =  $('#popup_office_administration .block-content');
                    let countSaveScroll = saveScroll.scrollTop()
                    getRegistryData(registry.id, registry.name, registryType, registry.doc_type,saveScroll, countSaveScroll, "true");
                    
                })
            }
        }
    });
    const popupId = 'popup_office_administration';
    $(`#${popupId}, #office_administration_icon`).remove();
    const popupLayout = createPopupFullscreenLayout(`Делопроизводство: ${CURRENT_OBJECT_DATA.adress}`, popupId, {'display' : 'flex', 'justify-content' : 'space-around'});
    popupLayout.appendTo('#popup_background');
    const icon = $('<div>', {id: 'office_administration_icon', class: 'icon-with-count'}).append(
                    $('<i>', {class: 'material-icons', title: 'Делопроизводство', text: 'description' })
    ).on('click', () => {
        openPopupWindow(popupId);
    }).appendTo('#obj_ls_info .header-manipulation');
    
    console.log(OBJECT_DATA.office_administration)
    if(OBJECT_DATA.office_administration){
        icon.append($("<span>", {class: "material-icons", text: "stars"})) 
    }
        
    const blockContent = popupLayout.find('.content');

    $('<div>', {class: 'main-list'}).append(
        registryUl
    ).appendTo(blockContent);

    const registryNode = $('<div>', {class: 'main-content'}).append(
        $('<div>', {class: 'block'}).append(
            $('<div>', {class: 'block-header-with-manipulation'}).append(
                $('<div>', {class: 'header-manipulation'})
            ),
            $('<div>', {class: 'block-content no-padding'}).append(
                $('<span>', {class: 'text-center-small', text: 'Выберите реестр из списка'})
            )
        )
    ).appendTo(blockContent);
}


function refreshObjectData(callback) {
    $.ajax({
        type: "POST",
        url: "/base_func?fnk_name=adr_info",
        data: JSON.stringify({accid: CURRENT_OBJECT_DATA.accid}),
        success: function (data) {
            OBJECT_DATA = JSON.parse(data);
            for (const func of callback) {
                func();
            }
        }
    });
}

function getPackage(repName, repNum, repType) {
    const reportId = `${repType}_${repNum}`;
    setPrintNotation(reportId);


    const windowId = `popup_ownership_periods_${reportId}`;
    
    if (!$('div').is(`#${windowId}`)) {
        const popup = createPopupLayout(repName, windowId);
        popup.css({'width': '70%'});
        popup.appendTo('#popup_background');
    }

    const popupContent = $(`#${windowId}`).find('.popup-content');
    popupContent.empty();
    const loaderDiv = $('<div>', {style: 'height: 150px'});
    popupContent.append(loaderDiv);
    createContentLoader(loaderDiv);
    openPopupWindow(windowId);

    const reportData = {number: repNum, type : repType, accid: CURRENT_OBJECT_DATA.accid};

    $.ajax({
        type: 'POST',
        url: '/report',
        data: JSON.stringify({operation: "check", report_data: reportData}),
        success: (data) => {
            const periodsData = JSON.parse(data);
            if (data !== 'error' && !isEmpty(periodsData)) {
                const ownershipPeriodsRepository = [];

                const table = $('<table>', { class: 'table-form border-block-default' });

                for (const period of periodsData) {
                    const tr = $('<tr>', {class: 'border-bottom', style: 'height: 50px'});
                    const tdCheckBox = $('<td>').append(
                        $('<input>', {type: 'checkbox', checked: 'checked'})
                    )
                    const tdName = $('<td>', { text: period.name, style: 'font-weight: bold' });
                    const tdStartDate = $('<td>', { text: 'Дата начала', style: 'text-align: center' });
                    const tdStartDateInput = $('<td>').append(
                        $('<input>', { class: 'input-main', type: 'date', value: RemakeDateFormatToInput(period.start_date) })
                    );
                    const tdEndDate = $('<td>', { text: 'Дата конца', style: 'text-align: center' });
                    const tdEndDateInput = $('<td>').append(
                        $('<input>', { class: 'input-main', type: 'date', value: RemakeDateFormatToInput(period.end_date) })
                    );

                    tr.on('click', function(e) {
                        if (e.target.nodeName == 'TD') {
                            tdCheckBox.find('input').trigger('click');
                        }
                    })

                    ownershipPeriodsRepository.push({isSelected: tdCheckBox.find('input'), name: period.name, start_date: tdStartDateInput.find('input'), end_date: tdEndDateInput.find('input') });

                    tr.append(tdCheckBox, tdName, tdStartDate, tdStartDateInput, tdEndDate, tdEndDateInput);
                    tr.appendTo(table);
                }

                const button = $('<div>', { class: 'form-submit-btn' }).append(
                    $('<button>', { class: 'button-primary', text: 'Выполнить'}).on('click', () => {
                        const ownershipPeriodsData = [];

                        for (const period of ownershipPeriodsRepository) {
                            if (period.isSelected.prop('checked')) {
                                ownershipPeriodsData.push({ name: period.name, start_date: RemakeDateFormatFromInput(period.start_date.val()), end_date: RemakeDateFormatFromInput(period.end_date.val()) });
                            }
                        }
                        const isCheked = [];
                        $('input[name="action_radio"]').each((index, elem) => {
                            if($(elem).prop('checked') == true){
                              isCheked.push($(elem).val())  
                            }                            
                        });

                        const data = { operation: 'get_report', report_data: reportData, ownership_periods: ownershipPeriodsData, checkbox: isCheked};

                        if (!isEmpty(ownershipPeriodsData)) {
                            const callback = (data) => {
                                initializeReportNewWindow(data, repName, reportId);
                            }

                            getReportContent(data, callback);
                        }
                        else {
                            showPopupNotification('alert', 'Выберите хотя бы один период!')
                        }

                    }).css("margin-left","15%"),$("<div>", {class: "additional-block"})
                );
                const btnAction = $("<button>",{text: "Выбрать действия", class:"button-secondary"}).appendTo(button); 
                btnAction.css("float", "right");
                btnAction.css("width", "175px");  

                let btnAddSp = $("#add_sp"),
                    btnAddGp = $("#add_gp");
                
                btnAddSp.on("click", () => {
                    if(btnAddSp.prop('checked') == true){
                        btnAction.text(btnAddSp.attr("textname"));

                        if(btnAddGp.prop('checked') == true && btnAddSp.prop('checked') == true){
                            btnAction.text("Добавить в ГП и СП");
                        }

                    } else if(btnAddSp.prop('checked') == false && btnAddGp.prop('checked') == true){
                        btnAction.text("Добавить в ГП");

                    } else if(btnAddSp.prop('checked') == false && btnAddGp.prop('checked') == false){
                        btnAction.text("Без действий");
                    }                    
                });

                btnAddGp.on("click", () => {
                    if(btnAddGp.prop('checked') == true){
                        btnAction.text(btnAddGp.attr("textname"));

                        if(btnAddSp.prop('checked') == true && btnAddGp.prop('checked') == true){
                            btnAction.text("Добавить в СП и ГП");
                        }  
                    }   else if(btnAddGp.prop('checked') == false && btnAddSp.prop('checked') == true){
                        btnAction.text("Добавить в СП");

                    }   else if(btnAddSp.prop('checked') == false && btnAddGp.prop('checked') == false){
                        btnAction.text("Без действий");
                    } 
                    
                });
                                
                btnAction.attr("data-jq-dropdown","#jq-dropdown-additional-block"); 
                popupContent.empty();
                popupContent.append(table, button);
            }
            else {
                popupContent.empty();
                $('<div>', {class: 'notification', text: 'Нет данных из Росреестра'}).appendTo(popupContent);
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
            const accid = $(this).attr('accid');
            const humanId = $(this).attr('humanid');
            let personName; 

            ($(this).hasClass("is-input")) ? personName = $(".input-fio").val() : personName = $(this).attr('person_name')            
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
                    sendReportRange(repName, repNum, repType, accid, humanId, startDate, endDate, personName);
                    $(".input-fio").val("");
                });

                $("#start_date, #final_date").datepicker({
                    dateFormat: "mm.yy",
                    changeMonth: true,
                    changeYear: true,
                    showButtonPanel: true,
                    yearRange: '2005:2021',
                    beforeShow: function(input, inst) {
                        $('#ui-datepicker-div').addClass('input-datepicker');
                    },

                    onClose: function (dateText, inst) {
                        $(this).datepicker('setDate', new Date(inst.selectedYear, inst.selectedMonth, 1));
                    }
                });
            } else {
                $.get(`/report?rnum=${repNum}&rtype=${repType}&accid=${accid}&humanid=${humanId}&fio=${personName}`, function (data) {
                    if (repNum == '2' || repNum == '3') {
                        $('#popup_report table').addClass('export-table-border');
                    }
                    initializeReportNewWindow(data, repName, reportId, personName);
                    $(".input-fio").val("");
                });
            }
        });
    });
}

function getReportContent(data, callback) {
    $.ajax({
        type: 'POST',
        url: '/report',
        data: JSON.stringify(data),
        success: (data) => {
            if (callback) {
                callback(data);
            }
        }
    });
}

function initializeReportNewWindow(reportContent, reportName, reportId, personName = "") {
    const theme = localStorage.getItem('color_theme');
    const reportsList = getCurrentCompanyReportsArray();
    const toExcel = reportsList[reportId].to_excel;
    const objectAdress = `${CURRENT_OBJECT_DATA.adress} - ${CURRENT_OBJECT_DATA.apartNum}`;
    var printWindow = window.open('');
    printWindow.document.write(`<html theme=${theme} to_excel=${toExcel} adress="${objectAdress}" person_name="${personName}" report_name="${reportName}"><head><title>${objectAdress}, ${personName}, ${reportName}</title><link href="/css/style_report_page.css" rel="stylesheet" type="text/css"><link rel="shortcut icon" href="/images/favicon.ico" type="image/x-icon"><script src="/js/jquery-3.4.1.min.js"></script><script src="/js/report_page.js"></script>`);
    printWindow.document.write(`</head><body id="report_print"><div id="header"><div id="navigation"><select id="font_size_select" title="Размер шрифта. Изменение размера текста."><option>10</option><option>11</option><option selected>12</option><option>13</option><option>14</option><option>15</option><option>16</option><option>17</option><option>18</option></select><button id="print_btn">Печать</button><button id="exit_btn" title="Закрыть"><i class="material-icons">close</i></button></div></div><div id="content"><div id="report_content">`);
    printWindow.document.write(reportContent);
    printWindow.document.write('</div></div></body></html>');

    printWindow.document.close(); // necessary for IE >= 10
    printWindow.focus(); // necessary for IE >= 10*/
}

function setPrintNotation(reportId) {
    let reportsList = getCurrentCompanyReportsArray();
    const printNotation = reportsList[reportId].print_notation;
    sessionStorage.setItem('printNotation', printNotation);
}

function getPrintForm(){
    $("#obj_cerfiticat_report tbody, #obj_package tbody").empty();
    const reportsArr = getCurrentCompanyReportsArray();
    console.log(reportsArr);
    for(const elem in reportsArr){
        const report = reportsArr[elem]
        if(report.rep_type == "certificate" || report.rep_type == "report"){
            $("<tr>").append(
                $("<td>").append($('<i>', {'data-jq-dropdown': `#jq-dropdown-${DROPDOWN_NUM}`, class: 'material-icons', text: 'person', title: 'Выбрать собственника' })),
                $("<td>", {text: report.rep_name})
            ).appendTo("#obj_cerfiticat_report tbody");

            const arrPerson = [];
            const arrPersonUn = [];
            let i = 0;

            for( const person in OBJECT_DATA.agreements){
                arrPerson[i] = person;
                i++;
            }
            for( const person in OBJECT_DATA.registrations){
                arrPerson[i] = person;
                i++;
            }
            arrPerson.map( (element, index) => {
                let arr = element.split('&');
                if(arr.length > 3){
                    arr.pop();
                }
                arrPersonUn[index] = arr;

            });

            createDropdownMenuForPerson(DROPDOWN_NUM, Unique(arrPersonUn), report.rep_name,report.rep_num, report.rep_type);
            DROPDOWN_NUM++;
        } else {
            $("<tr>", {class: "tr-btn"}).append(
                $("<td>", {text: report.rep_name})
            ).on("click", () => {
                $("#jq-dropdown-additional-block input").prop("checked", false);
                getPackage(report.rep_name, report.rep_num, report.rep_type);
            }).appendTo("#obj_package tbody");
        }        
    }     
}

function downloadAgreementsErgp(){
    let btnDownload = $("#update_agreement_icon");
    btnDownload.css("display","inline-flex");
    btnDownload.attr("data-jq-dropdown","#jq-dropdown-agreements-ergp-block"); 

    const parentDropDown = $("#jq-dropdown-agreements-ergp-block").find(".jq-dropdown-panel")
    btnDownload.off("click");
    btnDownload.on("click", () => {    
        const data = {
            accid: CURRENT_OBJECT_DATA.accid,
            param: "check"
        }

        $.ajax({
            type: "POST",
            url: '/base_func?fnk_name=get_egrp_rec',
            data: JSON.stringify(data),
            success: function (data) {
                console.log(JSON.parse(data));
                createDropdownMenuForErgp(JSON.parse(data), parentDropDown)
            }
        });
    });

    
}


function getObjectAgreementsData() {
    getPrintForm();

    let dataInfo = OBJECT_DATA.information;

    for(let object in dataInfo){
        for(let string in dataInfo[object]){
            if(string == "Кадастровый номер" && dataInfo[object][string] !== ""){
                downloadAgreementsErgp();
            }
        }
    }

    $('#agreement_list_table').remove();

    const table = $('<table>', {id: 'agreement_list_table'});

    let agreementsData = OBJECT_DATA.agreements;
    console.log(agreementsData)
    let agreementsPeopleArr = [];
    const agreementsCount = Object.keys(agreementsData).length;
    $("#obj_agreements_btn").text(`Документы на право собственности (${agreementsCount})`); 

    $('<tr>').append($('<th>', {text: 'ФИО'})).appendTo(table);

    for (const prop in agreementsData) {
        let propData = prop.split('&');
        tr = $('<tr>', { 'accid': propData[1], 'human_id': propData[2], class: "tr-btn" }).appendTo(table);
        tr.on("click", function() {
            createAgrData(propData);
        })
        td = $('<td>', { text: propData[0] }).appendTo(tr);

        agreementsPeopleArr.push(`${propData[0]}&${propData[2]}`);
    }

    table.appendTo('#agreements_contract_content');

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

    $('<tr>').append($('<th>', {text: 'ФИО'})).appendTo(table);

    for (const registrationKey in registrationsData) {
        let registrationData = registrationKey.split('&');
        const registrationValue = registrationsData[registrationKey];
        tr = $('<tr>', { 'accid': registrationData[1], 'human_id': registrationData[2], 'author': registrationValue.author, 'creation_time': registrationValue.creation_time, class: "tr-btn"}).append($('<td>', { text: registrationData[0] })).appendTo(table);

        tr.on("click", function() {
            const ownerName = registrationData[0],
                  ownerBirthDate = RemakeDateFormatToInput(registrationValue.birth_date),
                  subDate = RemakeDateFormatToInput(registrationValue.registration_date);
            let unsubDate = RemakeDateFormatToInput(registrationValue.unregistration_date);
            let birthPlace = registrationValue.birth_place;
            createInfRegData(ownerName, ownerBirthDate, subDate, unsubDate, birthPlace, this);
        })

        $('<option>', {text: registrationData[0], humanId: registrationData[2]}).appendTo('#add_agreement_owner_select');
        

        ownersPeopleArr.push(`${registrationData[0]}&${registrationData[2]}`);
    }

    table.appendTo('#agreements_passport_content');

    CURRENT_OBJECT_DATA.ownersPeople = ownersPeopleArr;
}

function getObjectInfoData() {

    let data = OBJECT_DATA.information;

    const table = $('<table>', {id: 'obj_additional_info_table'});

    for (const prop in data) {
        $('#obj_ls_info .header-ls').text(`ЛС: ${prop.replace('ls','')}`);
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

function addEventListenersToCounterIcons(icon) {
    icon.on('click', function() {
        $(this).prev().trigger('click');
    });
    icon.mouseover(function() {
        $(this).prev().css({"color": "var(--element-color)", "transition": ".15s"});
    })
    icon.mouseout(function() {
        $(this).prev().css({"color": "", "transition": ""});
    })
}

function getObjectContactsData() {
    $('#contacts_list, #edit_contact_select').empty();
    let contactsData = OBJECT_DATA.contacts;

    if (!isEmpty(contactsData)) {
        const counterIcons = $('<div>', {class: 'icon-count', text: Object.keys(contactsData).length}).appendTo('#obj_contacts_icon');
        addEventListenersToCounterIcons(counterIcons);

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

        const counterIcons = $('<div>', {class: 'icon-count', text: Object.keys(notationsData).length}).appendTo('#obj_notations_icon');
        addEventListenersToCounterIcons(counterIcons);
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

    const counterIcons = $('<div>', {class: 'icon-count', text: Object.keys(communicationsData).length}).appendTo('#obj_communications_icon');
        addEventListenersToCounterIcons(counterIcons);

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
            showPopupNotification('notification', 'Коммуникация успешно добавлена!')
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

function createDropdownMenuForPerson(index, listPerson, rep_name, rep_num, rep_type) {
    $('<div>', {id: `jq-dropdown-${index}`, class: 'jq-dropdown dropdown-report jq-dropdown-tip' }).append(
        $('<ul>', {class: 'jq-dropdown-menu'})
    ).appendTo($('body'));
    const multiPerson = [];
    let i = 0;
    const input = $('<input>', {placeholder:'Введите собственника',class:"input-main input-fio"}).appendTo($(`#jq-dropdown-${index} ul`));
    
    $('<li>', {class: 'dropdown-menu-item is-input', rep_name: rep_name, rep_num: rep_num, rep_type: rep_type, accid: CURRENT_OBJECT_DATA.accid, humanid: 0 }).append(
        $('<i>', { class: 'material-icons', text: 'arrow_forward' })
    ).appendTo($(`#jq-dropdown-${index} ul`));

    for (const elem of listPerson) {
        multiPerson[i] = elem[0];
        i++;
        $('<li>', {class: 'dropdown-menu-item', rep_name: rep_name, rep_num: rep_num, rep_type: rep_type, accid: elem[1], humanid: elem[2], person_name: elem[0]}).append(
            $('<a>', {text: elem[0]})
        ).appendTo($(`#jq-dropdown-${index} ul`));
    }
    // выбрать всех людей
    $('<li>', {class: 'dropdown-menu-item', id:"all-agr",rep_name: rep_name, rep_num: rep_num, rep_type: rep_type, accid: CURRENT_OBJECT_DATA.accid, humanid: 0, person_name: multiPerson}).append(
        $('<a>', {text: "ВСЕ СОБСТВЕННИКИ"})
    ).appendTo($(`#jq-dropdown-${index} ul`));
    
}

function createDropdownMenuForErgp(data, parentDropDown) {
    let i = 0;
    parentDropDown.empty();
    for (const person of data) {
        $('<li>', {class: 'dropdown-menu-item'}).append(
            $('<input>', {id: person.id, type: 'checkbox', name: 'ergp', end_date: person.end_date, start_date: person.start_date, value: person.name, checked: 'checked'}),
            $('<label>', {for: person.id}).append(
                $('<span>', {text: `${person.name}  (${person.start_date} - ${person.end_date})`})
            )
        ).appendTo(parentDropDown);
        i++;
    }    

    $('<li>', {class: 'dropdown-menu-item'}).css({"text-align": "center",
    "margin-top": "10px"}).append(
        $('<button>', { class: 'button-primary', text: 'Добавить' }).on("click", () => {
            $("#update_agreement_icon").removeClass("jq-dropdown-open");
            $("#jq-dropdown-agreements-ergp-block").fadeOut();

            const data = {
                accid: CURRENT_OBJECT_DATA.accid,
                param: "upgrade",
                id: []
            }
            $('input[name="ergp"]').each((index, elem) => {
                if($(elem).prop('checked') == true){
                  data.id.push($(elem).attr("id"))  
                }                            
            });
    
            $.ajax({
                type: "POST",
                url: '/base_func?fnk_name=get_egrp_rec',
                data: JSON.stringify(data),
                success: function (data) {
                    getObjectData();
                    showPopupNotification('notification', 'Собственники из ЕГРП успешно загруженны!')
                }
            });
        })
    ).appendTo(parentDropDown);
}

function createDropdownMenuForFile(menuNum, liArr, fileId, orgId) {
    $('<div>', {id: `jq-dropdown-${menuNum}`, class: 'jq-dropdown jq-dropdown-tip jq-dropdown-anchor-right'}).append(
        $('<ul>', {class: 'jq-dropdown-menu'})
    ).appendTo($('body'));
    for (const template of liArr) {
        $('<li>', {class: 'dropdown-menu-item', onclick: `initializeProcessedFileTemplate(${fileId}, ${orgId}, ${template.number})`}).append(
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

function sendReportRange(repName, repNum, repType, accid, humanId, startDate, endDate, personName) {
    const reportId = `${repType}_${repNum}`;

    $.get(`/report?rnum=${repNum}&rtype=${repType}&accid=${accid}&humanid=${humanId}&dateb=${startDate}&datee=${endDate}&fio=${personName}`, function (data) {
        initializeReportNewWindow(data, repName, reportId, personName);
        closePopupWindow('popup_report');
    });
}

function printReport() {
    var printWindow = window.open('', 'PRINT');
    let printingContent = document.querySelector('#popup_report .content').innerHTML;
    printWindow.document.write('<html><head><link href="/css/style_main_page.css" rel="stylesheet" type="text/css"><script src="/js/jquery-3.4.1.min.js"></script><script src="/js/print_report_page.js"></script>');
    printWindow.document.write('</head><body id="report_print">');
    printWindow.document.write(printingContent);
    printWindow.document.write('</body></html>');

    printWindow.document.close(); // necessary for IE >= 10
    printWindow.focus(); // necessary for IE >= 10*/
}

function printObjectsGroup() {
    var printWindow = window.open('', 'PRINT');
    let printingContent = document.querySelector('#popup_objects_group .content').innerHTML;
    printWindow.document.write('<html><head><link href="/css/style_main_page.css" rel="stylesheet" type="text/css"><script src="/js/jquery-3.4.1.min.js"></script><script src="/js/print_objects_group_page.js"></script>');
    printWindow.document.write('</head><body id="report_print">');
    printWindow.document.write(printingContent);
    printWindow.document.write('</body></html>');
    printWindow.document.close(); // necessary for IE >= 10
    printWindow.focus(); // necessary for IE >= 10*/
}

function printDocument() {
    var printWindow = window.open('', 'PRINT');
    let printingContent = document.querySelector('#popup_company_document .content').innerHTML;
    printWindow.document.write('<html><head><link href="/css/style_main_page.css" rel="stylesheet" type="text/css"><script src="/js/jquery-3.4.1.min.js"></script><script src="/js/print_objects_group_page.js"></script>');
    printWindow.document.write('</head><body id="report_print">');
    printWindow.document.write(printingContent);
    printWindow.document.write('</body></html>');
    printWindow.document.close(); // necessary for IE >= 10
    printWindow.focus(); // necessary for IE >= 10*/
}

function printRegistry(id) {
    var printWindow = window.open('', 'PRINT');
    let toogleParent = 'popup_office_administration';
    if(id !== 'registry_print_icon_office'){
        toogleParent = 'registry_settings_content';
    }
    let printingContent = document.querySelector(`#${toogleParent} .block-content`).innerHTML;
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

function openHomePage() {
    $('#update_info_content, .popup-with-menu').hide();
    $('#obj_content').show();
}

function openInfoPage(popupId) {
    $('.popup-with-menu').hide();
    $(`#${popupId}`).css({ 'display': 'block' });
    $('#update_info_content').show();
}

function openRegistryPage(popupId) {
    $('.popup-with-menu').hide();
    $(`#${popupId}`).css({ 'display': 'block' });
    $('#control_registry').show();
}

function openTab(tabsId, elem, tabId) {
    
    if(tabsId !== 'profile_tabs'){
        $(`#${tabsId} .tab-button`).removeClass('active');
        $(elem).addClass('active');
        $(`#${tabsId}_content .tab-content`).removeClass('active');
        $(`#${tabId}`).addClass('active'); 

    } else {
        $(`#${tabsId} .tab-button`).removeClass('active');
        $(elem).addClass('active');
        $(`#${tabsId}_content .tab-content-prof`).css("display", "none"); 
        $(`#${tabId}`).css('display', 'flex');       
    }    
}


// каким-то образом получает куки.
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
// Функция getCookie возвращает cookie с именем name, если есть, если нет, то undefined
// 1. как работает функция?
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

// function getProjectTaskList(projectId) {
//     $('#tasks_list').empty();
//     // createContentLoader('#redmine_content .info-block-content');
//     $.get(`/redmine?request=/issues.json?project_id=${projectId}`, function (data) {
//         let taskList = JSON.parse(data);
//         for (const elem in taskList.issues) {
//             let task = taskList.issues[elem];
//             let id = task.id, tracker = task.tracker, name = task.subject, description = task.description, priority = task.priority, author = task.author;
            
//             $('<div>', {class: 'news-block'}).append(
//                 $('<div>', {class: 'news-header', text: name}),
//                 $('<div>', {class: 'task-content-table'}).append(
//                     $('<table>', {id: `task_${id}`, class: 'task-table'}).append(
//                         $('<tr>', {class: 'task-thead'}).append(
//                             $('<th>', {text: 'Тип'}),
//                             $('<th>', {text: 'Приоритет'}),
//                             $('<th>', {text: 'Автор'})
//                         ),
//                         $('<tr>').append(
//                             $('<td>', {text: tracker.name}),
//                             $('<td>', {text: priority.name}),
//                             $('<td>', {text: author.name})
//                         ),
//                         $('<tr>').append(
//                             $('<td>', {class: 'task-description', text: description, colspan: 3})
//                         )
//                     )
//                 )
//             ).appendTo('#tasks_list');
//         }
//         // removeContentLoader('#redmine_content .info-block-content', '#tasks_list');
//     });
// }

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
        $('<button>', {id: 'export_button', text: 'Экспорт в XLSX'}).prependTo($('.header-operation'));
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
        $('#print_mode_object_num').text('Выбрано: 0');
        $('#objects_list_reports').hide();
    }

    objectListSearch();
}

function switchToggle(toggleId) {

    let toggle = $(`#${toggleId}`);
    let state = toggle.attr('state');
    if (state == 'off') {

        sessionStorage.setItem('printMode', 'on');

        toggle.text('radio_button_checked');
        toggle.attr('state', 'on');
        toggle.css({'color': '#0091EA'});

        $('#print_mode_object_num, .object-tree-apartament-input, .object-tree-parent-li-input').show();
    }
    else {
        sessionStorage.setItem('printMode', 'off');

        $('.object-list-tree input').prop('checked', false);
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
            const objectNum = $('.object-tree-apartament-input:checked').length;
            showPrintingObjectsNum();

            if (objectNum > 0) {
                if ($('#objects_list_reports').is(':hidden')) {
                    $('#objects_list_reports').fadeOut(200).fadeIn(200).fadeOut(200).fadeIn(200);
                }
            }
            else {
                $('#objects_list_reports').hide();
            }
        });
    });
}

function showPrintingObjectsNum() {
    $('#print_mode_object_num').text(`Выбрано: ${$('.object-tree-apartament-input:checked').length}`);
}

function isActivePrintMode() {
    let printMode = sessionStorage.getItem('printMode');
    if (printMode == 'on') return true;
    else return false;
}

function clickIconEditOwner(ownerName, ownerBirthDate, subDate, unsubDate, birthPlace, current) {
    $('#owner_btn_save').fadeIn(100);
    $('#owner_btn_cancel').fadeIn(100);
    $("#obj_list_group .notification").fadeIn(100);
    $('#owner_name, #owner_birth_date, #owner_subscribe_date, #owner_unsubscribe_date, #owner_birth_place, #owner_snils, #owner_inn').removeAttr("disabled");

    const author = $(current).attr('author');
    const creationTime = $(current).attr('creation_time');

    let humanId = $(current).attr('human_id');
    console.log(humanId);
    $('#owner_btn_save').attr('human_id', humanId);
    $('#owner_name').val(ownerName);
    $('#owner_birth_date').val(ownerBirthDate);
    $('#owner_subscribe_date').val(subDate);
    $('#owner_unsubscribe_date').val(unsubDate);
    $('#owner_birth_place').val(birthPlace);
    $('#owner_creation_time').text(`Добавил: ${author} ${creationTime}`)
}

function editOwnerRequest() {
    event.preventDefault();
    let accid = CURRENT_OBJECT_DATA.accid,
        name = $('#owner_name').val(),
        date = $('#owner_birth_date').val(),
        subDate = $('#owner_subscribe_date').val(),
        unsubDate = $('#owner_unsubscribe_date').val(),
        birthPlace = $('#owner_birth_place').val(),
        humanId = $('#owner_btn_save').attr('human_id'),
        snils = $("#owner_snils").val(),
        inn = $("#owner_inn").val();

    if (date !== '') {
        let birthDate = $('#owner_birth_date').val().split('-');
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
    if ($('#owner_name').val() == '') {
        $('#owner_name').attr('placeholder', 'Заполните поле');
        $('#owner_name').fadeOut(100).fadeIn(100).fadeOut(100).fadeIn(100);
    }
    else {
        const data = {
            bp: birthPlace,
            dateb: subDate,
            datee: unsubDate,
            db: date,
            fio: name,
            inn: inn,
            snils: snils,
            humanid: humanId
        }
        $.ajax({
            type: "POST",
            url: "/base_func?fnk_name=addchg_human",
            data: JSON.stringify(data),
            success: function (data) {
                console.log(data);
                if (data == 'success') {
                    showPopupNotification('notification', 'Прописанный успешно отредактирован!');
                    closePopupWindow();
                    refreshObjectData([getObjectRegistrationsData, clickDropdownMenu]);
                }
            }
        });
    }
}

function addNewOwner() {
    event.preventDefault();
    let accid = CURRENT_OBJECT_DATA.accid,
        name = $('#owner_name').val(),
        date = RemakeDateFormatFromInput($('#owner_birth_date').val()),
        subDate = RemakeDateFormatFromInput($('#owner_subscribe_date').val()),
        unsubDate = RemakeDateFormatFromInput($('#owner_unsubscribe_date').val()),
        birthPlace = $('#owner_birth_place').val(),
        snils = $("#owner_snils").val(),
        inn = $("#owner_inn").val();

    if ($('#owner_name').val() == '') {
        $('#owner_name').attr('placeholder', 'Заполните поле');
        $('#owner_name').fadeOut(100).fadeIn(100).fadeOut(100).fadeIn(100);
    }
    else {
            const data = {
            bp: birthPlace,
            dateb: subDate,
            datee: unsubDate,
            db: date,
            fio: name,
            inn: inn,
            snils: snils
        }
        $.ajax({
            type: "POST",
            url: "/base_func?fnk_name=addchg_human",
            data: JSON.stringify(data),
            success: function (data) {
                if (data == 'success') {
                    closePopupWindow();
                    refreshObjectData([getObjectRegistrationsData, clickDropdownMenu]);
                    createInfRegData(name, date, subDate, unsubDate, birthPlace);
                    showPopupNotification('notification', 'Прописанный успешно создан!');
                }
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

    const agrArr = [`${$('#add_agreement_owner_select option:selected').val()} ${agreementName} ${agreementDate} ${part} `]
    console.log(agrArr);
    console.log(owner)

    encodeURIstring = encodeURI(`/base_func?val_param=addchg_kvdocs&val_param1=${accid}&val_param2=${owner}&val_param3=${birthDate}&val_param4=add&val_param5=${agreementName}&val_param6=${agreementDate}&val_param7=${humanId}&val_param8=${part}`);
    console.log(encodeURIstring);
    $.post(encodeURIstring, function (data) {
        if (data == 'success') {
            closePopupWindow();
            refreshObjectData([getObjectAgreementsData]);
            $('#add_agreement_name, #add_agreement_date, #add_agreement_part, #add_agreement_fio, #add_agreement_birth_date').val('');
            createAgrData(agrArr);
            showPopupNotification('notification', 'Документ на право собственности успешно создан!');
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
    const accid = CURRENT_OBJECT_DATA.accid;
    let contactName, humanId;
    const number = $('#add_contact_phone_number').val();
    const contactType = $('#add_contact_phone_type').val();

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
                $('#add_contact_phone_number, #add_contact_name').val('');
                showPopupNotification('notification', 'Контакт успешно добавлен!')
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
                showPopupNotification('notification', 'Контакт успешно сохранен!');
            }
            else if (data == 'lock_value') {
                showPopupNotification('alert', 'Контакт редактировать нельзя, так как с момента его добавления прошло более 24 часов!');
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
        // validateinputsArray.push(fioInput);
        fioValue = fioInput.val();
    }
    else if (ownType == 'together') {
        let fioArray = [];
        $('#report_fast_access_owners_list tr input[name="fio"]').each(function() {
            fioArray.push($(this).val());
            // validateinputsArray.push($(this));
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
            // validateinputsArray.push($(this).find('input[name="fio"]'));
            // validateinputsArray.push($(this).find('input[name="part"]'));
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
            $('#popup_report .content').html(data);
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
                // getProjectTaskList("web_deb");
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

function mainCalendarChangeDate() {
    $('#main_calendar .ui-datepicker-buttonpane').append(
        $('<button>', {text: 'Последняя оплата'}).on('click',  function() {
            getLastPayDate();
        })
    );

    const handler = function() {
        getObjectHistoryData([createObjectHistoryTable]);
        mainCalendarChangeDate();
    }
    
    $('#main_calendar .ui-datepicker-prev, #main_calendar .ui-datepicker-next, #main_calendar .ui-datepicker-current').on('click', handler);
    $('#main_calendar .ui-datepicker-month, #main_calendar .ui-datepicker-year').on('change', handler);
}

function getLastPayDate() {
    $.ajax({
        type: 'POST',
        url: '/base_func?fnk_name=get_last_pay_date',
        data: JSON.stringify({accid: CURRENT_OBJECT_DATA.accid, mode: getCookie('history_table_mode')}),
        success: (data) => {
            if (data == 'none') {
                showPopupNotification('notification', 'Последняя оплата по данному адресу отсутствует!')
            }
            else {
                const fullDate = data.split('.');
                const month = fullDate[0];
                const year = fullDate[1];
                $("#main_calendar").datepicker("setDate", new Date(year, month - 1));
                getObjectHistoryData([createObjectHistoryTable]);
                mainCalendarChangeDate();
            }
        }
    });
}

function getCalendarValue(calendarId) {
    let month = +$(`#${calendarId} .ui-datepicker-month`).val() + 1;
    if ( month < 10) month = `0${month}`;
    let year = $(`#${calendarId} .ui-datepicker-year`).val();
    let calendarValue = `${month}.${year}`;
    return calendarValue;
}

function getObjectHistoryData(callback) {

    setCookie('history_table_date', getCalendarValue('main_calendar'));
    for (const func of callback) {
        if (func.name == 'createObjectHistoryTable') {
            $('#obj_main_table').empty();
            createContentLoader('#obj_main_table');
        }
    }

    $.ajax({
        type: 'POST',
        url: '/base_func?fnk_name=account_history',
        data: JSON.stringify({ accid: CURRENT_OBJECT_DATA.accid, date: getCalendarValue('main_calendar'), mode: getCookie('history_table_mode') }),
        success: (data) => {
            const tableData = JSON.parse(data);
            console.log(tableData)

            if (!isEmpty(callback)) {
                for (const func of callback) {
                    func(tableData);
                }
            }
        }
    });
}

function createObjectHistoryTable(data) {
    if (data !== null) {
        const table = $('<table>', { id: 'history_table', class: 'main-table' }).append(
            $('<thead>').append(
                $('<tr>')
            ),
            $('<tbody>')
        );

        for (const th of data.header) {
            const isEditable = (th.editable == 'true');
            const isHidden = (th.hidden == 'true');

            const thElem = $('<th>', { text: th.name });

            if (isEditable) {
                $('<i>', { class: 'material-icons th-icon', text: 'edit', title: 'Редактируемый столбец' }).appendTo(thElem);
            }

            thElem.appendTo(table.find('thead tr'));

            if (isHidden) {
                thElem.hide();
            }
        }

        for (const row of data.body) {
            const tr = $('<tr>');
            $('<td>', { text: row.name }).appendTo(tr);
            for (const elem in row.data) {
                const isHidden = (row.hidden == 'true');

                if (isHidden) {
                    tr.hide();
                }
                else {
                    const isEditable = (data.header[Number(elem) + 1].editable == 'true');

                    const tdElem = $('<td>');

                    if (isEditable) {
                        tdElem.css({ 'padding': '0' });
                        const input = $('<input>', { type: 'text', service: row.name }).appendTo(tdElem);
                        input.val(row.data[elem]);

                        input.keypress((event) => {
                            if (event.code == 'Enter') {
                                sendHistoryTableServicePayment(row.name, input.val(), CURRENT_OBJECT_DATA.accid);
                            }
                        });
                    }
                    else {
                        tdElem.text(row.data[elem]);
                    }
                    tdElem.appendTo(tr);

                    const isHidden = (data.header[Number(elem) + 1].hidden == 'true');

                    if (isHidden) {
                        tdElem.hide();
                    }
                }
            }

            tr.appendTo(table);
        }

        const footerTr = $('<tr>', { class: 'tr-bold' });
        $('<td>', { text: data.footer.name }).appendTo(footerTr);

        for (const elem in data.footer.data) {
            const isEditable = (data.header[Number(elem) + 1].editable == 'true');

            const tdElem = $('<td>');

            if (isEditable) {
                tdElem.css({ 'padding': '0' });
                const input = $('<input>', { type: 'text', service: data.footer.name }).appendTo(tdElem);
                input.val(data.footer.data[elem]);

                input.keypress((event) => {
                    if (event.key == 'Enter') {
                        sendHistoryTableServicePayment(data.footer.name, input.val(), CURRENT_OBJECT_DATA.accid);

                    }
                });
            }
            else {
                tdElem.text(data.footer.data[elem]);
            }
            tdElem.appendTo(footerTr);

            const isHidden = (data.header[Number(elem) + 1].hidden == 'true');

            if (isHidden) {
                tdElem.hide();
            }

            footerTr.appendTo(table);
        }


        $('#obj_main_table').html(table);

        function sendHistoryTableServicePayment(service, value, accid) {
            const objectData = { accid: accid, service: service, value: value, date: getCalendarValue('main_calendar') };
            console.log(objectData)
            $.ajax({
                type: 'POST',
                url: '/base_func?fnk_name=chg_history_foropl',
                data: JSON.stringify(objectData),
                success: (data) => {
                    getObjectHistoryData([refreshHistoryTableServicePayments])
                }
            });
        }

        function refreshHistoryTableServicePayments(tableData) {
            let tdIndex;
            for (const th in tableData.header) {
                if (tableData.header[th].name == 'К оплате') tdIndex = th;
            }
            console.log(tdIndex);

            for (const elem of tableData.body) {
                console.log(elem.data[tdIndex - 1]);
                $(`#history_table input[service='${elem.name}']`).val(elem.data[tdIndex - 1]);
            }

            $(`#history_table input[service='${tableData.footer.name}']`).val(tableData.footer.data[tdIndex - 1]);
        }
    }
    else {
        showTextCenter('obj_main_table', 'Нет данных');
    }
}

function sendAccountHistorySettings(data) {
    console.log(data);
    if (!isEmpty(data)) {
        $.ajax({
            type: 'POST',
            url: `/base_func?fnk_name=chg_history_setting`,
            data: JSON.stringify(data),
            success: function (data) {
                console.log(data);
                getObjectHistoryData([createObjectHistoryTable, initializeAccountHistorySettings])
                showPopupNotification('notification', 'Настройки таблицы истории успешно сохранены!');
            }
        });
    }
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
        getRegistryList(() => { });
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

    let notationValue = $('#print_notation_textarea').val().replace(/\n/g, "<br>");

    const data = JSON.stringify({setting: "print_notation", rep_type : report.rep_type, rep_num : report.rep_num, "value" : notationValue});

    $.ajax({
        type: "POST",
        url: "/base_func?fnk_name=reports_setting",
        data: data,
        success: function (data) {
            if (data == 'success') {
                getUserData();
                showPopupNotification('notification', 'Примечание для печати успешно сохранено!');
            }
        }
    })

    const obj = {"setting": "print_notation", "company_id" : "4", "rep_type" : "report", "rep_num" : "3", "value" : ""};
    
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

function initializeProcessedFileTemplate(fileId, companyId, templateNum) {

    $('#template_table, #template_total_td').empty();
    openPopupWindow('popup_processed_file_template');
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
                    const appointment = row.cells['Назначение'];

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

                                const button = $('<button>', { class: 'add-template-adress button-primary', text: 'Добавить' });
                                currentTd.append(button)

                                button.on('click', function() {
                                    $('#adress_options_div, #appointment_div').remove();
                                    $('#ardess_template_search_input').val('');
                                    $('#ardess_template_search_btn').removeAttr('adress');
                                    const appointmentDiv = $('<div>', {class: 'border-block-default', id: 'appointment_div', text: appointment})
                                    const addressOptionsDiv = $('<div>', {class: 'border-block-default', id: 'adress_options_div', style: 'margin-bottom: 20px'})
    
                                    if (!isEmpty(row.address_options)) {
                                        const addressOptionsHeader = $('<div>', {text: 'Возможные варианты', style: 'text-align: center; border-bottom: 1px solid lightgray; font-weight: bold; padding-bottom: 5px;'})
                                        const optionsUl = $('<ul>', {id: 'adress_options_ui'});
                                        
                                        for (const option of row.address_options) {
                                            const li = $('<li>', {accid: option.accid, adress: option.adress, text: option.text}).on('click', function() {
                                                const value = $(this).text();
                                                const adress = $(this).attr('adress');
                                                const accid = $(this).attr('accid');
                                                $('#ardess_template_search_input').val(value);
                                                $('#ardess_template_search_btn').attr('accid', accid);
                                                $('#ardess_template_search_btn').attr('adress', adress);
                                            });
                                            optionsUl.append(li);
                                        }
                                        
                                        addressOptionsDiv.append(addressOptionsHeader, optionsUl)
                                    }
                                    
                                    if (!isEmpty(row.address_options)) {
                                        $('#popup_add_ardess_template .popup-content').prepend(addressOptionsDiv)
                                    }
                                    
                                    $('#popup_add_ardess_template .popup-content').prepend(appointmentDiv)
                                })

                                errorsCounter++;
                            }
                            else {
                                currentTd.addClass('add-template-adress');
                                currentTd.text(row.cells[cell]);
                                currentTd.attr('title', 'Нажмите, чтобы изменить адрес');
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
                        if (target.nodeName !== 'BUTTON') {
                            $('#adress_options_div, #appointment_div').remove();
                            $('#ardess_template_search_input').val('');
                            $('#ardess_template_search_btn').removeAttr('adress');
                        }
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

    // const statusInterval = setInterval( function() {
    //     $.post('/web_request?query=bank_log',  function(data) {
    //         console.log(data);
    //     });
    // }, 1000);
}

function initializationPerformedFile(fileId, fileName) {
    $('#popup_performed_file_template .content').empty();
    $('#popup_performed_file_template .name').text(fileName);
    $('#popup_performed_file_template, #popup_background').fadeIn(200);
    createContentLoader('#popup_performed_file_template .content');

    $.post(`/base_func?val_param=document_rec&val_param1=${fileId}`, function (data) {
        $('#popup_performed_file_template .content').html(data);
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
// загрузка файлов
function uploadFiles(files, fileTypes, parentNode, filesInfoNode, accid, callback) {
    event.preventDefault();

    if (files.length > 0) {
        const progressBarDiv = $('<div>', {class: 'file-download-progress-bar'}).prependTo(parentNode);

        let uploadedFilesNum = 0;

        function uploadFile(index) {
            let formdata = new FormData();
            formdata.append('file', files[index]);

            if (!isEmpty(fileTypes)) {
                formdata.append('type', fileTypes[files[index].name]);
                formdata.append('accid', accid);
            }

            $.ajax({
                type: "POST",
                url: '/upload',
                data: formdata,
                contentType: false,
                processData: false,
                xhr: function () {
                    var xhr = $.ajaxSettings.xhr();
                    uploadedFilesNum++;
                    filesInfoNode.text(`Файлы загружаются, подождите: ${uploadedFilesNum}/${files.length}`);
                    xhr.upload.onprogress = function (event) { 
                        console.log(`progress ${uploadedFilesNum}: Отправлено ${event.loaded} из ${event.total}, ${event.loaded / event.total * 100}%`)
                        progressBarDiv.width(`${event.loaded / event.total * 100}%`);
                    };
                    xhr.upload.onload = function () {
                        progressBarDiv.width('0');
                    };
                    return xhr;
                },
                success: (fileData) => {
                    console.log(fileData);

                    
                    if (index !== files.length - 1) {
                        uploadFile(index + 1);
                    }
                    else {
                        filesInfoNode.text(`Файлов загружено: ${uploadedFilesNum}/${files.length}`);
                    }

                    if (callback) {
                        callback(fileData);
                    }
                }
            });
        }

        uploadFile(0);
    }
    else {
        filesInfoNode.text('Выбрано файлов: 0').fadeOut(100).fadeIn(100).fadeOut(100).fadeIn(100);
        console.log("файлов нет");
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
                for (const elem of searchListArray) {
                    const dataArray = elem.split('&');
                    const name = dataArray[0];
                    const accid = dataArray[1];
                    const adress = dataArray[2];
                    const ls = dataArray[3];
                    $('<li>', {text: `${ls} ${name}`, accid: accid, adress: adress}).appendTo(parentDiv);
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
    const valueLength = input.val().length;
    
    if (valueLength >= 3) {
        const searchValue = input.val();

        input.siblings().remove();

        const divList = $('<div>', {class: 'input-options-popup'}).append(
            $('<ul>', {class: 'input-options-list'})
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
                    $('<li>', {text: `${ls} ${name}`, accid: accid, adress: adress, ls: ls}).appendTo(divList.find('ul'));
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

function InputListOfOptions(input, optionsList) {
    input.siblings().remove();
    if (!isEmpty(optionsList)) {
        const list = $('<ul>', {class: 'input-options-list'});
        const optionsPopup = $('<div>', {class: 'input-options-popup'});
        optionsPopup.append(list)

        for (const option of optionsList) {
            $('<li>', {text: option}).appendTo(list).on('click', function() {
                input.val(option)
                input.siblings().remove();
            });
        }
        input.after(optionsPopup);
        optionsPopup.show()
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
                console.log(searchListArray)
                for (const elem of searchListArray) {
                    const dataArray = elem.split('&');
                    const name = dataArray[0];
                    const accid = dataArray[1];
                    const adress = dataArray[2];
                    const ls = dataArray[3];
                    $('<li>', {text: `${ls} ${name}`, accid: accid, adress: adress}).appendTo(parentDiv);
                }

                $(`#${menuId} ul li`).each(function() {
                    $(this).on('click', function() {
                        $(".header-toggle, .header-title").css("display","inline-flex");
                        $("#obj_content .header-manipulation-agr").css("display","block");

                        let adress = $(this).attr('adress');
                        let accid = $(this).attr('accid');
                        input.val('');
                        openHomePage();

                        CURRENT_OBJECT_DATA.accid = accid;
                        CURRENT_OBJECT_DATA.adress = adress;
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

        const stateSettingContent = $('<div>').append(
            $('<label>', {class: 'checkbox-container', text: 'Вкл.'}).append(
                $('<input>', {id: 'report_setting_report_on', class: 'checkbox', type: 'checkbox'}),
                $('<span>', {class: 'checkmark'})
            ),
            $('<label>', {class: 'checkbox-container', text: 'Выкл.'}).append(
                $('<input>', {id: 'report_setting_report_off', class: 'checkbox', type: 'checkbox'}),
                $('<span>', {class: 'checkmark'})
            )
        );
        
        const isDisplayed = (report.is_displayed == 'true');
        console.log(isDisplayed)

        if (isDisplayed) {
            stateSettingContent.find('#report_setting_report_on').prop('checked', true);
        }
        else {
            stateSettingContent.find('#report_setting_report_off').prop('checked', true);
        }

        function changeDisplayReport() {
            const displayOnInput = $('#report_setting_report_on');
            const displayOffInput = $('#report_setting_report_off');

            displayOnInput.on('click', function() {
                if (displayOnInput.prop('checked')) {
                    displayOffInput.prop('checked', false);
                    changeRequest('true');
                }
                else {
                    displayOnInput.prop('checked', true);
                }
            });

            displayOffInput.on('click', function() {
                if (displayOffInput.prop('checked')) {
                    displayOnInput.prop('checked', false);
                    changeRequest('false');
                }
                else {
                    displayOffInput.prop('checked', true);
                }
            });

            function changeRequest(value) {
                const data = JSON.stringify({ setting: "display_report", rep_type: report.rep_type, rep_num: report.rep_num, value: value });
                $.ajax({
                    type: "POST",
                    url: "/base_func?fnk_name=reports_setting",
                    data: data,
                    success: function (data) {
                        if (data == 'success') {
                            getUserData([() => {

                            }]);
                            showPopupNotification('notification', 'Отображение справки успешно сохранено!');
                        }
                    }
                })
            }
        }
        
        initializeSettingItem('#report_settings .block-content', 'Отображение справки', stateSettingContent, [changeDisplayReport]);

        const TrusteeSignatureContent = $('<div>');
        const textarea = $('<textarea>', {id: '', class: 'fixed-textarea', rows:'1', disabled: 'true'}).appendTo(TrusteeSignatureContent);
        textarea.val(report.trustee_signature);
        const changeButton = $('<button>', {class: 'button-primary', text: 'Изменить'}).on('click', () => {
            textarea.attr('disabled', false);
            changeButton.hide();
            saveButton.show();
        }).appendTo(TrusteeSignatureContent);

        const saveButton = $('<button>', { class: 'button-primary', text: 'Сохранить', style: 'display : none' }).on('click', () => {
            
            const data = JSON.stringify({ setting: "trustee_signature", rep_type: report.rep_type, rep_num: report.rep_num, value: textarea.val() });

            $.ajax({
                type: "POST",
                url: "/base_func?fnk_name=reports_setting",
                data: data,
                success: function (data) {
                    if (data == 'success') {
                        textarea.attr('disabled', true);
                        saveButton.hide();
                        changeButton.show();
                        getUserData([() => {
                            const reportsArr = getCurrentCompanyReportsArray();    
                            const report = reportsArr[repId];
                            textarea.val(report.trustee_signature);
                        }]);
                        showPopupNotification('notification', 'Подпись доверенного лица успешно сохранена!');
                    }
                }
            })
        }).appendTo(TrusteeSignatureContent);

        initializeSettingItem('#report_settings .block-content', 'Подпись доверенного лица', TrusteeSignatureContent, () => {});

        if ('print_notation' in report) {
            const stateSettingContent = $('<div>').append(
                $('<textarea>', {id: 'print_notation_textarea', class: 'fixed-textarea', rows:'2', disabled: 'true'}),
                $('<div>').append(
                    $('<button>', {id: 'change_print_notation', class: 'button-primary', onclick: 'changePrintNotation()', text: 'Изменить'}),
                    $('<button>', {id: 'save_print_notation', class: 'button-primary', onclick: `savePrintNotation('${repId}')`, text: 'Сохранить'})
                )
            );
            initializeSettingItem('#report_settings .block-content', 'Примечание для печати', stateSettingContent);

            if (report.print_notation !== null) $('#print_notation_textarea').val(report.print_notation.replace(/<br ?\/?>/g, '\n'));
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

// function applyTemplateObjectList() {
//     event.preventDefault();
//     closePopupWindow('popup_object_list_settings');

//     const name = $('#choose_template_select').val();

//     $('.object-list-tree').empty();
//     createContentLoader('#object_list_tree');
//     $.ajax({
//         type: "POST",
//         url: "/base_func?fnk_name=objects_tree_filters",
//         success: function (data) {
//             createObjectsTree(data);
//             removeContentLoader('#object_list_tree', '.object-list-tree');
//             $('#current_template_name').text(name);
//             $('#clear_template_btn').attr('disabled', false);
//         }
//     });
// }

// function clearTemplateObjectList() {
//     event.preventDefault();
//     $('.object-list-tree').empty();
//     closePopupWindow('popup_object_list_settings');
//     $('#current_template_name').text('Отсутствует');
//     $('#clear_template_btn').attr('disabled', true);
    // getObjectsTreeData();
// }

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
    const data = {theme: theme};

    $.ajax({
        url: '/base_func?val_param=chg_user_attr',
        type: 'POST',
        data: JSON.stringify(data),
        contentType: 'application/json',
        success: function(data) {
            console.log(data);
        }
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
                    showPopupNotification('alert', 'Текущий пароль введен не верно!');
                }
                else if (data == 'success') {
                    showPopupNotification('notification', 'Пароль успешно изменен! Вы будете перенаправлены на страницу входа.');
                    clearFormInputs(validateinputsArray);
                    setTimeout(logout, 4000);

                    function logout() {
                        location.reload();
                    }
                }
            });
        }
        else {
            showPopupNotification('alert', 'Новый пароль и подтверждение пароля не совпадают!');
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
    $('#popup_profile .popup-fullscreen-name').text(`Профиль пользователя ${USER_DATA.login}`);
}

function createPopupNotification(type, message) {
    const notification = $('<div>', { class: 'popup-notification' });
    
    if (type == 'notification') {
        $('<span>', { class: 'icon' }).append(
            $('<i>', { class: 'material-icons', text: 'notifications' })
        ).appendTo(notification);
    }
    else if (type == 'alert') {
        $('<span>', { class: 'icon alert' }).append(
            $('<i>', { class: 'material-icons', text: 'error_outline'})
        ).appendTo(notification);
    }

    $('<span>', { class: 'content', text: message }).appendTo(notification);
    $('<span>', { class: 'notification-close' }).append(
        $('<i>', { class: 'material-icons', text: 'close', title: 'Закрыть уведомление' }).on('click', function () {
            removePopupNotification(notification);
        })
    ).appendTo(notification);

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

function showPopupNotification(type , message) {
    const notification = createPopupNotification(type, message);

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
            setTimeout(() => {
                removePopupNotification(notification);
            }, 7000);
        });
    }
}


function createRegistrySettingsPopup(uniqueClass = "") {
    if ($('#popup_registry_settings').length) {
        $('#popup_registry_settings').remove();
    }
    $('<div>', {id: `popup_registry_settings${uniqueClass}`, class: 'popup-window'}).append(
        $('<div>', {class: 'popup-header'}).append(
            $('<div>', {class: 'popup-name', text: 'Настройки реестра'}),
            $('<div>', {class: 'popup-close'}).append(
                $('<i>',  {class: 'material-icons', text: 'close'}).on('click', () => {closePopupWindow(`popup_registry_settings${uniqueClass}`)})
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

                if (groupData.author == USER_DATA.login) {
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
        const popupContent = $('#popup_objects_group .content');
        popupContent.empty();
        $('#popup_objects_group .name').html(`Группа объектов "${name}"`);
        openPopupWindow('popup_objects_group');
        createContentLoader(popupContent);

        const content = $('<div>', {style: 'width: 100%'});
        
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
                showPopupNotification('notification', 'Пользователь успешно привязан к группе объектов!'); 
            }
            else if (data == 'already_exist') {
                showPopupNotification('alert', 'Данный пользователь уже привязан к этой группе объектов!');
            }
        });
    }
    else {
        showPopupNotification('alert', 'Выберите пользователя из списка!');
    }
}

function deleteObjectsGroupUser(groupNumber, userName, userId) {
    if (confirm(`Вы уверены, что хотите удалить Пользователя ${userName} из этой группы объектов?`)) {
        const encodeURIstring = encodeURI(`/base_func?val_param=add_usr_hsgrlst&val_param1=del&val_param2=${groupNumber}&val_param3=${userId}`);
        $.post(encodeURIstring, function (data) {
            getObjectsGroupUsersList(groupNumber);
            showPopupNotification('notification', `Пользователь ${userName} успешно удален!`);
        });
    }
}

function getRegistryList(callback) {
    const registryType = $('#registry_type_select').val();
    $('#registy_add_entry_btn, #registry_print_icon, #registry_lock_icon, #registry_settings_icon, #registy_convert_to_excel_btn, #no_registries_div, #create_registry_div, #registry_printed_document_icon').remove();
    $('#registry_settings_content .block-content').empty();
    $('<span>', {class: 'text-center-small', text: 'Выберите реестр из списка или создайте новый'}).appendTo('#registry_settings_content .block-content');
    $('#registry_settings_content').removeClass('pagination');
    $('#registry_pagination').removeClass('active');

    let calendarValue = getCalendarValue('registry_settings_calendar');
    let registryUl;

    if (registryType == 'regular') {
        $('#constant_registries_ul').hide();
        $('#registry_settings_calendar, #regular_registries_ul').show();
        registryUl = $('#regular_registries_ul');
        parent_registryUl = $('#parent_regular_registries_ul');
        parent_registryUl.show();
        calendarValue = getCalendarValue('registry_settings_calendar');
    }
    else if (registryType == 'constant') {
        $('#constant_registries_ul').show();
        $('#registry_settings_calendar, #regular_registries_ul').hide();
        registryUl = $('#constant_registries_ul');
        parent_registryUl = $('#parent_regular_registries_ul');
        parent_registryUl.hide();
        calendarValue = '';
    }
    
    registryUl.empty();
    $.post(`/base_func?val_param=ree_reestrs&val_param1=${registryType}&val_param2=${calendarValue}`, (data) => {
        const registryList = JSON.parse(data);

        if (!isEmpty(registryList)) {
            createRegistrySettingsPopup();

            const showType = (registryType == 'regular');

            
            for (const registry of registryList) {
                let registryName;

                if (showType) {

                    const registryTypes = {
                        'bank_manual': 'Банки',
                        'bailiffs_manual': 'Приставы',
                        'overgrown': 'Перебросы',
                        'discounts': 'Скидки',
                        'print_registry': 'Реестр массовой печати',
                        'pay_storno': 'Возврат',
                        'debit_act': 'Акт списания',
                        'm26archive': '26 макета',
                        'm83archive': '83 макета'
                    };

                    const type = registryTypes[registry.doc_type];

                    registryName = `${registry.name} (${type})`;
                }
                else {
                    registryName = registry.name;
                }      
                const li = $('<li>', {registry_id: registry.id}).append(
                    $('<a>').append(
                        $('<span>', {text: registryName})
                    )
                ).appendTo(registryUl);

                if (registry.status == 'Обработан') {
                    $('<i>', {class: 'material-icons', text: 'lock', style: 'font-size: 20px'}).appendTo(li.find('span'));
                    li.attr('title', 'Реестр закрыт');
                }
                li.off('click');
                li.on('click', function () {
                    const tabsCollection = registryUl.find('li');
                    tabsCollection.removeClass('active');
                    $(this).addClass('active');
                    $("#add_container").remove();
                    getRegistryData(registry.id, registry.name, registryType, registry.doc_type);
                    
                })
            }

            callback();
        }
        else {
            $('<div>', { id: 'no_registries_div', style: 'text-align: center; padding-top: 5px'}).append(
                $('<p>', { text: 'Реестры отсутствуют', style: 'font-size: 16px' })
            ).appendTo('#registry_settings_select_menu #parent_regular_registries_ul');
        }

        if (registryType == 'regular') {

            const currentDate = new Date;

            const validMonth = ($('#registry_settings_calendar .ui-datepicker-month').val() == currentDate.getMonth());
            const validYear = ($('#registry_settings_calendar .ui-datepicker-year').val() == currentDate.getFullYear());

            if (validMonth && validYear) {
                initializePopupAddRegistry();

                $('<i>', {id: 'create_registry_div', class: 'material-icons', text: 'add_circle_outline' }).on('click', () => {
                        openPopupWindow('popup_create_registry');
                    }).appendTo('#registry_settings_calendar .ui-datepicker-buttonpane');
            }
        }
    });

    function initializePopupAddRegistry() {
        if (!$("div").is('#popup_create_registry')) {
            const popup = createPopupLayout('Создать реестр', 'popup_create_registry');
            
            $('<table>', {class: 'table-form'}).append(
                $('<tr>').append(
                    $('<td>', {class: 'table-input-name', text: 'Название *'}),
                    $('<td>').append(
                        $('<input>', {id: 'create_registry_name', class: 'input-main', type: 'text'})
                    )
                ),
                $('<tr>').append(
                    $('<td>', {class: 'table-input-name', text: 'Тип'}),
                    $('<td>').append(
                        $('<select>', {id: 'create_registry_type', class: 'input-main'}).append(
                            $('<option>', {text: 'Банки', value: 'bank_manual'}),
                            $('<option>', {text: 'Приставы', value: 'bailiffs_manual'}),
                            $('<option>', {text: 'Перебросы', value: 'overgrown'}),
                            $('<option>', {text: 'Скидки', value: 'discounts'}),
                            $('<option>', {text: 'Возврат', value: 'pay_storno'}),
                            $('<option>', {text: 'Акт списания', value: 'debit_act'})

                        )
                    )
                )
            ).appendTo(popup.find('.popup-content'));

            $('<div>', {class: 'notification', text: 'Поля, отмеченные звездочкой (*), обязательны для заполнения'}).appendTo(popup.find('.popup-content'));

            $('<div>', {class: 'form-submit-btn'}).append(
                $('<button>', {class: 'button-primary', text: 'Создать'}).on('click',() => {
                    sendNewRegistryData();
                })
            ).appendTo(popup.find('.popup-content'));
            
            popup.appendTo('#popup_background');

            function sendNewRegistryData() {
                let validateinputsArray = [];

                validateinputsArray.push($('#create_registry_name'));

                if (validateFormInputs(validateinputsArray)) {
                    let registryData = {}

                    registryData.name = $('#create_registry_name').val();
                    registryData.type = $('#create_registry_type').val();

                    console.log(registryData)

                    $.ajax({
                        url: '/base_func?fnk_name=ree_regular_create',
                        type: 'POST',
                        data: JSON.stringify(registryData),
                        success: function(data) {
                            if (data == 'success') {
                                showPopupNotification('notification', 'Реестр успешно создан!');
                                closePopupWindow('popup_create_registry');
                                getRegistryList(() => { });
                            }
                            else if (data == 'error') {
                                showPopupNotification('alert', `Во время выполнения операции произошла ошибка. Обратитесь в техподдержку!`);
                            }
                        }
                    });
                }
            }
        }
    }
}

function initializeRegistrySettings(registryId, theadData, rowsPerPage, documentType, parent = "false") {
    let uniqueClass = "";
    if(parent == "true"){
        uniqueClass = "_office";
    }
    $(`#popup_registry_settings${uniqueClass} .popup-content`).empty();
    const blockNumberElements = createContentBlock('Количество записей на странице', {});
    const typesOfNumberElementsSetting = [20, 40, 50, 100];
    const numberElementsBlockContent = $('<div>', {style: 'display: flex'});

    for (const number of typesOfNumberElementsSetting) {
        $('<div>', {style: 'margin: 5px'}).append(
            $('<input>', {id: `number_elements_${number}`, type: 'radio', name: 'registry_number_elements', value: number}),
            $('<label>', {for: `number_elements_${number}`}).append(
                $('<span>', {text: number})
            )
        ).appendTo(numberElementsBlockContent);
    
    }

    $('<div>', {style: 'margin: 5px'}).append(
        $('<input>', {id: 'number_elements_all', type: 'radio', name: 'registry_number_elements', value: 'all', checked: 'checked'}),
        $('<label>', {for: 'number_elements_all'}).append(
            $('<span>', {text: 'Все'})
        )
    ).appendTo(numberElementsBlockContent);
    numberElementsBlockContent.appendTo(blockNumberElements.find('.block-content'));

    const div = $('<div>', { style: 'overflow: auto' });
    div.append(blockNumberElements);

    if (documentType !== 'print_registry') {

        const blockColumnVisibility = createContentBlock('Отображение столбцов в реестре', { 'height': '350px' });

        const table = $('<table>', { id: 'registry_column_settings_table', class: 'table-form table-settings' });

        $('<tr>').append(
            $('<th>', { text: 'Столбец' }),
            $('<th>', { text: 'Отображение' })
        ).appendTo(table);

        for (const elem of theadData) {
            const tr = $('<tr>');
            $('<td>', { text: elem.name }).appendTo(tr);
            const td = $('<td>').appendTo(tr);
            const div = $('<div>', { style: 'width: max-content; margin: auto' }).appendTo(td);
            const labelOn = $('<label>', { class: 'checkbox-container', text: 'Вкл.', style: 'float: left; margin-right: 10px; display: block; text-align: center' }).appendTo(div);
            const inputOn = $('<input>', { class: 'checkbox', type: 'checkbox', value: 'on', column: elem.name }).appendTo(labelOn);
            $('<span>', { class: 'checkmark' }).appendTo(labelOn);

            const labelOff = $('<label>', { class: 'checkbox-container', text: 'Выкл.', style: 'float: left; margin-right: 10px; display: block; text-align: center' }).appendTo(div);
            const inputOff = $('<input>', { class: 'checkbox', type: 'checkbox', value: 'off', column: elem.name }).appendTo(labelOff);
            $('<span>', { class: 'checkmark' }).appendTo(labelOff);

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

        table.appendTo(blockColumnVisibility.find('.block-content'));
        div.append(blockColumnVisibility);
    }

    div.appendTo(`#popup_registry_settings${uniqueClass} .popup-content`);

    $(`input[name="registry_number_elements"][value="${rowsPerPage}"]`).prop('checked', true);

    $('<div>', {class: 'form-submit-btn'}).append(
        $('<button>', {id: 'registry_column_settings_btn', class: 'button-primary', text: 'Сохранить'})
    ).appendTo(`#popup_registry_settings${uniqueClass} .popup-content`);
}

function initializeAccountHistorySettings(tableData) {
    console.log(tableData);
    $('#history_settings_content').empty();

    if (tableData !== null) {
        let changedSettingsObj = {};

        const divColumn = $('<div>');
        $('<h3>', { text: 'Отображение столбцов', style: 'text-align: center' }).appendTo(divColumn);
        const tableColumn = $('<table>', { id: 'history_column_settings_table', class: 'table-form table-settings' });

        $('<tr>').append(
            $('<th>', { text: 'Столбец' }),
            $('<th>', { text: 'Отображение' })
        ).appendTo(tableColumn);

        for (const elem of tableData.header) {
            const isHidden = (elem.hidden == 'true');
            const tr = $('<tr>');
            $('<td>', { text: elem.name }).appendTo(tr);
            const td = $('<td>').appendTo(tr);
            if (elem.name !== 'Услуга') {
                const div = $('<div>', { style: 'width: max-content; margin: auto' }).appendTo(td);
                const labelOn = $('<label>', { class: 'checkbox-container', text: 'Вкл.', style: 'float: left; margin-right: 10px; display: block; text-align: center' }).appendTo(div);
                const inputOn = $('<input>', { class: 'checkbox', type: 'checkbox', value: 'on', setting_type: 'column', setting_name: elem.name }).appendTo(labelOn);
                $('<span>', { class: 'checkmark' }).appendTo(labelOn);

                addSettingChangeToObj(changedSettingsObj, inputOn, `column_${elem.name}`, isHidden);

                const labelOff = $('<label>', { class: 'checkbox-container', text: 'Выкл.', style: 'float: left; margin-right: 10px; display: block; text-align: center' }).appendTo(div);
                const inputOff = $('<input>', { class: 'checkbox', type: 'checkbox', value: 'off', setting_type: 'column', setting_name: elem.name }).appendTo(labelOff);
                $('<span>', { class: 'checkmark' }).appendTo(labelOff);

                addSettingChangeToObj(changedSettingsObj, inputOff, `column_${elem.name}`, isHidden);


                if (isHidden) {
                    inputOff.prop('checked', true);
                }
                else {
                    inputOn.prop('checked', true);
                }

                addEventOnOffToggle(inputOn, inputOff);
            }

            tr.appendTo(tableColumn);
        }

        tableColumn.appendTo(divColumn);

        divColumn.appendTo('#history_settings_content');

        const divService = $('<div>');
        $('<h3>', { text: 'Отображение услуг', style: 'text-align: center' }).appendTo(divService);
        const tableService = $('<table>', { id: 'history_service_settings_table', class: 'table-form table-settings' });

        $('<tr>').append(
            $('<th>', { text: 'Услуга' }),
            $('<th>', { text: 'Отображение' })
        ).appendTo(tableService);

        for (const elem of tableData.body) {
            const isHidden = (elem.hidden == 'true');
            const tr = $('<tr>');
            $('<td>', { text: elem.name }).appendTo(tr);
            const td = $('<td>').appendTo(tr);
            const div = $('<div>', { style: 'width: max-content; margin: auto' }).appendTo(td);
            const labelOn = $('<label>', { class: 'checkbox-container', text: 'Вкл.', style: 'float: left; margin-right: 10px; display: block; text-align: center' }).appendTo(div);
            const inputOn = $('<input>', { class: 'checkbox', type: 'checkbox', value: 'on', setting_type: 'service', setting_name: elem.name }).appendTo(labelOn);
            $('<span>', { class: 'checkmark' }).appendTo(labelOn);

            addSettingChangeToObj(changedSettingsObj, inputOn, `service_${elem.name}`, elem.hidden);


            const labelOff = $('<label>', { class: 'checkbox-container', text: 'Выкл.', style: 'float: left; margin-right: 10px; display: block; text-align: center' }).appendTo(div);
            const inputOff = $('<input>', { class: 'checkbox', type: 'checkbox', value: 'off', setting_type: 'service', setting_name: elem.name }).appendTo(labelOff);
            $('<span>', { class: 'checkmark' }).appendTo(labelOff);

            addSettingChangeToObj(changedSettingsObj, inputOff, `service_${elem.name}`, isHidden);

            if (isHidden) {
                inputOff.prop('checked', true);
            }
            else {
                inputOn.prop('checked', true);
            }

            addEventOnOffToggle(inputOn, inputOff);

            tr.appendTo(tableService);
        }

        tableService.appendTo(divService);

        divService.appendTo('#history_settings_content');

        $('#save_history_settings_btn').off('click');
        $('#save_history_settings_btn').on('click', function () {
            let changedSettingsArr = [];

            for (const setting in changedSettingsObj) {
                changedSettingsArr.push(changedSettingsObj[setting]);
            }

            sendAccountHistorySettings(changedSettingsArr);
        });
    }
}

function addEventOnOffToggle(inputOn, inputOff) {
    inputOn.on('change', function() {
        if (inputOn.prop('checked')) {
            inputOff.prop('checked', false);
        }
        else {
            inputOn.prop('checked', true);
        }
    });

    inputOff.on('change', function() {
        if (inputOff.prop('checked')) {
            inputOn.prop('checked', false);
        }
        else {
            inputOff.prop('checked', true);
        }
    });
}

function addSettingChangeToObj(obj, elem, objKey, hiddenCurrentState) {
    elem.on('change', function () {
        const isHidden = (elem.attr('value') == 'off');

        if (!obj.hasOwnProperty(objKey)) {
            const value = { type: elem.attr('setting_type'), name: elem.attr('setting_name'), hidden: isHidden.toString() };
            obj[objKey] = value;
        }
        else if (hiddenCurrentState == isHidden) {
            delete obj[objKey];
        }
        console.log(obj);
    });
}

function operationRegistry (Obj, registryId, registryName, registryType, documentType, Operation, previosString) {
    console.log(previosString);
    console.dir(previosString)
    if(previosString == undefined){
        previosString = $("<tbody>").appendTo("#registry_table");
    }

    const {thead, tbody} = Obj;
    if(Obj.tfooter){
        $("#registry_table tbody tr:last").remove();
    }

    const tr = $( "<tr>" );
    const tdOperation = $( "<td>" );
   
    for (const entry of tbody) {
        for (const index in entry.data) {
            const td = $( '<td>', { text: entry.data[index] }).appendTo(tr);

            const isHidden = (thead[index].hidden == 'true');
                        
            if (isHidden) {
                td.css({ 'display': 'none' });
            }
        }
    }
    tdOperation.appendTo(tr);

    if (Operation == "edit"){
        $(previosString).after(tr);
    } else if(Operation == "add"){
        if($("#registry_table").find("tbody")){
            tr.appendTo(previosString);
        } else{
            const tbody = $("<tbody>").appendTo("#registry_table")
            tr.appendTo(tbody);
        }
        
        console.log(previosString);
        
    }

    if(Obj.tfooter){
        for (const entry of Obj.tfooter) {
            const tr = $( "<tr>" );
            for (const index in entry) {
                const td = $( '<td>', {class:"table-tfoot-td", text: entry[index] }).appendTo(tr);

                const isHidden = (thead[index].hidden == 'true');
                        
                if (isHidden) {
                    td.css({ 'display': 'none' });
                    console.log("скрыть")
                }
            }           

            tr.appendTo(previosString);
        }
    }


    for(const action of Obj.thead){
        if(action.name == "Действие"){
            if(action.type_action.includes("edit")){
                const editEntryIcon = $('<i>', { class: 'material-icons', text: 'edit', title: 'Изменить' }).appendTo(tdOperation);
                editEntryIcon.on('click', function (e) {
                    openEditRegistryEntryPopup(e, registryId, Obj.tbody[0].id, registryName, registryType, documentType, Obj);
                });
                editEntryIcon.css("display", "inline-flex");
            }

            if(action.type_action.includes("delete")){
                
                const delEntryIcon = $('<i>', { class: 'material-icons', text: 'delete', title: 'Удалить' }).on('click', function (e) {
                    deleteRegistryEntry(e, registryId, Obj.tbody[0].id, registryName, registryType, documentType)
                });
                delEntryIcon.appendTo(tdOperation);
                delEntryIcon.css("display", "inline-flex");
            }
            if(action.type_action.includes("addfile")){
                const filesIcon = $('<i>', {id: 'obj_files_registry_icon', class: 'material-icons material_counts', title: 'Файлы', text: 'folder_open' });
                filesIcon.on('click', function (e) { 
                    IdRegStr = e.currentTarget.attributes.idRegStr.value;        
                    $(registryData.tbody).each(function(index, element){
                        if(element.id == IdRegStr){
                            filesRegistry = element.files;                 
                        }
                    });     
                    IDAccid = $.ajax({
                        async: false,
                        url: `/web_request?query=recid@${IdRegStr}`,
                        type: 'get'
                    }).responseText;
                    openFilesRegistryPopup(registryId, registryName, registryType, documentType);  
                    return IDAccid;
                    
                });
                filesIcon.attr("idRegStr", Obj.tbody[0].id);
                filesIcon.appendTo(tdOperation);
            }
        }       
    } 
}

function postIdReccid() {
   return setInterval(() => {
       if(C_REG_DATA.registryId !== undefined){
           if($('#popup_registry').css("display") == "block" && $('#popup_add_edit_registry_entry').css("display") !== "block" && $('#popup_registry_settings').css("display") !== "block" && $('#popup_object_files_registry').css("display") !== "block") {
            let summServer = $.ajax({
                async: false,
                url: `/web_request?query=reechksumm@${C_REG_DATA.registryId}`,
                type: 'get'
            }).responseText
            if(summServer != COUNT_ID){
            const saveScroll =  $('#registry_settings_content .block-content');
            let countSaveScroll = saveScroll.scrollTop()
            showPopupNotification('notification', 'В текущем реестре произошло изменение!');
            getRegistryData(C_REG_DATA.registryId, C_REG_DATA.registryName, C_REG_DATA.registryType, C_REG_DATA.documentType,saveScroll, countSaveScroll);  
            }             
           }
       }
    }, 300000);
    
}

// получить данные рееестра
function getRegistryData(registryId, registryName, registryType, documentType, saveScroll = "false", countSaveScroll = "false", parent = "false") {
    let actOffice = "";
    if(parent == "true"){
        actOffice = "_office";
    }

    $(`#registry_print_icon${actOffice}`).off('click');
    $(`#registy_add_entry_btn, #registry_print_icon, #registry_lock_icon, #registry_settings_icon, #registy_convert_to_excel_btn, #no_registries_div, #registry_printed_document_icon, #add_registry_entry_table`, '#add_container').remove();
    $("#add_container").remove();
    COUNT_ID = 0;
    C_REG_DATA = {
        registryId: registryId,
        registryName: registryName,
        registryType: registryType,
        documentType: documentType
    }
    if(parent == "true"){
        $('#popup_office_administration .block-content').empty();
        createContentLoader('#popup_office_administration .block-content');  
    }else{
        $('#registry_settings_content .block-content').empty();
        createContentLoader('#registry_settings_content .block-content');  
    }
    let dataObj = {}
    if(parent == "true"){
        dataObj = {acc_id: CURRENT_OBJECT_DATA.accid, registry_id: registryId, doc_type: documentType};
        console.log("true")
    } else{
        dataObj = {registry_id: registryId, doc_type: documentType};
    }

    $.ajax({
        type: 'POST',
        url: '/base_func?fnk_name=get_registry',
        data: JSON.stringify(dataObj),
        success: (data) => {
            console.log(data)
            registryData = JSON.parse(data);
            displayRegistry(registryData, registryId, registryName, registryType, documentType, parent);
            if(!(saveScroll == "false") && !(countSaveScroll == "false")){
                saveScroll.scrollTop(countSaveScroll);
            }

            COUNT_ID = 0;
            for(let i = 0; i < registryData.tbody.length; i++){
               COUNT_ID += registryData.tbody[i].id; 
            }
        }
    });
}

function getAddRegistryEntry(Obj, registryId, registryName, registryType, documentType){
    const previosString = $("#registry_table tbody");
    const Operation = "add";
    COUNT_ID += Obj.tbody[0].id;    
    operationRegistry (Obj, registryId, registryName, registryType, documentType, Operation, previosString);      
}

function getEditRegistryEntry(e, Obj, registryId, registryName, registryType, documentType ){
    const previosString = e.currentTarget.parentElement.parentElement.previousElementSibling;    
    const CurrentString = e.currentTarget.parentElement.parentElement.children;
    $(CurrentString).remove();
    const Operation = "edit";
    operationRegistry (Obj, registryId, registryName, registryType, documentType, Operation, previosString);
}

function getDelRegistryEntry(e){
    const CurrentString = e.currentTarget.parentElement.parentElement.children;
     console.dir(CurrentString);
     $(CurrentString).each( function (index, elem) {
         if(!CurrentString.lastChild){
             if($(elem.children).is(".material-icons")){
                $(elem).text("");
                $(elem).css("background-color", "#d1e1e8"); 
             }else {              
                 $(elem).css("text-decoration","line-through");
                if(localStorage.getItem('color_theme') =='dark'){
                    $(elem).css("background-color", "#d1e1e8");
                } else if(localStorage.getItem('color_theme') =='default'){
                    $(elem).css("background-color", "#b3d5e3");
                }
             }            
         }
     });
 }

function displayRegistry(data, registryId, registryName, registryType, documentType, parent = "false") {
    $("#add_container").remove();
    const {thead, tbody, tfooter, blocked, rows_per_page, upload_file_types} = data; // data.thead, data,tbody ...

    const registryIsBlocked = (blocked == 'true');

    initializeRegistrySettings(registryId, thead, rows_per_page, documentType, parent);

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

    for (const th of thead) {
        const thElem = $('<th>', {text: th.name}).appendTo(table.find('thead tr'));
        const isHidden = (th.hidden == 'true');
        const displayOnly = (th.display_only == 'true');

        if(isHidden) {
            thElem.css({ 'display': 'none' });
        }
        else {

            if (!displayOnly) {
                const tr = $('<tr>');

                const tdName = $('<td>', { text: th.name, class: 'td-bold' });
                const tdValue = $('<td>').append(
                    $('<input>', { type: 'text', class: 'table-td-input', name: th.name, value_type: th.type, editable: th.editable})
                );
                tdValue.each(function(index, element){
                    $(element).on('keypress', function(e){
                        if(e.which == 13){
                            if(e.currentTarget == e.currentTarget.parentElement.parentElement.lastChild.lastChild) {
                                    addRegistryEntry(registryId, registryName, registryType, documentType);
                                    console.log(registryId, registryName, registryType, documentType);
                            } else {
                            let nextInput = e.currentTarget.parentElement.nextElementSibling.lastChild.firstChild;
                            nextInput.focus();
                            }
                        }
                    });
                }); 
                
                tr.append(tdName, tdValue);
                addEntryTable.append(tr);

            }
        }
        theadData.push({ name: th.name, editable: th.editable });
    }

    const paginationDiv = $('#registry_pagination');
    
    if (rows_per_page == 'all') {
        $('#registry_settings_content').removeClass('pagination');
        paginationDiv.removeClass('active');
        const html = contentTemplating(tbody);
        table.find('tbody').remove();
        table.append(html);
    }
    else {   
        if (tbody.length > 20) {
            $('#registry_settings_content').addClass('pagination');
            paginationDiv.addClass('active');
        }
        else {
            $('#registry_settings_content').removeClass('pagination');
            paginationDiv.removeClass('active');
        }
        
        paginationDiv.pagination({
            dataSource: tbody,
            pageSize: rows_per_page,
            pageRange: 5,
            // showPageNumbers: true,
            callback: function(tbody, pagination) {
                const html = contentTemplating(tbody); 
                table.find('tbody').remove();
                table.append(html);
            }
        });
    }

    function contentTemplating(data) {
        
        if (!isEmpty(data)) {

            let tbodyDiv = $('<tbody>');

            for (const entry of data) {
                const tr = $('<tr>');

                let editEntryData = theadData.slice();
                for (const index in entry.data) {
                    if(index == "files"){

                    } else {
                        const td = $('<td>', { text: entry.data[index] }).appendTo(tr);
                        editEntryData[index].value = entry.data[index];
                        
                        const isHidden = (thead[index].hidden == 'true');
                        
                        if (isHidden) {
                            td.css({ 'display': 'none' });
                        }
    
                        if(entry.rec_clr){
                            if(localStorage.getItem('color_theme') =='dark'){
                                td.css("background-color", "#d1e1e8");
                            } else if(localStorage.getItem('color_theme') =='default'){
                                td.css("background-color", "#b3d5e3");
                            }
                        } 
                    }
                    
                }
                
                const tdOperation = $('<td>');
                $(tdOperation).css("min-width", "85px");
                tdOperation.css("display", "none");
                tdOperation.appendTo(tr);
                if(entry.rec_clr){
                    if(localStorage.getItem('color_theme') =='dark'){
                        tdOperation.css("background-color", "#d1e1e8");
                    } else if(localStorage.getItem('color_theme') =='default'){
                        tdOperation.css("background-color", "#b3d5e3");
                    }
                    
                }
                
                let entryData = {};
                for (const elem of editEntryData) {
                    entryData[elem.name] = elem.value;
                }

                for (const th of thead) {
                    if(th.type_action){
                        if(th.name == "Действие"){
                            tdOperation.css("display", "table-cell");
                        }
                    }
                }
                if (entry.status == 'active') {
                    if (!registryIsBlocked) {
                        if (documentType !== 'print_registry') {
                            
                            for (const th of thead) {
                                if(th.type_action){
                                    if(th.type_action.includes("edit") && th.name == "Действие"){
                                        const editEntryIcon = $('<i>', { class: 'material-icons', text: 'edit', title: 'Изменить' }).appendTo(tdOperation);
                                        editEntryIcon.on('click', function (e) {
                                            const parentToogle = e.currentTarget.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement;
                                            if("registry_settings_content" !== parentToogle.id){
                                                office_admin_active = true;
                                            }
                                            openEditRegistryEntryPopup(e,registryId, entry.id, registryName, registryType, documentType, registryData);
                                        });
                                        editEntryIcon.css("display", "inline-flex");
                                    }
                           
                                    if(th.type_action.includes("delete") && th.name == "Действие"){
                                        
                                        const delEntryIcon = $('<i>', { class: 'material-icons', text: 'delete', title: 'Удалить' }).on('click', function (e) {
                                            deleteRegistryEntry(e, registryId, entry.id, registryName, registryType, documentType)
                                        });
                                        delEntryIcon.appendTo(tdOperation);
                                        delEntryIcon.css("display", "inline-flex");
                                    }
                                    if(th.type_action.includes("addfile") && th.name == "Действие"){
                                        const filesIcon = $('<i>', {id: 'obj_files_registry_icon', class: 'material-icons material_counts', title: 'Файлы', text: 'folder_open' });
                                        filesIcon.on('click', function (e) { 
                                            const parentToogle = e.currentTarget.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement;
                                            if("registry_settings_content" !== parentToogle.id){
                                                console.log(parentToogle.id)
                                                console.log(office_admin_active);
                                                office_admin_active = true;
                                            }
                                            
                                            IdRegStr = e.currentTarget.attributes.idRegStr.value;        
                                            $(registryData.tbody).each(function(index, element){
                                                if(element.id == IdRegStr){
                                                    filesRegistry = element.files;                 
                                                }
                                            });     
                                            IDAccid = $.ajax({
                                                async: false,
                                                url: `/web_request?query=recid@${IdRegStr}`,
                                                type: 'get'
                                            }).responseText;
                                            openFilesRegistryPopup(registryId, registryName, registryType, documentType);  
                                            return IDAccid;
                                            
                                        });
                                        filesIcon.attr("idRegStr", entry.id);
                                        filesIcon.appendTo(tdOperation);

                                        $(tbody).each(function(index, element){
                                            if(element.files && !isEmpty(element.files)){
                                                $(filesIcon).each(function(i, elem){
                                                    if ($(elem).attr("idregstr") == element.id){
                                                        $(elem).text("folder");        
                                                    }
                                                });   
                                            }
                                        }); 
                                    }
                                }
                            }                                                
                        }
                    }
                }
                else {
                    if (entry.status == 'delete')
                        tr.find('td').addClass('delete-td');
                }

                tr.appendTo(tbodyDiv);

            }

            return tbodyDiv;
        }
        else {
            return '';
        }

    }   

    if (!isEmpty(tfooter)) {
        for (const row of tfooter) {
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
    $("<div>", { id: 'add_container' }).prependTo('#popup_add_edit_registry_entry .popup-content');
    addEntryTable.prependTo('#popup_add_edit_registry_entry .popup-content #add_container');

    let headerManipulation;
    let actOffice = "";
    if(parent == "true"){        
        headerManipulation = $('#popup_office_administration .header-manipulation');
        actOffice = "_office";
    } else{
        headerManipulation = $('#registry_settings_content .header-manipulation');
        headerManipulation.empty();
    }
    if (!$(`#registy_add_entry_btn${actOffice}`).length) {
        $("<i>", {  class: "material-icons", data_jq_dropdown: "", title: "Справка", text: "help_outline"}).appendTo(headerManipulation);
        if (!registryIsBlocked) {
            if (documentType !== 'print_registry') {    
                const addRegistryBtn = $('<button>', {id: `registy_add_entry_btn${actOffice}`, class: 'button-primary', title: 'Добавить запись в реестр', text: 'Добавить запись'}).appendTo(headerManipulation);

                addRegistryBtn.off('click');
                addRegistryBtn.on('click', (e) => {
                    const parentToogle = e.currentTarget.parentElement.parentElement.parentElement.parentElement;
                    if("registry_settings_content" !== parentToogle.id){
                        office_admin_active = true;
                    }
                    openAddRegistryEntryPopup(registryId, registryName, registryType, documentType);
                });
            }
        }
        $('<button>', {id: `registy_convert_to_excel_btn${actOffice}`, class: 'excel-button', title: 'Конвертировать реестр в Excel', text: 'Excel'}).appendTo(headerManipulation);
        $('<i>', {id: `registry_settings_icon${actOffice}`, class: 'material-icons', title: 'Настройки реестра', text: 'settings'}).on('click', (e) => {
            const parentToogle = e.currentTarget.parentElement.parentElement.parentElement.parentElement;
            if("registry_settings_content" !== parentToogle.id){
                office_admin_active = true;
                console.log("fllflff")
            }
            openPopupWindow(`popup_registry_settings${actOffice}`)
        }).appendTo(headerManipulation);
        
        if (documentType == 'print_registry') {
            $('<i>', {id: `registry_printed_document_icon${actOffice}`, class: 'material-icons', title: 'Напечатанный документ', text: 'event_note'}).on('click', () => {
                createContentLoader('#popup_report .content');
                openPopupWindow('popup_report');

                let dataObj={id: registryId}
                $.ajax({
                    url: `/base_func?fnk_name=ree_print_registry_content`,
                    type: 'POST',
                    data: JSON.stringify(dataObj),
                    contentType: 'application/json',
                    success: function(data) {
                        $('#popup_report .content').html(data);
                    }
                });
            }).appendTo(headerManipulation);
        }
        $('<i>', {id: `registry_print_icon${actOffice}`, class: 'material-icons', title: 'Печать реестра', text: 'print'}).appendTo(headerManipulation);

        if (registryType == 'regular') {
            if (registryIsBlocked) {
                $('<i>', {id: `registry_lock_icon${actOffice}`, class: 'material-icons', title: 'Реестр закрыт', text: 'lock'}).appendTo(headerManipulation);
            }
            else {
                const lockIcon = $('<i>', {id: `registry_lock_icon${actOffice}`, class: 'material-icons', title: 'Реестр открыт. Нажмите, чтобы закрыть реестр', text: 'lock_open'}).appendTo(headerManipulation);
                lockIcon.on('click', function() { 
                    blockRegistry(registryId, registryName, registryType, documentType);
                });
            }
        }
            $("<i>",{id: `registry_update_icon${actOffice}`, class: 'material-icons', title: 'Обновить реестр', text: 'autorenew'}).on("click", () =>{
                const saveScroll =  $('#registry_settings_content .block-content');
                let countSaveScroll = saveScroll.scrollTop()
                getRegistryData(registryId, registryName, registryType, documentType, saveScroll, countSaveScroll, parent);
            }).appendTo(headerManipulation);
            console.log(headerManipulation)
        }

    $('#add_registry_entry_table input').each(function() {
        const input = $(this);
        const valueType = $(this).attr('value_type')
        if (valueType == 'numeric') {
            input.inputmask('[-]9{1,}[(.|,)9{1,2}]');
        }
        else if (valueType == 'date') {
            input.inputmask({alias: 'datetime', inputFormat: "dd.mm.yyyy", placeholder: '__.__.____'});
        }
    });

    $("#add_registry_entry_table input[name='ЛС']").keyup(function() {
        searchInputValue($(this), 'valueType');
    });

    if(parent == "true"){
        $('#popup_office_administration .block-content').html(table);
    } else{
       $('#registry_settings_content .block-content').html(table); 
    }
    
    $(`#registry_print_icon${actOffice}`).on('click', function(e) {
        printRegistry(e.currentTarget.id);
    });

    $('#registry_column_settings_btn').off('click');
    $('#registry_column_settings_btn').on('click', () => {
        saveRegisrtrySettings(registryId, registryName, registryType, documentType);
    });

    $(`#registy_convert_to_excel_btn${actOffice}`).off('click');
    $(`#registy_convert_to_excel_btn${actOffice}`).on('click', (e) => {
        const parentToogle = e.currentTarget.parentElement.parentElement.parentElement.parentElement;
        let table;
        if("registry_settings_content" !== parentToogle.id){         
            table = $('#popup_office_administration .block-content');
        } else {
            table = $('#registry_settings_content .block-content');
        }
        
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

        const fileName = `реестр_${registryName}_${localStorage['currentCompany']}`.replace(/ /g, '_');
        console.log(fileName)

        convertContentToExcel(convertibleContent.html(), fileName);
    });
}

function createRegistryTable(data, actionsColumn) {
    const {thead, tbody, tfooter, blocked, rows_per_page} = data;

    const table = $('<table>', {class: 'main-table'}).append(
        $('<thead>').append(
            $('<tr>')
        ),
        $('<tbody>')
    );

    for (const th of thead) {
        const thElem = $('<th>', {text: th.name}).appendTo(table.find('thead tr'));
    }

    if (!isEmpty(actionsColumn)) {
        $('<th>', {text: 'Действия'}).appendTo(table.find('thead tr'));
    }

    console.log(tbody)

    if (!isEmpty(tbody)) {

        for (const entry of tbody) {
            const tr = $('<tr>');

            for (const index in entry.data) {
                const td = $('<td>', { text: entry.data[index] }).appendTo(tr);

                const isHidden = (thead[index].hidden == 'true');

                if (isHidden) {
                    td.css({ 'display': 'none' });
                }

            }
            
            if (!isEmpty(actionsColumn)) {
                const actionsTd = $('<td>').appendTo(tr);

                for (const action of actionsColumn) {
                    $('<i>', { class: 'material-icons', title: action.title, text: action.icon}).on('click', () => {
                        action.onClick();
                    }).appendTo(actionsTd);
                }
            }

            tr.appendTo(table.find('tbody'));
        }

    }

    if (!isEmpty(tfooter)) {
        for (const row of tfooter) {
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

    return table;
}

function createAddRegistryEntryTable(data) {
    console.log(data);
    const table = $('<table>', { id: 'add_registry_entry_table', class: 'main-table' }).append(
        $('<tr>'),
        $('<tr>'),
        $('<tr>'),
        $('<tr>'),
        $('<tr>'),
        $('<tr>')
    );

    const firstRowElems = ['ЛС', 'Месяц', 'Год', 'Номер платёжки', 'Дата платёжки', 'Примечание'];

    for (const th of data) {
        if (th.name !== 'ЛС') {
            const thElem = $('<th>', { text: th.name }).appendTo(table.find('thead tr'));

            const isHidden = (th.hidden == 'true');

            if (isHidden) {
                thElem.css({ 'display': 'none' });
            }
            else {
                if (inObject(th.name, firstRowElems)) {
                    if (th.name == 'Примечание') {
                        $('<td>', { text: th.name, colspan: data.length - 4, class: 'td-bold' }).appendTo(table.find('tr:nth-child(3)'));
                        $('<td>', { colspan: data.length - 4 }).append(
                            $('<input>', { type: 'text', class: 'table-td-input', name: th.name, value_type: th.type })
                        ).appendTo(table.find('tr:nth-child(4)'));
                    }
                    else {
                        $('<td>', { text: th.name, class: 'td-bold' }).appendTo(table.find('tr:nth-child(3)'));
                        $('<td>').append(
                            $('<input>', { type: 'text', class: 'table-td-input', name: th.name, value_type: th.type })
                        ).appendTo(table.find('tr:nth-child(4)'));
                    }
                }
                else if (th.name == 'Итого') {
                    $('<td>', { text: `Итого`, colspan: data.length, class: 'td-bold' }).appendTo(table.find('tr:nth-child(5)'));
                    $('<td>', { colspan: data.length }).append(
                        $('<input>', { id: 'add_entry_total_sum', type: 'text', class: 'table-td-input', name: th.name, value_type: th.type })
                    ).appendTo(table.find('tr:nth-child(6)'));
                }
                else {
                    if (th.name !== 'Автор' && th.name !== 'Адрес') {
                        $('<td>', { text: th.name, class: 'td-bold' }).appendTo(table.find('tr:nth-child(1)'));
                        const input = $('<input>', { type: 'text', class: 'table-td-input', name: th.name, value_type: th.type })
                        if (th.name == 'Должник') {
                            const registrationsList = OBJECT_DATA.registrations
                            const optionsList = []

                            for (const registration in registrationsList) {
                                optionsList.push(registration.split('&')[0])
                            }
                            input.on('click', function() {
                                InputListOfOptions($(this), optionsList)
                            })
                            input.on('keyup', function() {
                                $(this).siblings().remove();
                            })
                        }
                        $('<td>').append(
                            input
                        ).appendTo(table.find('tr:nth-child(2)'));
                    }
                }
            }
        }

    }

    return table;
}

function openAddRegistryEntryPopup(registryId, registryName, registryType, documentType) {
    $('#popup_add_edit_registry_entry .popup-name').text('Добавить запись в реестр');
    $('#add_registry_entry_btn').text('Добавить');
    $('#add_registry_entry_table input').val('');
    $('#add_entry_total_sum, #add_registry_entry_table tr:nth-child(4) input').attr('disabled', false);

    $('#add_registry_entry_btn').off('click');
    $('#add_registry_entry_btn').on('click', () => {
        addRegistryEntry(registryId, registryName, registryType, documentType);
    });

    const inputCollection = $('#add_registry_entry_table').find('tr:nth-child(4) input');
    inputCollection.each(function() {
        $(this).off('keyup');
        $(this).on('keyup', () => {
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

    $('#add_registry_entry_table input').each(function() {
        $(this).attr('disabled', false);
        const input = $(this);
        const valueType = $(this).attr('value_type')
        if (valueType == 'numeric') {
            input.on('keyup', () => {
                input.val(input.val().replace(/,/g, '.'));
            });
        }
    });

    openPopupWindow('popup_add_edit_registry_entry');
}

function openEditRegistryEntryPopup(e, registryId, entryId, registryName, registryType, documentType, Obj) {
    $('#popup_add_edit_registry_entry .popup-name').text('Изменить запись в реестре');
    $('#add_registry_entry_btn').text('Сохранить');
    $('#add_registry_entry_table tr:nth-child(4) input').attr('disabled', false);
    $('#add_entry_total_sum').attr('disabled', true);

    $('#add_registry_entry_btn').off('click');
    $('#add_registry_entry_btn').on('click', () => {
        editRegistryEntry(e, registryId, entryId, registryName, registryType, documentType);
    });

    let theadData = [];
    for (const th of Obj.thead) {
        theadData.push({ name: th.name, editable: th.editable });
    }
    let editEntryData = theadData.slice();
    
    for (const entry of Obj.tbody) {
        if(entry.id == entryId){
           for (const index in entry.data) {
            editEntryData[index].value = entry.data[index];
            } 
        }
    }

    let entryData = {};
    for (const elem of editEntryData) {
        entryData[elem.name] = elem.value;
    }

    console.log(entryData);

    $('#add_registry_entry_table input').each(function() {
        const inputName = $(this).attr('name');
        $(this).val(entryData[inputName]);
        if ($(this).attr('editable') == 'false')
            $(this).attr('disabled', true);
    });

    const inputCollection = $('#add_registry_entry_table').find('tr:nth-child(4) input');
    inputCollection.each(function() {
        $(this).off('keyup');
        $(this).on('keyup', () => {
            $('#add_entry_total_sum').val(sumUpInputValues(inputCollection));
        });
    });

    $('#add_registry_entry_table input').each(function() {
        const input = $(this);
        const valueType = $(this).attr('value_type')
        if (valueType == 'numeric') {
            input.on('keyup', () => {
                input.val(input.val().replace(/,/g, '.'));
            });
        }
    });
    openPopupWindow('popup_add_edit_registry_entry');
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
    let dataObj = {registry_id: registryId};

    const rowsPerPage = $('input[name="registry_number_elements"]:checked').val();
    dataObj.rows_per_page = rowsPerPage;
    const columnVisibility = {};
    
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

            columnVisibility[columnName] = hidden;
        }

        dataObj.column_visibility = columnVisibility;
    });

    console.log(dataObj)

    $.ajax({
        url: '/base_func?fnk_name=registry_settings',
        type: 'POST',
        data: JSON.stringify(dataObj),
        contentType: 'application/json',
        success: function() {
            closePopupWindow('popup_registry_settings');
            showPopupNotification('notification', 'Отображение столбцов в реестре успешно сохранено!');
            getRegistryData(registryId, registryName, registryType, documentType);
        }
    });
} 

function addRegistryEntry(registryId, registryName, registryType, documentType) {

    const validateinputsArray = [];
    const valuesObj = {};

    $('#add_registry_entry_table input').each(function() {
        const input = $(this);
        const inputName = $(this).prop('name');
        valuesObj[inputName] = input.val()
    });

    if (validateFormInputs(validateinputsArray)) {
        const data = {
            id: registryId,
            operation: 'add',
            values: valuesObj
        }
        $.ajax({
            type: 'POST',
            url: '/base_func?fnk_name=addchg_ree_recodrs',
            data: encodeURI(JSON.stringify(data)),
            success: (data) => {
                console.log(data)
                if (data == 'wrong_ls') {
                    showPopupNotification('alert', 'Значение ЛС не найдено в базе данных!');
                }
                else {
                    console.log(JSON.parse(data));
                    closePopupWindow('popup_add_edit_registry_entry');
                    getAddRegistryEntry(JSON.parse(data), registryId, registryName, registryType, documentType);
                    showPopupNotification('notification', 'Запись в реестр успешно добавлена!');
                }
            }
        });
    }
    else {
        showPopupNotification('alert', 'Отсутствует значение ЛС, Месяц или Год!');
    }
}


function editRegistryEntry(e, registryId, entryId, registryName, registryType, documentType) {

    const validateinputsArray = [];
    const valuesObj = {};

    $('#add_registry_entry_table input').each(function() {
        if ($(this).attr('editable') !== 'false') {
            const input = $(this);
            const inputName = $(this).prop('name');
            valuesObj[inputName] = input.val()
        }
    });

    if (validateFormInputs(validateinputsArray)) {
        console.log(valuesObj)

        const data = {
            id: entryId,
            operation: 'chg',
            values: valuesObj
        }

        $.ajax({
            type: 'POST',
            url: '/base_func?fnk_name=addchg_ree_recodrs',
            data: encodeURI(JSON.stringify(data)),
            success: (data) => {
                if (data == 'wrong_ls') {
                    showPopupNotification('alert', 'Значение ЛС не найдено в базе данных!');
                }
                else if (data == 'wrong_user') {
                    showPopupNotification('alert', 'У Вас нет прав на изменение этой записи!')
                }
                else if (data == 'already_deleted') {
                    getDelRegistryEntry(e);
                    showPopupNotification('alert', 'Данная запись уже удалена из реестра!'); 
                } else {
                        closePopupWindow('popup_add_edit_registry_entry');
                        getEditRegistryEntry(e, JSON.parse(data), registryId, registryName, registryType, documentType);

                        showPopupNotification('notification', 'Запись в реестре успешно изменена!');
                }
            }
        });
    }
    else {
        showPopupNotification('alert', 'Отсутствует значение ЛС, Месяц или Год!');
    }
}

function deleteRegistryEntry(e, registryId, entryId, registryName, registryType, documentType) {
    if (confirm(`Вы уверены, что хотите удалить запись из реестра?`)) {
        const data = {
            id: entryId,
            operation: 'del'
        }

        $.ajax({
            type: 'POST',
            url: '/base_func?fnk_name=addchg_ree_recodrs',
            data: encodeURI(JSON.stringify(data)),
            success: (data) => {
                if (data == 'wrong_user') {
                    showPopupNotification('alert', 'У Вас нет прав на удаление этой записи!')
                }
                else if (data == 'already_deleted') {
                    getDelRegistryEntry(e);
                    showPopupNotification('alert', 'Данная запись уже удалена из реестра!'); 
                } else {
                    getDelRegistryEntry(e);

                    showPopupNotification('notification', 'Запись из реестра успешно удалена!');
                }
            }
        });
    }
}

function blockRegistry(registryId, registryName, registryType, documentType) {
    if (confirm(`Вы уверены, что хотите закрыть реестр "${registryName}"?`)) {
        encodeURIstring = encodeURI(`/base_func?val_param=ree_reestrs_close&val_param1=${registryId}`);
        $.post(encodeURIstring, function (data) { 
            console.log(data)
            if (data == 'success') {
                showPopupNotification('notification', `Реестр "${registryName}" успешно закрыт!`);
                getRegistryList(() => {
                    const li = $('#registry_settings_select_menu').find(`li[registry_id=${registryId}]`);
                    li.trigger('click');
                });
            }
            else if (data == 'already_close') {
                showPopupNotification('alert', `Реестр "${registryName}" уже закрыт!`);
            }
            else if (data == 'no_rule') {
                showPopupNotification('alert', `У Вас нет прав на закрытие реестра "${registryName}"!`);
            }
            else if (data == 'error') {
                showPopupNotification('alert', `Во время выполнения операции произошла ошибка. Обратитесь в техподдержку!`);
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
            showPopupNotification('alert', 'Выбирите минимум 2 объекта для создания группы!');
        }
        else {
            const groupName = $('#object_group_name').val();
            encodeURIstring = encodeURI(`/base_func?val_param=house_groups&val_param1=add&val_param2=${groupName}&val_param3=${objectsIdArray}`);
            $.post(encodeURIstring, function (data) {
                if (data == 'group_exist') {
                    showPopupNotification('alert', 'Группа с таким именем уже существует! Пожалуйста, укажите другое имя.');
                }
                else if (data == 'success') {
                    closePopupWindow('popup_create_object_group');
                    $('#object_group_name').val('');
                    $('#create_object_group_ul input:checked').prop('checked', false);
                    showPopupNotification('notification', 'Группа объектов успешно создана!');
                    getObjectsGroupsList();
                    getObjectsTreeData([initializeObjectsTreeFilters]);
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
            showPopupNotification('notification', `Группа объектов "${groupName}" успешно удалена!`);
            getObjectsTreeData([initializeObjectsTreeFilters]);
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
    showPopupNotification('notification', 'Загрузка файла начнется автоматически!');
    $.ajax({
        url: encodeURI(`/conver?type=xls&file_name=${fileName}`),
        type: 'POST',
        data: content,
        contentType: 'application/json',
        success: function(data) {
            console.log(data);
            window.location = data;
        }
    });
}

function selectRegistriesTypeHandler() {
    $('#registry_type_select').off('change');
    $('#registry_type_select').on('change', function() {
            getRegistryList(() => { });
    });
}

function getCompanyDocumentsList() {
    $.post('/report_srv?attr=list', function(data) {
        const documentsList = JSON.parse(data);
        if (!isEmpty(documentsList)) {
            showCompanyDocumentsList(documentsList);
        }
        else {
            showTextCenter('control_documents .block-content', 'Отчеты отсутствуют');
        }
    });
}

function showCompanyDocumentsList(data) {
    console.log(data)
    $('#control_documents .block-content').empty();
    const table = $('<table>', {id: 'control_documents_list_table', class: 'block-table'});
    for (const document in data) {
        const tr = $('<tr>').append(
            $('<td>', {text: document})
        ).appendTo(table);

        tr.on('click', function() {
            if (!isEmpty(data[document].interface[0])) {
                initializeCompanyDocumentPopupWindow(document, data[document].interface, data[document].fnk_name);
            }
            else {
                getCompanyDocument(data[document].fnk_name, document, 'withoutParameters');
            }
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
                const input = $('<input>', {parameter_name: elem.parameter_name, date_type: elem.date_type});
                if (elem.date_type == 'full') {
                    input.attr('type', elem.input_type);
                }
                else if (elem.date_type == 'short') {
                    input.attr('type', 'text');
                    input.datepicker({
                        dateFormat: "mm.yy",
                        changeMonth: true,
                        changeYear: true,
                        showButtonPanel: true,
                        yearRange: '2005:2021',
                        beforeShow: function(input, inst) {
                            $('#ui-datepicker-div').addClass('input-datepicker');
                        },
    
                        onClose: function (dateText, inst) {
                            $(this).datepicker('setDate', new Date(inst.selectedYear, inst.selectedMonth, 1));
                        }
                    });
                }
                input.appendTo(div);
                input.before($('<span>', {text: elem.interface_name}));
            }
        }

        div.appendTo(parentDiv);
    }

    $('<div>', {class: 'form-submit-btn'}).append(
        $('<button>', {class: 'button-primary', text: 'Выполнить'}).on('click', function() {
            getCompanyDocument(funcName, documentName, 'withParameters');
        })
    ).appendTo(parentDiv);

    $('#popup_company_document_settings .popup-content').html(parentDiv);

    openPopupWindow('popup_company_document_settings');

}

function getCompanyDocument(funcName, documentName, parameters) {

    if (parameters == 'withParameters') {
        let parametersData =  {};
        const validateinputsArray = [];
    
        $('#popup_company_document_settings input').each(function() {
            const input = $(this);
            validateinputsArray.push(input);
    
    
            if (input.val() !== '') {
                if (input.attr('date_type') == 'full') {
                    parametersData[input.attr('parameter_name')] = RemakeDateFormatFromInput(input.val());
                }
                else if (input.attr('date_type') == 'short') {
                    parametersData[input.attr('parameter_name')] = input.val();
                }
            }
        })
    
        console.log(parametersData);
    
        if (validateFormInputs(validateinputsArray)) {
            performAjax(funcName, documentName, parametersData);
        }
    }
    else if (parameters == 'withoutParameters') {
        const parametersData = {};
        performAjax(funcName, documentName, parametersData);
    }
    
    function performAjax(funcName, documentName, parametersData) {
        $('#popup_company_document .content').empty();
        $('#popup_company_document .name').html(documentName);
        openPopupWindow('popup_company_document');
        createContentLoader('#popup_company_document .content');
        $.ajax({
            type: 'POST',
            url: encodeURI(`/report_srv?attr=${funcName}`),
            data: JSON.stringify(parametersData),
            success: function(data) {
                console.log(data)
                $('#popup_company_document .content').html(data);
                // data.appendTo('#popup_company_document .popup-content')
    
                $('#document_convert_to_excel_btn').off('click');
                $('#document_convert_to_excel_btn').on('click', function() {
                    convertContentToExcel(data, documentName);
                });
            }
        });
    }
}

function createPopupLayout(name, id) {
    const popup = $('<div>', { id: id, class: 'popup-window' }).append(
        $('<div>', { class: 'popup-header' }).append(
            $('<div>', { class: 'popup-name', text: name }),
            $('<div>', { class: 'popup-close' }).append(
                $('<i>', { class: 'material-icons', title: 'Закрыть', text: 'close'}).on('click', () => {closePopupWindow(id)})
            )
        ),
        $('<div>', { class: 'popup-content' })
    );

    return popup;
}

function createPopupLayoutLayer2(name, id) {
    const popup = $('<div>', { id: id, class: 'popup-window-layer2' }).append(
        $('<div>', { class: 'popup-header' }).append(
            $('<div>', { class: 'popup-name', text: name }),
            $('<div>', { class: 'popup-close' }).append(
                $('<i>', { class: 'material-icons', title: 'Закрыть', text: 'close'}).on('click', () => {closePopupWindowLayer2(id)})
            )
        ),
        $('<div>', { class: 'popup-content' })
    );

    return popup;
}

function createPopupFullscreenLayout(name, id, contentStyle) {
    const popup = $('<div>', {id: id, class: 'popup-fullscreen'}).append(
        $('<div>', {class: 'background'}).append(
            $('<div>', {class: 'header'}).append(
                $('<div>', {class: 'name', text: name}),
                $('<div>', {class: 'header-operation'}).append(
                    $('<i>', {class: 'material-icons', title: 'Закрыть', text: 'close'}).on('click', () => {closePopupWindow(id)})
                )
            ),
            $('<div>', {class: 'content'}).css(contentStyle)
        )
    );

    return popup;
}

function createCheckboxToggle(firstElem, secondElem) {
    const div = $('<div>', { style: 'width: max-content; margin: 10px' });
    const firstElemLabel = $('<label>', { class: 'checkbox-container', text: firstElem.name, style: 'float: left; margin-right: 10px; display: block; text-align: center' }).appendTo(div);
    const firstElemInput = $('<input>', { class: 'checkbox', type: 'checkbox', value: firstElem.value}).appendTo(firstElemLabel);
    $('<span>', { class: 'checkmark' }).appendTo(firstElemLabel);
    firstElemInput.prop('checked', firstElem.checked);
    firstElemInput.on('click',  function() {
        firstElem.callback($(this));
    })

    const secondElemLabel = $('<label>', { class: 'checkbox-container', text: secondElem.name, style: 'float: left; margin-right: 10px; display: block; text-align: center' }).appendTo(div);
    const secondElemInput = $('<input>', { class: 'checkbox', type: 'checkbox', value: secondElem.value}).appendTo(secondElemLabel);
    $('<span>', { class: 'checkmark' }).appendTo(secondElemLabel);
    secondElemInput.prop('checked', secondElem.checked);
    secondElemInput.on('click',  function() {
        secondElem.callback($(this));
    })

    addEventOnOffToggle(firstElemInput, secondElemInput);

    return div;
}

function addInputmask(input, mask) {
    if (mask == 'email') {
        $(input).inputmask({
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
    }
    else if (mask == 'mobile number') {
        $(input).inputmask('(999) 999-99-99');
    }
    else if (mask == 'fio') {
    }
}

function getChatPopup(){
    // const data = [
    //     {
    //         name: "tester",
    //         date: "15:03:29",
    //         text: " Привет!"
    //     },
    //     {
    //         name: "tester",
    //         date: "15:07:21",
    //         text: " Как чат?"
    //     },
    //     {
    //         name: "tester",
    //         date: "15:07:21",
    //         text: " Дизаин норм?"
    //     }
        
    // ]

    const submitBtn = $("#submit-msg");
    const inputText = $("#user-msg");
    const dialogsDiv = $("#dialogs-block");
    const userDiv = $("#users-block");
    const saveScroll =  $('#dialogs-block');
    let countSaveScroll = saveScroll.scrollTop();

    function postMessage(){
            let now = new Date(Date.now());
            let formatted = now.getHours() + ":" + now.getMinutes() + ":" + now.getSeconds();

            const messageDiv = $("<div>", {class: "message-block"});
            messageDiv.fadeIn(1000);
            messageDiv.appendTo(dialogsDiv);
            const messageText = $("<p>", {text: `${inputText.val()}`}).appendTo(messageDiv);
            const messageData = $("<i>", { text: `${formatted}`}).appendTo(messageDiv);        

            let countSaveScroll = saveScroll.scrollTop();
            saveScroll.scrollTop(countSaveScroll + messageDiv.outerHeight(true));

            inputText.val("");
    }
    submitBtn.on("click", () => {
        if(inputText.val() != ""){
          postMessage();  
        }       
    });

    inputText.on("keypress", (e)=>{
        if(e.which == 13 && inputText.val() != ""){
            postMessage();  
        }
    })

    const divIconNewUser = $('<div>', {class: "add-icon"}).prependTo(userDiv);
    const iconNewUser  = $('<i>',{class:"material-icons", text:"person_add"}).appendTo(divIconNewUser);

    iconNewUser.on("click", () =>{
        addNewUser();
    });
    function addNewUser(){
        openPopupWindow("popup_add_person");
        const contentPopup = $("#popup_add_person").find(".popup-content");
        const submitBtn = $(".form-submit-btn");
        submitBtn.off("click");
        submitBtn.on("click", () => {
            const dataVal = $("#popup_add_person").find(".input-main");
            
            const newUser = $("<div>", {text: ` ${dataVal.val()} `}).prepend($("<i>", {class:"material-icons", text:"person"})).appendTo(userDiv);
            $("<i>", {class:"material-icons", text:"close"}).on("click", (e) => {
                $(e.target.parentElement).remove();
            }).appendTo(newUser);

            closePopupWindow("popup_add_person");
            dataVal.val("");
        });
    }

    function getNewMessage(data){
        return setInterval(() => {
        $.each(data, (i, message) => {

        const messageDiv = $("<div>", {class: "message-block-too"});
        messageDiv.fadeIn(1000);
        messageDiv.appendTo(dialogsDiv);
        const messageText = $("<p>", {text: `${message.text}`}).appendTo(messageDiv);
        const messageData = $("<i>", { text: `${message.date}`}).appendTo(messageDiv);
        const messageUser = $("<i>", { text: `${message.name}`}).appendTo(messageDiv);
        
        let countSaveScroll = saveScroll.scrollTop();
        saveScroll.scrollTop(countSaveScroll + messageDiv.outerHeight(true));            
        }); 
        }, 50000);  
    }

    // getNewMessage(data);
}

function initializeLogData() {
    const from = "#from";
    const to = "#to";

    let dates = $(from + ", " + to).datepicker({
        defaultDate: "+1w",
        changeMonth: true,
        numberOfMonths: 2,
        onSelect: function(selectedDate){
          const option = this.id == "from" ? "minDate" : "maxDate",
          instance = $( this ).data( "datepicker" ),
          date = $.datepicker.parseDate(
            instance.settings.dateFormat || $.datepicker._defaults.dateFormat,
            selectedDate, instance.settings);
          dates.not(this).datepicker("option", option, date);
        }
      });

    $("ui-datepicker-calendar").css("display","block");

    const parentTablediv = $("#container-div")
    const table = $('<table>', {class:"main-table"}).appendTo(parentTablediv);
    const thead = $('<thead>').appendTo(table);
    table.find('tbody').empty();

    $('<tr>').append(
        $('<th>', {text: '№ п/п'}),
        $('<th>', {text: 'Наименование'}),
        $('<th>', {text: 'Дата'})
    ).appendTo(thead);

    const tbody = $('<tbody>', {style: 'overflow-y: auto'}).appendTo(table);

    function template(data){
        tbody.empty();
        for (const entry of data) {           
            const tr = $('<tr>').append(
                $('<td>',{text: entry.rn}), 
                $('<td>', {text: entry.note}), 
                $('<td>', {text: entry.date})
            ).appendTo(tbody);  
        }  
    }

    $(from + ", " + to).on("click", () =>{
        PgNum.val("1");
    })    

    const PgNum = $("#page-number"),
          pgSumm = $("#pag-page-sum");

    $("#prev-log-btn").on("click", () => {
            if(Number(PgNum.val()) != 1){
                let summ = Number(PgNum.val()) - 1;
                PgNum.val(summ);
                UpLogData()
            }        
    })

    $("#next-log-btn").on("click", () => {
        if(Number(pgSumm.find("a").text()) != Number(PgNum.val())){
            let summ = Number(PgNum.val()) + 1;
            PgNum.val(summ);
            UpLogData()
        }        
    })

    function clearVal() {
        $(from + ", " + to).datepicker('setDate', null);
        $(from).datepicker( "option", "maxDate", null );
        $(to).datepicker( "option", "minDate", null );
    }
        
    function UpLogData() {        
        PgNum.val();
        let CurrentPage;
        (PgNum.val()) ? CurrentPage = PgNum.val() : CurrentPage = 1;        

        let paramData = {
            сurrentpage: CurrentPage,
            dateb: $(from).val(),
            datee: $(to).val()
        }

        $.ajax({
            url: '/base_func?fnk_name=log_views',
            type: 'POST',
            data: JSON.stringify(paramData),
            contentType: 'application/json',
            success: function(data) {
                let dataC = JSON.parse(data);
                if(dataC.log_records != null){     
                template(dataC.log_records);
                pgSumm.find("a").text(dataC.page_count);
                } else{
                    showPopupNotification('alert', 'Данные в указанном диапозоне отсутствуют!');
                    clearVal();
                }                
            }
        });
    }   
    $("#btn-go").on("click", () => {
        if(Number(pgSumm.find("a").text()) < Number(PgNum.val())) PgNum.val(Number(pgSumm.find("a").text()));                
        showPopupNotification('notification', 'Применен фильтр диапозона дат!');
        UpLogData();
    });

    $("#profile_button").find(".material-icons").on("click", () =>{
        clearVal();
        UpLogData();
    });

    $("#btn-clear").on("click", () => {
        clearVal();
        UpLogData();
        showPopupNotification('notification', 'Произведен сброс фильтров!');
        PgNum.val("1");  
    })
}