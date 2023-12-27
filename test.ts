function compararPares(a: number[], b: number[]): any {
    const insertar: number[] = [];

    for (let i = 0; i < a.length; i += 2) {
        const parA = [a[i], a[i + 1]];

        // Comprobar si el par actual de a no está en b
        if (!existeParEnArray(parA, b)) {
            insertar.push(parA[0], parA[1]);
        }
    }

    return insertar;
}

// Comprueba si un par [a, b] está en el array
function existeParEnArray(par: number[], array: number[]): boolean {
    for (let i = 0; i < array.length; i += 2) {
        const parEnArray = [array[i], array[i + 1]];

        if (par[0] === parEnArray[0] && par[1] === parEnArray[1]) {
            return true;
        }
    }

    return false;
}

// Ejemplo de uso:
const basededatos = [5, 1, 5, 4, 1, 2];
const usuarioEnvio = [5, 1, 5, 3, 1, 2];

// permisos que me envia el usuario menos permisos que ya se encuentran registrados, (es decir los nuevos permisos del rol)
// se deben registrar
const insertar = compararPares(usuarioEnvio, basededatos);
const actualizar = compararPares(basededatos, usuarioEnvio);

console.log('insertar: ', insertar);
console.log('actualizar: ', actualizar);

