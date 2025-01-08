import REGIMEN_CONTROLADOR from '../../../controlador/configuracion/parametrizacion/catRegimenControlador';
import { TokenValidation } from '../../../libs/verificarToken';
import { Router } from 'express';

class RegimenRuta {
    public router: Router = Router();

    constructor() {
        this.configuracion();
    }

    configuracion(): void {

        /** ** ******************************************************************************************* **
         ** **                            CONSULTA DE REGIMEN LABORAL                                   ** **
         ** ** ******************************************************************************************* **/

        // LISTAR REGISTROS DE REGIMEN LABORAL  **USADO
        this.router.get('/', TokenValidation, REGIMEN_CONTROLADOR.ListarRegimen);
        // REGISTRAR REGIMEN LABORAL  **USADO
        this.router.post('/', TokenValidation, REGIMEN_CONTROLADOR.CrearRegimen);
        // ACTUALIZAR REGISTRO DE REGIMEN LABORAL  **USADO
        this.router.put('/', TokenValidation, REGIMEN_CONTROLADOR.ActualizarRegimen);
        // LISTAR DESCRIPCION DE REGIMEN LABORAL  **USADO
        this.router.get('/descripcion', TokenValidation, REGIMEN_CONTROLADOR.ListarNombresRegimen);
        // BUSCAR DATOS DE UN REGIMEN LABORAL  **USADO
        this.router.get('/:id', TokenValidation, REGIMEN_CONTROLADOR.ListarUnRegimen);
        // ELIMINAR REGISTRO DE REGIMEN LABORAL  **USADO
        this.router.delete('/eliminar/:id', TokenValidation, REGIMEN_CONTROLADOR.EliminarRegistros);
        // BUSCAR REGIMEN LABORAL POR ID DE PAIS   **USADO
        this.router.get('/pais-regimen/:nombre', TokenValidation, REGIMEN_CONTROLADOR.ListarRegimenPais);


        /** ** ******************************************************************************************* **
         ** **                           CONSULTA PERIODO DE VACACIONES                                 ** **
         ** ** ******************************************************************************************* **/

        // REGISTRAR PERIODO DE VACACIONES  **USADO
        this.router.post('/periodo-vacaciones', TokenValidation, REGIMEN_CONTROLADOR.CrearPeriodo);
        // ACTUALIZAR PERIODO DE VACACIONES **USADO
        this.router.put('/periodo-vacaciones', TokenValidation, REGIMEN_CONTROLADOR.ActualizarPeriodo);
        // BUSCAR DATOS DE UN REGIMEN LABORAL  **USADO
        this.router.get('/periodo-vacaciones/:id', TokenValidation, REGIMEN_CONTROLADOR.ListarUnPeriodo);
        // ELIMINAR REGISTRO PERIODO DE VACACIONES  **USADO
        this.router.delete('/periodo-vacaciones/eliminar/:id', TokenValidation, REGIMEN_CONTROLADOR.EliminarPeriodo);


        /** ** ******************************************************************************************* **
         ** **                          CONSULTA REGISTRO DE ANTIGUEDAD                                 ** **
         ** ** ******************************************************************************************* **/

        // REGISTRAR ANTIGUEDAD DE VACACIONES  **USADO
        this.router.post('/antiguedad-vacaciones', TokenValidation, REGIMEN_CONTROLADOR.CrearAntiguedad);
        // ACTUALIZAR ANTIGUEDAD DE VACACIONES  **USADO
        this.router.put('/antiguedad-vacaciones', TokenValidation, REGIMEN_CONTROLADOR.ActualizarAntiguedad);
        // BUSCAR DATOS DE UN REGIMEN LABORAL  **USADO
        this.router.get('/antiguedad-vacaciones/:id', TokenValidation, REGIMEN_CONTROLADOR.ListarAntiguedad);
        // ELIMINAR REGISTRO ANTIGUEDAD DE VACACIONES  **USADOO
        this.router.delete('/antiguedad-vacaciones/eliminar/:id', TokenValidation, REGIMEN_CONTROLADOR.EliminarAntiguedad);

    }
}

const REGIMEN_RUTA = new RegimenRuta();

export default REGIMEN_RUTA.router;