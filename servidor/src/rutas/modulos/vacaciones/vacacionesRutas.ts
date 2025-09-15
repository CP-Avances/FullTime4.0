import { Router } from 'express';
import { TokenValidation } from '../../../libs/verificarToken'
import { ObtenerRutaVacacion } from '../../../libs/accesoCarpetas';
import VACACIONES_CONTROLADOR from '../../../controlador/modulos/vacaciones/vacacionesControlador';
import multer from 'multer';
import { DateTime } from 'luxon';
import pool from '../../../database';

const storage = multer.diskStorage({
    destination: async function (req, file, cb) {
        let id = req.params.id_empleado;
        var ruta = await ObtenerRutaVacacion(id);
        cb(null, ruta)
    },
    filename: async function (req, file, cb) {

        // FECHA DEL SISTEMA
        var fecha = DateTime.now();
        var anio = fecha.toFormat('yyyy');
        var mes = fecha.toFormat('MM');
        var dia = fecha.toFormat('dd');

        // DATOS DOCUMENTO
        let id = req.params.id_empleado;

        const usuario = await pool.query(
            `
            SELECT codigo FROM eu_empleados WHERE id = $1
            `
            , [id]);

        let documento = usuario.rows[0].codigo + '_' + anio + '_' + mes + '_' + dia + '_' + file.originalname;

        cb(null, documento)
    }
})

const upload = multer({ storage: storage });



class VacacionesRutas {
    public router: Router = Router();

    constructor() {
        this.configuracion();
    }

    configuracion(): void {
        //this.router.get('/', TokenValidation, VACACIONES_CONTROLADOR.ListarVacaciones);
        //METODO PARA LISTAR VACACIONES CONFIGURADAS
        this.router.get('/lista-todas-configuraciones', TokenValidation, VACACIONES_CONTROLADOR.ListarVacacionesConfiguradas);

        //this.router.get('/estado-solicitud', TokenValidation, VACACIONES_CONTROLADOR.ListarVacacionesAutorizadas);
        // METODO PARA BUSCAR VACACIONES POR ID DE PERIODO   **USADO
        this.router.get('/:id', TokenValidation, VACACIONES_CONTROLADOR.VacacionesIdPeriodo);

        //this.router.post('/fechasFeriado', TokenValidation, VACACIONES_CONTROLADOR.ObtenerFechasFeriado);

        this.router.get('/datosSolicitud/:id_empleado', TokenValidation, VACACIONES_CONTROLADOR.ObtenerSolicitudVacaciones);


        this.router.get('/datosAutorizacion/:id_vacaciones', TokenValidation, VACACIONES_CONTROLADOR.ObtenerAutorizacionVacaciones);
        this.router.get('/lista-vacacionesfechas/fechas/', TokenValidation, VACACIONES_CONTROLADOR.getlistaVacacionesByFechasyCodigo);

        //METODO PARA CONSULTAR DATO DE INCLUUIR FERIADO
        //this.router.get('/datosConfiguracion/:id_configuracion', TokenValidation, VACACIONES_CONTROLADOR.ObtenerParametroIncluirVacacion);






        /** ************************************************************************************************* **
         ** **                          METODOS PARA MANEJO DE VACACIONES                                  ** ** 
         ** ************************************************************************************************* **/

        // CREAR REGISTRO DE VACACIONES
        this.router.post('/', TokenValidation, VACACIONES_CONTROLADOR.CrearVacaciones);
        // EDITAR REGISTRO DE VACACIONES
        this.router.put('/vacacion-solicitada/:id', TokenValidation, VACACIONES_CONTROLADOR.EditarSolicitudVacaciones);
        //this.router.put('/:id/vacacion-solicitada', TokenValidation, VACACIONES_CONTROLADOR.EditarVacaciones);
        // BUSQUEDA DE VACACIONES MEDIANTE ID
        //this.router.get('/listar/vacacion/:id', TokenValidation, VACACIONES_CONTROLADOR.ListarVacacionId);
        // ELIMINAR SOLICITUD DE VACACIONES
        this.router.delete('/eliminar/:id_vacacion', TokenValidation, VACACIONES_CONTROLADOR.EliminarVacaciones);
        // EDITAR ESTADO DE VACACIONES
        this.router.put('/:id/estado', TokenValidation, VACACIONES_CONTROLADOR.ActualizarEstado);
        // BUSCAR DATOS DE VACACIONES POR ID DE VACACION
        //this.router.get('/one/:id', TokenValidation, VACACIONES_CONTROLADOR.ListarUnaVacacion);

        //METODO PARA VERIFICAR VACACIONES MULTIPLES
        this.router.post('/verificar-empleados', TokenValidation, VACACIONES_CONTROLADOR.VerificarVacacionesMultiples);

        //METODO PARA BUSCAR SOLICITUD EXISTENTE
        this.router.get('/verificar-solicitud/:id_empleado/:fecha_inicio/:fecha_final', TokenValidation, VACACIONES_CONTROLADOR.VerificarExistenciaSolicitud);

        // MÉTODO PARA GUARDAR DOCUMENTO EN VACACIONES
        this.router.put('/:id/documento/:id_empleado', [TokenValidation, upload.single('uploads')], VACACIONES_CONTROLADOR.GuardarDocumento);



        /** ************************************************************************************************* **
         ** **                        METODO DE ENVIO DE NOTIFICACIONES                                    ** ** 
         ** ************************************************************************************************* **/

        // ENVIO DE CORREO DE VACACIONES DESDE APLICACIONES WEB
        this.router.post('/mail-noti/', TokenValidation, VACACIONES_CONTROLADOR.EnviarCorreoVacacion);
        // ENVIO DE CORREO DE VACACIONES DESDE APLICACION MOVIL
        this.router.post('/mail-noti-vacacion-movil/:id_empresa', VACACIONES_CONTROLADOR.EnviarCorreoVacacionesMovil);




    }
}

const VACACIONES_RUTAS = new VacacionesRutas();

export default VACACIONES_RUTAS.router;