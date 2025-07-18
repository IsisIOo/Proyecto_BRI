import '../assets/css/Modal.css';
import { useState, useEffect } from 'react';
import Fuse from 'fuse.js';


/*
* Componente que muestra el modal de ingredientes por elegir
* */
function Modal({ title, content, onClose, onSelect, position = 'center', seleccionadosGlobales = [], onRemoveIngrediente }) {

    // Define la clase de posición del modal (izquierda, derecha o centro)
    const positionClass =
        position === 'left' ? 'modal-left' :
            position === 'right' ? 'modal-right' :
                'modal-center';

    /* Para poder realizar la búsqueda de ingredientes con fuse*/
    // Estado para la búsqueda en el modal
    const [busqueda, setBusqueda] = useState('');
    // Estado para los ingredientes disponibles en esta categoría con su estado de selección
    const [selecciones, setSelecciones] = useState([]);

    // Configuración de Fuse.js para búsqueda difusa de ingredientes
    const fuse = new Fuse(selecciones, {
        keys: ['nombre'],
        threshold: 0.4, // Ajusta la sensibilidad (0 = exacto, 1 = muy permisivo) 
    });

    /*Se obtienen los ingredientes filtrados*/
    // Lista de ingredientes filtrados según la búsqueda
    const resultadosFiltrados = busqueda
        ? fuse.search(busqueda).map(result => result.item)
        : selecciones;

    /*Inicializa los ingredientes seleccionados como vacio*/
    // Cargar ingredientes al montar el componente o al cambiar props
    useEffect(() => {
        setSelecciones(prev => {
            return content.map(item => {
                const existente = prev.find(i => i.nombre === item);
                return {
                    nombre: item,
                    categoria: title,
                    // Marca como seleccionado si ya lo estaba antes o viene desde seleccionadosGlobales
                    seleccionado: existente ? existente.seleccionado : seleccionadosGlobales.some(i => i.nombre === item)
                };
            });
        });
    }, [content, seleccionadosGlobales]);

    /*Para seleccionar ingredientes*/
    // Alterna la selección de un ingrediente
    const toggleSeleccion = (nombre) => {
        setSelecciones(prev => {
            const nuevoEstado = prev.map(item =>
                item.nombre === nombre ? { ...item, seleccionado: !item.seleccionado } : item
            );

            // Si el ingrediente estaba seleccionado y se deseleccionó, se elimina del estado global
            const fueSeleccionado = prev.find(item => item.nombre === nombre)?.seleccionado;
            if (fueSeleccionado) {
                onRemoveIngrediente(nombre);
            }

            return nuevoEstado;
        });
    };


    /*Para confirmar la selección de ingredientes*/
    // Confirma y envía los ingredientes seleccionados al componente padre
    const confirmarSeleccion = () => {
        const seleccionados = selecciones
            .filter(item => item.seleccionado)
            .map(item => item.nombre); 
        onSelect(seleccionados); // envía selección al padre
    };

    return (
        <div className="modal-overlay">
            <div className={`modal-container ${positionClass}`} onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 className="modal-title">{title}</h2>
                    <button className="modal-close" onClick={onClose}>×</button>
                </div>
                {/* Input para buscar ingredientes */}
                {/*Este es el elemento que realiza la búsqueda de ingredientes*/}
                <div className="modal-filter">
                    <input
                        type="text"
                        placeholder="Buscar ingredientes..."
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                    />
                </div>

                {/*Se muestra el contenido de ingredientes como check-boxs*/}
                {/* Lista de ingredientes con checkbox */}
                <div className="modal-scrollable-content">
                    <ul className="checkbox-list">
                        {resultadosFiltrados.map((item, index) => (
                            <li key={index}>
                                <label className="checkbox-item">
                                    <input
                                        type="checkbox"
                                        checked={item.seleccionado}
                                        onChange={() => toggleSeleccion(item.nombre)}
                                    />
                                    <span>{item.nombre}</span>
                                </label>
                            </li>
                        ))}
                    </ul>

                </div>
                {/* Botón para confirmar la selección */}
                <div className="modal-footer">
                    <button className="select-button" onClick={confirmarSeleccion}>Seleccionar</button>
                </div>
            </div>
        </div>
    );
}

export default Modal;
