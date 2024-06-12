import { ObtenerIndicePlantilla, ObtenerRutaLeerPlantillas } from '../../libs/accesoCarpetas';
import { Request, Response } from 'express';
import { QueryResult } from 'pg';
import AUDITORIA_CONTROLADOR from '../auditoria/auditoriaControlador';
import fs from 'fs';
import path from 'path';
import pool from '../../database';
import excel from 'xlsx';

class TiposCargosControlador {

    // METODO PARA BUSCAR TIPO DE CARGOS POR EL NOMBRE
    public async BuscarTipoCargoNombre(req: Request, res: Response) {
        const { nombre } = req.body;
        const CARGOS = await pool.query(
            `
            SELECT * FROM e_cat_tipo_cargo WHERE UPPER(cargo) = $1
            `
            , [nombre]
        );
        if (CARGOS.rowCount > 0) {
            return res.jsonp(CARGOS.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'No se encuentran registros.' });
        }
    }

    // METODO PARA LISTAR TIPO CARGOS
    public async ListaTipoCargos(req: Request, res: Response) {
        try {
            const TIPO_CARGO = await pool.query(
                `
                SELECT * FROM e_cat_tipo_cargo ORDER BY cargo ASC
                `
            );
            if (TIPO_CARGO.rowCount > 0) {
                return res.status(200).jsonp(TIPO_CARGO.rows)
            } else {
                return res.status(404).jsonp({ text: 'No se encuentran registros.', status: '404' });
            }
        } catch (error) {
            return res.status(500).jsonp({ message: error , status: '500'});
        }
    }

    // METODO PARA REGISTRAR TIPO CARGO
    public async CrearCargo(req: Request, res: Response): Promise<Response> {
        try {
            const { cargo, user_name, ip } = req.body;
            var VERIFICAR_CARGO = await pool.query(
                `
                SELECT * FROM e_cat_tipo_cargo WHERE UPPER(cargo) = $1
                `
                , [cargo.toUpperCase()])

            if (VERIFICAR_CARGO.rows[0] == undefined || VERIFICAR_CARGO.rows[0] == '') {

                const tipoCargo = cargo.charAt(0).toUpperCase() + cargo.slice(1).toLowerCase();

                // INICIAR TRANSACCION
                await pool.query('BEGIN');

                const response: QueryResult = await pool.query(
                    `
                    INSERT INTO e_cat_tipo_cargo (cargo) VALUES ($1) RETURNING *
                    `
                    , [tipoCargo]);

                const [TipoCargos] = response.rows;

                // AUDITORIA

                await AUDITORIA_CONTROLADOR.InsertarAuditoria({
                    tabla: 'e_cat_tipo_cargo',
                    usuario: user_name,
                    accion: 'I',
                    datosOriginales: '',
                    datosNuevos: JSON.stringify(TipoCargos),
                    ip,
                    observacion: null
                });

                // FIN DE TRANSACCION
                await pool.query('COMMIT');

                if (TipoCargos) {
                    return res.status(200).jsonp({ message: 'Registro guardado.', status: '200' })
                } else {
                    return res.status(404).jsonp({ message: 'Ups!!! algo slaio mal.', status: '400' })
                }
            } else {
                return res.jsonp({ message: 'Tipo cargo ya existe en el sistema.', status: '300' })
            }
        }
        catch (error) {
            // ROLLBACK
            await pool.query('ROLLBACK');
            return res.status(500).jsonp({ message: 'error', status: '500' });
        }
    }

    // METODO PARA EDITAR TIPO CARGO
    public async EditarCargo(req: Request, res: Response): Promise<Response> {
        try {
            const { id, cargo } = req.body;
            // DAR FORMATO A LA PALABRA CARGO
            const tipoCargo = cargo.charAt(0).toUpperCase() + cargo.slice(1).toLowerCase();
            const tipoCargoExiste = await pool.query(
                `
                SELECT * FROM e_cat_tipo_cargo WHERE UPPER(cargo) = $1
                `
                , [cargo.toUpperCase()]);


            const consulta = await pool.query('SELECT * FROM e_cat_tipo_cargo WHERE id = $1', [id]);
            const [datosOriginales] = consulta.rows;
            if (!datosOriginales) {
                await AUDITORIA_CONTROLADOR.InsertarAuditoria({
                    tabla: 'et_cat_nivel_titulo',
                    usuario: req.body.user_name,
                    accion: 'U',
                    datosOriginales: '',
                    datosNuevos: '',
                    ip: req.body.ip,
                    observacion: `Error al actualizar el registro con id ${id}. No existe el registro en la base de datos.`
                });

                // FINALIZAR TRANSACCION
                await pool.query('COMMIT');
                return res.status(404).jsonp({ message: 'Registro no encontrado.' });
            }


            if (tipoCargoExiste.rows[0] != undefined && tipoCargoExiste.rows[0].cargo != '' && tipoCargoExiste.rows[0].cargo != null) {
                return res.status(200).jsonp({ message: 'Ya existe el cargo', status: '300' })
            } else {
                // INICIAR TRANSACCION
                await pool.query('BEGIN');

                const response: QueryResult = await pool.query(
                    `
                    UPDATE e_cat_tipo_cargo SET cargo = $2
                    WHERE id = $1 RETURNING *
                    `
                    , [id, tipoCargo]);

                const [TipoCargos] = response.rows;

                // AUDITORIA
                await AUDITORIA_CONTROLADOR.InsertarAuditoria({
                    tabla: 'e_cat_tipo_cargo',
                    usuario: req.body.user_name,
                    accion: 'U',
                    datosOriginales: JSON.stringify(datosOriginales),
                    datosNuevos: JSON.stringify(TipoCargos),
                    ip: req.body.ip,
                    observacion: null
                });

                // FIN DE TRANSACCION
                await pool.query('COMMIT');

                if (TipoCargos) {
                    return res.status(200).jsonp({ message: 'Registro actualizado.', status: '200' })
                } else {
                    return res.status(404).jsonp({ message: 'Ups!!! algo salio mal.', status: '400' })
                }
            }
        }
        catch (error) {
            // ROLLBACK
            await pool.query('ROLLBACK');
            return res.status(500).jsonp({ message: 'error', status: '500' });
        }
    }

    // METODO PARA ELIMINAR REGISTRO
    public async EliminarRegistro(req: Request, res: Response) {
        try {
            const id = req.params.id;
            const { user_name, ip } = req.body;

            // INICIAR TRANSACCION
            await pool.query('BEGIN');

            // CONSULTAR DATOS ANTES DE ELIMINAR
            const TIPO_CARGO = await pool.query(
                `
                SELECT * FROM e_cat_tipo_cargo WHERE id = $1
                `
                , [id]);

            const [datosTiposCargos] = TIPO_CARGO.rows;

            if (!datosTiposCargos) {
                await AUDITORIA_CONTROLADOR.InsertarAuditoria({
                    tabla: 'e_cat_tipo_cargo',
                    usuario: user_name,
                    accion: 'D',
                    datosOriginales: '',
                    datosNuevos: '',
                    ip,
                    observacion: `Error al eliminar el registro con id: ${id}. Registro no encontrado.`
                });

                // FINALIZAR TRANSACCION
                await pool.query('COMMIT');
                return res.status(404).jsonp({ message: 'No se encuentra el registro.', status: '404' });
            }
            await pool.query(
                `
                DELETE FROM e_cat_tipo_cargo WHERE id = $1
                `
                , [id]);

            // AUDITORIA
            await AUDITORIA_CONTROLADOR.InsertarAuditoria({
                tabla: 'e_cat_tipo_cargo',
                usuario: user_name,
                accion: 'D',
                datosOriginales: JSON.stringify(datosTiposCargos),
                datosNuevos: '',
                ip,
                observacion: null
            });

            // FINALIZAR TRANSACCION
            await pool.query('COMMIT');
            res.jsonp({ message: 'Registro eliminado.', code: '200' });

        } catch (error) {
            // ROLLBACK
            await pool.query('ROLLBACK');
            return res.status(500).jsonp({ message: error.detail, code: error.code });
        }
    }

    // LECTURA DE LOS DATOS DE LA PLATILLA TIPO CARGO
    public async VerfificarPlantillaTipoCargos(req: Request, res: Response) {
        try {
            const documento = req.file?.originalname;
            let separador = path.sep;
            let ruta = ObtenerRutaLeerPlantillas() + separador + documento;
            const workbook = excel.readFile(ruta);
            let verificador = ObtenerIndicePlantilla(workbook, 'TIPO_CARGO');
            if (verificador === false) {
                return res.jsonp({ message: 'no_existe', data: undefined });
            }
            else {
                const sheet_name_list = workbook.SheetNames;
                const plantilla_cargo = excel.utils.sheet_to_json(workbook.Sheets[sheet_name_list[verificador]]);
                let data: any = {
                    fila: '',
                    tipo_cargo: '',
                    observacion: ''
                };

                var listCargos: any = [];
                var duplicados: any = [];
                var mensaje: string = 'correcto';

                // LECTURA DE LOS DATOS DE LA PLANTILLA
                plantilla_cargo.forEach(async (dato: any, indice: any, array: any) => {
                    var { ITEM, CARGO } = dato;
                    // VERIFICAR QUE EL REGISTO NO TENGA DATOS VACIOS
                    if ((ITEM != undefined && ITEM != '') &&
                        (CARGO != undefined && CARGO != '')) {
                        data.fila = ITEM;
                        data.tipo_cargo = CARGO;
                        data.observacion = 'no registrado';

                        listCargos.push(data);
                    } else {
                        data.fila = ITEM;
                        data.tipo_cargo = CARGO;
                        data.observacion = 'no registrado';

                        if (data.fila == '' || data.fila == undefined) {
                            data.fila = 'error';
                            mensaje = 'error'
                        }

                        if (data.tipo_cargo == undefined) {
                            data.tipo_cargo = 'No registrado';
                            data.observacion = 'Cargo ' + data.observacion;
                        }

                        listCargos.push(data);
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

                listCargos.forEach(async (item: any) => {
                    if (item.observacion == 'no registrado') {
                        var VERIFICAR_CARGOS = await pool.query(
                            `
                        SELECT * FROM e_cat_tipo_cargo WHERE UPPER(cargo) = $1
                        `
                            , [item.tipo_cargo.toUpperCase()])
                        if (VERIFICAR_CARGOS.rows[0] == undefined || VERIFICAR_CARGOS.rows[0] == '') {
                            item.observacion = 'ok'
                        } else {
                            item.observacion = 'Ya existe en el sistema'
                        }

                        // DISCRIMINACION DE ELEMENTOS IGUALES
                        if (duplicados.find((p: any) => p.tipo_cargo.toLowerCase() === item.tipo_cargo.toLowerCase()) == undefined) {
                            duplicados.push(item);
                        } else {
                            item.observacion = '1';
                        }

                    }

                });

                setTimeout(() => {
                    listCargos.sort((a: any, b: any) => {
                        // COMPARA LOS NUMEROS DE LOS OBJETOS
                        if (a.fila < b.fila) {
                            return -1;
                        }
                        if (a.fila > b.fila) {
                            return 1;
                        }
                        return 0; // SON IGUALES
                    });

                    var filaDuplicada: number = 0;

                    listCargos.forEach(async (item: any) => {
                        if (item.observacion == '1') {
                            item.observacion = 'Registro duplicado'
                        }

                        // VALIDA SI LOS DATOS DE LA COLUMNA N SON NUMEROS.
                        if (typeof item.fila === 'number' && !isNaN(item.fila)) {
                            // CONDICION PARA VALIDAR SI EN LA NUMERACION EXISTE UN NUMERO QUE SE REPITE DARA ERROR.
                            if (item.fila == filaDuplicada) {
                                mensaje = 'error';
                            }
                        } else {
                            return mensaje = 'error';
                        }

                        filaDuplicada = item.fila;

                    });

                    if (mensaje == 'error') {
                        listCargos = undefined;
                    }

                    return res.jsonp({ message: mensaje, data: listCargos });

                }, 1000)

            }

        } catch (error) {
            return res.status(500).jsonp({ message: error });
        }
    }

    // REGISTRAR PLANTILLA TIPO CARGO 
    public async CargarPlantilla(req: Request, res: Response) {
        try {
            const { plantilla, user_name, ip } = req.body;
            var contador = 1;
            var respuesta: any

            plantilla.forEach(async (data: any) => {
                // DATOS QUE SE GUARDARAN DE LA PLANTILLA INGRESADA
                const { item, tipo_cargo, observacion } = data;
                const cargo = tipo_cargo.charAt(0).toUpperCase() + tipo_cargo.slice(1).toLowerCase();

                // INICIAR TRANSACCION
                await pool.query('BEGIN');

                // REGISTRO DE LOS DATOS DE TIPO CARGO
                const response: QueryResult = await pool.query(
                    `
                    INSERT INTO e_cat_tipo_cargo (cargo) VALUES ($1) RETURNING *
                    `
                    , [cargo]);

                const [cargos] = response.rows;

                // AUDITORIA
                await AUDITORIA_CONTROLADOR.InsertarAuditoria({
                    tabla: 'e_cat_tipo_cargo',
                    usuario: user_name,
                    accion: 'I',
                    datosOriginales: '',
                    datosNuevos: JSON.stringify(cargos),
                    ip,
                    observacion: null
                });

                // FIN DE TRANSACCION
                await pool.query('COMMIT');

                if (contador === plantilla.length) {
                    if (cargos) {
                        return respuesta = res.status(200).jsonp({ message: 'ok' })
                    } else {
                        return respuesta = res.status(404).jsonp({ message: 'error' })
                    }
                }
                contador = contador + 1;
            });
        } catch (error) {
            // ROLLBACK
            await pool.query('ROLLBACK');
            return res.status(500).jsonp({ message: error });
        }
    }
}

export const TIPOSCARGOSCONTROLADOR = new TiposCargosControlador();

export default TIPOSCARGOSCONTROLADOR;