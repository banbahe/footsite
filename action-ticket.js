const limitFiles = 5242880;

let ToogleDiv = document.getElementById('divDisable');
let Name = document.getElementById('nombre');
let NumberTransaction = document.getElementById('numeroTransaccion');
let ImgTransaction = document.getElementById('imgTransaccion');
let TemrsCheckBox = document.getElementById('terms-conditions');
let Telephone = document.getElementById('telefono');
let Email = document.getElementById('correo');
    
NumberTransaction.addEventListener('change', function (e) {
    //if (e.target.value.length == 0) {
    //    e.target.focus();
    //    validateMessage('Por favor, ingresa un número de transacción.');
    //}
    if (e.target.value.length != 16) {
        e.target.focus();
        validateMessage('El número de transacción debe tener 16 dígitos.');
    }
});

TemrsCheckBox.addEventListener('change', function (e) {
    ValidateForm();
});

$('.register-form :input').change(function () {
    ValidateForm();
});

$('.g-recaptcha').on('click', function () {
    playLoader();
});

var tryUser = 0;


$('#nombre').alphanum({
    allowNumeric: false,
    allowLatin: true,
    maxLength: 100,
    allowSpace: true,
});

$('#correo').alphanum({
    allowNumeric: true,
    allowLatin: true,
    maxLength: 100,
    allowSpace: false,
    allow: '@.-_',
});

$('#numeroTransaccion').alphanum({
    allowNumeric: true,
    allowLatin: false,
    maxLength: 16,
});

$('#telefono').alphanum({
    allowNumeric: true,
    allowLatin: false,
    maxLength: 10,
});

// it's possible to delete
function onValidate() {
    validateCard();
}

function validateMessage(message) {
    alertify.alert(message);
    grecaptcha.reset();
    quitLoader();
    return false;
}

function getModelAsFormData(data) {
    var dataAsFormData = new FormData();

    Object.keys(data).forEach((key) => {
        dataAsFormData.append(key, data[key]);
    });
    return dataAsFormData;
}

function validateCard() {
    let message = '';
    let temrs = $('#terms-conditions');
    let inputImgTransaction = $('#imgTransaccion');

    //let inputName = $('#nombre');
    //let inputTelefono = $('#telefono');
    //let inputTarjeta = $('#numeroTransaccion');
    //let inputImagenTarjeta = $('#arcTarj');
    //let inputCorreo = $('#correo');
    //if (tryUser === 1) alertify.alert('Espera un momento, estamos procesando tu participación.');
    //var tryUser = 1;

    if (Name.value === '') {
        message += 'Por favor, ingresa tu nombre completo.';
        validateMessage(message);
        return false;
    }

    if (inputCorreo.val() === '') {
        message += 'Por favor, ingresa un correo electronico válido.';
        validateMessage(message);
        return false;
    }

    if (Telephone.value.length > 0) {
        if (Telephone.value.length < 10) {
            message += 'Por favor, ingresa un teléfono válido.';
            validateMessage(message);
            return false;
        }
    }

    if (NumberTransaction.value === '') {
        message += 'Por favor, ingresa un número de transacción.';
        validateMessage(message);
        return false;
    }

    if (ImgTransaction.value === '') {
        message += 'Por favor, ingresa la imagen de tu transacción.';
        validateMessage(message);
        return false;
    }

    if (!temrs.is(':checked')) {
        message += 'Debes aceptar las Bases y Condiciones.';
        validateMessage(message);
        return false;
    }

    var data = {
        Name: Name.value,
        Email: Email.value,
        PhoneNumber: Telephone.value,
        Transaction: NumberTransaction.value,
        TransactionFile: inputImgTransaction[0].files[0],
        TermsAndConditions: temrs.is(':checked'),
        Token: $('#g-recaptcha-response').val()

        // OG
        //Name: inputName.val(),
        //Email: inputCorreo.val(),
        //PhoneNumber: inputTelefono.val(),
        //Card: inputTarjeta.val(),
        //Ticket: numberCard.val(),
        //Token: $('#g-recaptcha-response').val(),
        //TermsAndConditions: temrs.is(':checked'),
        //CardFile: inputImagenTarjeta[0].files[0],
        //TicketFile: inputImagenTrans[0].files[0],
    };

    $.ajax({
        url: route('validar'),
        data: getModelAsFormData(data),
        cache: false,
        contentType: false,
        processData: false,
        async: false,
        method: 'POST',
        mimeType: 'multipart/form-data',
        timeout: 4500,
        beforeSend: function () {
            ToggleNextBtn(false);
            if (tryUser === 1) alertify.alert('Espera un momento, estamos procesando tu participación.');
            var tryUser = 1;
        },
        success: function (response) {
            response = JSON.parse(response);
            try {
                if (response.status === 0) {
                    location.href = route(response.content);
                    cerrarLoader();
                    return false;
                }

                if (response.status === 1) {
                    alertify.alert(response.content);
                } else {
                    alertify.alert(response.content);
                    numberCard.val('');
                    if (temrs.is(':checked')) temrs.click();
                }
                tryUser = 0;
                cerrarLoader();
            } catch (ex) {
                console.log('} catch (ex) {');
                alertify.error('Ocurrió un error, inténtalo nuevamente.');
                tryUser = 0;
                cerrarLoader();
            }
            grecaptcha.reset();
        },
        error: function (xhr, status, error) {
            console.log('error: function (xhr, status, error) {');
            ToggleNextBtn(true);
            alertify.alert('Ocurrió un error, inténtalo nuevamente.');
        },
        complete: function () {
            ToggleNextBtn(true);
            grecaptcha.reset();
            cerrarLoader();
        },
    });
    clearInterval(checkConnection);
    ToggleNextBtn(true);
    grecaptcha.reset();
    cerrarLoader();
}

function ValidateForm() {
    if (
        Name.value != '' &&
        Card.value != '' &&
        ImagenTarjeta.value != '' &&
        ImagenTarjeta.value != 'Seleccionar imagen' &&
        Ticket.value != '' &&
        ImagenTrans.value != '' &&
        ImagenTrans.value != 'Seleccionar imagen' &&
        TemrsCheckBox.checked
    ) {
        ToggleNextBtn(true);
    } else {
        ToggleNextBtn(false);
    }
}

function ToggleNextBtn(flag) {
    if (flag == true) {
        ToogleDiv.style.pointerEvents = 'auto';
        ToogleDiv.style.opacity = '';
    } else {
        ToogleDiv.style.pointerEvents = 'none';
        ToogleDiv.style.opacity = '0.5';
    }
}

function ticketValidation() {
    var fileInput = document.getElementById('arcTarj');
    var filePath = fileInput.value;
    var allowedExtensions = /(.jpg|.jpeg|.png)$/i;
    if (!allowedExtensions.exec(filePath)) {
        alertify.alert('Por favor sube solo archivos con extensiones .jpeg / .jpg / .png.');
        fileInput.value = '';
        return false;
    }
}

function tarjetaValidation() {
    var fileInput = document.getElementById('arcTrans');
    var filePath = fileInput.value;
    var allowedExtensions = /(.jpg|.jpeg|.png)$/i;
    if (!allowedExtensions.exec(filePath)) {
        alertify.alert('Por favor sube solo archivos con extensiones .jpeg / .jpg / .png.');
        fileInput.value = '';
        return false;
    }
}