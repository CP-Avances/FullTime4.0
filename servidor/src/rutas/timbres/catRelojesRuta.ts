import { Router } from 'express';
import RELOJES_CONTROLADOR from '../../controlador/timbres/catRelojesControlador';
import { ObtenerRutaLeerPlantillas } from '../../libs/accesoCarpetas';
import { TokenValidation } from '../../libs/verificarToken';
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

class RelojesRuta {
    public router: Router = Router();

    constructor() {
        this.configuracion();
    }

    configuracion(): void {

        // METODO PARA BUSCAR DISPOSITIVOS   **USADO
        this.router.get('/', TokenValidation, RELOJES_CONTROLADOR.ListarRelojes);
        // METODO PARA ELIMINAR REGISTROS      **USADO
        this.router.delete('/eliminar/:id', TokenValidation, RELOJES_CONTROLADOR.EliminarRegistros);
        // METODO PARA REGISTRAR DISPOSITIVO   **USADO
        this.router.post('/', TokenValidation, RELOJES_CONTROLADOR.CrearRelojes);
        // METODO PARA VER DATOS DE UN DISPOSITIVO    **USADO
        this.router.get('/:id', TokenValidation, RELOJES_CONTROLADOR.ListarUnReloj);
        // METODO PARA ACTUALIZAR REGISTRO   **USADO
        this.router.put('/', TokenValidation, RELOJES_CONTROLADOR.ActualizarReloj);
        // METODO PARA BUSCAR DATOS GENERALES DE DISPOSITIVOS   **USADO
        this.router.get('/datosReloj/:id', TokenValidation, RELOJES_CONTROLADOR.ListarDatosUnReloj);
        // METODO PARA CONTAR DISPOSITIVOS   **USADO
        this.router.get('/contar/biometricos', TokenValidation, RELOJES_CONTROLADOR.ContarDispositivos);
        // METODO PARA LEER Y CARGAR DATOS DE PLANTILLA    **USADO
        this.router.post('/upload/revision', [TokenValidation, upload.single('uploads')], RELOJES_CONTROLADOR.VerificarPlantilla);
        // METODO PARA CARGAR DATOS DE PLANTILLA   **USADO
        this.router.post('/plantillaExcel/', TokenValidation, RELOJES_CONTROLADOR.CargaPlantillaRelojes);

        /** ***************************************************************************************** **
         ** **                                  ZONAS HORARIAS                                     ** **
         ** ***************************************************************************************** **/
        // METODO PARA BUSCAR ZONAS HORARIAS   **USADO
        this.router.get('/zonas_horarias/buscar', TokenValidation, RELOJES_CONTROLADOR.BuscarZonasHorarias);

    }
}

const RELOJES_RUTA = new RelojesRuta();

export default RELOJES_RUTA.router;