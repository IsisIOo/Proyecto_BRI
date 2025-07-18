import { useNavigate } from "react-router-dom";
import "../assets/css/BackButton.css"; 

/**
 * Botón que redirige al usuario de vuelta a la página principal (Home).
 */

function BackToHomeButton() {
    const navigate = useNavigate(); // para iniciar la función de navegación

    return (
        <div>
            <button
                className="back-button"
                onClick={() => navigate('/')} // Al hacer clic, vuelve a la página de inicio "/"
            >
                ← Volver al inicio
            </button>
        </div>
    );
}

export default BackToHomeButton;
