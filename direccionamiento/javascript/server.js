"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require('dotenv').config();
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
// rutas importadas
const indexRutas_1 = __importDefault(require("./rutas/indexRutas"));
const timbresRutas_1 = __importDefault(require("./rutas/timbres/timbresRutas"));
const http_1 = require("http");
var io;
class Servidor {
    constructor() {
        this.app = (0, express_1.default)();
        this.configuracion();
        this.rutas();
        // this.server = require("http").createServer();
        this.server = (0, http_1.createServer)(this.app);
        this.app.use((0, cors_1.default)());
        io = require('socket.io')(this.server, {
            cors: {
                origin: '*',
                methods: ['GET', 'POST'],
            }
        });
    }
    configuracion() {
        this.app.set('puerto', process.env.PORT || 3005);
        this.app.use((0, morgan_1.default)('dev'));
        this.app.use((0, cors_1.default)());
        this.app.use(express_1.default.json({ limit: '50mb' }));
        this.app.use(express_1.default.urlencoded({ limit: '50mb', extended: true }));
        this.app.use(express_1.default.raw({ type: 'image/*', limit: '2Mb' }));
        this.app.set('trust proxy', true);
        this.app.get('/', (req, res) => {
            res.status(200).json({
                status: 'success'
            });
        });
    }
    rutas() {
        this.app.use('/', indexRutas_1.default);
        // Timbres
        this.app.use('/timbres', timbresRutas_1.default);
    }
    start() {
        this.server.listen(this.app.get('puerto'), () => {
            console.log('Servidor en el puerto', this.app.get('puerto'));
        });
        this.app.use((req, res, next) => {
            res.header('Access-Control-Allow-Origin', '*');
            next();
        });
        io.on('connection', (socket) => {
            console.log('Connected client on port %s.', this.app.get('puerto'));
        });
    }
}
const SERVIDOR = new Servidor();
SERVIDOR.start();
//import { NotificacionSinTimbres } from './libs/SinTimbres'
//NotificacionSinTimbres();
//generarTimbres('35', '2023-11-01', '2023-11-02');
