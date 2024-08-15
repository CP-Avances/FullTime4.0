import TIPOSCARGOSCONTROLADOR from '../../controlador/catalogos/catTipoCargos.Controlador';
import { ObtenerRutaLeerPlantillas } from '../../libs/accesoCarpetas';
import { TokenValidation } from '../../libs/verificarToken';
import { Router } from 'express';
import multer from 'multer';

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

class TiposCargosRutas {
    public router: Router = Router();

    constructor() {
        this.configuracion();
    }

    configuracion(): void {

        // METODO PARA BUSCAR TIPO CARGO POR SU NOMBRE   **USADO
        this.router.post('/buscar/tipo_cargo/nombre', TokenValidation, TIPOSCARGOSCONTROLADOR.BuscarTipoCargoNombre);
        // METODO PARA LISTAR TIPO CARGOS   **USADO
        this.router.get('/', TokenValidation, TIPOSCARGOSCONTROLADOR.ListaTipoCargos);
        // METODO PARA REGISTRAR TIPO CARGO    **USADO
        this.router.post('/crearCargo', TokenValidation, TIPOSCARGOSCONTROLADOR.CrearCargo);
        // METODO PARA EDITAR TIPO CARGO   **USADO
        this.router.put('/', TokenValidation, TIPOSCARGOSCONTROLADOR.EditarCargo);
        // METODO PARA ELIMINAR TIPO CARGO    **USADO
        this.router.delete('/eliminar/:id', TokenValidation, TIPOSCARGOSCONTROLADOR.EliminarRegistro);
        // METODO PARA LEER DATOS DE PLANTILLA   **USADO
        this.router.post('/upload/revision', [TokenValidation, upload.single('uploads')], TIPOSCARGOSCONTROLADOR.VerificarPlantillaTipoCargos);
        // METODO PARA GUARDAR DATOS DE PLANTILLA    **USADO
        this.router.post('/cargar_plantilla/', TokenValidation, TIPOSCARGOSCONTROLADOR.CargarPlantilla);
    }
}

const TIPOS_CARGOS_RUTAS = new TiposCargosRutas();

export default TIPOS_CARGOS_RUTAS.router;