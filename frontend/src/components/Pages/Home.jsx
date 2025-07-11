import Filter from "../Filter.jsx";
import Plate from "../Plate.jsx";
import Footer from "../Footer.jsx";
import '../../assets/css/Home.css';

function Home() {
    return (
        <>
        <div className="page-container">
            <div className="content">
                <div className="gradient-separator">
                    <br />
                    <h1>Recetas del Toto del oeste</h1>
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