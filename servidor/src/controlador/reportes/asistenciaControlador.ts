
import { Request, Response } from 'express';
import { Consultar } from '../../libs/ListaEmpleados';

class AsistenciaControlador {

    public async ObtenerListaEmpresa(req: Request, res: Response) {
        var { id_empresa } = req.params

        let c = await Consultar(parseInt(id_empresa));

        res.jsonp(c)
    }

}

const ASISTENCIA_CONTROLADOR = new AsistenciaControlador();

export default ASISTENCIA_CONTROLADOR  