import { Request, Response } from 'express';
import AUDITORIA_CONTROLADOR from '../../auditoria/auditoriaControlador';
import pool from '../../../database';
import excel from 'xlsx';
import fs from 'fs';

class DetalleCatalogoHorarioControlador {

    // METODO PARA BUSCAR DETALLE DE UN HORARIO   --**VERIFICADO
    public async ListarUnDetalleHorario(req: Request, res: Response): Promise<any> {
        const { id_horario } = req.params;
        const HORARIO = await pool.query(
            `
            SELECT dh.*, cg.min_almuerzo
            FROM deta_horarios AS dh, cg_horarios AS cg
            WHERE dh.id_horario = cg.id AND dh.id_horario = $1
            ORDER BY orden ASC
            `
            , [id_horario])
            .then((result: any) => {
                if (result.rowCount === 0) return [];

                return result.rows.map((o: any) => {
                    switch (o.tipo_accion) {
                        case 'E':
                            o.tipo_accion_show = 'Entrada';
                            o.tipo_accion = 'E';
                            break;
                        case 'I/A':
                            o.tipo_accion_show = 'Inicio alimentación';
                            o.tipo_accion = 'I/A';
                            break;
                        case 'F/A':
                            o.tipo_accion_show = 'Fin alimentación';
                            o.tipo_accion = 'F/A';
                            break;
                        case 'S':
                            o.tipo_accion_show = 'Salida';
                            o.tipo_accion = 'S';
                            break;
                        default:
                            o.tipo_accion_show = 'Desconocido';
                            o.tipo_accion = 'D';
                            break;
                    }
                    return o;
                })
            });

        if (HORARIO.length > 0) {
            return res.jsonp(HORARIO)
        }
        else {
            return res.status(404).jsonp({ text: 'No se encuentran registros.' });
        }
    }

    // METODO PARA ELIMINAR REGISTRO
    public async EliminarRegistros(req: Request, res: Response): Promise<Response> {
        try {
            const id = req.params.id;

            const { user_name, ip } = req.body;

            // INICIAR TRANSACCION
            await pool.query('BEGIN');

            // OBTENER DATOSORIGINALES
            const consulta = await pool.query('SELECT * FROM deta_horarios WHERE id = $1', [id]);
            const [datosOriginales] = consulta.rows;

            if (!datosOriginales) {
                await AUDITORIA_CONTROLADOR.InsertarAuditoria({
                    tabla: 'deta_horarios',
                    usuario: user_name,
                    accion: 'D',
                    datosOriginales: '',
                    datosNuevos: '',
                    ip,
                    observacion: `Error al eliminar registro con id ${id}`
                });

                // FINALIZAR TRANSACCION
                await pool.query('COMMIT');
                return res.status(404).jsonp({ message: 'No se encuentra el registro.' });
            }

            await pool.query(
                `
                DELETE FROM deta_horarios WHERE id = $1
                `
                , [id]);

            // AUDITORIA
            await AUDITORIA_CONTROLADOR.InsertarAuditoria({
                tabla: 'deta_horarios',
                usuario: user_name,
                accion: 'D',
                datosOriginales: JSON.stringify(datosOriginales),
                datosNuevos: '',
                ip,
                observacion: ''
            });

            // FINALIZAR TRANSACCION
            await pool.query('COMMIT');
            return res.jsonp({ message: 'Registro eliminado.' });
        } catch (error) {
            // REVERTIR TRANSACCION
            await pool.query('ROLLBACK');
            return res.status(500).jsonp({ message: 'Error al eliminar registro.' });
        }
    }

    // METODO PARA REGISTRAR DETALLES
    public async CrearDetalleHorarios(req: Request, res: Response): Promise<void> {
        try {
            const { orden, hora, minu_espera, id_horario, tipo_accion, segundo_dia, tercer_dia, min_antes, min_despues, user_name, ip } = req.body;
            
            // INICIAR TRANSACCION
            await pool.query('BEGIN');

            await pool.query(
                `
                INSERT INTO deta_horarios (orden, hora, minu_espera, id_horario, tipo_accion, segundo_dia, tercer_dia, min_antes,
                    min_despues) 
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                `
                , [orden, hora, minu_espera, id_horario, tipo_accion, segundo_dia, tercer_dia, min_antes, min_despues]);
            
            // AUDITORIA
            await AUDITORIA_CONTROLADOR.InsertarAuditoria({
                tabla: 'deta_horarios',
                usuario: user_name,
                accion: 'I',
                datosOriginales: '',
                datosNuevos: `{orden: ${orden}, hora: ${hora}, minu_espera: ${minu_espera}, id_horario: ${id_horario}, tipo_accion: ${tipo_accion}, segundo_dia: ${segundo_dia}, tercer_dia: ${tercer_dia}, min_antes: ${min_antes}, min_despues: ${min_despues}}`,
                ip,
                observacion: ''
            });

            // FINALIZAR TRANSACCION
            await pool.query('COMMIT');
            res.jsonp({ message: 'Registro guardado.' });
        } catch (error) {
            // REVERTIR TRANSACCION
            await pool.query('ROLLBACK');
            res.status(500).jsonp({ message: 'Error al guardar registro.' });
        }
    }

    // METODO PARA ACTUALIZAR DETALLE DE HORARIO
    public async ActualizarDetalleHorarios(req: Request, res: Response): Promise<Response> {
        try {
            const { orden, hora, minu_espera, id_horario, tipo_accion, segundo_dia, tercer_dia, min_antes, min_despues,
                id, user_name, ip } = req.body;

            // INICIAR TRANSACCION
            await pool.query('BEGIN');

            // OBTENER DATOSORIGINALES
            const consulta = await pool.query('SELECT * FROM deta_horarios WHERE id = $1', [id]);
            const [datosOriginales] = consulta.rows;

            if (!datosOriginales) {
                await AUDITORIA_CONTROLADOR.InsertarAuditoria({
                    tabla: 'deta_horarios',
                    usuario: user_name,
                    accion: 'U',
                    datosOriginales: '',
                    datosNuevos: '',
                    ip,
                    observacion: `Error al actualizar registro con id ${id}`
                });

                // FINALIZAR TRANSACCION
                await pool.query('COMMIT');
                return res.status(404).jsonp({ message: 'No se encuentra el registro.' });
            }

            await pool.query(
                `
                    UPDATE deta_horarios SET orden = $1, hora = $2, minu_espera = $3, id_horario = $4,
                    tipo_accion = $5, segundo_dia = $6, tercer_dia = $7, min_antes = $8, min_despues= $9 WHERE id = $10
                    `
                , [orden, hora, minu_espera, id_horario, tipo_accion, segundo_dia, tercer_dia, min_antes, min_despues, id]);
            
            // AUDITORIA
            await AUDITORIA_CONTROLADOR.InsertarAuditoria({
                tabla: 'deta_horarios',
                usuario: user_name,
                accion: 'U',
                datosOriginales: JSON.stringify(datosOriginales),
                datosNuevos: `{orden: ${orden}, hora: ${hora}, minu_espera: ${minu_espera}, id_horario: ${id_horario}, tipo_accion: ${tipo_accion}, segundo_dia: ${segundo_dia}, tercer_dia: ${tercer_dia}, min_antes: ${min_antes}, min_despues: ${min_despues}}`,
                ip,
                observacion: ''
            });

            // FINALIZAR TRANSACCION
            await pool.query('COMMIT');
            
            return res.jsonp({ message: 'Registro actualizado.' });
        } catch (error) {
            // REVERTIR TRANSACCION
            await pool.query('ROLLBACK');
            return res.status(500).jsonp({ message: 'Error al actualizar registro.' });
        }
    }

    public async ListarDetalleHorarios(req: Request, res: Response) {
        const HORARIO = await pool.query('SELECT * FROM deta_horarios');
        if (HORARIO.rowCount > 0) {
            return res.jsonp(HORARIO.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'No se encuentran registros' });
        }
    }


    /** Verificar que el nombre del horario exista dentro del sistema */
    public async VerificarDatosDetalles(req: Request, res: Response): Promise<void> {
        let list: any = req.files;
        let cadena = list.uploads[0].path;
        let filename = cadena.split("\\")[1];
        var filePath = `./plantillas/${filename}`

        const workbook = excel.readFile(filePath);
        const sheet_name_list = workbook.SheetNames; // Array de hojas de calculo
        const plantillaD = excel.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);
        var contarHorario = 0;
        var contarDatos = 0;
        var contador = 1;
        /** Detalle de Horarios */
        plantillaD.forEach(async (data: any) => {
            const { nombre_horario, orden, hora, tipo_accion, minutos_espera } = data;

            // Verificar que los datos obligatorios existan
            if (nombre_horario != undefined && orden != undefined && hora != undefined &&
                tipo_accion != undefined) {
                contarDatos = contarDatos + 1;
            }

            // Verificar que exita el nombre del horario
            if (nombre_horario != undefined) {
                const HORARIO = await pool.query('SELECT * FROM cg_horarios WHERE UPPER(nombre) = $1',
                    [nombre_horario.toUpperCase()]);
                if (HORARIO.rowCount != 0) {
                    contarHorario = contarHorario + 1;
                }
            }

            //Verificar que todos los datos sean correctos
            console.log('datos', contarHorario, contarDatos)
            if (contador === plantillaD.length) {
                if (contarHorario === plantillaD.length && contarDatos === plantillaD.length) {
                    return res.jsonp({ message: 'correcto' });
                } else {
                    return res.jsonp({ message: 'error' });
                }
            }
            contador = contador + 1;
        });
        // VERIFICAR EXISTENCIA DE CARPETA O ARCHIVO
        fs.access(filePath, fs.constants.F_OK, (err) => {
            if (err) {
            } else {
                // ELIMINAR DEL SERVIDOR
                fs.unlinkSync(filePath);
            }
        });

    }

    public async CrearDetallePlantilla(req: Request, res: Response): Promise<void> {
        let list: any = req.files;
        let cadena = list.uploads[0].path;
        let filename = cadena.split("\\")[1];
        var filePath = `./plantillas/${filename}`

        const workbook = excel.readFile(filePath);
        const sheet_name_list = workbook.SheetNames; // Array de hojas de calculo
        const plantillaD = excel.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);

        const { user_name, ip } = req.body;

        /** Detalle de Horarios */
        plantillaD.forEach(async (data: any) => {
            try {
                let { nombre_horario, orden, hora, tipo_accion, minutos_espera } = data;
                let nombre = nombre_horario;
                const idHorario = await pool.query('SELECT id FROM cg_horarios WHERE UPPER(nombre) = $1', [nombre.toUpperCase()]);
                let id_horario = idHorario.rows[0]['id'];

                // INICIAR TRANSACCION
                await pool.query('BEGIN');

                if (minutos_espera != undefined) {
                    await pool.query('INSERT INTO deta_horarios (orden, hora, minu_espera, id_horario, tipo_accion) VALUES ($1, $2, $3, $4, $5)', [orden, hora, minutos_espera, id_horario, tipo_accion.split("=")[0]]);
                    res.jsonp({ message: 'correcto' });
                }
                else {
                    minutos_espera = 0;
                    await pool.query('INSERT INTO deta_horarios (orden, hora, minu_espera, id_horario, tipo_accion) VALUES ($1, $2, $3, $4, $5)', [orden, hora, minutos_espera, id_horario, tipo_accion.split("=")[0]]);
                    res.jsonp({ message: 'correcto' });
                }

                // AUDITORIA
                await AUDITORIA_CONTROLADOR.InsertarAuditoria({
                    tabla: 'deta_horarios',
                    usuario: user_name,
                    accion: 'I',
                    datosOriginales: '',
                    datosNuevos: `{orden: ${orden}, hora: ${hora}, minu_espera: ${minutos_espera}, id_horario: ${id_horario}, tipo_accion: ${tipo_accion.split("=")[0]}}`,
                    ip,
                    observacion: null
                });

                // FINALIZAR TRANSACCION
                await pool.query('COMMIT');

            } catch (error) {
                // REVERTIR TRANSACCION
                await pool.query('ROLLBACK');
                res.status(500).jsonp({ message: 'Error al guardar registro.' });
            }
        });
        // VERIFICAR EXISTENCIA DE CARPETA O ARCHIVO
        fs.access(filePath, fs.constants.F_OK, (err) => {
            if (err) {
            } else {
                // ELIMINAR DEL SERVIDOR
                fs.unlinkSync(filePath);
            }
        });
    }

}

export const DETALLE_CATALOGO_HORARIO_CONTROLADOR = new DetalleCatalogoHorarioControlador();

export default DETALLE_CATALOGO_HORARIO_CONTROLADOR;