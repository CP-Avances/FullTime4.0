import VACUNA_CONTROLADOR from '../../../controlador/empleado/empleadoVacuna/vacunasControlador';
import { ObtenerRutaVacuna } from '../../../libs/accesoCarpetas';
import { TokenValidation } from '../../../libs/verificarToken';
import { Router } from 'express';
import multer from 'multer';
import pool from '../../../database';
import moment from 'moment';
moment.locale('es');

const storage = multer.diskStorage({

    destination: async function (req, file, cb) {
        let id = req.params.id_empleado;
        var ruta = await ObtenerRutaVacuna(id);
        cb(null, ruta)
    },
    filename: async function (req, file, cb) {

        // FECHA DEL SISTEMA
        var fecha = moment();
        var anio = fecha.format('YYYY');
        var mes = fecha.format('MM');
        var dia = fecha.format('DD');

        // DATOS DOCUMENTO
        let id = req.params.id_empleado;

        const usuario = await pool.query(
            `
            SELECT codigo FROM empleados WHERE id = $1
            `
            , [id]);

        let documento = usuario.rows[0].codigo + '_' + anio + '_' + mes + '_' + dia + '_' + file.originalname;

        cb(null, documento)
    }
})

const upload = multer({ storage: storage });

class VacunaRutas {
    public router: Router = Router();

    constructor() {
        this.configuracion();
    }

    configuracion(): void {

        // METODO PARA LISTAR REGISTROS DE UN USUARIO
        this.router.get('/:id_empleado', TokenValidation, VACUNA_CONTROLADOR.ListarUnRegistro);
        // METODO DE BUSQUEDA DE TIPOS DE VACUNA REGISTRADOS
        this.router.get('/lista/tipo_vacuna', TokenValidation, VACUNA_CONTROLADOR.ListarTipoVacuna);
        // METODO REGISTRO DE VACUNACIÓN
        this.router.post('/', TokenValidation, VACUNA_CONTROLADOR.CrearRegistro);
        // METODO PARA GUARDAR DOCUMENTO 
        this.router.put('/:id/documento/:id_empleado', [TokenValidation, upload.single('uploads')], VACUNA_CONTROLADOR.GuardarDocumento);
        // METODO ACTUALIZACION DE REGISTROS DE VACUNACION
        this.router.put('/:id', TokenValidation, VACUNA_CONTROLADOR.ActualizarRegistro);
        // ELIMINAR DOCUMENTO DE VACUNAS DEL SERVIDOR
        this.router.put('/eliminar_carnet/servidor', [TokenValidation], VACUNA_CONTROLADOR.EliminarDocumentoServidor);
        // ELIMINAR DOCUMENTO DE VACUNAS
        this.router.put('/eliminar_carnet/base_servidor', [TokenValidation], VACUNA_CONTROLADOR.EliminarDocumento);
        // METODO DE ELIMINACION DE REGISTRO DE VACUNA
        this.router.delete('/eliminar/:id/:documento', TokenValidation, VACUNA_CONTROLADOR.EliminarRegistro);
        // METODO REGISTRO DE TIPO DE VACUNA
        this.router.post('/tipo_vacuna', TokenValidation, VACUNA_CONTROLADOR.CrearTipoVacuna);
        // METODO PARA BUSCAR UN DOCUMENTO
        this.router.get('/documentos/:docs/:id', VACUNA_CONTROLADOR.ObtenerDocumento);





        // METODO PARA LEER TODOS LOS REGISTROS DE VACUNACION
        this.router.get('/', TokenValidation, VACUNA_CONTROLADOR.ListarRegistro);
    }
}

const VACUNA_RUTAS = new VacunaRutas();

export default VACUNA_RUTAS.router;