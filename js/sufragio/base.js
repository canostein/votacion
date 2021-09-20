var get_url = null;
var patio = null;

var confirmada = false;
var pagina_anterior = null;
var unico_modo = false;
var _categoria_adhesion = null;
var _candidatos_adhesion = null;
var _es_ultima_adhesion = null;
var _consulta_actual = null;
var aceptar_clicks = true;
var _votando = false;


function load_patio(){
    /* Prepara, carga e inicializa la instancia de Patio. */
    if(patio === null){
        if(constants.confirmacion_lateral) {
            contexto = confirmacion_barra_vertical.concat(contexto);
        } else {
            contexto = confirmacion_barra_horizontal.concat(contexto);
        }
        patio = new Patio($("#contenedor_pantallas"), pantallas, contexto,
                            "pantallas/sufragio");

        if(!constants.mostrar_barra_seleccion){
            var tiles = patio.pantalla_candidatos.context_tiles;
            tiles.splice(tiles.indexOf("contenedor_der"), 1);
        }
        if(constants.confirmacion_lateral) {
            var tiles = patio.pantalla_confirmacion.context_tiles;
            tiles.splice(tiles.indexOf("barra_opciones"), 1);
            tiles.splice(tiles.indexOf("alto_contraste"), 1);
        }
    }
}

function load_css(flavor){
    /* Carga el CSS del flavor. */
    var elem = document.createElement('link');
    elem.rel= 'stylesheet';
    elem.href= constants.PATH_TEMPLATES_FLAVORS + flavor +  '/flavor.css';
    document.getElementsByTagName('head')[0].appendChild(elem);
}

function document_ready(){
    /*
     * funcion que se ejecuta una vez que se carga la pagina.
     */
    preparar_eventos();
    get_url = get_url_function("voto");
    //$(document).bind("dragstart", function(event){event.target.click();});
    load_ready_msg();
    bindear_botones();
    registrar_helper_colores();
    registrar_helper_imagenes();
    registrar_helper_i18n();
    registrar_helper_estado_tacha();
    registrar_helper_estado_preferencia();
    registrar_helper_mostrar_data_candidato();

    evitar_clics_seguidos();
}

function evitar_clics_seguidos() {
    // FunciÃ³n que registra un listener para cancelar los clics muy seguidos en el mismo lugar.
    // Cancela los clics realizados en a menos de 50px en x o y, y a menos de 5 segundos del clic anterior.
    var last_click = null;
    document.body.addEventListener('click', function (event) {
        if (last_click === null) {
            last_click = {
                timeStamp: event.timeStamp,
                x: event.x,
                y: event.y
            };
        } else {
            var dx = Math.abs(last_click.x - event.x);
            var dy = Math.abs(last_click.y - event.y);
            var timeDiff = event.timeStamp - last_click.timeStamp;
            let minTimeDiff = 2500;
            let minYDiff = 50;
            let minXDiff = 50;
            if(constants.asistida){
                minTimeDiff = 1500;
                minYDiff = 40;
                minXDiff = 40;
            }
            if ((event.x <= 0 && event.y <= 0) || (dx < minXDiff && dy < minYDiff && timeDiff < minTimeDiff)) {
                event.preventDefault();
                event.stopImmediatePropagation();
            } else {
                last_click = {
                    timeStamp: event.timeStamp,
                    x: event.x,
                    y: event.y
                };
            }
        }
    }, true);
}

//registro en el evento de ready el callback "document ready"
$(document).ready(document_ready);

function mostrar_loader(){
    /* Muestra el loader. */
    setTimeout(cargar_cache, 300);
    patio.loading.only();
}

function ocultar_loader(){
    /* Oculta el loader. */
    setTimeout(inicializar_interfaz, 300);
}

function set_unico_modo(estado){
    /*
     * establece la variable "unico modo" que marca que se vota siempre por
     * lista completa.
     */
    patio.btn_regresar.show = function(){};
    unico_modo = estado;
}

function preload(images){
    /* Precarga las imagenes de las candidaturas. */
    $(images).each(function() {
        $('<img />').attr('src', "imagenes_candidaturas/" + constants.juego_de_datos + "/" + this);
    });
}

/*
 * Pollyfill de Startswith
 * https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/String/startsWith#Polyfill
 */

if (!String.prototype.startsWith) {
    String.prototype.startsWith = function(searchString, position){
        position = position || 0;
        return this.substr(position, searchString.length) === searchString;
    };
}