import { useState } from 'react';
import '../assets/css/Filter.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Filter() {
    const [buscar, setBuscar] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault(); // Evita que se recargue la página

        try {
            const response = await axios.get("http://localhost:5000/api/v1/buscar_por_titulo", {
                params: { titulo: buscar }
            });

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
                placeholder="Buscar recerta por título..."
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