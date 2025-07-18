import Filter from "../Filter.jsx";
import Plate from "../Plate.jsx";
import Footer from "../Footer.jsx";
import '../../assets/css/Home.css';

/**
 * Página principal del proyecto.
 * Muestra el título y el componente <Filter> para iniciar una búsqueda.
 * Luego renderiza <Plate> con contenido destacado o recetas generales.
 */

function Home() {
    return (
        <>
        <div className="page-container">
            <div className="content">
                <div className="gradient-separator">
                    <br />
                    <h1>Recetas del Toto del Oeste</h1>
                    <Filter />
                </div>
                <Plate />
            </div>
            <Footer/>
        </div>
        </>
    );
}

export default Home;