import { Router } from 'express';
import CIUDAD_FERIADO_CONTROLADOR from '../../controlador/ciudadFeriado/ciudadFeriadoControlador';
import { TokenValidation } from '../../libs/verificarToken'

class CiudadRutas {
    public router: Router = Router();

    constructor() {
        this.configuracion();
    }

    configuracion(): void {

        // METODO PARA BUSCAR CIUDADES - PROVINCIA POR NOMBRE
        this.router.get('/:nombre', TokenValidation, CIUDAD_FERIADO_CONTROLADOR.FiltrarCiudadesProvincia);
        // METODO PARA BUSCAR NOMBRES DE CIUDADES
        this.router.get('/nombresCiudades/:idferiado', TokenValidation, CIUDAD_FERIADO_CONTROLADOR.EncontrarCiudadesFeriado);
        // METODO PARA ELIMINAR REGISTRO
        this.router.delete('/eliminar/:id', TokenValidation, CIUDAD_FERIADO_CONTROLADOR.EliminarCiudadFeriado);
        // METODO PARA BUSCAR ID DE CIUDADES
        this.router.post('/buscar', TokenValidation, CIUDAD_FERIADO_CONTROLADOR.ObtenerIdCiudades);
        // METODO PARA REGISTRAR ASIGNACION DE CIUDADES  
        this.router.post('/insertar', TokenValidation, CIUDAD_FERIADO_CONTROLADOR.AsignarCiudadFeriado);
        // METODO PARA ACTUALIZAR REGISTRO
        this.router.put('/', TokenValidation, CIUDAD_FERIADO_CONTROLADOR.ActualizarCiudadFeriado);






        this.router.get('/ciudad/:id_ciudad', TokenValidation, CIUDAD_FERIADO_CONTROLADOR.ObtenerFeriadosCiudad);
    }
}

const CIUDAD_FERIADOS_RUTAS = new CiudadRutas();

export default CIUDAD_FERIADOS_RUTAS.router;