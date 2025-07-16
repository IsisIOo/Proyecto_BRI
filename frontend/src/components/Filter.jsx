import { useState } from 'react';
import '../assets/css/Filter.css';
import { useNavigate } from 'react-router-dom';
import recetas from "../services/recetas";

function Filter() {
    const [buscar, setBuscar] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault(); // Evita que se recargue la página

        try {
            // Busca recetas por título
            const response = await recetas.buscarRecetasPorTitulo(buscar);

            const resultados = response.data;

            // Redirige a /search con los resultados
            navigate('/search', { state: resultados });

        } catch (error) {
            console.error("Error al buscar por título:", error);
            alert("Error al buscar recetas. Intenta nuevamente.");
        }
    };

    return (
        <form className="d-flex mb-3" role="search" onSubmit={handleSubmit}>
            <input
                className="form-control me-2"
                type="search"
                placeholder="Buscar receta por título..."
                aria-label="Buscar"
                value={buscar}
                onChange={(e) => setBuscar(e.target.value)}
            />
            <button className="button" type="submit">
                Buscar
            </button>
        </form>
    );
}

export default Filter;