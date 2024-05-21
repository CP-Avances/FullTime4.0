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

        // METODO PARA CREAR CARGOS DEL USUARIO
        this.router.post('/', TokenValidation, EMPLEADO_CARGO_CONTROLADOR.Crear);
        // METODO DE BUSQUEDA DE DATOS DE CARGO DEL USUARIO MEDIANTE ID DEL CARGO
        this.router.get('/:id', TokenValidation, EMPLEADO_CARGO_CONTROLADOR.ObtenerCargoID);
        // METODO PARA ACTUALIZAR REGISTRO
        this.router.put('/:id_empl_contrato/:id/actualizar', TokenValidation, EMPLEADO_CARGO_CONTROLADOR.EditarCargo);
        // METODO DE CONSULTA DE DATOS DE CARGO POR ID CONTRATO
        this.router.get('/cargoInfo/:id_empl_contrato', TokenValidation, EMPLEADO_CARGO_CONTROLADOR.EncontrarCargoIDContrato);
        // METODO PARA BUSCAR CARGOS POR FECHA
        this.router.post('/fecha_cargo', TokenValidation, EMPLEADO_CARGO_CONTROLADOR.BuscarCargosFecha);
        // METODO PARA BUSCAR CARGOS POR FECHA EDICION
        this.router.post('/fecha_cargo/editar', TokenValidation, EMPLEADO_CARGO_CONTROLADOR.BuscarCargosFechaEditar);





        this.router.get('/', TokenValidation, EMPLEADO_CARGO_CONTROLADOR.list);
        this.router.get('/lista-empleados/', TokenValidation, EMPLEADO_CARGO_CONTROLADOR.ListarCargoEmpleado);
        this.router.get('/buscar/:id_empleado', TokenValidation, EMPLEADO_CARGO_CONTROLADOR.EncontrarIdCargo);
        this.router.get('/buscar/cargoActual/:id_empleado', TokenValidation, EMPLEADO_CARGO_CONTROLADOR.EncontrarIdCargoActual);


        /** ****************************************************************************************** **
         ** **                    METODOS DE CONSULTA DE TIPOS DE CARGOS                            ** **     
         ** ****************************************************************************************** **/

        // METODO DE BUSQUEDA DE TIPO DE CARGOS
        this.router.get('/listar/tiposCargo', TokenValidation, EMPLEADO_CARGO_CONTROLADOR.ListarTiposCargo);
        // METODO PARA REGISTRAR TIPO DE CARGO
        this.router.post('/tipo_cargo', TokenValidation, EMPLEADO_CARGO_CONTROLADOR.CrearTipoCargo);





        // Crear tipo cargo

        this.router.get('/buscar/ultimoTipo/nombreCargo/:id', TokenValidation, EMPLEADO_CARGO_CONTROLADOR.BuscarUnTipo);
        this.router.get('/buscar/cargo-departamento/:id', TokenValidation, EMPLEADO_CARGO_CONTROLADOR.BuscarTipoDepartamento);
        this.router.get('/buscar/cargo-sucursal/:id', TokenValidation, EMPLEADO_CARGO_CONTROLADOR.BuscarTipoSucursal);
        this.router.get('/buscar/cargo-regimen/:id', TokenValidation, EMPLEADO_CARGO_CONTROLADOR.BuscarTipoRegimen);


        /** ********************************************************************************************* **
         ** **            METODO PAARA LA LECTURA DEL REGISTRO MULTIPLE DE CARGOS                   ** **
         ** ********************************************************************************************* **/
        this.router.post('/upload/revision', [TokenValidation, upload_plantilla.single('uploads')], EMPLEADO_CARGO_CONTROLADOR.RevisarDatos);
        this.router.post('/cargar_plantilla/', TokenValidation, EMPLEADO_CARGO_CONTROLADOR.CargarPlantilla_cargos);

    }
}

const EMPLEADO_CARGO_RUTAS = new EmpleadosCargpsRutas();

export default EMPLEADO_CARGO_RUTAS.router;