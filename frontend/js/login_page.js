function loginSubmit() {
    $("#login_form").submit(function (event) {
        event.preventDefault();
    });
    let email = document.getElementById("login_email").value;
    let password = document.getElementById("login_password").value;
    $.ajax({
        type: "POST",
        url: "/",
        data: encodeURI("email=" + email + "&password=" + password),
        success: function (data) {
            console.log(data);
            if (data == "no_usr_or_pwd") {
                $('#login_alert').text('Неверный Email или Пароль').fadeOut(200).fadeIn(200);
            }
            else if (data == "usr_dsbld") {
                $('#login_alert').text('Учетная запись заблокирована').fadeOut(200).fadeIn(200);
            }
            else {
                location.assign('/main');
            }
        }
    });
}

$(document).ready(function() {
    const colorTheme = localStorage.getItem('color_theme');

    if (colorTheme) {
        if ( colorTheme == 'dark') {
            $(document.documentElement).attr('theme', 'dark');
        }
    }

    $('#page_body').show();

    $('#remember_me_checkbox').on('click', function() {
        const label = $('#remember_me .checkbox-container');
        const checkbox = $('#remember_me .checkbox-container .checkmark');
        if ($(this).prop('checked')) {
            label.addClass('active');
            checkbox.addClass('active');
        }
        else {
            label.removeClass('active');
            checkbox.removeClass('active');
        }
    });
})

function createContentLoader(parentDivSelector) {
    $('<div>', {class: 'content-loading', parent_div: parentDivSelector}).append(
        $('<div>', {class: 'loading'}).append(
            $('<div>', {class: 'loading-circle'}),
            $('<div>', {class: 'loading-header', text: 'Загрузка...'})
        )
    ).appendTo($(parentDivSelector));
}

function removeContentLoader(parentDivSelector, contentDivSelector) {
    $(`[parent_div='${parentDivSelector}']`).remove();
    $(contentDivSelector).show();
}