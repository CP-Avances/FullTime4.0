require('dotenv').config();
import express, { Application } from 'express';
import cors from 'cors';
import morgan from 'morgan';

// rutas importadas
import indexRutas from './rutas/indexRutas';
import TIMBRES_RUTAS from './rutas/timbres/timbresRutas';

import { createServer, Server } from 'http';

var io: any;

class Servidor {

    public app: Application;
    public server: Server;

    constructor() {
       this.app = express();
        this.configuracion();
        this.rutas();
       // this.server = require("http").createServer();
        this.server = createServer(this.app);
        this.app.use(cors());
        io = require('socket.io')(this.server, {
            cors: {
                origin: '*',
                methods: ['GET', 'POST'],
            }
        });

    }
    
    configuracion(): void {
        this.app.set('puerto', process.env.PORT || 3005);
        this.app.use(morgan('dev'));
        this.app.use(cors());
        this.app.use(express.json({ limit: '50mb' }));
        this.app.use(express.urlencoded({ limit: '50mb', extended: true }));
        this.app.use(express.raw({ type: 'image/*', limit: '2Mb' }));
        this.app.set('trust proxy', true);
        this.app.get('/', (req, res) => {
            res.status(200).json({
                status: 'success'
            });
        });
    }

    rutas(): void {
        this.app.use('/', indexRutas);

        // Timbres
        this.app.use('/timbres', TIMBRES_RUTAS);
    }

    start(): void {

        this.server.listen(this.app.get('puerto'), () => {
            console.log('Servidor en el puerto', this.app.get('puerto'));
        });

        this.app.use((req, res, next) => {
            res.header('Access-Control-Allow-Origin', '*');
            next();
        })
        io.on('connection', (socket: any) => {
            console.log('Connected client on port %s.', this.app.get('puerto'));
        });

    }
    
}

const SERVIDOR = new Servidor();
SERVIDOR.start();

//import { NotificacionSinTimbres } from './libs/SinTimbres'

//NotificacionSinTimbres();

//generarTimbres('35', '2023-11-01', '2023-11-02');