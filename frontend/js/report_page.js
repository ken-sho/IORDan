$(document).ready(function () {

    let fontSize = $('#font_size_select').val();
    sessionStorage.setItem('report_print_font_size', fontSize);

    $('#font_size_select').on('change', function() {
        fontSize = $(this).val();
        sessionStorage.setItem('report_print_font_size', fontSize);
        $('#report_content, #report_content table').css({'font-size':`${fontSize}px`});
    });

    $('#print_btn').on('click', () => {

        var printWindow = window.open('', 'PRINT');
        let printingContent = document.querySelector('#report_content').innerHTML;
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
});