$(document).ready(function () {    
    let printNotation = sessionStorage.getItem('printNotation');
    const fontSize = sessionStorage.getItem('report_print_font_size');

    $('body, table').css({'font-size': `${fontSize}px`})

    if (printNotation !== '' && printNotation !== 'null') {
        let tableFooter = `<tfoot><tr><td><div class="report-print-footer">${printNotation}</div><div class="page-footer-space"></div></td></tr></tfoot>`
        $('#report_print').html(`<table id="printing_content"><tbody><tr><td>${$('#report_print').html()}</td></tr></tbody>${tableFooter}</table>`);
    }

    // window.print();
    // setTimeout(function () { window.close(); }, 10);

});