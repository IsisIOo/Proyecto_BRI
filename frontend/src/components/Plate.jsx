import '../assets/css/Plate.css';
import '../assets/css/IngredientSelect.css';
import plateImage from '../assets/food_plate.png';
import Modal from './Modal';
import {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import recetas from "../services/recetas";


function Plate() {

    /*Esto es para modificar la posición del cuadro de Ingredientes seleccionados*/
    const getOppositePositionClass = (position) => {
        if (position === 'left') return 'ingredientes-right';
        if (position === 'right') return 'ingredientes-left';
        return 'ingredientes-left'; // por defecto aparece a la izquierda
    };

    const navigate = useNavigate(); // navegar

    /*Para guardar los ingredientes elegidos*/
    const [ingredientesFinales, setIngredientesFinales] = useState([]);

    /*Para manejar la selección*/
    const agregarIngredientesSeleccionados = (seleccionados) => {
        setIngredientesFinales(prev => [...new Set([...prev, ...seleccionados])]);
    };

    /* Para eliminar ingredientes*/
    const eliminarIngrediente = (nombre) => {
        setIngredientesFinales(prev => prev.filter(item => item !== nombre));
    };

    /*Para traer las recetas por ingredientes, por ahora es estatico*/
    const buscarRecetaIngrediente = async () => {
        try {
            await recetas.cargarRecetas(); // Carga las recetas al iniciar

            let response;

            // Si no hay ingredientes, hacer búsqueda general con ?q=*
            if (!ingredientesFinales || ingredientesFinales.length === 0) {
                response = await recetas.buscarTodasLasRecetas("*");
            } else {
                // Buscar por múltiples ingredientes
                response = await recetas.buscarRecetasPorIngredientes(ingredientesFinales);
            }

            const recetasDesdeBackend = response.data;

            // Redirigir a la página de búsqueda con las recetas como estado
            navigate('/search', { state: recetasDesdeBackend });

        } catch (error) {
            console.error("Error al buscar recetas por ingredientes:", error);
            alert("No se pudieron obtener recetas del backend.");
        }
    };


    /* Controles del modal */
    const [modalOpen, setModalOpen] = useState(false);
    const [modalData, setModalData] = useState({ title: '', content: [] });
    const [activeSector, setActiveSector] = useState(null);

    /* Para abrir el modal */
    const handleSectorClick = (title, content, position, sectorKey) => {
        if (activeSector === sectorKey) {
            // Si haces clic en el mismo sector, cierra el modal
            setModalOpen(false);
            setActiveSector(null);
        } else {
            // Si haces clic en un sector diferente, abre el modal con nueva info
            setModalOpen(false);
            setTimeout(() => {
                setModalData({ title, content, position });
                setActiveSector(sectorKey);
                setModalOpen(true);
            }, 100);
        }
    };

    /* Listas de ingredientes, elegidos según la posición en el plato*/
    /* Nota: Hay que ordenarlos por abededario*/
    const [upLeft, setUpLeft] = useState([]);
    const [upRight, setUpRight] = useState([]);
    const [downLeft, setDownLeft] = useState([]);
    const [downRight, setDownRight] = useState([]);

    useEffect(() => {
        const cargarTodo = async () => {
            try {
                // primero espera las recetas
                await recetas.cargarRecetas();

                const response = await recetas.obtenerIngredientesAgrupados();
                const data = response.data;

                setUpLeft(data.granos); // granos y derivados
                setUpRight(data.frutas_verduras); // frutas y verduras
                setDownLeft(data.proteinas); // proteínas
                setDownRight(data.lacteos_otros); // lácteos y otros

            } catch (error) {
                console.error("Error cargando recetas o ingredientes:", error);
            }
        };

        cargarTodo();
    }, []);


    return (
        <>
            {/*Se muestra el plato y sus secciones*/}
            <div className="svg-plate-container">
                <svg viewBox="0 0 400 400" className="svg-plate">
                    <defs>
                        <clipPath id="circleClip">
                            <circle cx="200" cy="200" r="200" />
                        </clipPath>
                        <pattern id="plateImage" patternUnits="userSpaceOnUse" width="400" height="400">
                            <image href={plateImage} x="0" y="0" width="400" height="400" preserveAspectRatio="xMidYMid slice" />
                        </pattern>
                    </defs>

                    <circle cx="200" cy="200" r="200" fill="url(#plateImage)" clipPath="url(#circleClip)" />

                    <g clipPath="url(#circleClip)">
                        <rect
                            x="0"
                            y="0"
                            width="200"
                            height="200"
                            className={`sector-overlay ${activeSector === 'up_left' ? 'active' : ''}`}
                            onClick={() => handleSectorClick('Granos y derivados', upLeft, 'left', 'up_left')}
                        />
                        <rect
                            x="200"
                            y="0"
                            width="200"
                            height="200"
                            className={`sector-overlay ${activeSector === 'up_right' ? 'active' : ''}`}
                            onClick={() => handleSectorClick('Frutas y Verduras', upRight, 'right', 'up_right')}
                        />
                        <rect
                            x="0"
                            y="200"
                            width="200"
                            height="200"
                            className={`sector-overlay ${activeSector === 'down_left' ? 'active' : ''}`}
                            onClick={() => handleSectorClick('Proteínas', downLeft, 'left', 'down_left')}
                        />
                        <rect
                            x="200"
                            y="200"
                            width="200"
                            height="200"
                            className={`sector-overlay ${activeSector === 'down_right' ? 'active' : ''}`}
                            onClick={() => handleSectorClick('Lácteos y otros', downRight, 'right', 'down_right')}
                        />
                    </g>
                </svg>

                {/*Se muestra la carta de ingredientes seleccionados*/}
                <div className={`ingredientes-finales card shadow ${getOppositePositionClass(modalData.position)}`}>
                    <div className="card-body">
                        <h5 className="card-title">Ingredientes seleccionados</h5>
                        {ingredientesFinales.length === 0 ? (
                            <p className="text-muted">No tienes ingredientes seleccionados</p>
                        ) : (
                            <ul className="list-group list-group-flush ingredientes-scroll">
                                {ingredientesFinales.map((item, index) => (
                                    <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
                                        {item}
                                        <button
                                            className="btn btn-sm btn-outline-danger"
                                            onClick={() => eliminarIngrediente(item)}
                                        >
                                            ✕
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>

                {/*Para controlar el contenido del modal una vez abierto*/}
                {modalOpen && (
                    <Modal
                        title={modalData.title}
                        content={modalData.content}
                        position={modalData.position}
                        onClose={() => {
                            setModalOpen(false);
                            setActiveSector(null);
                        }}
                        onSelect={agregarIngredientesSeleccionados}
                    />
                )}
            </div>

            {/*Botón que hace la búsqueda por ingredientes*/}
            <button onClick={buscarRecetaIngrediente} className="receta-button">Buscar Receta</button>

        </>

    );
}

export default Plate;
