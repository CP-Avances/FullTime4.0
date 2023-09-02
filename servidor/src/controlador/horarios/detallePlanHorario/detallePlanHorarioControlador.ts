import { Request, Response } from 'express';
import pool from '../../../database';
import excel from 'xlsx';
import fs from 'fs';
import moment from 'moment';

class DetallePlanHorarioControlador {

    public async ListarDetallePlanHorario(req: Request, res: Response) {
        const HORARIO = await pool.query('SELECT * FROM plan_hora_detalles');
        if (HORARIO.rowCount > 0) {
            return res.jsonp(HORARIO.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'No se encuentran registros' });
        }
    }

    public async CrearDetallePlanHorario(req: Request, res: Response): Promise<void> {
        const { fecha, id_plan_horario, tipo_dia, id_cg_horarios } = req.body;
        await pool.query('INSERT INTO plan_hora_detalles ( fecha, id_plan_horario, tipo_dia, id_cg_horarios ) VALUES ($1, $2, $3, $4)', [fecha, id_plan_horario, tipo_dia, id_cg_horarios]);
        res.jsonp({ message: 'Detalle Plan Horario Registrado' });
    }

    public async EncontrarPlanHoraDetallesPorIdPlanHorario(req: Request, res: Response): Promise<any> {
        const { id_plan_horario } = req.params;
        const HORARIO_CARGO = await pool.query('SELECT p.id, p.fecha, p.id_plan_horario, p.tipo_dia, h.id AS id_horario, h.nombre AS horarios FROM plan_hora_detalles AS p, cg_horarios AS h WHERE p.id_plan_horario = $1 AND p.id_cg_horarios = h.id ', [id_plan_horario]);
        if (HORARIO_CARGO.rowCount > 0) {
            return res.jsonp(HORARIO_CARGO.rows)
        }
        res.status(404).jsonp({ text: 'Registro no encontrado' });
    }

    /** Verificar Datos de la plantilla */
    public async VerificarDatos(req: Request, res: Response): Promise<void> {
        let list: any = req.files;
        let cadena = list.uploads[0].path;
        let filename = cadena.split("\\")[1];
        var filePath = `./plantillas/${filename}`

        const workbook = excel.readFile(filePath);
        const sheet_name_list = workbook.SheetNames; // Array de hojas de calculo
        const plantilla = excel.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);

        var contarDatos = 0;
        var contarHorario = 0;
        var contarDetalles = 0;
        var contarFechas = 0;
        var contarFechasValidas = 0;
        var contador = 1;
        plantilla.forEach(async (data: any) => {
            const { id_plan_horario } = req.params;
            const { fecha_inicio_actividades, tipo_dia, nombre_horario } = data;

            // Verificar que existan los datos obligatorios
            if (fecha_inicio_actividades != undefined && tipo_dia != undefined && nombre_horario != undefined) {
                contarDatos = contarDatos + 1;

                // Verificar que exista el horario dentro del sistema
                const HORARIO = await pool.query('SELECT id FROM cg_horarios WHERE UPPER(nombre) = $1', [nombre_horario.toUpperCase()]);
                if (HORARIO.rowCount != 0) {
                    contarHorario = contarHorario + 1;

                    // Verificar que exista detalles de horario
                    const DETALLES = await pool.query('SELECT * FROM deta_horarios WHERE id_horario = $1', [parseInt(HORARIO.rows[0]['id'])]);
                    if (DETALLES.rowCount != 0) {
                        contarDetalles = contarDetalles + 1;

                        // Verificar que no exista registrado Fecha en el detalle
                        const FECHA = await pool.query('SELECT * FROM plan_hora_detalles WHERE id_plan_horario = $1 AND fecha = $2 AND ' +
                            'id_cg_horarios = $3', [id_plan_horario, fecha_inicio_actividades, parseInt(HORARIO.rows[0]['id'])]);
                        if (FECHA.rowCount === 0) {
                            contarFechas = contarFechas + 1;
                        }
                    }

                    // Verificar que la fecha se encuentre dentro de la planificación
                    const VALIDAS = await pool.query('SELECT * FROM plan_horarios WHERE ($1 BETWEEN fec_inicio AND fec_final) AND id = $2',
                        [fecha_inicio_actividades, id_plan_horario]);
                    if (VALIDAS.rowCount != 0) {
                        contarFechasValidas = contarFechasValidas + 1;
                    }
                }
            }
            if (contador === plantilla.length) {
                if (contarDatos === plantilla.length && contarHorario === plantilla.length &&
                    contarDetalles === plantilla.length && contarFechas === plantilla.length &&
                    contarFechasValidas === plantilla.length) {
                    return res.jsonp({ message: 'correcto' });
                } else {
                    return res.jsonp({ message: 'error' });
                }
            }
            contador = contador + 1;
        });
        fs.unlinkSync(filePath);
    }

    /** Verificar que los datos de la plantilla no se encuentren duplicados */
    public async VerificarPlantilla(req: Request, res: Response) {
        let list: any = req.files;
        let cadena = list.uploads[0].path;
        let filename = cadena.split("\\")[1];
        var filePath = `./plantillas/${filename}`
        const workbook = excel.readFile(filePath);
        const sheet_name_list = workbook.SheetNames;
        const plantilla = excel.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);
        var contarFechas = 0;
        var arreglos_datos: any = [];
        //Leer la plantilla para llenar un array con los datos cedula y usuario para verificar que no sean duplicados
        plantilla.forEach(async (data: any) => {
            // Datos que se leen de la plantilla ingresada
            const { fecha_inicio_actividades, tipo_dia, nombre_horario } = data;
            let datos_array = {
                fecha: fecha_inicio_actividades,
                horario: nombre_horario
            }
            arreglos_datos.push(datos_array);
        });
        // Vamos a verificar dentro de arreglo_datos que no se encuentren datos duplicados
        for (var i = 0; i <= arreglos_datos.length - 1; i++) {
            for (var j = 0; j <= arreglos_datos.length - 1; j++) {

                if (i != j) {
                    var inicio_1 = new Date(arreglos_datos[i].fecha.split('/')[2] + '-' + arreglos_datos[i].fecha.split('/')[1] + '-' + arreglos_datos[i].fecha.split('/')[0] + 'T00:00:00');
                    var inicio_2 = new Date(arreglos_datos[j].fecha.split('/')[2] + '-' + arreglos_datos[j].fecha.split('/')[1] + '-' + arreglos_datos[j].fecha.split('/')[0] + 'T00:00:00');
                    if (Date.parse(moment(inicio_1).format('YYYY-MM-DD')) != Date.parse(moment(inicio_2).format('YYYY-MM-DD'))) {
                    }
                    else {
                        if (arreglos_datos[i].horario.toUpperCase() === arreglos_datos[j].horario.toUpperCase()) {
                            contarFechas = contarFechas + 1;
                        }
                    }
                }
            }
            if (contarFechas != 0) {
                console.log('conto 1')
                break;
            }
        }
        console.log('intermedios', contarFechas)
        if (contarFechas != 0) {
            return res.jsonp({ message: 'error' });
        }
        else {
            return res.jsonp({ message: 'correcto' });
        }
        fs.unlinkSync(filePath);
    }

    public async CrearDetallePlanificacionPlantilla(req: Request, res: Response): Promise<void> {
        let list: any = req.files;
        let cadena = list.uploads[0].path;
        let filename = cadena.split("\\")[1];
        var filePath = `./plantillas/${filename}`

        const workbook = excel.readFile(filePath);
        const sheet_name_list = workbook.SheetNames; // Array de hojas de calculo
        const plantilla = excel.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);

        plantilla.forEach(async (data: any) => {
            const { id_plan_horario } = req.params;
            const { fecha_inicio_actividades, tipo_dia, nombre_horario } = data;
            const idHorario = await pool.query('SELECT id FROM cg_horarios WHERE nombre = $1', [nombre_horario]);
            await pool.query('INSERT INTO plan_hora_detalles (fecha, id_plan_horario, tipo_dia, id_cg_horarios) VALUES ($1, $2, $3, $4)',
                [fecha_inicio_actividades, id_plan_horario, tipo_dia.split(" ")[0], idHorario.rows[0]['id']]);
        });
        res.jsonp({ message: 'correcto' });
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
            const { fecha_inicio_actividades, tipo_dia, nombre_horario } = data;

            const HORARIO = await pool.query('SELECT id FROM cg_horarios WHERE UPPER(nombre) = $1', [nombre_horario.toUpperCase()]);

            const CARGO = await pool.query('SELECT MAX(ec.id) FROM empl_cargos AS ec, empl_contratos AS ce, empleados AS e ' +
                'WHERE ce.id_empleado = e.id AND ec.id_empl_contrato = ce.id AND e.id = $1', [id]);

            // Detalle de horario
            const DETALLES = await pool.query('SELECT * FROM deta_horarios WHERE id_horario = $1', [HORARIO.rows[0]['id']]);
            arrayDetalles = DETALLES.rows;

            arrayDetalles.map(async (element: any) => {
                var accion = 0;
                if (element.tipo_accion === 'E') {
                    accion = element.minu_espera;
                }
                var estado = null;
                await pool.query('INSERT INTO plan_general (fec_hora_horario, tolerancia, estado, id_det_horario, ' +
                    'fec_horario, id_empl_cargo, tipo_entr_salida, codigo, id_horario) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)',
                    [fecha_inicio_actividades + ' ' + element.hora, accion, estado, element.id,
                        fecha_inicio_actividades, CARGO.rows[0]['max'], element.tipo_accion, codigo, HORARIO.rows[0]['id']]);
            })  
        });
        res.jsonp({ message: 'correcto' });
        fs.unlinkSync(filePath);
    }

    public async ActualizarDetallePlanHorario(req: Request, res: Response): Promise<void> {
        const { fecha, id_plan_horario, tipo_dia, id_cg_horarios, id } = req.body;
        await pool.query('UPDATE plan_hora_detalles SET fecha = $1, id_plan_horario = $2, tipo_dia = $3, id_cg_horarios = $4 WHERE id = $5', [fecha, id_plan_horario, tipo_dia, id_cg_horarios, id]);
        res.jsonp({ message: 'Detalle Plan Horario Actualizado' });
    }

    public async EliminarRegistros(req: Request, res: Response): Promise<void> {
        const id = req.params.id;
        await pool.query('DELETE FROM plan_hora_detalles WHERE id = $1', [id]);
        res.jsonp({ message: 'Registro eliminado.' });
    }

    public async ObtenerRegistrosFecha(req: Request, res: Response): Promise<any> {
        const { id_plan_horario, fecha, id_horario } = req.body;
        const FECHA = await pool.query('SELECT * FROM plan_hora_detalles WHERE id_plan_horario = $1 AND fecha = $2 AND id_cg_horarios = $3', [id_plan_horario, fecha, id_horario]);
        if (FECHA.rowCount > 0) {
            return res.jsonp(FECHA.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'Registros no encontrados' });
        }
    }

    public async VerificarDuplicidadEdicion(req: Request, res: Response): Promise<any> {
        const id = req.params.id;
        const { id_plan_horario, fecha, id_horario } = req.body;
        const FECHA = await pool.query('SELECT * FROM plan_hora_detalles WHERE NOT id = $4 AND id_plan_horario = $1 ' +
            'AND fecha = $2 AND id_cg_horarios = $3',
            [id_plan_horario, fecha, id_horario, id]);
        if (FECHA.rowCount > 0) {
            return res.jsonp(FECHA.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'Registros no encontrados' });
        }
    }

}

export const DETALLE_PLAN_HORARIO_CONTROLADOR = new DetallePlanHorarioControlador();

export default DETALLE_PLAN_HORARIO_CONTROLADOR;