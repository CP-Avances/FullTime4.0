import { Request, Response, Router, NextFunction } from 'express';
import fs from 'fs';

class LicenciasControlador {

    public async GuardarBloqueLicencias(req: Request, res: Response) {
        // console.log(req.body);
        try {
            fs.readFile('licencia.conf.json','utf8', function (err, data) {

                // console.log('* Mensaje de error: ', err);
                // console.log('* Mensaje de data: ', data);
                if (err) {
                    fs.appendFile('licencia.conf.json', JSON.stringify([]) , function (err) {
                        console.log('entro al appendFile',err?.message);
                        if (err) throw err;
                        // console.log('Archivo de LICENCIAS creado!');
                        fs.readFile('licencia.conf.json','utf8', function (err1, data2) {
                            let block_licencias_inicio = JSON.parse(data2);
                            block_licencias_inicio.push(req.body)
                            fs.writeFile('licencia.conf.json', JSON.stringify(block_licencias_inicio), function (err) {
                                if (err) throw err;
                                // console.log('Archivo licencias actualizado data2!');
                            })

                            return res.status(200).json({message: 'licencia almacenada en Api'})
                        })
                    })
                }

                if (data) {
                    
                    let block_licencias = JSON.parse(data);
                    block_licencias.push(req.body)

                    fs.writeFile('licencia.conf.json', JSON.stringify(block_licencias), function (err) {
                        if (err) throw err;
                        // console.log('Archivo licencias actualizado data!');
                        return res.status(200).json({message: 'licencia almacenada en Api'})
                    })
                } 

            });
        } catch (error) {
            return res.status(404).json({message: error.toString() })
        }
    }
}

const validarConexion = (req: Request, res: Response, next: NextFunction) => {
    // console.log(req.headers);
    if (!req.headers.authorization) return res.status(401).jsonp({message: "No puede solicitar, permiso denegado"})
    const {user, password} = JSON.parse(req.headers.authorization);

    if (user === process.env.USER_APP_ADMIN && password === process.env.PASSWORD_APP_ADMIN) {
        next();
    } else {
        return res.status(401).jsonp({message: "No puede solicitar, permiso denegado"})
    }
        
}

const LICENCIAS = new LicenciasControlador();

class LicenciaRutas {
    public router: Router = Router();

    constructor() {
        this.configuracion();
    }

    configuracion(): void {
        this.router.post('/createFile',validarConexion, LICENCIAS.GuardarBloqueLicencias);
    }
}

const LICENCIAS_RUTAS = new LicenciaRutas();

export default LICENCIAS_RUTAS.router;