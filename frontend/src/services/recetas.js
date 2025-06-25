import httpClient from "../http-common";
import qs from 'qs';

/* if (!ingredientesFinales || ingredientesFinales.length === 0) {
                response = await axios.get("http://localhost:5000/api/v1/buscar", {
                    params: { q: '*' }
                });
            } else {
                // Buscar por múltiples ingredientes
                response = await axios.get("http://localhost:5000/api/v1/buscar", {
                    params: { ingrediente: ingredientesFinales } , // Esto genera ?ingrediente=...&ingrediente=...
                    paramsSerializer: params => qs.stringify(params, { arrayFormat: 'repeat' })
                });
            }
*/

const buscarTodasLasRecetas = (todas) => {
    return httpClient.get("/api/v1/buscar", {
        params: { q: todas},
    });
}

const buscarRecetasPorIngredientes = (ingredientes) => {
    return httpClient.get("/api/v1/buscar", {
        params: { ingrediente: ingredientes },
        paramsSerializer: params => qs.stringify(params, { arrayFormat: 'repeat' })
    });
}

const buscarRecetasPorTitulo = (titulo) => {
    return httpClient.get("/api/v1/buscar_por_titulo", {
        params: { titulo }
    });
}

/*  await axios.post("http://localhost:5000/cargar"); */
const cargarRecetas = () => {
    return httpClient.post("/cargar");
}

export default {
    buscarTodasLasRecetas,
    buscarRecetasPorIngredientes,
    buscarRecetasPorTitulo,
    cargarRecetas
};
