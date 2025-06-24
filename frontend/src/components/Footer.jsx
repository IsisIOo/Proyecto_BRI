import '../assets/css/Footer.css'; // Puedes cambiar la ruta si usas otra estructura

function Footer() {
    return (
        <footer className="footer">
            <p>© {new Date().getFullYear()} Plataforma de Recetas. Todos los derechos reservados.</p>
        </footer>
    );
}

export default Footer;