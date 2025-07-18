import { useState } from 'react';
import '../assets/css/Filter.css';
import { useNavigate } from 'react-router-dom';
import recetas from "../services/recetas";

/**
 * Componente de filtro inicial para búsqueda.
 * Permite seleccionar ingredientes desde la página del inicio.
 */


function Filter() {
    const [buscar, setBuscar] = useState(''); // para almacenar el texto de búsqueda
    const navigate = useNavigate(); // para redirigir al usuario
    
    // Llama al backend para buscar recetas por título y navega a la vista de resultados
    const buscarPorTitulo = async () => {
        try {
            const response = await recetas.buscarRecetasPorTitulo(buscar); 
            const resultados = response.data; 
            // Navega a la vista de resultados, pasando título y resultados por location.state
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
    // manejo el envío del formulario
    const handleSubmit = (e) => {
        e.preventDefault(); // evita que se recargue la página
        if (buscar.trim() !== '') {
            buscarPorTitulo(); // ejecuta la búsqueda si el campo no está vacío
        }
    };
    // Renderiza el formulario de búsqueda
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
