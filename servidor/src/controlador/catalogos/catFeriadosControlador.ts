import { Request, Response } from 'express';
import { QueryResult } from 'pg';
import { ObtenerRutaLeerPlantillas } from '../../libs/accesoCarpetas';
import moment from 'moment';
import excel from 'xlsx';
import pool from '../../database';
import path from 'path';
import fs from 'fs';
const builder = require('xmlbuilder');

class FeriadosControlador {

    // CONSULTA DE LISTA DE FERIADOS ORDENADOS POR SU DESCRIPCION
    public async ListarFeriados(req: Request, res: Response) {
        const FERIADOS = await pool.query(
            `
            SELECT * FROM cg_feriados ORDER BY descripcion ASC
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
    public async EliminarFeriado(req: Request, res: Response): Promise<any> {
        const id = req.params.id;
        await pool.query(
            `
            DELETE FROM cg_feriados WHERE id = $1
            `
            , [id]);
        res.jsonp({ text: 'Registro eliminado.' });
    }

    // METODO PARA CREAR REGISTRO DE FERIADO
    public async CrearFeriados(req: Request, res: Response): Promise<Response> {
        try {
            const { fecha, descripcion, fec_recuperacion } = req.body;

            const response: QueryResult = await pool.query(
                `
                INSERT INTO cg_feriados (fecha, descripcion, fec_recuperacion) 
                VALUES ($1, $2, $3) RETURNING *
                `
                , [fecha, descripcion, fec_recuperacion]);

            const [feriado] = response.rows;

            if (feriado) {
                return res.status(200).jsonp(feriado)
            }
            else {
                return res.status(404).jsonp({ message: 'error' })
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
            SELECT * FROM cg_feriados WHERE NOT id = $1
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
    public async ActualizarFeriado(req: Request, res: Response) {
        try {
            const { fecha, descripcion, fec_recuperacion, id } = req.body;
            await pool.query(
                `
                UPDATE cg_feriados SET fecha = $1, descripcion = $2, fec_recuperacion = $3
                WHERE id = $4
                `
                , [fecha, descripcion, fec_recuperacion, id]);
            res.jsonp({ message: 'Registro actualizado.' });
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
            SELECT * FROM cg_feriados WHERE id = $1
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
                SELECT f.fecha, f.fec_recuperacion, cf.id_ciudad, c.descripcion, s.nombre
                FROM cg_feriados AS f, ciud_feriados AS cf, ciudades AS c, sucursales AS s, datos_actuales_empleado AS de
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
                SELECT f.fecha, f.fec_recuperacion, cf.id_ciudad, c.descripcion, s.nombre
                FROM cg_feriados AS f, ciud_feriados AS cf, ciudades AS c, sucursales AS s, datos_actuales_empleado AS de
                WHERE cf.id_feriado = f.id AND (f.fecha BETWEEN $1 AND $2) AND c.id = cf.id_ciudad 
                    AND s.id_ciudad = cf.id_ciudad AND de.id_sucursal = s.id AND de.id = $3
                    AND f.fec_recuperacion IS NOT null
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












    // METODO PARA REVISAR LOS DATOS DE LA PLANTILLA DENTRO DEL SISTEMA - MENSAJES DE CADA ERROR
    public async RevisarDatos(req: Request, res: Response): Promise<void> {
        const documento = req.file?.originalname;
        let separador = path.sep;
        let ruta = ObtenerRutaLeerPlantillas() + separador + documento;

        const workbook = excel.readFile(ruta);
        const sheet_name_list = workbook.SheetNames;
        const plantilla = excel.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);

        let data: any = {
            fecha: '',
            descripcion: '',
            fec_recuperacion: '',
            observacion: ''
        };

        var fecha_correcta: boolean = false;
        var fec_recuperacion_correcta: boolean = false;
      
        var listFeriados: any = [];
        var duplicados: any = [];
        var fecha_igual: any = [];

        // LECTURA DE LOS DATOS DE LA PLANTILLA
        plantilla.forEach(async (dato: any, indice: any, array: any) => {
            var { fecha, descripcion, fec_recuperacion } = dato;

            data.fecha = fecha;
            data.descripcion = descripcion;
            data.fec_recuperacion = fec_recuperacion;
            data.observacion = 'no registrada'

            if(data.fecha == undefined || data.descripcion == ''){
                data.fecha = 'No registrado';
                data.observacion = 'Fecha '+data.observacion;
            }

            if(data.descripcion == undefined || data.descripcion == ''){
                data.descripcion = 'No registrado';
                data.observacion = 'Descripcion '+data.observacion;
            }


            //VERIFICA SI EXISTE EN LAs COLUMNA DATOS REGISTRADOS
            if(data.fecha != 'No registrado' &&  data.descripcion != 'No registrado'){

                // Verificar si la variable tiene el formato de fecha correcto con moment
                if (moment(data.fecha, 'YYYY-MM-DD', true).isValid()) {
                    fecha_correcta = true;
                } else {
                    fecha_correcta = false;
                    data.observacion = 'Formato de fecha incorrecto (YYYY-MM-DD)';
                }

                if(fecha_correcta == true){
                    // VERIFICACIÓN SI LA FECHA DEL FERIADO NO ESTE REGISTRADA EN EL SISTEMA
                    const VERIFICAR_FECHA = await pool.query('SELECT * FROM cg_feriados ' +
                    'WHERE fecha = $1 OR fec_recuperacion = $1', [dato.fecha]);
                    data.fecha = dato.fecha;
                    data.descripcion = dato.descripcion;

                    if (VERIFICAR_FECHA.rowCount === 0) {
                        data.fec_recuperacion = dato.fec_recuperacion;

                        if(data.fec_recuperacion == undefined){
                            data.fec_recuperacion = '-';
                            fec_recuperacion_correcta = true;
                             // Discriminación de elementos iguales
                            if(duplicados.find((p: any)=> p.fecha === data.fecha || p.fecha === data.fec_recuperacion) == undefined)
                            {
                                data.observacion = 'ok';
                                duplicados.push(dato);
                            }

                        }else{
                            if (moment(data.fec_recuperacion, 'YYYY-MM-DD', true).isValid()) {
                                fec_recuperacion_correcta = true;
                                // Discriminación de elementos iguales
                                if(duplicados.find((p: any)=> p.fecha === dato.fecha) == undefined)
                                {
                                    data.observacion = 'ok';
                                    duplicados.push(dato);
                                }

                            } else {
                                fec_recuperacion_correcta = false;
                                data.observacion = 'Formato de fec_recuperacion incorrecto (YYYY-MM-DD)';
                            }
                        }

                       
                        listFeriados.push(data);

                    }else{
                        data.fec_recuperacion = dato.fec_recuperacion;
                        if(data.fec_recuperacion == undefined){
                            data.fec_recuperacion = '-';
                        }

                        data.observacion = 'Ya existe en el sistema';

                        listFeriados.push(data);
                    }
                }else{
                    if(data.fec_recuperacion == undefined){
                        data.fec_recuperacion = '-';
                    }
                    listFeriados.push(data);
                }
                
            }else{
                
                data.fec_recuperacion = dato.fec_recuperacion;
                if (data.fecha == 'No registrado' && data.descripcion == 'No registrado') {
                    data.observacion = 'Fecha y descripcion no registrada';
                }

                if(data.fec_recuperacion == undefined){
                    data.fec_recuperacion = '-';
                }

                listFeriados.push(data);
            }

            data = {};

        });

        // VERIFICAR EXISTENCIA DE CARPETA O ARCHIVO
        fs.access(ruta, fs.constants.F_OK, (err) => {
            if (err) {
            } else {
                // ELIMINAR DEL SERVIDOR
                fs.unlinkSync(ruta);
            }
        });

        setTimeout(() => {

            //console.log('lista feriados: ',listFeriados);
            fecha_igual = listFeriados;

            listFeriados.forEach((item:any) => {
                if(item.observacion == undefined || item.observacion == 'no registrada' || item.observacion == ''){
                  item.observacion = 'Registro duplicado'
                }else{
                    fecha_igual.forEach((valor: any) => {
                        if(valor.fecha == item.fec_recuperacion){
                            item.observacion = 'Fecha duplicada'   
                        }
                    })
                }
            });

            return res.jsonp({ message: 'correcto', data: listFeriados});
      
          }, 1500)

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
            await pool.query('INSERT INTO cg_feriados (fecha, descripcion, fec_recuperacion) ' +
                'VALUES ($1, $2, $3)', [fecha, descripcion, recuperar]);

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
