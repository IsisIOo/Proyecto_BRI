import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import RecipeCard from "../RecipeCard.jsx";
import Footer from "../Footer.jsx";
import Filter from "../Filter.jsx";
import Filter2 from "../Filter2.jsx";
import '../../assets/css/SeachWeb.css';

function SearchByTitle() {
    const location = useLocation();
    const navigate = useNavigate();

    const recetasOriginales = location.state?.resultados || [];
    const tituloBuscado = location.state?.titulo || '';

    const [recetasFiltradas, setRecetasFiltradas] = useState(recetasOriginales);

    const volverInicio = () => navigate('/');

    // Generar opciones únicas para los filtros
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

    // Aplicar filtros
    const aplicarFiltros = ({ plato, dieta, cocina }) => {
        const filtradas = recetasOriginales.filter((receta) => {
            const coincidePlato = plato === '' || receta.tipoPlato === plato;
            const coincideDieta = dieta === '' || receta.dieta === dieta;
            const coincideCocina = cocina === '' || receta.tipoCocina === cocina;
            return coincidePlato && coincideDieta && coincideCocina;
        });

        setRecetasFiltradas(filtradas);
    };

    useEffect(() => {
        setRecetasFiltradas(recetasOriginales);
    }, [recetasOriginales]);

    return (
        <div className="page-container">
            <div className="content">
                <div className="gradient-separator" style={{ height: '220px', padding: '10px' }}>
                    <h1 onClick={volverInicio}>Recetas del Toto del Oeste</h1>
                    <Filter />
                    <Filter2
                        onFilter={aplicarFiltros}
                        opcionesPlato={opcionesFiltro.platos}
                        opcionesDieta={opcionesFiltro.dietas}
                        opcionesCocina={opcionesFiltro.cocinas}
                    />
                    <h5 style={{ marginTop: '30px' }}>Resultados para: <em>{tituloBuscado}</em></h5>
                </div>

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
            <Footer />
        </div>
    );
}

export default SearchByTitle;
