import { NextFunction, Request, Response } from 'express';
import { Modulos } from '../class/Licencia';
import jwt from 'jsonwebtoken';
import pool from '../database';

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
    _acc_tim: boolean // false SIN ACCIONES || true CON ACCIONES
}

export const TokenValidation = async (req: Request, res: Response, next: NextFunction) => {

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

        const EMPRESA = await pool.query(
            `
            SELECT public_key, id AS id_empresa FROM e_empresa
            `
        );

        const { public_key } = EMPRESA.rows[0];

        const licenciaData = await fetch(`${(process.env.DIRECCIONAMIENTO as string)}/licencia`,
            {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ public_key: public_key })
            }
        );

        if (!licenciaData.ok) {
            return res.status(401).send('No existe registro de licencias.');
        }

        const dataLic = await licenciaData.json();

        const fec_activacion = new Date(dataLic[0].fecha_activacion);
        const fec_desactivacion = new Date(dataLic[0].fecha_desactivacion);
        const hoy = new Date();

        if (hoy <= fec_desactivacion && hoy >= fec_activacion) {
            req.userId = payload._id;
            req.userIdEmpleado = payload._id_empleado;
            req.id_empresa = payload._empresa,
                req.userRol = payload.rol;
            req.userIdCargo = payload.cargo;
            req.userCodigo = payload.codigo;
            req.acciones_timbres = payload._acc_tim;
            next();
        } else {
            return res.status(401).send('Ups! La licencia a expirado.');
        }

    } catch (error) {
        return res.status(401).send(error.message);
    }

}