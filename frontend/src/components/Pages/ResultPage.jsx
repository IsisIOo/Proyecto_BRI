import {useNavigate} from "react-router-dom";
import ResultInfo from "../ResultInfo.jsx";
import Footer from "../Footer.jsx";
import "../../assets/css/ResultPage.css";
import BackToHomeButton from "../BackToHomeButton.jsx";

/**
 * Página de resultados para búsquedas generales.
 * Muestra el título, botón para volver a inicio, y resultados procesados desde el backend mediante <ResultInfo>.
 */

function ResultPage(){

    const navigate = useNavigate(); 

    const Home = () => {
        navigate('/'); // para regresar al inicio
    };


    return (
        <>
        <div className="page-container">
            <div className="content">
                <h1 onClick={Home}>Recetas del Toto del Oeste</h1>
                <BackToHomeButton />
                <ResultInfo />
            </div>
            <Footer />
        </div>
        </>
    )
}

export default ResultPage;