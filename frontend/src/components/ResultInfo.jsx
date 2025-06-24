import {useLocation} from "react-router-dom";
import "../assets/css/ResultInfo.css"

function ResultInfo(){
    const location = useLocation();
    const receta = location.state;

    if (!receta) return <p>No se recibió ninguna receta.</p>;

    return (
        <div className="result-info">
            <h1 className="recipe-title">{receta.titulo}</h1>

            <div className="top-section">
                <div className="ingredients-box">
                    <h3>Ingredientes</h3>
                    <ul>
                        {receta.ingredientes?.length > 0 ? (
                            receta.ingredientes.map((ing, i) => (
                                <li key={i}>{ing}</li>
                            ))
                        ) : (
                            <li>—</li>
                        )}
                    </ul>
                </div>

                <div className="details-box">
                    <p><strong>Tiempo receta:</strong> {receta.tiempo || '—'}</p>
                    <p><strong>Porciones:</strong> {receta.porciones || '—'}</p>
                    <p><strong>Tipo de cocina:</strong> {receta.tipoCocina || '—'}</p>
                    <p><strong>Tipo de dieta:</strong> {receta.dieta || '—'}</p>
                    <p><strong>Tipo de plato:</strong> {receta.tipoPlato || '—'}</p>
                    <p><strong>Dificultad:</strong> {receta.dificultad || '—'}</p>
                </div>

                <div className="image-box">
                    {receta.imagen_url ? (
                        <img src={receta.imagen_url} alt={receta.titulo} />
                    ) : (
                        <div className="image-placeholder">Imagen de la receta</div>
                    )}
                </div>
            </div>

            <div className="preparation-box">
                <h3>Preparación</h3>
                <p>{receta.instrucciones || '—'}</p>
            </div>
        </div>
    )
}

export default ResultInfo;