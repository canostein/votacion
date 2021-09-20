$(document).ready(inicializacion);


function inicializacion() {

    $.history.init(function(hash){
        if(hash == "") {
            inicio_demo();
        } else {
            resetear_divs();
            $("#" + hash).show();
        }
    },{ unescape: ",/" });

    $(".paso button.next").bind('click',mostrar_siguiente_paso); 
    $("button.prev").bind('click',volver_demo); 
    $(".ubicacion-destino").bind('click', mostrar_demo_ubicacion);
    $("#paso-5").bind('click',mostrar_final);
    $("#reset").bind('click',inicio_demo);
    $(".cerrar-popup").bind('click', cerrar_popup);
    igualador_alto(".boton-ubicacion");
}

$(window).resize(function() {
});


function empezar_demo() {
    $.history.load("paso-1");
    $("#bienvenido").unbind('click');
    $("#empezar").unbind('click');
    $("body").attr("id","");
}

function mostrar_siguiente_paso() {
    var next = $(this).parent().next(".paso");
    if(typeof(next.attr("id")) != "undefined") {
        $.history.load(next.attr("id"));
    }
    igualador_alto(".boton-ubicacion");  
}

function volver_demo() {
    var ubicacion = window.localStorage.getItem('ubicacion');
    if("ubicacion" != "null") {
        window.location = "sufragio.html?ubicacion=" + ubicacion;
    } else {
        resetear_divs();
        $.history.load("paso-3");
    }
}

function mostrar_demo_ubicacion() {
    var ubicacion = $(this).attr('id');
    window.localStorage.setItem('ubicacion', ubicacion);
    window.location = "sufragio.html?ubicacion=" + ubicacion;
}

function mostrar_final() {
    $("body").attr("id","final");
    $.history.load("agradecimiento");
}

function inicio_demo() {
    resetear_divs();
    $.history.load("");
    $("body").attr("id","final");
    $("#bienvenido").show();  
    $("#empezar").show(); 
    //$("#bienvenido").bind('click',empezar_demo);
    $("#empezar").bind('click',empezar_demo);
}

function resetear_divs() {
    $("#contenedor-ayuda > div").hide();
    $(".franja").hide();
}

function  igualador_alto(selector) {
    //pasar selector css, ejemplo: .boton_ubicacion
    $(selector).height("auto");
    var alto = 0;
    $(selector).each( function(index) {
        if(alto< $(this).height()) {
            alto = $(this).height();
        }
    }); 
    $(selector).height(alto);
}


function cerrar_popup(){
    $(".lightbox").fadeOut();
}