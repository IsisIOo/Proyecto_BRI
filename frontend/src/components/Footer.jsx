import '../assets/css/Footer.css'; 

/**
 * Pie de página estándar que aparece en todas las páginas.
 */

function Footer() {
    return (
        <footer className="footer">
            <p>© {new Date().getFullYear()} Plataforma de Recetas. Todos los derechos reservados.</p>
        </footer>
    );
}

export default Footer;