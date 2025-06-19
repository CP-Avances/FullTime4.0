import { Request, Response } from 'express';
import { Readable } from 'stream';
import pool from '../../database';

class AuditoriaControlador {

    // METODO PARA CONSULTAR DATOS EMPAQUETADOS - AUDITORIA     **USADO
    public async BuscarDatosAuditoriaporTablasEmpaquetados(req: Request, res: Response): Promise<void> {
        const { tabla, desde, hasta, action } = req.body;

        // CONVERTIR LAS CADENAS DE ACCIONES EN ARRAYS
        const actionsArray = action.split(',').map((a: any) => a.trim().replace(/'/g, ''));

        // CONSTRUIR CLAUSULA DINAMICA IN PARA ACCIONES
        const actionClause = `action IN (${actionsArray.map((_: any, i: any) => `$${i + 2}`).join(', ')})`;

        // ASEGURATE DE QUE LAS FECHAS SEAN CORRECTAMENTE FORMATEADAS
        const fechaDesde = new Date(desde).toISOString();
        const fechaHasta = new Date(hasta + 'T23:59:59').toISOString();

        const params = [tabla, ...actionsArray, fechaDesde, fechaHasta];

        const query = `
                SELECT 
                    a.plataforma, a.table_name, a.user_name,CAST(a.fecha_hora AS VARCHAR) , a.action, a.original_data, a.new_data, a.ip_address, a.observacion,  a.ip_address_local               
                FROM 
                    audit.auditoria AS a
                WHERE 
                    table_name = $1
                AND 
                    ${actionClause} 
                AND 
                    fecha_hora BETWEEN $${params.length - 1} AND $${params.length}
                ORDER BY 
                    fecha_hora DESC;
            `;

        try {
            const result = await pool.query(query, params);

            if (result.rowCount != 0) {
                const dataStream = new Readable({
                    objectMode: true,
                    read() { }
                });

                result.rows.forEach(row => {
                    dataStream.push(JSON.stringify(row));
                });

                dataStream.push(null); // FIN DEL STREAM

                res.set('Content-Type', 'application/json');
                dataStream.pipe(res);
            } else {
                res.status(404).json({ message: 'No se encuentran registros', status: '404' });
            }
        } catch (error) {
            res.status(500).json({ message: 'Error en el servidor', error });
        }

    }

    // METODO DE CONSULTA DE AUDITORIA DE INICIOS DE SESION    **USADO
    public async BuscarDatosAuditoriaAcceso(req: Request, res: Response): Promise<any> {
        const { desde, hasta } = req.body;
        const AUDITORIA = await pool.query(
            `
            SELECT 
                a.plataforma, a.user_name, CAST(a.fecha AS VARCHAR), a.hora, a.acceso, a.ip_addres, 
                a.observaciones, a.ip_addres_local               
            FROM 
                audit.acceso_sistema AS a
            WHERE 
                a.fecha BETWEEN $1 AND $2
            ORDER BY 
                a.fecha DESC;
            `
            , [desde, hasta]
        );

        if (AUDITORIA.rowCount != 0) {
            return res.jsonp({ message: 'ok', datos: AUDITORIA.rows })
        }
        else {
            return res.status(404).jsonp({ message: 'No se han encontrado registro.' })
        }
    }

    // INSERTAR REGISTRO DE AUDITORIA    **USADO
    public async InsertarAuditoria(data: Auditoria) {
        try {
            const { tabla, usuario, accion, datosOriginales, datosNuevos, ip, observacion, ip_local } = data;
            let plataforma = "APLICACION WEB"
            await pool.query(
                `
                INSERT INTO audit.auditoria (plataforma, table_name, user_name, fecha_hora,
                    action, original_data, new_data, ip_address, observacion, ip_address_local) 
                VALUES ($1, $2, $3, now(), $4, $5, $6, $7, $8, $9)
                `
                ,
                [plataforma, tabla, usuario, accion, datosOriginales, datosNuevos, ip, observacion, ip_local]);
        } catch (error) {
            console.log('ver error ', error)
            throw error;
        }
    }

    // INSERTAR REGISTRO DE AUDITORIA POR LOTES DE DATOS   **USADO
    public InsertarAuditoriaPorLotes = async (data: Auditoria[], user_name: string, ip: string, ip_local: string): Promise<void> => {
        const batchSize = 1000; // TAMAÑO DEL LOTE, PUEDES AJUSTARLO SEGUN TUS NECESIDADES
        const totalResults = [];

        for (let i = 0; i < data.length; i += batchSize) {
            const batch = data.slice(i, i + batchSize);
            const valores: any[] = [];
            const placeholders: string[] = [];

            for (let j = 0; j < batch.length; j++) {
                const auditoria = batch[j];
                const index = j * 10; // 9 ES EL NUMERO DE CAMPOS A INSERTAR

                valores.push(
                    "APLICACION WEB", // ASUMIENDO QUE LA PLATAFORMA ES SIEMPRE "APLICACION WEB"
                    auditoria.tabla,
                    user_name,
                    new Date(),
                    auditoria.accion,
                    auditoria.datosOriginales,
                    auditoria.datosNuevos,
                    ip,
                    auditoria.observacion,
                    ip_local
                );

                // CREAR LOS PLACEHOLDERS PARA LA CONSULTA DE INSERCION MASIVA
                placeholders.push(
                    `($${index + 1}, $${index + 2}, $${index + 3}, $${index + 4}, $${index + 5}, $${index + 6}, $${index + 7}, $${index + 8}, $${index + 9}, $${index + 10})`
                );
            }

            const query =
                `
                INSERT INTO audit.auditoria (
                    plataforma, table_name, user_name, fecha_hora,
                    action, original_data, new_data, ip_address, observacion, ip_address_local
                ) VALUES ${placeholders.join(', ')}
                `;

            try {
                // INICIAR TRANSACCIÓN
                await pool.query('BEGIN');

                // Ejecutar la consulta de inserción masiva
                await pool.query(query, valores);

                // FINALIZAR TRANSACCION
                await pool.query('COMMIT');

            } catch (error) {
                // REVERTIR TRANSACCIÓN
                console.error("Detalles del error:", {
                    message: error.message,
                    stack: error.stack,
                    code: error.code,
                    detail: error.detail
                });
                await pool.query('ROLLBACK');

                throw new Error('Error al insertar auditoría por lotes: ' + error.message);
            }
        }
    };

}

interface Auditoria {
    tabla: string,
    usuario: string,
    accion: string,
    datosOriginales: string,
    datosNuevos: string,
    ip: string,
    ip_local: string,
    observacion: string | null
}

export const AUDITORIA_CONTROLADOR = new AuditoriaControlador();

export default AUDITORIA_CONTROLADOR;