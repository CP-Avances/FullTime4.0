import { Request, Response } from 'express';
import pool from '../../database';
import excel from 'xlsx';
import fs from 'fs';

class CargaMultipleControlador {

    public async CargaMultiple(req: Request, res: Response): Promise<void> {
        let list: any = req.files;
        let cadena = list.uploads[0].path;
        let filename = cadena.split("\\")[1];
        var filePath = `./plantillas/${filename}`

        const workbook = excel.readFile(filePath);
        const sheet_name_list = workbook.SheetNames; // Array de hojas de calculo
        const empleado = excel.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);
        const plan = excel.utils.sheet_to_json(workbook.Sheets[sheet_name_list[1]]);
        const detalle = excel.utils.sheet_to_json(workbook.Sheets[sheet_name_list[2]]);

        // Recorrer por la lista de cada uno de los empleados
        empleado.forEach(async (data: any) => {
            const { cedula_empleado } = data;
            console.log('entra_empleado', cedula_empleado);
            // Buscar el id del empleado
            const id_empleado = await pool.query('SELECT id FROM empleados WHERE cedula = $1', [cedula_empleado]);
            // Buscar el id_cargo actual del empleado
            const id_cargo_empleado = await pool.query('SELECT MAX(e_cargo.id) ' +
                'FROM empl_cargos AS e_cargo, empl_contratos AS contrato_e, empleados AS e ' +
                'WHERE contrato_e.id_empleado = e.id AND e_cargo.id_empl_contrato = contrato_e.id ' +
                'AND e.id = $1', [id_empleado.rows[0]['id']]);

            // Registrar planificacion de horario al empleado   
            plan.forEach(async (data2: any) => {
                const { fecha_inicio, fecha_final } = data2;
                console.log('horario', cedula_empleado, fecha_inicio, fecha_final);
                await pool.query('INSERT INTO plan_horarios ( id_cargo, fec_inicio, fec_final ) ' +
                    'VALUES ($1, $2, $3)', [id_cargo_empleado.rows[0]['max'], fecha_inicio, fecha_final]);

                // Registrar detalle de la planificación del horario
                detalle.forEach(async (data3: any) => {
                    const { fecha, tipo_dia, horario } = data3;
                    console.log('detalle', cedula_empleado, fecha_inicio, fecha_final, fecha, tipo_dia, horario);
                    // Buscar el id del plan registrado por empleado
                    const id_plan = await pool.query('SELECT MAX(ph.id) FROM plan_horarios AS ph ' +
                        'WHERE ph.id_cargo = $1', [id_cargo_empleado.rows[0]['max']]);
                    // Buscar el id del horario ingresado
                    const id_horario = await pool.query('SELECT id FROM cg_horarios WHERE nombre = $1', [horario]);
                    // Registrar los detalles de la planificación del horario
                    await pool.query('INSERT INTO plan_hora_detalles ( fecha, id_plan_horario, tipo_dia, id_cg_horarios ) ' +
                        'VALUES ($1, $2, $3, $4)', [fecha, id_plan.rows[0]['max'], parseInt(tipo_dia.split('.-')[0]), id_horario.rows[0]['id']]);
                });
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
        let list: any = req.files;
        let cadena = list.uploads[0].path;
        let filename = cadena.split("\\")[1];
        var filePath = `./plantillas/${filename}`

        const workbook = excel.readFile(filePath);
        const sheet_name_list = workbook.SheetNames; // Array de hojas de calculo
        const empleados = excel.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);
        const horarios = excel.utils.sheet_to_json(workbook.Sheets[sheet_name_list[1]]);

        // Arreglo de empleados
        empleados.forEach(async (data: any) => {
            var { cedula } = data;
            // Recorrer por todos los empleados y buscar el id del empleado
            const id_empleado = await pool.query('SELECT id FROM empleados WHERE cedula = $1', [cedula]);
            // Buscar el id_cargo actual del empleado
            const id_cargo_empleado = await pool.query('SELECT MAX(e_cargo.id) ' +
                'FROM empl_cargos AS e_cargo, empl_contratos AS contrato_e, empleados AS e ' +
                'WHERE contrato_e.id_empleado = e.id AND e_cargo.id_empl_contrato = contrato_e.id ' +
                'AND e.id = $1', [id_empleado.rows[0]['id']]);
            // Arreglo de horario fijo
            horarios.forEach(async (data: any) => {
                var { fecha_inicio, fecha_final, lunes, martes, miercoles, jueves, viernes, sabado, domingo, nombre_horario, estado } = data;
                // Buscar el id del horario ingresado
                const id_horario = await pool.query('SELECT id FROM cg_horarios WHERE nombre = $1', [nombre_horario]);
                var id_hora = 1;
                // Registrar los datos del horario fijo de varios empleados
                await pool.query('INSERT INTO empl_horarios (id_empl_cargo, id_hora, fec_inicio, fec_final, ' +
                    'lunes, martes, miercoles, jueves, viernes, sabado, domingo, id_horarios, estado) ' +
                    'VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)',
                    [id_cargo_empleado.rows[0]['max'], id_hora, fecha_inicio, fecha_final, lunes, martes, miercoles, jueves, viernes, sabado, domingo, id_horario.rows[0]['id'], estado.split("-")[0]]);
                console.log('Registro exitoso');
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

}

export const CARGA_MULTIPLE_CONTROLADOR = new CargaMultipleControlador();

export default CARGA_MULTIPLE_CONTROLADOR;