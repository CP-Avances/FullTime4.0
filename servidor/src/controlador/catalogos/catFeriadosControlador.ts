
import { ObtenerRutaLeerPlantillas } from '../../libs/accesoCarpetas';
import { Request, Response } from 'express';
import { QueryResult } from 'pg';
import AUDITORIA_CONTROLADOR from '../auditoria/auditoriaControlador';
import moment from 'moment';
import excel from 'xlsx';
import pool from '../../database';
import path from 'path';
import fs from 'fs';

class FeriadosControlador {

    // CONSULTA DE LISTA DE FERIADOS ORDENADOS POR SU DESCRIPCION
    public async ListarFeriados(req: Request, res: Response) {
        const FERIADOS = await pool.query(
            `
            SELECT * FROM ef_cat_feriados ORDER BY descripcion ASC
            `
        );
        if (FERIADOS.rowCount > 0) {
            return res.jsonp(FERIADOS.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'No se encuentran registros.' });
        }
    }

    // METODO PARA ELIMINAR UN REGISTRO DE FERIADOS
    public async EliminarFeriado(req: Request, res: Response): Promise<Response> {
        try {
            const id = req.params.id;
            const {user_name, ip} = req.body;

            // INICIAR TRANSACCION
            await pool.query('BEGIN');

            // CONSULTAR DATOS ORIGINALES

            const datosOriginales = await pool.query('SELECT * FROM ef_cat_feriados WHERE id = $1', [id]);
            const [feriado] = datosOriginales.rows;

            if (!feriado) {
                await AUDITORIA_CONTROLADOR.InsertarAuditoria({
                    tabla: 'ef_cat_feriados',
                    usuario: user_name,
                    accion: 'D',
                    datosOriginales: '',
                    datosNuevos: '',
                    ip,
                    observacion: `Error al eliminar feriado con id ${id}. Registro no encontrado.`
                })

                // FINALIZAR TRANSACCION
                await pool.query('COMMIT');
                return res.status(404).jsonp({ text: 'Registro no encontrado.' });
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
            return res.jsonp({ text: 'Registro eliminado.' });
        } catch (error) {
            // REVERTIR TRANSACCION
            await pool.query('ROLLBACK');
            return res.status(500).jsonp({ text: 'Error al eliminar el registro.' });
        }
    }

    // METODO PARA CREAR REGISTRO DE FERIADO
    public async CrearFeriados(req: Request, res: Response): Promise<Response> {
        try {
            const { fecha, descripcion, fec_recuperacion, user_name, ip } = req.body;

            // INICIAR TRANSACCION
            await pool.query('BEGIN');

            const busqueda: QueryResult = await pool.query(
                `
                SELECT * FROM ef_cat_feriados WHERE UPPER(descripcion) = $1
                `
                , [descripcion.toUpperCase()]);

            const [nombres] = busqueda.rows;

            if (nombres) {
                return res.jsonp({ message: 'existe', status: '300' });
            }
            else {
                const response: QueryResult = await pool.query(
                    `
                    INSERT INTO ef_cat_feriados (fecha, descripcion, fecha_recuperacion) 
                    VALUES ($1, $2, $3) RETURNING *
                    `
                    , [fecha, descripcion, fec_recuperacion]);

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

                if (feriado) {
                    return res.status(200).jsonp(feriado);
                }
                else {
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

    // CONSULTA DE FERIDOS EXCEPTO EL REGISTRO QUE SE VA A ACTUALIZAR
    public async ListarFeriadosActualiza(req: Request, res: Response) {
        const id = req.params.id;
        const FERIADOS = await pool.query(
            `
            SELECT * FROM ef_cat_feriados WHERE NOT id = $1
            `
            , [id]);
        if (FERIADOS.rowCount > 0) {
            return res.jsonp(FERIADOS.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'No se encuentran registros.' });
        }
    }

    // METODO PARA ACTUALIZAR UN FERIADO
    public async ActualizarFeriado(req: Request, res: Response): Promise<Response> {
        try {
            const { fecha, descripcion, fec_recuperacion, id, user_name, ip } = req.body;

            // INICIAR TRANSACCION
            await pool.query('BEGIN');

            // CONSULTAR DATOS ORIGINALES
            const datosOriginales = await pool.query('SELECT * FROM ef_cat_feriados WHERE id = $1', [id]);
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

            await pool.query(
                `
                UPDATE ef_cat_feriados SET fecha = $1, descripcion = $2, fecha_recuperacion = $3
                WHERE id = $4
                `
                , [fecha, descripcion, fec_recuperacion, id]);
            
            // AUDITORIA
            await AUDITORIA_CONTROLADOR.InsertarAuditoria({
                tabla: 'ef_cat_feriados',
                usuario: user_name,
                accion: 'U',
                datosOriginales: JSON.stringify(feriado),
                datosNuevos: JSON.stringify({ fecha, descripcion, fec_recuperacion }),
                ip,
                observacion: null
            });

            // FINALIZAR TRANSACCION
            await pool.query('COMMIT');
            return res.jsonp({ message: 'Registro actualizado.' });
        }
        catch (error) {
            // REVERTIR TRANSACCION
            await pool.query('ROLLBACK');
            return res.status(500).jsonp({ message: 'error' });
        }
    }

    // CONSULTA DE DATOS DE UN REGISTRO DE FERIADO
    public async ObtenerUnFeriado(req: Request, res: Response): Promise<any> {
        const { id } = req.params;
        const FERIADO = await pool.query(
            `
            SELECT * FROM ef_cat_feriados WHERE id = $1
            `
            , [id]);
        if (FERIADO.rowCount > 0) {
            return res.jsonp(FERIADO.rows)
        }
        res.status(404).jsonp({ text: 'Registros no encontrados.' });
    }

    // METODO PARA BUSCAR FERIADOS SEGUN CIUDAD Y RANGO DE FECHAS   --**VERIFICADO
    public async FeriadosCiudad(req: Request, res: Response) {
        try {
            const { fecha_inicio, fecha_final, id_empleado } = req.body;
            const FERIADO = await pool.query(
                `
                SELECT f.fecha, f.fecha_recuperacion, cf.id_ciudad, c.descripcion, s.nombre
                FROM ef_cat_feriados AS f, ef_ciudad_feriado AS cf, e_ciudades AS c, e_sucursales AS s, 
                    datos_actuales_empleado AS de
                WHERE cf.id_feriado = f.id AND (f.fecha BETWEEN $1 AND $2) AND c.id = cf.id_ciudad 
                    AND s.id_ciudad = cf.id_ciudad AND de.id_sucursal = s.id AND de.id = $3
                `
                , [fecha_inicio, fecha_final, id_empleado]);

            if (FERIADO.rowCount > 0) {
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

    // METODO PARA BUSCAR FERIADOS SEGUN CIUDAD Y RANGO DE FECHAS   --**VERIFICADO
    public async FeriadosRecuperacionCiudad(req: Request, res: Response) {
        try {
            const { fecha_inicio, fecha_final, id_empleado } = req.body;
            const FERIADO = await pool.query(
                `
                SELECT f.fecha, f.fecha_recuperacion, cf.id_ciudad, c.descripcion, s.nombre
                FROM ef_cat_feriados AS f, ef_ciudad_feriado AS cf, e_ciudades AS c, e_sucursales AS s, 
                    datos_actuales_empleado AS de
                WHERE cf.id_feriado = f.id AND (f.fecha BETWEEN $1 AND $2) AND c.id = cf.id_ciudad 
                    AND s.id_ciudad = cf.id_ciudad AND de.id_sucursal = s.id AND de.id = $3
                    AND f.fecha_recuperacion IS NOT null
                `
                , [fecha_inicio, fecha_final, id_empleado]);

            if (FERIADO.rowCount > 0) {
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

    /* 
    * Metodo para revisar
    */
    // METODO PARA REVISAR LOS DATOS DE LA PLANTILLA DENTRO DEL SISTEMA - MENSAJES DE CADA ERROR
    public async RevisarDatos(req: Request, res: Response): Promise<void> {
        const documento = req.file?.originalname;
        let separador = path.sep;
        let ruta = ObtenerRutaLeerPlantillas() + separador + documento;

        const workbook = excel.readFile(ruta);
        const sheet_name_list = workbook.SheetNames;
        const plantilla = excel.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);
        const plantilla_feriafoCiudades = excel.utils.sheet_to_json(workbook.Sheets[sheet_name_list[1]]);

        let data: any = {
            fila: '',
            fecha: '',
            descripcion: '',
            fec_recuperacion: '',
            observacion: ''
        };

        var fecha_correcta: boolean = false;
        var fec_recuperacion_correcta: boolean = false;

        //Proceso de hoja de feriados de la plantilla feriados.xlxs
        var listFeriados: any = [];
        var duplicados: any = [];
        var fecha_igual: any = [];
        var mensaje: string = 'correcto';
        // LECTURA DE LOS DATOS DE LA PLANTILLA
        plantilla.forEach(async (dato: any, indice: any, array: any) => {
            var { item, fecha, descripcion, fec_recuperacion } = dato;

            if ((item != undefined && item != '') &&
                (fecha != undefined) && (fecha != '') &&
                (descripcion != undefined) && (descripcion != '') &&
                (fec_recuperacion != undefined) && (fec_recuperacion != '')) {
                data.fila = item
                data.fecha = fecha;
                data.descripcion = descripcion;
                data.fec_recuperacion = fec_recuperacion;
                data.observacion = 'no registrada'

                listFeriados.push(data);

            } else {
                data.fila = item
                data.fecha = fecha;
                data.descripcion = descripcion;
                data.fec_recuperacion = fec_recuperacion;
                data.observacion = 'no registrada'

                if (data.fila == '' || data.fila == undefined) {
                    data.fila = 'error';
                    mensaje = 'error'
                }

                if (data.fecha == undefined || data.descripcion == '') {
                    data.fecha = 'No registrado';
                    data.observacion = 'Fecha ' + data.observacion;
                }

                if (data.descripcion == undefined || data.descripcion == '') {
                    data.descripcion = 'No registrado';
                    data.observacion = 'Descripción ' + data.observacion;
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


        //Proceso de hoja de feriadosCiudades de la plantilla feriados.xlxs
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
            var { item, provincia, ciudad, feriado } = dato;

            if ((item != undefined && item != '') &&
                (provincia != undefined) && (provincia != '') &&
                (ciudad != undefined) && (ciudad != '') &&
                (feriado != undefined) && (feriado != '')) {
                data_fC.fila = item;
                data_fC.provincia = provincia;
                data_fC.ciudad = ciudad;
                data_fC.feriado = feriado;
                data_fC.observacion = 'registrado'

                listFeriados_ciudades.push(data_fC);

            } else {

                data_fC.fila = item;
                data_fC.provincia = provincia;
                data_fC.ciudad = ciudad;
                data_fC.feriado = feriado;
                data_fC.observacion = 'registrado'

                if (data_fC.fila == '' || data_fC.fila == undefined) {
                    data_fC.fila = 'error';
                    mensaje = 'error'
                }

                if (provincia == undefined) {
                    data_fC.provincia = 'No registrado';
                    data_fC.observacion = 'Provincia no ' + data_fC.observacion;
                }
                if (ciudad == undefined) {
                    data_fC.ciudad = 'No registrado';
                    data_fC.observacion = 'Ciudad no' + data_fC.observacion;
                }
                if (feriado == undefined) {
                    data_fC.feriado = 'No registrado';
                    data_fC.observacion = 'Feriado no' + data_fC.observacion;
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
            console.log('item: ', item);
            //VERIFICA SI EXISTE EN LAs COLUMNA DATOS REGISTRADOS
            if (item.fila != 'error' && item.fecha != 'No registrado' && item.descripcion != 'No registrado') {
                // Verificar si la variable tiene el formato de fecha correcto con moment
                if (moment(item.fecha, 'YYYY-MM-DD', true).isValid()) {
                    fecha_correcta = true;
                } else {
                    fecha_correcta = false;
                    item.observacion = 'Formato de fecha incorrecto (YYYY-MM-DD)';
                }

                if (fecha_correcta == true) {
                    // VERIFICACIÓN SI LA FECHA DEL FERIADO NO ESTE REGISTRADA EN EL SISTEMA
                    const VERIFICAR_FECHA = await pool.query(
                        `
                        SELECT * FROM ef_cat_feriados 
                        WHERE fecha = $1 OR fecha_recuperacion = $1
                        `
                        , [item.fecha]);

                    if (VERIFICAR_FECHA.rowCount === 0) {

                        if (item.fec_recuperacion == '-' || item.fec_recuperacion == undefined) {
                            fec_recuperacion_correcta = true;
                            // Discriminación de elementos iguales
                            if (duplicados.find((p: any) => p.descripcion == item.descripcion || p.fecha === item.fecha) == undefined) {
                                item.observacion = 'ok';
                                duplicados.push(item);
                            } else {
                                item.observacion = '1';
                            }

                        } else {
                            if (moment(item.fec_recuperacion, 'YYYY-MM-DD', true).isValid()) {
                                fec_recuperacion_correcta = true;
                                // Discriminación de elementos iguales
                                if (duplicados.find((p: any) => p.descripcion == item.descripcion || p.fecha === item.fecha || p.fec_recuperacion === item.fec_recuperacion) == undefined) {
                                    item.observacion = 'ok';
                                    duplicados.push(item);
                                } else {
                                    item.observacion = '1';
                                }

                            } else {
                                fec_recuperacion_correcta = false;
                                item.observacion = 'Formato de fec_recuperacion incorrecto (YYYY-MM-DD)';
                            }
                        }

                    } else {
                        item.observacion = 'Ya existe en el sistema';
                    }
                }

            }

            //Valida si los datos de la columna N son numeros.
            if (typeof item.fila === 'number' && !isNaN(item.fila)) {
                //Condicion para validar si en la numeracion existe un numero que se repite dara error.
                if (item.fila == filaDuplicada) {
                    mensaje = 'error';
                }
            } else {
                return mensaje = 'error';
            }

            filaDuplicada = item.fila;

        });

        var filaDuplicada_fc: number = 0;
        listFeriados_ciudades.forEach(async (value: any) => {
            if (value.provincia != 'No registrado') {
                //consultamos la id la provincia para validar que exista la ciudad registrada
                var OBTENER_IDPROVINCI = await pool.query(
                    `
                    SELECT id FROM e_provincias WHERE UPPER(nombre) = $1
                    `
                    , [value.provincia.toUpperCase()]);
                if (OBTENER_IDPROVINCI.rows[0] != undefined && OBTENER_IDPROVINCI.rows[0] != '') {
                    var id_provincia = OBTENER_IDPROVINCI.rows[0].id;
                    if (value.ciudad != 'No registrado') {
                        var VERIFICAR_CIUDAD = await pool.query(
                            `
                            SELECT * FROM e_ciudades WHERE id_provincia = $1 AND UPPER (descripcion) = $2
                            `
                            , [id_provincia, value.ciudad.toUpperCase()]);
                        if (VERIFICAR_CIUDAD.rows[0] != undefined && VERIFICAR_CIUDAD.rows[0] != '') {
                            value.observacion = 'registrado'

                        } else {
                            value.observacion = 'La ciudad no pertenece a la provincia'
                        }

                    }

                } else {
                    value.observacion = 'La provincia ingresada no existe en la base'
                }
            }

            //Valida si los datos de la columna N son numeros.
            if (typeof value.fila === 'number' && !isNaN(value.fila)) {
                //Condicion para validar si en la numeracion existe un numero que se repite dara error.
                if (value.fila == filaDuplicada_fc) {
                    mensaje = 'error';
                }
            } else {
                return mensaje = 'error';
            }

            filaDuplicada_fc = value.fila;
        })


        setTimeout(() => {

            //console.log('lista feriados: ',listFeriados);
            fecha_igual = listFeriados;

            listFeriados.sort((a: any, b: any) => {
                // Compara los números de los objetos
                if (a.fila < b.fila) {
                    return -1;
                }
                if (a.fila > b.fila) {
                    return 1;
                }
                return 0; // Son iguales
            });

            listFeriados_ciudades.sort((a: any, b: any) => {
                // Compara los números de los objetos
                if (a.fila < b.fila) {
                    return -1;
                }
                if (a.fila > b.fila) {
                    return 1;
                }
                return 0; // Son iguales
            });

            listFeriados.forEach((item: any) => {
                console.log('item.observacion: ', item);
                if (item.fec_recuperacion != '-') {
                    fecha_igual.forEach((valor: any) => {
                        console.log(valor.fecha, ' == ', item.fec_recuperacion);
                        if (valor.fecha == item.fec_recuperacion) {
                            item.observacion = 'Fecha registrada como valor de otra columna'
                        }
                    })
                }

                if (item.observacion == '1') {
                    item.observacion = 'Registro duplicado'
                }
            })


            listFeriados_ciudades.forEach((valor: any) => {
                if (valor.provincia != 'No registrado' && valor.ciudad != 'No registrado' && valor.feriado != 'No registrado') {
                    if (duplicados_fc.find((a: any) => a.provincia === valor.provincia && a.ciudad === valor.ciudad && a.feriado == valor.feriado) == undefined) {
                        valor.observacion = 'registrado'
                        duplicados_fc.push(valor);
                    } else {
                        valor.observacion = '1';
                    }

                }
            })

            for (var x = 0; x < listFeriados_ciudades.length; x++) {
                if (listFeriados_ciudades[x].observacion == 'registrado') {
                    for (var i = 0; i < listFeriados.length; i++) {
                        if (listFeriados[i].observacion == 'ok') {
                            if (listFeriados[i].descripcion.toLowerCase() == listFeriados_ciudades[x].feriado.toLowerCase()) {
                                console.log(listFeriados[i].descripcion.toLowerCase() == listFeriados_ciudades[x].feriado.toLowerCase())
                                listFeriados_ciudades[x].observacion = 'ok';
                            }
                        }
                    }

                }
            }

            listFeriados_ciudades.forEach((valor: any) => {
                if (valor.observacion == '1') {
                    valor.observacion = 'Registro duplicado'
                } else if (valor.observacion == 'registrado') {
                    valor.observacion = 'feriado invalido'
                }
            })

            if (mensaje == 'error') {
                listFeriados = undefined;
            }


            return res.jsonp({ message: mensaje, data: listFeriados, datafc: listFeriados_ciudades });

        }, 1500)

    }
    // METODO PARA REVISAR LOS DATOS DE LA PLANTILLA DENTRO DEL SISTEMA - MENSAJES DE CADA ERROR
    public async RegistrarFeriado_Ciudad(req: Request, res: Response) {
        try {
            const plantilla = req.body
            console.log('datos manual: ', plantilla);

            var contador = 1;
            var respuesta: any

            plantilla.forEach(async (data: any) => {
                // Datos que se leen de la plantilla ingresada
                const { provincia, ciudad, feriado, observacion } = data;
                //Obtener id de la ciudad
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

                console.log('id_ciudad: ', id_ciudad.rows[0].id);
                console.log('id_feriado: ', id_feriado.rows[0].id);

                // Registro de los datos
                const response: QueryResult = await pool.query(
                    `
                    INSERT INTO ef_ciudad_feriado (id_feriado, id_ciudad) VALUES ($1, $2) RETURNING *
                    `
                    , [id_feriado.rows[0].id, id_ciudad.rows[0].id]);

                const [ciudad_feria] = response.rows;

                if (contador === plantilla.length) {
                    if (ciudad_feria) {
                        return respuesta = res.status(200).jsonp({ message: 'ok' })
                    } else {
                        return respuesta = res.status(404).jsonp({ message: 'error' })
                    }
                }
                contador = contador + 1;
            });

        } catch (error) {
            return res.status(500).jsonp({ message: error });
        }
    }


    // INGRESAR DATOS DE FERIADOS MEDIANTE PLANTILLA
   

}

const FERIADOS_CONTROLADOR = new FeriadosControlador();

export default FERIADOS_CONTROLADOR;
