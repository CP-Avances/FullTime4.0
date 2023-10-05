import { Request, Response } from 'express';
import { QueryResult } from 'pg';
import pool from '../../../database';
import path from 'path';
import fs from 'fs';
import moment from 'moment';
import { ObtenerRutaContrato } from '../../../libs/accesoCarpetas';

class ContratoEmpleadoControlador {

    // REGISTRAR CONTRATOS
    public async CrearContrato(req: Request, res: Response): Promise<Response> {
        const { id_empleado, fec_ingreso, fec_salida, vaca_controla, asis_controla,
            id_regimen, id_tipo_contrato } = req.body;

        const response: QueryResult = await pool.query(
            `
            INSERT INTO empl_contratos (id_empleado, fec_ingreso, fec_salida, vaca_controla, 
            asis_controla, id_regimen, id_tipo_contrato) 
            VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *
            `,
            [id_empleado, fec_ingreso, fec_salida, vaca_controla, asis_controla, id_regimen,
                id_tipo_contrato]);

        const [contrato] = response.rows;

        if (contrato) {
            return res.status(200).jsonp(contrato)
        }
        else {
            return res.status(404).jsonp({ message: 'error' })
        }
    }

    // METODO PARA GUARDAR DOCUMENTO
    public async GuardarDocumentoContrato(req: Request, res: Response): Promise<void> {

        // FECHA DEL SISTEMA
        var fecha = moment();
        var anio = fecha.format('YYYY');
        var mes = fecha.format('MM');
        var dia = fecha.format('DD');

        let id = req.params.id;

        const response: QueryResult = await pool.query(
            `
            SELECT codigo FROM empleados AS e, empl_contratos AS c WHERE c.id = $1 AND c.id_empleado = e.id
            `
            , [id]);

        const [empleado] = response.rows;

        let documento = empleado.codigo + '_' + anio + '_' + mes + '_' + dia + '_' + req.file?.originalname;

        await pool.query(
            `
            UPDATE empl_contratos SET documento = $2 WHERE id = $1
            `
            , [id, documento]);

        res.jsonp({ message: 'Documento actualizado.' });
    }

    // METODO PARA VER DOCUMENTO
    public async ObtenerDocumento(req: Request, res: Response): Promise<any> {
        const docs = req.params.docs;
        const id = req.params.id;
        let separador = path.sep;
        let ruta = await ObtenerRutaContrato(id) + separador + docs;
        res.sendFile(path.resolve(ruta));
    }


    // METODO PARA LISTAR CONTRATOS POR ID DE EMPLEADO
    public async BuscarContratoEmpleado(req: Request, res: Response): Promise<any> {
        const { id_empleado } = req.params;
        const CONTRATO_EMPLEADO_REGIMEN = await pool.query(
            `
            SELECT ec.id, ec.fec_ingreso, ec.fec_salida FROM empl_contratos AS ec
            WHERE ec.id_empleado = $1 ORDER BY ec.id ASC
            `
            , [id_empleado]);
        if (CONTRATO_EMPLEADO_REGIMEN.rowCount > 0) {
            return res.jsonp(CONTRATO_EMPLEADO_REGIMEN.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'Registro no encontrado.' });
        }
    }

    // EDITAR DATOS DE CONTRATO
    public async EditarContrato(req: Request, res: Response): Promise<any> {
        const { id } = req.params;
        const { fec_ingreso, fec_salida, vaca_controla, asis_controla, id_regimen,
            id_tipo_contrato } = req.body;
        await pool.query(
            `
            UPDATE empl_contratos SET fec_ingreso = $1, fec_salida = $2, vaca_controla = $3,
            asis_controla = $4, id_regimen = $5, id_tipo_contrato = $6 
            WHERE id = $7
            `
            , [fec_ingreso, fec_salida, vaca_controla, asis_controla, id_regimen,
                id_tipo_contrato, id]);

        res.jsonp({ message: 'Registro actualizado exitosamente.' });
    }

    // ELIMINAR DOCUMENTO CONTRATO BASE DE DATOS - SERVIDOR
    public async EliminarDocumento(req: Request, res: Response): Promise<void> {
        let { documento, id } = req.body;
        let separador = path.sep;

        const response: QueryResult = await pool.query(
            `
            UPDATE empl_contratos SET documento = null WHERE id = $1 RETURNING *
            `
            , [id]);

        const [contrato] = response.rows;

        if (documento != 'null' && documento != '' && documento != null) {
            let ruta = await ObtenerRutaContrato(contrato.id_empleado) + separador + documento;
            fs.unlinkSync(ruta);
        }

        res.jsonp({ message: 'Documento actualizado.' });
    }

    // ELIMINAR DOCUMENTO CONTRATO DEL SERVIDOR
    public async EliminarDocumentoServidor(req: Request, res: Response): Promise<void> {
        let { documento, id } = req.body;
        let separador = path.sep;
        if (documento != 'null' && documento != '' && documento != null) {
            let ruta = await ObtenerRutaContrato(id) + separador + documento;
            fs.unlinkSync(ruta);
        }
        res.jsonp({ message: 'Documento actualizado.' });
    }

    // METODO PARA BUSCAR ID ACTUAL
    public async EncontrarIdContratoActual(req: Request, res: Response): Promise<any> {
        const { id_empleado } = req.params;
        const CONTRATO = await pool.query(
            `
            SELECT MAX(ec.id) FROM empl_contratos AS ec, empleados AS e 
            WHERE ec.id_empleado = e.id AND e.id = $1
            `
            , [id_empleado]);
        if (CONTRATO.rowCount > 0) {
            if (CONTRATO.rows[0]['max'] != null) {
                return res.jsonp(CONTRATO.rows)
            }
            else {
                return res.status(404).jsonp({ text: 'Registro no encontrado' });
            }
        }
        else {
            return res.status(404).jsonp({ text: 'Registro no encontrado' });
        }
    }

    // METODO PARA BUSCAR DATOS DE CONTRATO POR ID 
    public async EncontrarDatosUltimoContrato(req: Request, res: Response): Promise<any> {
        const { id } = req.params;
        const CONTRATO = await pool.query(
            `
            SELECT ec.id, ec.id_empleado, ec.id_regimen, ec.fec_ingreso, ec.fec_salida, ec.vaca_controla,
                ec.asis_controla, ec.documento, ec.id_tipo_contrato, cr.descripcion, 
                cr.mes_periodo, mt.descripcion AS nombre_contrato 
            FROM empl_contratos AS ec, cg_regimenes AS cr, modal_trabajo AS mt 
            WHERE ec.id = $1 AND ec.id_regimen = cr.id AND mt.id = ec.id_tipo_contrato
            `
            , [id]);
        if (CONTRATO.rowCount > 0) {
            return res.jsonp(CONTRATO.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'Registro no encontrado.' });
        }
    }

    // METODO PARA BUSCAR FECHAS DE CONTRATOS    --**VERIFICADO
    public async EncontrarFechaContrato(req: Request, res: Response): Promise<any> {
        const { id_empleado } = req.body;
        const FECHA = await pool.query(
            `
            SELECT ca.id_contrato, ec.fec_ingreso
            FROM datos_contrato_actual AS ca, empl_contratos AS ec
            WHERE ca.id = $1 AND ec.id = ca.id_contrato
            `
            , [id_empleado]);
        if (FECHA.rowCount > 0) {
            return res.jsonp(FECHA.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'Registro no encontrado.' });
        }
    }


    /** **************************************************************************** ** 
     ** **          METODOS PARA LA TABLA MODAL_TRABAJO O TIPO DE CONTRATOS       ** **
     ** **************************************************************************** **/

    // LISTAR TIPOS DE MODALIDAD DE TRABAJO
    public async ListarTiposContratos(req: Request, res: Response) {
        const CONTRATOS = await pool.query(
            `
            SELECT * FROM modal_trabajo
            `
        );
        if (CONTRATOS.rowCount > 0) {
            return res.jsonp(CONTRATOS.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'No se encuentran registros.' });
        }
    }

    // REGISTRAR MODALIDAD DE TRABAJO
    public async CrearTipoContrato(req: Request, res: Response): Promise<Response> {
        const { descripcion } = req.body;

        const response: QueryResult = await pool.query(
            `
            INSERT INTO modal_trabajo (descripcion) VALUES ($1) RETURNING *
            `,
            [descripcion]);


        const [contrato] = response.rows;

        if (contrato) {
            return res.status(200).jsonp(contrato)
        }
        else {
            return res.status(404).jsonp({ message: 'error' })
        }

    }












    public async ListarContratos(req: Request, res: Response) {
        const CONTRATOS = await pool.query('SELECT * FROM empl_contratos');
        if (CONTRATOS.rowCount > 0) {
            return res.jsonp(CONTRATOS.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'No se encuentran registros' });
        }
    }

    public async ObtenerUnContrato(req: Request, res: Response) {
        const id = req.params.id;
        const CONTRATOS = await pool.query('SELECT * FROM empl_contratos WHERE id = $1', [id]);
        if (CONTRATOS.rowCount > 0) {
            return res.jsonp(CONTRATOS.rows[0])
        }
        else {
            return res.status(404).jsonp({ text: 'No se encuentran registros' });
        }
    }



    public async EncontrarIdContrato(req: Request, res: Response): Promise<any> {
        const { id_empleado } = req.params;
        const CONTRATO = await pool.query('SELECT ec.id FROM empl_contratos AS ec, empleados AS e WHERE ec.id_empleado = e.id AND e.id = $1 ORDER BY ec.fec_ingreso DESC ', [id_empleado]);
        if (CONTRATO.rowCount > 0) {
            return res.jsonp(CONTRATO.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'Registro no encontrado' });
        }
    }







    public async EncontrarFechaContratoId(req: Request, res: Response): Promise<any> {
        const { id_contrato } = req.body;
        const FECHA = await pool.query('SELECT contrato.fec_ingreso FROM empl_contratos AS contrato ' +
            'WHERE contrato.id = $1', [id_contrato]);
        if (FECHA.rowCount > 0) {
            return res.jsonp(FECHA.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'Registro no encontrado' });
        }
    }

}

const CONTRATO_EMPLEADO_CONTROLADOR = new ContratoEmpleadoControlador();

export default CONTRATO_EMPLEADO_CONTROLADOR;