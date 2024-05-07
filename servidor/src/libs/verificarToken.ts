import { NextFunction, Request, Response } from 'express';
import { Licencias, Modulos } from '../class/Licencia';
import jwt from 'jsonwebtoken';
import fs from 'fs';

interface IPayload {
    _id: number,
    _id_empleado: number,
    rol: number,
    _dep: number,
    _suc: number,
    _empresa: number,
    cargo: number,
    estado: boolean,
    codigo: number | string,
    _licencia: string,
    _web_access: boolean,
    modulos: Modulos,
    _acc_tim: boolean //false sin acciones || true con acciones
}

export const TokenValidation = (req: Request, res: Response, next: NextFunction) => {
    // VERIFICA SI EN LA PETICION EXISTE LA CABECERA AUTORIZACION 
    if (!req.headers.authorization) {
        return res.status(401).send('No puede solicitar, permiso denegado.');
    }
    // SI EXISTE PASA A LA SIGUIENTE VALIDACION
    // VERIFICACION SI EL TOKEN ESTA VACIO
    const token = req.headers.authorization.split(' ')[1];
    if (token === 'null') {
        return res.status(401).send('No contienen token de autenticación.');
    }

    try {
        // SI EL TOKEN NO ESTA VACIO
        // SE EXTRAE LOS DATOS DEL TOKEN 
        const payload = jwt.verify(token, process.env.TOKEN_SECRET || 'llaveSecreta') as IPayload;
        // CUANDO SE EXTRAE LOS DATOS SE GUARDA EN UNA PROPIEDAD REQ.USERID PARA Q LAS DEMAS FUNCIONES PUEDAN UTILIZAR ESE ID 
        if (!payload._web_access) return res.status(401).send('No tiene acceso a los recursos de la aplicacion.');

        fs.readFile('licencia.conf.json', 'utf8', function (err, data) {
            const FileLicencias = JSON.parse(data);
            if (err) return res.status(401).send('No existe registro de licencias.');

            const ok_licencias = FileLicencias.filter((o: Licencias) => {
                return o.public_key === payload._licencia
            }).map((o: Licencias) => {
                o.fec_activacion = new Date(o.fec_activacion),
                    o.fec_desactivacion = new Date(o.fec_desactivacion)
                return o
            })
            if (ok_licencias.lenght === 0) return res.status(401).send('La licencia no existe.');

            const hoy = new Date();

            const { fec_activacion, fec_desactivacion } = ok_licencias[0];
            if (hoy <= fec_desactivacion && hoy >= fec_activacion) {
                req.userId = payload._id;
                req.userIdEmpleado = payload._id_empleado;
                req.id_empresa = payload._empresa,
                    req.userRol = payload.rol;
                req.userIdCargo = payload.cargo;
                req.userCodigo = payload.codigo;
                req.acciones_timbres = payload._acc_tim;
                req.modulos = payload.modulos;
                next();
            } else {
                return res.status(401).send('Ups!!! La licencia a expirado.');
            }
        })
    } catch (error) {
        return res.status(401).send(error.message);
    }
}