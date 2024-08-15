"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const empresasRutas_1 = __importDefault(require("./rutas/empresas/empresasRutas"));
const parametrizacionRutas_1 = __importDefault(require("./rutas/parametrizacion/parametrizacionRutas"));
const empleadoRutas_1 = __importDefault(require("./rutas/empleado/empleadoRutas"));
const funcionesRutas_1 = __importDefault(require("./rutas/funciones/funcionesRutas"));
const licenciaRutas_1 = __importDefault(require("./rutas/licencia/licenciaRutas"));
const http_1 = require("http");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
var io;
class Servidor {
    constructor() {
        this.app = (0, express_1.default)();
        this.configuracion();
        this.rutas();
        this.server = (0, http_1.createServer)(this.app);
        this.app.use((0, cors_1.default)());
        //Inicializacion del socket vacio
        io = require('socket.io')(this.server, {
            cors: {
                origin: '*',
                methods: ['GET']
            }
        });
    }
    configuracion() {
        this.app.set('puerto', process.env.PORT || 3005);
        this.app.use((0, cors_1.default)());
        this.app.use(express_1.default.json({ limit: '50mb' }));
        this.app.use(express_1.default.urlencoded({ limit: '50mb', extended: true }));
        this.app.set('trust proxy', true);
        this.app.get('/', (req, res) => {
            res.status(200).json({
                status: 'success'
            });
        });
    }
    rutas() {
        this.app.use('/direccionamiento/fulltime', empresasRutas_1.default); //RUTA PARA EMPRESA
        this.app.use('/direccionamiento/parametrizacion', parametrizacionRutas_1.default); //RUTA DATOS INICIALES
        this.app.use('/direccionamiento/empleado', empleadoRutas_1.default); //RUTA DATOS INICIALES
        this.app.use('/direccionamiento/licencia', licenciaRutas_1.default); //RUTA PARA OBTENER LICENCIA
        this.app.use('/direccionamiento', funcionesRutas_1.default);
    }
    start() {
        this.server.listen(this.app.get('puerto'), () => {
            console.log('Servidor en el puerto', this.app.get('puerto'));
        });
        this.app.use((req, res, next) => {
            res.header('Access-Control-Allow-Origin', '*');
            next();
        });
        //Escucha de socket
        io.on('connection', (socket) => {
            console.log('Connected socket client on port %s.', this.app.get('puerto'));
        });
    }
}
const SERVIDOR = new Servidor();
SERVIDOR.start();
