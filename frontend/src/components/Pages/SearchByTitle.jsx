import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import RecipeCard from "../RecipeCard.jsx";
import Footer from "../Footer.jsx";
import Filter from "../Filter.jsx";
import Filter2 from "../Filter2.jsx";
import '../../assets/css/SeachWeb.css';
import BackToHomeButton from "../BackToHomeButton.jsx";

/**
 * Página que muestra recetas filtradas por título.
 * Permite aplicar filtros secundarios por tipo de plato, dieta o cocina mediante <Filter2>.
 * La lista de recetas filtradas se actualiza dinámicamente según los filtros.
 *
 * Props esperadas vía `location.state`:
 * - resultados: lista de recetas originales
 * - titulo: título buscado
 */


function SearchByTitle() {
    const location = useLocation(); // para acceder a los datos pasados por navegación (como resultados y título)
    const navigate = useNavigate(); // para redirigir al usuario a otra ruta

    const recetasOriginales = location.state?.resultados || []; // para extraer las recetas recibidas desde la navegación, o lista vacía si no hay
    const tituloBuscado = location.state?.titulo || ''; // para extraer el título buscado para mostrarlo en pantalla

    const [recetasFiltradas, setRecetasFiltradas] = useState(recetasOriginales); // para guardar las recetas filtradas según los filtros aplicados

    const volverInicio = () => navigate('/'); // Función para volver a la página de inicio

    /**
     * Crea listas únicas de opciones para los filtros:
     * - tipo de plato
     * - tipo de dieta
     * - tipo de cocina
     * Se usa useMemo para que solo se recalculen si cambian las recetas originales
     */
    const opcionesFiltro = useMemo(() => {
        const platos = new Set();
        const dietas = new Set();
        const cocinas = new Set();

        recetasOriginales.forEach(receta => {
            if (receta.tipoPlato) platos.add(receta.tipoPlato);
            if (receta.dieta) dietas.add(receta.dieta);
            if (receta.tipoCocina) cocinas.add(receta.tipoCocina);
        });

        return {
            platos: Array.from(platos),
            dietas: Array.from(dietas),
            cocinas: Array.from(cocinas)
        };
    }, [recetasOriginales]);

    /**
     * Función que aplica los filtros seleccionados por el usuario.
     * Compara cada receta y se queda solo con las que cumplan los filtros seleccionados.
     */
    const aplicarFiltros = ({ plato, dieta, cocina }) => {
        const filtradas = recetasOriginales.filter((receta) => {
            const coincidePlato = plato === '' || receta.tipoPlato === plato;
            const coincideDieta = dieta === '' || receta.dieta === dieta;
            const coincideCocina = cocina === '' || receta.tipoCocina === cocina;
            return coincidePlato && coincideDieta && coincideCocina;
        });
        // Actualiza las recetas mostradas en pantalla
        setRecetasFiltradas(filtradas);
    };

    /**
     * useEffect que asegura que al cambiar las recetas originales
     * (por ejemplo, al volver atrás y buscar otro título), se reinicie el listado filtrado.
     */
    useEffect(() => {
        setRecetasFiltradas(recetasOriginales);
    }, [recetasOriginales]);
    // Renderización del componente
    return (
        <div className="page-container">
            <div className="content">
                <div className="gradient-separator" style={{ minHeight: '220px', padding: '10px' }}>
                    {/* Título principal clickeable que redirige a inicio */}
                    <h1 onClick={volverInicio} style={{ marginTop: "20px" }}>
                        Recetas del Toto del Oeste
                    </h1>
                    {/* Filtro de ingredientes (global) */}
                    <Filter />
                    {/* Filtros específicos por tipo de cocina, dieta, y tipo de plato */}
                    <Filter2
                        onFilter={aplicarFiltros}
                        opcionesPlato={opcionesFiltro.platos}
                        opcionesDieta={opcionesFiltro.dietas}
                        opcionesCocina={opcionesFiltro.cocinas}
                    />
                    {/* Botón para volver al inicio */}
                    <BackToHomeButton />
                    {/* Para mostrar el título buscado como contexto */}
                    <h5 style={{ marginTop: '30px', marginBottom: '40px' }}>Resultados para: <em>{tituloBuscado}</em></h5>
                </div>
                 {/* Sección que muestra las recetas filtradas o mensaje de error si no hay resultados */}
                <div className="recipe-section" style={{ paddingTop: '50px' }}>
                    {recetasFiltradas.length > 0 ? (
                        <div className="recipe-grid">
                            {recetasFiltradas.map((receta, index) => (
                                <RecipeCard key={index} receta={receta} />
                            ))}
                        </div>
                    ) : (
                        <p>No se encontraron recetas con ese título y filtros aplicados.</p>
                    )}
                </div>
            </div>
            {/* Pie de la página */}
            <Footer />
        </div>
    );
}

export default SearchByTitle;
