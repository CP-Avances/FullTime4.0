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

        /** ************************************************************************************************* **
         ** **                    METODOS USADOS EN LA CONFIGURACION DE VACACIONES                         ** ** 
         ** ************************************************************************************************* **/

        // METODO PARA LISTAR VACACIONES CONFIGURADAS   **USADO
        this.router.get('/lista-todas-configuraciones', TokenValidation, VACACIONES_CONTROLADOR.ListarVacacionesConfiguradas);


        /** ************************************************************************************************* **
         ** **                          METODOS PARA MANEJO DE VACACIONES                                  ** ** 
         ** ************************************************************************************************* **/

        // CREAR REGISTRO DE VACACIONES    **USADO**
        this.router.post('/', TokenValidation, VACACIONES_CONTROLADOR.CrearVacaciones);

        // EDITAR REGISTRO DE VACACIONES
        this.router.put('/vacacion-solicitada/:id', TokenValidation, VACACIONES_CONTROLADOR.EditarSolicitudVacaciones);

        // METODO PARA ELIMINAR UNA SOLICITUD DE VACACIONES POR SU ID
        this.router.delete('/eliminarSolicitudVacaciones/:id', TokenValidation, VACACIONES_CONTROLADOR.EliminarSolicitudesVacaciones);

        // METODO PARA OBTENER TODAS LAS SOLICITUDES DE VACACIONES
        this.router.get('/solicitudes-vacaciones', TokenValidation, VACACIONES_CONTROLADOR.ObtenerSolicitudesVacaciones);

        // METODO PARA VERIFICAR VACACIONES MULTIPLES   **USADO**
        this.router.post('/verificar-empleados', TokenValidation, VACACIONES_CONTROLADOR.VerificarVacacionesMultiples);

        // METODO PARA BUSCAR SOLICITUD EXISTENTE   **USADO**
        this.router.get('/verificar-solicitud/:id_empleado/:fecha_inicio/:fecha_final', TokenValidation, VACACIONES_CONTROLADOR.VerificarExistenciaSolicitud);

        // METODO PARA GUARDAR DOCUMENTO EN VACACIONES  **USADO**
        this.router.put('/:id/documento/:id_empleado', [TokenValidation, upload.single('uploads')], VACACIONES_CONTROLADOR.GuardarDocumento);


        /** ************************************************************************************************* **
         ** **                        METODOS USADOS DENTRO DE LA APLICACION MOVIL                         ** ** 
         ** ************************************************************************************************* **/

        // ENVIO DE CORREO DE VACACIONES DESDE APLICACION MOVIL
        this.router.post('/mail-noti-vacacion-movil/:id_empresa', VACACIONES_CONTROLADOR.EnviarCorreoVacacionesMovil);

        // METODO PARA MOSTRAR LAS SOLICITUDES DE VACACIONES DEL EMPLEADO POR SU CODIGO
        this.router.get('/lista-vacacionesfechas/fechas/', TokenValidation, VACACIONES_CONTROLADOR.getlistaVacacionesByFechasyCodigo);


    }
}

const VACACIONES_RUTAS = new VacacionesRutas();

export default VACACIONES_RUTAS.router;