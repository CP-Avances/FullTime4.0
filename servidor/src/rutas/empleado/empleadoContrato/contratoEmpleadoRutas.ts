import CONTRATO_EMPLEADO_CONTROLADOR from '../../../controlador/empleado/empleadoContrato/contratoEmpleadoControlador';
import { ObtenerRutaLeerPlantillas } from '../../../libs/accesoCarpetas';
import { ObtenerRutaContrato } from '../../../libs/accesoCarpetas';
import { TokenValidation } from '../../../libs/verificarToken';
import { DateTime } from 'luxon';
import { Router } from 'express';
import multer from 'multer';
import pool from '../../../database';

const storage = multer.diskStorage({
    destination: async function (req, file, cb) {
        let id = req.params.id;
        const usuario = await pool.query(
            `
            SELECT e.id FROM eu_empleados AS e, eu_empleado_contratos AS c WHERE c.id = $1 AND c.id_empleado = e.id
            `
            , [id]);
        var ruta = await ObtenerRutaContrato(usuario.rows[0].id);
        cb(null, ruta)
    },
    filename: async function (req, file, cb) {

        // FECHA DEL SISTEMA
        var fecha = DateTime.now();
        var anio = fecha.toFormat('yyyy');
        var mes = fecha.toFormat('MM');
        var dia = fecha.toFormat('dd');

        // DATOS DOCUMENTO
        let id = req.params.id;

        const usuario = await pool.query(
            `
            SELECT codigo FROM eu_empleados AS e, eu_empleado_contratos AS c WHERE c.id = $1 AND c.id_empleado = e.id
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
        // REGISTRAR DATOS DE CONTRATO    **USADO
        this.router.post('/', TokenValidation, CONTRATO_EMPLEADO_CONTROLADOR.CrearContrato);
        // GUARDAR DOCUMENTO    **USADO
        this.router.put('/:id/documento-contrato', [TokenValidation, upload.single('uploads')], CONTRATO_EMPLEADO_CONTROLADOR.GuardarDocumentoContrato);
        // MOSTRAR DOCUMENTO CARGADO EN EL SISTEMA   **USADO
        this.router.get('/documentos/:docs/contrato/:id', CONTRATO_EMPLEADO_CONTROLADOR.ObtenerDocumento);
        // METODO PARA BUSCAR CONTRATOS POR ID DE EMPLEADO   **USADO
        this.router.get('/contrato-empleado/:id_empleado', TokenValidation, CONTRATO_EMPLEADO_CONTROLADOR.BuscarContratoEmpleado);
        // METODO PARA BUSCAR CONTRATOS POR ID DE EMPLEADO EXCLUYENDO CONTRATO A EDITAR   **USADO
        this.router.post('/contrato-empleado-editar', TokenValidation, CONTRATO_EMPLEADO_CONTROLADOR.BuscarContratoEmpleadoEditar);
        // EDITAR DATOS DE CONTRATO   **USADO
        this.router.put('/:id/actualizar', TokenValidation, CONTRATO_EMPLEADO_CONTROLADOR.EditarContrato);
        // ELIMINAR DOCUMENTO DE CONTRATO BASE DE DATOS - SERVIDOR   **USADO
        this.router.put('/eliminar_contrato/base_servidor', [TokenValidation], CONTRATO_EMPLEADO_CONTROLADOR.EliminarDocumento);
        // ELIMINAR DOCUMENTO DE CONTRATOS DEL SERVIDOR   **USADO
        this.router.put('/eliminar_contrato/servidor', [TokenValidation], CONTRATO_EMPLEADO_CONTROLADOR.EliminarDocumentoServidor);
        // METODO PARA BUSCAR ID ACTUAL DE CONTRATO   **USADO
        this.router.get('/contratoActual/:id_empleado', TokenValidation, CONTRATO_EMPLEADO_CONTROLADOR.EncontrarIdContratoActual);
        // METODO PARA BUSCAR DATOS DE CONTRATO POR ID   **USADO
        this.router.get('/contrato/:id', TokenValidation, CONTRATO_EMPLEADO_CONTROLADOR.EncontrarDatosUltimoContrato);
        // METODO PARA BUSCAR FECHAS DE CONTRATOS    **USADO
        this.router.post('/buscarFecha', TokenValidation, CONTRATO_EMPLEADO_CONTROLADOR.EncontrarFechaContrato);
        // METODO PARA BUSCAR FECHA DE CONTRATOS  **USADO
        this.router.post('/buscarFechaUsuarios', TokenValidation, CONTRATO_EMPLEADO_CONTROLADOR.EncontrarFechaContratoUsuarios);
        // METODO PARA ELIMINAR EL CONTRATO REGISTRADO DE LA TABLA EU_EMPLEADOS_CONTRATOS       **USADO
        this.router.post('/eliminarContrato', [TokenValidation], CONTRATO_EMPLEADO_CONTROLADOR.EliminarContrato);
        // METODO PARA BUSCAR FECHA DE CONTRATO SEGUN ID    **USADO
        this.router.post('/buscarFecha/contrato', TokenValidation, CONTRATO_EMPLEADO_CONTROLADOR.EncontrarFechaContratoId);
        // METODO DE REVISION DE DATOS DE PLANTILLA DE CONTRATOS   **USADO
        this.router.post('/upload/revision', [TokenValidation, upload_plantilla.single('uploads')], CONTRATO_EMPLEADO_CONTROLADOR.RevisarDatos);
        // METODO PARA REGISTRAR DATOS DE PLANTILLA DE CONTRATOS   **USADO
        this.router.post('/cargar_plantilla/', TokenValidation, CONTRATO_EMPLEADO_CONTROLADOR.CargarPlantilla_contrato);


        /** ********************************************************************************************* **
         ** **            METODOS PARA SER USADOS EN LA TABLA MODALIDAD_TRABAJO O TIPO DE CONTRATOS        ** **
         ** ********************************************************************************************* **/
        // REGISTRAR MODALIDAD DE TRABAJO   **USADO
        this.router.post('/modalidad/trabajo', TokenValidation, CONTRATO_EMPLEADO_CONTROLADOR.CrearTipoContrato);
        // BUSCAR LISTA DE MODALIDAD DE TRABAJO O TIPO DE CARGOS    **USADO
        this.router.get('/modalidad/trabajo', TokenValidation, CONTRATO_EMPLEADO_CONTROLADOR.ListarTiposContratos);
        // BUSCAR MODALIDAD LABORAL POR SU NOMBRE   **USADO
        this.router.post('/modalidad/trabajo/nombre', TokenValidation, CONTRATO_EMPLEADO_CONTROLADOR.BuscarModalidadLaboralNombre);

    }
}

const CONTRATO_EMPLEADO_RUTAS = new DepartamentoRutas();

export default CONTRATO_EMPLEADO_RUTAS.router;