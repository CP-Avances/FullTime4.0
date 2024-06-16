import { Router } from 'express';
import DEPARTAMENTO_CONTROLADOR from '../../controlador/catalogos/catDepartamentoControlador';
import { TokenValidation } from '../../libs/verificarToken';

import multer from 'multer';
import moment from 'moment';
import { ObtenerRutaLeerPlantillas } from '../../libs/accesoCarpetas';

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

class DepartamentoRutas {
    public router: Router = Router();

    constructor() {
        this.configuracion();
    }

    configuracion(): void {
        // REGISTRAR DEPARTAMENTO
        this.router.post('/', TokenValidation, DEPARTAMENTO_CONTROLADOR.CrearDepartamento);
        // BUSCAR DEPARTAMENTOS POR ID SUCURSAL
        this.router.get('/sucursal-departamento/:id_sucursal', TokenValidation, DEPARTAMENTO_CONTROLADOR.ObtenerDepartamentosSucursal);
        // BUSCAR DEPARTAMENTO POR ID
        this.router.get('/infodepartamento/:id', TokenValidation, DEPARTAMENTO_CONTROLADOR.ObtenerDepartamento);
        // BUSCAR DEPARTAMENTOS POR ID SUCURSAL Y EXCLUIR DEPARTAMENTO ACTUALIZADO
        this.router.get('/sucursal-departamento-edicion/:id_sucursal/:id', TokenValidation, DEPARTAMENTO_CONTROLADOR.ObtenerDepartamentosSucursal_);
        // ACTUALIZAR DEPARTAMENTO  --**VERIFICADO
        this.router.put('/:id', TokenValidation, DEPARTAMENTO_CONTROLADOR.ActualizarDepartamento);
        // LISTAR DEPARTAMENTOS    --**VERIFICADO
        this.router.get('/', TokenValidation, DEPARTAMENTO_CONTROLADOR.ListarDepartamentos);
       // LISTAR DEPARTAMENTOS
        this.router.get('/listarDepartamentos', TokenValidation, DEPARTAMENTO_CONTROLADOR.ListarDepartamentos);
        // METODO PARA LISTAR INFORMACION DE DEPARTAMENTOS POR ID DE SUCURSAL
        this.router.get('/buscar/datosDepartamento/:id_sucursal', TokenValidation, DEPARTAMENTO_CONTROLADOR.ListarDepartamentosSucursal);
        // METODO PARA ELIMINAR REGISTRO
        this.router.delete('/eliminar/:id', TokenValidation, DEPARTAMENTO_CONTROLADOR.EliminarRegistros);
        // REGISTRAR NIVELDEPARTAMENTO   --**VERIFICADO
        this.router.post('/crearnivel', TokenValidation, DEPARTAMENTO_CONTROLADOR.CrearNivelDepa);
        // BUSCAR NIVEL DEPARTAMENTO POR ID_DEPARTAMENTO Y ID_SUCURSAL   --**VERIFICADO
        this.router.get('/infoniveldepa/:id_departamento/:id_establecimiento', TokenValidation, DEPARTAMENTO_CONTROLADOR.ObtenerNivelesDepa);
        // METODO PARA ELIMINAR REGISTRO NIVEL DEPARTAMENTO    --**VERIFICADO
        this.router.delete('/eliminarniveldepa/:id', TokenValidation, DEPARTAMENTO_CONTROLADOR.EliminarRegistroNivelDepa);
        // ACTUALIZAR NIVEL DEPARTAMENTO TABLA NIVEL_JERARQUICO  --**VERIFICADO
        this.router.put('/nivelactualizar/:id', TokenValidation, DEPARTAMENTO_CONTROLADOR.ActualizarNivelDepa);
        // ACTUALIZAR NOMBRE DE DEPARTAMENTOS EN NIVELES DE APROBACION   --**VERIFICADO
        this.router.post('/actualizarNombrenivel', TokenValidation, DEPARTAMENTO_CONTROLADOR.ActualizarNombreNivel);
        this.router.get('/busqueda-cargo/:id_cargo', TokenValidation, DEPARTAMENTO_CONTROLADOR.BuscarDepartamentoPorCargo);
        this.router.get('/buscar/regimen-departamento/:id', TokenValidation, DEPARTAMENTO_CONTROLADOR.ListarDepartamentosRegimen);
        this.router.post('/upload/revision', [TokenValidation, upload.single('uploads')], DEPARTAMENTO_CONTROLADOR.RevisarDatos);
        this.router.post('/cargar_plantilla/', TokenValidation, DEPARTAMENTO_CONTROLADOR.CargarPlantilla);

        this.router.post('/upload/revisionNivel', [TokenValidation, upload.single('uploads')], DEPARTAMENTO_CONTROLADOR.RevisarDatosNivel);
        this.router.post('/cargar_plantillaNivel/', TokenValidation, DEPARTAMENTO_CONTROLADOR.CargarPlantillaNivelesDep);

    }
}

const DEPARTAMENTO_RUTAS = new DepartamentoRutas();

export default DEPARTAMENTO_RUTAS.router;