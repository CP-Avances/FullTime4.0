import ACCION_PERSONAL_CONTROLADOR from '../../../controlador/modulos/acciones-personal/accionPersonalControlador';
import { TokenValidation } from '../../../libs/verificarToken';
import { Router } from 'express';
import { ObtenerRutaLeerPlantillas } from '../../../libs/accesoCarpetas';
import multer from 'multer';

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, ObtenerRutaLeerPlantillas())
    },
    filename: function (req, file, cb) {
        let documento = file.originalname;
        cb(null, documento);
    }
});

const upload = multer({ storage: storage });

class DepartamentoRutas {
    public router: Router = Router();

    constructor() {
        this.configuracion();
    }

    configuracion(): void {
        // *********************  TABLA TIPO DE ACCION DE PERSONAL  ************************
        // METODO PARA LISTAR DETALLES TIPOS DE ACCION DE PERSONAL   **USADO
        this.router.get('/', TokenValidation, ACCION_PERSONAL_CONTROLADOR.ListarTipoAccionPersonal);
        // METODO PARA REGISTRAR DETALLE DE TIPOS DE ACCIONES DE PERSONAL   **USADO
        this.router.post('/', TokenValidation, ACCION_PERSONAL_CONTROLADOR.CrearTipoAccionPersonal);
        // METODO PARA ELIMINAR REGISTROS DE DETALLES DE TIPO DE ACCION DE PERSONAL  *USADO
        this.router.delete('/eliminar/:id', TokenValidation, ACCION_PERSONAL_CONTROLADOR.EliminarTipoAccionPersonal);


        // *********************  TABLA TIPOS DE ACCION DE PERSONAL  **************************
        // METODO PARA CONSULTAR TIPOS DE ACCION PERSONAL   **USADO
        this.router.get('/accion/tipo', TokenValidation, ACCION_PERSONAL_CONTROLADOR.ListarTipoAccion);
        // METODO PARA REGISTRAR UNA ACCION DE PERSONAL   **USADO
        this.router.post('/accion/tipo', TokenValidation, ACCION_PERSONAL_CONTROLADOR.CrearTipoAccion);




        this.router.get('/tipo/accion/:id', TokenValidation, ACCION_PERSONAL_CONTROLADOR.EncontrarTipoAccionPersonalId);
        this.router.put('/', TokenValidation, ACCION_PERSONAL_CONTROLADOR.ActualizarTipoAccionPersonal);

        this.router.get('/editar/accion/tipo/:id', TokenValidation, ACCION_PERSONAL_CONTROLADOR.ListarTipoAccionEdicion);

        // METODO PARA ELIMINAR LOS TIPOS DE ACCION PERSONAL DE MANERA MULTIPLE   **USADO
        this.router.post('/eliminarProcesoMult', TokenValidation, ACCION_PERSONAL_CONTROLADOR.EliminarTipoAccionMultipleMult);


        /** TABLA PEDIDO_ACCION_EMPLEADO */
        this.router.post('/pedido/accion', TokenValidation, ACCION_PERSONAL_CONTROLADOR.CrearPedidoAccionPersonal);
        this.router.put('/pedido/accion/editar', TokenValidation, ACCION_PERSONAL_CONTROLADOR.ActualizarPedidoAccionPersonal);

        // VER LOGO DE MINISTERIO TRABAJO
        this.router.get('/logo/ministerio/codificado', TokenValidation, ACCION_PERSONAL_CONTROLADOR.verLogoMinisterio);

        // CONSULTAS PEDIDOS ACCIONES DE PERSONAL
        this.router.get('/pedidos/accion', TokenValidation, ACCION_PERSONAL_CONTROLADOR.ListarPedidoAccion);
        this.router.get('/pedidos/datos/:id', TokenValidation, ACCION_PERSONAL_CONTROLADOR.EncontrarDatosEmpleados);
        this.router.get('/pedidos/ciudad/:id', TokenValidation, ACCION_PERSONAL_CONTROLADOR.EncontrarDatosCiudades);
        this.router.get('/pedido/informacion/:id', TokenValidation, ACCION_PERSONAL_CONTROLADOR.EncontrarPedidoAccion);
        this.router.get('/lista/procesos/:id', TokenValidation, ACCION_PERSONAL_CONTROLADOR.EncontrarProcesosRecursivos);

        // METODO PARA LEER DATOS DE PLANTILLA    **USADO
        this.router.post('/upload/revision', [TokenValidation, upload.single('uploads')], ACCION_PERSONAL_CONTROLADOR.RevisarDatos);
        // METODO PARA GUARDAR DATOS DE PLANTILLA    **USADO
        this.router.post('/cargar_plantilla', TokenValidation, ACCION_PERSONAL_CONTROLADOR.CargarPlantilla);
    }
}

const ACCION_PERSONAL_RUTAS = new DepartamentoRutas();

export default ACCION_PERSONAL_RUTAS.router;