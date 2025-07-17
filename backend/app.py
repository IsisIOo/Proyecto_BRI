# pullear la imagen del docker: 
# docker run -p 8108:8108 -v C:\typesense-data:/data typesense/typesense:0.25.2 --data-dir /data --api-key=xyz --listen-port=8108

# librerias a instalar: pip install flask typesense

# Configuración de Typesense
from flask import Flask, request, jsonify, render_template
import typesense
import json
import os

# Crear una instancia de la aplicación Flask
app = Flask(__name__)

# Configuración del cliente de Typesense para conexión con el motor de búsqueda
client = typesense.Client({
    'nodes': [{
        'host': 'typesense',         # nombre del servicio Docker donde corre Typesense
        'port': '8108',              # puerto expuesto por Typesense
        'protocol': 'http'           # protocolo HTTP (sin SSL en este caso)
    }],
    'api_key': 'xyz',               # clave de API para autenticación con Typesense
    'connection_timeout_seconds': 2 # tiempo de espera para conexiones
})

# Crear colección si no existe
def crear_coleccion():
    # Esta función define y crea una colección en Typesense llamada "recetas",
    # que almacenará los documentos con la información de cada receta.
    # Si la colección ya existe, se elimina primero para asegurar una estructura limpia.

    schema = {
        "name": "recetas",
        "fields": [
            {"name": "orden", "type": "int32"},
            {"name": "titulo", "type": "string"},
            {"name": "descripcion", "type": "string"},
            {"name": "ingredientes", "type": "string[]", "facet": True},
            {"name": "posicion_ingredientes", "type": "int32[]"},
            {"name": "ingredientes_solo", "type": "string[]"},
            {"name": "categoria", "type": "string", "facet": True},
            {"name": "dificultad", "type": "string", "facet": True},
            {"name": "url", "type": "string"},
            {"name": "imagen_url", "type": "string"},
            {"name": "porciones", "type": "string"},
            {"name": "tipoCocina", "type": "string", "facet": True},
            {"name": "dieta", "type": "string", "facet": True},
            {"name": "tipoPlato", "type": "string", "facet": True},
            {"name": "tiempo", "type": "string"},
            {"name": "instrucciones", "type": "string"}
        ],
        "default_sorting_field": "orden"
    }

    try:
        # Se intenta recuperar la colección "recetas". Si existe, se elimina para recrearla desde cero.
        client.collections["recetas"].retrieve()
        print("La colección ya existe. Eliminando para recrear...")
        client.collections["recetas"].delete()
    except typesense.exceptions.ObjectNotFound:
        # Si la colección no existe, simplemente se informa que se creará una nueva.
        print("La colección no existe. Se creará una nueva...")

    # Se crea la nueva colección con el esquema definido previamente.
    print("Creando colección 'recetas'...")
    client.collections.create(schema)


# Leer recetas desde archivo JSON
def cargar_recetas_desde_json(path=os.path.join(os.path.dirname(__file__), "recetas.json")):
    # Esta función abre y lee un archivo JSON que contiene recetas, convirtiéndolas en una lista de diccionarios.
    # Además, convierte el campo "id" de cada receta a string, lo cual es requerido por Typesense.
    try:
        with open(path, "r", encoding="utf-8") as file:
            recetas = json.load(file)
            for receta in recetas:
                receta["id"] = str(receta["id"])
            return recetas
    except Exception as e:
        # Si ocurre algún error al leer el archivo, se imprime el error y se retorna una lista vacía.
        print(f" Error leyendo JSON: {e}")
        return []


# Endpoint para cargar recetas en Typesense
@app.route("/cargar", methods=["POST"])
def cargar_recetas():
    # Este endpoint carga las recetas al servidor Typesense.
    # Primero crea la colección (eliminándola si ya existe) y luego carga los datos desde el archivo JSON.

    crear_coleccion()  # Asegura que la colección esté creada y vacía
    recetas = cargar_recetas_desde_json()  # Carga las recetas desde el archivo
    errores = []  # Lista para registrar errores de inserción
    cargadas = 0  # Contador de recetas cargadas correctamente

    for receta in recetas:
        try:
            client.collections["recetas"].documents.upsert(receta)  # Inserta o actualiza la receta en Typesense
            cargadas += 1
        except Exception as e:
            errores.append({"titulo": receta.get("titulo", "Sin título"), "error": str(e)})

    # Devuelve solo status 204 (No Content), sin cuerpo de respuesta.
    return '', 204

# Endpoint para buscar recetas
@app.route("/buscar", methods=["GET"])
def buscar():
    # Este endpoint permite realizar búsquedas simples de recetas utilizando un término (q)
    # y opcionalmente aplicar filtros por categoría y dificultad.

    q = request.args.get("q", "")  # Obtiene el término de búsqueda desde los parámetros de la URL
    categoria = request.args.get("categoria")  # Filtro opcional por categoría
    dificultad = request.args.get("dificultad")  # Filtro opcional por dificultad

    filtros = []
    if categoria:
        filtros.append(f"categoria:={categoria}")
    if dificultad:
        filtros.append(f"dificultad:={dificultad}")

    # Construye la cadena de filtros combinando los que estén presentes
    filter_by = " && ".join(filtros) if filtros else ""

    try:
        # Realiza la búsqueda en Typesense usando los campos indicados y los filtros
        results = client.collections["recetas"].documents.search({
            "q": q,
            "query_by": "titulo,descripcion,ingredientes,categoria",
            "filter_by": filter_by,
            "sort_by": "orden:asc",
            "per_page": 10  # Devuelve un máximo de 10 resultados
        })
        return jsonify(results["hits"])  # Devuelve solo los documentos encontrados
    except Exception as e:
        # En caso de error, devuelve un mensaje con código 500
        return jsonify({"error": str(e)}), 500

    
@app.route("/api/v1/buscar", methods=["GET"])
def filtrar_recetas():
    # Este endpoint permite realizar búsquedas avanzadas combinando múltiples filtros
    # como categoría, dificultad, tipo de cocina, dieta, tipo de plato, porciones y tiempo.
    # Además, permite buscar por ingredientes y términos generales.

    filtros = []
    q = request.args.get("q", "")  # Obtiene el término de búsqueda (puede ser vacío)

    campos_filtro = [
        "categoria", "dificultad", "tipoCocina",
        "dieta", "tipoPlato", "porciones", "tiempo"
    ]

    # Recorre cada campo posible y si fue proporcionado en la URL, lo añade como filtro
    for campo in campos_filtro:
        valor = request.args.get(campo)
        if valor:
            filtros.append(f'{campo}:="{valor}"')

    # También se pueden añadir ingredientes como texto para incluirlos en la búsqueda
    ingredientes = request.args.getlist("ingrediente")
    if ingredientes:
        ingredientes_query = " ".join(ingredientes)  # Une todos los ingredientes en una sola cadena
        if q == "" or not q.strip():
            q = ingredientes_query  # Si no había término de búsqueda, se usan los ingredientes como consulta
        else:
            q += " " + ingredientes_query  # Si sí había, se añaden los ingredientes a la consulta

    # Une todos los filtros para pasarlos a Typesense
    filter_by = " && ".join(filtros) if filtros else ""

    try:
        # Realiza la búsqueda en Typesense con todos los criterios
        resultados = client.collections["recetas"].documents.search({
            "q": q,
            "query_by": "titulo,descripcion,ingredientes",
            "filter_by": filter_by,
            "sort_by": "orden:asc",
            "per_page": 12  # Devuelve hasta 12 resultados
        })

        # Extrae solo la parte relevante de los resultados (los documentos encontrados)
        solo_documentos = [hit["document"] for hit in resultados["hits"]]
        return jsonify(solo_documentos)

    except Exception as e:
        # En caso de error, devuelve un mensaje con código 500
        return jsonify({"error": str(e)}), 500


@app.route("/categorias", methods=["GET"])
def obtener_categorias():
    # Este endpoint obtiene una lista de todas las categorías disponibles en las recetas,
    # utilizando el sistema de "facets" de Typesense, que permite agrupar y contar valores únicos de un campo.

    try:
        resultados = client.collections["recetas"].documents.facets.retrieve({
            "facet_by": "categoria"  # Agrupa por el campo 'categoria'
        })
        return jsonify(resultados.get("facet_counts", []))  # Devuelve la lista de categorías y sus conteos
    except Exception as e:
        # Si ocurre un error, se devuelve un mensaje con código 500
        return jsonify({"error": str(e)}), 500


@app.route("/similares/<id>", methods=["GET"])
def recetas_similares(id):
    # Este endpoint busca recetas similares a una receta específica basada en su categoría.
    # No incluye la receta original (la del id solicitado) en los resultados.

    try:
        receta = client.collections["recetas"].documents[id].retrieve()  # Obtiene la receta por su ID
        categoria = receta["categoria"]  # Extrae la categoría de la receta

        # Busca otras recetas que tengan la misma categoría pero un ID distinto
        resultados = client.collections["recetas"].documents.search({
            "q": categoria,
            "query_by": "categoria",
            "filter_by": f'id:!={id}',  # Excluye la receta original
            "per_page": 5  # Limita los resultados a 5 recetas similares
        })
        return jsonify(resultados["hits"])
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/v1/buscar_por_titulo", methods=["GET"])
def buscar_por_titulo():
    # Este endpoint permite buscar recetas filtrando por el campo "titulo" exacto o parcial.
    # Se utiliza principalmente cuando se quiere localizar una receta específica por su nombre.

    titulo = request.args.get("titulo", "").strip()  # Obtiene el valor del parámetro 'titulo'

    if not titulo:
        # Si no se proporciona un título, devuelve un error 400 (solicitud incorrecta)
        return jsonify({"error": "Falta el parámetro 'titulo'"}), 400

    try:
        # Realiza la búsqueda en el campo "titulo", ordenada por el campo "orden"
        resultados = client.collections["recetas"].documents.search({
            "q": titulo,
            "query_by": "titulo",
            "sort_by": "orden:asc"
        })

        # Extrae solo los documentos (recetas) desde los resultados
        solo_documentos = [hit["document"] for hit in resultados["hits"]]
        return jsonify(solo_documentos)

    except Exception as e:
        # Devuelve error interno en caso de excepción
        return jsonify({"error": str(e)}), 500


@app.route("/api/v1/buscar_por_ingredientes", methods=["GET"])
def buscar_por_ingredientes():
    # Este endpoint permite buscar recetas a partir de una lista de ingredientes proporcionados por el usuario.
    # Clasifica los resultados en 4 grupos según el nivel de coincidencia con los ingredientes entregados.

    ingredientes = request.args.getlist("ingrediente")  # Obtiene los ingredientes desde los parámetros de la URL

    if not ingredientes:
        # Si no se recibe ningún ingrediente, se devuelve un error 400
        return jsonify({"error": "Debe proporcionar al menos un ingrediente."}), 400

    ingredientes_set = set(map(str.lower, ingredientes))  # Se normalizan los ingredientes a minúsculas para comparar

    try:
        # 1. Buscar recetas que contengan todos los ingredientes juntos en una sola consulta
        resultados = client.collections["recetas"].documents.search({
            "q": " ".join(ingredientes),
            "query_by": "ingredientes",
            "per_page": 250
        })

        # Se clasifican los resultados en cuatro categorías:
        exactos = []     # Recetas con exactamente los mismos ingredientes
        superset = []    # Recetas que contienen todos los ingredientes, pero también más
        parciales = []   # Recetas que comparten más de un ingrediente, pero no todos
        ya_agregadas = set()  # IDs de recetas ya agregadas, para evitar duplicados

        for hit in resultados["hits"]:
            doc = hit["document"]
            receta_ingredientes = set(map(str.lower, doc.get("ingredientes_solo", [])))
            receta_id = doc.get("id")

            if receta_id in ya_agregadas:
                continue

            interseccion = receta_ingredientes & ingredientes_set

            if receta_ingredientes == ingredientes_set:
                exactos.append(doc)
            elif ingredientes_set.issubset(receta_ingredientes):
                superset.append(doc)
            elif len(interseccion) > 1:
                parciales.append(doc)

            ya_agregadas.add(receta_id)

        # 2. Buscar recetas que contengan solo uno de los ingredientes, haciendo una búsqueda individual por ingrediente
        solo_uno = []
        for ing in ingredientes_set:
            resultado_individual = client.collections["recetas"].documents.search({
                "q": ing,
                "query_by": "ingredientes",
                "per_page": 100  # Cantidad ajustable por ingrediente
            })

            for hit in resultado_individual["hits"]:
                doc = hit["document"]
                receta_id = doc.get("id")

                if receta_id not in ya_agregadas:
                    receta_ingredientes = set(map(str.lower, doc.get("ingredientes_solo", [])))
                    if ing in receta_ingredientes:
                        solo_uno.append(doc)
                        ya_agregadas.add(receta_id)

        # Se devuelve un JSON con las listas de resultados clasificados
        return jsonify({
            "exactos": exactos,
            "con_mas": superset,
            "parciales": parciales,
            "solo_uno": solo_uno
        })

    except Exception as e:
        # En caso de error, devuelve un mensaje con estado 500
        return jsonify({"error": str(e)}), 500


    
    



@app.route("/api/v1/ingredientes_agrupados", methods=["GET"])
def obtener_ingredientes_agrupados():
    # Este endpoint agrupa los ingredientes de todas las recetas en cuatro categorías:
    # granos, frutas y verduras, proteínas, y lácteos/otros.
    # La agrupación se basa en la posición indicada para cada ingrediente en el campo "posicion_ingredientes".

    try:
        granos = set()
        frutas_verduras = set()
        proteinas = set()
        lacteos_otros = set()

        page = 1
        while True:
            # Realiza una búsqueda paginada para obtener todas las recetas
            resultados = client.collections["recetas"].documents.search({
                "q": "*",  # Consulta comodín para obtener todos los documentos
                "query_by": "titulo",
                "per_page": 250,
                "page": page
            })

            hits = resultados["hits"]
            if not hits:
                # Si ya no hay más resultados, se termina el ciclo
                break

            for hit in hits:
                doc = hit["document"]
                ingredientes = doc.get("ingredientes_solo", [])  # Lista de ingredientes sin texto adicional
                posiciones = doc.get("posicion_ingredientes", [])  # Lista paralela con la posición de cada ingrediente

                # Asocia cada ingrediente a su categoría correspondiente según su posición
                for ingrediente, pos in zip(ingredientes, posiciones):
                    ingrediente = ingrediente.strip().lower()
                    if pos == 1:
                        granos.add(ingrediente)
                    elif pos == 2:
                        frutas_verduras.add(ingrediente)
                    elif pos == 3:
                        proteinas.add(ingrediente)
                    elif pos == 4:
                        lacteos_otros.add(ingrediente)

            page += 1  # Pasa a la siguiente página de resultados

        # Devuelve los ingredientes agrupados en orden alfabético dentro de cada categoría
        return jsonify({
            "granos": sorted(list(granos)),
            "frutas_verduras": sorted(list(frutas_verduras)),
            "proteinas": sorted(list(proteinas)),
            "lacteos_otros": sorted(list(lacteos_otros))
        })

    except Exception as e:
        # En caso de error, lo imprime en consola y responde con un mensaje de error
        print(f"Error en /api/v1/ingredientes_agrupados: {e}")
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    # Este bloque se ejecuta solo si el script se corre directamente (no cuando se importa como módulo).
    # Inicia el servidor Flask, escuchando en todas las interfaces de red (0.0.0.0) en el puerto 8090.
    # El modo debug está activado para desarrollo, lo que permite ver errores detallados y recargar automáticamente.

    app.run(host="0.0.0.0", port=8090, debug=True)
