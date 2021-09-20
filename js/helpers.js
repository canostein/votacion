var _templates = {};

function any(list, prop_func){
    var found = false;
    for(var i in list){
        if(prop_func !== null){
            if(prop_func(list[i])){
                found = true;
                break;
            }
        }
        else if(typeof list[i] === 'boolean' && list[i]){
                found = true;
                break;
        }
    }
    return found;
}

function place_text(data){
    /*
     * Actualiza las traducciones de los botones al div correspondiente.
     * Argumentos:
     * tuples -- es una lista de tuplas que contienen el key y la traduccion
     *   que vienen desde gettext
     */
    for(var key in data){
        var value = data[key];
        if(data.hasOwnProperty(key)){
            $("#_txt_" + key + ", ._txt_" + key).html(value);
        }
    }
}

function popular_header(){
    var template_header = get_template("encabezado", "partials");
    var html_header = template_header({'voto': false});
    $('#encabezado').html(html_header);
}

function shuffle(o){ //v1.0
    for(var j, x, i = o.length; i; j = parseInt(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
    return o;
}

function trimNumber(s) {
    /*
     * Trimea un numero.
     */
    while (s.substr(0,1) == '0' && s.length>1) { s = s.substr(1,9999); }
    return s;
}

function endsWith(str, suffix) {
    return str.indexOf(suffix, str.length - suffix.length) !== -1;
}

function load_template_comp(url){
    $.ajax(url,
           {async: false,
            dataType: "html",
            success: function(data, textStatus, jqXHR){
                template = jqXHR.responseText;
                $("body").append(template);
            },
            error: function(data, textStatus, jqXHR){
                console.error(url + " : " + data.statusText);
            }
           });
}

function load_templates(templates){
    for(var i in templates){
        var template = templates[i];
        get_template(template);
    }
}

function cargar_templates_en_dom(templates){
    var templates = document.getElementsByClassName("raw_template");
    for(var i in templates){
        if(templates[i].id){
            var template_key = templates[i].id.slice(5);
            compiled = Handlebars.compile(templates[i].innerHTML);
            _templates[template_key] = compiled;
        }
    }
}

function get_template(name, dir_){
    /*
     * Devuelve un template para el flavor actual.
     */
    if(dir_ === undefined){
        dir_key = constants.flavor;
    } else{
        dir_key = dir_;
    }

    var template_key = dir_key + "/" + name;
    var template = _templates[template_key];
    if(typeof(template) == "undefined"){
        template = get_template_request(dir_, name);
        try {
            template = Handlebars.compile(template);
            _templates[template_key] = template;
        }
        catch(e) {
            console.error(name + ": " + e.message);
        }
    }
    return template;
}

function get_template_request(dir_, name){
    if(dir_ == undefined){
        dir_ = constants.PATH_TEMPLATES_FLAVORS + constants.flavor;
    } else {
        dir_ = constants.PATH_TEMPLATES_MODULOS + dir_;
    }
    var url =  dir_ + "/" + name + ".html";
    $.ajax(url,
            {async: false,
                dataType: "html",
                success: function(data, textStatus, jqXHR){
                    template = jqXHR.responseText;
                },
                error: function(data, textStatus, jqXHR){
                    console.error(url + " : " + data.statusText);
                }

            }
            );
    return template;
}

function ordenar_absolutamente(a, b){
    for(var i = 0; i < a.orden_absoluto.length; i++){
     var val_a = a.orden_absoluto[i];
     var val_b = b.orden_absoluto[i];
     if(val_a != val_b){
       if(typeof(val_b) == "undefined"){
         return 1;
       } else {
         return val_a - val_b;
       }
     }
  }
  return a.orden_absoluto.length < b.orden_absoluto.length? -1 : 1;
}

function _i18n(key){
    return constants.i18n[key];
}

function registrar_helper_i18n(){
    Handlebars.registerHelper("i18n", _i18n);
}