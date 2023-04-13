import { Request, Response } from 'express';
import { vacacionesByIdUser, ReportePeriVacaciones } from '../../libs/CalcularVacaciones';
import { CalcularHoraExtra } from '../../libs/CalcularHorasExtras';

class KardexVacacion {

    public async CarcularVacacionByIdToken(req: Request, res: Response) {
        // console.log(req.params.desde, req.params.hasta);
        let fec_desde = req.params.desde
        let fec_hasta = req.params.hasta
        let jsonData = await vacacionesByIdUser(req.userIdEmpleado, fec_desde, fec_hasta);
        res.jsonp(jsonData);
    } 

    public async CarcularVacacionByIdEmpleado(req: Request, res: Response) {
        let id_empleado = parseInt(req.params.id_empleado)
        let fec_desde = req.params.desde
        let fec_hasta = req.params.hasta
        let jsonData = await vacacionesByIdUser(id_empleado, fec_desde, fec_hasta);
        res.jsonp(jsonData);
    } 

    public async CarcularHorasExtras(req: Request, res: Response) {
        let id_empleado = parseInt(req.params.id_empleado)
        let fec_desde = req.params.desde
        let fec_hasta = req.params.hasta
        let jsonData = await CalcularHoraExtra(id_empleado, new Date(fec_desde), new Date(fec_hasta));
        res.jsonp(jsonData);
    }
    
    public async ReportePeriodosVacaciones(req: Request, res: Response) {
        let id_empleado = parseInt(req.params.id_empleado)
        let jsonData = await ReportePeriVacaciones(id_empleado);
        res.jsonp(jsonData);
    }
}

export const KARDEX_VACACION_CONTROLADOR = new KardexVacacion();

export default KARDEX_VACACION_CONTROLADOR;