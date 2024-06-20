
import { ObtenerRutaLeerPlantillas } from '../../libs/accesoCarpetas';
import { Request, Response } from 'express';
import { QueryResult } from 'pg';
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
        if (FERIADOS.rowCount != 0) {
            return res.jsonp(FERIADOS.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'No se encuentran registros.' });
        }
    }

    // METODO PARA ELIMINAR UN REGISTRO DE FERIADOS
    public async EliminarFeriado(req: Request, res: Response): Promise<any> {

        try {

            const id = req.params.id;
            await pool.query(
                `
                DELETE FROM ef_cat_feriados WHERE id = $1
                `
                , [id]);
            res.jsonp({ text: 'Registro eliminado.' });
        } catch (error) {
            return res.jsonp({ message: 'error' });

        }

    }

    // METODO PARA CREAR REGISTRO DE FERIADO
    public async CrearFeriados(req: Request, res: Response): Promise<Response> {
        try {
            const { fecha, descripcion, fec_recuperacion } = req.body;

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

                if (feriado) {
                    return res.status(200).jsonp(feriado);
                }
                else {
                    return res.status(404).jsonp({ message: 'error' });
                }
            }
        }
        catch (error) {
            return res.jsonp({ message: 'error' });
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
        if (FERIADOS.rowCount != 0) {
            return res.jsonp(FERIADOS.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'No se encuentran registros.' });
        }
    }

    // METODO PARA ACTUALIZAR UN FERIADO
    public async ActualizarFeriado(req: Request, res: Response) {
        try {
            const { fecha, descripcion, fec_recuperacion, id } = req.body;

            const busqueda: QueryResult = await pool.query(
                `
                SELECT * FROM ef_cat_feriados WHERE UPPER(descripcion) = $1 AND NOT id = $2
                `
                , [descripcion.toUpperCase(), id]);

            const [nombres] = busqueda.rows;

            if (nombres) {
                return res.jsonp({ message: 'existe', status: '300' });
            }
            else {
                await pool.query(
                    `
                    UPDATE ef_cat_feriados SET fecha = $1, descripcion = $2, fecha_recuperacion = $3
                    WHERE id = $4
                    `
                    , [fecha, descripcion, fec_recuperacion, id]);
                return res.jsonp({ message: 'ok' });
            }
        }
        catch (error) {
            return res.jsonp({ message: 'error' });
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
        if (FERIADO.rowCount != 0) {
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


    // REVISAR DATOS DUPLICADOS DENTRO DE LA MISMA PLANTILLA
    public async RevisarDatos_Duplicados(req: Request, res: Response) {
        const documento = req.file?.originalname;
        let separador = path.sep;
        let ruta = ObtenerRutaLeerPlantillas() + separador + documento;

        const workbook = excel.readFile(ruta);
        const sheet_name_list = workbook.SheetNames;
        const plantilla = excel.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);

        // VARIABLES DE CONTADORES DE REGISTROS
        var lectura = 1;
        var contador = 1;
        var contarFecha = 0;
        var contarRecuperacion = 0;
        var fecha_recuperacion = 0;

        // ARRAY DE DATOS TOTALES DE PLANTILLA
        var ver_fecha: any = [];
        var datos_totales: any = [];
        var ver_recuperacion: any = [];

        // VARIABLES DE ALMACENAMIENTO DE FILAS DUPLICADAS

        let fechaDuplicada = '';
        let fechaIgualRecupera = '';
        let recuperacionDuplicada = '';

        // LECTURA DE DATOS DE LA PLANTILLA FILA POR FILA
        plantilla.forEach(async (data: any) => {
            lectura = lectura + 1
            var { fecha, fec_recuperacion, fila = lectura } = data;
            let fila_datos = {
                fec_recuperacion: fec_recuperacion,
                fecha: fecha,
                fila: fila
            }
            datos_totales.push(fila_datos);
        });

        // VERIFICAR EXISTENCIA DE CARPETA O ARCHIVO
        fs.access(ruta, fs.constants.F_OK, (err) => {
            if (err) {
            } else {
                // ELIMINAR DEL SERVIDOR
                fs.unlinkSync(ruta);
            }
        });

        ver_fecha = ver_recuperacion = datos_totales;
        // VERIFICACIÓN DE FECHAS DUPLICADAS DENTRO DE LA MISMA PLANTILLA
        for (var i = 0; i <= datos_totales.length - 1; i++) {
            for (var j = 0; j <= datos_totales.length - 1; j++) {

                // NO SE LEE LA MISMA FILA EN LOS DATOS
                if (i != j) {
                    // VERIFICAR SI LA FECHA SE ENCUENTRA DUPLICADA EN LAS DEMÁS FILAS 
                    if (ver_fecha[i].fecha === ver_fecha[j].fecha) {
                        contarFecha = contarFecha + 1;
                        fechaDuplicada = fechaDuplicada + ' - Fila ' + ver_fecha[i].fila +
                            ' similar a la fila ' + ver_fecha[j].fila + '.'
                        ver_fecha.splice(i, 1)
                    }
                    // SE REALIZA VERIFICACIÓN SI EXISTE FECHA DE RECUPERACIÓN
                    if (ver_recuperacion[i].fec_recuperacion != undefined) {
                        // VERIFICAR SI LA FECHA DE RECUPERACIÓN SE ENCUENTRA DUPLICADA EN LAS DEMÁS FILAS 
                        if (ver_recuperacion[i].fec_recuperacion === ver_recuperacion[j].fec_recuperacion) {
                            contarRecuperacion = contarRecuperacion + 1;
                            recuperacionDuplicada = recuperacionDuplicada + ' - Fila ' + ver_fecha[i].fila +
                                ' similar a la fila ' + ver_fecha[j].fila + '.'
                            ver_recuperacion.splice(i, 1)
                        }
                    }
                }

                // VERIFICAR SI LA FECHA DE FERIADO ES IGUAL A UNA FECHA DE RECUPERACIÓN
                if (datos_totales[i].fecha === datos_totales[j].fec_recuperacion) {
                    fecha_recuperacion = fecha_recuperacion + 1;
                    fechaIgualRecupera = fechaIgualRecupera + ' - Campo fecha Fila ' + datos_totales[i].fila +
                        ' similar a campo fec_recuperacion fila ' + datos_totales[j].fila + '.'
                }
            }
            contador = contador + 1;
        }

        // ENVIO DE MENSAJES DE EVENTOS DESPUÉS DE LEER TODA LA PLANTILLA
        if ((contador - 1) === plantilla.length) {
            if (contarFecha === 0) {
                if (contarRecuperacion === 0) {
                    if (fecha_recuperacion === 0) {
                        return res.jsonp({ message: 'CORRECTO' });
                    }
                    else {
                        return res.jsonp({ message: 'SIMILAR FECHA-RECUPERACION', data: fechaIgualRecupera });
                    }
                }
                else {
                    return res.jsonp({ message: 'ERROR RECUPERACION', data: recuperacionDuplicada });
                }
            } else {
                return res.jsonp({ message: 'ERROR FECHA', data: fechaDuplicada });
            }
        }
    }

    // INGRESAR DATOS DE FERIADOS MEDIANTE PLANTILLA
    public async CrearFeriadoPlantilla(req: Request, res: Response): Promise<void> {
        const documento = req.file?.originalname;
        let separador = path.sep;
        let ruta = ObtenerRutaLeerPlantillas() + separador + documento;
        var contador = 1;
        const workbook = excel.readFile(ruta);
        const sheet_name_list = workbook.SheetNames;
        const plantilla = excel.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);

        // LECTURA DE DATOS DE LA PLANTILLA
        plantilla.forEach(async (data: any) => {
            const { fecha, descripcion, fec_recuperacion } = data;
            // VERIFICACIÓN DE EXISTENCIA DE DATOS DE FECHA DE RECUPERACIÓN
            if (fec_recuperacion === undefined) {
                var recuperar = null;
            }
            else {
                recuperar = fec_recuperacion;
            }
            // REGISTRO DE DATOS EN EL SISTEMA
            await pool.query(
                `
                INSERT INTO ef_cat_feriados (fecha, descripcion, fecha_recuperacion) 
                VALUES ($1, $2, $3)
                `
                , [fecha, descripcion, recuperar]);

            // ENVIO DE MENSAJE UNA VEZ QUE SE HA LEIDO TODOS LOS DATOS DE LA PLANTILLA
            if (contador === plantilla.length) {
                return res.jsonp({ message: 'CORRECTO' });
            }
            contador = contador + 1;
        });

        // VERIFICAR EXISTENCIA DE CARPETA O ARCHIVO
        fs.access(ruta, fs.constants.F_OK, (err) => {
            if (err) {
            } else {
                // ELIMINAR DEL SERVIDOR
                fs.unlinkSync(ruta);
            }

        });
    }

}

const FERIADOS_CONTROLADOR = new FeriadosControlador();

export default FERIADOS_CONTROLADOR;
