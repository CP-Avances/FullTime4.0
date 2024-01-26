import { TokenValidation } from '../../libs/verificarToken';
import { Router } from 'express';
import multer from 'multer';
import path from 'path';

import HORARIO_CONTROLADOR from '../../controlador/catalogos/catHorarioControlador';
import { ObtenerRutaHorarios, ObtenerRutaLeerPlantillas } from '../../libs/accesoCarpetas';
import moment from 'moment';

const storage = multer.diskStorage({

    destination: function (req, file, cb) {
        cb(null, ObtenerRutaLeerPlantillas())
    },
    filename: function (req, file, cb) {
        // FECHA DEL SISTEMA
        //var fecha = moment();
        //var anio = fecha.format('YYYY');
        //var mes = fecha.format('MM');
        //var dia = fecha.format('DD');
        let documento = file.originalname;

        cb(null, documento);
    }
})

const upload = multer({ storage: storage });


class HorarioRutas {
    public router: Router = Router();

    constructor() {
        this.configuracion();
    }

    configuracion(): void {
        // REGISTRAR HORARIO
        this.router.post('/', TokenValidation, HORARIO_CONTROLADOR.CrearHorario);
        // BUSCAR HORARIO POR SU NOMBRE
        this.router.post('/buscar-horario/nombre', TokenValidation, HORARIO_CONTROLADOR.BuscarHorarioNombre);
        // CARGAR ARCHIVO DE RESPALDO  **//VERIFICADO
        this.router.put('/:id/documento/:archivo/verificar/:codigo', [TokenValidation, upload.single('uploads')], HORARIO_CONTROLADOR.GuardarDocumentoHorario);
        // ACTUALIZAR DATOS DE HORARIO
        this.router.put('/editar/:id', TokenValidation, HORARIO_CONTROLADOR.EditarHorario);
        // ELIMINAR DOCUMENTO DE HORARIO BASE DE DATOS - SERVIDOR
        this.router.put('/eliminar_horario/base_servidor', [TokenValidation], HORARIO_CONTROLADOR.EliminarDocumento);
        // ELIMINAR DOCUMENTO DE HORARIOS DEL SERVIDOR
        this.router.put('/eliminar_horario/servidor', [TokenValidation], HORARIO_CONTROLADOR.EliminarDocumentoServidor);
        // BUSCAR LISTA DE CATALOGO HORARIOS   --**VERIFICADO
        this.router.get('/', TokenValidation, HORARIO_CONTROLADOR.ListarHorarios);
        // OBTENER VISTA DE DOCUMENTOS
        this.router.get('/documentos/:docs', HORARIO_CONTROLADOR.ObtenerDocumento);
        // BUSCAR HORARIOS SIN CONSIDERAR UNO EN ESPECIFICO (METODO DE EDICION)
        this.router.post('/buscar_horario/edicion', TokenValidation, HORARIO_CONTROLADOR.BuscarHorarioNombre_);
        // METODO PARA ELIMINAR REGISTRO
        this.router.delete('/eliminar/:id', TokenValidation, HORARIO_CONTROLADOR.EliminarRegistros);
        // METODO PARA BUSCAR DATOS DE UN HORARIO
        this.router.get('/:id', TokenValidation, HORARIO_CONTROLADOR.ObtenerUnHorario);
        // METODO PARA ACTUALIZAR HORAS TRABAJADAS
        this.router.put('/update-horas-trabaja/:id', TokenValidation, HORARIO_CONTROLADOR.EditarHorasTrabaja);




        // VERIFICAR DATOS DE LA PLANTILLA DE CATÁLOGO HORARIO Y LUEGO SUBIR AL SISTEMA
        this.router.post('/cargarHorario/verificarDatos/upload', [TokenValidation, upload.single('uploads')], HORARIO_CONTROLADOR.VerificarDatos);
        // this.router.post('/cargarHorario/verificarPlantilla/upload', [TokenValidation, upload.single('uploads')], HORARIO_CONTROLADOR.VerificarPlantilla);
        this.router.post('/cargarHorario/upload', [TokenValidation, upload.single('uploads')], HORARIO_CONTROLADOR.CargarHorarioPlantilla);
    }
}

const HORARIO_RUTAS = new HorarioRutas();

export default HORARIO_RUTAS.router;