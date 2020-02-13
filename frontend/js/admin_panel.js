"use strict";

import PRIMARY_DATA from '/js/admin_page.js';

export function createLayout() {
    $('<div>', { id: 'body_content' }).append(
        $('<div>', { id: 'main_page' }).append(
            $('<div>', { id: 'main_header' }).append(
                $('<span>', { text: `${PRIMARY_DATA.project_name} - Панель управления` })
            ),
            $('<div>', { id: 'main_tabs' }),
            $('<div>', { id: 'main_content' }),
        )
    ).appendTo('body');

    (function createTabs() {
        for (const tab of PRIMARY_DATA.tabs) {
            $('<div>', { id: tab.id, class: 'main-tab' }).append(
                $('<span>', { text: tab.name })
            ).appendTo('#main_tabs');

            $('<div>', { id: `${tab.id}_content`, class: 'tab-content' }).appendTo('#main_content');
        }
    }());
}

export function initializeFunctions() {
    for (const func of PRIMARY_DATA.functions) {
        if (func.type == 'GET') {

            const table = $('<table>', {class: 'main-table'});
            const tableHead = $('<tr>');

            for (const column of func.table_columns) {
                $('<th>', {text: column}).appendTo(tableHead);
            }

            tableHead.appendTo(table);

            $.post(`${PRIMARY_DATA.url_endpoint}?fnk_name=${func.name}`, (data) => {
                const requestData = JSON.parse(data);

                for (const elem in requestData) {
                    const row = $('<tr>');
                    $('<td>', {text: elem}).appendTo(row);

                    for (const cell in requestData[elem]) {
                        $('<td>', {text: requestData[elem][cell]}).appendTo(row);
                    }

                    row.appendTo(table);
                }

                $(`#${func.parent_tab}`).html(table);
            })
        }
    }
}
