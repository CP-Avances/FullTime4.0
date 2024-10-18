import { Request, Response } from 'express';
import { ObtenerRutaPlatilla } from '../../libs/accesoCarpetas';
import path from 'path';
import fs from 'fs';

class PlantillasControlador {
    public async DescargarPlantilla(req: Request, res: Response): Promise<any> {
        const documento = req.params.docs;
        let separador = path.sep;
        let ruta = ObtenerRutaPlatilla() + separador + documento;
        fs.access(ruta, fs.constants.F_OK, (err) => {
            if (err) {
            } else {
                res.sendFile(path.resolve(ruta));
            }
        });
    }
}

export const PLANTILLA_CONTROLADOR = new PlantillasControlador();

export default PLANTILLA_CONTROLADOR;

