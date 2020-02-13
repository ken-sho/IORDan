"use strict";

import * as adminModule from '/js/admin_panel.js';


const PRIMARY_DATA = {
    project_name: 'Веб-модуль "Дебиторская задолженность"',
    url_endpoint: '/admin_func',
    tabs: [
        {id: 'users_tab', name: 'Пользователи'}
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
        }
    ]
}

export default PRIMARY_DATA;

$(document).ready(() => {
    adminModule.createLayout();
    adminModule.initializeFunctions();
});