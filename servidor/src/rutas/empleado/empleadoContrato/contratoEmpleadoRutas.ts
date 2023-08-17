import { Router } from 'express';
import { TokenValidation } from '../../../libs/verificarToken';
import CONTRATO_EMPLEADO_CONTROLADOR from '../../../controlador/empleado/empleadoContrato/contratoEmpleadoControlador';

const multipart = require('connect-multiparty');

const multipartMiddleware = multipart({
    uploadDir: './contratos',
});

class DepartamentoRutas {
    public router: Router = Router();

    constructor() {
        this.configuracion();
    }

    configuracion(): void {

        /** ******************************************************************************************** **
         ** **                      MANEJO DE DATOS DE CONTRATO DEL USUARIO                           ** ** 
         ** ******************************************************************************************** **/

        // REGISTRAR DATOS DE CONTRATO
        this.router.post('/', TokenValidation, CONTRATO_EMPLEADO_CONTROLADOR.CrearContrato);
        // GUARDAR DOCUMENTO 
        this.router.put('/:id/documento/:nombre', [TokenValidation, multipartMiddleware], CONTRATO_EMPLEADO_CONTROLADOR.GuardarDocumentoContrato);
        // MOSTRAR DOCUMENTO CARGADO EN EL SISTEMA
        this.router.get('/documentos/:docs', CONTRATO_EMPLEADO_CONTROLADOR.ObtenerDocumento);
        // METODO PARA BUSCAR CONTRATOS POR ID DE EMPLEADO
        this.router.get('/contrato-empleado/:id_empleado', TokenValidation, CONTRATO_EMPLEADO_CONTROLADOR.BuscarContratoEmpleado);
        // EDITAR DATOS DE CONTRATO
        this.router.put('/:id/actualizar', TokenValidation, CONTRATO_EMPLEADO_CONTROLADOR.EditarContrato);
        // ELIMINAR DOCUMENTO DE CONTRATO BASE DE DATOS - SERVIDOR
        this.router.put('/eliminar_contrato/base_servidor', [TokenValidation], CONTRATO_EMPLEADO_CONTROLADOR.EliminarDocumento);
        // ELIMINAR DOCUMENTO DE CONTRATOS DEL SERVIDOR
        this.router.put('/eliminar_contrato/servidor', [TokenValidation], CONTRATO_EMPLEADO_CONTROLADOR.EliminarDocumentoServidor);
        // METODO PARA BUSCAR ID ACTUAL DE CONTRATO
        this.router.get('/contratoActual/:id_empleado', TokenValidation, CONTRATO_EMPLEADO_CONTROLADOR.EncontrarIdContratoActual);
        // METODO PARA BUSCAR DATOS DE CONTRATO POR ID
        this.router.get('/contrato/:id', TokenValidation, CONTRATO_EMPLEADO_CONTROLADOR.EncontrarDatosUltimoContrato);
        // METODO PARA BUSCAR FECHAS DE CONTRATOS    --**VERIFICADO
        this.router.post('/buscarFecha', TokenValidation, CONTRATO_EMPLEADO_CONTROLADOR.EncontrarFechaContrato);        


        /** ********************************************************************************************* **
         ** **            METODOS PARA SER USADOS EN LA TABLA MODAL_TRABAJO O TIPO DE CONTRATOS        ** **
         ** ********************************************************************************************* **/

        // REGISTRAR MODALIDAD DE TRABAJO
        this.router.post('/modalidad/trabajo', TokenValidation, CONTRATO_EMPLEADO_CONTROLADOR.CrearTipoContrato);
        // BUSCAR LISTA DE MODALIDAD DE TRABAJO
        this.router.get('/modalidad/trabajo', TokenValidation, CONTRATO_EMPLEADO_CONTROLADOR.ListarTiposContratos);












        this.router.get('/', TokenValidation, CONTRATO_EMPLEADO_CONTROLADOR.ListarContratos);
        this.router.get('/:id/get', TokenValidation, CONTRATO_EMPLEADO_CONTROLADOR.ObtenerUnContrato);
        this.router.get('/:id_empleado', TokenValidation, CONTRATO_EMPLEADO_CONTROLADOR.EncontrarIdContrato);
       this.router.put('/editar/editarDocumento/:id', TokenValidation, CONTRATO_EMPLEADO_CONTROLADOR.EditarDocumento);

        this.router.post('/buscarFecha/contrato', TokenValidation, CONTRATO_EMPLEADO_CONTROLADOR.EncontrarFechaContratoId);


    }
}

const CONTRATO_EMPLEADO_RUTAS = new DepartamentoRutas();

export default CONTRATO_EMPLEADO_RUTAS.router;