import { ObtenerRutaHorasExtraGeneral } from '../../../libs/accesoCarpetas';
import { ModuloHoraExtraValidation } from '../../../libs/Modulos/verificarHoraExtra';
import { TokenValidation } from '../../../libs/verificarToken';
import { Router } from 'express';
import HorasExtrasPedidasControlador from '../../../controlador/modulos/horas-extras/horaExtraControlador';

import moment from 'moment';
import multer from 'multer';

moment.locale('es');
const storage2 = multer.diskStorage({
    
    destination: async function (req, file, cb) {
        const ruta = await ObtenerRutaHorasExtraGeneral();
        cb(null, ruta)
    },
    filename: async function (req, file, cb) {

        // FECHA DEL SISTEMA
        const fecha = moment();
        const anio = fecha.format('YYYY');
        const mes = fecha.format('MM');
        const dia = fecha.format('DD');

        const documento = `${anio}_${mes}_${dia}_${file.originalname}`;
        console.log('documento', documento);

        cb(null, documento)
    }
});
const upload2 = multer({ storage: storage2 });

const multipart = require('connect-multiparty');

const multipartMiddleware = multipart({
    uploadDir: './horasExtras',
});

class HorasExtrasPedidasRutas {
    public router: Router = Router();

    constructor() {
        this.configuracion();
    }

    configuracion(): void {
        this.router.get('/', [TokenValidation, ModuloHoraExtraValidation], HorasExtrasPedidasControlador.ListarHorasExtrasPedidas);
        this.router.get('/pedidos_autorizados', [TokenValidation, ModuloHoraExtraValidation], HorasExtrasPedidasControlador.ListarHorasExtrasPedidasAutorizadas);
        this.router.get('/observaciones', [TokenValidation, ModuloHoraExtraValidation], HorasExtrasPedidasControlador.ListarHorasExtrasPedidasObservacion);

        this.router.get('/datosSolicitud/:id_emple_hora', [TokenValidation, ModuloHoraExtraValidation], HorasExtrasPedidasControlador.ObtenerSolicitudHoraExtra);

        this.router.get('/datosAutorizacion/:id_hora', [TokenValidation, ModuloHoraExtraValidation], HorasExtrasPedidasControlador.ObtenerAutorizacionHoraExtra);
        this.router.get('/listar/solicitudes', [TokenValidation, ModuloHoraExtraValidation], HorasExtrasPedidasControlador.ListarPedidosHE);
        this.router.get('/solicitudes/autorizadas', [TokenValidation, ModuloHoraExtraValidation], HorasExtrasPedidasControlador.ListarPedidosHEAutorizadas);
        this.router.get('/listar/solicitudes/empleado/:id_empleado', [TokenValidation, ModuloHoraExtraValidation], HorasExtrasPedidasControlador.ListarPedidosHE_Empleado);
        this.router.get('/solicitudes/autorizadas/empleado/:id_empleado', [TokenValidation, ModuloHoraExtraValidation], HorasExtrasPedidasControlador.ListarPedidosHEAutorizadas_Empleado);

        // REPORTE CRITERIOS DE BUSQUEDA MÚLTIPLES
        this.router.put('/horas-planificadas/:desde/:hasta', [TokenValidation, ModuloHoraExtraValidation], HorasExtrasPedidasControlador.ReporteVacacionesMultiple);




        /** ************************************************************************************************* ** 
         ** **                         METODO DE MANEJO DE HORAS EXTRAS                                    ** ** 
         ** ************************************************************************************************* **/

        // CREAR REGISTRO DE HORAS EXTRAS
        this.router.post('/', [TokenValidation, ModuloHoraExtraValidation,upload2.single('uploads')], HorasExtrasPedidasControlador.CrearHoraExtraPedida);
        // ELIMINAR REGISTRO DE HORAS EXTRAS
        this.router.delete('/eliminar/:id_hora_extra/:documento', [TokenValidation, ModuloHoraExtraValidation], HorasExtrasPedidasControlador.EliminarHoraExtra);
        // EDITAR REGISTRO DE HORA EXTRA
        this.router.put('/:id/solicitud', [TokenValidation, ModuloHoraExtraValidation], HorasExtrasPedidasControlador.EditarHoraExtra);
        // BUSCAR LISTA DE HORAS EXTRAS DE UN USUARIO   **USADO
        this.router.get('/lista/:id_user', [TokenValidation, ModuloHoraExtraValidation], HorasExtrasPedidasControlador.ObtenerListaHora);
        // EDITAR TIEMPO AUTORIZADO DE SOLICITUD
        this.router.put('/tiempo-autorizado/:id_hora', [TokenValidation, ModuloHoraExtraValidation], HorasExtrasPedidasControlador.TiempoAutorizado);
        // EDITAR ESTADO DE LA SOLIICTUD
        this.router.put('/:id/estado', [TokenValidation, ModuloHoraExtraValidation], HorasExtrasPedidasControlador.ActualizarEstado);
        // EDITAR OBSERVACION DE SOLICITUD DE HORAS EXTRAS
        this.router.put('/observacion/:id', [TokenValidation, ModuloHoraExtraValidation], HorasExtrasPedidasControlador.ActualizarObservacion);
        // BUSCAR DATOS DE UNA SOLICITUD DE HORA EXTRA POR SU ID
        this.router.get('/:id', [TokenValidation, ModuloHoraExtraValidation], HorasExtrasPedidasControlador.ObtenerUnaSolicitudHE);
        // GUARDAR DOCUMENTO DE RESPALDO DE HORAS EXTRAS
        this.router.put('/:id/documento/:nombre', [TokenValidation, ModuloHoraExtraValidation, multipartMiddleware], HorasExtrasPedidasControlador.GuardarDocumentoHoras);
        // BUSQUEDA DE RESPALDOS DE HORAS EXTRAS
        this.router.get('/documentos/:docs', HorasExtrasPedidasControlador.ObtenerDocumento);
        // ELIMINAR DOCUMENTO DE RESPALDO DE HORAS EXTRAS
        this.router.put('/eliminar-documento', [TokenValidation, ModuloHoraExtraValidation, multipartMiddleware], HorasExtrasPedidasControlador.EliminarDocumentoHoras);
        // ELIMINAR DOCUMENTO DE RESPALDO DE HORAS EXTRAS MOVIL
        this.router.delete('/eliminar-documento-movil/:documento', HorasExtrasPedidasControlador.EliminarArchivoMovil);
        // ELIMINAR DOCUMENTO DE RESPALDO DE HORAS EXTRAS WEB
        this.router.delete('/eliminar-documento-web/:documento', [TokenValidation, ModuloHoraExtraValidation], HorasExtrasPedidasControlador.EliminarArchivoMovil);

        //------------------------------- Metodos APP MOVIL --------------------------------------------------------
        this.router.get('/horas-extras/lista-horas-extrasfechas', TokenValidation, HorasExtrasPedidasControlador.getlistaHorasExtrasByFechasyCodigo);
        this.router.get('/horas-extras/lista-horas-extras',TokenValidation, HorasExtrasPedidasControlador.getlistaHorasExtrasByCodigo)


        /** ************************************************************************************************** ** 
         ** **                         METODO PARA ENVIO DE NOTIFICACIONES                                  ** ** 
         ** ************************************************************************************************** **/

        // METODO DE ENVIO DE CORREO DESDE APLICACION WEB
        this.router.post('/mail-noti/', [TokenValidation, ModuloHoraExtraValidation], HorasExtrasPedidasControlador.SendMailNotifiHoraExtra);
        // METODO DE ENVIO DE CORREO DESDE APLICACION WEB
        this.router.post('/mail-noti-horas-extras-movil/:id_empresa', HorasExtrasPedidasControlador.EnviarCorreoHoraExtraMovil);
        // GUARDAR DOCUMENTO DE RESPALDO DE HORAS EXTRAS MOVIL
        this.router.put('/:id/documento-movil/:nombre', [multipartMiddleware], HorasExtrasPedidasControlador.GuardarDocumentoHoras);

    }
}

const HORA_EXTRA_PEDIDA_RUTA = new HorasExtrasPedidasRutas();

export default HORA_EXTRA_PEDIDA_RUTA.router;