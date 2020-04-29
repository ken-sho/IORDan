$(document).ready(function() {
    const table = $('#registry_table');
    table.find('th:last-child').remove();
    table.find('td:last-child').remove();

    window.print();
    setTimeout(function(){window.close();},10);
});