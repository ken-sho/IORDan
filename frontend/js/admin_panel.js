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

    $('<div>', {id: 'popup_background'}).on('click', (e) => {
        if (e.target !== e.currentTarget) {
            return;
        }
        else {
            $('#popup_background, .popup-window').fadeOut(200);
        }
    }).appendTo('body');
    
    (function createTabs() {
        for (const tab of PRIMARY_DATA.tabs) {
            $('<div>', { id: tab.id, class: 'main-tab' }).append(
                $('<span>', { text: tab.name })
            ).appendTo('#main_tabs');

            $('<div>', { id: `${tab.id}_content`, class: 'tab-content' }).appendTo('#main_content');
        }
    }());

    (function toggleTab() {
        $('.main-tab').each(function() {
            $(this).on('click', function() {
                const id = $(this).attr('id');
                $('.tab-content').hide();
                $(`#${id}_content`).show();
            });
        })
    }());
}

export function initializeFunctions() {
    for (const func of PRIMARY_DATA.functions) {
        if (func.type == 'GET') {

            const table = $('<table>', {class: 'main-table'});
            const tableHead = $('<tr>');

            for (const column of func.table_columns) {
                for (const elem in column) {
                    $('<th>', {text: elem}).appendTo(tableHead);
                }
            }

            tableHead.appendTo(table);

            $.post(`${PRIMARY_DATA.url_endpoint}?fnk_name=${func.name}`, (data) => {
                let requestData = JSON.parse(data);
                console.log(requestData)

                // if (func.table_sorting) {

                    // console.log(Object.entries(requestData).sort((a, b) => b.date_cre - a.date_cre));

                    // const sortProperty = func.table_sorting.property;
                    // let sortedRequestData = Object.values(requestData).sort(function (a, b) {
                    //     console.log(a, b)
                    //     var dateA = new Date(a.date_cre), dateB = new Date(b.date_cre)
                    //     return dateB - dateA //сортировка по убывающей дате
                    // })

                    // console.log(sortedRequestData)
                    // requestData = sortedRequestData
                // }



                for (const elem of requestData) {
                    const row = $('<tr>');

                    for (const column of func.table_columns) {
                        for (const elem in column) {
                            $('<td>', {column_name: column[elem]}).appendTo(row);
                        }
                    }

                    for (const cell in elem) {
                        row.find(`td[column_name=${cell}]`).text(elem[cell]);
                        // $('<td>', {text: elem[cell]}).appendTo(row.find(`td[column_name=${cell}]`));
                    }

                    row.appendTo(table);
                }

                $(`#${func.parent_tab} .block-content`).html(table);
            })
        }
    }
}

export function openPopupWindow(id) {
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

export function closePopupWindow(popupId) {
    $(`#${popupId}, #popup_background`).fadeOut(200);
    $('#popup_report .popup-content').empty();
    $('.main-menu li').removeClass('active');
    $('#home_page').addClass('active');
}

export function createPopupLayout(name, id) {
    const popup = $('<div>', { id: 'add_news_popup', class: 'popup-window' }).append(
        $('<div>', { class: 'popup-header' }).append(
            $('<div>', { class: 'popup-name', text: name }),
            $('<div>', { class: 'popup-close' }).append(
                $('<i>', { class: 'material-icons', title: 'Закрыть', text: 'close'}).on('click', () => {closePopupWindow(id)})
            )
        ),
        $('<div>', { class: 'popup-content' })
    )

    return popup;
}