import { useState } from 'react';
import '../assets/css/Filter.css';
import { useNavigate } from 'react-router-dom';
import recetas from "../services/recetas";

function Filter() {
    const [buscar, setBuscar] = useState('');
    const navigate = useNavigate();

    const buscarPorTitulo = async () => {
        try {
            const response = await recetas.buscarRecetasPorTitulo(buscar);
            const resultados = response.data;

            navigate('/search-title', {
                state: {
                    titulo: buscar,
                    resultados
                }
            });

        } catch (error) {
            console.error("Error al buscar receta por título:", error);
            alert("No se pudieron obtener resultados de la búsqueda.");
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (buscar.trim() !== '') {
            buscarPorTitulo();
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
