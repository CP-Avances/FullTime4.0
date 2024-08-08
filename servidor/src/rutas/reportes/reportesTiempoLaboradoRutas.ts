import REPORTES_TIEMPO_LABORADO_CONTROLADOR from '../../controlador/reportes/reportesTiempoLaboradoControlador';
import { TokenValidation } from '../../libs/verificarToken';
import { Router } from 'express';

class ReportesTiempoLaboradoRutas {
  public router: Router = Router();

  constructor() {
    this.configuracion();
  }

  configuracion(): void {

    // METODO DE BUSQUEDA DE DATOS DE TIEMPO LABORADO
    this.router.post('/tiempo-laborado-empleados/:desde/:hasta', TokenValidation, REPORTES_TIEMPO_LABORADO_CONTROLADOR.ReporteTiempoLaborado);

  }
}

const REPORTES_TIEMPO_LABORADO_RUTAS = new ReportesTiempoLaboradoRutas();

export default REPORTES_TIEMPO_LABORADO_RUTAS.router;