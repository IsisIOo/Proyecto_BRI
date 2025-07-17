
function IngredientesBox({ ingredientes, onEditar }) {
    return (
        <div className="ingredientes-box card shadow">
            <div className="card-body">
                <h5 className="card-title">Ingredientes seleccionados</h5>
                {ingredientes.length === 0 ? (
                    <p className="text-muted">No tienes ingredientes seleccionados</p>
                ) : (
                    <ul className="list-group list-group-flush ingredientes-scroll">
                        {ingredientes.map((item, index) => (
                            <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
                                {item}
                            </li>
                        ))}
                    </ul>
                )}
                <button onClick={onEditar} className="receta-button mt-3">Editar ingredientes</button>
            </div>
        </div>
    );
}

export default IngredientesBox;
