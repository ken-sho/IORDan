$(document).ready(function() {
    let tableFooter = '<tfoot><tr><td><div class="report-print-footer"><div>Распечатано с https://intelgradplus.ru</div><div>(ПК "ИОРДан" Веб-модуль "Дебиторская задолженность" ООО "Интел-Град Плюс")</div></div><div class="page-footer-space"></div></td></tr></tfoot>'
    $('#report_print').html(`<table id="printing_content"><tbody><tr><td>${$('#report_print').html()}</td></tr></tbody>${tableFooter}</table>`);
    window.print();
    setTimeout(function(){window.close();},10);
});