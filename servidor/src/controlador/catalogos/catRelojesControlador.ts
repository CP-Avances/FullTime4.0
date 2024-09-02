import { Request, Response } from 'express';
import { ObtenerIndicePlantilla, ObtenerRutaLeerPlantillas } from '../../libs/accesoCarpetas';
import { QueryResult } from 'pg';
import AUDITORIA_CONTROLADOR from '../auditoria/auditoriaControlador';
import fs from 'fs';
import path from 'path';
import pool from '../../database';
import excel from 'xlsx';

class RelojesControlador {

    // METODO PARA BUSCAR DISPOSITIVOS    **USADO
    public async ListarRelojes(req: Request, res: Response) {
        const RELOJES = await pool.query(
            `
            SELECT cr.id, cr.codigo, cr.nombre, cr.ip, cr.puerto, cr.contrasenia, cr.marca, cr.modelo, cr.serie,
                cr.id_fabricacion, cr.fabricante, cr.mac, cr.tipo_conexion, cr.id_sucursal, 
                cr.id_departamento, cd.nombre AS nomdepar, s.nombre AS nomsucursal, 
                e.nombre AS nomempresa, c.descripcion AS nomciudad, cr.temperatura
            FROM ed_relojes cr, ed_departamentos cd, e_sucursales s, e_ciudades c, e_empresa e
            WHERE cr.id_departamento = cd.id AND cd.id_sucursal = cr.id_sucursal AND 
                cr.id_sucursal = s.id AND s.id_empresa = e.id AND s.id_ciudad = c.id;
            `
        );
        if (RELOJES.rowCount != 0) {
            return res.jsonp(RELOJES.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'No se encuentran registros.' });
        }
    }

    // METODO PARA ELIMINAR REGISTROS   **USADO
    public async EliminarRegistros(req: Request, res: Response): Promise<Response> {
        try {
            const { user_name, ip } = req.body;
            const id = req.params.id;

            // INICIAR TRANSACCION
            await pool.query('BEGIN');

            // CONSULTAR DATOSORIGINALES
            const reloj = await pool.query(`SELECT * FROM ed_relojes WHERE id = $1`, [id]);
            const [datosOriginales] = reloj.rows;

            if (!datosOriginales) {
                // AUDITORIA
                await AUDITORIA_CONTROLADOR.InsertarAuditoria({
                    tabla: 'ed_relojes',
                    usuario: user_name,
                    accion: 'D',
                    datosOriginales: '',
                    datosNuevos: '',
                    ip: ip,
                    observacion: null
                });

                // FINALIZAR TRANSACCION
                await pool.query('COMMIT');
                return res.jsonp({ message: `Error al eliminar registro con id ${id}. Registro no encontrado` });
            }

            await pool.query(
                `
                DELETE FROM ed_relojes WHERE id = $1
                `
                , [id]);

            // AUDITORIA
            await AUDITORIA_CONTROLADOR.InsertarAuditoria({
                tabla: 'ed_relojes',
                usuario: user_name,
                accion: 'D',
                datosOriginales: JSON.stringify(datosOriginales),
                datosNuevos: '',
                ip: ip,
                observacion: null
            });

            // FINALIZAR TRANSACCION
            await pool.query('COMMIT');
            return res.jsonp({ message: 'Registro eliminado.' });

        } catch (error) {
            // REVERTIR TRANSACCION
            await pool.query('ROLLBACK');
            return res.status(500).jsonp({ message: 'error' });
        }
    }

    // METODO PARA REGISTRAR DISPOSITIVO   **USADO
    public async CrearRelojes(req: Request, res: Response) {
        try {
            const { nombre, ip, puerto, contrasenia, marca, modelo, serie, id_fabricacion, fabricante, mac,
                tipo_conexion, id_sucursal, id_departamento, codigo, temperatura, user_name, user_ip } = req.body;

            // INICIAR TRANSACCION
            await pool.query('BEGIN');

            var VERIFICAR_CODIGO: any;

            if (serie === '') {
                VERIFICAR_CODIGO = await pool.query(
                    `
                    SELECT * FROM ed_relojes WHERE UPPER(codigo) = $1
                    `
                    , [codigo.toUpperCase()])
            }
            else {
                VERIFICAR_CODIGO = await pool.query(
                    `
                    SELECT * FROM ed_relojes WHERE UPPER(codigo) = $1 OR UPPER(serie) = $2
                    `
                    , [codigo.toUpperCase(), serie.toUpperCase()])
            }

            if (VERIFICAR_CODIGO.rows[0] == undefined || VERIFICAR_CODIGO.rows[0] == '') {
                const response: QueryResult = await pool.query(
                    `
                    INSERT INTO ed_relojes (nombre, ip, puerto, contrasenia, marca, modelo, serie, 
                        id_fabricacion, fabricante, mac, tipo_conexion, id_sucursal, id_departamento, codigo, temperatura)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15) RETURNING *
                    `
                    , [nombre, ip, puerto, contrasenia, marca, modelo, serie, id_fabricacion, fabricante, mac,
                        tipo_conexion, id_sucursal, id_departamento, codigo, temperatura]);

                const [reloj] = response.rows;

                // AUDITORIA
                await AUDITORIA_CONTROLADOR.InsertarAuditoria({
                    tabla: 'ed_relojes',
                    usuario: user_name,
                    accion: 'I',
                    datosOriginales: '',
                    datosNuevos: JSON.stringify(reloj),
                    ip: user_ip,
                    observacion: null
                });

                // FINALIZAR TRANSACCION
                await pool.query('COMMIT');

                if (reloj) {
                    return res.status(200).jsonp({ message: 'guardado', reloj: reloj })
                }
                else {
                    return res.status(404).jsonp({ message: 'mal_registro' })
                }
            }
            else {
                return res.jsonp({ message: 'existe' })
            }
        }

        catch (error) {
            // REVERTIR TRANSACCION
            await pool.query('ROLLBACK');
            return res.jsonp({ message: 'error' });
        }
    }

    // METODO PARA VER DATOS DE UN DISPOSITIVO    **USADO
    public async ListarUnReloj(req: Request, res: Response): Promise<any> {
        const { id } = req.params;
        const RELOJES = await pool.query(
            `
            SELECT * FROM ed_relojes WHERE id = $1
            `
            , [id]);
        if (RELOJES.rowCount != 0) {
            return res.jsonp(RELOJES.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'No se encuentran registros.' });
        }
    }

    // METODO PARA ACTUALIZAR REGISTRO   **USADO
    public async ActualizarReloj(req: Request, res: Response): Promise<Response> {
        try {
            const { nombre, ip, puerto, contrasenia, marca, modelo, serie, id_fabricacion, fabricante, mac,
                tipo_conexion, id_sucursal, id_departamento, codigo, id_real, temperatura, user_name, user_ip } = req.body;

            // INICIAR TRANSACCION
            await pool.query('BEGIN');

            // CONSULTAR DATOSORIGINALES
            const reloj = await pool.query(
                `
                SELECT * FROM ed_relojes WHERE id = $1
                `
                , [id_real]);

            const [datosOriginales] = reloj.rows;

            if (!datosOriginales) {
                // AUDITORIA
                await AUDITORIA_CONTROLADOR.InsertarAuditoria({
                    tabla: 'ed_relojes',
                    usuario: user_name,
                    accion: 'U',
                    datosOriginales: '',
                    datosNuevos: '',
                    ip: user_ip,
                    observacion: `Error al actualizar el registro con id: ${codigo}.`
                });

                // FINALIZAR TRANSACCION
                await pool.query('COMMIT');
                return res.status(404).jsonp({ message: 'error' });
            }

            var VERIFICA_CODIGO: any;

            if (serie === '') {
                VERIFICA_CODIGO = await pool.query(
                    `
                    SELECT * FROM ed_relojes WHERE UPPER(codigo) = $1 AND NOT id = $3
                    `
                    , [codigo.toUpperCase(), id_real])
            }
            else {
                VERIFICA_CODIGO = await pool.query(
                    `
                    SELECT * FROM ed_relojes WHERE (UPPER(codigo) = $1 OR UPPER(serie) = $2) AND NOT id = $3
                    `
                    , [codigo.toUpperCase(), serie.toUpperCase(), id_real])
            }

            if (VERIFICA_CODIGO.rows[0] == undefined || VERIFICA_CODIGO.rows[0] == '') {
                await pool.query(
                    `
                    UPDATE ed_relojes SET nombre = $1, ip = $2, puerto = $3, contrasenia = $4, marca = $5, 
                        modelo = $6, serie = $7, id_fabricacion = $8, fabricante = $9, mac = $10, 
                        tipo_conexion = $11, id_sucursal = $12, id_departamento = $13, codigo = $14, temperatura = $15
                    WHERE id = $16
                    `
                    , [nombre, ip, puerto, contrasenia, marca, modelo, serie, id_fabricacion, fabricante, mac,
                        tipo_conexion, id_sucursal, id_departamento, codigo, temperatura, id_real]);

                // AUDITORIA
                await AUDITORIA_CONTROLADOR.InsertarAuditoria({
                    tabla: 'ed_relojes',
                    usuario: user_name,
                    accion: 'U',
                    datosOriginales: JSON.stringify(datosOriginales),
                    datosNuevos: `{"nombre": "${nombre}", "ip": "${ip}", "puerto": "${puerto}", "contrasenia": "${contrasenia}", "marca": "${marca}", "modelo": "${modelo}", "serie": "${serie}", "id_fabricacion": "${id_fabricacion}", "fabricante": "${fabricante}", "mac": "${mac}", "tipo_conexion": "${tipo_conexion}", "id_sucursal": "${id_sucursal}", "id_departamento": "${id_departamento}", "codigo": "${codigo}"}`,
                    ip: user_ip,
                    observacion: null
                });

                // FINALIZAR TRANSACCION
                await pool.query('COMMIT');

                return res.jsonp({ message: 'actualizado' });
            }
            else {
                return res.jsonp({ message: 'existe' });
            }

        }
        catch (error) {
            // REVERTIR TRANSACCION
            await pool.query('ROLLBACK');
            return res.jsonp({ message: 'error' });
        }
    }

    // METODO PARA CONSULTAR DATOS GENERALES DE DISPOSITIVO    **USADO
    public async ListarDatosUnReloj(req: Request, res: Response): Promise<any> {
        const { id } = req.params;
        const RELOJES = await pool.query(
            `
            SELECT cr.id, cr.codigo, cr.nombre, cr.ip, cr.puerto, cr.contrasenia, cr.marca, cr.modelo, cr.serie,
                cr.id_fabricacion, cr.fabricante, cr.mac, cr.tipo_conexion, cr.id_sucursal, cr.temperatura,
                cr.id_departamento, cd.nombre AS nomdepar, s.nombre AS nomsucursal,
                e.nombre AS nomempresa, c.descripcion AS nomciudad
            FROM ed_relojes cr, ed_departamentos cd, e_sucursales s, e_ciudades c, e_empresa e
            WHERE cr.id_departamento = cd.id AND cd.id_sucursal = cr.id_sucursal AND cr.id_sucursal = s.id 
                AND s.id_empresa = e.id AND s.id_ciudad = c.id AND cr.id = $1
            `
            , [id]);
        if (RELOJES.rowCount != 0) {
            return res.jsonp(RELOJES.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'No se encuentran registros.' });
        }
    }


    // METODO PARA CONTAR DISPOSITIVOS     **USADO
    public async ContarDispositivos(req: Request, res: Response): Promise<Response> {
        try {
            const RELOJES = await pool.query(
                `
                SELECT COUNT (id) AS total FROM ed_relojes;
                `
            );

            if (RELOJES.rowCount != 0) {
                return res.jsonp(RELOJES.rows[0])
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros.' });
            }

        } catch (error) {
            console.log('error ', error)
            return res.status(500).jsonp({ message: 'Ups!!! algo salio mal. No se han encontrado registros.' });
        }
    }


    // METODO PARA LEER Y CARGAR DATOS DE PLANTILLA    **USADO
    public async VerificarPlantilla(req: Request, res: Response) {
        try {
            const documento = req.file?.originalname;
            let separador = path.sep;
            let ruta = ObtenerRutaLeerPlantillas() + separador + documento;
            const workbook = excel.readFile(ruta);
            let verificador = ObtenerIndicePlantilla(workbook, 'BIOMETRICOS');
            if (verificador === false) {
                return res.jsonp({ message: 'no_existe', data: undefined });
            }
            else {
                const sheet_name_list = workbook.SheetNames;
                const plantilla_dispositivos = excel.utils.sheet_to_json(workbook.Sheets[sheet_name_list[verificador]]);

                let data: any = {
                    fila: '',
                    establecimiento: '',
                    departamento: '',
                    nombre_dispo: '',
                    codigo: '',
                    direccion_ip: '',
                    puerto: '',
                    tipo_conexion: '',
                    temperatura: '',
                    marca: '',
                    modelo: '',
                    id_fabricante: '',
                    fabricante: '',
                    numero_serie: '',
                    direccion_mac: '',
                    contrasena: '',
                    observacion: ''
                }
                var listDispositivos: any = [];
                var duplicados: any = [];
                var duplicados1: any = [];
                var duplicados2: any = [];
                var duplicados3: any = [];
                var mensaje: string = 'correcto';

                // EXPRECION REGULAR PARA VALIDAR EL FORMATO DE UNA IPV4.
                const ipv4Regex = /^(25[0-5]|2[0-4][0-9]|[0-1]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[0-1]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[0-1]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[0-1]?[0-9][0-9]?)$/;
                // EXPRECION REGULAR PARA VALIDAR EL FORMATO DE UNA DIRECCION MAC
                const direccMac = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$|^[0-9A-Fa-f]{12}$/;
                // EXPRECION REGULAR PARA VALIDAR EL FORMATO DE SOLO NUMEROS.
                const regex = /^[0-9]+$/;

                // LECTURA DE LOS DATOS DE LA PLANTILLA
                plantilla_dispositivos.forEach(async (dato: any) => {
                    var { ITEM, ESTABLECIMIENTO, DEPARTAMENTO, NOMBRE_DISPOSITIVO,
                        CODIGO, DIRECCION_IP, PUERTO, TIPO_CONEXION, TEMPERATURA, MARCA,
                        MODELO, ID_FABRICANTE, FABRICANTE, NUMERO_SERIE, DIRECCION_MAC, CONTRASENA
                    } = dato;

                    // VERIFICAR QUE EL REGISTO NO TENGA DATOS VACIOS
                    if ((ITEM != undefined && ITEM != '') && (ESTABLECIMIENTO != undefined && ESTABLECIMIENTO != '') &&
                        (DEPARTAMENTO != undefined && DEPARTAMENTO != '') && (NOMBRE_DISPOSITIVO != undefined && NOMBRE_DISPOSITIVO != '') &&
                        (CODIGO != undefined && CODIGO != '') && (DIRECCION_IP != undefined && DIRECCION_IP != '') &&
                        (PUERTO != undefined && PUERTO != '') && (TIPO_CONEXION != undefined && TIPO_CONEXION != '') &&
                        (TEMPERATURA != undefined && TEMPERATURA != '') && (MARCA != undefined && MARCA != '') &&
                        (MODELO != undefined && MODELO != '') && (ID_FABRICANTE != undefined && ID_FABRICANTE != '') &&
                        (FABRICANTE != undefined && FABRICANTE != '') && (NUMERO_SERIE != undefined && NUMERO_SERIE != '') &&
                        (DIRECCION_MAC != undefined && DIRECCION_MAC != '') && (CONTRASENA != undefined && CONTRASENA != '')
                    ) {
                        data.fila = ITEM;
                        data.establecimiento = ESTABLECIMIENTO;
                        data.departamento = DEPARTAMENTO;
                        data.nombre_dispo = NOMBRE_DISPOSITIVO;
                        data.codigo = CODIGO;
                        data.direccion_ip = DIRECCION_IP;
                        data.puerto = PUERTO;
                        data.tipo_conexion = TIPO_CONEXION;
                        data.temperatura = TEMPERATURA;
                        data.marca = MARCA;
                        data.modelo = MODELO;
                        data.id_fabricante = ID_FABRICANTE;
                        data.fabricante = FABRICANTE;
                        data.numero_serie = NUMERO_SERIE;
                        data.direccion_mac = DIRECCION_MAC;
                        data.contrasena = CONTRASENA;
                        data.observacion = 'no registrado';

                        // DISCRIMINACION DE ELEMENTOS IGUALES CODIGO
                        if (duplicados.find((p: any) => p.codigo === data.codigo) == undefined) {
                            // DISCRIMINACION DE ELEMENTOS IGUALES DIRECCION IP
                            if (duplicados1.find((a: any) => a.direccion_ip === data.direccion_ip) == undefined) {
                                // DISCRIMINACION DE ELEMENTOS IGUALES NUMERO DE SERIE
                                if (duplicados2.find((b: any) => b.numero_serie === data.numero_serie) == undefined) {
                                    // DISCRIMINACION DE ELEMENTOS IGUALES DIRECCION MAC
                                    if (duplicados3.find((c: any) => c.direccion_mac === data.direccion_mac) == undefined) {
                                        duplicados3.push(data);
                                    } else {
                                        data.observacion = '4';
                                    }
                                    duplicados2.push(data);
                                } else {
                                    data.observacion = '3';
                                }
                                duplicados1.push(data);
                            } else {
                                data.observacion = '2';
                            }
                            duplicados.push(data);
                        } else {
                            data.observacion = '1';
                        }

                        listDispositivos.push(data);

                    }
                    else {
                        data.fila = ITEM;
                        data.establecimiento = ESTABLECIMIENTO;
                        data.departamento = DEPARTAMENTO;
                        data.nombre_dispo = NOMBRE_DISPOSITIVO;
                        data.codigo = CODIGO;
                        data.direccion_ip = DIRECCION_IP;
                        data.puerto = PUERTO;
                        data.tipo_conexion = TIPO_CONEXION;
                        data.temperatura = TEMPERATURA;
                        data.marca = MARCA;
                        data.modelo = MODELO;
                        data.id_fabricante = ID_FABRICANTE;
                        data.fabricante = FABRICANTE;
                        data.numero_serie = NUMERO_SERIE;
                        data.direccion_mac = DIRECCION_MAC;
                        data.contrasena = CONTRASENA;
                        data.observacion = 'no registrado';

                        if (data.fila == '' || data.fila == undefined) {
                            data.fila = 'error';
                            mensaje = 'error'
                        }
                        if (ESTABLECIMIENTO == undefined) {
                            data.establecimiento = 'No registrado';
                            data.observacion = 'Sucursal no registrado';
                        }
                        if (DEPARTAMENTO == undefined) {
                            data.departamento = 'No registrado';
                            data.observacion = 'Departamento no registrado';
                        }
                        if (NOMBRE_DISPOSITIVO == undefined) {
                            data.nombre_dispo = 'No registrado';
                            data.observacion = 'Nombre dispositivo no registrado';
                        }
                        if (CODIGO == undefined) {
                            data.codigo = 'No registrado';
                            data.observacion = 'Código no registrado';
                        }
                        if (DIRECCION_IP == undefined) {
                            data.direccion_ip = 'No registrado';
                            data.observacion = 'Dirección IP no registrado';
                        }
                        if (PUERTO == undefined) {
                            data.puerto = 'No registrado';
                            data.observacion = 'Puerto no registrado';
                        }
                        if (TIPO_CONEXION == undefined) {
                            data.tipo_conexion = 'No registrado';
                            data.observacion = 'Tipo conexión no registrado';
                        }
                        if (TEMPERATURA == undefined) {
                            data.temperatura = 'No registrado';
                            data.observacion = 'Función temperatura no registrado';
                        }
                        if (MARCA == undefined) {
                            data.marca = 'No registrado';
                            data.observacion = 'Marca no registrado';
                        }
                        if (MODELO == undefined) {
                            data.modelo = ' - ';
                        }
                        if (ID_FABRICANTE == undefined) {
                            data.id_fabricante = ' - ';
                        }
                        if (FABRICANTE == undefined) {
                            data.fabricante = ' - ';
                        }
                        if (NUMERO_SERIE == undefined) {
                            data.numero_serie = 'No registrado';
                            data.observacion = 'Número de serie no registrado';
                        }
                        if (DIRECCION_MAC == undefined) {
                            data.direccion_mac = ' - ';
                        }
                        if (CONTRASENA == undefined) {
                            data.contrasena = ' - ';
                        }

                        if (data.observacion == 'no registrado') {
                            if (data.codigo != 'No registrado' && data.direccion_ip != 'No registrado') {
                                // DISCRIMINACION DE ELEMENTOS IGUALES CODIGO
                                if (duplicados.find((p: any) => p.codigo === data.codigo) == undefined) {
                                    // DISCRIMINACION DE ELEMENTOS IGUALES DIRECCION IP
                                    if (duplicados1.find((a: any) => a.direccion_ip === data.direccion_ip) == undefined) {

                                        if (data.numero_serie != ' - ') {
                                            // DISCRIMINACION DE ELEMENTOS IGUALES NUMERO DE SERIE
                                            if (duplicados2.find((b: any) => b.numero_serie === data.numero_serie) == undefined) {
                                                duplicados2.push(data);
                                            } else {
                                                data.observacion = '3';
                                            }
                                        }
                                        if (data.direccion_mac != ' - ') {
                                            // DISCRIMINACION DE ELEMENTOS IGUALES DIRECCION MAC
                                            if (duplicados3.find((c: any) => c.direccion_mac === data.direccion_mac) == undefined) {
                                                duplicados3.push(data);
                                            } else {
                                                data.observacion = '4';
                                            }
                                        }
                                        duplicados1.push(data);
                                    } else {
                                        data.observacion = '2';
                                    }
                                    duplicados.push(data);
                                } else {
                                    data.observacion = '1';
                                }
                            }
                        }
                        listDispositivos.push(data);

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

                listDispositivos.forEach(async (item: any) => {
                    if (item.observacion == 'no registrado' || item.observacion == '1' ||
                        item.observacion == '2' || item.observacion == '3' || item.observacion == '4') {
                        var validEstablecimiento = await pool.query(
                            `
                            SELECT id FROM e_sucursales WHERE UPPER(nombre) = $1
                            `
                            , [item.establecimiento.toUpperCase()])
                        if (validEstablecimiento.rows[0] != undefined && validEstablecimiento.rows[0] != '') {
                            var validDeparta = await pool.query(
                                `
                                SELECT * FROM ed_departamentos WHERE UPPER(nombre) = $1
                                `
                                , [item.departamento.toUpperCase()])
                            if (validDeparta.rows[0] != undefined && validDeparta.rows[0] != '') {
                                var VERIFICAR_DEP_SUC: any = await pool.query(
                                    `
                                    SELECT * FROM ed_departamentos WHERE id_sucursal = $1 and UPPER(nombre) = $2
                                    `
                                    , [validEstablecimiento.rows[0].id, item.departamento.toUpperCase()]
                                )
                                if (VERIFICAR_DEP_SUC.rows[0] != undefined && VERIFICAR_DEP_SUC.rows[0] != '') {
                                    var validCodigo = await pool.query(
                                        `
                                        SELECT * FROM ed_relojes WHERE UPPER(codigo) = $1
                                        `
                                        , [item.codigo.toString().toUpperCase()])
                                    if (validCodigo.rows[0] == undefined || validCodigo.rows[0] == '') {
                                        if (ipv4Regex.test(item.direccion_ip.toString())) {
                                            var validDireccIP = await pool.query(
                                                `
                                                SELECT * FROM ed_relojes WHERE ip = $1
                                                `
                                                , [item.direccion_ip])
                                            if (validDireccIP.rows[0] == undefined || validDireccIP.rows[0] == '') {
                                                if (regex.test(item.puerto)) {
                                                    if (item.puerto.toString().length > 6) {
                                                        item.observacion = 'El puerto debe ser de 6 dígitos';
                                                    }
                                                    else {
                                                        if (item.tipo_conexion.toString().toLowerCase() == 'interna' || item.tipo_conexion.toString().toLowerCase() == 'externa') {
                                                            if (item.temperatura.toString().toLowerCase() == 'si' || item.temperatura.toString().toLowerCase() == 'no' || item.temperatura.toString().toLowerCase() == ' - ') {
                                                                if (item.marca.toString().toLowerCase() == 'zkteco' || item.marca.toString().toLowerCase() == 'hikvision') {
                                                                    if (item.numero_serie != ' - ') {
                                                                        var VERIFICAR_SERIE = await pool.query(
                                                                            `SELECT id FROM ed_relojes WHERE serie = $1`
                                                                            , [item.numero_serie])
                                                                        if (VERIFICAR_SERIE.rows[0] != undefined && VERIFICAR_SERIE.rows[0] != '') {
                                                                            item.observacion = 'Número de serie ya existe en el sistema';
                                                                        }
                                                                    }

                                                                    if (item.direccion_mac != ' - ') {
                                                                        var VERIFICAR_MAC = await pool.query(
                                                                            `SELECT id FROM ed_relojes WHERE mac = $1`
                                                                            , [item.direccion_mac])
                                                                        if (VERIFICAR_MAC.rows[0] != undefined && VERIFICAR_MAC.rows[0] != '') {
                                                                            item.observacion = 'Dirección MAC ya existe en el sistema';
                                                                        }
                                                                    }
                                                                } else {
                                                                    item.observacion = 'Marca no válida ingrese (ZKTECO / HIKVISION)';
                                                                }


                                                            } else {
                                                                item.observacion = 'Función temperatura no válida ingrese (SI / NO)';
                                                            }
                                                        }
                                                        else {
                                                            item.observacion = 'Conexión no válida ingrese (interna / externa)';
                                                        }
                                                    }
                                                }
                                                else {
                                                    item.observacion = 'Puerto incorrecto (solo números)';
                                                }
                                            }
                                            else {
                                                item.observacion = 'Ya existe en el sistema';
                                            }
                                        }
                                        else {
                                            item.observacion = 'Dirección IP incorrecta';
                                        }
                                    }
                                    else {
                                        item.observacion = 'Ya existe en el sistema';
                                    }
                                }
                                else {
                                    item.observacion = 'Departamento no pertenece a la sucursal';
                                }

                            }
                            else {
                                item.observacion = 'Departamento no existe en el sistema';
                            }
                        }
                        else {
                            item.observacion = 'Sucursal no existe en el sistema';
                        }
                    }
                });

                var tiempo = 2000;
                if (listDispositivos.length > 500 && listDispositivos.length <= 1000) {
                    tiempo = 4000;
                }
                else if (listDispositivos.length > 1000) {
                    tiempo = 7000;
                }

                setTimeout(() => {
                    listDispositivos.sort((a: any, b: any) => {
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

                    //VALIDACIONES DE LOS DATOS
                    listDispositivos.forEach((item: any) => {

                        if (item.direccion_mac != ' - ') {
                            if (direccMac.test(item.direccion_mac.toString())) {
                            }
                            else {
                                item.observacion = 'Formato de dirección MAC incorrecta (numeración hexadecimal)'
                            }
                        }

                        if (item.observacion != undefined) {
                            let arrayObservacion = item.observacion.split(" ");
                            if (arrayObservacion[0] == 'no' || item.observacion == " ") {
                                item.observacion = 'ok';
                            }

                            if (item.observacion == '1') {
                                item.observacion = 'Registro duplicado (código)';
                            }
                            else if (item.observacion == '2') {
                                item.observacion = 'Registro duplicado (dirección IP)';
                            }
                            else if (item.observacion == '3') {
                                item.observacion = 'Registro duplicado (número de serie)';
                            }
                            else if (item.observacion == '4') {
                                item.observacion = 'Registro duplicado (dirección MAC)';
                            }
                        }

                        // VALIDA SI LOS DATOS DE LA COLUMNA N SON NUMEROS.
                        if (typeof item.fila === 'number' && !isNaN(item.fila)) {
                            // CONDICION PARA VALIDAR SI EN LA NUMERACION EXISTE UN NUMERO QUE SE REPITE DARA ERROR.
                            if (item.fila == filaDuplicada) {
                                mensaje = 'error';
                            }
                        }
                        else {
                            return mensaje = 'error';
                        }

                        filaDuplicada = item.fila;
                    });
                    if (mensaje == 'error') {
                        listDispositivos = undefined;
                    }
                    return res.jsonp({ message: mensaje, data: listDispositivos });
                }, tiempo)
            }

        } catch (error) {
            return res.status(500).jsonp({ message: error });
        }

    }

    // METODO PARA CARGAR DATOS DE PLANTILLA   **USADO
    public async CargaPlantillaRelojes(req: Request, res: Response): Promise<any> {
        try {
            const { plantilla, user_name, ip } = req.body;
            var contador = 1;
            var respuesta: any;

            plantilla.forEach(async (data: any) => {
                // DATOS DE LA PLANTILLA INGRESADA
                const { establecimiento, departamento, nombre_dispo, codigo, direccion_ip, puerto, tipo_conexion,
                    temperatura, marca, modelo, id_fabricante, fabricante, numero_serie, direccion_mac, contrasena } = data;

                // INICIAR TRANSACCION
                await pool.query('BEGIN');

                // BUSCAR ID DE LA SUCURSAL INGRESADA
                const id_sucursal = await pool.query(`SELECT id FROM e_sucursales WHERE UPPER(nombre) = $1`,
                    [establecimiento.toUpperCase()]);

                const id_departamento = await pool.query(
                    `
                    SELECT id FROM ed_departamentos WHERE UPPER(nombre) = $1 AND id_sucursal = $2
                    `
                    , [departamento.toUpperCase(), id_sucursal.rows[0]['id']]);


                if (id_sucursal.rowCount === 0 || id_departamento.rowCount === 0) {
                    // AUDITORIA
                    await AUDITORIA_CONTROLADOR.InsertarAuditoria({
                        tabla: 'ed_relojes',
                        usuario: user_name,
                        accion: 'I',
                        datosOriginales: '',
                        datosNuevos: '',
                        ip: ip,
                        observacion: `Error al guardar el reloj con nombre: ${nombre_dispo} e ip: ${ip}.`
                    });
                }

                var modelo_data = null
                if (modelo != ' - ') {
                    modelo_data = modelo;
                }

                var contrasenia_data = null
                if (contrasena != ' - ') {
                    contrasenia_data = contrasena;
                }

                var fabricanteID_data = null
                if (id_fabricante != ' - ') {
                    fabricanteID_data = id_fabricante;
                }

                var fabricante_data = null
                if (fabricante != ' - ') {
                    fabricante_data = fabricante;
                }


                var mac_data = null
                if (direccion_mac != ' - ') {
                    mac_data = direccion_mac;
                }

                // VERIFICAR QUE SE HAYA INGRESADO NUMERO DE ACCIONES SI EL DISPOSITIVO LAS TIENE
                var tipo_conexion_boolean = false;
                if (tipo_conexion.toLowerCase() === 'interna') {
                    tipo_conexion_boolean = true;
                }
                else {
                    tipo_conexion_boolean = false;
                }
                var temperatura_boolean = false;
                if (temperatura.toLowerCase() === 'si') {
                    temperatura_boolean = true;
                }
                else {
                    temperatura_boolean = false;
                }

                // REGISTRO DE LOS DATOS DE MODLAIDAD LABORAL
                const response: QueryResult = await pool.query(
                    `
                    INSERT INTO ed_relojes (id_sucursal, id_departamento, nombre, ip, puerto, contrasenia, marca, modelo, serie, 
                        id_fabricacion, fabricante, mac, tipo_conexion, temperatura, codigo) 
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15) RETURNING *
                    `
                    , [id_sucursal.rows[0]['id'], id_departamento.rows[0]['id'], nombre_dispo, direccion_ip, puerto, contrasenia_data, marca,
                        modelo_data, numero_serie, fabricanteID_data, fabricante_data, mac_data, tipo_conexion_boolean, temperatura_boolean, codigo]);

                const [reloj_ingre] = response.rows;

                // AUDITORIA
                await AUDITORIA_CONTROLADOR.InsertarAuditoria({
                    tabla: 'ed_relojes',
                    usuario: user_name,
                    accion: 'I',
                    datosOriginales: '',
                    datosNuevos: `{"nombre": "${nombre_dispo}", "ip": "${direccion_ip}", "puerto": "${puerto}", "contrasenia": "${contrasena}", "marca": "${marca}", "modelo": "${modelo}", "serie": "${numero_serie}", "id_fabricacion": "${id_fabricante}", "fabricante": "${fabricante}", "mac": "${direccion_mac}", "tipo_conexion": "${tipo_conexion}", "id_sucursal": "${id_sucursal.rows[0]['id']}", "id_departamento": "${id_departamento.rows[0]['id']}", "id": "${codigo}", "temperatura": "${temperatura}"}`,
                    ip: ip,
                    observacion: null
                });

                // FINALIZAR TRANSACCION
                await pool.query('COMMIT');

                if (contador === plantilla.length) {
                    if (reloj_ingre) {
                        return respuesta = res.status(200).jsonp({ message: 'ok' })
                    }
                    else {
                        return respuesta = res.status(404).jsonp({ message: 'error' })
                    }
                }
                contador = contador + 1;
            });

        } catch (error) {
            // ROLLBACK SI HAY ERROR
            await pool.query('ROLLBACK');
            return res.status(500).jsonp({ message: error });
        }
    }

}

const RELOJES_CONTROLADOR = new RelojesControlador();

export default RELOJES_CONTROLADOR;
