import { useNavigate, useLocation } from "react-router-dom";
import RecipeCard from "../RecipeCard.jsx";
import Filter from "../Filter.jsx";
import Filter2 from "../Filter2.jsx";
import Footer from "../Footer.jsx";
import '../../assets/css/SeachWeb.css';
import { useState, useEffect, useMemo } from "react";

/*
* Componente que muestra la página de busquedas intermedias, en donde puedes aplicar más filtros antes de elegir la
* receta que finalmente vez
* */
function SearchWeb() {

    /* Para moverse a otra página y recuperar la información de recetas estaticas*/
    const navigate = useNavigate();
    const location = useLocation();
    const recetas = location.state || [];

    // Estado para recetas filtradas
    const [recetasFiltradas, setRecetasFiltradas] = useState(recetas);

    const Home = () => {
        navigate('/');
    };

    // Calcular las opciones únicas para cada filtro
    const opcionesFiltro = useMemo(() => {
        const platos = new Set();
        const dietas = new Set();
        const cocinas = new Set();

        recetas.forEach(receta => {
            if (receta.tipoPlato) platos.add(receta.tipoPlato);
            if (receta.dieta) dietas.add(receta.dieta);
            if (receta.tipoCocina) cocinas.add(receta.tipoCocina);
        });

        return {
            platos: Array.from(platos),
            dietas: Array.from(dietas),
            cocinas: Array.from(cocinas)
        };
    }, [recetas]);


    const aplicarFiltros = ({ plato, dieta, cocina }) => {
        const filtradas = recetas.filter((receta) => {
            const coincidePlato = plato === '' || receta.tipoPlato === plato;
            const coincideDieta = dieta === '' || receta.dieta === dieta;
            const coincideCocina = cocina === '' || receta.tipoCocina === cocina;
            return coincidePlato && coincideDieta && coincideCocina;
        });

        setRecetasFiltradas(filtradas);
    };

    // Cambiar la lista original de recetas para que aparezcan las recetas con los filtros
    useEffect(() => {
        setRecetasFiltradas(recetas);
    }, [recetas]);

    return (
        <>  
            <div className="page-container">
                <div className="content">
                    <div className="gradient-separator" style={{ height: '220px' }}>

                    <h1 onClick={Home}>Recetas del Toto del oeste</h1>
                    <Filter />
                    <Filter2
                        onFilter={aplicarFiltros}
                        opcionesPlato={opcionesFiltro.platos}
                        opcionesDieta={opcionesFiltro.dietas}
                        opcionesCocina={opcionesFiltro.cocinas}
                    />
                    </div>
                    <div className="recipe-grid">
                        {recetasFiltradas.length > 0 ? (
                            recetasFiltradas.map((receta, index) => (
                                <RecipeCard key={index} receta={receta} />
                            ))
                        ) : (
                            <p>No se encontraron recetas.</p>
                        )}
                    </div>
                </div>
                <Footer />
            </div>
        </>
    );
}

export default SearchWeb;
