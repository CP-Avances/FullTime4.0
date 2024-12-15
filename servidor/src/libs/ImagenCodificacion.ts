import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

export const ConvertirImagenBase64: any = function (ruta: any) {
    console.log("Path img: ", ruta);
    try {
        let path_file = path.resolve(ruta)
        //console.log('ver si ingresa ', ruta)
        let data = fs.readFileSync(path_file);
        //console.log('data img', data)
        return data.toString('base64');
    } catch (error) {
        return 0
    }
}

export const ComprimirImagen: any = function (ruta_temporal: any, ruta_guardar: any) {
    //console.log(' dos rutas ', ruta_temporal, ' guardar ', ruta_guardar)
    try {
        fs.access(ruta_temporal, fs.constants.F_OK, (err) => {
            if (!err) {
                sharp(ruta_temporal)
                    .resize(800) // CAMBIA EL TAMAÑO DE LA IMAGEN A UN ANCHO DE 800 PÍXELES, MANTIENE LA RELACION DE ASPECTO
                    .jpeg({ quality: 80 }) // CONFIGURA LA CALIDAD DE LA IMAGEN JPEG AL 80%
                    .toFile(ruta_guardar);
                // ELIMIAR EL ARCHIVO ORIGINAL
                setTimeout(async () => {
                    fs.unlinkSync(ruta_temporal);
                }, 1000); // ESPERAR 1 SEGUNDO
            }
        })
    } catch (error) {
        //console.log('error ', error)
        return false;
    }
}