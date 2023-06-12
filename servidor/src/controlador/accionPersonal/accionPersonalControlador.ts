import { Request, Response } from 'express';
import pool from '../../database';
import { ImagenBase64LogosEmpresas } from '../../libs/ImagenCodificacion';
import fs from 'fs';

const builder = require('xmlbuilder');

class AccionPersonalControlador {

    /** TABLA TIPO_ACCION */
    public async ListarTipoAccion(req: Request, res: Response) {
        const ACCION = await pool.query('SELECT * FROM tipo_accion');
        if (ACCION.rowCount > 0) {
            return res.jsonp(ACCION.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'No se encuentran registros' });
        }
    }

    public async CrearTipoAccion(req: Request, res: Response): Promise<void> {
        const { descripcion } = req.body;
        await pool.query('INSERT INTO tipo_accion (descripcion) VALUES($1)',
            [descripcion]);
        res.jsonp({ message: 'Registro guardado' });
    }

    public async EncontrarUltimoTipoAccion(req: Request, res: Response) {
        const ACCION = await pool.query('SELECT MAX(id) AS id FROM tipo_accion');
        if (ACCION.rowCount > 0) {
            return res.jsonp(ACCION.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'No se encuentran registros' });
        }
    }

    /** TABLA CARGO_PROPUESTO */
    public async ListarCargoPropuestos(req: Request, res: Response) {
        const ACCION = await pool.query('SELECT * FROM cargo_propuesto');
        if (ACCION.rowCount > 0) {
            return res.jsonp(ACCION.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'No se encuentran registros' });
        }
    }

    public async CrearCargoPropuesto(req: Request, res: Response): Promise<void> {
        const { descripcion } = req.body;
        await pool.query('INSERT INTO cargo_propuesto (descripcion) VALUES($1)',
            [descripcion]);
        res.jsonp({ message: 'Registro guardado' });
    }

    public async EncontrarUltimoCargoP(req: Request, res: Response) {
        const ACCION = await pool.query('SELECT MAX(id) AS id FROM cargo_propuesto');
        if (ACCION.rowCount > 0) {
            return res.jsonp(ACCION.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'No se encuentran registros' });
        }
    }

    public async ListarUnCargoPropuestos(req: Request, res: Response) {
        const { id } = req.params;
        const ACCION = await pool.query('SELECT * FROM cargo_propuesto WHERE id = $1', [id]);
        if (ACCION.rowCount > 0) {
            return res.jsonp(ACCION.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'No se encuentran registros' });
        }
    }

    /** TABLA DECRETO_ACUERDO_RESOL */
    public async ListarDecretos(req: Request, res: Response) {
        const ACCION = await pool.query('SELECT * FROM decreto_acuerdo_resol');
        if (ACCION.rowCount > 0) {
            return res.jsonp(ACCION.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'No se encuentran registros' });
        }
    }

    public async CrearDecreto(req: Request, res: Response): Promise<void> {
        const { descripcion } = req.body;
        await pool.query('INSERT INTO decreto_acuerdo_resol (descripcion) VALUES($1)',
            [descripcion]);
        res.jsonp({ message: 'Registro guardado' });
    }

    public async EncontrarUltimoDecreto(req: Request, res: Response) {
        const ACCION = await pool.query('SELECT MAX(id) AS id FROM decreto_acuerdo_resol');
        if (ACCION.rowCount > 0) {
            return res.jsonp(ACCION.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'No se encuentran registros' });
        }
    }

    public async ListarUnDecreto(req: Request, res: Response) {
        const { id } = req.params;
        const ACCION = await pool.query('SELECT * FROM decreto_acuerdo_resol WHERE id = $1', [id]);
        if (ACCION.rowCount > 0) {
            return res.jsonp(ACCION.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'No se encuentran registros' });
        }
    }

    /** TABLA TIPO_ACCION_PERSONAL */
    public async ListarTipoAccionPersonal(req: Request, res: Response) {
        const ACCION = await pool.query('SELECT tap.id, tap.id_tipo, tap.descripcion, tap.base_legal, ' +
            'tap.tipo_permiso, tap.tipo_vacacion, tap.tipo_situacion_propuesta, ta.descripcion AS nombre ' +
            'FROM tipo_accion_personal AS tap, tipo_accion AS ta WHERE ta.id = tap.id_tipo');
        if (ACCION.rowCount > 0) {
            return res.jsonp(ACCION.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'No se encuentran registros' });
        }
    }

    public async ListarTipoAccionEdicion(req: Request, res: Response) {
        const { id } = req.params;
        const ACCION = await pool.query('SELECT * FROM tipo_accion_personal WHERE NOT id_tipo = $1', [id]);
        if (ACCION.rowCount > 0) {
            return res.jsonp(ACCION.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'No se encuentran registros' });
        }
    }

    public async CrearTipoAccionPersonal(req: Request, res: Response): Promise<void> {
        const { id_tipo, descripcion, base_legal, tipo_permiso, tipo_vacacion,
            tipo_situacion_propuesta } = req.body;
        await pool.query('INSERT INTO tipo_accion_personal (id_tipo, descripcion, base_legal, tipo_permiso, ' +
            'tipo_vacacion, tipo_situacion_propuesta) VALUES($1, $2, $3, $4, $5, $6)',
            [id_tipo, descripcion, base_legal, tipo_permiso, tipo_vacacion, tipo_situacion_propuesta]);
        res.jsonp({ message: 'Autorización se registró con éxito' });
    }

    public async EncontrarTipoAccionPersonalId(req: Request, res: Response) {
        const { id } = req.params;
        const ACCION = await pool.query('SELECT tap.id, tap.id_tipo, tap.descripcion, tap.base_legal, ' +
            'tap.tipo_permiso, tap.tipo_vacacion, tap.tipo_situacion_propuesta, ta.descripcion AS nombre ' +
            'FROM tipo_accion_personal AS tap, tipo_accion AS ta WHERE tap.id = $1 AND ta.id = tap.id_tipo',
            [id]);
        if (ACCION.rowCount > 0) {
            return res.jsonp(ACCION.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'No se encuentran registros' });
        }
    }

    public async ActualizarTipoAccionPersonal(req: Request, res: Response): Promise<void> {
        const { id_tipo, descripcion, base_legal, tipo_permiso, tipo_vacacion, tipo_situacion_propuesta, id } = req.body;
        await pool.query('UPDATE tipo_accion_personal SET id_tipo = $1, descripcion = $2, base_legal = $3, ' +
            'tipo_permiso = $4, tipo_vacacion = $5, tipo_situacion_propuesta = $6 WHERE id = $7',
            [id_tipo, descripcion, base_legal, tipo_permiso, tipo_vacacion, tipo_situacion_propuesta, id]);
        res.jsonp({ message: 'Registro exitoso' });
    }

    public async EliminarTipoAccionPersonal(req: Request, res: Response): Promise<void> {
        const id = req.params.id;
        await pool.query('DELETE FROM tipo_accion_personal WHERE id = $1', [id]);
        res.jsonp({ message: 'Registro eliminado.' });
    }

    /** TABLA ACCION_PERSONAL_EMPLEADO */

    public async CrearPedidoAccionPersonal(req: Request, res: Response): Promise<void> {
        const { id_empleado, fec_creacion, fec_rige_desde, fec_rige_hasta, identi_accion_p, num_partida,
            decre_acue_resol, abrev_empl_uno, firma_empl_uno, abrev_empl_dos, firma_empl_dos, adicion_legal,
            tipo_accion, cargo_propuesto, proceso_propuesto, num_partida_propuesta,
            salario_propuesto, id_ciudad, id_empl_responsable,num_partida_individual, act_final_concurso,
            fec_act_final_concurso, nombre_reemp, puesto_reemp, funciones_reemp, num_accion_reemp,
            primera_fecha_reemp, posesion_notificacion, descripcion_pose_noti} = req.body;
        await pool.query('INSERT INTO accion_personal_empleado (id_empleado, fec_creacion, fec_rige_desde, ' +
            'fec_rige_hasta, identi_accion_p, num_partida, decre_acue_resol, abrev_empl_uno, firma_empl_uno, ' +
            'abrev_empl_dos, firma_empl_dos, adicion_legal, tipo_accion, cargo_propuesto, ' +
            'proceso_propuesto, num_partida_propuesta, salario_propuesto, id_ciudad, id_empl_responsable, ' +
            'num_partida_individual, act_final_concurso, fec_act_final_concurso, nombre_reemp, puesto_reemp, ' +
            'funciones_reemp, num_accion_reemp, primera_fecha_reemp, posesion_notificacion, descripcion_pose_noti) ' +
            'VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, ' +
            '$20, $21, $22, $23, $24, $25, $26, $27, $28, $29)',
            [id_empleado, fec_creacion, fec_rige_desde, fec_rige_hasta, identi_accion_p, num_partida,
                decre_acue_resol, abrev_empl_uno, firma_empl_uno, abrev_empl_dos, firma_empl_dos, adicion_legal,
                tipo_accion, cargo_propuesto, proceso_propuesto, num_partida_propuesta,
                salario_propuesto, id_ciudad, id_empl_responsable,num_partida_individual, act_final_concurso, fec_act_final_concurso,
                nombre_reemp, puesto_reemp, funciones_reemp, num_accion_reemp, primera_fecha_reemp, posesion_notificacion, descripcion_pose_noti]);
        res.jsonp({ message: 'Registro realizado con éxito' });
    }

    public async ActualizarPedidoAccionPersonal(req: Request, res: Response): Promise<void> {
        const { id_empleado, fec_creacion, fec_rige_desde, fec_rige_hasta, identi_accion_p, num_partida,
            decre_acue_resol, abrev_empl_uno, firma_empl_uno, abrev_empl_dos, firma_empl_dos, adicion_legal,
            tipo_accion, cargo_propuesto, proceso_propuesto, num_partida_propuesta,
            salario_propuesto, id_ciudad, id_empl_responsable,num_partida_individual, act_final_concurso,
            fec_act_final_concurso, nombre_reemp, puesto_reemp, funciones_reemp, num_accion_reemp,
            primera_fecha_reemp, posesion_notificacion, descripcion_pose_noti, id } = req.body;
        await pool.query('UPDATE accion_personal_empleado SET id_empleado = $1, fec_creacion = $2, ' +
            'fec_rige_desde = $3, fec_rige_hasta = $4, identi_accion_p = $5, num_partida = $6, ' +
            'decre_acue_resol = $7, abrev_empl_uno = $8, firma_empl_uno = $9, abrev_empl_dos = $10, ' +
            'firma_empl_dos = $11, adicion_legal = $12, tipo_accion = $13, ' +
            'cargo_propuesto = $14, proceso_propuesto = $15, num_partida_propuesta = $16, ' +
            'salario_propuesto = $17, id_ciudad = $18, id_empl_responsable = $19, num_partida_individual = $20,' +
            'act_final_concurso = $21, fec_act_final_concurso = $22, nombre_reemp = $23, puesto_reemp = $24, ' +
            'funciones_reemp = $25, num_accion_reemp = $26, primera_fecha_reemp = $27, posesion_notificacion = $28, ' + 
            'descripcion_pose_noti = $29 WHERE id = $30',
            [id_empleado, fec_creacion, fec_rige_desde, fec_rige_hasta, identi_accion_p, num_partida,
                decre_acue_resol, abrev_empl_uno, firma_empl_uno, abrev_empl_dos, firma_empl_dos, adicion_legal,
                tipo_accion, cargo_propuesto, proceso_propuesto, num_partida_propuesta,
                salario_propuesto, id_ciudad, id_empl_responsable,num_partida_individual, act_final_concurso,
                fec_act_final_concurso, nombre_reemp, puesto_reemp, funciones_reemp, num_accion_reemp,
                primera_fecha_reemp, posesion_notificacion, descripcion_pose_noti, id]);
        res.jsonp({ message: 'Registro realizado con éxito' });
    }

    public async verLogoMinisterio(req: Request, res: Response): Promise<any> {
        const file_name = 'ministerio_trabajo.png';
        const codificado = await ImagenBase64LogosEmpresas(file_name);
        if (codificado === 0) {
            res.send({ imagen: 0 })
        } else {
            res.send({ imagen: codificado })
        }
    }

    /** CONSULTAS GENERACIÓN DE PDF */
    public async EncontrarDatosEmpleados(req: Request, res: Response) {
        const { id } = req.params;
        const EMPLEADO = await pool.query('SELECT d.id, d.nombre, d.apellido, d.cedula, d.codigo, d.id_cargo, ' +
            'ec.sueldo, tc.cargo, cd.nombre AS departamento ' +
            'FROM datos_actuales_empleado AS d, empl_cargos AS ec, tipo_cargo AS tc, cg_departamentos AS cd ' +
            'WHERE d.id_cargo = ec.id AND ec.cargo = tc.id AND ec.id_departamento = cd.id AND d.id = $1',
            [id]);
        if (EMPLEADO.rowCount > 0) {
            return res.jsonp(EMPLEADO.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'No se encuentran registros' });
        }
    }

    public async EncontrarDatosCiudades(req: Request, res: Response){
        const {id} = req.params;
        const CIUDAD = await pool.query('SELECT * FROM ciudades where id = $1',[id]);
        if (CIUDAD.rowCount > 0) {
            return res.json(CIUDAD.rows)
        } else {
            return res.status(404).jsonp({ text: 'No se encuentran registros' });
        }
    }

    public async EncontrarPedidoAccion(req: Request, res: Response) {
        const { id } = req.params;
        const ACCION = await pool.query('SELECT ap.id, ap.id_empleado, ap.fec_creacion, ap.fec_rige_desde, ' +
            'ap.fec_rige_hasta, ap.identi_accion_p, ap.num_partida, ap.decre_acue_resol, ap.abrev_empl_uno, ' +
            'ap.firma_empl_uno, ap.abrev_empl_dos, ap.firma_empl_dos, ap.adicion_legal, ap.tipo_accion, ' +
            'ap.cargo_propuesto, ap.proceso_propuesto, ap.num_partida_propuesta, ' +
            'ap.salario_propuesto, ap.id_ciudad, ap.id_empl_responsable, ap.num_partida_individual, ' +
            'ap.act_final_concurso, ap.fec_act_final_concurso, ap.nombre_reemp, ap.puesto_reemp, ' +
            'ap.funciones_reemp, ap.num_accion_reemp, ap.primera_fecha_reemp, ap.posesion_notificacion, ' +
            'ap.descripcion_pose_noti, tap.base_legal, tap.id_tipo, ta.descripcion AS tipo ' +
            'FROM accion_personal_empleado AS ap, tipo_accion_personal AS tap, tipo_accion AS ta ' +
            'WHERE ap.tipo_accion = tap.id AND ap.id = $1 AND ta.id = tap.id_tipo',
            [id]);
        if (ACCION.rowCount > 0) {
            return res.jsonp(ACCION.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'No se encuentran registros' });
        }
    }

    public async ListarPedidoAccion(req: Request, res: Response) {
        const ACCION = await pool.query('SELECT ap.id, ap.id_empleado, ap.fec_creacion, ap.fec_rige_desde, ' +
            'ap.fec_rige_hasta, ap.identi_accion_p, ap.num_partida, ap.decre_acue_resol, ap.abrev_empl_uno, ' +
            'ap.firma_empl_uno, ap.abrev_empl_dos, ap.firma_empl_dos, ap.adicion_legal, ap.tipo_accion, ' +
            'ap.cargo_propuesto, ap.proceso_propuesto, ap.num_partida_propuesta, ' +
            'ap.salario_propuesto, ap.id_ciudad, ap.id_empl_responsable, ap.num_partida_individual, ' +
            'ap.act_final_concurso, ap.fec_act_final_concurso, ap.nombre_reemp, ap.puesto_reemp, ' +
            'ap.funciones_reemp, ap.num_accion_reemp, ap.primera_fecha_reemp, ap.posesion_notificacion, ' +
            'ap.descripcion_pose_noti, tap.base_legal, tap.id_tipo, e.codigo, e.cedula, e.nombre, e.apellido ' +
            'FROM accion_personal_empleado AS ap, tipo_accion_personal AS tap, empleados AS e ' +
            'WHERE ap.tipo_accion = tap.id AND e.id = ap.id_empleado');
        if (ACCION.rowCount > 0) {
            return res.jsonp(ACCION.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'No se encuentran registros' });
        }
    }

    public async EncontrarProcesosRecursivos(req: Request, res: Response) {
        const { id } = req.params;
        const ACCION = await pool.query('WITH RECURSIVE procesos AS ( ' +
            'SELECT id, nombre, proc_padre, 1 AS numero FROM cg_procesos WHERE id = $1 ' +
            'UNION ALL ' +
            'SELECT cg.id, cg.nombre, cg.proc_padre, procesos.numero + 1 AS numero FROM cg_procesos cg ' +
            'JOIN procesos ON cg.id = procesos.proc_padre ' +
            ') SELECT UPPER(nombre) AS nombre, numero FROM procesos ORDER BY numero DESC;',
            [id]);
        if (ACCION.rowCount > 0) {
            return res.jsonp(ACCION.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'No se encuentran registros' });
        }
    }

    // METODO PARA CREAR ARCHIVO XML
    public async FileXML(req: Request, res: Response): Promise<any> {
        var xml = builder.create('root').ele(req.body).end({ pretty: true });
        console.log(req.body.userName);
        let filename = "AccionesPersonal-" + req.body.userName + '-' + req.body.userId + '-' + new Date().getTime() + '.xml';
        fs.writeFile(`xmlDownload/${filename}`, xml, function (err) {
        });
        res.jsonp({ text: 'XML creado', name: filename });
      }
    
      // METODO PARA DESCARGAR ARCHIVO XML
      public async downloadXML(req: Request, res: Response): Promise<any> {
        const name = req.params.nameXML;
        let filePath = `servidor\\xmlDownload\\${name}`
        res.sendFile(__dirname.split("servidor")[0] + filePath);
      }
    /** CONSULTA RECURSIVA DE EMPLEADOS */
}

export const ACCION_PERSONAL_CONTROLADOR = new AccionPersonalControlador();

export default ACCION_PERSONAL_CONTROLADOR;