# pullear la imagen del docker: 
# docker run -p 8108:8108 -v C:\typesense-data:/data typesense/typesense:0.25.2 --data-dir /data --api-key=xyz --listen-port=8108

# librerias a instalar: pip install flask typesense

# Configuración de Typesense
from flask import Flask, jsonify, request
from flask_cors import CORS
import typesense
import json
import os

app = Flask(__name__)

CORS(app)   # Esto habilita CORS para todas las rutas y orígenes

# Configuración de Typesense
client = typesense.Client({
    "nodes": [{"host": "typesense", "port": "8108", "protocol": "http"}],
    "api_key": "xyz",
    "connection_timeout_seconds": 2
})

# Crear colección si no existe
def crear_coleccion():
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
        client.collections["recetas"].retrieve()
        print("La colección ya existe. Eliminando para recrear...")
        client.collections["recetas"].delete()
    except typesense.exceptions.ObjectNotFound:
        print("La colección no existe. Se creará una nueva...")

    print("Creando colección 'recetas'...")
    client.collections.create(schema)


# Leer recetas desde archivo JSON
def cargar_recetas_desde_json(path=os.path.join(os.path.dirname(__file__), "recetas.json")):
    try:
        with open(path, "r", encoding="utf-8") as file:
            recetas = json.load(file)
            for receta in recetas:
                receta["id"] = str(receta["id"])
            return recetas
    except Exception as e:
        print(f" Error leyendo JSON: {e}")
        return []


# Endpoint para cargar recetas en Typesense
@app.route("/cargar", methods=["POST"])
def cargar_recetas():
    crear_coleccion()
    recetas = cargar_recetas_desde_json()
    errores = []
    cargadas = 0

    for receta in recetas:
        try:
            client.collections["recetas"].documents.upsert(receta)
            cargadas += 1
        except Exception as e:
            errores.append({"titulo": receta.get("titulo", "Sin título"), "error": str(e)})

    # Devuelve solo status 204 No Content sin cuerpo
    return '', 204

# Endpoint para buscar recetas
@app.route("/buscar", methods=["GET"])
def buscar():
    q = request.args.get("q", "")
    categoria = request.args.get("categoria")
    dificultad = request.args.get("dificultad")

    filtros = []
    if categoria:
        filtros.append(f"categoria:={categoria}")
    if dificultad:
        filtros.append(f"dificultad:={dificultad}")

    filter_by = " && ".join(filtros) if filtros else ""

    try:
        results = client.collections["recetas"].documents.search({
            "q": q,
            "query_by": "titulo,descripcion,ingredientes,categoria",
            "filter_by": filter_by,
            "sort_by": "orden:asc",
            "per_page": 10
        })
        return jsonify(results["hits"])
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@app.route("/api/v1/buscar", methods=["GET"])
def filtrar_recetas():
    filtros = []
    q = request.args.get("q", "")

    campos_filtro = [
        "categoria", "dificultad", "tipoCocina",
        "dieta", "tipoPlato", "porciones", "tiempo"
    ]

    for campo in campos_filtro:
        valor = request.args.get(campo)
        if valor:
            filtros.append(f'{campo}:="{valor}"')

    # Obtener lista de ingredientes como texto parcial, los agregamos a q
    ingredientes = request.args.getlist("ingrediente")
    if ingredientes:
        ingredientes_query = " ".join(ingredientes)  # los unimos como texto
        if q == "" or not q.strip():
            q = ingredientes_query
        else:
            q += " " + ingredientes_query

    filter_by = " && ".join(filtros) if filtros else ""

    try:
        resultados = client.collections["recetas"].documents.search({
            "q": q,
            "query_by": "titulo,descripcion,ingredientes",
            "filter_by": filter_by,
            "sort_by": "orden:asc",
            "per_page": 12
        })

        solo_documentos = [hit["document"] for hit in resultados["hits"]]
        return jsonify(solo_documentos)

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/categorias", methods=["GET"])
def obtener_categorias():
    try:
        resultados = client.collections["recetas"].documents.facets.retrieve({
            "facet_by": "categoria"
        })
        return jsonify(resultados.get("facet_counts", []))
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/similares/<id>", methods=["GET"])
def recetas_similares(id):
    try:
        receta = client.collections["recetas"].documents[id].retrieve()
        categoria = receta["categoria"]
        resultados = client.collections["recetas"].documents.search({
            "q": categoria,
            "query_by": "categoria",
            "filter_by": f'id:!={id}',
            "per_page": 5
        })
        return jsonify(resultados["hits"])
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/v1/buscar_por_titulo", methods=["GET"])
def buscar_por_titulo():
    titulo = request.args.get("titulo", "").strip()

    if not titulo:
        return jsonify({"error": "Falta el parámetro 'titulo'"}), 400

    try:
        resultados = client.collections["recetas"].documents.search({
            "q": titulo,
            "query_by": "titulo",
            "sort_by": "orden:asc"
        })

        solo_documentos = [hit["document"] for hit in resultados["hits"]]
        return jsonify(solo_documentos)

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/v1/ingredientes_agrupados", methods=["GET"])
def obtener_ingredientes_agrupados():
    try:
        granos = set()
        frutas_verduras = set()
        proteinas = set()
        lacteos_otros = set()

        page = 1
        while True:
            resultados = client.collections["recetas"].documents.search({
                "q": "*",
                "query_by": "titulo",
                "per_page": 250,
                "page": page
            })

            hits = resultados["hits"]
            if not hits:
                break

            for hit in hits:
                doc = hit["document"]
                ingredientes = doc.get("ingredientes_solo", [])
                posiciones = doc.get("posicion_ingredientes", [])

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

            page += 1

        return jsonify({
            "granos": sorted(list(granos)),
            "frutas_verduras": sorted(list(frutas_verduras)),
            "proteinas": sorted(list(proteinas)),
            "lacteos_otros": sorted(list(lacteos_otros))
        })

    except Exception as e:
        print(f"Error en /api/v1/ingredientes_agrupados: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8090, debug=True)
