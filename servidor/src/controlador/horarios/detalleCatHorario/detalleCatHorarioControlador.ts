import { Request, Response } from 'express';
import pool from '../../../database';
import excel from 'xlsx';
import fs from 'fs';

class DetalleCatalogoHorarioControlador {

    // METODO PARA BUSCAR DETALLE DE UN HORARIO   --**VERIFICADO
    public async ListarUnDetalleHorario(req: Request, res: Response): Promise<any> {
        const { id_horario } = req.params;
        const HORARIO = await pool.query(
            `
            SELECT * FROM deta_horarios WHERE id_horario = $1 ORDER BY orden ASC
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
                            o.tipo_accion_show = 'Codigo 99';
                            o.tipo_accion = 'codigo 99';
                            break;
                    }
                    return o
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
    public async EliminarRegistros(req: Request, res: Response): Promise<void> {
        const id = req.params.id;
        await pool.query(
            `
            DELETE FROM deta_horarios WHERE id = $1
            `
            , [id]);
        res.jsonp({ message: 'Registro eliminado.' });
    }

    // METODO PARA REGISTRAR DETALLES
    public async CrearDetalleHorarios(req: Request, res: Response): Promise<void> {
        const { orden, hora, minu_espera, id_horario, tipo_accion, segundo_dia, tercer_dia, min_antes, min_despues } = req.body;
        await pool.query(
            `
            INSERT INTO deta_horarios (orden, hora, minu_espera, id_horario, tipo_accion, segundo_dia, tercer_dia, min_antes,
                min_despues) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            `
            , [orden, hora, minu_espera, id_horario, tipo_accion, segundo_dia, tercer_dia, min_antes, min_despues]);
        res.jsonp({ message: 'Registro guardado.' });
    }

    // METODO PARA ACTUALIZAR DETALLE DE HORARIO
    public async ActualizarDetalleHorarios(req: Request, res: Response): Promise<void> {
        const { orden, hora, minu_espera, id_horario, tipo_accion, segundo_dia, tercer_dia, min_antes, min_despues,
            id } = req.body;
        await pool.query(
            `
                UPDATE deta_horarios SET orden = $1, hora = $2, minu_espera = $3, id_horario = $4,
                tipo_accion = $5, segundo_dia = $6, tercer_dia = $7, min_antes = $8, min_despues= $9 WHERE id = $10
                `
            , [orden, hora, minu_espera, id_horario, tipo_accion, segundo_dia, tercer_dia, min_antes, min_despues, id]);
        res.jsonp({ message: 'Registro actualizado.' });

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
        fs.unlinkSync(filePath);
    }

    public async CrearDetallePlantilla(req: Request, res: Response): Promise<void> {
        let list: any = req.files;
        let cadena = list.uploads[0].path;
        let filename = cadena.split("\\")[1];
        var filePath = `./plantillas/${filename}`

        const workbook = excel.readFile(filePath);
        const sheet_name_list = workbook.SheetNames; // Array de hojas de calculo
        const plantillaD = excel.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);

        /** Detalle de Horarios */
        plantillaD.forEach(async (data: any) => {
            var { nombre_horario, orden, hora, tipo_accion, minutos_espera } = data;
            var nombre = nombre_horario;
            const idHorario = await pool.query('SELECT id FROM cg_horarios WHERE UPPER(nombre) = $1', [nombre.toUpperCase()]);
            var id_horario = idHorario.rows[0]['id'];
            if (minutos_espera != undefined) {
                await pool.query('INSERT INTO deta_horarios (orden, hora, minu_espera, id_horario, tipo_accion) VALUES ($1, $2, $3, $4, $5)', [orden, hora, minutos_espera, id_horario, tipo_accion.split("=")[0]]);
                res.jsonp({ message: 'correcto' });
            }
            else {
                minutos_espera = 0;
                await pool.query('INSERT INTO deta_horarios (orden, hora, minu_espera, id_horario, tipo_accion) VALUES ($1, $2, $3, $4, $5)', [orden, hora, minutos_espera, id_horario, tipo_accion.split("=")[0]]);
                res.jsonp({ message: 'correcto' });
            }
        });
        fs.unlinkSync(filePath);
    }





}

export const DETALLE_CATALOGO_HORARIO_CONTROLADOR = new DetalleCatalogoHorarioControlador();

export default DETALLE_CATALOGO_HORARIO_CONTROLADOR;