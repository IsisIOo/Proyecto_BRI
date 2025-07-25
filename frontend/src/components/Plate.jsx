import '../assets/css/Plate.css';
import '../assets/css/IngredientSelect.css';
import plateImage from '../assets/food_plate.png';
import Modal from './Modal';
import {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import recetas from "../services/recetas";
import { useLocation } from "react-router-dom";

/**
 * Componente usado en la página principal (<Home />) para mostrar recetas sugeridas o destacadas.
 */

function Plate() {
    const location = useLocation();
    // Recupera ingredientes si se viene desde otra página
    const ingredientesDesdeBusqueda = location.state?.ingredientesSeleccionados || [];

    /*Esto es para modificar la posición del cuadro de Ingredientes seleccionados*/
    // Retorna la clase CSS opuesta para posicionar la caja de ingredientes
    const getOppositePositionClass = (position) => {
        if (position === 'left') return 'ingredientes-right';
        if (position === 'right') return 'ingredientes-left';
        return 'ingredientes-left'; // por defecto aparece a la izquierda
    };

    const navigate = useNavigate(); // para redirigir

    /*Para guardar los ingredientes elegidos*/
    // Estado: ingredientes seleccionados por el usuario
    const [ingredientesFinales, setIngredientesFinales] = useState(
        ingredientesDesdeBusqueda.map(item =>
            typeof item === "string" ? { nombre: item, categoria: "Desconocida" } : item
        )
    );

    /*Para manejar la selección*/
    // Agrega ingredientes seleccionados desde el modal
    const agregarIngredientesSeleccionados = (seleccionados, categoria) => {
        const nuevos = seleccionados.map(nombre => ({ nombre, categoria }));
        setIngredientesFinales(prev => {
            const nombresExistentes = new Set(prev.map(i => i.nombre));
            const nuevosUnicos = nuevos.filter(i => !nombresExistentes.has(i.nombre));
            return [...prev, ...nuevosUnicos];
        });
    };


    /* Para eliminar ingredientes seleccionados*/
    const eliminarIngrediente = (ingrediente) => {
        const nombre = typeof ingrediente === 'string' ? ingrediente : ingrediente.nombre;
        setIngredientesFinales(prev => prev.filter(item => item.nombre !== nombre));
    };
    // Busca recetas según los ingredientes seleccionados y navega a los resultados
    const buscarRecetaIngrediente = async () => {
        try {
            const soloNombres = ingredientesFinales.map(item => item.nombre);
            console.log("Ingredientes enviados al backend:", soloNombres); // log para frontend

            const response = await recetas.buscarRecetasPorIngredientesAvanzado(soloNombres);
            const data = response.data;

            navigate('/search', {
                state: {
                    ...data,
                    ingredientesSeleccionados: ingredientesFinales
                }
            });

        } catch (error) {
            console.error("Error al buscar recetas por ingredientes:", error);
            alert("No se pudieron obtener recetas del backend.");
        }
    };

    /* Controles del modal */
    // estos son estados de control para el modal de selección de ingredientes
    const [modalOpen, setModalOpen] = useState(false);
    const [modalData, setModalData] = useState({ title: '', content: [] });
    const [activeSector, setActiveSector] = useState(null);

    /* Para abrir el modal */
    // Abre el modal de una sección del plato
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
    /* Nota: Se ordenan por abecedario*/
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
                        {/* Sectores clicables que abren el modal */}
                        <rect
                            x="0"
                            y="0"
                            width="200"
                            height="200"
                            className={`sector-overlay ${activeSector === 'up_left' ? 'active' : ''}`}
                            onClick={() => handleSectorClick('Granos y derivados', upLeft, 'right', 'up_left')}
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
                            onClick={() => handleSectorClick('Proteínas', downLeft, 'right', 'down_left')}
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
                <div>
                    <div className={`ingredientes-finales card shadow ${getOppositePositionClass(modalData.position)}`}>
                        <div className="card-body">
                            <h5 className="card-title">Ingredientes seleccionados</h5>
                            {ingredientesFinales.length === 0 ? (
                                <p className="text-muted">No tienes ingredientes seleccionados</p>
                            ) : (
                                <ul className="list-group list-group-flush ingredientes-scroll">
                                    {ingredientesFinales.map((item, index) => (
                                        <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
                                        <div>
                                            <strong>{item.nombre}</strong>
                                            <div className="text-muted small">{item.categoria}</div>
                                        </div>
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
                        {/* Botón de búsqueda */}
                        <button onClick={buscarRecetaIngrediente} className="receta-button">Buscar recetas por ingredientes</button>
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
                        onSelect={(seleccionados) => agregarIngredientesSeleccionados(seleccionados, modalData.title)}
                        seleccionadosGlobales={ingredientesFinales} 
                        onRemoveIngrediente={eliminarIngrediente}  
                    />
                )}
            </div>
        </>

    );
}

export default Plate;
