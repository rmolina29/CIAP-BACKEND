
let proyectosUsuarioAsignados = [2, 3];
let proyectosParaActualizar = [3];

//update proyectos a desactivar, es decir se le cambiara sus estados
function proyectosNuevos(proyectosAsignados, proyectosActualizar) {
    const diferencia = proyectosActualizar.filter(idProyecto => !proyectosAsignados.includes(idProyecto));
    return diferencia;
}

//insertart
const result = proyectosNuevos(proyectosUsuarioAsignados,proyectosParaActualizar);

// update
const result2 = proyectosNuevos(proyectosParaActualizar,proyectosUsuarioAsignados);


console.log(result);
console.log(result2);


// proyectoscambio(proyectosParaFiltro: number[], proyectosComparacion: number[]) {
//     const proyectosUsuarios = proyectosComparacion.filter(conjuntoIdProyectos => !proyectosParaFiltro.includes(conjuntoIdProyectos));
//     return proyectosUsuarios;
// }