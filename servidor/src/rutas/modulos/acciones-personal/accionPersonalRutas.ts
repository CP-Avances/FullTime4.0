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

        // METODO PARA LISTAR DETALLES TIPOS DE ACCION DE PERSONAL   **USADO
        this.router.get('/', TokenValidation, ACCION_PERSONAL_CONTROLADOR.ListarTipoAccionPersonal);
        // METODO PARA REGISTRAR DETALLE DE TIPOS DE ACCIONES DE PERSONAL   **USADO
        this.router.post('/', TokenValidation, ACCION_PERSONAL_CONTROLADOR.CrearTipoAccionPersonal);
        // METODO DE ACTUALIZACION DEL DETALLE DE LA ACCION DE PERSONAL    **USADO
        this.router.put('/', TokenValidation, ACCION_PERSONAL_CONTROLADOR.ActualizarTipoAccionPersonal);
        // METODO PARA ELIMINAR REGISTROS DE DETALLES DE TIPO DE ACCION DE PERSONAL  *USADO
        this.router.delete('/eliminar/:id', TokenValidation, ACCION_PERSONAL_CONTROLADOR.EliminarTipoAccionPersonal);
        // METODO PARA ELIMINAR LOS TIPOS DE ACCION PERSONAL DE MANERA MULTIPLE   **USADO
        this.router.post('/eliminarMultiple', TokenValidation, ACCION_PERSONAL_CONTROLADOR.EliminarTipoAccionMultiple);
        // METODO PARA LEER DATOS DE PLANTILLA    **USADO
        this.router.post('/upload/revision', [TokenValidation, upload.single('uploads')], ACCION_PERSONAL_CONTROLADOR.RevisarDatos);
        // METODO PARA GUARDAR DATOS DE PLANTILLA    **USADO
        this.router.post('/cargar_plantilla', TokenValidation, ACCION_PERSONAL_CONTROLADOR.CargarPlantilla);
        // METODO PARA CONSULTAR TIPOS DE ACCION PERSONAL   **USADO
        this.router.get('/accion/tipo', TokenValidation, ACCION_PERSONAL_CONTROLADOR.ListarTipoAccion);
        // METODO PARA REGISTRAR UNA ACCION DE PERSONAL   **USADO
        this.router.post('/accion/tipo', TokenValidation, ACCION_PERSONAL_CONTROLADOR.CrearTipoAccion);
        // METODO PARA BUSCAR UN DETALLE DE TIPO DE ACCION DE PERSONAL POR ID    **USADO
        this.router.get('/tipo/accion/:id', TokenValidation, ACCION_PERSONAL_CONTROLADOR.EncontrarTipoAccionPersonalId);
        // METODO PARA BUSCAR DATOS DEL DETALLE DE ACCION DE PERSONAL PARA EDICION   **USADO
        this.router.get('/editar/accion/tipo/:id', TokenValidation, ACCION_PERSONAL_CONTROLADOR.ListarTipoAccionEdicion);
        // METODO DE REGISTRO DE DOCUMENTO ACCION DE PERSONAL     **USADO
        this.router.post('/pedido/accion', TokenValidation, ACCION_PERSONAL_CONTROLADOR.CrearPedidoAccionPersonal);
        // METODO DE ACTUALIZACION DE DATOS DEL DOCUMENTO DE ACCION PERSONAL   **USADO
        this.router.put('/pedido/accion/editar', TokenValidation, ACCION_PERSONAL_CONTROLADOR.ActualizarPedidoAccionPersonal);
        // METODO DE BUSQUEDA DE DATOS DE DOCUMENTOS DE ACCION DE PERSONAL    **USADO
        this.router.get('/pedido/informacion/:id', TokenValidation, ACCION_PERSONAL_CONTROLADOR.EncontrarPedidoAccion);
        // METODO PARA BUSCAR PEDIDOS DE ACCION DE PERSONAL  **USADO
        this.router.get('/pedidos/accion', TokenValidation, ACCION_PERSONAL_CONTROLADOR.ListarPedidoAccion);
        // VER LOGO DE MINISTERIO TRABAJO     **USADO
        this.router.get('/logo/ministerio/codificado', TokenValidation, ACCION_PERSONAL_CONTROLADOR.verLogoMinisterio);
        // METODO PARA BUSCAR LISTA DE PROCESOS   **USADO**
        this.router.get('/lista/procesos/:id', TokenValidation, ACCION_PERSONAL_CONTROLADOR.EncontrarProcesosRecursivos);
        // METODO PARA BUSCAR UN DOCUMENTO DE ACCION DE PERSONAL    **USADO**
        this.router.get('/pedidos/datos/:id', TokenValidation, ACCION_PERSONAL_CONTROLADOR.EncontrarDatosEmpleados);

    }
}

const ACCION_PERSONAL_RUTAS = new DepartamentoRutas();

export default ACCION_PERSONAL_RUTAS.router;