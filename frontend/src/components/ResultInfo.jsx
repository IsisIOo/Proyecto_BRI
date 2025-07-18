import {useLocation} from "react-router-dom";
import "../assets/css/ResultInfo.css"

/** Este componente muestra en detalle la información de una receta seleccionada. 
 * Extrae los datos desde location.state 
 * usando React Router y los presenta organizados en secciones:
 * - Título de la receta
 * - Lista de ingredientes
 * - Detalles generales (tiempo, porciones, tipo de cocina, dieta, plato, dificultad)
 * - Imagen de la receta
 * - Instrucciones de preparación
 */
function ResultInfo(){
    const location = useLocation(); // Obtiene la ubicación actual y accede al estado (state) enviado por navigate
    const receta = location.state; // Extrae la receta desde el state

    if (!receta) return <p>No se recibió ninguna receta.</p>; // Si no se recibe una receta válida, muestra un mensaje de error

    return (
        <div className="result-info">
            {/* Título principal de la receta */}
            <h2 className="recipe-title">{receta.titulo}</h2>
            {/* Sección superior dividida en 3 cajas: ingredientes, detalles y foto */}
            <div className="top-section">
                {/* Caja de ingredientes */}
                <div className="ingredients-box">
                    <h3>Ingredientes</h3>
                    <ul>
                        {/* Si hay ingredientes, se listan; si no, se muestra una línea vacía */}
                        {receta.ingredientes?.length > 0 ? (
                            receta.ingredientes.map((ing, i) => (
                                <li key={i}>{ing}</li>
                            ))
                        ) : (
                            <li>—</li>
                        )}
                    </ul>
                </div>
                {/* Caja con los detalles adicionales de la receta */}
                <div className="details-box">
                    <p><strong>Tiempo receta:</strong> {receta.tiempo || '—'}</p>
                    <p><strong>Porciones:</strong> {receta.porciones || '—'}</p>
                    <p><strong>Tipo de cocina:</strong> {receta.tipoCocina || '—'}</p>
                    <p><strong>Tipo de dieta:</strong> {receta.dieta || '—'}</p>
                    <p><strong>Tipo de plato:</strong> {receta.tipoPlato || '—'}</p>
                    <p><strong>Dificultad:</strong> {receta.dificultad || '—'}</p>
                </div>
                 {/* Caja con la imagen de la receta */}
                 {/* Si hay una URL válida de imagen, la muestra; si no, usa un marcador de posición */}
                <div className="image-box">
                    {receta.imagen_url ? (
                        <img src={receta.imagen_url} alt={receta.titulo} />
                    ) : (
                        <div className="image-placeholder">Imagen de la receta</div>
                    )}
                </div>
            </div>
            {/* Sección inferior con las instrucciones de preparación */}
            <div className="preparation-box">
                <h3>Preparación</h3>
                <p>{receta.instrucciones || '—'}</p>
            </div>
        </div>
    )
}

export default ResultInfo;