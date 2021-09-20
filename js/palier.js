function _palier_preparar_para_browser(){
    $("html").css("overflow", "hidden");
    resize();
    detect_browser();
    if((BrowserDetect.browser == "Explorer") && (BrowserDetect.version <= 8)) {
        unsupported_browser();
    } 
    document.addEventListener("touchmove", preventBehavior, false);
    //var encabezado = document.getElementById("encabezado");
    //encabezado.addEventListener("click", requestFullScreen);
    
    _palier_agregar_pointer();
}

function _palier_agregar_pointer(){
    var css = '.candidato, #accesibilidad li, #voto_blanco, .boton-barra-individual, .opcion-tipo-voto { cursor: pointer; }',
    head = document.head || document.getElementsByTagName('head')[0],
    style = document.createElement('style');

    style.type = 'text/css';
    if (style.styleSheet){
        style.styleSheet.cssText = css;
    } else {
        style.appendChild(document.createTextNode(css));
    }
    head.appendChild(style);
}

// A partir de aca son todas las cosas relacionadas a correr la aplicacion de
// sufragio en un browser en vez de en la maquina. Deteccion de browser,
// redibujado, etc.
function detect_browser(){
    BrowserDetect.init();
}

function resize(){
    document.body.style.width = 0;
    document.body.style.height = 0;
    applyTransform(getTransform());              
}

function preventBehavior(e){
    e.preventDefault();
}

function getTransform() {
		var denominador = Math.max(
			1366 / window.innerWidth,
			768 / window.innerHeight
		);

    denominador = Math.min(1, 1 / denominador);
    return 'scale(' + (denominador) + ')';
}

function applyTransform(transform) {
    document.body.style.WebkitTransform = transform;
    document.body.style.MozTransform = transform;
    document.body.style.msTransform = transform;
    document.body.style.OTransform = transform;
    document.body.style.transform = transform;
}   

function unsupported_browser(){
    var div = $("#notice"); 
    $("#seleccionar_ubicacion").hide();
    if(div.length === 0){
        constants['PATH_TEMPLATES_MODULOS'] = ""
        var template = get_template("unsupported_browser", "templates");
        $('#contenedor_izq').html($('#contenedor_izq').html() + template());
    }
    $("#notice").show();
}

var BrowserDetect = {
	init: function () {
		this.browser = this.searchString(this.dataBrowser) || "An unknown browser";
		this.version = this.searchVersion(navigator.userAgent) || this.searchVersion(navigator.appVersion) || "an unknown version";
		this.OS = this.searchString(this.dataOS) || "an unknown OS";
	},
	searchString: function (data) {
		for (var i=0;i<data.length;i++)	{
			var dataString = data[i].string;
			var dataProp = data[i].prop;
			this.versionSearchString = data[i].versionSearch || data[i].identity;
			if (dataString) {
				if (dataString.indexOf(data[i].subString) != -1)
					return data[i].identity;
			}
			else if (dataProp)
				return data[i].identity;
		}
	},
	searchVersion: function (dataString) {
		var index = dataString.indexOf(this.versionSearchString);
		if (index == -1) return;
		return parseFloat(dataString.substring(index+this.versionSearchString.length+1));
	},
	dataBrowser: [
		{
			string: navigator.userAgent,
			subString: "Chrome",
			identity: "Chrome"
		},
		{ 	string: navigator.userAgent,
			subString: "OmniWeb",
			versionSearch: "OmniWeb/",
			identity: "OmniWeb"
		},
		{
			string: navigator.vendor,
			subString: "Apple",
			identity: "Safari",
			versionSearch: "Version"
		},
		{
			prop: window.opera,
			identity: "Opera",
			versionSearch: "Version"
		},
		{
			string: navigator.vendor,
			subString: "iCab",
			identity: "iCab"
		},
		{
			string: navigator.vendor,
			subString: "KDE",
			identity: "Konqueror"
		},
		{
			string: navigator.userAgent,
			subString: "Firefox",
			identity: "Firefox"
		},
		{
			string: navigator.userAgent,
			subString: "Aurora",
			identity: "Aurora"
		},
		{
			string: navigator.vendor,
			subString: "Camino",
			identity: "Camino"
		},
		{		// for newer Netscapes (6+)
			string: navigator.userAgent,
			subString: "Netscape",
			identity: "Netscape"
		},
		{
			string: navigator.userAgent,
			subString: "MSIE",
			identity: "Explorer",
			versionSearch: "MSIE"
		},
		{
			string: navigator.userAgent,
			subString: "Gecko",
			identity: "Mozilla",
			versionSearch: "rv"
		},
		{ 		// for older Netscapes (4-)
			string: navigator.userAgent,
			subString: "Mozilla",
			identity: "Netscape",
			versionSearch: "Mozilla"
		}
	],
	dataOS : [
		{
			string: navigator.platform,
			subString: "Win",
			identity: "Windows"
		},
		{
			string: navigator.platform,
			subString: "Mac",
			identity: "Mac"
		},
		{
			   string: navigator.userAgent,
			   subString: "iPhone",
			   identity: "iPhone/iPod"
	    },
		{
			string: navigator.platform,
			subString: "Linux",
			identity: "Linux"
		}
	]

};

$.extend({
  getUrlVars: function(){
    var vars = [], hash;
    var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
    for(var i = 0; i < hashes.length; i++)
    {
      hash = hashes[i].split('=');
      vars.push(hash[0]);
      vars[hash[0]] = hash[1];
    }
    return vars;
  },
  getUrlVar: function(name){
    return $.getUrlVars()[name];
  }
});


function requestFullScreen(){
	if (fullScreenElement()){
		exitFullScreen();
	} else {
		triggerFullScreen();
	}
}

function triggerFullScreen(){
	var elementDom = document.getElementsByTagName('body')[0];
	elementDom.requestFullscreen = elementDom.requestFullscreen ||
	elementDom.mozRequestFullScreen || elementDom.webkitRequestFullscreen ||
	elementDom.msRequestFullscreen;

	elementDom.requestFullscreen();
}

function exitFullScreen(){
	var elementDom = document;
    elementDom.exitFullscreen = elementDom.exitFullscreen || document.mozCancelFullScreen || elementDom.webkitExitFullscreen || elementDom.msExitFullscreen;
    elementDom.exitFullscreen();
}


function fullScreenElement(){
	var element = document.fullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement || document.msFullscreenElement;
	return element;
}
// Para que se comporte mas parecido a Zaguan
jQuery.ajaxSetup({async:false});

function get_url_function() {
   /* hacemos override de esto para hacer que no le pegue a ninguna URL*/ 
}

function click_si(){
    // Hacemos override del click_is para adecuar al comportamiento del
    // simulador.
    var ubic_preseteada = $.getUrlVar('ubicacion');   
    if (typeof(ubic_preseteada) != "undefined") {
        window.location = "index.html#paso-3";
    } else {
        history.go(0);
    }
}
function run_op(operacion, data){
    // Misma implementacion que zaguan.js
    func = window[operacion];
    data = JSON.parse(data);
    func(data);
}

function log(msg){
    send('log', msg);
}

function send(action, data) {
    // Implementamos send para que corra la accion de palier.
    _palier_get_action(action, data);
}

function _palier_load_data(){
    /*
     *  Trae los datos de la eleccion y se lo manda al "cargar_datos" del local
     *  controller. Simulando lo que harÃ­a el controller.py del modulo sufragio
     *  via Zaguan.
     */
    var controller_data = {};
    $.getJSON("./datos/" + ubicacion + "/Categorias.json", {}, 
        function(data){
            sortJsonArrayByProperty(data, "posicion");
            controller_data.categorias = data;
        }
    );
    $.getJSON("./datos/" + ubicacion + "/Candidaturas.json", {}, 
        function(data){
            controller_data.candidaturas = data;
        }
    );
    $.getJSON("./datos/" + ubicacion + "/Agrupaciones.json", {}, 
        function(data){
            controller_data.agrupaciones = data;
        }
    );
    $.getJSON("./datos/" + ubicacion + "/Boletas.json", {}, 
        function(data){
            controller_data.boletas = data;
        }
    );
    cargar_datos(controller_data);
}
// Si es el simulador generado para una ubicacion especifica se hace un replace
// de $default_ubicacion por la ubicacion en el generador de simulador
var ubicacion = "$default_ubicacion";

function action_get_ubicacion(){
    /*
    * Maneja la inicializacion de una ubicacion del simulador.  
    */ 
    var ubic_preseteada = $.getUrlVar('ubicacion');
    if (typeof(ubic_preseteada) != "undefined") {
        ubicacion = ubic_preseteada;    
        action_inicio();
        // _palier_header_ubicacion(ubicacion);
        _palier_cargar_pantalla_inicial();
    } else if (ubicacion != "$default_ubicacion") {
        action_inicio();
        _palier_cargar_pantalla_inicial();
    } else { 
        $.getJSON("./ubicaciones.json", {}, callback_ubicaciones);
    }
}

function callback_ubicaciones(data){
    /* Si se vota un solo juego de datos/ubicaciÃ³n salteamos la seleccion. */
    if(data.length > 1){
        _palier_mostrar_menu_ubicaciones(data);
    } else {
        _palier_cargar_ubicacion(data[0][2]);
    }
}

function _palier_mostrar_menu_ubicaciones(data){
    /*
    * Muestra el menu de ubicaciones.
    * */
    var div = $("#seleccionar_ubicacion");
    if(div.length === 0){
        constants['PATH_TEMPLATES_MODULOS'] = ""
        var template = get_template("botones_ubicaciones", "templates") 
        var html = template({"data": data, "dos_cols": data.length > 20});
        $('#contenedor_izq').html($('#contenedor_izq').html() + html);
        $("#ubicaciones").on("click", "div.candidato", _palier_click_ubicacion);
    }
    $("#seleccionar_ubicacion").show();
    patio.barra_opciones.hide();
}

function _palier_click_ubicacion(){
    /*
     * Maneja el click en una ubicacion del menu del simulador.
     */
    var parts = this.id.split("_");
    _palier_cargar_ubicacion(parts[1]);
}

function _palier_cargar_ubicacion(nueva_ubic){
    /*
     * Carga la ubicacion y arranca el simulador
     */
    $("#seleccionar_ubicacion").hide();
    ubicacion = nueva_ubic;    
    action_inicio();
    // _palier_header_ubicacion(ubicacion);
    _palier_cargar_pantalla_inicial();

    bindear_botones();
}

// function _palier_header_ubicacion(cod_ubicacion){
//     /*
//      * Modifica el header de la ubicacion especialmente para el simulador
//      */
//     $("body").attr('data-ubicacion', cod_ubicacion);
//     $.getJSON("./ubicaciones.json").done(function(data){
//         data.forEach(function(element,index,array){
//             if(element[2] == cod_ubicacion) {
//                 if(element[0] != ""){
//                    $("#_txt_titulo").text(element[0] + " - " + element[1]);
//                 } else {
//                    $("#_txt_titulo").text(element[1]);
//                 }
//                 $("#_txt_fecha").text("ElecciÃ³n de demostraciÃ³n - Uso no oficial");
//             }
//         });
//     });
// }

function action_inicio(){
    /*
     * Carga las constants de la ubicacion.
     */
   $.getJSON("./constants/" + ubicacion +  ".json", {}, callback_constants);
}

function callback_constants(data, blah){
    set_constants(data);
}
function _palier_registar_helpers(){
    registrar_helper_colores();
    registrar_helper_imagenes();
    registrar_helper_i18n();
    registrar_helper_mostrar_data_candidato();
}

function _palier_get_action(action, data){
    /* 
    * Simula ser el controller.py del modulo sufragio 
    */

    //console.log("getting action" + action, data);
    switch(action){
      case "document_ready":
          _palier_registar_helpers();
          action_get_ubicacion();
          break;   
      case "prepara_impresion":
          break;
      case "confirmar_seleccion":
          break;
      default:
          //console.log(action + " no implementado")

    }

    // Me fijo si tengo incluidas las developer tools del 'web_server'.
    try{
        devel_tools_callback();
    } catch(error){
        /* */
    }
}

function _palier_cargar_pantalla_inicial(){
    /*
     * Arranca carga la pantalla inicial de votacion haciendo un para de cosas
     * especificas de Palier que Zaguan hace de otra manera.
     */
    _palier_load_data();
    patio.pantalla_modos.add_click_event("callback_click");
    $("#si_confirmar_voto").unbind();
    patio.si_confirmar_voto.callback_click = click_si;
    patio.si_confirmar_voto.add_click_event("callback_click");
    patio.no_confirmar_voto.add_click_event("callback_click");
    cargar_pantalla_inicial();
}

function _palier_document_ready(){
    /*
     * Callback de document_ready que imita el evento de zaguan"/
     */
    if(typeof(prevenir_resize) == "undefined"){
        // Old IE compat
        var func = null;
        if(window.addEventListener){
            func = window.addEventListener;
        } else {
            func = window.attachEvent;
        }

        func('resize', function (e) { 
            resize();
        }, false);                                       

        _palier_preparar_para_browser();
    }
}

$(document).ready(_palier_document_ready);