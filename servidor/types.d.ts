declare namespace Express {
    export interface Request {
        userId: number,
        userIdEmpleado: number,
        id_empresa: number,
        userRol: number,
        userIdCargo: number,
        userCodigo: number | string,
        acciones_timbres: boolean,
        modulos: any,
    }
}