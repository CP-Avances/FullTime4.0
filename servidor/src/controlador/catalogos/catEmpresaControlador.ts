import { ImagenBase64LogosEmpresas } from '../../libs/ImagenCodificacion';
import { Request, Response } from 'express';
import { ObtenerRutaLogos } from '../../libs/accesoCarpetas';
import moment from 'moment';
import path from 'path';
import pool from '../../database';
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

    // METODO DE BUSQUEDA DE IMAGEN
    public async getImagenBase64(req: Request, res: Response): Promise<any> {

        const file_name = await pool.query(
            `
            SELECT nombre, logo FROM e_empresa WHERE id = $1
            `
            , [req.params.id_empresa])
            .then((result: any) => {
                return result.rows[0];
            });

        console.log('ver registro empresa ', file_name)
        if (file_name.logo === null) {
            file_name.logo = 'logo_reportes.png';
        }

        const codificado = await ImagenBase64LogosEmpresas(file_name.logo);

        if (codificado === 0) {
            res.status(200).jsonp({ imagen: 0, nom_empresa: file_name.nombre })
        } else {
            res.status(200).jsonp({ imagen: codificado, nom_empresa: file_name.nombre })
        }
    }


    // METODO PARA EDITAR LOGO DE EMPRESA
    public async ActualizarLogoEmpresa(req: Request, res: Response): Promise<any> {

        // FECHA DEL SISTEMA
        var fecha = moment();
        var anio = fecha.format('YYYY');
        var mes = fecha.format('MM');
        var dia = fecha.format('DD');

        // LEER DATOS DE IMAGEN
        let logo = anio + '_' + mes + '_' + dia + '_' + req.file?.originalname;
        let id = req.params.id_empresa;
        let separador = path.sep;

        // CONSULTAR SI EXISTE UNA IMAGEN
        const logo_name = await pool.query(
            `
            SELECT nombre, logo FROM e_empresa WHERE id = $1
            `
            , [id]);

        logo_name.rows.map(async (obj: any) => {
            // LA IMAGEN EXISTE
            if (obj.logo != null) {
                try {
                    let ruta = ObtenerRutaLogos() + separador + obj.logo;

                    // SI EL NOMBRE DE LA IMAGEN YA EXISTE SOLO SE ACTUALIZA CASO CONTRARIO SE ELIMINA
                    if (obj.logo != logo) {

                        // VERIFICAR EXISTENCIA DE CARPETA O ARCHIVO
                        fs.access(ruta, fs.constants.F_OK, (err) => {
                            if (err) {
                            } else {
                                // ELIMINAR LOGO DEL SERVIDOR
                                fs.unlinkSync(ruta);
                            }
                        });

                        // ACTUALIZAR REGISTRO DE IMAGEN
                        await pool.query(
                            `
                            UPDATE e_empresa SET logo = $2 WHERE id = $1
                            `
                            , [id, logo]);
                    }
                } catch (error) {
                    // ACTUALIZAR REGISTRO DE IMAGEN SI ESTA NO CONSTA EN EL SERVIDOR
                    await pool.query(
                        `
                            UPDATE e_empresa SET logo = $2 WHERE id = $1
                            `
                        , [id, logo]);
                }
            } else {
                // SI NO EXISTE UNA IMAGEN SE REGISTRA EN LA BASE DE DATOS Y EL SERVIDOR
                await pool.query(
                    `
                        UPDATE e_empresa SET logo = $2 WHERE id = $1
                        `
                    , [id, logo]);
            }
        });

        // LEER DATOS DE IMAGEN
        const codificado = await ImagenBase64LogosEmpresas(logo);
        res.send({ imagen: codificado, nom_empresa: logo_name.rows[0].nombre, message: 'Logo actualizado.' })
    }

    // METODO PARA BUSCAR DATOS GENERALES DE EMPRESA
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

    // ACTUALIZAR DATOS DE EMPRESA
    public async ActualizarEmpresa(req: Request, res: Response): Promise<void> {
        const { nombre, ruc, direccion, telefono, correo_empresa, tipo_empresa, representante,
            establecimiento, dias_cambio, cambios, num_partida, id } = req.body;
        await pool.query(
            `
            UPDATE e_empresa SET nombre = $1, ruc = $2, direccion = $3, telefono = $4, correo_empresa = $5,
                tipo_empresa = $6, representante = $7, establecimiento = $8, dias_cambio = $9, cambios = $10, 
                numero_partida = $11 WHERE id = $12
            `
            , [nombre, ruc, direccion, telefono, correo_empresa, tipo_empresa, representante, establecimiento,
                dias_cambio, cambios, num_partida, id]);
        res.jsonp({ message: 'Registro actualizado.' });
    }

    // METODO PARA ACTUALIZAR DATOS DE COLORES DE EMPRESA
    public async ActualizarColores(req: Request, res: Response): Promise<void> {
        const { color_p, color_s, id } = req.body;
        await pool.query(
            `
            UPDATE e_empresa SET color_principal = $1, color_secundario = $2 WHERE id = $3
            `
            , [color_p, color_s, id]);
        res.jsonp({ message: 'Registro actualizado.' });
    }

    // METODO PARA ACTUALIZAR DATOS DE MARCA DE AGUA DE REPORTES
    public async ActualizarMarcaAgua(req: Request, res: Response): Promise<void> {
        const { marca_agua, id } = req.body;
        await pool.query(
            `
            UPDATE e_empresa SET marca_agua = $1 WHERE id = $2
            `
            , [marca_agua, id]);
        res.jsonp({ message: 'Registro actualizado.' });
    }

    // METODO PARA ACTUALIZAR NIVELES DE SEGURIDAD
    public async ActualizarSeguridad(req: Request, res: Response): Promise<void> {
        const { seg_contrasena, seg_frase, seg_ninguna, id } = req.body;
        await pool.query(
            `
            UPDATE e_empresa SET seguridad_contrasena = $1, seguridad_frase = $2, seguridad_ninguna = $3
            WHERE id = $4
            `
            , [seg_contrasena, seg_frase, seg_ninguna, id]);
        res.jsonp({ message: 'Registro actualizado.' });
    }

    // METODO PARA ACTUALIZAR LOGO CABECERA DE CORREO
    public async ActualizarCabeceraCorreo(req: Request, res: Response): Promise<any> {

        // FECHA DEL SISTEMA
        var fecha = moment();
        var anio = fecha.format('YYYY');
        var mes = fecha.format('MM');
        var dia = fecha.format('DD');

        // LEER DATOS DE IMAGEN
        let logo = anio + '_' + mes + '_' + dia + '_' + req.file?.originalname;
        let id = req.params.id_empresa;
        let separador = path.sep;

        const logo_name = await pool.query(
            `
            SELECT cabecera_firma FROM e_empresa WHERE id = $1
            `
            , [id]);

        logo_name.rows.map(async (obj: any) => {
            if (obj.cabecera_firma != null) {

                try {
                    let ruta = ObtenerRutaLogos() + separador + obj.cabecera_firma;

                    // SI EL NOMBRE DE LA IMAGEN YA EXISTE SOLO SE ACTUALIZA CASO CONTRARIO SE ELIMINA
                    if (obj.cabecera_firma != logo) {

                        // VERIFICAR EXISTENCIA DE CARPETA O ARCHIVO
                        fs.access(ruta, fs.constants.F_OK, (err) => {
                            if (err) {
                            } else {
                                // ELIMINAR LOGO DEL SERVIDOR
                                fs.unlinkSync(ruta)
                            }
                        });
                        ;

                        // ACTUALIZAR REGISTRO DE IMAGEN
                        await pool.query(
                            `
                            UPDATE e_empresa SET cabecera_firma = $2 WHERE id = $1
                            `
                            , [id, logo]);
                    }
                } catch (error) {
                    await pool.query(
                        `
                        UPDATE e_empresa SET cabecera_firma = $2 WHERE id = $1
                        `
                        , [id, logo]);
                }
            } else {
                await pool.query(
                    `
                    UPDATE e_empresa SET cabecera_firma = $2 WHERE id = $1
                    `
                    , [id, logo]);
            }
        });

        const codificado = await ImagenBase64LogosEmpresas(logo);
        res.send({ imagen: codificado, message: 'Registro actualizado.' })
    }

    // METODO PARA CONSULTAR IMAGEN DE CABECERA DE CORREO
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
        const codificado = await ImagenBase64LogosEmpresas(file_name.cabecera_firma);
        if (codificado === 0) {
            res.status(200).jsonp({ imagen: 0 })
        } else {
            res.status(200).jsonp({ imagen: codificado })
        }
    }

    // METODO PARA ACTUALIZAR PIE DE FIRMA DE CORREO
    public async ActualizarPieCorreo(req: Request, res: Response): Promise<any> {

        // FECHA DEL SISTEMA
        var fecha = moment();
        var anio = fecha.format('YYYY');
        var mes = fecha.format('MM');
        var dia = fecha.format('DD');

        // LEER DATOS DE IMAGEN
        let logo = anio + '_' + mes + '_' + dia + '_' + req.file?.originalname;
        let id = req.params.id_empresa;
        let separador = path.sep;

        const logo_name = await pool.query(
            `
            SELECT pie_firma FROM e_empresa WHERE id = $1
            `
            , [id]);

        logo_name.rows.map(async (obj: any) => {
            if (obj.pie_firma != null) {

                try {
                    let ruta = ObtenerRutaLogos() + separador + obj.pie_firma;

                    // SI EL NOMBRE DE LA IMAGEN YA EXISTE SOLO SE ACTUALIZA CASO CONTRARIO SE ELIMINA
                    if (obj.pie_firma != logo) {

                        // VERIFICAR EXISTENCIA DE CARPETA O ARCHIVO
                        fs.access(ruta, fs.constants.F_OK, (err) => {
                            if (err) {
                            } else {
                                // ELIMINAR LOGO DEL SERVIDOR
                                fs.unlinkSync(ruta);
                            }
                        });

                        // ACTUALIZAR REGISTRO DE IMAGEN
                        await pool.query(
                            `
                            UPDATE e_empresa SET pie_firma = $2 WHERE id = $1
                            `
                            , [id, logo]);
                    }
                } catch (error) {
                    await pool.query(
                        `
                        UPDATE e_empresa SET pie_firma = $2 WHERE id = $1
                        `
                        , [id, logo]);
                }
            } else {
                await pool.query(
                    `
                    UPDATE e_empresa SET pie_firma = $2 WHERE id = $1
                    `
                    , [id, logo]);
            }
        });

        const codificado = await ImagenBase64LogosEmpresas(logo);
        res.send({ imagen: codificado, message: 'Registro actualizado.' })
    }

    // METODO PARA CONSULTAR IMAGEN DE PIE DE FIRMA DE CORREO
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
        const codificado = await ImagenBase64LogosEmpresas(file_name.pie_firma);
        if (codificado === 0) {
            res.status(200).jsonp({ imagen: 0 })
        } else {
            res.status(200).jsonp({ imagen: codificado })
        }
    }

    // METODO PARA ACTUALIZAR DATOS DE CORREO
    public async EditarPassword(req: Request, res: Response): Promise<void> {
        const id = req.params.id_empresa
        const { correo, password_correo, servidor, puerto } = req.body;

        await pool.query(
            `
            UPDATE e_empresa SET correo = $1, password_correo = $2, servidor = $3, puerto = $4
            WHERE id = $5
            `
            , [correo, password_correo, servidor, puerto, id]);
        res.status(200).jsonp({ message: 'Registro actualizado.' })
    }

    // METODO PARA ACTUALIZAR USO DE ACCIONES
    public async ActualizarAccionesTimbres(req: Request, res: Response): Promise<void> {
        try {
            const { id, bool_acciones } = req.body;
            await pool.query(
                `
                UPDATE e_empresa SET acciones_timbres = $1 WHERE id = $2
                `
                , [bool_acciones, id]);
            res.status(200).jsonp({
                message: 'Empresa actualizada exitosamente.',
                title: 'Ingrese nuevamente al sistema.'
            });
        } catch (error) {
            res.status(404).jsonp(error)
        }
    }

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
