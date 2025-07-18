import React, {useEffect, useState} from 'react';
import '../assets/css/Filter2.css';

/**
 * Componente para filtros adicionales (secundarios).
 * Permite filtrar recetas por:
 * - Tipo de plato
 * - Tipo de cocina
 * - Tipo de dieta
 *
 * Props:
 * - onFilter: función que recibe los valores seleccionados
 * - opcionesPlato: opciones disponibles para tipo de plato
 * - opcionesDieta: opciones para dieta
 * - opcionesCocina: opciones para cocina
 */


const Filter2 = ({ onFilter, opcionesPlato = [], opcionesDieta = [], opcionesCocina = [] }) => {
    // Estados para los filtros seleccionados
    /*Obtienen las opciones de filtro de las recetas de forma dinamica*/
    const [plato, setPlato] = useState('');
    const [dieta, setDieta] = useState('');
    const [cocina, setCocina] = useState('');

    // Aplica los filtros cada vez que cambie uno de los select
    // Ejecuta onFilter cada vez que cambie un filtro
    useEffect(() => {
        onFilter({ plato, dieta, cocina });
    }, [plato, dieta, cocina]);

    return (
        <div className="filter-container">
            {/* Select para tipo de plato */}
            <select value={plato} onChange={(e) => setPlato(e.target.value)}>
                <option value="">TIPO DE PLATO</option>
                {opcionesPlato.map((tipo) => (
                    <option key={tipo} value={tipo}>{tipo}</option>
                ))}
            </select>
            {/* Select para tipo de dieta */}
            <select value={dieta} onChange={(e) => setDieta(e.target.value)}>
                <option value="">TIPO DE DIETA</option>
                {opcionesDieta.map((tipo) => (
                    <option key={tipo} value={tipo}>{tipo}</option>
                ))}
            </select>
            {/* Select para tipo de cocina */}
            <select value={cocina} onChange={(e) => setCocina(e.target.value)}>
                <option value="">TIPO DE COCINA</option>
                {opcionesCocina.map((tipo) => (
                    <option key={tipo} value={tipo}>{tipo}</option>
                ))}
            </select>
        </div>
    );
};


export default Filter2;
