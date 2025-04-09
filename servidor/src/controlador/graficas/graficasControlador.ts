import {
    GraficaHorasExtras, GraficaMarcaciones, MetricaHorasExtraEmpleado, MetricaPermisosEmpleado,
    MetricaVacacionesEmpleado
} from '../../libs/MetodosGraficas';
import { Request, Response } from 'express';

class GraficasControlador {

    public async AdminHorasExtrasMicro(req: Request, res: Response): Promise<void> {
        const id_empresa = req.id_empresa;
        const fec_final = new Date();
        var fec_inicio = new Date();
        fec_inicio.setUTCDate(1);
        fec_inicio.setUTCMonth(0);
        fec_inicio.setUTCHours(0);
        fec_inicio.setUTCMinutes(0);
        fec_inicio.setUTCSeconds(0);
        fec_final.setUTCHours(0);
        fec_final.setUTCMinutes(0);
        fec_final.setUTCSeconds(0);

        let resultado = await GraficaHorasExtras(id_empresa, fec_inicio, fec_final)
        res.status(200).jsonp(resultado);
    }

    public async AdminHorasExtrasMacro(req: Request, res: Response): Promise<void> {
        const fec_inicio = req.params.desde;
        const fec_final = req.params.hasta;
        const id_empresa = req.id_empresa

        let resultado = await GraficaHorasExtras(id_empresa, new Date(fec_inicio), new Date(fec_final))
        res.status(200).jsonp(resultado);
    }

    public async AdminMarcacionesEmpleadoMicro(req: Request, res: Response): Promise<void> {
        const id_empresa = req.id_empresa;
        const fec_final = new Date();
        var fec_inicio = new Date();
        fec_inicio.setUTCDate(1);
        fec_inicio.setUTCMonth(0);
        fec_inicio.setUTCHours(0);
        fec_inicio.setUTCMinutes(0);
        fec_inicio.setUTCSeconds(0)
        fec_final.setUTCHours(0);
        fec_final.setUTCMinutes(0);
        fec_final.setUTCSeconds(0);

        let resultado = await GraficaMarcaciones(id_empresa, fec_inicio, fec_final)
        res.status(200).jsonp(resultado);
    }

    public async AdminMarcacionesEmpleadoMacro(req: Request, res: Response): Promise<void> {
        const fec_inicio = req.params.desde;
        const fec_final = req.params.hasta;
        const id_empresa = req.id_empresa;

        let resultado = await GraficaMarcaciones(id_empresa, new Date(fec_inicio), new Date(fec_final))
        res.status(200).jsonp(resultado);
    }

    /**
     * 
     * METODOS DE GRAFICAS PARA LOS EMPLEADOS
     * 
     */

    public async EmpleadoHorasExtrasMicro(req: Request, res: Response): Promise<void> {
        const id_empleado = req.userIdEmpleado;
        const codigo = req.userCodigo;
        const fec_final = new Date();
        var fec_inicio = new Date();
        fec_inicio.setUTCDate(1);
        fec_inicio.setUTCMonth(0);
        fec_inicio.setUTCHours(0);
        fec_inicio.setUTCMinutes(0);
        fec_inicio.setUTCSeconds(0)
        fec_final.setUTCHours(0);
        fec_final.setUTCMinutes(0);
        fec_final.setUTCSeconds(0);

        let resultado = await MetricaHorasExtraEmpleado(id_empleado, id_empleado, fec_inicio, fec_final)
        res.status(200).jsonp(resultado);
    }

    public async EmpleadoHorasExtrasMacro(req: Request, res: Response): Promise<void> {
        const id_empleado = req.userIdEmpleado;
        const fec_inicio = req.params.desde;
        const fec_final = req.params.hasta;
        const codigo = req.userCodigo;

        let resultado = await MetricaHorasExtraEmpleado(id_empleado, id_empleado, new Date(fec_inicio), new Date(fec_final))
        res.status(200).jsonp(resultado);
    }

    public async EmpleadoVacacionesMicro(req: Request, res: Response): Promise<void> {
        const id_empleado = req.userIdEmpleado;
        const fec_final = new Date();
        var fec_inicio = new Date();
        const codigo = req.userCodigo;

        fec_inicio.setUTCDate(1);
        fec_inicio.setUTCMonth(0);
        fec_inicio.setUTCHours(0);
        fec_inicio.setUTCMinutes(0);
        fec_inicio.setUTCSeconds(0)
        fec_final.setUTCHours(0);
        fec_final.setUTCMinutes(0);
        fec_final.setUTCSeconds(0);

        let resultado = await MetricaVacacionesEmpleado(codigo, id_empleado, fec_inicio, fec_final)

        res.status(200).jsonp(resultado);
    }

    public async EmpleadoVacacionesMacro(req: Request, res: Response): Promise<void> {
        const id_empleado = req.userIdEmpleado;
        const fec_inicio = req.params.desde;
        const fec_final = req.params.hasta;
        const codigo = req.userCodigo;

        let resultado = await MetricaVacacionesEmpleado(codigo, id_empleado, new Date(fec_inicio), new Date(fec_final))

        res.status(200).jsonp(resultado);
    }

    public async EmpleadoPermisosMicro(req: Request, res: Response): Promise<void> {
        const codigo = req.userCodigo;
        const id_empleado = req.userIdEmpleado;
        const fec_final = new Date();
        var fec_inicio = new Date();
        fec_inicio.setUTCDate(1);
        fec_inicio.setUTCMonth(0);
        fec_inicio.setUTCHours(0);
        fec_inicio.setUTCMinutes(0);
        fec_inicio.setUTCSeconds(0)
        fec_final.setUTCHours(0);
        fec_final.setUTCMinutes(0);
        fec_final.setUTCSeconds(0);

        let resultado = await MetricaPermisosEmpleado(codigo, id_empleado, fec_inicio, fec_final)

        res.status(200).jsonp(resultado);
    }

    public async EmpleadoPermisosMacro(req: Request, res: Response): Promise<void> {
        const codigo = req.userCodigo;
        const id_empleado = req.userIdEmpleado;
        const fec_inicio = req.params.desde;
        const fec_final = req.params.hasta;


        let resultado = await MetricaPermisosEmpleado(codigo, id_empleado, new Date(fec_inicio), new Date(fec_final))
        res.status(200).jsonp(resultado);
    }

}

export const GRAFICAS_CONTROLADOR = new GraficasControlador();

export default GRAFICAS_CONTROLADOR;