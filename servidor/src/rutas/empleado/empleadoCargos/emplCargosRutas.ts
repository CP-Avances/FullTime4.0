import { Router } from 'express';
import { TokenValidation } from '../../../libs/verificarToken';
import EMPLEADO_CARGO_CONTROLADOR from '../../../controlador/empleado/empleadoCargos/emplCargosControlador';
import multer from 'multer';
import { ObtenerRutaLeerPlantillas } from '../../../libs/accesoCarpetas';


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

        // METODO PARA EDITAR ESTADO DEL CARGO   **USADO
        this.router.post('/estado-cargo', TokenValidation, EMPLEADO_CARGO_CONTROLADOR.EditarEstadoCargo);
        // METODO PARA BUSCAR CARGOS ACTIVOS   **USADO
        this.router.post('/cargo-activo', TokenValidation, EMPLEADO_CARGO_CONTROLADOR.BuscarCargosActivos);
        // METODO PARA CREAR CARGOS DEL USUARIO    **USADO
        this.router.post('/', TokenValidation, EMPLEADO_CARGO_CONTROLADOR.Crear);
        // METODO DE BUSQUEDA DE DATOS DE CARGO DEL USUARIO MEDIANTE ID DEL CARGO    **USADO
        this.router.get('/:id', TokenValidation, EMPLEADO_CARGO_CONTROLADOR.ObtenerCargoID);
        // METODO PARA ACTUALIZAR REGISTRO    **USADO
        this.router.put('/:id_empl_contrato/:id/actualizar', TokenValidation, EMPLEADO_CARGO_CONTROLADOR.EditarCargo);
        // METODO DE CONSULTA DE DATOS DE CARGO POR ID CONTRATO   **USADO
        this.router.get('/cargoInfo/:id_empl_contrato', TokenValidation, EMPLEADO_CARGO_CONTROLADOR.EncontrarCargoIDContrato);
        // METODO PARA BUSCAR CARGOS POR FECHA    **USADO
        this.router.post('/fecha_cargo', TokenValidation, EMPLEADO_CARGO_CONTROLADOR.BuscarCargosFecha);
        // METODO PARA BUSCAR CARGOS POR FECHA EDICION    **USADO
        this.router.post('/fecha_cargo/editar', TokenValidation, EMPLEADO_CARGO_CONTROLADOR.BuscarCargosFechaEditar);
        this.router.get('/buscar/:id_empleado', TokenValidation, EMPLEADO_CARGO_CONTROLADOR.EncontrarIdCargo);
        // METODO PARA ELIMINAR EL CARGO REGISTRADO DE LA TABLA EU_EMPLEADOS_CARGOS      **USADO
        this.router.post('/eliminarCargo', [TokenValidation], EMPLEADO_CARGO_CONTROLADOR.EliminarCargo);


        /** ****************************************************************************************** **
         ** **                    METODOS DE CONSULTA DE TIPOS DE CARGOS                            ** **     
         ** ****************************************************************************************** **/

        // METODO DE BUSQUEDA DE TIPO DE CARGOS    **USADO
        this.router.get('/listar/tiposCargo', TokenValidation, EMPLEADO_CARGO_CONTROLADOR.ListarTiposCargo);
        // METODO PARA REGISTRAR TIPO DE CARGO    **USADO
        this.router.post('/tipo_cargo', TokenValidation, EMPLEADO_CARGO_CONTROLADOR.CrearTipoCargo);

        // Crear tipo cargo

        this.router.get('/buscar/cargo-departamento/:id', TokenValidation, EMPLEADO_CARGO_CONTROLADOR.BuscarTipoDepartamento);
        this.router.get('/buscar/cargo-sucursal/:id', TokenValidation, EMPLEADO_CARGO_CONTROLADOR.BuscarTipoSucursal);
        this.router.get('/buscar/cargo-regimen/:id', TokenValidation, EMPLEADO_CARGO_CONTROLADOR.BuscarTipoRegimen);

        /** ********************************************************************************************* **
         ** **            METODO PAARA LA LECTURA DEL REGISTRO MULTIPLE DE CARGOS                   ** **
         ** ********************************************************************************************* **/
        // METODO PARA VERIFICAR DATOS DE PLANTILLA DE CARGOS  **USADO
        this.router.post('/upload/revision', [TokenValidation, upload_plantilla.single('uploads')], EMPLEADO_CARGO_CONTROLADOR.RevisarDatos);
        // METODO PARA CARGAR DATOS DE PLANTILLA DE CARGOS   **USADO
        this.router.post('/cargar_plantilla/', TokenValidation, EMPLEADO_CARGO_CONTROLADOR.CargarPlantilla_cargos);

    }
}

const EMPLEADO_CARGO_RUTAS = new EmpleadosCargpsRutas();

export default EMPLEADO_CARGO_RUTAS.router;