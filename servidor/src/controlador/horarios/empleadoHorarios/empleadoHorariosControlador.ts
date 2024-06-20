import { Request, Response } from 'express';
import moment from 'moment';
import excel from 'xlsx';
import pool from '../../../database';
import fs from 'fs';

class EmpleadoHorariosControlador {

    // METODO PARA BUSCAR HORARIOS DEL EMPLEADO EN DETERMINADA FECHA  --**VERIFICADO
    public async VerificarHorariosExistentes(req: Request, res: Response): Promise<any> {
        const { fechaInicio, fechaFinal } = req.body;
        const { codigo } = req.params;
        const HORARIO = await pool.query(
            `
            SELECT DISTINCT pg.id_horario, ch.hora_trabajo, ch.codigo, ch.default_  
            FROM eu_asistencia_general AS pg, eh_cat_horarios AS ch
            WHERE pg.codigo = $3 AND pg.id_horario = ch.id AND
                (fecha_horario BETWEEN $1 AND $2)
            `
            , [fechaInicio, fechaFinal, codigo]);
        if (HORARIO.rowCount != 0) {
            return res.jsonp(HORARIO.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'Registros no encontrados.' });
        }
    }


    // METODO PARA CONSULTAR HORARIO DEL USUARIO POR DIAS-HORAS Y NUMERO DE HORAS DE TRABAJO EN EL MISMO DIA (MD)
    public async ObtenerHorarioHorasMD(req: Request, res: Response) {
        let { codigo, fecha_inicio, hora_inicio, hora_final } = req.body;

        // CONSULTA DE HORARIO DEL USUARIO INGRESO = SALIDA
        let CASO_1 = await pool.query(
            `
            SELECT * FROM vista_horario_entrada AS he
            JOIN vista_horario_salida AS hs ON he.codigo = hs.codigo AND he.fecha_entrada = hs.fecha_salida 
                AND he.id_horario = hs.id_horario AND salida_otro_dia = 0 AND he.codigo = $1
				AND he.fecha_entrada = $2
                AND (($3 BETWEEN hora_inicio AND hora_final) AND ($4 BETWEEN hora_inicio AND hora_final))
            `
            , [codigo, fecha_inicio, hora_inicio, hora_final])
            .then((result: any) => { return result.rows });

        if (CASO_1.length === 0) {

            // CONSULTA DE HORARIO DEL USUARIO INGRESO != SALIDA (SEGUNDO DIA)
            let CASO_2 = await pool.query(
                `
                SELECT * FROM vista_horario_entrada AS he
                JOIN vista_horario_salida AS hs ON he.codigo = hs.codigo 
                    AND hs.fecha_salida = (he.fecha_entrada + interval '1 day')
                    AND he.id_horario = hs.id_horario AND salida_otro_dia = 1 AND he.codigo = $1
                    AND ($2 = he.fecha_entrada OR $2 = hs.fecha_salida)
                `
                , [codigo, fecha_inicio])
                .then((result: any) => { return result.rows });

            if (CASO_2.length === 0) {

                // CONSULTA DE HORARIO DEL USUARIO INGRESO != SALIDA (TERCER DIA)
                let CASO_3 = await pool.query(
                    `
                    SELECT * FROM vista_horario_entrada AS he
                    JOIN vista_horario_salida AS hs ON he.codigo = hs.codigo 
			            AND hs.fecha_salida = (he.fecha_entrada + interval '2 day')
                        AND he.id_horario = hs.id_horario AND salida_otro_dia = 2 AND he.codigo = $1
                        AND ($2 = he.fecha_entrada OR $2 = hs.fecha_salida OR $2= (he.fecha_entrada + interval '1 day'))
                `
                    , [codigo, fecha_inicio])
                    .then((result: any) => { return result.rows });

                if (CASO_3.length === 0) {
                    return res.status(404).jsonp({ message: 'No se han encontrado registros.' });
                }
                else {
                    return res.status(200).jsonp({ message: 'CASO_3', respuesta: CASO_3 });
                }

            }
            else {
                return res.status(200).jsonp({ message: 'CASO_2', respuesta: CASO_2 });
            }
        }
        else {
            return res.status(200).jsonp({ message: 'CASO_1', respuesta: CASO_1 });
        }
    }

    // METODO PARA CONSULTAR HORARIO DEL USUARIO POR DIAS-HORAS Y NUMERO DE HORAS DE TRABAJO EN DIAS DIFERENTES (DD)
    public async ObtenerHorarioHorasDD(req: Request, res: Response) {
        let { codigo, fecha_inicio, fecha_final } = req.body;

        // CONSULTA DE HORARIO DEL USUARIO INGRESO = SALIDA
        let CASO_4 = await pool.query(
            `
            SELECT * FROM vista_horario_entrada AS he
            JOIN vista_horario_salida AS hs ON he.codigo = hs.codigo 
			    AND hs.fecha_salida = (he.fecha_entrada + interval '1 day')
                AND he.id_horario = hs.id_horario AND salida_otro_dia = 1 AND he.codigo = $1
				AND $2 = he.fecha_entrada AND $3 = hs.fecha_salida
            `
            , [codigo, fecha_inicio, fecha_final])
            .then((result: any) => { return result.rows });

        if (CASO_4.length === 0) {

            // CONSULTA DE HORARIOS MAYORES O IGUALES A 48 HORAS
            let CASO_5 = await pool.query(
                `
                SELECT * FROM vista_horario_entrada AS he
                JOIN vista_horario_salida AS hs ON he.codigo = hs.codigo 
			        AND hs.fecha_salida = (he.fecha_entrada + interval '2 day')
                    AND he.id_horario = hs.id_horario AND salida_otro_dia = 2 AND he.codigo = $1
                    AND ($2 = he.fecha_entrada OR $2 = (he.fecha_entrada + interval '1 day')) 
                    AND ($3 = hs.fecha_salida OR $3 = (he.fecha_entrada + interval '1 day'))
                `
                , [codigo, fecha_inicio, fecha_final])
                .then((result: any) => { return result.rows });

            if (CASO_5.length === 0) {
                return res.status(404).jsonp({ message: 'No se han encontrado registros.' });
            }
            else {
                return res.status(200).jsonp({ message: 'CASO_5', respuesta: CASO_5 });
            }
        }
        else {
            return res.status(200).jsonp({ message: 'CASO_4', respuesta: CASO_4 });
        }
    }

    // METODO PARA BUSCAR HORAS DE ALIMENTACION EN EL MISMO DIA (MD)
    public async ObtenerComidaHorarioHorasMD(req: Request, res: Response) {
        let { codigo, fecha_inicio, hora_inicio, hora_final } = req.body;

        // CONSULTA DE HORARIO DEL USUARIO INGRESO = SALIDA
        let CASO_1 = await pool.query(
            `
            SELECT * FROM vista_comida_inicio AS ci
            JOIN vista_comida_fin AS cf ON ci.codigo = cf.codigo AND ci.fecha_entrada = cf.fecha_salida 
                AND ci.id_horario = cf.id_horario AND salida_otro_dia = 0 AND ci.codigo = $1
                AND ci.fecha_entrada = $2
                AND (($3 BETWEEN hora_inicio AND hora_final) OR ($4 BETWEEN hora_inicio AND hora_final))
            `
            , [codigo, fecha_inicio, hora_inicio, hora_final])
            .then((result: any) => { return result.rows });

        if (CASO_1.length === 0) {

            // CONSULTA DE HORARIO DEL USUARIO INGRESO != SALIDA (SEGUNDO DIA)
            let CASO_2 = await pool.query(
                `
                SELECT * FROM vista_comida_inicio AS ci
                JOIN vista_comida_fin AS cf ON ci.codigo = cf.codigo 
                    AND cf.fecha_salida = (ci.fecha_entrada + interval '1 day')
                    AND ci.id_horario = cf.id_horario AND salida_otro_dia = 1 AND ci.codigo = $1
                    AND ($2 = ci.fecha_entrada OR $2 = cf.fecha_salida)
                `
                , [codigo, fecha_inicio])
                .then((result: any) => { return result.rows });

            if (CASO_2.length === 0) {
                return res.status(404).jsonp({ message: 'No se han encontrado registros.' });
            }
            else {
                return res.status(200).jsonp({ message: 'CASO_2', respuesta: CASO_2 });
            }
        }
        else {
            return res.status(200).jsonp({ message: 'CASO_1', respuesta: CASO_1 });
        }
    }

    // METODO PARA CONSULTAR MINUTOS DE ALIMENTACION EN DIAS DIFERENTES (DD)
    public async ObtenerComidaHorarioHorasDD(req: Request, res: Response) {
        let { codigo, fecha_inicio, fecha_final } = req.body;

        // CONSULTA DE HORARIO DEL USUARIO INGRESO != SALIDA
        let CASO_4 = await pool.query(
            `
            SELECT * FROM vista_comida_inicio AS ci
            JOIN vista_comida_fin AS cf ON ci.codigo = cf.codigo 
                AND cf.fecha_salida = (ci.fecha_entrada + interval '1 day')
                AND ci.id_horario = cf.id_horario AND salida_otro_dia = 1 AND ci.codigo = $1
                AND $2 = ci.fecha_entrada AND $3 = cf.fecha_salida
            `
            , [codigo, fecha_inicio, fecha_final])
            .then((result: any) => { return result.rows });

        if (CASO_4.length === 0) {
            return res.status(404).jsonp({ message: 'No se han encontrado registros.' });
        }
        else {
            return res.status(200).jsonp({ message: 'CASO_4', respuesta: CASO_4 });
        }
    }

    // VERIFICAR EXISTENCIA DE PLANIFICACION   --**VERIFICADO
    public async VerificarFechasHorario(req: Request, res: Response): Promise<any> {
        const { fechaInicio, fechaFinal, id_horario } = req.body;
        const { codigo } = req.params;
        const HORARIO = await pool.query(
            `
            SELECT id FROM eu_asistencia_general 
            WHERE codigo = $3 AND id_horario = $4 AND
                (fecha_horario BETWEEN $1 AND $2) LIMIT 4
            `
            , [fechaInicio, fechaFinal, codigo, id_horario]);
        if (HORARIO.rowCount != 0) {
            return res.jsonp(HORARIO.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'Registros no encontrados' });
        }
    }














    /** Verificar que los datos de la plantilla no se encuentren duplicados */
    public async VerificarPlantilla_HorarioEmpleado(req: Request, res: Response) {
        let list: any = req.files;
        let cadena = list.uploads[0].path;
        let filename = cadena.split("\\")[1];
        var filePath = `./plantillas/${filename}`
        const workbook = excel.readFile(filePath);
        const sheet_name_list = workbook.SheetNames;
        const plantilla = excel.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);
        var contarDatosData = 0;
        var contarFechas = 0;
        var contador_arreglo = 1;
        var arreglos_datos: any = [];
        //Leer la plantilla para llenar un array con los datos cedula y usuario para verificar que no sean duplicados
        plantilla.forEach(async (data: any) => {
            // Datos que se leen de la plantilla ingresada
            const { fecha_inicio, fecha_final, lunes, martes, miercoles, jueves, viernes, sabado, domingo, nombre_horario, estado } = data;
            let datos_array = {
                fec_inicio: fecha_inicio,
                fec_final: fecha_final,
                horario: nombre_horario
            }
            arreglos_datos.push(datos_array);
        });
        function compare(a: any, b: any) {
            var inicio_1 = new Date(a.fec_inicio.split('/')[2] + '-' + a.fec_inicio.split('/')[1] + '-' + a.fec_inicio.split('/')[0] + 'T00:00:00');
            var inicio_2 = new Date(b.fec_inicio.split('/')[2] + '-' + b.fec_inicio.split('/')[1] + '-' + b.fec_inicio.split('/')[0] + 'T00:00:00');
            if (Date.parse(moment(inicio_1).format('YYYY-MM-DD')) < Date.parse(moment(inicio_2).format('YYYY-MM-DD'))) {
                return -1;
            }
            if (Date.parse(moment(inicio_1).format('YYYY-MM-DD')) > Date.parse(moment(inicio_2).format('YYYY-MM-DD'))) {
                return 1;
            }
            return 0;
        }
        arreglos_datos.sort(compare);

        // Vamos a verificar dentro de arreglo_datos que no se encuentren datos duplicados
        for (var i = 0; i <= arreglos_datos.length - 1; i++) {
            for (var j = 0; j <= arreglos_datos.length - 1; j++) {

                if (arreglos_datos[i].horario.toUpperCase() === arreglos_datos[j].horario.toUpperCase() &&
                    arreglos_datos[i].fec_inicio === arreglos_datos[j].fec_inicio &&
                    arreglos_datos[i].fec_final === arreglos_datos[j].fec_final) {
                    contarDatosData = contarDatosData + 1;
                }

                if (j > i) {
                    var inicio_1 = new Date(arreglos_datos[i].fec_inicio.split('/')[2] + '-' + arreglos_datos[i].fec_inicio.split('/')[1] + '-' + arreglos_datos[i].fec_inicio.split('/')[0] + 'T00:00:00');
                    var inicio_2 = new Date(arreglos_datos[j].fec_inicio.split('/')[2] + '-' + arreglos_datos[j].fec_inicio.split('/')[1] + '-' + arreglos_datos[j].fec_inicio.split('/')[0] + 'T00:00:00');
                    var final_1 = new Date(arreglos_datos[i].fec_final.split('/')[2] + '-' + arreglos_datos[i].fec_final.split('/')[1] + '-' + arreglos_datos[i].fec_final.split('/')[0] + 'T00:00:00');

                    console.log('if', Date.parse(moment(inicio_1).format('YYYY-MM-DD')), Date.parse(moment(inicio_2).format('YYYY-MM-DD')),
                        Date.parse(moment(final_1).format('YYYY-MM-DD')))
                    if (Date.parse(moment(inicio_1).format('YYYY-MM-DD')) <= Date.parse(moment(inicio_2).format('YYYY-MM-DD')) &&
                        Date.parse(moment(inicio_2).format('YYYY-MM-DD')) > Date.parse(moment(final_1).format('YYYY-MM-DD'))) {
                    }
                    else {
                        if (arreglos_datos[i].horario.toUpperCase() === arreglos_datos[j].horario.toUpperCase()) {
                            contarFechas = contarFechas + 1;
                        }
                    }
                }
            }
            if (contarFechas != 0) {
                // break;
                console.log('conto 1')
            }
            contador_arreglo = contador_arreglo + 1;
        }

        console.log('intermedios', contarFechas)

        if (contarFechas != 0) {
            return res.jsonp({ message: 'error' });
        }
        else {
            if (contarDatosData === plantilla.length) {
                return res.jsonp({ message: 'correcto' });
            } else {
                return res.jsonp({ message: 'error' });
            }

        }
        fs.unlinkSync(filePath);
    }


    /** Crear Planificacion General con los datos de la plantilla ingresada */
    public async CrearPlanificacionGeneral(req: Request, res: Response) {
        let list: any = req.files;
        let cadena = list.uploads[0].path;
        let filename = cadena.split("\\")[1];
        var filePath = `./plantillas/${filename}`
        const workbook = excel.readFile(filePath);
        const sheet_name_list = workbook.SheetNames;
        const plantilla = excel.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);
        var arrayDetalles: any = [];
        //Leer la plantilla para llenar un array con los datos cedula y usuario para verificar que no sean duplicados
        plantilla.forEach(async (data: any) => {
            const { id } = req.params;
            const { codigo } = req.params;
            // Datos que se leen de la plantilla ingresada
            const { fecha_inicio, fecha_final, lunes, martes, miercoles, jueves, viernes, sabado, domingo, nombre_horario, estado } = data;

            const HORARIO = await pool.query(
                `
                SELECT id FROM eh_cat_horarios WHERE UPPER(nombre) = $1
                `
                , [nombre_horario.toUpperCase()]);

            const CARGO = await pool.query(
                `
                SELECT MAX(ec.id) FROM eu_empleado_cargos AS ec, eu_empleado_contratos AS ce, eu_empleados AS e 
                WHERE ce.id_empleado = e.id AND ec.id_contrato = ce.id AND e.id = $1
                `
                , [id]);

            // Detalle de horario
            const DETALLES = await pool.query(
                `
                SELECT * FROM eh_detalle_horarios WHERE id_horario = $1
                `
                , [HORARIO.rows[0]['id']]);
            arrayDetalles = DETALLES.rows;
            var fechasHorario = []; // Array que contiene todas las fechas del mes indicado 

            // Inicializar datos de fecha
            var start = new Date(fecha_inicio.split('/')[2] + '-' + fecha_inicio.split('/')[1] + '-' + fecha_inicio.split('/')[0] + 'T00:00:00');
            var end = new Date(fecha_final.split('/')[2] + '-' + fecha_final.split('/')[1] + '-' + fecha_final.split('/')[0] + 'T00:00:00');

            // Lógica para obtener el nombre de cada uno de los día del periodo indicado
            while (start <= end) {
                fechasHorario.push(moment(start).format('YYYY-MM-DD'));
                var newDate = start.setDate(start.getDate() + 1);
                start = new Date(newDate);
            }
            fechasHorario.map(obj => {
                arrayDetalles.map(async (element: any) => {
                    var accion = 0;
                    if (element.tipo_accion === 'E') {
                        accion = element.tolerancia;
                    }
                    var estado = null;
                    await pool.query(
                        `
                        INSERT INTO eu_asistencia_general (fecha_hora_horario, tolerancia, estado, id_detalle_horario,
                            fecha_horario, id_empleado_cargo, tipo_accion, codigo, id_horario) 
                        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                        `
                        , [obj + ' ' + element.hora, accion, estado, element.id,
                            obj, CARGO.rows[0]['max'], element.tipo_accion, codigo, HORARIO.rows[0]['id']]);
                })
            })
            return res.jsonp({ message: 'correcto' });
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

export const EMPLEADO_HORARIOS_CONTROLADOR = new EmpleadoHorariosControlador();

export default EMPLEADO_HORARIOS_CONTROLADOR;

