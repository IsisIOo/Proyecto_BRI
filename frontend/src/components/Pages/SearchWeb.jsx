import { useNavigate, useLocation } from "react-router-dom";
import RecipeCard from "../RecipeCard.jsx";
import Filter from "../Filter.jsx";
import Filter2 from "../Filter2.jsx";
import Footer from "../Footer.jsx";
import '../../assets/css/SeachWeb.css';
import { useState, useEffect, useMemo } from "react";

import BackToHomeButton from "../BackToHomeButton.jsx";

import IngredientesBox from "../IngredientesBox.jsx";

/**
 * Página principal de resultados por búsqueda de ingredientes.
 * Muestra las recetas clasificadas en 4 categorías:
 * - Exactos: recetas que coinciden exactamente con los ingredientes.
 * - Con más: recetas que contienen los ingredientes seleccionados y otros adicionales.
 * - Parciales: recetas que coinciden con algunos (pero no todos) los ingredientes.
 * - Solo uno: recetas que contienen solo uno de los ingredientes seleccionados.
 *
 * Permite aplicar filtros por tipo de plato, dieta y cocina.
 * También muestra los ingredientes seleccionados y permite editarlos.
 *
 * Props esperadas vía `location.state`:
 * - exactos: recetas exactas
 * - con_mas: recetas con ingredientes adicionales
 * - parciales: recetas con algunos ingredientes
 * - solo_uno: recetas con uno solo
 * - ingredientesSeleccionados: lista de ingredientes seleccionados por el usuario
 */

function SearchWeb() {
    const navigate = useNavigate(); // para navegación entre rutas
    const location = useLocation(); // para acceder a los datos pasados mediante navegación (location.state)

    // Se extraen las listas de recetas clasificadas y los ingredientes seleccionados desde el backend
    const {
        exactos = [],
        con_mas = [],
        parciales = [],
        solo_uno = [],
        ingredientesSeleccionados = []
    } = location.state || {};

    // Función para volver a la página de inicio
    const Home = () => {
        navigate('/');
    };

    // Combina todas las recetas en un solo array para aplicar filtros generales
    const todasLasRecetas = [...exactos, ...con_mas, ...parciales, ...solo_uno];

    // Estado para recetas filtradas por categoría
    const [filtradasExactas, setFiltradasExactas] = useState(exactos);
    const [filtradasConMas, setFiltradasConMas] = useState(con_mas);
    const [filtradasParciales, setFiltradasParciales] = useState(parciales);
    const [filtradasSoloUno, setFiltradasSoloUno] = useState(solo_uno);

    const [recetasNoClasificadas, setRecetasNoClasificadas] = useState([]);

    /**
     * Para generar listas únicas de filtros para platos, dietas y cocinas,
     * basándose en todas las recetas disponibles.
     */
    const opcionesFiltro = useMemo(() => {
        const platos = new Set();
        const dietas = new Set();
        const cocinas = new Set();

        todasLasRecetas.forEach(receta => {
            if (receta.tipoPlato) platos.add(receta.tipoPlato);
            if (receta.dieta) dietas.add(receta.dieta);
            if (receta.tipoCocina) cocinas.add(receta.tipoCocina);
        });

        return {
            platos: Array.from(platos),
            dietas: Array.from(dietas),
            cocinas: Array.from(cocinas)
        };
    }, [todasLasRecetas]);

    /**
     * Para filtrar cada grupo de recetas según los criterios seleccionados por el usuario.
     * Se actualizan los estados de recetas filtradas por categoría.
     */
    function aplicarFiltros({ plato, dieta, cocina }) {
        const filtrar = (recetas) => recetas.filter((receta) => {
            const coincidePlato = !plato || receta.tipoPlato === plato;
            const coincideDieta = !dieta || receta.dieta === dieta;
            const coincideCocina = !cocina || receta.tipoCocina === cocina;
            return coincidePlato && coincideDieta && coincideCocina;
        });

        setFiltradasExactas(filtrar(exactos));
        setFiltradasConMas(filtrar(con_mas));
        setFiltradasParciales(filtrar(parciales));
        setFiltradasSoloUno(filtrar(solo_uno));
    }


    /**
     * Para asegurar  que los estados de recetas filtradas se sincronicen con los datos recibidos
     * cada vez que se actualizan los resultados o los ingredientes seleccionados.
     */
    useEffect(() => {
        setFiltradasExactas(exactos);
        setFiltradasConMas(con_mas);
        setFiltradasParciales(parciales);
        setFiltradasSoloUno(solo_uno);
    }, [exactos, con_mas, parciales, solo_uno, ingredientesSeleccionados]);



    // Recolectar ingredientes presentes en todas las recetas filtradas
    const ingredientesEnResultados = useMemo(() => {
        const todos = [...filtradasExactas, ...filtradasConMas, ...filtradasParciales, ...filtradasSoloUno];
        const conjunto = new Set();
        todos.forEach(receta => {
            receta.ingredientes_solo?.forEach(ing => conjunto.add(ing.toLowerCase()));
        });
        return conjunto;
    }, [filtradasExactas, filtradasConMas, filtradasParciales, filtradasSoloUno]);

    // Renderización principal del componente
    return (

            <div className="page-container">
                <div className="content">
                    {/* Encabezado con título, filtros y botón de volver */}
                    <div className="gradient-separator" style={{ minHeight: '220px', padding: '10px'}}>
                        <h1 onClick={Home} style={{ marginTop: "20px" }}>
                            Recetas del Toto del Oeste
                        </h1>
                        <Filter />
                        <Filter2
                            onFilter={aplicarFiltros}
                            opcionesPlato={opcionesFiltro.platos}
                            opcionesDieta={opcionesFiltro.dietas}
                            opcionesCocina={opcionesFiltro.cocinas}
                        />
                        
                    </div>
                    {/* Sección principal dividida en 2 columnas */}
                    <div className="resultados-layout" style={{ display: 'flex', marginTop: '15px' }}>
                        {/* Columna izquierda: botón e ingredientes seleccionados */}
                        <div style={{ flex: '1', maxWidth: '300px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <div style={{ marginBottom: '15px', alignSelf: 'stretch', display: 'flex', justifyContent: 'center' }}>
                                <BackToHomeButton />
                            </div>
                            <IngredientesBox
                                ingredientes={ingredientesSeleccionados}
                                onEditar={() => navigate('/', { state: { ingredientesSeleccionados } })}
                            />
                        </div>


                        {/* Columna derecha: secciones de recetas según clasificación */}
                        <div style={{ flex: 2, marginLeft: '20px' }} className="recetas-container">
                            {ingredientesSeleccionados.length === 1 ? (
                                <>
                                    {/* Recetas con solo uno */}
                                    {filtradasSoloUno.length > 0 && (
                                        <div className="recipe-section">
                                            <h6><strong>Recetas con el ingrediente buscado:</strong></h6>
                                            <div className="recipe-grid">
                                                {filtradasSoloUno.map((receta, index) => (
                                                    <RecipeCard key={`s-${index}`} receta={receta} />
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    {/* Recetas con ese ingrediente y otros más */}
                                    {filtradasConMas.length > 0 ? (
                                        <div className="recipe-section" style={{ paddingTop: '10px' }}>
                                            <h6><strong>Recetas con el ingrediente buscado y otros más:</strong></h6>
                                            <div className="recipe-grid">
                                                {filtradasConMas.map((receta, index) => (
                                                    <RecipeCard key={`m-${index}`} receta={receta} />
                                                ))}
                                            </div>
                                        </div>
                                    ) : (
                                        <h6><strong>Recetas con el ingrediente buscado y otros más:</strong> No se encontraron resultados adicionales.</h6>
                                    )}
                                </>
                            ) : (
                                <>
                                    {/* Recetas exactas */}
                                    <div className="recipe-section" style={{ paddingTop: '10px' }}>
                                        {filtradasExactas.length > 0 ? (
                                            <div>
                                                <h6><strong>Recetas con los ingredientes exactos:</strong></h6>
                                                <div className="recipe-grid">
                                                    {filtradasExactas.map((receta, index) => (
                                                        <RecipeCard key={`e-${index}`} receta={receta} />
                                                    ))}
                                                </div>
                                            </div>
                                        ) : (
                                            <h6><strong>Recetas con los ingredientes exactos:</strong> No hay recetas exactas.</h6>
                                        )}
                                    </div>

                                    {/* Con más */}
                                    <div className="recipe-section" style={{ paddingTop: '25px' }}>
                                        {filtradasConMas.length > 0 ? (
                                            <div>
                                                <h6><strong>Recetas con los ingredientes seleccionados y otros más:</strong></h6>
                                                <div className="recipe-grid">
                                                    {filtradasConMas.map((receta, index) => (
                                                        <RecipeCard key={`m-${index}`} receta={receta} />
                                                    ))}
                                                </div>
                                            </div>
                                        ) : (
                                            <h6><strong>Recetas con los ingredientes seleccionados y otros más:</strong> No hay recetas con ingredientes adicionales.</h6>
                                        )}
                                    </div>

                                    {/* Parciales */}
                                    <div className="recipe-section" style={{ paddingTop: '25px' }}>
                                        {filtradasParciales.length > 0 ? (
                                            <div>
                                                <h6><strong>Recetas con algunos de los ingredientes:</strong></h6>
                                                <div className="recipe-grid">
                                                    {filtradasParciales.map((receta, index) => (
                                                        <RecipeCard key={`p-${index}`} receta={receta} />
                                                    ))}
                                                </div>
                                            </div>
                                        ) : (
                                            <h6><strong>Recetas con algunos de los ingredientes:</strong> No hay recetas parciales.</h6>
                                        )}
                                    </div>

                                    {/* Solo uno */}
                                    <div className="recipe-section" style={{ paddingTop: '25px' }}>
                                        {filtradasSoloUno.length > 0 ? (
                                            <div>
                                                <h6><strong>Recetas con solo uno de los ingredientes:</strong></h6>
                                                <div className="recipe-grid">
                                                    {filtradasSoloUno.map((receta, index) => (
                                                        <RecipeCard key={`s-${index}`} receta={receta} />
                                                    ))}
                                                </div>
                                            </div>
                                        ) : (
                                            <h6><strong>Recetas con solo uno de los ingredientes:</strong> No hay recetas con un solo ingrediente.</h6>
                                        )}
                                    </div>
                                </>
                            )}

                        </div>
                    </div>


                </div>
                {/* Pie de la página */}
                <Footer />
            </div>

    );
}

export default SearchWeb;
