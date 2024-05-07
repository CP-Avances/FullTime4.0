import CONTRATO_EMPLEADO_CONTROLADOR from '../../../controlador/empleado/empleadoContrato/contratoEmpleadoControlador';
import { ObtenerRutaContrato } from '../../../libs/accesoCarpetas';
import { ObtenerRutaLeerPlantillas } from '../../../libs/accesoCarpetas';
import { TokenValidation } from '../../../libs/verificarToken';
import { Router } from 'express';
import multer from 'multer';
import pool from '../../../database';
import moment from 'moment';

const multipart = require('connect-multiparty');

const multipartMiddleware = multipart({
    uploadDir: './contratos',
});


const storage = multer.diskStorage({

    destination: async function (req, file, cb) {
        let id = req.params.id;
        const usuario = await pool.query(
            `
            SELECT e.id FROM empleados AS e, empl_contratos AS c WHERE c.id = $1 AND c.id_empleado = e.id
            `
            , [id]);
        var ruta = await ObtenerRutaContrato(usuario.rows[0].id);
        cb(null, ruta)
    },
    filename: async function (req, file, cb) {

        // FECHA DEL SISTEMA
        var fecha = moment();
        var anio = fecha.format('YYYY');
        var mes = fecha.format('MM');
        var dia = fecha.format('DD');

        // DATOS DOCUMENTO
        let id = req.params.id;

        const usuario = await pool.query(
            `
            SELECT codigo FROM empleados AS e, empl_contratos AS c WHERE c.id = $1 AND c.id_empleado = e.id
            `
            , [id]);

        let documento = usuario.rows[0].codigo + '_' + anio + '_' + mes + '_' + dia + '_' + file.originalname;

        cb(null, documento)
    }
})
const upload = multer({ storage: storage });


const storage_plantilla = multer.diskStorage({

    destination: function (req, file, cb) {
        cb(null, ObtenerRutaLeerPlantillas())
    },
    filename: function (req, file, cb) {
        let documento = file.originalname;

        cb(null, documento);
    }
})
const upload_plantilla = multer({ storage: storage_plantilla });


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
        this.router.put('/:id/documento-contrato', [TokenValidation, upload.single('uploads')], CONTRATO_EMPLEADO_CONTROLADOR.GuardarDocumentoContrato);
        // MOSTRAR DOCUMENTO CARGADO EN EL SISTEMA
        this.router.get('/documentos/:docs/contrato/:id', CONTRATO_EMPLEADO_CONTROLADOR.ObtenerDocumento);
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

        this.router.post('/buscarFecha/contrato', TokenValidation, CONTRATO_EMPLEADO_CONTROLADOR.EncontrarFechaContratoId);


        /** ********************************************************************************************* **
         ** **            METODO PAARA LA LECTURA DEL REGISTRO MULTIPLE DE CONTRATOS                   ** **
         ** ********************************************************************************************* **/
         this.router.post('/upload/revision', [TokenValidation, upload_plantilla.single('uploads')], CONTRATO_EMPLEADO_CONTROLADOR.RevisarDatos);
         this.router.post('/cargar_plantilla/', TokenValidation, CONTRATO_EMPLEADO_CONTROLADOR.CargarPlantilla_contrato);
    }
}

const CONTRATO_EMPLEADO_RUTAS = new DepartamentoRutas();

export default CONTRATO_EMPLEADO_RUTAS.router;