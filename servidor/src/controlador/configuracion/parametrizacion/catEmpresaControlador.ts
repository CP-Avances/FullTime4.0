import AUDITORIA_CONTROLADOR from '../../reportes/auditoriaControlador';
import { ObtenerRutaLeerPlantillas, ObtenerRutaLogos } from '../../../libs/accesoCarpetas';
import { ComprimirImagen, ConvertirImagenBase64 } from '../../../libs/ImagenCodificacion';
import { Request, Response } from 'express';
import { DateTime } from 'luxon';
import sharp from 'sharp';
import path from 'path';
import pool from '../../../database';
import fs from 'fs';

class EmpresaControlador {

    // BUSCAR DATOS DE EMPRESA PARA RECUPERAR CUENTA
    public async BuscarCadena(req: Request, res: Response) {
        const EMPRESA = await pool.query(
            `
            SELECT cadena FROM e_empresa
            `
        );
        if (EMPRESA.rowCount != 0) {
            return res.jsonp(EMPRESA.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'No se encuentran registros.' });
        }
    }

    // METODO DE BUSQUEDA DE IMAGEN DE EMPRESA EN BASE64 **USADO
    public async ConvertirImagenBase64(req: Request, res: Response): Promise<any> {
        const file_name = await pool.query(
            `
            SELECT nombre, logo FROM e_empresa WHERE id = $1
            `
            , [req.params.id_empresa])
            .then((result: any) => {
                return result.rows[0];
            });
        if (file_name.logo === null) {
            file_name.logo = 'logo_reportes.png';
        }
        let separador = path.sep;
        let ruta = ObtenerRutaLogos() + separador + file_name.logo;
        const codificado = await ConvertirImagenBase64(ruta);
        if (codificado === 0) {
            res.status(200).jsonp({ imagen: 0, nom_empresa: file_name.nombre })
        } else {
            res.status(200).jsonp({ imagen: codificado, nom_empresa: file_name.nombre })
        }
    }

    public async ObtenerImagenEmpresa(): Promise<any> {
        const file_name = await pool.query(
            `
            SELECT nombre, logo FROM e_empresa WHERE id = $1
            `
            , [1])
            .then((result: any) => {
                return result.rows[0];
            });
        if (file_name.logo === null) {
            file_name.logo = 'logo_reportes.png';
        }
        let separador = path.sep;
        let ruta = ObtenerRutaLogos() + separador + file_name.logo;
        const codificado = await ConvertirImagenBase64(ruta);
        if (codificado === 0) {
            return { imagen: 0, nom_empresa: file_name.nombre };
        } else {
            return { imagen: codificado, nom_empresa: file_name.nombre };
        }
    }

    // METODO PARA EDITAR LOGO DE EMPRESA **USADO
    public async ActualizarLogoEmpresa(req: Request, res: Response): Promise<any> {
        sharp.cache(false);

        // FECHA DEL SISTEMA
        const fecha = DateTime.now();
        const anio = fecha.toFormat('yyyy');
        const mes = fecha.toFormat('MM');
        const dia = fecha.toFormat('dd');
        // IMAGEN ORIGINAL
        const separador = path.sep;
        let ruta_temporal = ObtenerRutaLeerPlantillas() + separador + req.file?.originalname;

        // LEER DATOS DE IMAGEN
        let logo = anio + '_' + mes + '_' + dia + '_' + req.file?.originalname;
        let id = req.params.id_empresa;

        let ruta_guardar = ObtenerRutaLogos() + separador + logo;
        let comprimir = await ComprimirImagen(ruta_temporal, ruta_guardar);

        if (comprimir != false) {
            const { user_name, ip, ip_local } = req.body;

            // CONSULTAR SI EXISTE UNA IMAGEN
            const logo_name = await pool.query(
                `
                SELECT nombre, logo FROM e_empresa WHERE id = $1
                `
                , [id]);

            if (logo_name.rows.length === 0) {
                await AUDITORIA_CONTROLADOR.InsertarAuditoria({
                    tabla: 'e_empresa',
                    usuario: user_name,
                    accion: 'U',
                    datosOriginales: '',
                    datosNuevos: '',
                    ip: ip,
                    ip_local: ip_local,
                    observacion: `Error al actualizar logo de empresa con id: ${id}`
                });

                res.status(404).jsonp({ message: 'error' });
            }

            logo_name.rows.map(async (obj: any) => {
                if (obj.logo != null && obj.logo != logo) {
                    let ruta = ObtenerRutaLogos() + separador + obj.logo;

                    // VERIFICAR EXISTENCIA DE CARPETA O ARCHIVO
                    fs.access(ruta, fs.constants.F_OK, (err) => {
                        if (!err) {
                            // ELIMINAR LOGO DEL SERVIDOR
                            fs.unlinkSync(ruta);
                        }
                    });
                }

                try {
                    // INICIAR TRANSACCION
                    await pool.query('BEGIN');

                    // ACTUALIZAR REGISTRO DE IMAGEN
                    await pool.query(
                        `
                        UPDATE e_empresa SET logo = $2 WHERE id = $1
                        `
                        , [id, logo]);

                    // AUDITORIA
                    await AUDITORIA_CONTROLADOR.InsertarAuditoria({
                        tabla: 'e_empresa',
                        usuario: user_name,
                        accion: 'U',
                        datosOriginales: JSON.stringify(obj),
                        datosNuevos: `{"logo": "${logo}"}`,
                        ip: ip,
                        ip_local: ip_local,
                        observacion: null
                    });

                    // FINALIZAR TRANSACCION
                    await pool.query('COMMIT');
                } catch (error) {
                    // REVERTIR TRANSACCION
                    await pool.query('ROLLBACK');
                }
            });

            // LEER DATOS DE IMAGEN
            let ruta_almacenamiento = ObtenerRutaLogos() + separador + logo;
            const codificado = await ConvertirImagenBase64(ruta_almacenamiento);
            res.send({ imagen: codificado, nom_empresa: logo_name.rows[0].nombre, message: 'Logo actualizado.' })
        }
        else {
            res.status(404).jsonp({ message: 'error' });
        }
    }

    // METODO PARA BUSCAR DATOS GENERALES DE EMPRESA **USADO
    public async ListarEmpresaId(req: Request, res: Response) {
        const { id } = req.params;
        const EMPRESA = await pool.query(
            `
            SELECT * FROM e_empresa WHERE id = $1
            `
            , [id]);
        if (EMPRESA.rowCount != 0) {
            return res.jsonp(EMPRESA.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'No se encuentran registros.' });
        }
    }

    // ACTUALIZAR DATOS DE EMPRESA **USADO
    public async ActualizarEmpresa(req: Request, res: Response): Promise<Response> {
        try {
            const { nombre, ruc, direccion, telefono, correo_empresa, tipo_empresa, representante,
                establecimiento, dias_cambio, cambios, num_partida, id, user_name, ip, ip_local } = req.body;

            // INICIAR TRANSACCION
            await pool.query('BEGIN');

            // CONSULTAR DATOS ORIGINALES
            const datosOriginales = await pool.query(
                `
                SELECT * FROM e_empresa WHERE id = $1
                `
                , [id]);

            if (datosOriginales.rows.length === 0) {
                await AUDITORIA_CONTROLADOR.InsertarAuditoria({
                    tabla: 'e_empresa',
                    usuario: user_name,
                    accion: 'U',
                    datosOriginales: '',
                    datosNuevos: '',
                    ip: ip,
                    ip_local: ip_local,
                    observacion: `Error al actualizar datos de empresa con id: ${id}`
                });

                await pool.query('COMMIT');
                return res.status(404).jsonp({ message: 'error' });
            }

            const datosNuevos = await pool.query(
                `
                UPDATE e_empresa SET nombre = $1, ruc = $2, direccion = $3, telefono = $4, correo_empresa = $5,
                tipo_empresa = $6, representante = $7, establecimiento = $8, dias_cambio = $9, cambios = $10, 
                numero_partida = $11 WHERE id = $12 RETURNING *
                `
                , [nombre, ruc, direccion, telefono, correo_empresa, tipo_empresa, representante, establecimiento,
                    dias_cambio, cambios, num_partida, id]);

            // AUDITORIA
            await AUDITORIA_CONTROLADOR.InsertarAuditoria({
                tabla: 'e_empresa',
                usuario: user_name,
                accion: 'U',
                datosOriginales: JSON.stringify(datosOriginales.rows[0]),
                datosNuevos: JSON.stringify(datosNuevos.rows[0]),
                ip: ip,
                ip_local: ip_local,
                observacion: null
            });

            // FINALIZAR TRANSACCION
            await pool.query('COMMIT');
            return res.jsonp({ message: 'Registro actualizado.' });
        } catch (error) {
            // REVERTIR TRANSACCION
            await pool.query('ROLLBACK');
            return res.status(500).jsonp({ message: 'error' });
        }
    }

    // METODO PARA ACTUALIZAR DATOS DE COLORES DE EMPRESA **USADO
    public async ActualizarColores(req: Request, res: Response): Promise<Response> {
        try {
            const { color_p, color_s, id, user_name, ip, ip_local } = req.body;

            // INICIAR TRANSACCION
            await pool.query('BEGIN');

            // CONSULTAR DATOS ORIGINALES
            const datosOriginales = await pool.query(
                `
                SELECT color_principal, color_secundario FROM e_empresa WHERE id = $1
                `
                , [id]);

            if (datosOriginales.rows.length === 0) {
                await AUDITORIA_CONTROLADOR.InsertarAuditoria({
                    tabla: 'e_empresa',
                    usuario: user_name,
                    accion: 'U',
                    datosOriginales: '',
                    datosNuevos: '',
                    ip: ip,
                    ip_local: ip_local,
                    observacion: `Error al actualizar colores de empresa con id: ${id}`
                });

                await pool.query('COMMIT');
                return res.status(404).jsonp({ message: 'error' });
            }

            await pool.query(
                `
                UPDATE e_empresa SET color_principal = $1, color_secundario = $2 WHERE id = $3
                `
                , [color_p, color_s, id]);

            // AUDITORIA
            await AUDITORIA_CONTROLADOR.InsertarAuditoria({
                tabla: 'e_empresa',
                usuario: user_name,
                accion: 'U',
                datosOriginales: JSON.stringify(datosOriginales.rows[0]),
                datosNuevos: `{"color_principal": "${color_p}", "color_secundario": "${color_s}"}`,
                ip: ip,
                ip_local: ip_local,
                observacion: null
            });

            // FINALIZAR TRANSACCION
            await pool.query('COMMIT');
            return res.jsonp({ message: 'Registro actualizado.' });
        } catch (error) {
            // REVERTIR TRANSACCION
            await pool.query('ROLLBACK');
            return res.status(500).jsonp({ message: 'error' });
        }
    }

    // METODO PARA ACTUALIZAR DATOS DE MARCA DE AGUA DE REPORTES **USADO
    public async ActualizarMarcaAgua(req: Request, res: Response): Promise<Response> {
        try {
            const { marca_agua, id, user_name, ip, ip_local } = req.body;

            // INICAIAR TRANSACCION
            await pool.query('BEGIN');

            // CONSULTAR DATOS ORIGINALES
            const datosOriginales = await pool.query(
                `
                SELECT marca_agua FROM e_empresa WHERE id = $1
                `
                , [id]);

            if (datosOriginales.rows.length === 0) {
                await AUDITORIA_CONTROLADOR.InsertarAuditoria({
                    tabla: 'e_empresa',
                    usuario: user_name,
                    accion: 'U',
                    datosOriginales: '',
                    datosNuevos: '',
                    ip: ip,
                    ip_local: ip_local,
                    observacion: `Error al actualizar marca de agua de empresa con id: ${id}. Registro no encontrado.`
                });

                await pool.query('COMMIT');
                return res.status(404).jsonp({ message: 'error' });
            }

            await pool.query(
                `
                UPDATE e_empresa SET marca_agua = $1 WHERE id = $2
                `
                , [marca_agua, id]);

            // AUDITORIA
            await AUDITORIA_CONTROLADOR.InsertarAuditoria({
                tabla: 'e_empresa',
                usuario: user_name,
                accion: 'U',
                datosOriginales: JSON.stringify(datosOriginales.rows[0]),
                datosNuevos: `{"marca_agua": "${marca_agua}"}`,
                ip: ip,
                ip_local: ip_local,
                observacion: null
            });

            // FINALIZAR TRANSACCION
            await pool.query('COMMIT');
            return res.jsonp({ message: 'Registro actualizado.' });
        } catch (error) {
            // REVERTIR TRANSACCION
            await pool.query('ROLLBACK');
            return res.status(500).jsonp({ message: 'error' });
        }
    }

    // METODO PARA ACTUALIZAR NIVELES DE SEGURIDAD  **USADO
    public async ActualizarSeguridad(req: Request, res: Response): Promise<Response> {
        try {
            const { seg_contrasena, seg_frase, seg_ninguna, id, user_name, ip, ip_local } = req.body;

            // INICIAR TRANSACCION
            await pool.query('BEGIN');

            // CONSULTAR DATOS ORIGINALES
            const datosOriginales = await pool.query(
                `
                SELECT seguridad_contrasena, seguridad_frase, seguridad_ninguna FROM e_empresa WHERE id = $1
                `
                , [id]);

            if (datosOriginales.rows.length === 0) {
                await AUDITORIA_CONTROLADOR.InsertarAuditoria({
                    tabla: 'e_empresa',
                    usuario: user_name,
                    accion: 'U',
                    datosOriginales: '',
                    datosNuevos: '',
                    ip: ip,
                    ip_local: ip_local,
                    observacion: `Error al actualizar niveles de seguridad de empresa con id: ${id}. Registro no encontrado.`
                });

                await pool.query('COMMIT');
                return res.status(404).jsonp({ message: 'error' });
            }

            await pool.query(
                `
                UPDATE e_empresa SET seguridad_contrasena = $1, seguridad_frase = $2, seguridad_ninguna = $3
                WHERE id = $4
                `
                , [seg_contrasena, seg_frase, seg_ninguna, id]);

            // AUDITORIA
            await AUDITORIA_CONTROLADOR.InsertarAuditoria({
                tabla: 'e_empresa',
                usuario: user_name,
                accion: 'U',
                datosOriginales: JSON.stringify(datosOriginales.rows[0]),
                datosNuevos: `{"seguridad_contrasena": "${seg_contrasena}", "seguridad_frase": "${seg_frase}", "seguridad_ninguna": "${seg_ninguna}"}`,
                ip: ip,
                ip_local: ip_local,
                observacion: null
            });

            // FINALIZAR TRANSACCION
            await pool.query('COMMIT');
            return res.jsonp({ message: 'Registro actualizado.' });
        } catch (error) {
            // REVERTIR TRANSACCION
            await pool.query('ROLLBACK');
            return res.status(500).jsonp({ message: 'error' });
        }
    }

    // METODO PARA ACTUALIZAR LOGO CABECERA DE CORREO **USADO
    public async ActualizarCabeceraCorreo(req: Request, res: Response): Promise<any> {
        sharp.cache(false);

        const fecha = DateTime.now();
        const anio = fecha.toFormat('yyyy');
        const mes = fecha.toFormat('MM');
        const dia = fecha.toFormat('dd');

        // IMAGEN ORIGINAL
        const separador = path.sep;
        let ruta_temporal = ObtenerRutaLeerPlantillas() + separador + req.file?.originalname;

        // LEER DATOS DE IMAGEN
        let logo = anio + '_' + mes + '_' + dia + '_' + req.file?.originalname;
        let id = req.params.id_empresa;
        let ruta_guardar = ObtenerRutaLogos() + separador + logo;

        let comprimir = await ComprimirImagen(ruta_temporal, ruta_guardar);

        if (comprimir != false) {

            const { user_name, ip, ip_local } = req.body;

            const logo_name = await pool.query(
                `
            SELECT cabecera_firma FROM e_empresa WHERE id = $1
            `
                , [id]);

            if (logo_name.rows.length === 0) {
                await AUDITORIA_CONTROLADOR.InsertarAuditoria({
                    tabla: 'e_empresa',
                    usuario: user_name,
                    accion: 'U',
                    datosOriginales: '',
                    datosNuevos: '',
                    ip: ip,
                    ip_local: ip_local,
                    observacion: `Error al actualizar cabecera de correo de empresa con id: ${id}`
                });

                res.status(404).jsonp({ message: 'error' });
            }

            logo_name.rows.map(async (obj: any) => {
                if (obj.cabecera_firma != null && obj.cabecera_firma != logo) {
                    let ruta = ObtenerRutaLogos() + separador + obj.cabecera_firma;

                    // VERIFICAR EXISTENCIA DE CARPETA O ARCHIVO
                    fs.access(ruta, fs.constants.F_OK, (err) => {
                        if (!err) {
                            // ELIMINAR LOGO DEL SERVIDOR
                            fs.unlinkSync(ruta);
                        }
                    });
                }

                try {
                    // INICIAR TRANSACCION
                    await pool.query('BEGIN');

                    // ACTUALIZAR REGISTRO DE IMAGEN
                    await pool.query(
                        `
                        UPDATE e_empresa SET cabecera_firma = $2 WHERE id = $1
                        `
                        , [id, logo]);

                    // AUDITORIA
                    await AUDITORIA_CONTROLADOR.InsertarAuditoria({
                        tabla: 'e_empresa',
                        usuario: user_name,
                        accion: 'U',
                        datosOriginales: JSON.stringify(obj),
                        datosNuevos: `{"cabecera_firma": "${logo}"}`,
                        ip: ip,
                        ip_local: ip_local,
                        observacion: null
                    });

                    // FINALIZAR TRANSACCION
                    await pool.query('COMMIT');
                } catch (error) {
                    // REVERTIR TRANSACCION
                    await pool.query('ROLLBACK');
                }
            });
            // LEER DATOS DE IMAGEN
            let ruta_almacenamiento = ObtenerRutaLogos() + separador + logo;
            const codificado = await ConvertirImagenBase64(ruta_almacenamiento);
            res.send({ imagen: codificado, message: 'Registro actualizado.' })
        }
        else {
            res.status(404).jsonp({ message: 'error' });
        }
    }

    // METODO PARA CONSULTAR IMAGEN DE CABECERA DE CORREO  **USADO
    public async VerCabeceraCorreo(req: Request, res: Response): Promise<any> {
        const file_name =
            await pool.query(
                `
                SELECT cabecera_firma FROM e_empresa WHERE id = $1
                `
                , [req.params.id_empresa])
                .then((result: any) => {
                    return result.rows[0];
                });
        let separador = path.sep;
        let ruta = ObtenerRutaLogos() + separador + file_name.cabecera_firma;
        const codificado = await ConvertirImagenBase64(ruta);
        if (codificado === 0) {
            res.status(200).jsonp({ imagen: 0 })
        } else {
            res.status(200).jsonp({ imagen: codificado })
        }
    }

    // METODO PARA ACTUALIZAR PIE DE FIRMA DE CORREO **USADO
    public async ActualizarPieCorreo(req: Request, res: Response): Promise<any> {
        sharp.cache(false);

        // FECHA DEL SISTEMA
        const fecha = DateTime.now();
        const anio = fecha.toFormat('yyyy');
        const mes = fecha.toFormat('MM');
        const dia = fecha.toFormat('dd');

        // IMAGEN ORIGINAL
        const separador = path.sep;
        let ruta_temporal = ObtenerRutaLeerPlantillas() + separador + req.file?.originalname;

        // LEER DATOS DE IMAGEN
        let logo = anio + '_' + mes + '_' + dia + '_' + req.file?.originalname;
        let id = req.params.id_empresa;

        let ruta_guardar = ObtenerRutaLogos() + separador + logo;
        let comprimir = await ComprimirImagen(ruta_temporal, ruta_guardar);

        if (comprimir != false) {

            const { user_name, ip, ip_local } = req.body;

            const logo_name = await pool.query(
                `
            SELECT pie_firma FROM e_empresa WHERE id = $1
            `
                , [id]);

            if (logo_name.rows.length === 0) {
                await AUDITORIA_CONTROLADOR.InsertarAuditoria({
                    tabla: 'e_empresa',
                    usuario: user_name,
                    accion: 'U',
                    datosOriginales: '',
                    datosNuevos: '',
                    ip: ip,
                    ip_local: ip_local,
                    observacion: `Error al actualizar pie de firma de empresa con id: ${id}. Registro no encontrado.`
                });

                res.status(404).jsonp({ message: 'error' });
            }

            logo_name.rows.map(async (obj: any) => {
                if (obj.pie_firma != null && obj.pie_firma != logo) {
                    let ruta = ObtenerRutaLogos() + separador + obj.pie_firma;

                    // VERIFICAR EXISTENCIA DE CARPETA O ARCHIVO
                    fs.access(ruta, fs.constants.F_OK, (err) => {
                        if (!err) {
                            // ELIMINAR LOGO DEL SERVIDOR
                            fs.unlinkSync(ruta);
                        }
                    });
                }

                try {
                    // INICIAR TRANSACCION
                    await pool.query('BEGIN');

                    // ACTUALIZAR REGISTRO DE IMAGEN
                    await pool.query(
                        `
                    UPDATE e_empresa SET pie_firma = $2 WHERE id = $1
                    `
                        , [id, logo]);

                    // AUDITORIA
                    await AUDITORIA_CONTROLADOR.InsertarAuditoria({
                        tabla: 'e_empresa',
                        usuario: user_name,
                        accion: 'U',
                        datosOriginales: JSON.stringify(obj),
                        datosNuevos: `{"pie_firma": "${logo}"}`,
                        ip: ip,
                        ip_local: ip_local,
                        observacion: null
                    });

                    // FINALIZAR TRANSACCION
                    await pool.query('COMMIT');
                } catch (error) {
                    // REVERTIR TRANSACCION
                    await pool.query('ROLLBACK');
                }
            });
            // LEER DATOS DE IMAGEN
            let ruta_almacenamiento = ObtenerRutaLogos() + separador + logo;
            const codificado = await ConvertirImagenBase64(ruta_almacenamiento);
            res.send({ imagen: codificado, message: 'Registro actualizado.' })
        }
        else {
            res.status(404).jsonp({ message: 'error' });
        }
    }

    // METODO PARA CONSULTAR IMAGEN DE PIE DE FIRMA DE CORREO **USADO
    public async VerPieCorreo(req: Request, res: Response): Promise<any> {
        const file_name =
            await pool.query(
                `
                SELECT pie_firma FROM e_empresa WHERE id = $1
                `
                , [req.params.id_empresa])
                .then((result: any) => {
                    return result.rows[0];
                });
        let separador = path.sep;
        let ruta = ObtenerRutaLogos() + separador + file_name.pie_firma;
        const codificado = await ConvertirImagenBase64(ruta);
        if (codificado === 0) {
            res.status(200).jsonp({ imagen: 0 })
        } else {
            res.status(200).jsonp({ imagen: codificado })
        }
    }

    // METODO PARA ACTUALIZAR DATOS DE CORREO  **USADO
    public async EditarPassword(req: Request, res: Response): Promise<Response> {
        try {
            const id = req.params.id_empresa
            const { correo, password_correo, servidor, puerto, user_name, ip, ip_local } = req.body;

            // INICIAR TRANSACCION
            await pool.query('BEGIN');

            // CONSULTAR DATOS ORIGINALES
            const datosOriginales = await pool.query(
                `
                SELECT correo, password_correo, servidor, puerto FROM e_empresa WHERE id = $1
                `
                , [id]);

            if (datosOriginales.rows.length === 0) {
                await AUDITORIA_CONTROLADOR.InsertarAuditoria({
                    tabla: 'e_empresa',
                    usuario: user_name,
                    accion: 'U',
                    datosOriginales: '',
                    datosNuevos: '',
                    ip: ip,
                    ip_local: ip_local,
                    observacion: `Error al actualizar datos de correo de empresa con id: ${id}. Registro no encontrado.`
                });

                await pool.query('COMMIT');
                return res.status(404).jsonp({ message: 'error' });
            }

            await pool.query(
                `
                UPDATE e_empresa SET correo = $1, password_correo = $2, servidor = $3, puerto = $4
                WHERE id = $5
                `
                , [correo, password_correo, servidor, puerto, id]);

            // AUDITORIA
            await AUDITORIA_CONTROLADOR.InsertarAuditoria({
                tabla: 'e_empresa',
                usuario: user_name,
                accion: 'U',
                datosOriginales: JSON.stringify(datosOriginales.rows[0]),
                datosNuevos: `{"correo": "${correo}", "password_correo": "${password_correo}", "servidor": "${servidor}", "puerto": "${puerto}"}`,
                ip: ip,
                ip_local: ip_local,
                observacion: null
            });

            // FINALIZAR TRANSACCION
            await pool.query('COMMIT');
            return res.status(200).jsonp({ message: 'Registro actualizado.' })
        } catch (error) {
            // REVERTIR TRANSACCION
            await pool.query('ROLLBACK');
            return res.status(500).jsonp({ message: 'error' });
        }
    }


    // METODO PARA LISTAR EMPRESA
    public async ListarEmpresa(req: Request, res: Response) {
        const EMPRESA = await pool.query(
            `
            SELECT id, nombre, ruc, direccion, telefono, correo, representante, tipo_empresa, establecimiento, logo, 
                color_principal, color_secundario, numero_partida, marca_agua, correo_empresa 
            FROM e_empresa ORDER BY nombre ASC
            `
        );
        if (EMPRESA.rowCount != 0) {
            return res.jsonp(EMPRESA.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'No se encuentran registros.' });
        }
    }
}

export const EMPRESA_CONTROLADOR = new EmpresaControlador();

export default EMPRESA_CONTROLADOR;
