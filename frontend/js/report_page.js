$(document).ready(function () {

    let fontSize = $('#font_size_select').val();

    $('#font_size_select').on('change', function() {
        fontSize = $(this).val();
        $('#report_content, #report_content table').css({'font-size':`${fontSize}px`});
    });

    $('#print_btn').on('click', () => {

        var printWindow = window.open('', 'PRINT');
        let printingContent = document.querySelector('#report_content').innerHTML;
        printWindow.document.write(`<html><head><script src="/js/jquery-3.4.1.min.js"></script><script src="/js/print_report_page.js"></script><style type="text/css">body, table {font-size: ${fontSize}px;} .report-table {border-collapse: collapse; width: 100%; page-break-after: always} .report-table th, .report-table td {border: 1px solid black;}</style>`);
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