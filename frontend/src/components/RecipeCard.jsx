import React from 'react';
import '../assets/css/RecipeCard.css';
import {useNavigate} from "react-router-dom";

/*
* Componente para mostrar las tarjetas de recetas
* */
const RecipeCard = ({ receta }) => {
    if (!receta) return 'No se ve la receta';
    //console.log("Receta recibida en /search:", receta);

    const navigate = useNavigate();

    // enviar la receta elegida
    const RecetaInfo = () => {
        navigate('/result', { state: receta})
    }

    return (
        <div className="recipe-card">
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

            <div className="recipe-overlay"> {/*Este es el hover de la tarjeta que muetras más info de la receta y donde se puede seleccionar para verla*/}
                <p><strong>Categoría:</strong> {receta.categoria || '—'}</p>
                <p><strong>Porciones:</strong> {receta.porciones || '—'}</p>
                <p><strong>Cocina:</strong> {receta.tipoCocina || '—'}</p>
                <p><strong>Dieta:</strong> {receta.dieta || '—'}</p>
                <p><strong>Plato:</strong> {receta.tipoPlato || '—'}</p>
                <button className="ver-receta" onClick={RecetaInfo}>VER RECETA</button>
            </div>
            <div className="recipe-content"> {/*Cara principal de la receta*/}
                <h3 className="recipe-titles">{receta.titulo}</h3>
                <p className="recipe-time">Tiempo estimado: {receta.tiempo}</p>
                <button className="difficulty">{receta.dificultad}</button>
            </div>
        </div>
    );
};

export default RecipeCard;
