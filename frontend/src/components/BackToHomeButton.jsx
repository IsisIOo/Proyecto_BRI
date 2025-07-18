import { useNavigate } from "react-router-dom";
import "../assets/css/BackButton.css"; 

function BackToHomeButton() {
    const navigate = useNavigate();

    return (
        <div>
            <button
                className="back-button"
                onClick={() => navigate('/')}
            >
                ← Volver al inicio
            </button>
        </div>
    );
}

export default BackToHomeButton;
