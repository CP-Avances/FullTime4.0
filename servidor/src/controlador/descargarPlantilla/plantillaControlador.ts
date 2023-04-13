import { Request, Response } from 'express';

class PlantillasControlador {
    public async DescargarPlantilla(req: Request, res: Response): Promise<any> {
        const docs = req.params.docs;
        let filePath = `servidor/plantillasVacias/${docs}`
        res.sendFile(__dirname.split("servidor")[0] + filePath);
    }
}

export const PLANTILLA_CONTROLADOR = new PlantillasControlador();

export default PLANTILLA_CONTROLADOR;

