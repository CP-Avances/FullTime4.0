
import { ObtenerIndicePlantilla, ObtenerRutaLeerPlantillas } from '../../libs/accesoCarpetas';
import { Request, Response } from 'express';
import { QueryResult } from 'pg';
import AUDITORIA_CONTROLADOR from '../auditoria/auditoriaControlador';
import moment from 'moment';
import excel from 'xlsx';
import pool from '../../database';
import path from 'path';
import fs from 'fs';
import { FormatearFecha, FormatearFechaBase, FormatearFecha2 } from '../../libs/settingsMail';


class FeriadosControlador {

    // CONSULTA DE LISTA DE FERIADOS ORDENADOS POR SU DESCRIPCION   **USADO
    public async ListarFeriados(req: Request, res: Response) {
        const FERIADOS = await pool.query(
            `
            SELECT * FROM ef_cat_feriados ORDER BY descripcion ASC
            `
        );
        if (FERIADOS.rowCount != 0) {
            return res.jsonp(FERIADOS.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'No se encuentran registros.' });
        }
    }

    // METODO PARA ELIMINAR UN REGISTRO DE FERIADOS    **USADO
    public async EliminarFeriado(req: Request, res: Response): Promise<any> {
        try {
            const id = req.params.id;
            const { user_name, ip } = req.body;

            // INICIAR TRANSACCION
            await pool.query('BEGIN');

            // CONSULTAR DATOS ORIGINALES

            const datosOriginales = await pool.query(
                `
                SELECT * FROM ef_cat_feriados WHERE id = $1
                `
                , [id]);
            const [feriado] = datosOriginales.rows;


            const fecha_formatoO = await FormatearFechaBase(feriado.fecha, 'ddd');
            feriado.fecha = fecha_formatoO;

            let fec_recuperacion_formatoO = '';
            if (feriado.fec_recuperacion) {
                fec_recuperacion_formatoO = await FormatearFechaBase(feriado.fecha_recuperacion, 'ddd');
                feriado.fecha_recuperacion = fec_recuperacion_formatoO;
            }

            if (!feriado) {
                await AUDITORIA_CONTROLADOR.InsertarAuditoria({
                    tabla: 'ef_cat_feriados',
                    usuario: user_name,
                    accion: 'D',
                    datosOriginales: JSON.stringify(feriado),
                    datosNuevos: '',
                    ip,
                    observacion: `Error al eliminar feriado con id ${id}. Registro no encontrado.`
                })

                // FINALIZAR TRANSACCION
                await pool.query('COMMIT');
                return res.status(404).jsonp({ message: 'error' });
            }

            await pool.query(
                `
                DELETE FROM ef_cat_feriados WHERE id = $1
                `
                , [id]);

            // AUDITORIA
            await AUDITORIA_CONTROLADOR.InsertarAuditoria({
                tabla: 'ef_cat_feriados',
                usuario: user_name,
                accion: 'D',
                datosOriginales: JSON.stringify(feriado),
                datosNuevos: '',
                ip,
                observacion: null
            });

            // FINALIZAR TRANSACCION
            await pool.query('COMMIT');
            return res.jsonp({ message: 'Registro eliminado.' });

        } catch (error) {
            // REVERTIR TRANSACCION
            await pool.query('ROLLBACK');
            return res.jsonp({ message: 'error' });
        }
    }

    // METODO PARA CREAR REGISTRO DE FERIADO   **USADO
    public async CrearFeriados(req: Request, res: Response): Promise<Response> {
        try {
            const { fecha, descripcion, fec_recuperacion, user_name, ip } = req.body;

            // INICIAR TRANSACCION
            await pool.query('BEGIN');

            // BUSCAR SI YA EXISTE UN FERIADO CON LA MISMA DESCRIPCION
            const busqueda: QueryResult = await pool.query(
                `
                SELECT * FROM ef_cat_feriados WHERE UPPER(descripcion) = $1 OR fecha = $2 OR fecha_recuperacion = $3
                `
                , [descripcion.toUpperCase(), fecha, fec_recuperacion]);

            const [existe] = busqueda.rows;

            if (existe) {
                return res.jsonp({ message: 'existe', status: '300' });
            } else {
                // OBTENER LOS DATOS ORIGINALES (EN ESTE CASO, NO HAY DATOS ORIGINALES PORQUE ES UNA INSERCION NUEVA)
                const response: QueryResult = await pool.query(
                    `
                    INSERT INTO ef_cat_feriados (fecha, descripcion, fecha_recuperacion) 
                    VALUES ($1, $2, $3) RETURNING *
                    `,
                    [fecha, descripcion, fec_recuperacion]
                );

                const [feriado] = response.rows;

                const fecha_formato = await FormatearFecha2(fecha.toLocaleString(), 'ddd');

                feriado.fecha = fecha_formato;

                let fec_recuperacion_formato = '';
                if (fec_recuperacion) {
                    fec_recuperacion_formato = await FormatearFecha2(fec_recuperacion, 'ddd');
                    feriado.fecha_recuperacion = fec_recuperacion_formato;
                }

                // AUDITORIA
                await AUDITORIA_CONTROLADOR.InsertarAuditoria({
                    tabla: 'ef_cat_feriados',
                    usuario: user_name,
                    accion: 'I',
                    datosOriginales: '',
                    datosNuevos: JSON.stringify(feriado),
                    ip,
                    observacion: null
                });

                // FINALIZAR TRANSACCION
                await pool.query('COMMIT');

                if (feriado) {
                    return res.status(200).jsonp(feriado);
                } else {
                    return res.status(404).jsonp({ message: 'error' });
                }
            }
        }
        catch (error) {
            // REVERTIR TRANSACCION
            await pool.query('ROLLBACK');
            return res.status(500).jsonp({ message: 'error' });
        }
    }

    // CONSULTA DE FERIDOS EXCEPTO EL REGISTRO QUE SE VA A ACTUALIZAR   **USADO
    public async ListarFeriadosActualiza(req: Request, res: Response) {
        const id = req.params.id;
        const FERIADOS = await pool.query(
            `
            SELECT * FROM ef_cat_feriados WHERE NOT id = $1
            `
            , [id]);
        if (FERIADOS.rowCount != 0) {
            return res.jsonp(FERIADOS.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'No se encuentran registros.' });
        }
    }
    // METODO PARA ACTUALIZAR UN FERIADO   **USADO
    public async ActualizarFeriado(req: Request, res: Response): Promise<Response> {
        try {
            const { fecha, descripcion, fec_recuperacion, id, user_name, ip } = req.body;

            // INICIAR TRANSACCION
            await pool.query('BEGIN');

            const busqueda: QueryResult = await pool.query(
                `
                SELECT * FROM ef_cat_feriados WHERE (UPPER(descripcion) = $1 OR fecha = $2 OR fecha_recuperacion = $3) AND 
                    NOT id = $4
                `
                , [descripcion.toUpperCase(), fecha, fec_recuperacion, id]);

            const [existe] = busqueda.rows;

            if (existe) {
                return res.jsonp({ message: 'existe', status: '300' });
            }
            else {
                // CONSULTAR DATOS ORIGINALES
                const datosOriginales = await pool.query(
                    `
                    SELECT * FROM ef_cat_feriados WHERE id = $1
                    `
                    , [id]);
                const [feriado] = datosOriginales.rows;

                if (!feriado) {
                    await AUDITORIA_CONTROLADOR.InsertarAuditoria({
                        tabla: 'ef_cat_feriados',
                        usuario: user_name,
                        accion: 'U',
                        datosOriginales: '',
                        datosNuevos: '',
                        ip,
                        observacion: `Error al actualizar feriado con id ${id}.`
                    })

                    // FINALIZAR TRANSACCION
                    await pool.query('COMMIT');
                    return res.status(404).jsonp({ text: 'Registro no encontrado.' });
                }

                const actualizacion = await pool.query(
                    `
                    UPDATE ef_cat_feriados SET fecha = $1, descripcion = $2, fecha_recuperacion = $3
                    WHERE id = $4 RETURNING *
                    `
                    , [fecha, descripcion, fec_recuperacion, id]);

                const [datosNuevos] = actualizacion.rows;

                const fecha_formato = await FormatearFecha2(fecha.toLocaleString(), 'ddd');
                datosNuevos.fecha = fecha_formato;

                let fec_recuperacion_formato = '';
                if (fec_recuperacion) {
                    fec_recuperacion_formato = await FormatearFecha2(fec_recuperacion, 'ddd');
                    datosNuevos.fecha_recuperacion = fec_recuperacion_formato;
                }
                const fecha_formatoO = await FormatearFecha2(feriado.fecha, 'ddd');
                feriado.fecha = fecha_formatoO;

                let fec_recuperacion_formatoO = '';
                if (feriado.fecha_recuperacion) {
                    fec_recuperacion_formatoO = await FormatearFechaBase(feriado.fecha_recuperacion, 'ddd');
                    feriado.fecha_recuperacion = fec_recuperacion_formatoO;
                }

                // AUDITORIA
                await AUDITORIA_CONTROLADOR.InsertarAuditoria({
                    tabla: 'ef_cat_feriados',
                    usuario: user_name,
                    accion: 'U',
                    datosOriginales: JSON.stringify(feriado),
                    datosNuevos: JSON.stringify(datosNuevos),
                    ip,
                    observacion: null
                });

                // FINALIZAR TRANSACCION
                await pool.query('COMMIT');
                return res.jsonp({ message: 'Registro actualizado.' });
            }
        }

        catch (error) {
            // REVERTIR TRANSACCION
            console.log(error)
            await pool.query('ROLLBACK');
            return res.status(500).jsonp({ message: 'error' });
        }
    }

    // CONSULTA DE DATOS DE UN REGISTRO DE FERIADO    **USADO
    public async ObtenerUnFeriado(req: Request, res: Response): Promise<any> {
        const { id } = req.params;
        const FERIADO = await pool.query(
            `
            SELECT * FROM ef_cat_feriados WHERE id = $1
            `
            , [id]);
        if (FERIADO.rowCount != 0) {
            return res.jsonp(FERIADO.rows)
        }
        res.status(404).jsonp({ text: 'Registros no encontrados.' });
    }

    // METODO PARA BUSCAR FERIADOS SEGUN CIUDAD Y RANGO DE FECHAS    **USADO
    public async FeriadosCiudad(req: Request, res: Response) {
        try {
            const { fecha_inicio, fecha_final, id_empleado } = req.body;
            const FERIADO = await pool.query(
                `
                SELECT f.fecha, f.fecha_recuperacion, cf.id_ciudad, c.descripcion, s.nombre
                FROM ef_cat_feriados AS f, ef_ciudad_feriado AS cf, e_ciudades AS c, e_sucursales AS s, 
                    informacion_general AS de
                WHERE cf.id_feriado = f.id AND (f.fecha BETWEEN $1 AND $2) AND c.id = cf.id_ciudad 
                    AND s.id_ciudad = cf.id_ciudad AND de.id_suc = s.id AND de.id = $3
                `
                , [fecha_inicio, fecha_final, id_empleado]);

            if (FERIADO.rowCount != 0) {
                return res.jsonp(FERIADO.rows)
            }
            else {
                res.status(404).jsonp({ text: 'Registros no encontrados.' });
            }
        }
        catch (error) {
            return res.jsonp({ message: 'error' });
        }
    }

    public async FeriadosCiudad2(req: Request, res: Response) {
        try {
            const { fecha_inicio, fecha_final, ids } = req.body;
            const FERIADO = await pool.query(
                `
                SELECT f.fecha, f.fecha_recuperacion, cf.id_ciudad, c.descripcion, s.nombre, de.id
                FROM ef_cat_feriados AS f, ef_ciudad_feriado AS cf, e_ciudades AS c, e_sucursales AS s, 
                    informacion_general AS de
                WHERE cf.id_feriado = f.id AND (f.fecha BETWEEN $1 AND $2) AND c.id = cf.id_ciudad 
                    AND s.id_ciudad = cf.id_ciudad AND de.id_suc = s.id AND de.id = ANY($3)
                `
                , [fecha_inicio, fecha_final, ids]);

            if (FERIADO.rowCount != 0) {
                return res.jsonp(FERIADO.rows)
            }
            else {
                res.status(404).jsonp({ text: 'Registros no encontrados.' });
            }
        }
        catch (error) {
            return res.jsonp({ message: 'error' });
        }
    }

    // METODO PARA BUSCAR FERIADOS SEGUN CIUDAD Y RANGO DE FECHAS  **USADO
    public async FeriadosRecuperacionCiudad(req: Request, res: Response) {
        try {
            const { fecha_inicio, fecha_final, id_empleado } = req.body;
            const FERIADO = await pool.query(
                `
                SELECT f.fecha, f.fecha_recuperacion, cf.id_ciudad, c.descripcion, s.nombre
                FROM ef_cat_feriados AS f, ef_ciudad_feriado AS cf, e_ciudades AS c, e_sucursales AS s, 
                    informacion_general AS de
                WHERE cf.id_feriado = f.id AND (f.fecha BETWEEN $1 AND $2) AND c.id = cf.id_ciudad 
                    AND s.id_ciudad = cf.id_ciudad AND de.id_suc = s.id AND de.id = $3
                    AND f.fecha_recuperacion IS NOT null
                `
                , [fecha_inicio, fecha_final, id_empleado]);

            if (FERIADO.rowCount != 0) {
                return res.jsonp(FERIADO.rows)
            }
            else {
                res.status(404).jsonp({ text: 'Registros no encontrados.' });
            }
        }
        catch (error) {
            return res.jsonp({ message: 'error' });
        }
    }


        // METODO PARA BUSCAR FERIADOS SEGUN CIUDAD Y RANGO DE FECHAS  **USADO
        public async FeriadosRecuperacionCiudad2(req: Request, res: Response) {
            try {
                const { fecha_inicio, fecha_final, ids } = req.body;
                const FERIADO = await pool.query(
                    `
                    SELECT f.fecha, f.fecha_recuperacion, cf.id_ciudad, c.descripcion, s.nombre,  de.id 
                    FROM ef_cat_feriados AS f, ef_ciudad_feriado AS cf, e_ciudades AS c, e_sucursales AS s,
                        informacion_general AS de
                    WHERE cf.id_feriado = f.id AND (f.fecha BETWEEN $1 AND $2) AND c.id = cf.id_ciudad 
                        AND s.id_ciudad = cf.id_ciudad AND de.id_suc = s.id AND de.id= ANY($3)
                        AND f.fecha_recuperacion IS NOT null
                    `
                    , [fecha_inicio, fecha_final, ids]);
    
                if (FERIADO.rowCount != 0) {
                    return res.jsonp(FERIADO.rows)
                }
                else {
                    res.status(404).jsonp({ text: 'Registros no encontrados.' });
                }
            }
            catch (error) {
                return res.jsonp({ message: 'error' });
            }
        }


    // METODO PARA REVISAR LOS DATOS DE LA PLANTILLA DENTRO DEL SISTEMA - MENSAJES DE CADA ERROR   **USADO
    public async RevisarDatos(req: Request, res: Response): Promise<any> {
        const documento = req.file?.originalname;
        let separador = path.sep;
        let ruta = ObtenerRutaLeerPlantillas() + separador + documento;
        const workbook = excel.readFile(ruta);

        let verificador_feriado: any = ObtenerIndicePlantilla(workbook, 'FERIADOS');
        let verificador_ciudad: any = ObtenerIndicePlantilla(workbook, 'CIUDAD_FERIADOS');

        if (verificador_feriado === false) {
            return res.jsonp({ message: 'no_existe_feriado', data: undefined });
        }
        else if (verificador_ciudad === false) {
            return res.jsonp({ message: 'no_existe_ciudad', data: undefined });
        }
        else if (verificador_feriado != false && verificador_ciudad != false) {
            const sheet_name_list = workbook.SheetNames;
            const plantilla = excel.utils.sheet_to_json(workbook.Sheets[sheet_name_list[verificador_feriado]]);
            const plantilla_feriafoCiudades = excel.utils.sheet_to_json(workbook.Sheets[sheet_name_list[verificador_ciudad]]);

            let data: any = {
                fila: '',
                fecha: '',
                descripcion: '',
                fec_recuperacion: '',
                observacion: ''
            };

            var fecha_correcta: boolean = false;
            var fec_recuperacion_correcta: boolean = false;

            // PROCESO DE HOJA DE FERIADOS DE LA PLANTILLA FERIADOS.XLXS
            var listFeriados: any = [];
            var duplicados: any = [];
            var duplicados1: any = [];
            var fecha_igual: any = [];
            var mensaje: string = 'correcto';
            // LECTURA DE LOS DATOS DE LA PLANTILLA
            plantilla.forEach(async (dato: any) => {
                var { ITEM, FECHA, DESCRIPCION, FECHA_RECUPERACION } = dato;

                if ((ITEM != undefined && ITEM != '') &&
                    (FECHA != undefined) && (FECHA != '') &&
                    (DESCRIPCION != undefined) && (DESCRIPCION != '') &&
                    (FECHA_RECUPERACION != undefined) && (FECHA_RECUPERACION != '')) {
                    data.fila = ITEM
                    data.fecha = FECHA;
                    data.descripcion = DESCRIPCION;
                    data.fec_recuperacion = FECHA_RECUPERACION;
                    data.observacion = 'no registrada'
                    listFeriados.push(data);
                }
                else {
                    data.fila = ITEM
                    data.fecha = FECHA;
                    data.descripcion = DESCRIPCION;
                    data.fec_recuperacion = FECHA_RECUPERACION;
                    data.observacion = 'no registrada'

                    if (data.fila == '' || data.fila == undefined) {
                        data.fila = 'error';
                        mensaje = 'error'
                    }

                    if (data.fecha == undefined || data.descripcion == '') {
                        data.fecha = 'No registrado';
                        data.observacion = 'Fecha no registrada';
                    }

                    if (data.descripcion == undefined || data.descripcion == '') {
                        data.descripcion = 'No registrado';
                        data.observacion = 'Descripción no registrada';
                    }

                    if (data.fecha == 'No registrado' && data.descripcion == 'No registrado') {
                        data.observacion = 'Fecha y descripción no registrada';
                    }

                    if (data.fec_recuperacion == undefined) {
                        data.fec_recuperacion = '-';
                    }
                    listFeriados.push(data);
                }
                data = {};
            });


            // PROCESO DE HOJA DE FERIADOSCIUDADES DE LA PLANTILLA FERIADOS.XLXS
            let data_fC: any = {
                fila: '',
                provincia: '',
                ciudad: '',
                feriado: '',
                observacion: ''
            }

            var listFeriados_ciudades: any = [];
            var duplicados_fc: any = [];
            // LECTURA DE LOS DATOS DE LA PLANTILLA
            plantilla_feriafoCiudades.forEach(async (dato: any, indice: any, array: any) => {
                var { ITEM, PROVINCIA, CIUDAD, FERIADO } = dato;

                if ((ITEM != undefined && ITEM != '') &&
                    (PROVINCIA != undefined) && (PROVINCIA != '') &&
                    (CIUDAD != undefined) && (CIUDAD != '') &&
                    (FERIADO != undefined) && (FERIADO != '')) {
                    data_fC.fila = ITEM;
                    data_fC.provincia = PROVINCIA;
                    data_fC.ciudad = CIUDAD;
                    data_fC.feriado = FERIADO;
                    data_fC.observacion = 'registrado'
                    listFeriados_ciudades.push(data_fC);

                } else {
                    data_fC.fila = ITEM;
                    data_fC.provincia = PROVINCIA;
                    data_fC.ciudad = CIUDAD;
                    data_fC.feriado = FERIADO;
                    data_fC.observacion = 'registrado'

                    if (data_fC.fila == '' || data_fC.fila == undefined) {
                        data_fC.fila = 'error';
                        mensaje = 'error'
                    }

                    if (PROVINCIA == undefined) {
                        data_fC.provincia = 'No registrado';
                        data_fC.observacion = 'Provincia no registrado';
                    }
                    if (CIUDAD == undefined) {
                        data_fC.ciudad = 'No registrado';
                        data_fC.observacion = 'Ciudad no registrado';
                    }
                    if (FERIADO == undefined) {
                        data_fC.feriado = 'No registrado';
                        data_fC.observacion = 'Feriado no registrado';
                    }

                    listFeriados_ciudades.push(data_fC);
                }

                data_fC = {}
            });


            // VERIFICAR EXISTENCIA DE CARPETA O ARCHIVO
            fs.access(ruta, fs.constants.F_OK, (err) => {
                if (err) {
                } else {
                    // ELIMINAR DEL SERVIDOR
                    fs.unlinkSync(ruta);
                }
            });

            var filaDuplicada: number = 0;
            listFeriados.forEach(async (item: any) => {
                //VERIFICA SI EXISTE EN LAs COLUMNA DATOS REGISTRADOS
                if (item.fila != 'error' && item.fecha != 'No registrado' && item.descripcion != 'No registrado') {
                    // VERIFICAR SI LA VARIABLE TIENE EL FORMATO DE FECHA CORRECTO CON moment
                    if (moment(item.fecha, 'YYYY-MM-DD', true).isValid()) {
                        // VERIFICACION SI LA FECHA DEL FERIADO NO ESTE REGISTRADA EN EL SISTEMA
                        const VERIFICAR_FECHA = await pool.query(
                            `SELECT * FROM ef_cat_feriados 
                            WHERE fecha = $1 OR fecha_recuperacion = $1
                            `, [item.fecha]);

                        if (VERIFICAR_FECHA.rowCount === 0) {

                            const VERIFICAR_DESCRIP = await pool.query(
                                `
                                SELECT * FROM ef_cat_feriados 
                                WHERE UPPER(descripcion) = $1
                                `
                                , [item.descripcion.toUpperCase()]);

                            if (VERIFICAR_DESCRIP.rowCount === 0) {
                                if (item.fec_recuperacion == '-' || item.fec_recuperacion == undefined) {
                                    fec_recuperacion_correcta = true;
                                    // DISCRIMINACION DE ELEMENTOS IGUALES
                                    if (duplicados.find((p: any) => p.descripcion.toLowerCase() == item.descripcion.toLowerCase() || p.fecha === item.fecha) == undefined) {
                                        duplicados.push(item);
                                    }
                                    else {
                                        item.observacion = '1';
                                    }
                                } else {
                                    if (moment(item.fec_recuperacion, 'YYYY-MM-DD', true).isValid()) {
                                        fec_recuperacion_correcta = true;
                                        const VERIFICAR_FECHA_RECUPE = await pool.query(
                                            `
                                            SELECT * FROM ef_cat_feriados     
                                            WHERE fecha = $1 OR fecha_recuperacion = $1
                                            `
                                            , [item.fec_recuperacion]);

                                        if (VERIFICAR_FECHA_RECUPE.rowCount === 0) {
                                            // DISCRIMINACION DE ELEMENTOS IGUALES
                                            if (duplicados1.find((p: any) => p.descripcion.toLowerCase() == item.descripcion.toLowerCase() ||
                                                p.fecha === item.fecha || p.fec_recuperacion === item.fec_recuperacion) == undefined) {
                                                duplicados1.push(item);
                                            }
                                            else {
                                                item.observacion = '1';
                                            }
                                        }
                                        else {
                                            item.observacion = 'Fecha recuperación ya existe en el sistema';
                                        }

                                    }
                                    else {
                                        fec_recuperacion_correcta = false;
                                        item.observacion = 'Formato de fecha recuperación incorrecto (YYYY-MM-DD)';
                                    }
                                }
                            }
                            else {
                                item.observacion = 'Descripción ya existe en el sistema';
                            }
                        }
                        else {
                            item.observacion = 'Fecha ya existe en el sistema';
                        }
                    }
                    else {
                        item.observacion = 'Formato de fecha incorrecto (YYYY-MM-DD)';
                    }
                }

                // VALIDA SI LOS DATOS DE LA COLUMNA N SON NUMEROS.
                if (typeof item.fila === 'number' && !isNaN(item.fila)) {
                    // CONDICION PARA VALIDAR SI EN LA NUMERACION EXISTE UN NUMERO QUE SE REPITE DARA ERROR.
                    if (item.fila == filaDuplicada) {
                        mensaje = 'error';
                    }
                }
                else {
                    return mensaje = 'error';
                }
                filaDuplicada = item.fila;
            });

            var filaDuplicada_fc: number = 0;
            listFeriados_ciudades.forEach(async (value: any) => {
                if (value.provincia != 'No registrado') {
                    // CONSULTAMOS LA ID LA PROVINCIA PARA VALIDAR QUE EXISTA LA CIUDAD REGISTRADA
                    var OBTENER_IDPROVINCI = await pool.query(
                        `
                        SELECT id FROM e_provincias 
                        WHERE UPPER(nombre) = $1
                                `
                        , [value.provincia.toUpperCase()]);
                    if (OBTENER_IDPROVINCI.rows[0] != undefined && OBTENER_IDPROVINCI.rows[0] != '') {
                        var id_provincia = OBTENER_IDPROVINCI.rows[0].id;
                        if (value.ciudad != 'No registrado') {
                            var VERIFICAR_CIUDAD = await pool.query(
                                `
                                SELECT id FROM e_ciudades 
                                WHERE UPPER(descripcion) = $1
                                `
                                , [value.ciudad.toUpperCase()]);
                            if (VERIFICAR_CIUDAD.rowCount == 0) {
                                value.observacion = 'La ciudad no existe en el sistema'
                            }
                            else {
                                var id_ciudad = VERIFICAR_CIUDAD.rows[0].id;
                                var VERIFICAR_CIUDAD_PRO = await pool.query(
                                    `
                                    SELECT * FROM e_ciudades 
                                    WHERE id_provincia = $1 AND UPPER(descripcion) = $2
                                `
                                    , [id_provincia, value.ciudad.toUpperCase()]);
                                if (VERIFICAR_CIUDAD_PRO.rows[0] != undefined && VERIFICAR_CIUDAD.rows[0] != '') {
                                    const VERIFICAR_DESCRIP = await pool.query(
                                        `
                                        SELECT id FROM ef_cat_feriados 
                                        WHERE UPPER(descripcion) = $1
                                `
                                        , [value.feriado.toUpperCase()]);
                                    if (VERIFICAR_DESCRIP.rowCount === 0) {
                                        value.observacion = 'registrado'
                                    }
                                    else {
                                        var id_feriado = VERIFICAR_DESCRIP.rows[0].id
                                        var VERIFICAR_CIUDAD_FERIADO = await pool.query(
                                            `
                                            SELECT * FROM ef_ciudad_feriado 
                                            WHERE id_feriado = $1 AND id_ciudad = $2
                                            `
                                            , [id_feriado, id_ciudad]);
                                        if (VERIFICAR_CIUDAD_FERIADO.rowCount === 0) {
                                            value.observacion = 'registrado'
                                        }
                                        else {
                                            value.observacion = 'Feriando ya asignado a una ciudad'
                                        }
                                    }
                                }
                                else {
                                    value.observacion = 'La ciudad no pertenece a la provincia'
                                }
                            }
                        }
                    }
                    else {
                        value.observacion = 'La provincia no existe en el sistema'
                    }
                }

                // VALIDA SI LOS DATOS DE LA COLUMNA N SON NUMEROS.
                if (typeof value.fila === 'number' && !isNaN(value.fila)) {
                    // CONDICION PARA VALIDAR SI EN LA NUMERACION EXISTE UN NUMERO QUE SE REPITE DARA ERROR.
                    if (value.fila == filaDuplicada_fc) {
                        mensaje = 'error';
                    }
                }
                else {
                    return mensaje = 'error';
                }
                filaDuplicada_fc = value.fila;
            })
            var tiempo = 2000;
            if (listFeriados.length > 500 && listFeriados.length <= 1000) {
                tiempo = 4000;
            }
            else if (listFeriados.length > 1000) {
                tiempo = 7000;
            }
            setTimeout(() => {
                fecha_igual = listFeriados;

                listFeriados.sort((a: any, b: any) => {
                    // COMPARA LOS NUMEROS DE LOS OBJETOS
                    if (a.fila < b.fila) {
                        return -1;
                    }
                    if (a.fila > b.fila) {
                        return 1;
                    }
                    return 0; // SON IGUALES
                });

                listFeriados_ciudades.sort((a: any, b: any) => {
                    // COMPARA LOS NUMEROS DE LOS OBJETOS
                    if (a.fila < b.fila) {
                        return -1;
                    }
                    if (a.fila > b.fila) {
                        return 1;
                    }
                    return 0; // SON IGUALES
                });

                listFeriados.forEach((item: any) => {
                    if (item.fec_recuperacion != '-') {
                        fecha_igual.forEach((valor: any) => {
                            if (valor.fecha == item.fec_recuperacion) {
                                item.observacion = 'Fecha como valor de otra columna'
                            }
                        })
                    }

                    if (item.observacion != undefined) {
                        let arrayObservacion = item.observacion.split(" ");
                        if (arrayObservacion[0] == 'no' || item.observacion == " ") {
                            item.observacion = 'ok'
                        }

                        if (item.observacion == '1') {
                            item.observacion = 'Registro duplicado'
                        }
                    }
                })

                listFeriados_ciudades.forEach((valor: any) => {
                    if (valor.provincia != 'No registrado' && valor.ciudad != 'No registrado' && valor.feriado != 'No registrado') {
                        if (duplicados_fc.find((a: any) => a.provincia === valor.provincia && a.ciudad === valor.ciudad && a.feriado == valor.feriado) == undefined) {
                            duplicados_fc.push(valor);
                        }
                        else {
                            valor.observacion = '1';
                        }
                    }
                })

                for (var x = 0; x < listFeriados_ciudades.length; x++) {
                    if (listFeriados_ciudades[x].observacion == 'registrado') {
                        for (var i = 0; i < listFeriados.length; i++) {
                            if (listFeriados[i].observacion == 'ok') {
                                if (listFeriados[i].descripcion.toLowerCase() == listFeriados_ciudades[x].feriado.toLowerCase()) {
                                    listFeriados_ciudades[x].observacion = 'ok';
                                }
                            }
                        }

                    }
                }

                listFeriados_ciudades.forEach((valor: any) => {
                    if (valor.observacion == '1') {
                        valor.observacion = 'Registro duplicado'
                    }
                    else if (valor.observacion == 'registrado') {
                        valor.observacion = 'Feriado no válido (Debe existir previamente)'
                        if (valor.feriado == 'No registrado') {
                            valor.observacion = 'Feriado no registrado';
                        }
                    }
                })

                if (mensaje == 'error') {
                    listFeriados = undefined;
                }
                return res.jsonp({ message: mensaje, data: listFeriados, datafc: listFeriados_ciudades });

            }, tiempo)
        }
    }

    // METODO PARA REGISTRAR DATOS DE FERIADOS DE PLANTILLA   **USADO
    public async RegistrarFeriado(req: Request, res: Response) {
        const { plantilla, user_name, ip } = req.body
        let error: boolean = false;

        for (const data of plantilla) {
            try {
                let { fecha, descripcion, fec_recuperacion } = data;
                if (fec_recuperacion == '-') { fec_recuperacion = null; }

                // INICIAR TRANSACCION
                await pool.query('BEGIN');


                const response: QueryResult = await pool.query(
                    `
                    INSERT INTO ef_cat_feriados (fecha, descripcion, fecha_recuperacion) 
                    VALUES ($1, $2, $3) RETURNING *
                    `,
                    [fecha, descripcion, fec_recuperacion]
                );

                const [feriado] = response.rows;

                // AUDITORIA
                await AUDITORIA_CONTROLADOR.InsertarAuditoria({
                    tabla: 'ef_cat_feriados',
                    usuario: user_name,
                    accion: 'I',
                    datosOriginales: '',
                    datosNuevos: JSON.stringify(feriado),
                    ip,
                    observacion: null
                });

                // FINALIZAR TRANSACCION
                await pool.query('COMMIT');

            } catch (error) {
                // REVERTIR TRANSACCION
                await pool.query('ROLLBACK');
                error = true;
            }
        }

        if (error) {
            return res.status(500).jsonp({ message: 'error' });
        }

        return res.status(200).jsonp({ message: 'ok' });
    }

    // METODO PARA REVISAR LOS DATOS DE LA PLANTILLA DENTRO DEL SISTEMA - MENSAJES DE CADA ERROR   **USADO
    public async RegistrarFeriado_Ciudad(req: Request, res: Response) {
        const { plantilla, user_name, ip } = req.body
        let error: boolean = false;

        for (const data of plantilla) {
            try {
                const { ciudad, feriado } = data;

                // INICIAR TRANSACCION
                await pool.query('BEGIN');

                //OBTENER ID DE LA CIUDAD
                const id_ciudad = await pool.query(
                    `
                    SELECT id FROM e_ciudades WHERE UPPER(descripcion) = $1
                    `
                    , [ciudad.toUpperCase()]);

                const id_feriado = await pool.query(
                    `
                    SELECT id FROM ef_cat_feriados WHERE UPPER(descripcion) = $1
                    `
                    , [feriado.toUpperCase()]);

                const response: QueryResult = await pool.query(
                    `
                    INSERT INTO ef_ciudad_feriado (id_feriado, id_ciudad) VALUES ($1, $2) RETURNING *
                    `
                    , [id_feriado.rows[0].id, id_ciudad.rows[0].id]);

                const [ciudad_feria] = response.rows;

                // AUDITORIA
                await AUDITORIA_CONTROLADOR.InsertarAuditoria({
                    tabla: 'ef_ciudad_feriado',
                    usuario: user_name,
                    accion: 'I',
                    datosOriginales: '',
                    datosNuevos: JSON.stringify(ciudad_feria),
                    ip,
                    observacion: null
                });

                // FINALIZAR TRANSACCION
                await pool.query('COMMIT');

            } catch (error) {
                // REVERTIR TRANSACCION
                await pool.query('ROLLBACK');
                error = true;
            }
        }
        if (error) {
            return res.status(500).jsonp({ message: 'error' });
        }

        return res.status(200).jsonp({ message: 'ok' });
    }

    /** ********************************************************************************************* **
     ** **                          METODOS DE APLICACION MOVIL                                    ** **
     ** ********************************************************************************************* **/

    // METODO PARA LEER FERIADOS   **USADO
    public async LeerFeriados(req: Request, res: Response): Promise<Response> {
        try {
            const fecha = new Date();
            const response: QueryResult = await pool.query(
                `
                SELECT id, descripcion, CAST(fecha AS VARCHAR), CAST(fecha_recuperacion AS VARCHAR) 
                FROM ef_cat_feriados WHERE CAST(fecha AS VARCHAR) LIKE $1 || '%' 
                ORDER BY descripcion ASC
                `
                , [fecha.toJSON().split("-")[0]]);
            const cg_feriados: any[] = response.rows;
            return res.status(200).jsonp(cg_feriados);
        } catch (error) {
            console.log(error);
            return res.status(500).jsonp({ message: 'Contactese con el Administrador del sistema (593) 2 – 252-7663 o https://casapazmino.com.ec' });
        }
    };

}

const FERIADOS_CONTROLADOR = new FeriadosControlador();

export default FERIADOS_CONTROLADOR;
