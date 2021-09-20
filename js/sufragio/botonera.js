/**
 * Establece el siguiente modo de votacion.
*/
function get_next_modo(event){
    const aceptar_clicks = true
    if(aceptar_clicks){
        if(local_data.cargando_preferencias){
            desbindear_botones();
            const cat_actual = get_categoria_actual();
            setTimeout(function(){
                _cambiar_categoria(cat_actual.codigo);
                preferencias_tmp = null
                local_data.cargando_preferencias = false
            }, constants.tiempo_feedback);        
        } else {
            limpiar_data_categorias();
            pagina_anterior = null;
            const cargos = local_data.categorias.all()
            const cat_actual = get_categoria_actual()
            if (_seleccion.preferencias[cat_actual.codigo])
                delete _seleccion.preferencias[cat_actual.codigo]
            if (_seleccion[cat_actual.codigo])
                delete _seleccion[cat_actual.codigo]
            
            const cat_actual_index = cargos.indexOf(
                cargos.find(
                    i => i.codigo == cat_actual.codigo
                )
            )
            if (cat_actual_index == -1){
                pantalla_principal();
                return
            }
            const cat_a_cambiar = (
                cat_actual_index == 0
            )? cargos[cat_actual_index].codigo : cargos[cat_actual_index - 1].codigo

            _cambiar_categoria(cat_a_cambiar)
        }
    }
}


function seleccion_candidatos(){
    /*
     * Callback de seleccion de candidatos.
     */
    pantalla_principal();
}

function cargar_categorias(categorias, candidatos){
    /*
     * Establece las categorias y los candidatos seleccionados a la derecha en
     * la seleccion por categorias.
     */
    var template = get_template("categoria");
    $("#opciones").hide();
    if(categorias){
        var elem = $("#candidatos_seleccionados");
        items = "";
        for(var i in categorias){
            var categoria = categorias[i];
            if(!categoria.consulta_popular){
                var candidato = candidatos[i];
                var id_cat = 'categoria_' + categoria.codigo;
                var seleccionado = "";
                var cat_actual = get_categoria_actual();
                if(cat_actual !== null && categoria.codigo == cat_actual.codigo){
                    seleccionado = "seleccionado";
                }
                var nombre = "";
                if(typeof(candidato) !== "undefined"){
                    nombre = candidato.nombre;
                    if(candidato.clase == "Blanco"){
                        seleccionado += " blanco";
                    }
                } else {
                    seleccionado += " no-seleccionado";
                    candidato = {};

                    nombre = constants.candidato_no_seleccionado;
                }
                var template_data = main_dict_candidato(candidato, id_cat,
                                                        "barra_lateral");
                template_data.categoria = categoria;
                template_data.seleccionado = seleccionado;

                var item = template(template_data);
                items += item;
            }
        }
        elem.html(items);
    }
}

function cargar_listas(boletas){
    /* Carga las listas completas. */
    es_ultima = true;
    bindear_botones();
    if(!constants.shuffle.por_sesion && constants.shuffle.boletas){
        boletas = shuffle(boletas);
    }

    if(constants.agrupar_por_partido){
        boletas = agrupar_candidatos_por_partido(boletas);
    }

    var html = "";
    var blanco = 0;
    for(var m in boletas){
        var boleta = boletas[m];

        if(boleta.clase == "Candidato" || boleta.clase == "Blanco"){
            if(boleta.clase != "Blanco"){
                var item = crear_item_lista(boleta, false);
                html += item;
            } else {
                blanco = 1;
            }
        } else {
            var codigo_lista = boletas[m].codigo;
            if(codigo_lista != constants.cod_lista_blanco){
                var item = crear_item_lista(boleta, true);
                html += item;
            } else {
                blanco = 1;
            }
        }
    }
    html += '<div class="clear"></div>';

    var pantalla = patio.pantalla_listas;
    pantalla.only();
    $(pantalla.id).removeClass();
    clase_listas = classname_segun_candidatos(boletas.length - blanco);
    pantalla.addClass("pantalla opciones sinbarra");
    pantalla.addClass(clase_listas);

    if(_votando){
        pantalla.html(html);
        if(blanco){
            patio.voto_blanco.show();
            $("#voto_blanco").unbind();
            $("#voto_blanco").click(click_lista);
            $("#voto_blanco").removeClass("seleccionado");
        }

    } else {
        insercion_boleta();
    } 
    
}

function cargar_consulta_popular(data){
    /*
     * Carga los candidatos de Consulta Popular.
     */
    var categoria = data.categoria;
    var candidatos = data.candidatos;
    if(!constants.shuffle.por_sesion && constants.shuffle.consultas){
        candidatos = shuffle(candidatos);
    }
    _consulta_actual = categoria;

    var pantalla = patio.consulta_popular_container;
    bindear_botones();

    var html = "";
    var blanco = 0;
    for(var i in candidatos){
        if(candidatos[i].clase != "Blanco"){
            var item = crear_item_consulta_popular(candidatos[i]);
            codigo_lista = candidatos[i].codigo;
            codigo_lista = codigo_lista.split('_')[1];
            item.imagen_agrupacion = false;
            html += item;
        } else {
            blanco = 1;
        }
    }
    html += '<div class="clear"></div>';
    var clase_candidatos = classname_segun_candidatos(candidatos.length - blanco);
    $(pantalla.id).removeClass().addClass("pantalla opciones sinbarra").addClass(clase_candidatos);
    pantalla.html(html);

    if(!constants.asistida){
        $('#categoria_votada').html("Consulta Popular");
    }

    pantalla.only();

    if(blanco){
        patio.voto_blanco.show();
        $("#voto_blanco").unbind();
        $("#voto_blanco").click(click_consulta_popular);
        $("#voto_blanco").removeClass("seleccionado");
        if(_categorias !== null){
            try {
                var data_categoria = get_data_categoria(listas[0].candidatos[0].cod_categoria);
                if(data_categoria.cod_candidato !== null && data_categoria.cod_candidato.split('_')[1] == constants.cod_lista_blanco){
                    $("#voto_blanco").addClass("seleccionado");
                }
            } catch (e) {
                /* y si no nada... */
            }
        }
    }
}

function cargar_pantalla_tachas(candidato){
    /*
     * Carga los candidatos para realizar tachas
     * Recibe el candidato principal de la categorÃ­a
     */
    var categoria = local_data.categorias.one({
        codigo: candidato.cod_categoria
    });
    cambiar_categoria(categoria);
    // copiamos el array en vez de modificarlo
    var candidatos = candidato.secundarios_datos_extra.slice(0);
    candidatos.unshift(candidato); // insertamos el candidato principal al principio

    var data = {
        categoria: categoria,
        lista: candidato.lista,
        candidatos: {
            izq: [],
            der: []
        }
    };

    _seleccion.tachas = _seleccion.tachas || [];
    tachas_tmp = _seleccion.tachas.slice(0);

    // esto es retorcido para no copiar (y modificar) los candidatos originales
    // y tiene dos columnas
    for(var i in candidatos){
        var c = candidatos[i];
        var columna = i <= candidatos.length/2 ? 'izq' : 'der';
        data.candidatos[columna].push({
            nombre: c.nombre,
            nro_orden: c.nro_orden,
            id_candidatura: c.id_candidatura,
            imagenes: c.imagenes,
            seleccionado: tachas_tmp.includes(c.id_candidatura) ?
                'seleccionado' : ''
        });
    }

    var template = get_template('tachas');

    var pantalla = patio.tachas_container;

    pantalla.html(template(data));
    bindear_botones();

    var nombre_categoria = "Tachas de " + categoria.nombre;
    if(!constants.asistida){
        $('#categoria_votada').html(nombre_categoria);
    }

    pantalla.only();
    $("#confirmar_seleccion").removeClass("seleccionado");
    patio.confirmar_seleccion.show();
}

function cargar_pantalla_preferencias(candidato){
    /*
     * Carga los candidatos para realizar preferencias.
     * Recibe el candidato principal de la categorÃ­a.
     */
    
    var categoria = local_data.categorias.one({
        codigo: candidato.cod_categoria
    });

    cambiar_categoria(categoria);
    // copiamos el array en vez de modificarlo
    var candidatos = candidato.secundarios_datos_extra.slice(0);
    candidatos.unshift(candidato); // insertamos el candidato principal al principio

    var data = {
        categoria: categoria,
        lista: candidato.lista,
        candidatos: []
    };

    _seleccion.preferencias[candidato.cod_categoria] = _seleccion.preferencias[candidato.cod_categoria] || [];
    preferencias_tmp = _seleccion.preferencias[candidato.cod_categoria].slice(0);

    // esto es retorcido para no copiar (y modificar) los candidatos originales
    for(var i in candidatos){
        var c = candidatos[i];
        data.candidatos[i] = {
            nombre: c.nombre,
            nro_orden: c.nro_orden,
            id_candidatura: c.id_candidatura,
            imagen: candidato.imagenes[i],
            seleccionado: preferencias_tmp.includes(c.id_candidatura) ?
                'seleccionado' : ''
        };
    }

    var template = get_template('preferencias');

    var pantalla = patio.preferencias_container;

    var clase_candidatos = classname_segun_candidatos(candidatos.length)
    
    var clase_categria = "cat_" + data.categoria.codigo;

    var clase_barra = constants.mostrar_barra_seleccion? "conbarra" : "sinbarra";

    var clases = ["pantalla", "opciones", clase_candidatos, clase_categria, "preferencias",
                  clase_barra];

    pantalla.$.removeClass().addClass(clases.join(" "));

    pantalla.html(template(data));
    bindear_botones();

    var nombre_categoria = "Candidatos a la " + categoria.nombre;
    
    if(categoria.codigo == "PVM")
        nombre_categoria = "Candidatos a " + categoria.nombre.split("-")[2];
  

    if (["MNA", "MDE", "MSE", "DCO","C","DD","CL","MFC","DN"].find(
        i => categoria.codigo == i
    )){
            nombre_categoria = "Candidatos a " + categoria.nombre;
    }
   

    if(!constants.asistida){
        contenido_solapa(nombre_categoria);
    }

    pantalla.only();

    // Si la constante estÃ¡ en true se quiere mostrar si o si el botÃ³n confirmar,
    // por ende se le agrega solamente la clase de deshabilitado.
    if (constants.mostrar_confirmar_seleccion) {
        if ($(".opcion-preferencia.seleccionado").length > 0) {
            patio.confirmar_seleccion.removeClass("deshabilitado");
        } else {
            patio.confirmar_seleccion.addClass('deshabilitado');
        }
        patio.confirmar_seleccion.removeClass("seleccionado");
        patio.confirmar_seleccion.show();
    } else {
        patio.confirmar_seleccion.hide();
    }
}

function seleccion_partido(partidos){
    /*
     * Muestra la pantalla de seleccion de partidos.
     */
    $('#boleta_insertada').hide();
    hide_pestana();
    hide_all();
    bindear_botones();
    show_contenedor_opciones();
    var modo = get_modo();
    show_listas_container();
    $("#voto_blanco").unbind();
    $("#voto_blanco").click(click_lista);
    hide_contenedor_der();
    $("#opciones").hide();
    var pantalla = $("#opciones");
    pantalla.html("");
    var html = "";
    for(var i in partidos){
        var item = crear_item_partido(partidos[i]);
        html += item;
    }
    show_voto_blanco();
    html += '<div class="clear"></div>';
    pantalla.removeClass();
    $("#opciones").show();
    clase_listas = classname_segun_candidatos(partidos.length);
    pantalla.addClass("pantalla opciones").addClass(clase_listas);
    if(constants.interna || modo == "BTN_COMPLETA" || !constants.mostrar_barra_seleccion){
        pantalla.addClass("sinbarra");
    } else {
        pantalla.addClass("conbarra");
    }
    pantalla.html(html);
}

function generar_botones_partido_categorias(data){
    /* Genera los botones de las agrupaciones para votacion por categorias. */
    var html = "";
    var partidos = data.partidos;
    if(!constants.shuffle.por_sesion && constants.shuffle.partidos){
        partidos = shuffle(partidos);
    }
    var candidatos = data.candidatos;
    var cantidad_partidos = 0;
    var sel = _seleccion[data.categoria.codigo];
    var candidato_seleccionado = null;
    if(typeof(sel) != "undefined"){
        candidato_seleccionado = local_data.candidaturas.one({id_umv: sel[0]});
    }

    for(var i in partidos){
        var encontrado = false;
        var partido = partidos[i];
        for(var j in candidatos){
            var candidato = candidatos[j];
            if(constants.categoria_agrupa_por == "Alianza"){
                if(candidato.cod_alianza == partido.codigo){
                    encontrado = true;
                    break;
                }
            } else {
                if(candidato.cod_partido == partido.codigo){
                    encontrado = true;
                    break;
                }
            }
        }
        if(encontrado){
            var seleccionado = false;
            if(constants.categoria_agrupa_por == "Alianza"){
                if(candidato_seleccionado && candidato_seleccionado.cod_alianza == partido.codigo){
                    seleccionado = true;
                }
            } else {
                if(candidato_seleccionado && candidato_seleccionado.cod_partido == partido.codigo){
                    seleccionado = true;
                }
            }
            var item = crear_item_partido(partido, seleccionado);
            html += item;
            cantidad_partidos++;
        }
    }
    if(candidato_seleccionado && candidato_seleccionado.clase == "Blanco"){
        $("#voto_blanco").addClass("seleccionado");
    }
    html += '<div class="clear"></div>';
    return [html, cantidad_partidos];
}

function generar_botones_partido_completa(data){
    /*
     * Genera los botones de los partidos cuando lista completa colapsa por
     * partidos.
     */
    var html = "";
    var partidos = data.partidos;
    if(!constants.shuffle.por_sesion && constants.shuffle.partidos){
        partidos = shuffle(partidos);
    }
    var cantidad_partidos = 0;

    for(var i in partidos){
        var seleccionado = false;
        var item = crear_item_partido(partidos[i], seleccionado);
        html += item;
        cantidad_partidos++;
    }
    html += '<div class="clear"></div>';
    return [html, cantidad_partidos];
}

function cargar_partidos_categoria(data){
    /*
     * Muestra en pantalla los partidos en caso de que tengan que aparecer
     * dentro de voto por categorias en las PASO.
     * Argumentos:
     *   data -- data de las categorias.
     */
    bindear_botones();
    pagina_anterior = null;
    update_titulo_categoria();
    var pantalla = patio.pantalla_partidos_categoria;
    $("#voto_blanco").removeClass("seleccionado");
    var data_botones = generar_botones_partido_categorias(data);

    $(pantalla.id).removeClass();
    clase_listas = classname_segun_candidatos(data_botones[1]);
    if(constants.mostrar_barra_seleccion){
        pantalla.addClass("conbarra");
    } else {
        pantalla.addClass("sinbarra");
    }
    pantalla.addClass("opciones pantalla");
    pantalla.addClass(clase_listas);
    pantalla.html(data_botones[0]);

    var blanco = false;
    for(var i in data.candidatos){
        var candidato = data.candidatos[i];
        if(candidato.clase == "Blanco"){
           blanco = true;
           break;
        }
    }

    pantalla.only();

    if(blanco){
        patio.voto_blanco.show();
        $("#voto_blanco").unbind();
        $("#voto_blanco").click(click_candidato);
    } else {
        patio.voto_blanco.hide();
    }
}

function cargar_partidos_completa(data){
    /*
     * Muestra en pantalla los partidos en caso de que tengan que aparecer
     * dentro de voto por categorias en las PASO.
     * Argumentos:
     *   data -- data de las categorias.
     */

    bindear_botones();
    pagina_anterior = null;
    var pantalla = patio.pantalla_partidos_completa;
    var data_botones = generar_botones_partido_completa(data);

    $(pantalla.id).removeClass();
    clase_listas = classname_segun_candidatos(data_botones[1]);
    pantalla.addClass("opciones pantalla sinbarra");
    pantalla.addClass(clase_listas);
    pantalla.html(data_botones[0]);

    $("#voto_blanco").removeClass("seleccionado");
    $("#voto_blanco").unbind();
    $("#voto_blanco").click(click_lista);
    pantalla.only();
}

function agrupar_candidatos_por_partido(candidatos){
    /* Agrupa por partido los candidatos, como piden en Salta. Tanto los
     * partidos como los candidatos aparecen al azar pero todos los candidatos
     * del mismo partido aparecen juntos.
    */
    var candidatos_ordenados = [];
    var partidos = [];

    //Busco todos los partidos que hay
    for(var i in candidatos){
        var candidato = candidatos[i];
        if(partidos.indexOf(candidatos[i].cod_partido) == -1){
            partidos.push(candidatos[i].cod_partido);
        }
    }

    //Mezclo los partidos para evitar que los partidos que tienen mas listas
    //Tengan mas probabilidades de estar primeros
    if(!constants.shuffle.por_sesion && constants.shuffle.partidos){
        partidos = shuffle(partidos);
    }

    //Busco todo los candidato para cada partido
    for(var l in partidos){
        for(var j in candidatos){
            if(partidos[l] == candidatos[j].cod_partido){
                candidatos_ordenados.push(candidatos[j]);
            }
        }
    }

    return candidatos_ordenados;
}

function crear_botones_candidatos(candidatos){
    /* Crea los botones de los candidatos.*/
    var elem = "";
    var blanco = 0;

    // Todo lo que tiene que ver con el ordenamiento de las listas estÃ¡ de mÃ¡s, se hace desde los datos
    const dividir_en_numeros_y_letras = a_dividir => a_dividir.split(
        /([0-9]+)/
    ).filter(
        Boolean
    ) // Elimina strings vacios generados por el split

    const ordenar_listas_por_numeros_y_letras = (a, b) => {
        const [
            a_number, 
            a_string
        ] = dividir_en_numeros_y_letras(a.lista.numero)
        
        const [
            b_number, 
            b_string
        ] = dividir_en_numeros_y_letras(b.lista.numero)

        if (a_number > b_number) 
            return 1
        if (a_number < b_number)
            return -1
        //Si numeros son iguales se compara por las letras
        if (a_string > b_string)
            return 1
        if (a_string < b_string)
            return -1
        // a debe ser igual b
        return 0;
    }

    //Recorro todos los candidatos y armo los botones
    
    const items_candidatos = candidatos
        .slice()
        .filter(
            candidato => candidato.lista // Filtar los items que no tienen lista. Por ejemplom votos en blanco.
        ).sort(
            ordenar_listas_por_numeros_y_letras
        ).concat(
            candidatos.filter(
                candidato => !candidato.lista // Agrega items que no son lista al final del arreglo.
            )
        ).map(
            candidato => {
                
                var seleccionado = false;

                //Me fijo si el candidato estÃ¡ seleccionado
                for(var l in _seleccion){
                    for(var m in _seleccion[l]){
                        if(candidato.id_umv == _seleccion[l][m]){
                            seleccionado = true;
                        }
                    }
                }

                //si es voto en blanco no armamos el boton
                if(candidato.clase=="Blanco"){
                    blanco = 1;
                    if(seleccionado){
                        $("#voto_blanco").addClass("seleccionado");
                    } else {
                        $("#voto_blanco").removeClass("seleccionado");
                    }
                    candidato.blanco = true;
                }
                return crear_item_candidato(candidato, seleccionado, "candidato");
            }
        )
    return [
        items_candidatos.join("").concat(
            '<div class="clear"></div>'
        ), 
        blanco
    ];
}


function cargar_candidatos(data){
    /*
     * Carga los candidatos en pantalla.
     * Argumentos:
     * data -- una lista de objetos con los datos del candidato.
     *
     */

    var candidatos = data.candidatos;

    if (!constants.shuffle.por_sesion && constants.shuffle.candidatos) {
        candidatos = shuffle(candidatos);
    }

    var pantalla = patio.pantalla_candidatos;

    bindear_botones();
    cambiar_categoria(data.categoria);

    var nombre_solapa = `Candidatos a ${data.categoria.nombre}`;
    if (!data.categoria.cargo_ejecutivo) {
        nombre_solapa = "Listas participantes a ";
        if (data.categoria.codigo === "CNJ") nombre_solapa += "la ";
        nombre_solapa += data.categoria.nombre;
    }

    contenido_solapa(nombre_solapa);

    //Me fijo si tengo que agrupar o no a los candidatos en las categorias en
    //PASO
    if (constants.agrupar_por_partido) {
        candidatos = agrupar_candidatos_por_partido(candidatos);
    }

    var data_elem = crear_botones_candidatos(candidatos);
    var elem = data_elem[0];
    var blanco = data_elem[1];
    var clase_candidatos = classname_segun_candidatos(candidatos.length);
    const es_cargo_ejecutivo = candidatos.every(
        (candidato) => candidato.cargo_ejecutivo
    );
    const es_preferente_unico = candidatos.every((candidato) =>
        tiene_un_unico_preferente(candidato)
    );
    const clase_cargo_ejecutivo_o_preferente_unico =
        es_cargo_ejecutivo || es_preferente_unico
            ? " cargo-ejecutivo-o-preferente-unico"
            : "";
    var clase_categria = "cat_" + data.categoria.codigo;
    var clase_barra = constants.mostrar_barra_seleccion
        ? "conbarra"
        : "sinbarra";

    var clases = [
        "pantalla",
        "opciones",
        clase_candidatos,
        clase_categria,
        clase_barra,
        clase_cargo_ejecutivo_o_preferente_unico,
    ];

    pantalla.$.removeClass().addClass(clases.join(" "));
    pantalla.html(elem);

    if (_votando) {
        pantalla.only();

        if (
            (data.categoria.max_selecciones > 1 &&
                $(".candidato-persona.seleccionado").length ==
                    data.categoria.max_selecciones) ||
            constants.mostrar_confirmar_seleccion
        ) {
            patio.confirmar_seleccion.removeClass("seleccionado");

            if ($(".candidato-persona.seleccionado").length > 0) {
                patio.confirmar_seleccion.removeClass("deshabilitado");
            } else {
                patio.confirmar_seleccion.addClass("deshabilitado");
            }

            patio.confirmar_seleccion.show();
        }

        if (blanco) {
            patio.voto_blanco.show();
            $("#voto_blanco").unbind();
            $("#voto_blanco").click(click_candidato);
        }

        // muestro regresar si no es la primer categoria
        if (data.categoria.posicion != 1) {
            patio.btn_regresar.show();
        } else {
            patio.btn_regresar.hide();
        }
    } else {
        insercion_boleta();
    }
}

function mostrar_confirmacion(paneles){
    /*
     * Muestra la pantalla de confirmacion de voto.
     */
    bindear_botones();
    confirmada = false;

    show_confirmacion();
    pantalla = patio.pantalla_confirmacion;
    pantalla.addClass(
        get_template_confirmacion(paneles.length)
    );
    var html = generar_paneles_confirmacion(paneles);
    if(_votando){
        pantalla.html(html);
    } else {
        insercion_boleta();
    }
}