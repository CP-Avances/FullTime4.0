import express, { Application } from 'express';
import cors from 'cors';

import EMPRESAS_RUTAS from './rutas/empresas/empresasRutas';
import PARAMETRIZACION_RUTAS from './rutas/parametrizacion/parametrizacionRutas';
import EMPLEADO_RUTAS from './rutas/empleado/empleadoRutas';
import FUNCIONES_RUTAS from './rutas/funciones/funcionesRutas';
import LICENCIA_RUTAS from './rutas/licencia/licenciaRutas';

import { createServer, Server } from 'http';
import dotenv from 'dotenv';
dotenv.config();

var io: any;

class Servidor{
    public app: Application;
    public server: Server;

    constructor(){
        this.app = express();
        this.configuracion();
        this.rutas();

        this.server = createServer(this.app);
        this.app.use(cors());
        //Inicializacion del socket vacio
        io = require('socket.io')(
            this.server,
            {
                cors: 
                {
                    origin: '*',
                    methods: ['GET']
                }
            }
        );
    }

    configuracion(): void {
        this.app.set('puerto', process.env.PORT || 3005);
        this.app.use(cors());
        
        this.app.use(express.json({ limit: '50mb' }));
        this.app.use(express.urlencoded({ limit: '50mb', extended: true }));
        this.app.set('trust proxy', true);
        this.app.get('/', (req, res) => {
            res.status(200).json({
                status: 'success'
            });
        });
    }

    rutas(): void {
        this.app.use('/fulltime', EMPRESAS_RUTAS);//RUTA PARA EMPRESA
        this.app.use('/parametrizacion', PARAMETRIZACION_RUTAS);//RUTA DATOS INICIALES
        this.app.use('/empleado', EMPLEADO_RUTAS);//RUTA DATOS INICIALES
        this.app.use('/licencia', LICENCIA_RUTAS);//RUTA PARA OBTENER LICENCIA
        this.app.use('/', FUNCIONES_RUTAS);
    }

    start(): void {
        this.server.listen(this.app.get('puerto'), () => {
            console.log('Servidor en el puerto', this.app.get('puerto'));
        });
        
        this.app.use((req, res, next) => {
            res.header('Access-Control-Allow-Origin', '*');
            next();
        });
        //Escucha de socket
        io.on('connection', (socket: any) => 
            {
                console.log('Connected socket client on port %s.', this.app.get('puerto'));
            }
        );
    }
}

const SERVIDOR = new Servidor();
SERVIDOR.start();