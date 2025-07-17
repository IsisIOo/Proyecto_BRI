import { useNavigate, useLocation } from "react-router-dom";
import RecipeCard from "../RecipeCard.jsx";
import Filter from "../Filter.jsx";
import Filter2 from "../Filter2.jsx";
import Footer from "../Footer.jsx";
import '../../assets/css/SeachWeb.css';
import { useState, useEffect, useMemo } from "react";

import IngredientesBox from "../IngredientesBox.jsx";


function SearchWeb() {
    const navigate = useNavigate();
    const location = useLocation();

    // Extraemos las 3 categorías si vienen desde el backend
    
    const {
        exactos = [],
        con_mas = [],
        parciales = [],
        solo_uno = [],
        ingredientesSeleccionados = []
    } = location.state || {};


    const Home = () => {
        navigate('/');
    };

    // Combina todas las recetas para aplicar los filtros
    const todasLasRecetas = [...exactos, ...con_mas, ...parciales];

    // Estado para recetas filtradas por categoría
    const [filtradasExactas, setFiltradasExactas] = useState(exactos);
    const [filtradasConMas, setFiltradasConMas] = useState(con_mas);
    const [filtradasParciales, setFiltradasParciales] = useState(parciales);
    const [filtradasSoloUno, setFiltradasSoloUno] = useState(solo_uno);

    const [recetasNoClasificadas, setRecetasNoClasificadas] = useState([]);



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

    const aplicarFiltros = ({ plato, dieta, cocina }) => {
        const filtrar = (lista) => {
            return lista.filter((receta) => {
                const coincidePlato = plato === '' || receta.tipoPlato === plato;
                const coincideDieta = dieta === '' || receta.dieta === dieta;
                const coincideCocina = cocina === '' || receta.tipoCocina === cocina;
                return coincidePlato && coincideDieta && coincideCocina;
            });
        };

        setFiltradasExactas(filtrar(exactos));
        setFiltradasConMas(filtrar(con_mas));
        setFiltradasParciales(filtrar(parciales));
    };

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


    return (

            <div className="page-container">
                <div className="content">
                    <div className="gradient-separator" style={{ height: '220px', padding: '10px'}}>
                        <h1 onClick={Home}>Recetas del Toto del Oeste</h1>
                        <Filter />
                        <Filter2
                            onFilter={aplicarFiltros}
                            opcionesPlato={opcionesFiltro.platos}
                            opcionesDieta={opcionesFiltro.dietas}
                            opcionesCocina={opcionesFiltro.cocinas}
                        />
                    </div>

                    <div className="resultados-layout" style={{ display: 'flex', marginTop: '20px' }}>
                        {/* Columna izquierda: ingredientes seleccionados */}
                        <div style={{ flex: '1', maxWidth: '300px' }}>
                            <IngredientesBox
                                ingredientes={ingredientesSeleccionados}
                                onEditar={() => navigate('/', { state: { ingredientesSeleccionados } })}
                            />
                        </div>

                        {/* Columna derecha: recetas */}
                        <div style={{ flex: 2, marginLeft: '20px' }} className="recetas-container">
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
                                    <h6><strong>Recetas con los ingredientes exactos: </strong>No hay recetas exactas.</h6>
                                )}
                            </div>

                            {/* Recetas con más ingredientes */}
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
                                    <h6><strong>Recetas con los ingredientes seleccionados y otros más: </strong>No hay recetas con ingredientes adicionales.</h6>
                                )}
                            </div>

                            {/* Recetas parciales */}
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
                                    <h6><strong>Recetas con algunos de los ingredientes: </strong>No hay recetas parciales.</h6>
                                )}
                            </div>

                            {/* Recetas con solo uno de los ingredientes */}
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
                        </div>
                    </div>


                </div>
                <Footer />
            </div>

    );
}

export default SearchWeb;
