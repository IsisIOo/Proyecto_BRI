import React from 'react';
import '../assets/css/RecipeCard.css';
import {useNavigate} from "react-router-dom";

/**
 * Componente que representa visualmente una receta. Corresponde al surrogate
 * Muestra su nombre, imagen y datos básicos.
 *
 * Props:
 * - receta: objeto de receta a renderizar
 */

const RecipeCard = ({ receta }) => {
    // Si no se recibe una receta válida, muestra un mensaje de que no se ve la receta
    if (!receta) return 'No se ve la receta';

    const navigate = useNavigate(); // para redireccionar a otra vista

    // Función que redirige a la vista de detalles de la receta
    const RecetaInfo = () => {
        navigate('/result', { state: receta}) // Navega y pasa la receta seleccionada
    }

    return (
        <div className="recipe-card">
            {/* Muestra la imagen de la receta si existe, de lo contrario un placeholder */}
            {receta.imagen_url ? (
                <img
                    src={receta.imagen_url}
                    alt={receta.titulo}
                    className="recipe-image"
                />
            ) : (
                <div className="recipe-image placeholder-image">
                    <span>Sin imagen</span>
                </div>
            )}
            {/* Overlay que aparece al hacer hover con más información */}
            <div className="recipe-overlay"> {/*Este es el hover de la tarjeta que muetras más info de la receta y donde se puede seleccionar para verla*/}
                <p><strong>Categoría:</strong> {receta.categoria || '—'}</p>
                <p><strong>Porciones:</strong> {receta.porciones || '—'}</p>
                <p><strong>Cocina:</strong> {receta.tipoCocina || '—'}</p>
                <p><strong>Dieta:</strong> {receta.dieta || '—'}</p>
                <p><strong>Plato:</strong> {receta.tipoPlato || '—'}</p>
                <button className="ver-receta" onClick={RecetaInfo}>VER RECETA</button>
            </div>
            {/* Contenido visible de la tarjeta (fuera del hover) */}
            <div className="recipe-content"> {/*Cara principal de la receta*/}
                <h3 className="recipe-titles">{receta.titulo}</h3>
                <p className="recipe-time">Tiempo estimado: {receta.tiempo}</p>
                <button className="difficulty">{receta.dificultad}</button>
            </div>
        </div>
    );
};

export default RecipeCard;
