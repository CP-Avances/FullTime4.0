import { Router } from 'express';
import TIPOCARGOS_CONTROLADOR from '../../controlador/catalogos/catTipoCargos.Controlador'
import { TokenValidation } from '../../libs/verificarToken';
import multer from 'multer';
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

class TiposCargosRutas {
    public router: Router = Router();

    constructor() {
        this.configuracion();
    }

    configuracion(): void {
        this.router.get('/', TokenValidation, TIPOCARGOS_CONTROLADOR.listaTipoCargos);
        this.router.post('/:cargo', TokenValidation, TIPOCARGOS_CONTROLADOR.CrearCargo);
        this.router.put('/', TokenValidation, TIPOCARGOS_CONTROLADOR.EditarCargo);
        this.router.delete('/eliminar/:id', TokenValidation, TIPOCARGOS_CONTROLADOR.eliminarRegistro);
        this.router.post('/upload/revision', [TokenValidation, upload.single('uploads')], TIPOCARGOS_CONTROLADOR.VerfificarPlantillaTipoCargos);
        this.router.post('/cargar_plantilla/', TokenValidation, TIPOCARGOS_CONTROLADOR.CargarPlantilla);
    }
}

const TIPOS_CARGOS_RUTAS = new TiposCargosRutas();
export default TIPOS_CARGOS_RUTAS.router;