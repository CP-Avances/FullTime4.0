import AUDITORIA_CONTROLADOR from '../auditoria/auditoriaControlador';
import { Request, Response } from 'express';
import pool from '../../database';
import excel from 'xlsx';
import fs from 'fs';

class CargaMultipleControlador {

    public async CargaMultiple(req: Request, res: Response): Promise<void> {
        // TODO ANALIZAR COMO OBTENER DESDE EL FRONT EL USERNAME Y LA IP
        let list: any = req.files;
        let cadena = list.uploads[0].path;
        let filename = cadena.split("\\")[1];
        var filePath = `./plantillas/${filename}`

        const workbook = excel.readFile(filePath);
        const sheet_name_list = workbook.SheetNames; // Array de hojas de calculo
        const empleado = excel.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);
        const plan = excel.utils.sheet_to_json(workbook.Sheets[sheet_name_list[1]]);
        const detalle = excel.utils.sheet_to_json(workbook.Sheets[sheet_name_list[2]]);

        const user_name = '', ip = '';

        // RECORRER POR LA LISTA DE CADA UNO DE LOS EMPLEADOS
        empleado.forEach(async (data: any) => {
            const { cedula_empleado } = data;

            // BUSCAR EL ID DEL EMPLEADO
            const id_empleado = await pool.query('SELECT id FROM empleados WHERE cedula = $1', [cedula_empleado]);
            // BUSCAR EL ID_CARGO ACTUAL DEL EMPLEADO
            const id_cargo_empleado = await pool.query('SELECT MAX(e_cargo.id) ' +
                'FROM empl_cargos AS e_cargo, empl_contratos AS contrato_e, empleados AS e ' +
                'WHERE contrato_e.id_empleado = e.id AND e_cargo.id_empl_contrato = contrato_e.id ' +
                'AND e.id = $1', [id_empleado.rows[0]['id']]);

            // REGISTRAR PLANIFICACION DE HORARIO AL EMPLEADO   
            plan.forEach(async (data2: any) => {
                try {
                    const { fecha_inicio, fecha_final } = data2;

                    // INICIAR TRANSACCIÓN
                    await pool.query('BEGIN');

                    await pool.query('INSERT INTO plan_horarios ( id_cargo, fec_inicio, fec_final ) ' +
                        'VALUES ($1, $2, $3)', [id_cargo_empleado.rows[0]['max'], fecha_inicio, fecha_final]);
                    
                    // INSERTAR AUDITORIA
                    await AUDITORIA_CONTROLADOR.InsertarAuditoria({
                        tabla: 'plan_horarios',
                        usuario: user_name,
                        accion: 'I',
                        datosOriginales: '',
                        datosNuevos: `{Empleado: ${cedula_empleado}, Fecha inicio: ${fecha_inicio}, Fecha final: ${fecha_final}}`,
                        ip: ip,
                        observacion: null
                    });
    
                    // REGISTRAR DETALLE DE LA PLANIFICACIÓN DEL HORARIO
                    detalle.forEach(async (data3: any) => {
                        const { fecha, tipo_dia, horario } = data3;
                        console.log('detalle', cedula_empleado, fecha_inicio, fecha_final, fecha, tipo_dia, horario);
                        // BUSCAR EL ID DEL PLAN REGISTRADO POR EMPLEADO
                        const id_plan = await pool.query('SELECT MAX(ph.id) FROM plan_horarios AS ph ' +
                            'WHERE ph.id_cargo = $1', [id_cargo_empleado.rows[0]['max']]);
                        // BUSCAR EL ID DEL HORARIO INGRESADO
                        const id_horario = await pool.query('SELECT id FROM cg_horarios WHERE nombre = $1', [horario]);
                        // REGISTRAR LOS DETALLES DE LA PLANIFICACIÓN DEL HORARIO
                        await pool.query('INSERT INTO plan_hora_detalles ( fecha, id_plan_horario, tipo_dia, id_cg_horarios ) ' +
                            'VALUES ($1, $2, $3, $4)', [fecha, id_plan.rows[0]['max'], parseInt(tipo_dia.split('.-')[0]), id_horario.rows[0]['id']]);
                    });

                    // FINALIZAR TRANSACCIÓN
                    await pool.query('COMMIT');
                } catch (error) {
                    // REVERTIR TRANSACCIÓN
                    await pool.query('ROLLBACK');           
                }
            });
        });
        res.jsonp({ message: 'La plantilla a sido receptada' });

        fs.access(filePath, fs.constants.F_OK, (err) => {
            if (err) {
            } else {
                fs.unlinkSync(filePath);
            }
        });

    }


    // **************** verificar empl_horario
    public async CargarHorarioMultiplesEmpleados(req: Request, res: Response): Promise<void> {
        // TODO ANALIZAR COMO OBTENER DESDE EL FRONT EL USERNAME Y LA IP
        let list: any = req.files;
        let cadena = list.uploads[0].path;
        let filename = cadena.split("\\")[1];
        var filePath = `./plantillas/${filename}`

        const workbook = excel.readFile(filePath);
        const sheet_name_list = workbook.SheetNames; // ARRAY DE HOJAS DE CALCULO
        const empleados = excel.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);
        const horarios = excel.utils.sheet_to_json(workbook.Sheets[sheet_name_list[1]]);

        const user_name = '', ip = '';

        // ARREGLO DE EMPLEADOS
        empleados.forEach(async (data: any) => {
            try {
                var { cedula } = data;
                // RECORRER POR TODOS LOS EMPLEADOS Y BUSCAR EL ID DEL EMPLEADO
                const id_empleado = await pool.query('SELECT id FROM empleados WHERE cedula = $1', [cedula]);
                // BUSCAR EL ID_CARGO ACTUAL DEL EMPLEADO
                const id_cargo_empleado = await pool.query('SELECT MAX(e_cargo.id) ' +
                    'FROM empl_cargos AS e_cargo, empl_contratos AS contrato_e, empleados AS e ' +
                    'WHERE contrato_e.id_empleado = e.id AND e_cargo.id_empl_contrato = contrato_e.id ' +
                    'AND e.id = $1', [id_empleado.rows[0]['id']]);
                // ARREGLO DE HORARIO FIJO
                horarios.forEach(async (data: any) => {
                    var { fecha_inicio, fecha_final, lunes, martes, miercoles, jueves, viernes, sabado, domingo, nombre_horario, estado } = data;
                    // BUSCAR EL ID DEL HORARIO INGRESADO
                    const id_horario = await pool.query('SELECT id FROM cg_horarios WHERE nombre = $1', [nombre_horario]);
                    var id_hora = 1;

                    // INICIAR TRANSACCIÓN
                    await pool.query('BEGIN');

                    // REGISTRAR LOS DATOS DEL HORARIO FIJO DE VARIOS EMPLEADOS
                    await pool.query('INSERT INTO empl_horarios (id_empl_cargo, id_hora, fec_inicio, fec_final, ' +
                        'lunes, martes, miercoles, jueves, viernes, sabado, domingo, id_horarios, estado) ' +
                        'VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)',
                        [id_cargo_empleado.rows[0]['max'], id_hora, fecha_inicio, fecha_final, lunes, martes, miercoles, jueves, viernes, sabado, domingo, id_horario.rows[0]['id'], estado.split("-")[0]]);
                    
                    // INSERTAR AUDITORIA
                    await AUDITORIA_CONTROLADOR.InsertarAuditoria({
                        tabla: 'empl_horarios',
                        usuario: user_name,
                        accion: 'I',
                        datosOriginales: '',
                        datosNuevos: `{Empleado: ${cedula}, Fecha inicio: ${fecha_inicio}, Fecha final: ${fecha_final}, lunes: ${lunes}, martes: ${martes}, miercoles: ${miercoles}, jueves: ${jueves}, viernes: ${viernes}, sabado: ${sabado}, domingo: ${domingo}, Horario: ${nombre_horario}, Estado: ${estado}}`,
                        ip: ip,
                        observacion: null
                    });

                    // FINALIZAR TRANSACCIÓN
                    await pool.query('COMMIT');
                });
            } catch (error) {
                // REVERTIR TRANSACCIÓN
                await pool.query('ROLLBACK');    
            }
        });
        res.jsonp({ message: 'La plantilla a sido receptada' });
        
        fs.access(filePath, fs.constants.F_OK, (err) => {
            if (err) {
            } else {
                fs.unlinkSync(filePath);
            }
        });
    }

}

export const CARGA_MULTIPLE_CONTROLADOR = new CargaMultipleControlador();

export default CARGA_MULTIPLE_CONTROLADOR;