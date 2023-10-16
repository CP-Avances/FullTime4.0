import { QueryResult } from 'pg';
import { Request, Response } from 'express';
import {
    enviarMail, email, nombre, cabecera_firma, pie_firma, servidor, puerto, Credenciales, fechaHora,
    FormatearFecha, FormatearHora, dia_completo
} from '../../libs/settingsMail';
import { ObtenerRutaPermisos } from '../../libs/accesoCarpetas';
import fs from 'fs';
import pool from '../../database';
import path from 'path';
import moment from 'moment';
moment.locale('es');

const builder = require('xmlbuilder');

class PermisosControlador {


    // METODO PARA BUSCAR NUEMRO DE PERMISO
    public async ObtenerNumPermiso(req: Request, res: Response): Promise<any> {
        const { id_empleado } = req.params;
        const NUMERO_PERMISO = await pool.query(
            `
            SELECT MAX(p.num_permiso) FROM permisos AS p, empleados AS e 
            WHERE p.codigo = e.codigo AND e.id = $1
            `
            , [id_empleado]);
        if (NUMERO_PERMISO.rowCount > 0) {
            return res.jsonp(NUMERO_PERMISO.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'No se encuentran registros.' }).end;
        }
    }

    // CONSULTA DE PERMISOS SOLICITADOS POR DIAS
    public async BuscarPermisosTotales(req: Request, res: Response) {

        try {
            const { fec_inicio, fec_final, codigo } = req.body;

            console.log('ingresa ', fec_inicio, ' ', fec_final, ' ', codigo)


            const PERMISO = await pool.query(
                `
                    SELECT id FROM permisos 
                        WHERE ((fec_inicio::date BETWEEN $1 AND $2) OR (fec_final::date BETWEEN $1 AND $2)) 
                        AND codigo = $3
                        AND (estado = 2 OR estado = 3 OR estado = 1)
                    `
                , [fec_inicio, fec_final, codigo]);
            return res.jsonp(PERMISO.rows)
        } catch (error) {
            return res.jsonp({ message: 'error' });
        }
    }

    // CONSULTA DE PERMISOS SOLICITADOS POR DIAS
    public async BuscarPermisosDias(req: Request, res: Response) {
        try {
            const { fec_inicio, fec_final, codigo } = req.body;
            const PERMISO = await pool.query(
                `
                SELECT id FROM permisos 
                    WHERE ((fec_inicio::date BETWEEN $1 AND $2) OR (fec_final::date BETWEEN $1 AND $2)) 
                    AND codigo = $3 AND dia != 0
                    AND (estado = 2 OR estado = 3 OR estado = 1)
                `
                , [fec_inicio, fec_final, codigo]);
            return res.jsonp(PERMISO.rows)
        } catch (error) {
            return res.jsonp({ message: 'error' });
        }
    }

    // CONSULTA DE PERMISOS SOLICITADOS POR DIAS
    public async BuscarPermisosHoras(req: Request, res: Response) {
        try {
            const { fec_inicio, fec_final, hora_inicio, hora_final, codigo } = req.body;
            console.log('ver data ', fec_inicio, fec_final, hora_inicio, hora_final, codigo)
            const PERMISO = await pool.query(
                `
                SELECT id FROM permisos 
                WHERE (($1 BETWEEN fec_inicio::date AND fec_final::date) 
                    OR ($2 BETWEEN fec_inicio::date AND fec_final::date )) 
                    AND codigo = $5 
                    AND dia = 0
                    AND (($3 BETWEEN hora_salida AND hora_ingreso) OR ($4 BETWEEN hora_salida AND hora_ingreso)) 
                    AND (estado = 2 OR estado = 3 OR estado = 1)
                `
                , [fec_inicio, fec_final, hora_inicio, hora_final, codigo]);
            return res.jsonp(PERMISO.rows)
        } catch (error) {
            return res.jsonp({ message: 'error' });
        }
    }

    // CONSULTA DE PERMISOS SOLICITADOS POR DIAS - ACTUALIZACION
    public async BuscarPermisosTotalesEditar(req: Request, res: Response) {
        try {
            const { fec_inicio, fec_final, codigo, id } = req.body;
            const PERMISO = await pool.query(
                `
                    SELECT id FROM permisos 
                        WHERE ((fec_inicio::date BETWEEN $1 AND $2) OR (fec_final::date BETWEEN $1 AND $2)) 
                        AND codigo = $3
                        AND (estado = 2 OR estado = 3 OR estado = 1) AND NOT id = $4
                    `
                , [fec_inicio, fec_final, codigo, id]);
            return res.jsonp(PERMISO.rows)
        } catch (error) {
            return res.jsonp({ message: 'error' });
        }
    }

    // CONSULTA DE PERMISOS SOLICITADOS POR DIAS - ACTUALIZACION
    public async BuscarPermisosDiasEditar(req: Request, res: Response) {
        try {
            const { fec_inicio, fec_final, codigo, id } = req.body;
            const PERMISO = await pool.query(
                `
                SELECT id FROM permisos 
                    WHERE ((fec_inicio::date BETWEEN $1 AND $2) OR (fec_final::date BETWEEN $1 AND $2)) 
                    AND codigo = $3 AND dia != 0
                    AND (estado = 2 OR estado = 3 OR estado = 1) AND NOT id = $4
                `
                , [fec_inicio, fec_final, codigo, id]);
            return res.jsonp(PERMISO.rows)
        } catch (error) {
            return res.jsonp({ message: 'error' });
        }
    }


    // CONSULTA DE PERMISOS SOLICITADOS POR DIAS
    public async BuscarPermisosHorasEditar(req: Request, res: Response) {
        try {
            const { fec_inicio, fec_final, hora_inicio, hora_final, codigo, id } = req.body;
            const PERMISO = await pool.query(
                `
                SELECT id FROM permisos 
                WHERE (($1 BETWEEN fec_inicio::date AND fec_final::date) 
                    OR ($2 BETWEEN fec_inicio::date AND fec_final::date )) 
                    AND codigo = $5 
                    AND dia = 0
                    AND (($3 BETWEEN hora_salida AND hora_ingreso) OR ($4 BETWEEN hora_salida AND hora_ingreso)) 
                    AND (estado = 2 OR estado = 3 OR estado = 1) AND NOT id = $6
                `
                , [fec_inicio, fec_final, hora_inicio, hora_final, codigo, id]);
            return res.jsonp(PERMISO.rows)
        } catch (error) {
            return res.jsonp({ message: 'error' });
        }
    }

    // METODO PARA CREAR PERMISOS
    public async CrearPermisos(req: Request, res: Response): Promise<Response> {

        const { fec_creacion, descripcion, fec_inicio, fec_final, dia, legalizado, dia_libre,
            id_tipo_permiso, id_empl_contrato, id_peri_vacacion, hora_numero, num_permiso,
            estado, id_empl_cargo, hora_salida, hora_ingreso, codigo,
            depa_user_loggin } = req.body;

        const response: QueryResult = await pool.query(
            `
            INSERT INTO permisos (fec_creacion, descripcion, fec_inicio, fec_final, dia, legalizado, 
                dia_libre, id_tipo_permiso, id_empl_contrato, id_peri_vacacion, hora_numero, num_permiso, 
                estado, id_empl_cargo, hora_salida, hora_ingreso, codigo) 
            VALUES( $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17 ) 
                RETURNING * 
            `,
            [fec_creacion, descripcion, fec_inicio, fec_final, dia, legalizado, dia_libre,
                id_tipo_permiso, id_empl_contrato, id_peri_vacacion, hora_numero, num_permiso,
                estado, id_empl_cargo, hora_salida, hora_ingreso, codigo]);

        const [objetoPermiso] = response.rows;

        if (!objetoPermiso) return res.status(404).jsonp({ message: 'Solicitud no registrada.' })

        const permiso = objetoPermiso
        const JefesDepartamentos = await pool.query(
            `
            SELECT n.id_departamento, cg.nombre, n.id_dep_nivel, n.dep_nivel_nombre, n.nivel,
                da.estado, dae.id_contrato, da.id_empl_cargo, (dae.nombre || ' ' || dae.apellido) as fullname,
                dae.cedula, dae.correo, c.permiso_mail, c.permiso_noti, dae.id AS id_aprueba 
            FROM nivel_jerarquicodep AS n, depa_autorizaciones AS da, datos_actuales_empleado AS dae,
                config_noti AS c, cg_departamentos AS cg
            WHERE n.id_departamento = $1
                AND da.id_departamento = n.id_dep_nivel
                AND dae.id_cargo = da.id_empl_cargo
                AND dae.id = c.id_empleado
                AND cg.id = n.id_departamento
            ORDER BY nivel ASC
            `
            ,
            [depa_user_loggin]).then((result: any) => { return result.rows });

        if (JefesDepartamentos.length === 0) {
            return res.status(400)
                .jsonp({
                    message: `Ups!!! algo salio mal. 
            Solicitud ingresada, pero es necesario verificar configuraciones jefes de departamento.`,
                    permiso: permiso
                });
        }
        else {
            permiso.EmpleadosSendNotiEmail = JefesDepartamentos
            return res.status(200).jsonp(permiso);
        }
    }

    // METODO PARA EDITAR SOLICITUD DE PERMISOS
    public async EditarPermiso(req: Request, res: Response): Promise<Response> {

        const id = req.params.id;

        const { descripcion, fec_inicio, fec_final, dia, dia_libre, id_tipo_permiso, hora_numero, num_permiso,
            hora_salida, hora_ingreso, depa_user_loggin, id_peri_vacacion, fec_edicion } = req.body;

        console.log('entra ver permiso')
        const response: QueryResult = await pool.query(
            `
                    UPDATE permisos SET descripcion = $1, fec_inicio = $2, fec_final = $3, dia = $4, dia_libre = $5, 
                    id_tipo_permiso = $6, hora_numero = $7, num_permiso = $8, hora_salida = $9, hora_ingreso = $10,
                    id_peri_vacacion = $11, fec_edicion = $12
                    WHERE id = $13 RETURNING *
                `
            , [descripcion, fec_inicio, fec_final, dia, dia_libre, id_tipo_permiso, hora_numero, num_permiso,
                hora_salida, hora_ingreso, id_peri_vacacion, fec_edicion, id]);

        const [objetoPermiso] = response.rows;

        if (!objetoPermiso) return res.status(404).jsonp({ message: 'Solicitud no registrada.' })

        const permiso = objetoPermiso
        console.log(permiso);
        console.log(req.query);

        const JefesDepartamentos = await pool.query(
            `
            SELECT n.id_departamento, cg.nombre, n.id_dep_nivel, n.dep_nivel_nombre, n.nivel,
                da.estado, dae.id_contrato, da.id_empl_cargo, (dae.nombre || ' ' || dae.apellido) as fullname,
                dae.cedula, dae.correo, c.permiso_mail, c.permiso_noti 
            FROM nivel_jerarquicodep AS n, depa_autorizaciones AS da, datos_actuales_empleado AS dae,
                config_noti AS c, cg_departamentos AS cg 
            WHERE n.id_departamento = $1
                AND da.id_departamento = n.id_dep_nivel
                AND dae.id_cargo = da.id_empl_cargo
                AND dae.id = c.id_empleado
                AND cg.id = n.id_departamento
            ORDER BY nivel ASC
            `
            ,
            [depa_user_loggin]).then((result: any) => { return result.rows });

        if (JefesDepartamentos.length === 0) {
            return res.status(400)
                .jsonp({
                    message: `Ups!!! algo salio mal. 
                Solicitud ingresada, pero es necesario verificar configuraciones jefes de departamento.`,
                    permiso: permiso
                });
        }
        else {
            permiso.EmpleadosSendNotiEmail = JefesDepartamentos
            return res.status(200).jsonp(permiso);
        }
    }



    // REGISTRAR DOCUMENTO DE RESPALDO DE PERMISO  
    public async GuardarDocumentoPermiso(req: Request, res: Response): Promise<any> {

        // FECHA DEL SISTEMA
        var fecha = moment();
        var anio = fecha.format('YYYY');
        var mes = fecha.format('MM');
        var dia = fecha.format('DD');

        // LEER DATOS DE IMAGEN
        let id = req.params.id
        let { archivo, codigo } = req.params;

        const permiso = await pool.query(
            `
            SELECT num_permiso FROM permisos WHERE id = $1
            `
            , [id]);

        let documento = permiso.rows[0].num_permiso + '_' + codigo + '_' + anio + '_' + mes + '_' + dia + '_' + req.file?.originalname;
        let separador = path.sep;

        // ACTUALIZAR REGISTRO
        await pool.query(
            `
             UPDATE permisos SET documento = $2 WHERE id = $1
             `, [id, documento]);

        res.jsonp({ message: 'Documento actualizado.' });

        if (archivo != 'null' && archivo != '' && archivo != null) {
            if (archivo != documento) {
                let ruta = await ObtenerRutaPermisos(codigo) + separador + archivo;
                fs.unlinkSync(ruta);
            }
        }
    }

    // ELIMINAR DOCUMENTO DE RESPALDO DE PERMISO  
    public async EliminarDocumentoPermiso(req: Request, res: Response): Promise<void> {

        const { id, archivo, codigo } = req.body
        let separador = path.sep;

        // ACTUALIZAR REGISTRO
        await pool.query(
            `
            UPDATE permisos SET documento = null WHERE id = $1
            `
            , [id]);

        res.jsonp({ message: 'Documento eliminado.' });

        if (archivo != 'null' && archivo != '' && archivo != null) {
            let ruta = await ObtenerRutaPermisos(codigo) + separador + archivo;
            fs.unlinkSync(ruta);
        }
    }

    // METODO DE BUSQUEDA DE PERMISOS POR ID DE EMPLEADO
    public async ObtenerPermisoEmpleado(req: Request, res: Response) {
        try {
            const { id_empleado } = req.params;
            const PERMISO = await pool.query(
                `
                SELECT p.id, p.fec_creacion, p.descripcion, p.fec_inicio,
                    p.fec_final, p.dia, p.hora_numero, p.legalizado, p.estado, p.dia_libre, 
                    p.id_tipo_permiso, p.id_empl_contrato, p.id_peri_vacacion, p.num_permiso, 
                    p.documento, p.hora_salida, p.hora_ingreso, p.codigo, 
                    t.descripcion AS nom_permiso, t.tipo_descuento 
                FROM permisos AS p, cg_tipo_permisos AS t, empleados AS e
                WHERE p.id_tipo_permiso = t.id AND p.codigo = e.codigo AND e.id = $1 
                ORDER BY p.num_permiso DESC
                    `, [id_empleado]);
            return res.jsonp(PERMISO.rows)
        } catch (error) {
            return res.jsonp(null);
        }
    }

    // METODO PARA OBTENER INFORMACION DE UN PERMISO
    public async InformarUnPermiso(req: Request, res: Response) {
        const id = req.params.id_permiso
        const PERMISOS = await pool.query(
            `
            SELECT p.*, tp.descripcion AS tipo_permiso, cr.descripcion AS regimen, da.nombre, da.apellido,
                da.cedula, s.nombre AS sucursal, c.descripcion AS ciudad, e.nombre AS empresa, tc.cargo
            FROM permisos AS p, cg_tipo_permisos AS tp, empl_contratos AS ec, cg_regimenes AS cr,
                datos_actuales_empleado AS da, empl_cargos AS ce, sucursales AS s, ciudades AS c, cg_empresa AS e,
				tipo_cargo AS tc
            WHERE p.id_tipo_permiso = tp.id AND ec.id = p.id_empl_contrato AND cr.id = ec.id_regimen
                AND da.codigo = p.codigo AND ce.id_empl_contrato = p.id_empl_contrato
                AND s.id = ce.id_sucursal AND s.id_ciudad = c.id AND s.id_empresa = e.id AND tc.id = ce.cargo
                AND p.id = $1
            `,
            [id]);
        if (PERMISOS.rowCount > 0) {
            return res.json(PERMISOS.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'No se encuentran registros.' });
        }
    }


    // METODO PARA ELIMINAR PERMISO
    public async EliminarPermiso(req: Request, res: Response): Promise<Response> {
        let { id_permiso, doc, codigo } = req.params;
        let separador = path.sep;
        await pool.query(
            `
            DELETE FROM realtime_noti where id_permiso = $1
            `
            , [id_permiso]);

        await pool.query(
            `
            DELETE FROM autorizaciones WHERE id_permiso = $1
            `
            , [id_permiso]);

        const response: QueryResult = await pool.query(
            `
            DELETE FROM permisos WHERE id = $1 RETURNING *
            `
            , [id_permiso]);

        if (doc != 'null' && doc != '' && doc != null) {
            console.log(id_permiso, doc, ' entra ');
            let ruta = await ObtenerRutaPermisos(codigo) + separador + doc;
            fs.unlinkSync(ruta);
        }

        const [objetoPermiso] = response.rows;

        if (objetoPermiso) {
            return res.status(200).jsonp(objetoPermiso)
        }
        else {
            return res.status(404).jsonp({ message: 'Solicitud no eliminada.' })
        }
    }

    // METODO PARA CREAR ARCHIVO XML
    public async FileXML(req: Request, res: Response): Promise<any> {
        var xml = builder.create('root').ele(req.body).end({ pretty: true });
        console.log(req.body.userName);
        let filename = "Permisos-" + req.body.userName + '-' + req.body.userId + '-' + new Date().getTime() + '.xml';
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

    // BUSQUEDA DE DOCUMENTO PERMISO
    public async ObtenerDocumentoPermiso(req: Request, res: Response): Promise<any> {
        const docs = req.params.docs;
        const { codigo } = req.params;
        // TRATAMIENTO DE RUTAS
        let separador = path.sep;
        let ruta = await ObtenerRutaPermisos(codigo) + separador + docs;
        res.sendFile(path.resolve(ruta));
    }

    /** ********************************************************************************************* **
     ** *         METODO PARA ENVIO DE CORREO ELECTRONICO DE SOLICITUDES DE PERMISOS                * ** 
     ** ********************************************************************************************* **/

    // METODO PARA ENVIAR CORREO ELECTRONICO DESDE APLICACION WEB
    public async EnviarCorreoWeb(req: Request, res: Response): Promise<void> {

        var tiempo = fechaHora();
        var fecha = await FormatearFecha(tiempo.fecha_formato, dia_completo);
        var hora = await FormatearHora(tiempo.hora);

        const path_folder = path.resolve('logos');

        var datos = await Credenciales(req.id_empresa);

        if (datos === 'ok') {

            const { id_empl_contrato, id_dep, correo, id_suc, desde, hasta, h_inicio, h_fin,
                observacion, estado_p, solicitud, tipo_permiso, dias_permiso, horas_permiso,
                solicitado_por, id, asunto, tipo_solicitud, proceso } = req.body;

            const correoInfoPidePermiso = await pool.query(
                `
                SELECT e.id, e.correo, e.nombre, e.apellido, 
                    e.cedula, ecr.id_departamento, ecr.id_sucursal, ecr.id AS cargo, tc.cargo AS tipo_cargo, 
                    d.nombre AS departamento 
                FROM empl_contratos AS ecn, empleados AS e, empl_cargos AS ecr, tipo_cargo AS tc, 
                    cg_departamentos AS d 
                WHERE ecn.id = $1 AND ecn.id_empleado = e.id AND 
                    (SELECT MAX(cargo_id) AS cargo FROM datos_empleado_cargo WHERE empl_id = e.id ) = ecr.id 
                    AND tc.id = ecr.cargo AND d.id = ecr.id_departamento ORDER BY cargo DESC
                `
                , [id_empl_contrato]);

            // codigo para enviar notificacion o correo al jefe de su propio departamento, independientemente del nivel.
            // && obj.id_dep === correoInfoPidePermiso.rows[0].id_departamento && obj.id_suc === correoInfoPidePermiso.rows[0].id_sucursal

            var url = `${process.env.URL_DOMAIN}/ver-permiso`;

            let data = {
                to: correo,
                from: email,
                subject: asunto,
                html: `
                        <body>
                            <div style="text-align: center;">
                                <img width="25%" height="25%" src="cid:cabeceraf"/>
                            </div>
                            <br>
                            <p style="color:rgb(11, 22, 121); font-family: Arial; font-size:12px; line-height: 1em;">
                                El presente correo es para informar que se ha ${proceso} la siguiente solicitud de permiso: <br>  
                            </p>
                            <h3 style="font-family: Arial; text-align: center;">DATOS DEL SOLICITANTE</h3>
                            <p style="color:rgb(11, 22, 121); font-family: Arial; font-size:12px; line-height: 1em;">
                                <b>Empresa:</b> ${nombre} <br>   
                                <b>Asunto:</b> ${asunto} <br> 
                                <b>Colaborador que envía:</b> ${correoInfoPidePermiso.rows[0].nombre} ${correoInfoPidePermiso.rows[0].apellido} <br>
                                <b>Número de cédula:</b> ${correoInfoPidePermiso.rows[0].cedula} <br>
                                <b>Cargo:</b> ${correoInfoPidePermiso.rows[0].tipo_cargo} <br>
                                <b>Departamento:</b> ${correoInfoPidePermiso.rows[0].departamento} <br>
                                <b>Generado mediante:</b> Aplicación Web <br>
                                <b>Fecha de envío:</b> ${fecha} <br> 
                                <b>Hora de envío:</b> ${hora} <br><br> 
                            </p>
                            <h3 style="font-family: Arial; text-align: center;">INFORMACIÓN DE LA SOLICITUD</h3>
                                <p style="color:rgb(11, 22, 121); font-family: Arial; font-size:12px; line-height: 1em;">
                                    <b>Motivo:</b> ${tipo_permiso} <br>   
                                    <b>Registro de solicitud:</b> ${solicitud} <br> 
                                    <b>Desde:</b> ${desde} ${h_inicio} <br>
                                    <b>Hasta:</b> ${hasta} ${h_fin} <br>
                                    <b>Observación:</b> ${observacion} <br>
                                    <b>Días permiso:</b> ${dias_permiso} <br>
                                    <b>Horas permiso:</b> ${horas_permiso} <br>
                                    <b>Estado:</b> ${estado_p} <br><br>
                                    <b>${tipo_solicitud}:</b> ${solicitado_por} <br><br>
                                    <a href="${url}/${id}">Dar clic en el siguiente enlace para revisar solicitud de permiso.</a> <br><br>
                                </p>
                            <p style="font-family: Arial; font-size:12px; line-height: 1em;">
                                <b>Gracias por la atención</b><br>
                                <b>Saludos cordiales,</b> <br><br>
                            </p>
                            <img src="cid:pief" width="50%" height="50%"/>
                        </body>
                    `,
                attachments: [
                    {
                        filename: 'cabecera_firma.jpg',
                        path: `${path_folder}/${cabecera_firma}`,
                        cid: 'cabeceraf' // COLOCAR EL MISMO cid EN LA ETIQUETA html img src QUE CORRESPONDA
                    },
                    {
                        filename: 'pie_firma.jpg',
                        path: `${path_folder}/${pie_firma}`,
                        cid: 'pief' //COLOCAR EL MISMO cid EN LA ETIQUETA html img src QUE CORRESPONDA
                    }]
            };

            var corr = enviarMail(servidor, parseInt(puerto));
            corr.sendMail(data, function (error: any, info: any) {
                if (error) {
                    console.log('Email error: ' + error);
                    corr.close();
                    return res.jsonp({ message: 'error' });
                } else {
                    console.log('Email sent: ' + info.response);
                    corr.close();
                    return res.jsonp({ message: 'ok' });
                }
            });
        }
        else {
            res.jsonp({ message: 'Ups!!! algo salio mal. No fue posible enviar correo electrónico.' });
        }
    }

    // METODO PARA ENVIAR CORREO ELECTRONICO PARA EDITAR PERMISOS DESDE APLICACION WEB
    public async EnviarCorreoWebEditar(req: Request, res: Response): Promise<void> {

        var tiempo = fechaHora();
        var fecha = await FormatearFecha(tiempo.fecha_formato, dia_completo);
        var hora = await FormatearHora(tiempo.hora);

        const path_folder = path.resolve('logos');

        var datos = await Credenciales(req.id_empresa);

        if (datos === 'ok') {

            const { id_empl_contrato, id_dep, correo, id_suc, desde, hasta, h_inicio, h_fin,
                observacion, estado_p, solicitud, tipo_permiso, dias_permiso, horas_permiso,
                solicitado_por, id, asunto, tipo_solicitud, proceso, adesde, ahasta, ah_inicio, ah_fin,
                aobservacion, aestado_p, asolicitud, atipo_permiso, adias_permiso, ahoras_permiso } = req.body;

            const correoInfoPidePermiso = await pool.query(
                `
                    SELECT e.id, e.correo, e.nombre, e.apellido, 
                        e.cedula, ecr.id_departamento, ecr.id_sucursal, ecr.id AS cargo, tc.cargo AS tipo_cargo, 
                        d.nombre AS departamento 
                    FROM empl_contratos AS ecn, empleados AS e, empl_cargos AS ecr, tipo_cargo AS tc, 
                        cg_departamentos AS d 
                    WHERE ecn.id = $1 AND ecn.id_empleado = e.id AND 
                        (SELECT MAX(cargo_id) AS cargo FROM datos_empleado_cargo WHERE empl_id = e.id ) = ecr.id 
                        AND tc.id = ecr.cargo AND d.id = ecr.id_departamento ORDER BY cargo DESC
                    `,
                [id_empl_contrato]);

            // codigo para enviar notificacion o correo al jefe de su propio departamento, independientemente del nivel.
            // && obj.id_dep === correoInfoPidePermiso.rows[0].id_departamento && obj.id_suc === correoInfoPidePermiso.rows[0].id_sucursal

            var url = `${process.env.URL_DOMAIN}/ver-permiso`;

            let data = {
                to: correo,
                from: email,
                subject: asunto,
                html: `
                            <body>
                                <div style="text-align: center;">
                                    <img width="25%" height="25%" src="cid:cabeceraf"/>
                                </div>
                                <br>
                                <p style="color:rgb(11, 22, 121); font-family: Arial; font-size:12px; line-height: 1em;">
                                    El presente correo es para informar que se ha ${proceso} la siguiente solicitud de permiso: <br>  
                                </p>
                                <h3 style="font-family: Arial; text-align: center;">DATOS DEL SOLICITANTE</h3>
                                <p style="color:rgb(11, 22, 121); font-family: Arial; font-size:12px; line-height: 1em;">
                                    <b>Empresa:</b> ${nombre} <br>   
                                    <b>Asunto:</b> ${asunto} <br> 
                                    <b>Colaborador que envía:</b> ${correoInfoPidePermiso.rows[0].nombre} ${correoInfoPidePermiso.rows[0].apellido} <br>
                                    <b>Número de cédula:</b> ${correoInfoPidePermiso.rows[0].cedula} <br>
                                    <b>Cargo:</b> ${correoInfoPidePermiso.rows[0].tipo_cargo} <br>
                                    <b>Departamento:</b> ${correoInfoPidePermiso.rows[0].departamento} <br>
                                    <b>Generado mediante:</b> Aplicación Web <br>
                                    <b>Fecha de envío:</b> ${fecha} <br> 
                                    <b>Hora de envío:</b> ${hora} <br><br> 
                                </p>
                                <h3 style="font-family: Arial; text-align: center;">INFORMACIÓN DE LA SOLICITUD</h3>
                                <table style='width: 100%;'>
                                    <tr style='font-family: Arial; font-size:14px;'>
                                        <th scope='col' style="text-align: left; border-right: 1px solid #000;">INFORMACIÓN ANTERIOR <br><br></th>
                                        <th scope='col' style="text-align: left;">INFORMACIÓN ACTUAL <br><br></th>
                                    </tr>
    
                                    <tr style="font-family: Arial; font-size:12px; line-height: 1em; text-align: left;">
                                        <td style="text-align: left; border-right: 1px solid #000; color:gray;">
                                            <b>Motivo:</b> ${atipo_permiso} <br>     
                                        </td>
                                        <td style="text-align: left; color:rgb(11, 22, 121);">
                                            <b>Motivo:</b> ${tipo_permiso} <br>
                                        </td>
                                    </tr>
    
                                    <tr style="font-family: Arial; font-size:12px; line-height: 1em; text-align: left;">
                                        <td style="text-align: left; border-right: 1px solid #000; color:gray;">
                                            <b>Registro de solicitud:</b> ${asolicitud} <br> 
                                        </td>
                                        <td style="text-align: left; color:rgb(11, 22, 121);">
                                            <b>Registro de solicitud:</b> ${solicitud} <br> 
                                        </td>
                                    </tr>
    
                                    <tr style="font-family: Arial; font-size:12px; line-height: 1em; text-align: left;">
                                        <td style="text-align: left; border-right: 1px solid #000; color:gray;">
                                            <b>Desde:</b> ${adesde} ${ah_inicio} <br> 
                                        </td>
                                        <td style="text-align: left; color:rgb(11, 22, 121);">
                                            <b>Desde:</b> ${desde} ${h_inicio} <br>  
                                        </td>
                                    </tr>
    
                                    <tr style="font-family: Arial; font-size:12px; line-height: 1em; text-align: left;">
                                        <td style="text-align: left; border-right: 1px solid #000; color:gray;">
                                            <b>Hasta:</b> ${ahasta} ${ah_fin} <br>
                                        </td>
                                        <td style="text-align: left; color:rgb(11, 22, 121);">
                                            <b>Hasta:</b> ${hasta} ${h_fin} <br>  
                                        </td>
                                    </tr>
    
                                    <tr style="font-family: Arial; font-size:12px; line-height: 1em; text-align: left;">
                                        <td style="text-align: left; border-right: 1px solid #000; color:gray;">
                                            <b>Observación:</b> ${aobservacion} <br>
                                        </td>
                                        <td style="text-align: left; color:rgb(11, 22, 121);">
                                            <b>Observación:</b> ${observacion} <br> 
                                        </td>
                                    </tr>
    
                                    <tr style="font-family: Arial; font-size:12px; line-height: 1em; text-align: left;">
                                        <td style="text-align: left; border-right: 1px solid #000; color:gray;">
                                            <b>Días permiso:</b> ${adias_permiso} <br>
                                        </td>
                                        <td style="text-align: left; color:rgb(11, 22, 121);">
                                            <b>Días permiso:</b> ${dias_permiso} <br>
                                        </td>
                                    </tr>
    
                                    <tr style="font-family: Arial; font-size:12px; line-height: 1em; text-align: left;">
                                        <td style="text-align: left; border-right: 1px solid #000; color:gray;">
                                            <b>Horas permiso:</b> ${ahoras_permiso} <br>
                                        </td>
                                        <td style="text-align: left; color:rgb(11, 22, 121);">
                                            <b>Horas permiso:</b> ${horas_permiso} <br>
                                        </td>
                                    </tr>
    
                                    <tr style="font-family: Arial; font-size:12px; line-height: 1em; text-align: left;">
                                        <td style="text-align: left; border-right: 1px solid #000; color:gray;">
                                            <b>Estado:</b> ${aestado_p} <br><br>
                                        </td>
                                        <td style="text-align: left; color:rgb(11, 22, 121);">
                                            <b>Estado:</b> ${estado_p} <br><br>
                                        </td>
                                    </tr>
                                </table>
                                <p style="color:rgb(11, 22, 121); font-family: Arial; font-size:12px; line-height: 1em;">
                                    <b>${tipo_solicitud}:</b> ${solicitado_por} <br><br>
                                    <a href="${url}/${id}">Dar clic en el siguiente enlace para revisar solicitud de permiso.</a> <br><br>
                                </p>
                                <p style="font-family: Arial; font-size:12px; line-height: 1em;">
                                    <b>Gracias por la atención</b><br>
                                    <b>Saludos cordiales,</b> <br><br>
                                </p>
                                <img src="cid:pief" width="50%" height="50%"/>
                            </body>
                        `,
                attachments: [
                    {
                        filename: 'cabecera_firma.jpg',
                        path: `${path_folder}/${cabecera_firma}`,
                        cid: 'cabeceraf' // COLOCAR EL MISMO cid EN LA ETIQUETA html img src QUE CORRESPONDA
                    },
                    {
                        filename: 'pie_firma.jpg',
                        path: `${path_folder}/${pie_firma}`,
                        cid: 'pief' //COLOCAR EL MISMO cid EN LA ETIQUETA html img src QUE CORRESPONDA
                    }]
            };

            var corr = enviarMail(servidor, parseInt(puerto));
            corr.sendMail(data, function (error: any, info: any) {
                if (error) {
                    console.log('Email error: ' + error);
                    corr.close();
                    return res.jsonp({ message: 'error' });
                } else {
                    console.log('Email sent: ' + info.response);
                    corr.close();
                    return res.jsonp({ message: 'ok' });
                }
            });
        }
        else {
            res.jsonp({ message: 'Ups!!! algo salio mal. No fue posible enviar correo electrónico.' });
        }
    }


    /** ********************************************************************************************* **
     ** *         METODO PARA ENVIO DE CORREO ELECTRONICO DE SOLICITUDES DE PERMISOS                * ** 
     ** ********************************************************************************************* **/

    // METODO PARA ENVIAR CORREO ELECTRONICO DESDE APLICACION WEB -- verificar estado
    public async EnviarCorreoWebMultiple(req: Request, res: Response): Promise<void> {

        const usuarios = req.body.usuarios;
        var razon: string = '';

        var tiempo = fechaHora();
        var fecha = await FormatearFecha(tiempo.fecha_formato, dia_completo);
        var hora = await FormatearHora(tiempo.hora);

        const path_folder = path.resolve('logos');

        var datos = await Credenciales(req.id_empresa);

        if (datos === 'ok') {

            const { correo, desde, hasta, h_inicio, h_fin, observacion, estado_p, solicitud, tipo_permiso,
                asunto, tipo_solicitud, proceso, usuario_solicita, tipo } = req.body;

            var tablaHTML = await generarTablaHTMLWeb(usuarios, tipo);

            if (observacion != '' && observacion != undefined) {
                razon = observacion;
            }
            else {
                razon = '...'
            }

            const solicita = await pool.query(
                `
                SELECT de.id, (de.nombre ||' '|| de.apellido) AS empleado, de.cedula, tc.cargo AS tipo_cargo, 
                    d.nombre AS departamento     
                FROM datos_actuales_empleado AS de, empl_cargos AS ec, tipo_cargo AS tc, 
                    cg_departamentos AS d 
                WHERE de.id = $1 AND d.id = de.id_departamento AND ec.id = de.id_cargo AND ec.cargo = tc.id
                `
                , [usuario_solicita]);

            let data = {
                to: correo,
                from: email,
                subject: asunto,
                html:
                    `
                    <body>
                        <div style="text-align: center;">
                             <img width="25%" height="25%" src="cid:cabeceraf"/>
                        </div>
                        <br>
                        <p style="color:rgb(11, 22, 121); font-family: Arial; font-size:12px; line-height: 1em;">
                            El presente correo es para informar que se ha ${proceso} la siguiente solicitud de permiso: <br>  
                        </p>
                        <h3 style="font-family: Arial; text-align: center;">REGISTRO MULTIPLE DE PERMISO</h3>
                        <p style="color:rgb(11, 22, 121); font-family: Arial; font-size:12px; line-height: 1em;">
                            <b>Empresa:</b> ${nombre} <br>   
                            <b>Asunto:</b> ${asunto} <br> 
                            <b>${tipo_solicitud}:</b> ${solicita.rows[0].empleado} <br>
                            <b>Número de cédula:</b> ${solicita.rows[0].cedula} <br>
                            <b>Cargo:</b> ${solicita.rows[0].tipo_cargo} <br>
                            <b>Departamento:</b> ${solicita.rows[0].departamento} <br>
                            <b>Generado mediante:</b> Aplicación Web <br>
                            <b>Fecha de envío:</b> ${fecha} <br> 
                            <b>Hora de envío:</b> ${hora} <br><br> 
                        </p>
                        <h3 style="font-family: Arial; text-align: center;">INFORMACIÓN DE LA SOLICITUD</h3>
                        <p style="color:rgb(11, 22, 121); font-family: Arial; font-size:12px; line-height: 1em;">
                            <b>Motivo:</b> ${tipo_permiso} <br>   
                            <b>Registro de solicitud:</b> ${solicitud} <br> 
                            <b>Desde:</b> ${desde} ${h_inicio} <br>
                            <b>Hasta:</b> ${hasta} ${h_fin} <br>
                            <b>Observación:</b> ${razon} <br>
                            <b>Estado:</b> ${estado_p} <br><br>
                        </p>
                        <div style="font-family: Arial; font-size:15px; margin: auto; text-align: center;">
                            <h3 style="font-family: Arial; text-align: center;">LISTA DE USUARIOS CON PERMISO</h3>
                            ${tablaHTML}
                            <br><br>
                        </div>
                        <p style="font-family: Arial; font-size:12px; line-height: 1em;">
                            <b>Gracias por la atención</b><br>
                            <b>Saludos cordiales,</b> <br><br>
                        </p>
                            <img src="cid:pief" width="50%" height="50%"/>
                        </body>
                       `,
                attachments: [
                    {
                        filename: 'cabecera_firma.jpg',
                        path: `${path_folder}/${cabecera_firma}`,
                        cid: 'cabeceraf' // COLOCAR EL MISMO cid EN LA ETIQUETA html img src QUE CORRESPONDA
                    },
                    {
                        filename: 'pie_firma.jpg',
                        path: `${path_folder}/${pie_firma}`,
                        cid: 'pief' //COLOCAR EL MISMO cid EN LA ETIQUETA html img src QUE CORRESPONDA
                    }]
            };

            var corr = enviarMail(servidor, parseInt(puerto));
            corr.sendMail(data, function (error: any, info: any) {
                if (error) {
                    console.log('Email error: ' + error);
                    corr.close();
                    return res.jsonp({ message: 'error' });
                } else {
                    console.log('Email sent: ' + info.response);
                    corr.close();
                    return res.jsonp({ message: 'ok' });
                }
            });
        }
        else {
            res.jsonp({ message: 'Ups!!! algo salio mal. No fue posible enviar correo electrónico.' });
        }
    }





    public async ListarPermisos(req: Request, res: Response) {
        const PERMISOS = await pool.query('SELECT * FROM permisos');
        if (PERMISOS.rowCount > 0) {
            return res.jsonp(PERMISOS.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'No se encuentran registros' });
        }
    }

    // verificar estado
    public async ListarEstadosPermisos(req: Request, res: Response) {
        const PERMISOS = await pool.query('SELECT p.id, p.fec_creacion, p.descripcion, p.fec_inicio, ' +
            'p.documento, p.fec_final, p.estado, p.id_empl_cargo, e.id AS id_emple_solicita, e.nombre, e.apellido, (e.nombre || \' \' || e.apellido) AS fullname, ' +
            'e.cedula, da.correo, cp.descripcion AS nom_permiso, ec.id AS id_contrato, da.id_departamento AS id_depa, da.codigo, depa.nombre AS depa_nombre FROM permisos AS p, ' +
            'empl_contratos AS ec, empleados AS e, cg_tipo_permisos AS cp, datos_actuales_empleado AS da, cg_departamentos AS depa ' +
            'WHERE p.id_empl_contrato = ec.id AND ' +
            'ec.id_empleado = e.id AND p.id_tipo_permiso = cp.id AND da.id_contrato = ec.id AND depa.id = da.id_departamento AND (p.estado = 1 OR p.estado = 2) ' +
            'ORDER BY estado DESC, fec_creacion DESC');

        if (PERMISOS.rowCount > 0) {
            return res.jsonp(PERMISOS.rows)
        }
        else {
            return res.status(404).jsonp({ message: 'Resource not found' }).end();
        }
    }


// verificar estado
    public async ListarPermisosAutorizados(req: Request, res: Response) {
        const PERMISOS = await pool.query('SELECT p.id, p.fec_creacion, p.descripcion, p.fec_inicio, ' +
            'p.documento,  p.fec_final, p.estado, p.id_empl_cargo, e.id AS id_emple_solicita, e.nombre, e.apellido, (e.nombre || \' \' || e.apellido) AS fullname, ' +
            'e.cedula, cp.descripcion AS nom_permiso, ec.id AS id_contrato, da.id_departamento AS id_depa, da.codigo, depa.nombre AS depa_nombre FROM permisos AS p, ' +
            'empl_contratos AS ec, empleados AS e, cg_tipo_permisos AS cp, datos_actuales_empleado AS da, cg_departamentos AS depa ' +
            'WHERE p.id_empl_contrato = ec.id AND ' +
            'ec.id_empleado = e.id AND p.id_tipo_permiso = cp.id AND da.id_contrato = ec.id AND depa.id = da.id_departamento AND (p.estado = 3 OR p.estado = 4) ' +
            'ORDER BY estado ASC, fec_creacion DESC');
        if (PERMISOS.rowCount > 0) {
            return res.jsonp(PERMISOS.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'No se encuentran registros' });
        }
    }

    public async ObtenerUnPermiso(req: Request, res: Response) {
        const id = req.params.id;
        const PERMISOS = await pool.query('SELECT * FROM permisos WHERE id = $1', [id]);
        if (PERMISOS.rowCount > 0) {
            return res.jsonp(PERMISOS.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'No se encuentran registros' });
        }
    }



    public async ObtenerPermisoContrato(req: Request, res: Response) {
        try {
            const { id_empl_contrato } = req.params;
            const PERMISO = await pool.query('SELECT p.id, p.fec_creacion, p.descripcion, p.fec_inicio, ' +
                'p.fec_final, p.dia, p.hora_numero, p.legalizado, p.estado, p.dia_libre, p.id_tipo_permiso, ' +
                'p.id_empl_contrato, p.id_peri_vacacion, p.num_permiso, p.documento,  ' +
                't.descripcion AS nom_permiso FROM permisos AS p, cg_tipo_permisos AS t ' +
                'WHERE p.id_tipo_permiso = t.id AND p.id_empl_contrato = $1', [id_empl_contrato]);
            return res.jsonp(PERMISO.rows)
        } catch (error) {
            return res.jsonp(null);
        }
    }

    public async ObtenerPermisoEditar(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const PERMISO = await pool.query('SELECT p.id, p.fec_creacion, p.descripcion, p.fec_inicio, ' +
                'p.fec_final, p.dia, p.hora_numero, p.legalizado, p.estado, p.dia_libre, p.id_tipo_permiso, ' +
                'p.id_empl_contrato, p.id_peri_vacacion, p.num_permiso, p.documento, ' +
                'p.hora_salida, p.hora_ingreso, p.codigo, ' +
                't.descripcion AS nom_permiso FROM permisos AS p, cg_tipo_permisos AS t ' +
                'WHERE p.id_tipo_permiso = t.id AND p.id = $1 ORDER BY p.num_permiso DESC', [id]);
            return res.jsonp(PERMISO.rows)
        } catch (error) {
            return res.jsonp(null);
        }
    }



    public async ObtenerDatosSolicitud(req: Request, res: Response) {
        const id = req.params.id_emple_permiso;
        console.log('dato id emple permiso: ', id);

        const SOLICITUD = await pool.query('SELECT * FROM vista_datos_solicitud_permiso WHERE id_emple_permiso = $1', [id]);
        if (SOLICITUD.rowCount > 0) {
            return res.json(SOLICITUD.rows)
        }
        else {
            return res.status(404).json({ text: 'No se encuentran registros' });
        }
    }

    public async ObtenerDatosAutorizacion(req: Request, res: Response) {
        const id = req.params.id_permiso;
        const SOLICITUD = await pool.query('SELECT a.id AS id_autorizacion, a.id_documento AS empleado_estado, ' +
            'p.id AS permiso_id FROM autorizaciones AS a, permisos AS p ' +
            'WHERE p.id = a.id_permiso AND p.id = $1', [id]);
        if (SOLICITUD.rowCount > 0) {
            return res.json(SOLICITUD.rows)
        }
        else {
            return res.status(404).json({ text: 'No se encuentran registros' });
        }
    }


    public async ObtenerFechasPermiso(req: Request, res: Response) {
        const codigo = req.params.codigo;
        const { fec_inicio, fec_final } = req.body;
        const PERMISOS = await pool.query('SELECT pg.fec_hora_horario::date AS fecha, pg.fec_hora_horario::time AS hora, ' +
            'pg.tipo_entr_salida FROM plan_general AS pg WHERE(pg.tipo_entr_salida = \'E\' OR pg.tipo_entr_salida = \'S\') ' +
            'AND pg.codigo = $3 AND(pg.fec_hora_horario:: date = $1 OR pg.fec_hora_horario:: date = $2)',
            [fec_inicio, fec_final, codigo]);
        if (PERMISOS.rowCount > 0) {
            return res.jsonp(PERMISOS.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'No se encuentran registros' });
        }
    }




    /** ************************************************************************************************* **
     ** **                             METODOS PARA REGISTRO DE PERMISOS                               ** ** 
     ** ************************************************************************************************* **/

    // ELIMINAR DOCUMENTO DE PERMISO DESDE APLICACION MOVIL
    public async EliminarPermisoMovil(req: Request, res: Response) {
        let { documento, codigo } = req.params;
        let separador = path.sep;
        if (documento != 'null' && documento != '' && documento != null) {
            let ruta = await ObtenerRutaPermisos(codigo) + separador + documento;
            fs.unlinkSync(ruta);
        }
        res.jsonp({ message: 'ok' });
    }

    // METODO PARA ACTUALIZAR ESTADO DEL PERMISO
    public async ActualizarEstado(req: Request, res: Response): Promise<void> {
        const id = req.params.id;
        const { estado } = req.body;
        await pool.query(
            `
            UPDATE permisos SET estado = $1 WHERE id = $2
            `
            , [estado, id]);
    }

    // METODO PARA OBTENER INFORMACION DE UN PERMISO
    public async ListarUnPermisoInfo(req: Request, res: Response) {
        const id = req.params.id_permiso
        const PERMISOS = await pool.query(
            `
            SELECT p.id, p.fec_creacion, p.descripcion, p.fec_inicio, p.dia, p.hora_salida, p.hora_ingreso, 
            p.hora_numero, p.documento, p.fec_final, p.estado, p.id_empl_cargo, e.nombre, 
            e.apellido, e.cedula, e.id AS id_empleado, e.codigo, cp.id AS id_tipo_permiso, 
            cp.descripcion AS nom_permiso, ec.id AS id_contrato 
            FROM permisos AS p, empl_contratos AS ec, empleados AS e, cg_tipo_permisos AS cp 
            WHERE p.id = $1 AND p.id_empl_contrato = ec.id AND ec.id_empleado = e.id AND 
            p.id_tipo_permiso = cp.id
            `,
            [id]);
        if (PERMISOS.rowCount > 0) {
            return res.json(PERMISOS.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'No se encuentran registros.' });
        }
    }






    // ENVIO DE CORREO AL CREAR UN PERMISO MEDIANTE APLICACION MOVIL
    public async EnviarCorreoPermisoMovil(req: Request, res: Response): Promise<void> {

        var tiempo = fechaHora();
        var fecha = await FormatearFecha(tiempo.fecha_formato, dia_completo);
        var hora = await FormatearHora(tiempo.hora);

        const path_folder = path.resolve('logos');

        var datos = await Credenciales(parseInt(req.params.id_empresa));

        console.log('datos: ', datos);

        if (datos === 'ok') {
            const { id_empl_contrato, id_dep, correo,
                id_suc, desde, hasta, h_inicio, h_fin, observacion, estado_p, solicitud, tipo_permiso,
                dias_permiso, horas_permiso, solicitado_por, asunto, tipo_solicitud, proceso } = req.body;

            console.log('req.body: ', req.body);

            const correoInfoPidePermiso = await pool.query('SELECT e.id, e.correo, e.nombre, e.apellido, ' +
                'e.cedula, ecr.id_departamento, ecr.id_sucursal, ecr.id AS cargo, tc.cargo AS tipo_cargo, ' +
                'd.nombre AS departamento ' +
                'FROM empl_contratos AS ecn, empleados AS e, empl_cargos AS ecr, tipo_cargo AS tc, ' +
                'cg_departamentos AS d ' +
                'WHERE ecn.id = $1 AND ecn.id_empleado = e.id AND ' +
                '(SELECT MAX(cargo_id) AS cargo FROM datos_empleado_cargo WHERE empl_id = e.id ) = ecr.id ' +
                'AND tc.id = ecr.cargo AND d.id = ecr.id_departamento ORDER BY cargo DESC',
                [id_empl_contrato]);

            // codigo para enviar notificacion o correo al jefe de su propio departamento, independientemente del nivel.
            //&& obj.id_dep === correoInfoPidePermiso.rows[0].id_departamento && obj.id_suc === correoInfoPidePermiso.rows[0].id_sucursal

            let data = {
                to: correo,
                from: email,
                subject: asunto,
                html:
                    `
                    <body>
                        <div style="text-align: center;">
                            <img width="25%" height="25%" src="cid:cabeceraf"/>
                        </div>
                        <br>
                        <p style="color:rgb(11, 22, 121); font-family: Arial; font-size:12px; line-height: 1em;">
                            El presente correo es para informar que se ha ${proceso} la siguiente solicitud de permiso: <br>  
                        </p>
                        <h3 style="font-family: Arial; text-align: center;">DATOS DEL SOLICITANTE</h3>
                        <p style="color:rgb(11, 22, 121); font-family: Arial; font-size:12px; line-height: 1em;">
                            <b>Empresa:</b> ${nombre} <br>   
                            <b>Asunto:</b> ${asunto} <br> 
                            <b>Colaborador que envía:</b> ${correoInfoPidePermiso.rows[0].nombre} ${correoInfoPidePermiso.rows[0].apellido} <br>
                            <b>Número de cédula:</b> ${correoInfoPidePermiso.rows[0].cedula} <br>
                            <b>Cargo:</b> ${correoInfoPidePermiso.rows[0].tipo_cargo} <br>
                            <b>Departamento:</b> ${correoInfoPidePermiso.rows[0].departamento} <br>
                            <b>Generado mediante:</b> Aplicación Móvil <br>
                            <b>Fecha de envío:</b> ${fecha} <br> 
                            <b>Hora de envío:</b> ${hora} <br><br> 
                         </p>
                        <h3 style="font-family: Arial; text-align: center;">INFORMACIÓN DE LA SOLICITUD</h3>
                        <p style="color:rgb(11, 22, 121); font-family: Arial; font-size:12px; line-height: 1em;">
                            <b>Motivo:</b> ${tipo_permiso} <br>   
                            <b>Registro de solicitud:</b> ${solicitud} <br> 
                            <b>Desde:</b> ${desde} ${h_inicio} <br>
                            <b>Hasta:</b> ${hasta} ${h_fin} <br>
                            <b>Observación:</b> ${observacion} <br>
                            <b>Días permiso:</b> ${dias_permiso} <br>
                            <b>Horas permiso:</b> ${horas_permiso} <br>
                            <b>Estado:</b> ${estado_p} <br><br>
                            <b>${tipo_solicitud}:</b> ${solicitado_por} <br><br>
                        </p>
                        <p style="font-family: Arial; font-size:12px; line-height: 1em;">
                            <b>Gracias por la atención</b><br>
                            <b>Saludos cordiales,</b> <br><br>
                        </p>
                        <img src="cid:pief" width="50%" height="50%"/>
                    </body>
                    `,
                attachments: [
                    {
                        filename: 'cabecera_firma.jpg',
                        path: `${path_folder}/${cabecera_firma}`,
                        cid: 'cabeceraf' // COLOCAR EL MISMO cid EN LA ETIQUETA html img src QUE CORRESPONDA
                    },
                    {
                        filename: 'pie_firma.jpg',
                        path: `${path_folder}/${pie_firma}`,
                        cid: 'pief' //COLOCAR EL MISMO cid EN LA ETIQUETA html img src QUE CORRESPONDA
                    }]
            };

            var corr = enviarMail(servidor, parseInt(puerto));
            corr.sendMail(data, function (error: any, info: any) {
                if (error) {
                    corr.close();
                    console.log('Email error: ' + error);
                    return res.jsonp({ message: 'error' });
                } else {
                    corr.close();
                    console.log('Email sent: ' + info.response);
                    return res.jsonp({ message: 'ok' });
                }
            });
        }
        else {
            res.jsonp({ message: 'Ups! algo salio mal!!! No fue posible enviar correo electrónico.' + datos });
        }

    }

    // ENVIO DE CORREO AL CREAR UN PERMISO MEDIANTE APLICACION MOVIL
    public async EnviarCorreoPermisoEditarMovil(req: Request, res: Response): Promise<void> {

        var tiempo = fechaHora();
        var fecha = await FormatearFecha(tiempo.fecha_formato, dia_completo);
        var hora = await FormatearHora(tiempo.hora);

        const path_folder = path.resolve('logos');

        var datos = await Credenciales(parseInt(req.params.id_empresa));

        console.log('datos: ', datos);

        if (datos === 'ok') {
            const { id_empl_contrato, id_dep, correo,
                id_suc, desde, hasta, h_inicio, h_fin, observacion, estado_p, solicitud, tipo_permiso,
                dias_permiso, horas_permiso, solicitado_por, asunto, tipo_solicitud, proceso,
                adesde, ahasta, ah_inicio, ah_fin, aobservacion, aestado_p, asolicitud, atipo_permiso, adias_permiso,
                ahoras_permiso } = req.body;

            console.log('req.body: ', req.body);

            const correoInfoPidePermiso = await pool.query('SELECT e.id, e.correo, e.nombre, e.apellido, ' +
                'e.cedula, ecr.id_departamento, ecr.id_sucursal, ecr.id AS cargo, tc.cargo AS tipo_cargo, ' +
                'd.nombre AS departamento ' +
                'FROM empl_contratos AS ecn, empleados AS e, empl_cargos AS ecr, tipo_cargo AS tc, ' +
                'cg_departamentos AS d ' +
                'WHERE ecn.id = $1 AND ecn.id_empleado = e.id AND ' +
                '(SELECT MAX(cargo_id) AS cargo FROM datos_empleado_cargo WHERE empl_id = e.id ) = ecr.id ' +
                'AND tc.id = ecr.cargo AND d.id = ecr.id_departamento ORDER BY cargo DESC',
                [id_empl_contrato]);

            // codigo para enviar notificacion o correo al jefe de su propio departamento, independientemente del nivel.
            //&& obj.id_dep === correoInfoPidePermiso.rows[0].id_departamento && obj.id_suc === correoInfoPidePermiso.rows[0].id_sucursal

            let data = {
                to: correo,
                from: email,
                subject: asunto,
                html:
                    `
                        <body>
                            <div style="text-align: center;">
                                <img width="25%" height="25%" src="cid:cabeceraf"/>
                            </div>
                            <br>
                            <p style="color:rgb(11, 22, 121); font-family: Arial; font-size:12px; line-height: 1em;">
                                El presente correo es para informar que se ha ${proceso} la siguiente solicitud de permiso: <br>  
                            </p>
                            <h3 style="font-family: Arial; text-align: center;">DATOS DEL SOLICITANTE</h3>
                            <p style="color:rgb(11, 22, 121); font-family: Arial; font-size:12px; line-height: 1em;">
                                <b>Empresa:</b> ${nombre} <br>   
                                <b>Asunto:</b> ${asunto} <br> 
                                <b>Colaborador que envía:</b> ${correoInfoPidePermiso.rows[0].nombre} ${correoInfoPidePermiso.rows[0].apellido} <br>
                                <b>Número de cédula:</b> ${correoInfoPidePermiso.rows[0].cedula} <br>
                                <b>Cargo:</b> ${correoInfoPidePermiso.rows[0].tipo_cargo} <br>
                                <b>Departamento:</b> ${correoInfoPidePermiso.rows[0].departamento} <br>
                                <b>Generado mediante:</b> Aplicación Móvil <br>
                                <b>Fecha de envío:</b> ${fecha} <br> 
                                <b>Hora de envío:</b> ${hora} <br><br> 
                             </p>
                             <h3 style="font-family: Arial; text-align: center;">INFORMACIÓN DE LA SOLICITUD</h3>
                             <table style='width: 100%;'>
                                 <tr style='font-family: Arial; font-size:14px;'>
                                     <th scope='col' style="text-align: left; border-right: 1px solid #000;">INFORMACIÓN ANTERIOR <br><br></th>
                                     <th scope='col' style="text-align: left;">INFORMACIÓN ACTUAL <br><br></th>
                                 </tr>
 
                                 <tr style="font-family: Arial; font-size:12px; line-height: 1em; text-align: left;">
                                     <td style="text-align: left; border-right: 1px solid #000; color:gray;">
                                         <b>Motivo:</b> ${atipo_permiso} <br>     
                                     </td>
                                     <td style="text-align: left; color:rgb(11, 22, 121);">
                                         <b>Motivo:</b> ${tipo_permiso} <br>
                                     </td>
                                 </tr>
 
                                 <tr style="font-family: Arial; font-size:12px; line-height: 1em; text-align: left;">
                                     <td style="text-align: left; border-right: 1px solid #000; color:gray;">
                                         <b>Registro de solicitud:</b> ${asolicitud} <br> 
                                     </td>
                                     <td style="text-align: left; color:rgb(11, 22, 121);">
                                         <b>Registro de solicitud:</b> ${solicitud} <br> 
                                     </td>
                                 </tr>
 
                                 <tr style="font-family: Arial; font-size:12px; line-height: 1em; text-align: left;">
                                     <td style="text-align: left; border-right: 1px solid #000; color:gray;">
                                         <b>Desde:</b> ${adesde} ${ah_inicio} <br> 
                                     </td>
                                     <td style="text-align: left; color:rgb(11, 22, 121);">
                                         <b>Desde:</b> ${desde} ${h_inicio} <br>  
                                     </td>
                                 </tr>
 
                                 <tr style="font-family: Arial; font-size:12px; line-height: 1em; text-align: left;">
                                     <td style="text-align: left; border-right: 1px solid #000; color:gray;">
                                         <b>Hasta:</b> ${ahasta} ${ah_fin} <br>
                                     </td>
                                     <td style="text-align: left; color:rgb(11, 22, 121);">
                                         <b>Hasta:</b> ${hasta} ${h_fin} <br>  
                                     </td>
                                 </tr>
 
                                 <tr style="font-family: Arial; font-size:12px; line-height: 1em; text-align: left;">
                                     <td style="text-align: left; border-right: 1px solid #000; color:gray;">
                                         <b>Observación:</b> ${aobservacion} <br>
                                     </td>
                                     <td style="text-align: left; color:rgb(11, 22, 121);">
                                         <b>Observación:</b> ${observacion} <br> 
                                     </td>
                                 </tr>
 
                                 <tr style="font-family: Arial; font-size:12px; line-height: 1em; text-align: left;">
                                     <td style="text-align: left; border-right: 1px solid #000; color:gray;">
                                         <b>Días permiso:</b> ${adias_permiso} <br>
                                     </td>
                                     <td style="text-align: left; color:rgb(11, 22, 121);">
                                         <b>Días permiso:</b> ${dias_permiso} <br>
                                     </td>
                                 </tr>
 
                                 <tr style="font-family: Arial; font-size:12px; line-height: 1em; text-align: left;">
                                     <td style="text-align: left; border-right: 1px solid #000; color:gray;">
                                         <b>Horas permiso:</b> ${ahoras_permiso} <br>
                                     </td>
                                     <td style="text-align: left; color:rgb(11, 22, 121);">
                                         <b>Horas permiso:</b> ${horas_permiso} <br>
                                     </td>
                                 </tr>
 
                                 <tr style="font-family: Arial; font-size:12px; line-height: 1em; text-align: left;">
                                     <td style="text-align: left; border-right: 1px solid #000; color:gray;">
                                         <b>Estado:</b> ${aestado_p} <br><br>
                                     </td>
                                     <td style="text-align: left; color:rgb(11, 22, 121);">
                                         <b>Estado:</b> ${estado_p} <br><br>
                                     </td>
                                 </tr>
                             </table>
                            <p style="color:rgb(11, 22, 121); font-family: Arial; font-size:12px; line-height: 1em;">
                                <b>${tipo_solicitud}:</b> ${solicitado_por} <br><br>
                            </p>
                            <p style="font-family: Arial; font-size:12px; line-height: 1em;">
                                <b>Gracias por la atención</b><br>
                                <b>Saludos cordiales,</b> <br><br>
                            </p>
                            <img src="cid:pief" width="50%" height="50%"/>
                        </body>
                        `,
                attachments: [
                    {
                        filename: 'cabecera_firma.jpg',
                        path: `${path_folder}/${cabecera_firma}`,
                        cid: 'cabeceraf' // COLOCAR EL MISMO cid EN LA ETIQUETA html img src QUE CORRESPONDA
                    },
                    {
                        filename: 'pie_firma.jpg',
                        path: `${path_folder}/${pie_firma}`,
                        cid: 'pief' //COLOCAR EL MISMO cid EN LA ETIQUETA html img src QUE CORRESPONDA
                    }]
            };

            var corr = enviarMail(servidor, parseInt(puerto));
            corr.sendMail(data, function (error: any, info: any) {
                if (error) {
                    corr.close();
                    console.log('Email error: ' + error);
                    return res.jsonp({ message: 'error' });
                } else {
                    corr.close();
                    console.log('Email sent: ' + info.response);
                    return res.jsonp({ message: 'ok' });
                }
            });
        }
        else {
            res.jsonp({ message: 'Ups! algo salio mal!!! No fue posible enviar correo electrónico.' + datos });
        }

    }



}

// METODO PARA CREAR TABLA DE USUARIOS
const generarTablaHTMLWeb = async function (datos: any[], tipo: any): Promise<string> {

    let tablaHtml = "<table style='border-collapse: collapse; width: 100%;'>";
    console.log('ver tipo ---------- ', tipo)
    if (tipo === 'Dias') {
        tablaHtml += "<tr style='background-color: #f2f2f2; text-align: center; font-size: 14px;'>";
        tablaHtml += "<th scope='col'>Código</th>";
        tablaHtml += "<th scope='col'>Usuario</th>";
        tablaHtml += "<th scope='col'>Cédula</th>";
        tablaHtml += "<th scope='col'>Departamento</th>";
        tablaHtml += "<th scope='col'>Permiso</th>";
        tablaHtml += `<th scope='col'>Días permiso</th>`;
        tablaHtml += "<th scope='col'>Solicitud</th>";
        tablaHtml += "</tr>";

        for (const dato of datos) {
            tablaHtml += "<tr style='text-align: center; font-size: 14px;'>"
            tablaHtml += `<td style='border: 1px solid #ddd; padding: 8px;'>${dato.codigo}</td>`;
            tablaHtml += `<td style='border: 1px solid #ddd; padding: 8px;'>${dato.empleado}</td>`;
            tablaHtml += `<td style='border: 1px solid #ddd; padding: 8px;'>${dato.cedula}</td>`;
            tablaHtml += `<td style='border: 1px solid #ddd; padding: 8px;'>${dato.departamento}</td>`;
            tablaHtml += `<td style='border: 1px solid #ddd; padding: 8px;'>${dato.id_permiso}</td>`;
            tablaHtml += `<td style='border: 1px solid #ddd; padding: 8px;'>${dato.dias_laborables}</td>`;
            tablaHtml += `<td style='border: 1px solid #ddd; padding: 8px;'>${dato.estado}</td>`
            tablaHtml += "<tr>"
        }
    }
    else {
        tablaHtml += "<tr style='background-color: #f2f2f2; text-align: center; font-size: 14px;'>";
        tablaHtml += "<th scope='col'>Código</th>";
        tablaHtml += "<th scope='col'>Usuario</th>";
        tablaHtml += "<th scope='col'>Cédula</th>";
        tablaHtml += "<th scope='col'>Departamento</th>";
        tablaHtml += "<th scope='col'>Permiso</th>";
        tablaHtml += `<th scope='col'>Horas permiso</th>`
        tablaHtml += "<th scope='col'>Solicitud</th>";
        tablaHtml += "</tr>";

        for (const dato of datos) {
            tablaHtml += "<tr style='text-align: center; font-size: 14px;'>"
            tablaHtml += `<td style='border: 1px solid #ddd; padding: 8px;'>${dato.codigo}</td>`;
            tablaHtml += `<td style='border: 1px solid #ddd; padding: 8px;'>${dato.empleado}</td>`;
            tablaHtml += `<td style='border: 1px solid #ddd; padding: 8px;'>${dato.cedula}</td>`;
            tablaHtml += `<td style='border: 1px solid #ddd; padding: 8px;'>${dato.departamento}</td>`;
            tablaHtml += `<td style='border: 1px solid #ddd; padding: 8px;'>${dato.id_permiso}</td>`;
            tablaHtml += `<td style='border: 1px solid #ddd; padding: 8px;'>${dato.tiempo_solicitado}</td>`;
            tablaHtml += `<td style='border: 1px solid #ddd; padding: 8px;'>${dato.estado}</td>`
            tablaHtml += "<tr>"
        }
    }

    tablaHtml += "</table>"
    return tablaHtml;
};

export const PERMISOS_CONTROLADOR = new PermisosControlador();

export default PERMISOS_CONTROLADOR;