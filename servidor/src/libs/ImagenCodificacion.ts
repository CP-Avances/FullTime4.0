import fs from 'fs';
import path from 'path'
import { ObtenerRutaUsuario } from './accesoCarpetas';

export const ImagenBase64LogosEmpresas: any = async function (path_file: string) {
    console.log("Path logo: ", path_file);
    let separador = path.sep;
    try {
        path_file = path.resolve('logos') + separador + path_file
        console.log('ver si ingresa ', path_file)
        let data = fs.readFileSync(path_file);
        console.log('data 8899 ', data)
        return data.toString('base64');
    } catch (error) {
        return 0
    }
}

export const ImagenBase64LogosEmpleado: any =  function (ruta: any) {
    console.log("Path logo: ", ruta);
    let separador = path.sep;

    try {
        let path_file = path.resolve(ruta)
        console.log('ver si ingresa ', ruta)
        let data = fs.readFileSync(path_file);
        console.log('data 9999 ', data)
        return data.toString('base64');
    } catch (error) {
        return 0
    }
}