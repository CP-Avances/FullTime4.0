import { Request, Response } from 'express'
import { ContarHorasByCargo, ContarHorasByCargoSinAcciones } from '../../libs/ContarHoras'
import { Consultar } from '../../libs/ListaEmpleados'
class AsistenciaControlador {

    public async ObtenerHorasTrabajadas(req: Request, res: Response) {

        var {id_empleado, desde, hasta} = req.params
    
        //false sin acciones || true con acciones
        
        if (req.acciones_timbres === true) {
            // Resultados de timbres con 6 y 3 acciones

            let resultado = await ContarHorasByCargo(parseInt(id_empleado), new Date(desde), new Date(hasta));
            
            if (resultado.message) return res.status(404).jsonp(resultado)

            //console.log('ver resultado total', resultado)
            
            return res.status(200).jsonp(resultado)


        } else {
            // Resultados de timbres sin acciones

            let respuesta = await ContarHorasByCargoSinAcciones(parseInt(id_empleado), new Date(desde), new Date(hasta));

            if (respuesta.message) return res.status(404).jsonp(respuesta)

            return res.status(200).jsonp(respuesta)
        }
        
    }

    public async ObtenerListaEmpresa(req:Request, res: Response) {
        var {id_empresa} = req.params

        let c = await Consultar(parseInt(id_empresa));

        res.jsonp(c)
    }

}

const ASISTENCIA_CONTROLADOR = new AsistenciaControlador();
export default ASISTENCIA_CONTROLADOR  