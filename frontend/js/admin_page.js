'use strict';

import * as adminModule from '/js/admin_panel.js';

const PRIMARY_DATA = {
    project_name: "Веб-модуль 'Дебиторская задолженность'",
    url_endpoint: '/admin_func',
    tabs: [
        {id: 'users_tab', name: 'Пользователи'},
        {id: 'news_tab', name: 'Новости'}
    ],
    functions: [
        {
            type:  'get data',
            description: 'get user list',
            request_type: 'POST',
            name: 'usr_list',
            parent_tab: 'users_tab_content',
            table_columns: [
                { 'Id': 'id' },
                { 'Логин': 'login' },
                { 'Организация': 'organization_name' },
                { 'Id организации': 'organization_id' },
                { 'Роль': 'role' },
                { 'Примечание': 'notation' },
                { 'Название роли': 'role_name' }
            ]
        },
        {
            type:  'get data',
            description: 'get news list',
            request_type: 'POST',
            name: 'news_list',
            parent_tab: 'news_tab_content',
            table_columns: [
                { 'Id': 'id' },
                { 'Название': 'title' },
                { 'Содержание': 'content' },
                { 'Дата добавления': 'creation_date' }
            ],
            actions: [
                {
                    name: 'news',
                    title: 'Удалить новость',
                    icon: 'delete',
                    request_data: { id: 'id' },
                    general_params: [
                        'operation=del'
                    ]
                }
            ],
            table_sorting: {property: 'date_cre'}
        },
        {
            type:  'send data',
            desctiption: 'add news',
            request_type: 'POST',
            name: 'news',
            interface: [
                {type: 'input', name: 'Название', key: 'name'},
                {type: 'textarea', name: 'Содержание', key: 'content'},
                {type: 'submit', name: 'Добавить'},
            ],
            general_params: [
                'operation=add'
            ],
            parent_tab: 'add_news_popup',
            callback: [
                {
                    type:  'get data',
                    description: 'get news list',
                    request_type: 'POST',
                    name: 'news_list',
                    parent_tab: 'news_tab_content',
                    table_columns: [
                        { 'Id': 'id' },
                        { 'Название': 'title' },
                        { 'Содержание': 'content' },
                        { 'Дата добавления': 'creation_date' }
                    ],
                    actions: [
                        {
                            name: 'news',
                            title: 'Удалить новость',
                            icon: 'delete',
                            request_data: { id: 'id' },
                            general_params: [
                                'operation=del'
                            ]
                        }
                    ],
                    table_sorting: {property: 'date_cre'}
                }
            ]
        }
    ]
}

export default PRIMARY_DATA;

$(document).ready(() => {
    adminModule.createLayout();

    (function createTabsLayout() {
        const newsTabLayout = $('<div>', {class: 'block'}).append(
            $('<div>', {class: 'block-header-with-manipulation'}).append(
                $('<div>', {class: 'header', text: 'Список новостей'}),
                $('<div>', {class: 'header-manipulation'}).append(
                    $('<i>', {class: 'material-icons', title: 'Добавить новость', text: 'add'}).on('click', () => {adminModule.openPopupWindow('add_news_popup')})
                )
            ),
            $('<div>', {class: 'block-content'})
        );
        $('#news_tab_content').html(newsTabLayout);

        const usersTabLayout = $('<div>', {class: 'block'}).append(
            $('<div>', {class: 'block-header-with-manipulation'}).append(
                $('<div>', {class: 'header', text: 'Список пользователей'}),
                $('<div>', {class: 'header-manipulation'}).append(
                    $('<i>', {class: 'material-icons', title: 'Добавить пользователя', text: 'add'})
                )
            ),
            $('<div>', {class: 'block-content'})
        );
        $('#users_tab_content').html(usersTabLayout);
    }());

    (function createPopupsLayout() {
        const addNewsPopup = adminModule.createPopupLayout('Добавить новость', 'add_news_popup');
        addNewsPopup.appendTo('#popup_background');
    }());

    adminModule.initializeFunctions();
});