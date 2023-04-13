import { Router } from 'express';
import DEPARTAMENTO_CONTROLADOR from '../../controlador/catalogos/catDepartamentoControlador';
import { TokenValidation } from '../../libs/verificarToken';

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
        // BUSCAR DEPARTAMENTOS POR ID SUCURSAL Y EXCLUIR DEPARTAMENTO ACTUALIZADO
        this.router.get('/sucursal-departamento-edicion/:id_sucursal/:id', TokenValidation, DEPARTAMENTO_CONTROLADOR.ObtenerDepartamentosSucursal_);
        // ACTUALIZAR DEPARTAMENTO
        this.router.put('/:id', TokenValidation, DEPARTAMENTO_CONTROLADOR.ActualizarDepartamento);
        // LISTAR DEPARTAMENTOS
        this.router.get('/', TokenValidation, DEPARTAMENTO_CONTROLADOR.ListarDepartamentos);
        // METODO PARA LISTAR INFORMACION DE DEPARTAMENTOS POR ID DE SUCURSAL
        this.router.get('/buscar/datosDepartamento/:id_sucursal', TokenValidation, DEPARTAMENTO_CONTROLADOR.ListarDepartamentosSucursal);
        // METODO PARA ELIMINAR REGISTRO
        this.router.delete('/eliminar/:id', TokenValidation, DEPARTAMENTO_CONTROLADOR.EliminarRegistros);
        // METODO PARA CREAR ARCHIVO XML
        this.router.post('/xmlDownload/', TokenValidation, DEPARTAMENTO_CONTROLADOR.FileXML);
        // METODO PARA DESCARGAR ARCHIVO XML
        this.router.get('/download/:nameXML', DEPARTAMENTO_CONTROLADOR.downloadXML);








        this.router.get('/nombreDepartamento', TokenValidation, DEPARTAMENTO_CONTROLADOR.ListarNombreDepartamentos);
        this.router.get('/idDepartamento/:nombre', TokenValidation, DEPARTAMENTO_CONTROLADOR.ListarIdDepartamentoNombre);
        this.router.get('/:id', TokenValidation, DEPARTAMENTO_CONTROLADOR.ObtenerUnDepartamento);
        this.router.get('/busqueda/:nombre', TokenValidation, DEPARTAMENTO_CONTROLADOR.ObtenerIdDepartamento);
        this.router.get('/busqueda-cargo/:id_cargo', TokenValidation, DEPARTAMENTO_CONTROLADOR.BuscarDepartamentoPorCargo);



        this.router.get('/buscar/regimen-departamento/:id', TokenValidation, DEPARTAMENTO_CONTROLADOR.ListarDepartamentosRegimen);

    }
}

const DEPARTAMENTO_RUTAS = new DepartamentoRutas();

export default DEPARTAMENTO_RUTAS.router;