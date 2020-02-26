"use strict";

import * as adminModule from '/js/admin_panel.js';


const PRIMARY_DATA = {
    project_name: 'Веб-модуль "Дебиторская задолженность"',
    url_endpoint: '/admin_func',
    tabs: [
        {id: 'users_tab', name: 'Пользователи'},
        {id: 'news_tab', name: 'Новости'}
    ],
    functions: [
        {
            description: "get user list",
            type: 'GET',
            name: 'usr_list',
            parent_tab: 'users_tab_content',
            table_columns: [
                "Логин",
                "Id",
                "Роль",
                "Примечание",
                "Название роли"
            ]
        },
        {
            description: "get news list",
            type: 'GET',
            name: 'news_list',
            parent_tab: 'news_tab_content',
            table_columns: [
                "Id",
                "Название",
                "Содержание",
                "Дата добавления"
            ],
            table_sorting: {property: 'date_cre'} 
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
                    $('<i>', {class: 'material-icons', title: 'Добавить новость', text: 'add'})
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
    }())

    adminModule.initializeFunctions();
});