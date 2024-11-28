import { Request, Response } from 'express';
import pool from '../../database';

import { Readable } from 'stream';

class AuditoriaControlador {


    public async BuscarDatosAuditoriaporTablasEmpaquetados(req: Request, res: Response): Promise<void> {
        const { tabla, desde, hasta, action } = req.body;

        // Convertir las cadenas de acciones en arrays
        const actionsArray = action.split(',').map((a: any) => a.trim().replace(/'/g, ''));

        // Construir cláusula dinámica IN para acciones
        const actionClause = `action IN (${actionsArray.map((_: any, i: any) => `$${i + 2}`).join(', ')})`;

        // Asegúrate de que las fechas sean correctamente formateadas
        const fechaDesde = new Date(desde).toISOString();
        const fechaHasta = new Date(hasta + 'T23:59:59').toISOString();

        const params = [tabla, ...actionsArray, fechaDesde, fechaHasta];

        const query = `
                SELECT 
                    a.plataforma, a.table_name, a.user_name,CAST(a.fecha_hora AS VARCHAR) , a.action, a.original_data, a.new_data, a.ip_address, a.observacion               
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

        // console.log('Query:', query);
        //console.log('Params:', params);


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

                dataStream.push(null); // Fin del stream

                res.set('Content-Type', 'application/json');
                dataStream.pipe(res);
            } else {
                res.status(404).json({ message: 'No se encuentran registros', status: '404' });
            }
        } catch (error) {
            res.status(500).json({ message: 'Error en el servidor', error });
        }

    }

    public async BuscarDatosAuditoriaporTablas(req: Request, res: Response): Promise<Response> {
        try {
            const { tabla, desde, hasta, action } = req.body;

            // Convertir las cadenas de acciones en arrays
            const actionsArray = action.split(',').map((a: any) => a.trim().replace(/'/g, ''));

            // Construir cláusula dinámica IN para acciones
            const actionClause = `action IN (${actionsArray.map((_: any, i: any) => `$${i + 2}`).join(', ')})`;

            // Asegúrate de que las fechas sean correctamente formateadas
            const fechaDesde = new Date(desde).toISOString();
            const fechaHasta = new Date(hasta + 'T23:59:59').toISOString();

            const params = [tabla, ...actionsArray, fechaDesde, fechaHasta];

            const query = `
                SELECT 
                    *
                FROM 
                    audit.auditoria 
                WHERE 
                    table_name = $1
                AND 
                    ${actionClause} 
                AND 
                    fecha_hora BETWEEN $${params.length - 1} AND $${params.length}
                ORDER BY 
                    fecha_hora DESC;
            `;

            console.log('Query:', query);
            console.log('Params:', params);

            const DATOS = await pool.query(query, params);

            if (DATOS.rowCount != 0) {
                console.log("contador tab", DATOS.rowCount)
                return res.jsonp(DATOS.rows);
            } else {
                return res.status(404).jsonp({ message: 'No se encuentran registros', status: '404' });
            }
        } catch (error) {
            console.error('Error en BuscarDatosAuditoriaporTablas:', error);
            return res.status(500).jsonp({ message: 'Error interno del servidor', error: error.message });
        }
    }

    public async BuscarDatosAuditoriaoriginal(req: Request, res: Response): Promise<Response> {
        const { tabla, desde, hasta, action } = req.body
        // Convertir las cadenas de tablas y acciones en arrays
        const tablasArray = tabla.split(',').map((t: any) => t.trim().replace(/'/g, ''));
        const actionsArray = action.split(',').map((a: any) => a.trim().replace(/'/g, ''));
        // Construir cláusulas dinámicas IN
        const tableNameClause = `table_name IN (${tablasArray.map((_: any, i: any) => `$${i + 1}`).join(', ')})`;
        const actionClause = `action IN (${actionsArray.map((_: any, i: any) => `$${tablasArray.length + i + 1}`).join(', ')})`;
        const params = [...tablasArray, ...actionsArray, desde, `${hasta} 23:59:59`];
        const query = `
           SELECT 
               *
           FROM 
               audit.auditoria 
           WHERE 
               ${tableNameClause} 
           AND 
               ${actionClause} 
           AND 
               fecha_hora BETWEEN $${params.length - 1} AND $${params.length}
           ORDER BY 
               fecha_hora DESC;
       `;

        const DATOS = await pool.query(query, params);
        if (DATOS.rowCount != 0) {
            return res.jsonp(DATOS.rows);
        } else {
            return res.status(404).jsonp({ message: 'No se encuentran registros', status: '404' });
        }
    }


    public async BuscarDatosAuditoria(req: Request, res: Response): Promise<void> {
        const { tabla, desde, hasta, action } = req.body;
        const tablasArray = tabla.split(',').map((t: any) => t.trim().replace(/'/g, ''));
        const actionsArray = action.split(',').map((a: any) => a.trim().replace(/'/g, ''));
        const tableNameClause = `table_name IN (${tablasArray.map((_: any, i: any) => `$${i + 1}`).join(', ')})`;
        const actionClause = `action IN (${actionsArray.map((_: any, i: any) => `$${tablasArray.length + i + 1}`).join(', ')})`;
        const params = [...tablasArray, ...actionsArray, desde, `${hasta} 23:59:59`];
        const query = `
        SELECT 
            *
        FROM 
            audit.auditoria 
        WHERE 
            ${tableNameClause} 
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

                dataStream.push(null); // Fin del stream

                res.set('Content-Type', 'application/json');
                dataStream.pipe(res);
            } else {
                res.status(404).json({ message: 'No se encuentran registros', status: '404' });
            }
        } catch (error) {
            res.status(500).json({ message: 'Error en el servidor', error });
        }
    }


    // INSERTAR REGISTRO DE AUDITORIA
    public async InsertarAuditoria(data: Auditoria) {
        try {
            const { tabla, usuario, accion, datosOriginales, datosNuevos, ip, observacion } = data;
            let plataforma = "APLICACION WEB"
            await pool.query(
                `
                INSERT INTO audit.auditoria (plataforma, table_name, user_name, fecha_hora,
                    action, original_data, new_data, ip_address, observacion) 
                VALUES ($1, $2, $3, now(), $4, $5, $6, $7, $8)
                `
                ,
                [plataforma, tabla, usuario, accion, datosOriginales, datosNuevos, ip, observacion]);
        } catch (error) {
            throw error;
        }
    }

    public InsertarAuditoriaPorLotes = async (data: Auditoria[], user_name: string, ip: string): Promise<void> => {
        const batchSize = 1000; // Tamaño del lote, puedes ajustarlo según tus necesidades
        const totalResults = [];

        for (let i = 0; i < data.length; i += batchSize) {
            const batch = data.slice(i, i + batchSize);
            const valores: any[] = [];
            const placeholders: string[] = [];

            for (let j = 0; j < batch.length; j++) {
                const auditoria = batch[j];
                const index = j * 9; // 9 es el número de campos a insertar

                valores.push(
                    "APLICACION WEB", // Asumiendo que la plataforma es siempre "APLICACION WEB"
                    auditoria.tabla,
                    user_name,
                    new Date(),                    
                    auditoria.accion,
                    auditoria.datosOriginales,
                    auditoria.datosNuevos,
                    ip,
                    auditoria.observacion
                );

                // Crear los placeholders para la consulta de inserción masiva
                placeholders.push(
                    `($${index + 1}, $${index + 2}, $${index + 3}, $${index + 4}, $${index + 5}, $${index + 6}, $${index + 7}, $${index + 8}, $${index + 9})`
                );
            }

            const query = `
                INSERT INTO audit.auditoria (
                    plataforma, table_name, user_name, fecha_hora,
                    action, original_data, new_data, ip_address, observacion
                ) VALUES ${placeholders.join(', ')}
            `;

            try {
                // INICIAR TRANSACCIÓN
                await pool.query('BEGIN');

                // Ejecutar la consulta de inserción masiva
                await pool.query(query, valores);

                // FINALIZAR TRANSACCIÓN
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
    observacion: string | null
}

export const AUDITORIA_CONTROLADOR = new AuditoriaControlador();

export default AUDITORIA_CONTROLADOR;