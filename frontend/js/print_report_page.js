$(document).ready(function() {
    let printNotation = sessionStorage.getItem('printNotation');

    if (printNotation !== '') {
        let tableFooter = `<tfoot><tr><td><div class="report-print-footer">${printNotation}</div><div class="page-footer-space"></div></td></tr></tfoot>`
        $('#report_print').html(`<table id="printing_content"><tbody><tr><td>${$('#report_print').html()}</td></tr></tbody>${tableFooter}</table>`);
    }

    window.print();
    setTimeout(function(){window.close();},10);
});