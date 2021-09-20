function popular_html(){
    var template_header = get_template("encabezado", "partials");
    var html_header = template_header({'voto': true});
    $("#encabezado").html(html_header);
}

/**
 * FunciÃ³n que devuelve un nombre de clase css de acuerdo a la cantidad de candidatos.
 * El nombre de la clase se arma con el prefijo mÃ¡s el sufijo correspondiente.
 * El sufijo correspondiente es el primer sufijo de ``sufijos_existentes`` que es igual o 
 * mayor al valor de ``cantidad_candidatos``. Si no hay ningÃºn sufijo que cumpla con 
 * esa condiciÃ³n se devuelve el ultimo sufijo de la lista de ``sufijos_candidatos``.
 * Ejemplos: Si la lista de sufijos es [2, 3, 4, 6, 9, 12, 16, 20, 24, 30, 36] y el 
 * prefijo es "max", si la cantidad de candidatos es 24 la salida de la funciÃ³n es
 * "max24"; si es 25, "max30"; si es 31, "max36" y si es 42, "max36".
 * @param {number} cantidad_candidatos - Cantidad de candidatos a mostrar en pantalla.
 * @param {string} prefijo - prefijo de la clase css. 
 * @param {number[]} sufijos_existentes - Sufijos existentes de clases css.
 */
const classname_segun_candidatos = (
    cantidad_candidatos, 
    prefijo="max", 
    sufijos_existentes=constants.numeros_templates
) => prefijo + (
    sufijos_existentes
        .slice() // genera una copia (para no mutar el arreglo original)
        .sort((a, b) => a - b) // ordena el arreglo de menor a mayor
        .find(
            i => i >= cantidad_candidatos
        ) || sufijos_existentes.slice(-1)[0] 
        // toma el primer elemento que satisface la condicion, de
        // no encontrar uno, devuelve el Ãºltimo elemento del arreglo.
)

function get_template_confirmacion(num_categorias){
    /*
     * Devuelve el nombre de la clase de CSS para establecer el tamaÃ±o de los
     * paneles en la confirmacion segun la cantidad de categorias a mostrar.
     * Argumentos:
     * num_categorias -- la cantidad de paneles a mostrar.
     */
    const templates_numeros = [1, 2, 3, 4, 5, 6, 8, 9, 10]; // @TODO: agregar a constantes
    return classname_segun_candidatos(
        num_categorias,
        "confirmacion",
        templates_numeros
    );
}

function crear_item_lista(boleta, normal){
    /*
     * Crea el boton para una lista.
     * Argumentos:
     * lista -- un objeto con la informacion de la lista para la que se quiere
     *   crear el boton.
     */
    var template = get_template("lista");
    var id_lista = 'lista_';
    if(normal){
        id_lista += boleta.lista.id_candidatura;
    } else {
        id_lista += boleta.id_candidatura;
    }
    var candidatos = get_candidatos_boleta(boleta);

    var modo = get_modo();
    var seleccionado = "";
    if(modo == "BTN_COMPLETA" && _categorias !== null){
        if(_lista_seleccionada == boleta.lista.codigo){
          seleccionado = "seleccionado";
        }
    }
    template_data = main_dict_base(id_lista);
    template_data.lista = normal?boleta.lista:boleta;
    template_data.normal = normal;
    template_data.seleccionado =  seleccionado;
    template_data.candidatos = candidatos;
    template_data.cantidad_candidatos = candidatos.length;

    var item = template(template_data);
    return item;
}

function crear_item_consulta_popular(candidato){
    /*
     * Crea el boton para una lista.
     * Argumentos:
     * lista -- un objeto con la informacion de la lista para la que se quiere
     *   crear el boton.
     */

    var template = get_template("consulta_popular");
    var id_candidato = 'candidato_' + candidato.id_umv;
    var imagenes_candidatos = [];
    var data_candidatos = [];

    var modo = get_modo();
    var seleccionado = "";

    //Me fijo si el candidato estÃ¡ seleccionado
    for(var l in _seleccion){
        for(var m in _seleccion[l]){
            if(candidato.id_umv == parseInt(_seleccion[l][m])){
                seleccionado = true;
            }
        }
    }

    var template_data = {
        candidato: candidato,
        id_boton: id_candidato,
        seleccionado: seleccionado,
    };

    var item = template(template_data);
    return item;
}

function crear_item_pantalla_preferencias(candidato){
    /*
     * Crea el boton para preferir candidatos
     * [ ] Perez, Juan
     */

    var template = get_template("preferencia_candidato");
    var id_candidato = 'candidato_' + candidato.id_candidatura;
    var imagenes_candidatos = [];
    var data_candidatos = [];

    var modo = get_modo();
    var seleccionado = "";

    var template_data = {
        candidato: candidato,
        id_boton: id_candidato,
        seleccionado: seleccionado,
    };

    var item = template(template_data);
    return item;
}

function crear_item_pantalla_tachas(candidato){
    /*
     * Crea el boton para tachar candidatos
     * ---Perez, Juan
     */

    var template = get_template("tacha_candidato");
    var id_candidato = 'candidato_' + candidato.id_candidatura;
    var imagenes_candidatos = [];
    var data_candidatos = [];

    var modo = get_modo();
    var seleccionado = "";

    var template_data = {
        candidato: candidato,
        id_boton: id_candidato,
        seleccionado: seleccionado,
    };

    var item = template(template_data);
    return item;
}

function crear_item_partido(partido, seleccionado){
    /*
     * Crea el boton para un partido.
     * Argumentos:
     * partido -- un objeto con los datos del partido para el que se quiere
     *   crear el boton.
     */
    var template = get_template("partido");
    var extra_classes = "";

    var id_lista = 'partido_' + partido.codigo;
    var path_imagen_agrupacion = get_path_partido(partido.imagen);
    var img_cand = [];

    if(constants.mostrar_fotos_candididatos_boton_partido){
        var filtro = {cod_alianza: partido.codigo}
        if(get_modo() == "BTN_CATEG"){
            filtro.cod_categoria = get_categoria_actual().codigo;
        }
        var candidaturas = local_data.candidaturas.many(filtro);
        for(var i in candidaturas){
            var candidato = candidaturas[i];
            img_cand.push(candidato.codigo);
        }
    }

    if(seleccionado){
        extra_classes += " seleccionado";
    }

    var template_data = {
        id_boton: id_lista,
        partido: partido,
        path_imagen_agrupacion: path_imagen_agrupacion,
        imagenes_candidatos: img_cand,
        extra_classes: extra_classes,
    };

    var item = template(template_data);
    return item;
}

function crear_item_candidato(candidato, seleccionado, template_name) {
    /* Crea el contenido del boton de un candidato. */
    var extra_html = "";
    var extra_classes = "";
    var id_candidato = "candidato_" + candidato.id_umv;

	const cargos_multiples = ["PVM", "PVP"]

    template_name = cargos_multiples.includes(candidato.cod_categoria)
        ? "candidato_multiple"
        : template_name;

    var template = get_template(template_name);

    //Si el partido y la lista se llaman igual no muestro la lista esto fue
    //agregado en Salta y puede ser que en otros lados no quieran este
    //comportamiento
    if (
        constants.no_repetir_lista_partido_iguales &&
        typeof candidato.partido !== "undefined" &&
        typeof candidato.lista !== "undefined" &&
        candidato.lista.nombre == candidato.partido.nombre
    ) {
        nombre_lista = false;
    } else if (typeof candidato.lista === "undefined") {
        nombre_lista = false;
    } else {
        nombre_lista = candidato.lista.nombre;
    }

    if (
        candidato.categorias_hijas !== undefined &&
        candidato.categorias_hijas.length
    ) {
        extra_classes += " hijos_" + candidato.categorias_hijas.length;
        extra_html += crear_categorias_hijas(candidato.categorias_hijas);
    }

    if (seleccionado) {
        extra_classes += " seleccionado";
    }

    //Armo el template con los datos del candidato
    var template_data = main_dict_candidato(
        candidato,
        id_candidato,
        "boton_candidato"
    );
    template_data.extra_classes = extra_classes;
    template_data.extra_html = extra_html;
    template_data.nombre_lista = nombre_lista;

    const es_candidato_pvm =
        candidato.cod_categoria === "PVM" && !template_data.blanco;
    template_data.es_pvm = es_candidato_pvm;
    if (es_candidato_pvm) template_data = inyectar_data_pvm(template_data);
    const es_candidato_pvp =
        candidato.cod_categoria === "PVP" && !template_data.blanco;
    template_data.es_pvp = es_candidato_pvp;
    if (es_candidato_pvp) template_data = inyectar_data_pvp(template_data);

    var rendered = template(template_data);
    return rendered;

    function inyectar_data_pvm(template_data) {
        const cargos = ["Presidente", "Vice Pdte. 1Â°", "Vice Pdte. 2Â°"];
        template_data.candidato.lista.datos_extra = {
            ...template_data.candidato.lista.datos_extra,
            cargos: cargos_data(
                quitarCargosKey(template_data.candidato.lista.datos_extra)
            ),
        };

        return template_data;

        function cargos_data(datos_extra) {
            return [
                datos_extra.presidente,
                datos_extra.vice_1,
                datos_extra.vice_2,
            ].map((candidato, idx) => ({
                nombre: cargos[idx],
                candidato,
            }));
        }
        function quitarCargosKey(datos_extra) {
            const { cargos, ...sinCargosKey } = datos_extra;
            return sinCargosKey;
        }
    }

    function inyectar_data_pvp(template_data) {
        const cargos = ["Presidente", "Vice Pdte. 1Â°", "Vice Pdte. 2Â°"];
        const candidatos = [
            template_data.candidato.nombre,
            template_data.candidato.secundarios[0],
            template_data.candidato.secundarios[1],
        ];
        template_data.candidato.lista.datos_extra = {
            cargos: cargos_data(cargos, candidatos),
        };
        return template_data;

        function cargos_data(cargos, candidatos) {
            return cargos.map((cargo, idx) => ({
                nombre: cargo,
                candidato: candidatos[idx],
            }));
        }
    }
}

function crear_categorias_hijas(categorias_hijas, vista){
    /* crea los templates de categorias_hijas para un boton. */
    var html = "";
    var template_hija = get_template("candidato_hijo");
    for(var l in categorias_hijas){
        var cat_hija = categorias_hijas[l];
        var candidato = cat_hija[1];
        var categoria = local_data.categorias.one({codigo: cat_hija[0]});
        var data_hija = {categoria: categoria,
                         candidato: candidato};
        data_hija.secundarios = construir_candidatos(candidato, "secundarios",
                                                     vista);
        data_hija.suplentes = construir_candidatos(candidato, "suplentes",
                                                        vista);
        html += template_hija(data_hija);
    }
    return html;
}


function generar_paneles_confirmacion(categorias){
    /* Genera los paneles de confirmacion. */
    //var template = get_template("confirmacion");
    let template_name = "confirmacion";
    let template;

    var modo = get_modo();
    var html = '<div class="barra-titulo"><p>' + constants.i18n.sus_candidatos + '</p></div>';
    registrar_helper_salto_linea(categorias.length)
    for(var i in categorias){

        var categoria = categorias[i].categoria;
        var candidato = categorias[i].candidato;
        let vice1 = candidato.secundarios[0];
        let vice2 = candidato.secundarios[1];

        if (candidato.cod_categoria == "PVP")
            template_name = "confirmacion_con_secundarios";
        else if (candidato.cod_categoria == "PVM")
            template_name = "confirmacion_jlra";
        else template_name = "confirmacion";

        template = get_template(template_name);
        
        var nombre_partido = "";
        if(candidato.partido !== null && candidato.partido !== undefined){
            nombre_partido = candidato.partido.nombre;
        }

        var id_confirmacion = "confirmacion_" + categoria.codigo;
        var template_data = main_dict_candidato(candidato, id_confirmacion,
                                                "confirmacion");
        // template_data.modificar = (constants.boton_modificar_en_lista_completa && modo == "BTN_COMPLETA") || (constants.boton_modificar_en_categorias && modo == "BTN_CATEG") || categoria.consulta_popular;
        template_data.modificar = true;
        if(categorias.length == 1 && !constants.boton_modificar_con_una_categoria){
            template_data.modificar = false;
        }
        template_data.consulta_popular = categoria.consulta_popular?"consulta_popular":"";
        template_data.categoria = categoria;
        template_data.nombre_partido = template_data.blanco?"":nombre_partido;
        template_data.vice1 = vice1;
        template_data.vice2 = vice2;
        
        html += template(template_data);
    }
    html += '<div class="clear"></div>';
    return html;
}

function msg_error_grabar_boleta(){
    /* Genera el mensaje de error de grabaciÃ³n de la boleta. */
    var template = get_template("popup", "partials/popup");
    var template_data = {
        pregunta: constants.i18n.error_grabar_boleta_alerta,
        aclaracion: constants.i18n.error_grabar_boleta_aclaracion,
        btn_aceptar: true,
        btn_cancelar: false,
    };
    var html_contenido = template(template_data);
    return html_contenido;
}

function main_dict_base(id_boton){
    /* Diccionario base de los items de un boton. */
    var data = {
        "id_boton": id_boton,
    };
    return data;
}

function traer_candidatos_template(candidato, campo, vista){
    /* devuelve la cantidad de candidatos para mostrar en el template segun el
     * campo y la vista.
     *
     * Argumentos:
     *     Candidato -- el candidato del que queremos mostrar los
     *     "subcandidatos"
     *     campo -- el campo dentro del objeto candidato: "secundarios",
     *     "suplentes"
     *     vista -- el lugar donde se van a mostrar tales candidatos
     *     "barra_lateral", "boton_candidato", "confirmacion", "verificacion"
     */
    // Traigo los candidatos del campo en cuestion
    var candidatos = candidato[campo];

    //Traigo las settings de limitacion de candidatos para ese campo
    var dict_campo = constants.limitar_candidatos[campo];
    // Si las settings existen
    if(dict_campo != undefined){
        // Averiguamos la cantidad.
        var cantidad = dict_campo[vista];
        // si hay una cantidad establecida en el Diccionario.
        if(cantidad != null){
            var vista_cat = cantidad[candidato.cod_categoria];
            if(typeof(vista_cat) !== "undefined"){
                cantidad = vista_cat;
            }
        }
        cantidad = parseInt(cantidad);
    }

    if(typeof(candidatos) !== "undefined" && typeof(cantidad) != "undefined" && !isNaN(cantidad)){
        candidatos = candidatos.slice(0, cantidad);
    }
    return candidatos;
}

function construir_candidatos(candidato, campo, vista){
    var candidatos = traer_candidatos_template(candidato, campo, vista);
    var data = {
        "candidatos": candidatos,
    };
    // si no es un cargo ejecutivo, inserto el 1er candidato adelante
    // de todo
    var template = get_template("candidatos_adicionales");
    if (!candidato.cargo_ejecutivo && candidato.codigo !== "BLC")  {
        var candidatos_con_principal = candidatos.slice();
        candidatos_con_principal.unshift(candidato.nombre);
        data.candidatos = candidatos_con_principal;
        return template(data);
    }
    return template(data);
}

function main_dict_candidato(candidato, id_boton, vista){
    var data = main_dict_base(id_boton);
    data.candidato = candidato;
    data.blanco = candidato.clase == "Blanco";

    let candidatos_confirmacion = [];

    if (typeof(candidato.secundarios) !== "undefined") {
        data.secundarios = construir_candidatos(candidato, "secundarios", vista);

        if (!candidato.cargo_ejecutivo && candidato.codigo !== "BLC")
            candidatos_confirmacion = candidato.secundarios_datos_extra.slice();
    }

    if (typeof(candidato.suplentes) !== "undefined") {
        data.suplentes = construir_candidatos(candidato, "suplentes", vista);
    }

    // si no es un cargo ejecutivo, inserto el 1er candidato adelante
    // de todo, excepto BLC
    if (!candidato.cargo_ejecutivo && candidato.codigo !== "BLC")  {
        let candidato_principal = {
            nombre: candidato.nombre,
            nro_orden: candidato.nro_orden,
            id_candidatura: candidato.id_candidatura
        };

        /*
        El problema de esto era que la funcion se llama desde varios lados con datos diferentes
        CUando se llama para armar confirmaciÃ³n del voto se pasa en candidato los datos completos y cuando se llama
        desde confirmaciÃ³n se pasa un objeto con menos datos. En este ultimo caso el dato que falta es el de las
        imagenes.
         */
        if(typeof(candidato.imagenes) !== "undefined")
            candidato_principal.imagen = candidato.imagenes[0];

        candidatos_confirmacion.unshift(candidato_principal);
        data.candidatos_confirmacion = candidatos_confirmacion;
    }
    return data;
}

function crear_div_colores(colores){
    var item = "";
    if(colores){
      var template = get_template("colores");
      var template_data = {
          num_colores: colores.length,
          colores: colores
      };

      item = template(template_data);
    }
    return new Handlebars.SafeString(item);
}


function lighten_darken_color(percent, color_array) {
    var color = color_array[0];
    var f=parseInt(color.slice(1),16),t=percent<0?0:255,p=percent<0?percent*-1:percent,R=f>>16,G=f>>8&0x00FF,B=f&0x0000FF;
    return "#"+(0x1000000+(Math.round((t-R)*p)+R)*0x10000+(Math.round((t-G)*p)+G)*0x100+(Math.round((t-B)*p)+B)).toString(16).slice(1);
}

function registrar_helper_colores(){
    Handlebars.registerHelper("colores", crear_div_colores);
    Handlebars.registerHelper("mod_color", lighten_darken_color);
}

function path_imagen(imagen){
    var nombre_imagen = imagen + "." + constants.ext_img_voto;
    if(imagen == "BLC"){
        nombre_imagen = "BLC.svg";
    }
    var img_path = constants.path_imagenes_candidaturas + constants.juego_de_datos + "/";
    var src = img_path + nombre_imagen;
    return src;
}

function crear_img(imagen){
    var src = path_imagen(imagen);
    var tag = '<img src="' + src + '" />';
    return new Handlebars.SafeString(tag);
}

function if_mostrar_data_candidato(candidato, opts) {
    const mostrar =
        candidato.cargo_ejecutivo || candidato.secundarios.length === 0;
    return mostrar ? opts.fn(this) : opts.inverse(this);
}

function if_tacha(id_candidatura, opts){
    if(typeof(_seleccion.tachas) !== "undefined"){
        if ( _seleccion.tachas.includes(id_candidatura)) {
            return opts.fn(this);
        }
    }
    return opts.inverse(this);
}

function if_preferencia(id_candidatura, categoria, opts){
    if(typeof(_seleccion.preferencias[categoria]) !== "undefined"){
        if ( _seleccion.preferencias[categoria].includes(id_candidatura)) {
            return opts.fn(this);
        }
    }
    return opts.inverse(this);
}

const do_salto_linea_factory = (
    cantidad_candidatos, 
    min_candidatos=8, // Cuando hay esta cantidad de candidatos, 
    max_characters=26 // y si el texto tiene menos de esta cantidad de caracteres, se fuerza el salto de linea.
) => texto => (
    cantidad_candidatos >= min_candidatos
) && (
    texto.length <= max_characters
)

const registrar_helper_salto_linea = (
    cantidad_candidatos, 
) => {
    const do_salto_linea = do_salto_linea_factory(cantidad_candidatos)    
    Handlebars.registerHelper(
        "if_do_salto_linea", 
        (texto, handlebars_opts) => {
            if (do_salto_linea(texto))
                return handlebars_opts.fn(this);
            return handlebars_opts.inverse(this);
        }
    )
}

function registrar_helper_estado_tacha(){
    Handlebars.registerHelper("if_tacha", if_tacha);
}

function registrar_helper_estado_preferencia(){
    Handlebars.registerHelper("if_preferencia", if_preferencia);
}

function registrar_helper_mostrar_data_candidato(){
    Handlebars.registerHelper(
        "if_mostrar_data_candidato",
        if_mostrar_data_candidato
    );
}

function registrar_helper_imagenes(){
    Handlebars.registerHelper("imagen_candidatura", crear_img);
}