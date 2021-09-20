function consulta(candidatos){
    /*
     * Muestra la pantalla de consulta de votacion.
     */
    hide_dialogo();
    $("#img_voto").html("");
    $("#candidatos_seleccion").html("");
    $("#pantalla_mensaje_final").hide();
    if (constants.asistida) {
        $("#pantalla_consulta .texto-mediano").show();
        $("#pantalla_consulta #candidatos_seleccion").hide();
    } else {
        $("#img_voto").html('<h2 style="margin-top:200px">Cargando...</h2>');
    }
    candidatos_consulta(candidatos);
    patio.pantalla_consulta.only();
    setTimeout(
        function(){
            send("imagen_consulta");
        },
        100);
}

function buscar_secundario(principal, id_candidatura){
    for (let i in principal.secundarios_datos_extra) {
        let datos_candidato = principal.secundarios_datos_extra[i];
        if (datos_candidato.id_candidatura == id_candidatura) return datos_candidato
    }
}

function candidatos_consulta(candidatos){
    /* Muestra los candidatos en la consulta de voto. */
    var html_candidatos = "";
    $("#candidatos_seleccion").html("");
    
    var items = "";
    
    for(var i in candidatos){
        var template = get_template("candidato_verificacion");
        let datos_candidato = candidatos[i];
        let candidato;

        /**/
        console.log(datos_candidato);
        // Si el candidato es un array se obtienen los datos del primer candidato
        // y del secundario
        if (datos_candidato.constructor === Array) {
            let candidato_principal = local_data.candidaturas.one({id_umv: datos_candidato[0]});
            let id_candidatura_secundario = datos_candidato[1];

            if (id_candidatura_secundario != null && id_candidatura_secundario != candidato_principal.id_candidatura) {
                candidato = buscar_secundario(candidato_principal, datos_candidato[1]);
                candidato.cod_categoria = candidato_principal.cod_categoria;
                candidato.lista = candidato_principal.lista;
                candidato.imagenes = [];
                candidato.imagenes[0] = candidato.imagen;
            } else {
                candidato = candidato_principal;
            }
        } else {
            candidato = local_data.candidaturas.one(
                {id_umv: candidatos[i]});
        }

        var categoria = local_data.categorias.one(
            {codigo: candidato.cod_categoria});

        if(categoria.adhiere == null){
            
            var id_boton = "categoria_" + candidato.cod_categoria;
            var data_template = main_dict_candidato(candidato, id_boton,
                                                    "verificacion");
            data_template.es_consulta = (categoria.consulta_popular &&
                                         !data_template.blanco);
            data_template.categoria = categoria;
            data_template.cant_cargos = local_data.categorias.many().length;
            data_template.image_to_left = data_template.cant_cargos <= 2;
            
            if(candidato.cod_categoria === "PVP" || candidato.cod_categoria === "PVM" ){   
                data_template.cat_cerrada_abierta = false;
                var template = get_template("candidato_verificacion_con_secundarios");

                if (candidato.cod_categoria === "PVP" && !data_template.blanco){
                    data_template.presidente = data_template.candidato.nombre;
                    data_template.vice_1 = data_template.candidato.secundarios[0];
                    data_template.vice_2 = data_template.candidato.secundarios[1];
                }else if (!data_template.blanco){
                    console.log(data_template)
                    data_template.cat_cerrada_abierta = true;
                    data_template.presidente = data_template.candidato.lista.datos_extra.presidente;
                    data_template.vice_1 = data_template.candidato.lista.datos_extra.vice_1;
                    data_template.vice_2 = data_template.candidato.lista.datos_extra.vice_2;
                }
            }

            console.log(data_template)
            var item = template(data_template);
            items += item;
        }
    }
    $("#candidatos_seleccion").html(items);
}

function imagen_consulta(data){
    /*
     * Muesta la imagen de consulta de voto.
     * Argumentos:
     * data -- un png base64 encoded.
     */
    var img = decodeURIComponent(data);
    var svg = constants.muestra_svg;
    if(svg){
        $("#img_voto").html(img);
    } else {
        $("#img_voto").html("");
        var img_elem = document.createElement("img");
        img_elem.src = img;
        var contenedor = document.getElementById("img_voto")
        contenedor.appendChild(img_elem);
    }
}

function mostrar_voto(data){
    /*
     * Muesta la imagen de consulta de voto.
     * Argumentos:
     * data -- un png base64 encoded.
     */
    if(!constants.asistida){
        var img = decodeURIComponent(data);
        var svg = constants.muestra_svg;
        if(svg){
            $("#img_previsualizacion").html(img);
        } else {
            var img_elem = document.createElement("img");
            img_elem.src = img;
            var contenedor = document.getElementById("img_previsualizacion")
            contenedor.innerHTML = "";
            contenedor.appendChild(img_elem);
        }
    }
}

function pantalla_principal(){
    /*
     * Establece la palabra principal.
     */
    _candidatos_adhesion = null;
    limpiar_data_categorias();

    bindear_botones();
    var pantalla = patio.pantalla_modos;
    $(".opcion-tipo-voto").removeClass("seleccionado");
    pantalla.only();
}

function pantalla_idiomas(idiomas){
    /*
     * Establece la pantalla de idiomas.
     * Argumentos:
     *   idiomas -- Los idiomas disponibles.
     */
    var template = get_template("idioma", "pantallas/voto");

    var elem = $("#opciones_idioma");
    for(var i in idiomas){
        var nombre_idioma = idiomas[i][0];
        var id_idioma = "idioma_" + idiomas[i][1];
        var data_template = {
            'id_idioma': id_idioma,
            'nombre_idioma': nombre_idioma
        };

        elem.html(template(data_template));
    }
    patio.pantalla_idiomas.only();
    bindear_botones();
}

function insercion_boleta(){
    /*
     * Establece la pantalla de insercion de boleta.
     */
     var w = window.outerWidth;
    _votando = false;
    $("body").attr('data-state', 'normal');

    if (w < 1400){
        var src = "img/sufragio/ingreso_boleta.png";
        
    }else{
        var src = "img/sufragio/ingreso_boleta1920.png";
        // var src = "img/sufragio/ingreso_asistida1920.png";
    }

    if(constants.asistida){
        $("#insercion_boleta .contenedor_texto h1.titulo").html(constants.titulo);
        $("#insercion_boleta .contenedor_texto h2.subtitulo").html(constants.subtitulo);
        $("#insercion_boleta .contenedor_texto h2.subtitulo_contraste").html(constants.subtitulo_contraste);
        $(".tooltip").hide();
        var src = "img/sufragio/ingreso_asistida.png";
        send("change_screen_insercion_boleta");
        $("#img_insercion_boleta").addClass("asistida");
        }
    $("#img_insercion_boleta").attr('src', src);
    patio.insercion_boleta.only();

}

function popular_pantalla_modos(){
    /*
     * Genera los datos a mostrar en la pantalla de seleccion de modos.
     */
    var botones = [];
    for(var i in constants.botones_seleccion_modo){
        var boton = constants.botones_seleccion_modo[i];
        var data = {};
        if(boton == "BTN_COMPLETA"){
            data.clase = "votar-lista-completa";
            data.cod_boton = boton;
            data.imagen = "votar_lista_completa";
            data.texto = "votar_lista_completa";
        } else {
            data.clase = "votar-por-categoria";
            data.cod_boton = boton;
            data.imagen = "votar_por_categoria";
            data.texto = "votar_por_categorias";
        }
        botones.push(data);
    }
    return {"botones": botones};
}

function popular_pantalla_menu(){
    /*
     * Genera los datos a mostrar en la pantalla de seleccion del menu.
     */
    return {
        "asistida": constants.asistida,
        "usar_asistida": constants.usar_asistida,
    };
}

function pantalla_modos(modos){
    /*
     * Establece la pantalla de seleccion de modo de votacion.
     * Argumentos:
     * modos -- una lista con los modos de votacion.
     */
    var pantalla = patio.pantalla_modos;
    $(".opcion-tipo-voto").removeClass("seleccionado");
    pantalla.only();
}

function agradecimiento(){
    /*
     * Establece la pantalla de agradecimiento.
     */
    if(!confirmada){
      confirmada = true;
      limpiar_data_categorias();

      patio.pantalla_agradecimiento.only();
      if(!constants.asistida){
        $("#img_previsualizacion").html('<h2 style="margin-top:200px">Cargando...</h2>');
        setTimeout(previsualizar_voto, 50);
        setTimeout(confirmar_seleccion, 100);
      }
    }
}

function mensaje_final(){
    /*
     * Establece el mensaje final.
     */
    patio.pantalla_mensaje_final.only();
}