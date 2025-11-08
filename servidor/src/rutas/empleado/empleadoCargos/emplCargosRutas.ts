import EMPLEADO_CARGO_CONTROLADOR from '../../../controlador/empleado/empleadoCargos/emplCargosControlador';
import { ObtenerRutaLeerPlantillas } from '../../../libs/accesoCarpetas';
import { TokenValidation } from '../../../libs/verificarToken';
import { Router } from 'express';
import multer from 'multer';

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

class EmpleadosCargpsRutas {
    public router: Router = Router();

    constructor() {

        this.configuracion();
    }

    configuracion(): void {

        /** ****************************************************************************************** **
         ** **                    METODOS DE CONSULTA DE TIPOS DE CARGOS                            ** **     
         ** ****************************************************************************************** **/

        // METODO DE BUSQUEDA DE TIPO DE CARGOS    **USADO
        this.router.get('/listar/tiposCargo', TokenValidation, EMPLEADO_CARGO_CONTROLADOR.ListarTiposCargo);
        // METODO PARA REGISTRAR TIPO DE CARGO    **USADO
        this.router.post('/tipo_cargo', TokenValidation, EMPLEADO_CARGO_CONTROLADOR.CrearTipoCargo);


        /** ***************************************************************************************** **
         ** **                METODO DE CONSULTA DE CARGOS DEL USUARIO                             ** ** 
         ** ***************************************************************************************** **/

        // METODO PARA EDITAR ESTADO DEL CARGO   **USADO
        this.router.post('/estado-cargo', TokenValidation, EMPLEADO_CARGO_CONTROLADOR.EditarEstadoCargo);
        // METODO PARA BUSCAR CARGOS ACTIVOS   **USADO
        this.router.post('/cargo-activo', TokenValidation, EMPLEADO_CARGO_CONTROLADOR.BuscarCargosActivos);
        // METODO PARA ELIMINAR EL CARGO REGISTRADO DE LA TABLA EU_EMPLEADOS_CARGOS      **USADO
        this.router.post('/eliminarCargo', [TokenValidation], EMPLEADO_CARGO_CONTROLADOR.EliminarCargo);
        // METODO DE BUSQUEDA DE DATOS DE CARGO DEL USUARIO MEDIANTE ID DEL CARGO    **USADO
        this.router.get('/:id', TokenValidation, EMPLEADO_CARGO_CONTROLADOR.ObtenerCargoID);
        // METODO PARA CREAR CARGOS DEL USUARIO    **USADO
        this.router.post('/', TokenValidation, EMPLEADO_CARGO_CONTROLADOR.Crear);
        // METODO PARA ACTUALIZAR REGISTRO    **USADO
        this.router.put('/:id_empl_contrato/:id/actualizar', TokenValidation, EMPLEADO_CARGO_CONTROLADOR.EditarCargo);
        // METODO DE CONSULTA DE DATOS DE CARGO POR ID CONTRATO   **USADO
        this.router.get('/cargoInfo/:id_empl_contrato', TokenValidation, EMPLEADO_CARGO_CONTROLADOR.EncontrarCargoIDContrato);
        // METODO PARA BUSCAR CARGOS POR FECHA    **USADO
        this.router.post('/fecha_cargo', TokenValidation, EMPLEADO_CARGO_CONTROLADOR.BuscarCargosFecha);
        // METODO PARA BUSCAR CARGOS POR FECHA EDICION    **USADO
        this.router.post('/fecha_cargo/editar', TokenValidation, EMPLEADO_CARGO_CONTROLADOR.BuscarCargosFechaEditar);
        // METODO PARA VERIFICAR DATOS DE PLANTILLA DE CARGOS  **USADO
        this.router.post('/upload/revision', [TokenValidation, upload_plantilla.single('uploads')], EMPLEADO_CARGO_CONTROLADOR.RevisarDatos);
        // METODO PARA CARGAR DATOS DE PLANTILLA DE CARGOS   **USADO
        this.router.post('/cargar_plantilla/', TokenValidation, EMPLEADO_CARGO_CONTROLADOR.CargarPlantilla_cargos);
        // METODO PARA BUSCAR DATOS DEL USUARIO DE ACUERDO AL ID DEL CARGO   **USADO**
        this.router.get('/buscar/:id_empleado', TokenValidation, EMPLEADO_CARGO_CONTROLADOR.EncontrarIdCargo);

    }
}

const EMPLEADO_CARGO_RUTAS = new EmpleadosCargpsRutas();

export default EMPLEADO_CARGO_RUTAS.router;