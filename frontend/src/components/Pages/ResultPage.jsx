import {useNavigate} from "react-router-dom";
import ResultInfo from "../ResultInfo.jsx";
import Footer from "../Footer.jsx";
import "../../assets/css/ResultPage.css";
import BackToHomeButton from "../BackToHomeButton.jsx";

function ResultPage(){

    const navigate = useNavigate();

    const Home = () => {
        navigate('/');
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