$(document).ready(function () {
    const adress = $('html').attr('adress');
    const personName = $('html').attr('person_name');
    const reportName = $('html').attr('report_name');

    let fontSize = $('#font_size_select').val();
    sessionStorage.setItem('report_print_font_size', fontSize);

    $('#font_size_select').on('change', function() {
        fontSize = $(this).val();
        sessionStorage.setItem('report_print_font_size', fontSize);
        $('#report_content, #report_content table').css({'font-size':`${fontSize}px`});
    });

    const printingContent = document.querySelector('#report_content').innerHTML;

    $('#print_btn').on('click', () => {

        var printWindow = window.open('', 'PRINT');
        printWindow.document.write(`<html><head><script src="/js/jquery-3.4.1.min.js"></script><script src="/js/print_report_page.js"></script><link href="/css/style_print_report_page.css" rel="stylesheet" type="text/css">`);
        printWindow.document.write('</head><body id="report_print">');
        printWindow.document.write(printingContent);
        printWindow.document.write('</body></html>');

        printWindow.document.close(); // necessary for IE >= 10
        printWindow.focus(); // necessary for IE >= 10*/
    });

    $('#exit_btn').on('click', () => {
        window.close();
    });

    $('<div>', {id: 'report_name'}).append(
        $('<p>').append(
            $('<i>', {class: 'material-icons', text: 'home'}),
            $('<div>', {text: adress})
        ),
        $('<p>').append(
            $('<i>', {class: 'material-icons', text: 'person'}),
            $('<div>', {text: personName})
        ),
        $('<p>').append(
            $('<i>', {class: 'material-icons', text: 'event_note'}),
            $('<div>', {text: reportName})
        )
    ).prependTo('#header')

    const toExcel = ($('html').attr('to_excel') == 'true');
    if (toExcel) {
        $('<button>', {class: 'excel-btn', text: 'Excel', title: 'Конвертировать справку в Excel'}).on('click', () => {
            const fileName = `${adress}, ${personName}, ${reportName}}`;
            convertContentToExcel(printingContent, fileName)
        }).insertBefore('#print_btn');
    }

    function convertContentToExcel(content, fileName) {
        showPopupNotification('notification', 'Загрузка файла начнется автоматически!');
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
});