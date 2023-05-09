import { Router } from 'express';
import AUTORIZA_DEPARTAMENTO_CONTROLADOR from '../../controlador/autorizaDepartamento/autorizaDepartamentoControlador';
import { TokenValidation } from '../../libs/verificarToken'

class DepartamentoRutas {
    public router: Router = Router();

    constructor() {
        this.configuracion();
    }

    configuracion(): void {

        // METODO DE BUSQUEDA DE USUARIO QUE AUTORIZA
        this.router.get('/autoriza/:id_empleado', AUTORIZA_DEPARTAMENTO_CONTROLADOR.EncontrarAutorizacionUsuario);
        // METODO PARA REGISTRAR AUTORIZA
        this.router.post('/', AUTORIZA_DEPARTAMENTO_CONTROLADOR.CrearAutorizaDepartamento);
        // METODO PARA ACTUALIZAR REGISTRO
        this.router.put('/', AUTORIZA_DEPARTAMENTO_CONTROLADOR.ActualizarAutorizaDepartamento);
        // METODO PARA ELIMINAR REGISTROS
        this.router.delete('/eliminar/:id', AUTORIZA_DEPARTAMENTO_CONTROLADOR.EliminarAutorizacionDepartamento);



        
        this.router.get('/', AUTORIZA_DEPARTAMENTO_CONTROLADOR.ListarAutorizaDepartamento);
        this.router.get('/empleadosAutorizan/:id_depar', AUTORIZA_DEPARTAMENTO_CONTROLADOR.ObtenerQuienesAutorizan);
        this.router.get('/listaempleadosAutorizan/:id_depa', AUTORIZA_DEPARTAMENTO_CONTROLADOR.ObtenerlistaEmpleadosAutorizan);
        

    }
}

const AUTORIZA_DEPARTAMENTO_RUTAS = new DepartamentoRutas();

export default AUTORIZA_DEPARTAMENTO_RUTAS.router;