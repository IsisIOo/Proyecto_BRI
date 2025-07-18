/**
 * Caja que muestra los ingredientes seleccionados por el usuario.
 * También permite volver a la pantalla inicial para modificarlos.
 *
 * Props:
 * - ingredientes: lista de ingredientes seleccionados
 * - onEditar: función para volver a Home con ingredientes ya marcados
 */

function IngredientesBox({ ingredientes, onEditar }) {
    return (
        <div className="ingredientes-box card shadow"> {/* Caja visual con estilos tipo tarjeta */}
            <div className="card-body">
                <h5 className="card-title">Ingredientes seleccionados</h5>
                {/* Si no hay ingredientes, muestra un mensaje de que no hay ingredientes seleccionados*/}
                {ingredientes.length === 0 ? (
                    <p className="text-muted">No tienes ingredientes seleccionados</p>
                ) : (
                    // Si hay ingredientes, los lista
                    <ul className="list-group list-group-flush ingredientes-scroll">
                        {ingredientes.map((item, index) => (
                            <li key={index} className="list-group-item text-center">
                                <div>
                                    <strong>{item.nombre}</strong><br />
                                    <span className="text-muted small">{item.categoria}</span>
                                </div>
                            </li>


                        ))}
                    </ul>
                )}
                 {/* Botón que permite volver a editar ingredientes seleccionados */}
                <button onClick={onEditar} className="receta-button mt-3">Editar ingredientes</button>
            </div>
        </div>
    );
}

export default IngredientesBox;
