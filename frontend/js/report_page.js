$(document).ready(function () {

    $('#print_btn').on('click', () => {

        var printWindow = window.open('', 'PRINT');
        let printingContent = document.querySelector('#report_content').innerHTML;
        printWindow.document.write('<html><head><link href="/css/style_main_page.css" rel="stylesheet" type="text/css"><script src="/js/jquery-3.4.1.min.js"></script><script src="/js/print_report_page.js"></script>');
        printWindow.document.write('</head><body id="report_print">');
        printWindow.document.write(printingContent);
        printWindow.document.write('</body></html>');

        printWindow.document.close(); // necessary for IE >= 10
        printWindow.focus(); // necessary for IE >= 10*/
    });
});