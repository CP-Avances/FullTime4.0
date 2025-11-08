import HORARIO_CONTROLADOR from '../../controlador/horarios/catHorarioControlador';
import { ObtenerRutaHorarios, ObtenerRutaLeerPlantillas } from '../../libs/accesoCarpetas';
import { TokenValidation } from '../../libs/verificarToken';
import { DateTime } from 'luxon';
import { Router } from 'express';
import multer from 'multer';

// MANEJO DE PLANTILLAS DE DATOS
const storage = multer.diskStorage({

    destination: function (req, file, cb) {
        cb(null, ObtenerRutaLeerPlantillas())
    },

    filename: function (req, file, cb) {
        let documento = file.originalname;
        cb(null, documento);
    }
})

const upload = multer({ storage: storage });

// MANEJO DE ARCHIVOS DE HORARIOS
const storage_horario = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, ObtenerRutaHorarios())
    },

    filename: function (req, file, cb) {
        // FECHA DEL SISTEMA
        var fecha = DateTime.now();
        var anio = fecha.toFormat('yyyy');
        var mes = fecha.toFormat('MM');
        var dia = fecha.toFormat('dd');
        let { id, codigo } = req.params;
        cb(null, id + '_' + codigo + '_' + anio + '_' + mes + '_' + dia + '_' + file.originalname)
    }
})

const upload_horario = multer({ storage: storage_horario });

class HorarioRutas {
    public router: Router = Router();

    constructor() {
        this.configuracion();
    }

    configuracion(): void {
        // REGISTRAR HORARIO    **USADO
        this.router.post('/', TokenValidation, HORARIO_CONTROLADOR.CrearHorario);
        // BUSCAR HORARIO POR SU NOMBRE   **USADO
        this.router.post('/buscar-horario/nombre', TokenValidation, HORARIO_CONTROLADOR.BuscarHorarioNombre);
        // CARGAR ARCHIVO DE RESPALDO    **USADO
        this.router.put('/:id/documento/:archivo/verificar/:codigo', [TokenValidation, upload_horario.single('uploads')], HORARIO_CONTROLADOR.GuardarDocumentoHorario);
        // ACTUALIZAR DATOS DE HORARIO    **USADO
        this.router.put('/editar/:id', TokenValidation, HORARIO_CONTROLADOR.EditarHorario);
        // ELIMINAR DOCUMENTO DE HORARIO BASE DE DATOS - SERVIDOR    **USADO
        this.router.put('/eliminar_horario/base_servidor', [TokenValidation], HORARIO_CONTROLADOR.EliminarDocumento);
        // ELIMINAR DOCUMENTO DE HORARIOS DEL SERVIDOR   **USADO
        this.router.put('/eliminar_horario/servidor', [TokenValidation], HORARIO_CONTROLADOR.EliminarDocumentoServidor);
        // BUSCAR LISTA DE CATALOGO HORARIOS   **USADO
        this.router.get('/', TokenValidation, HORARIO_CONTROLADOR.ListarHorarios);
        // OBTENER VISTA DE DOCUMENTOS   **USADO
        this.router.get('/documentos/:docs', HORARIO_CONTROLADOR.ObtenerDocumento);
        // BUSCAR HORARIOS SIN CONSIDERAR UNO EN ESPECIFICO (METODO DE EDICION)   **USADO
        this.router.post('/buscar_horario/edicion', TokenValidation, HORARIO_CONTROLADOR.BuscarHorarioNombre_);
        // METODO PARA ELIMINAR REGISTRO    **USADO
        this.router.delete('/eliminar/:id', TokenValidation, HORARIO_CONTROLADOR.EliminarRegistros);
        // METODO PARA BUSCAR DATOS DE UN HORARIO   **USADO
        this.router.get('/:id', TokenValidation, HORARIO_CONTROLADOR.ObtenerUnHorario);
        // METODO PARA ACTUALIZAR HORAS TRABAJADAS   **USADO
        this.router.put('/update-horas-trabaja/:id', TokenValidation, HORARIO_CONTROLADOR.EditarHorasTrabaja);
        // VERIFICAR DATOS DE LA PLANTILLA DE CATALOGO HORARIO Y LUEGO SUBIR AL SISTEMA   **USADO
        this.router.post('/cargarHorario/verificarDatos/upload', [TokenValidation, upload.single('uploads')], HORARIO_CONTROLADOR.VerificarDatos);
        // REGISTRAR DATOS DE PLANTILLA EN EL SISTEMA   **USADO
        this.router.post('/cargarHorario/upload', [TokenValidation, upload.single('uploads')], HORARIO_CONTROLADOR.CargarHorarioPlantilla);
    }
}

const HORARIO_RUTAS = new HorarioRutas();

export default HORARIO_RUTAS.router;