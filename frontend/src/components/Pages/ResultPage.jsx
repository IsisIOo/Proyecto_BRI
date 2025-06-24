import {useNavigate} from "react-router-dom";
import ResultInfo from "../ResultInfo.jsx";
import Footer from "../Footer.jsx";
import "../../assets/css/ResultPage.css";

function ResultPage(){

    const navigate = useNavigate();

    const Home = () => {
        navigate('/');
    };


    return (
        <>
        <div className="page-container">
            <div className="content">
                <ResultInfo />
            </div>
            <Footer />
        </div>
        </>
    )
}

export default ResultPage;