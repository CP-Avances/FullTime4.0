import { Request, Response } from 'express';
import { QueryResult } from 'pg';
import pool from '../../database';

class DatosGeneralesControlador {

    // METODO PARA LEER DATOS PERFIL SUPER-ADMINISTRADOR    **USADO
    public async BuscarDataGeneral(req: Request, res: Response) {
        let estado = req.params.estado;
        let informacion = await pool.query(
            `
            SELECT * FROM informacion_general AS ig
            WHERE ig.estado = $1
            ORDER BY ig.name_suc ASC
            `
            , [estado]
        ).then((result: any) => { return result.rows });

        if (informacion.length === 0) return res.status(404).jsonp({ message: 'No se han encontrado registros.' })

        return res.status(200).jsonp(informacion);
    }

    // METODO PARA BUSCAR USUARIOS ADMINISTRADORES Y JEFES DE UNA SUCURSAL
    public async BuscarInformacionUserRol(req: Request, res: Response) {
        const { id_empleado } = req.body;
        const DATOS = await pool.query(
            `
            SELECT da.id, da.nombre, da.apellido, da.id_departamento, 
                da.jefe, da.name_rol AS rol, da.id_rol
            FROM informacion_general AS da
            WHERE NOT da.id_rol = 2 AND da.id = $1
            ORDER BY da.apellido ASC
            `
            , [id_empleado]);

        if (DATOS.rowCount != 0) {
            return res.jsonp(DATOS.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'error' });
        }
    }

    // METODO PARA BUSCAR DATOS DE USUARIOS QUE RECIBEN COMUNICADOS    **USADO
    public async DatosGeneralesComunicados(req: Request, res: Response) {
        let estado = req.params.estado;
        let resultados = await pool.query(
            `
            SELECT ig.*, cn.comunicado_mail, cn.comunicado_notificacion 
            FROM informacion_general AS ig, eu_configurar_alertas AS cn 
            WHERE ig.id = cn.id_empleado AND ig.estado = $1
                AND (cn.comunicado_mail = true OR cn.comunicado_notificacion = true)                
            `
            , [estado]
        ).then((result: any) => { return result.rows });

        if (resultados.length === 0) return res.status(404).jsonp({ message: 'No se han encontrado registros.' })

        return res.status(200).jsonp(resultados);
    }

    // METODO PARA LEER DATOS PERFIL SUPER-ADMINISTRADOR
    public async BuscarDataGeneralRol(req: Request, res: Response) {
        let estado = req.params.estado;
        let informacion = await pool.query(
            `
                SELECT * FROM informacion_general AS ig, eu_usuario_departamento AS ud
                WHERE ig.estado = $1 AND 
	   		        ig.jefe = false AND
			        ud.id_empleado = ig.id AND
	                ud.administra = false
                ORDER BY ig.name_suc ASC
                `
            , [estado]
        ).then((result: any) => { return result.rows });

        if (informacion.length === 0) return res.status(404).jsonp({ message: 'No se han encontrado registros.' })

        return res.status(200).jsonp(informacion);
    }




























    // METODO DE BUSQUEDA DE DATOS ACTUALES DEL USUARIO   **USADO
    public async DatosActuales(req: Request, res: Response) {
        const { empleado_id } = req.params;
        const DATOS = await pool.query(
            `
            SELECT * FROM contrato_cargo_vigente WHERE id_empleado = $1
            `
            , [empleado_id]);
        if (DATOS.rowCount != 0) {
            return res.jsonp(DATOS.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'error' });
        }
    }




















    /**
     * METODO DE CONSULTA DE DATOS GENERALES DE USUARIOS
     * REALIZA UN ARRAY DE SUCURSALES CON DEPARTAMENTOS Y EMPLEADOS DEPENDIENDO DEL ESTADO DEL 
     * EMPLEADO SI BUSCA EMPLEADOS ACTIVOS O INACTIVOS. 
     * @returns Retorna Array de [Sucursales[Departamentos[empleados[]]]]
     **/

    public async DatosGenerales(req: Request, res: Response) {
        let estado = req.params.estado;
        let { id_sucursal } = req.body;

        // CONSULTA DE BUSQUEDA DE SUCURSALES
        let suc = await pool.query(
            "SELECT s.id AS id_suc, s.nombre AS name_suc, c.descripcion AS ciudad " +
            "FROM e_sucursales AS s, e_ciudades AS c " +
            "WHERE s.id_ciudad = c.id AND s.id IN (" + id_sucursal + ")" +
            "ORDER BY s.id ASC"
        ).then((result: any) => { return result.rows });

        if (suc.length === 0) return res.status(404).jsonp({ message: 'No se han encontrado registros.' });

        // CONSULTA DE BUSQUEDA DE DEPARTAMENTOS
        let departamentos = await Promise.all(suc.map(async (dep: any) => {
            dep.departamentos = await pool.query(
                `
                SELECT d.id as id_depa, d.nombre as name_dep, s.nombre AS sucursal
                FROM ed_departamentos AS d, e_sucursales AS s
                WHERE d.id_sucursal = $1 AND d.id_sucursal = s.id
                `
                , [dep.id_suc]
            ).then((result: any) => {
                return result.rows.filter((obj: any) => {
                    return obj.name_dep != 'Ninguno';
                })
            });
            return dep;
        }));

        let depa = departamentos.filter((obj: any) => {
            return obj.departamentos.length > 0
        });

        if (depa.length === 0) return res.status(404).jsonp({ message: 'No se han encontrado registros.' });

        // CONSULTA DE BUSQUEDA DE COLABORADORES POR DEPARTAMENTO
        let lista = await Promise.all(depa.map(async (obj: any) => {
            obj.departamentos = await Promise.all(obj.departamentos.map(async (empl: any) => {
                if (estado === '1') {
                    empl.empleado = await pool.query(
                        `
                        SELECT DISTINCT e.id, CONCAT(e.nombre, ' ' , e.apellido) name_empleado, e.nombre, e.apellido, e.codigo, 
                            e.cedula, e.genero, e.correo, ca.id AS id_cargo, tc.cargo, tc.id AS id_tipo_cargo,
                            co.id AS id_contrato, r.id AS id_regimen, r.descripcion AS regimen, 
                            d.id AS id_departamento, d.nombre AS departamento, s.id AS id_sucursal, 
                            s.nombre AS sucursal, c.descripcion AS ciudad, ca.hora_trabaja
                        FROM eu_empleado_cargos AS ca, eu_empleado_contratos AS co, ere_cat_regimenes AS r, eu_empleados AS e,
                            e_cat_tipo_cargo AS tc, ed_departamentos AS d, e_sucursales AS s, e_ciudades AS c
                        WHERE ca.id = (SELECT da.id_cargo FROM informacion_general AS da WHERE 
                        da.id_empleado = e.id) 
                            AND tc.id = ca.id_tipo_cargo
                            AND ca.id_departamento = $1
                            AND ca.id_departamento = d.id
                            AND co.id = (SELECT da.id_contrato FROM informacion_general AS da WHERE 
                            da.id_empleado = e.id) 
                            AND s.id = d.id_sucursal
                            AND s.id_ciudad = c.id
                            AND co.id_regimen = r.id AND e.estado = $2
                        ORDER BY name_empleado ASC
                        `,
                        [empl.id_depa, estado])
                        .then((result: any) => { return result.rows });

                } else {
                    empl.empleado = await pool.query(
                        `
                        SELECT DISTINCT e.id, CONCAT(e.nombre, ' ' , e.apellido) name_empleado, e.nombre, e.apellido, e.codigo, 
                            e.cedula, e.genero, e.correo, ca.id AS id_cargo, tc.cargo, tc.id AS id_tipo_cargo,
                            co.id AS id_contrato, r.id AS id_regimen, r.descripcion AS regimen, 
                            d.id AS id_departamento, d.nombre AS departamento, s.id AS id_sucursal, 
                            s.nombre AS sucursal, c.descripcion AS ciudad, ca.fecha_final, ca.hora_trabaja
                        FROM eu_empleado_cargos AS ca, eu_empleado_contratos AS co, ere_cat_regimenes AS r, eu_empleados AS e,
                            e_cat_tipo_cargo AS tc, ed_departamentos AS d, e_sucursales AS s, e_ciudades AS c
                        WHERE ca.id = (SELECT da.id_cargo FROM informacion_general AS da WHERE 
                            da.id_empleado = e.id) 
                            AND tc.id = ca.id_tipo_cargo
                            AND ca.id_departamento = $1
                            AND ca.id_departamento = d.id
                            AND co.id = (SELECT da.id_contrato FROM informacion_general AS da WHERE 
                            da.id_empleado = e.id)  
                            AND s.id = d.id_sucursal
                            AND s.id_ciudad = c.id
                            AND co.id_regimen = r.id AND e.estado = $2
                        ORDER BY name_empleado ASC
                        `,
                        [empl.id_depa, estado])
                        .then((result: any) => { return result.rows });
                }

                return empl;
            }));
            return obj;
        }))

        if (lista.length === 0) return res.status(404)
            .jsonp({ message: 'No se han encontrado registros.' });

        let empleados = lista.map((obj: any) => {
            obj.departamentos = obj.departamentos.filter((ele: any) => {
                return ele.empleado.length > 0;
            })
            return obj;
        }).filter((obj: any) => {
            return obj.departamentos.length > 0;
        });


        // CONSULTA DE BUSQUEDA DE COLABORADORES POR REGIMEN
        let regimen = await Promise.all(empleados.map(async (obj: any) => {
            obj.departamentos = await Promise.all(obj.departamentos.map(async (empl: any) => {
                empl.empleado = await Promise.all(empl.empleado.map(async (reg: any) => {
                    //console.log('variables car ', reg)
                    reg.regimen = await pool.query(
                        `
                            SELECT r.id AS id_regimen, r.descripcion AS name_regimen
                            FROM ere_cat_regimenes AS r
                            WHERE r.id = $1
                            ORDER BY r.descripcion ASC
                            `,
                        [reg.id_regimen])
                        .then((result: any) => { return result.rows });
                    return reg;
                }))
                return empl;
            }));
            return obj;
        }))

        if (regimen.length === 0) return res.status(404)
            .jsonp({ message: 'No se han encontrado registros.' });

        let respuesta = regimen.map((obj: any) => {
            obj.departamentos = obj.departamentos.filter((ele: any) => {
                ele.empleado = ele.empleado.filter((reg: any) => {
                    return reg.regimen.length > 0;
                })
                return ele;
            }).filter((ele: any) => {
                return ele.empleado.length > 0;
            });
            return obj;
        }).filter((obj: any) => {
            return obj.departamentos.length > 0;
        });


        if (respuesta.length === 0) return res.status(404)
            .jsonp({ message: 'No se han encontrado registros.' })

        return res.status(200).jsonp(respuesta);
    }
















    /**
     * METODO DE CONSULTA DE DATOS GENERALES DE USUARIOS
     * REALIZA UN ARRAY DE CARGOS Y EMPLEADOS DEPENDIENDO DEL ESTADO DEL 
     * EMPLEADO SI BUSCA EMPLEADOS ACTIVOS O INACTIVOS. 
     * @returns Retorna Array de [Cargos[empleados[]]]
     **/

    public async DatosGeneralesCargo(req: Request, res: Response) {
        let estado = req.params.estado;
        let { id_sucursal } = req.body;

        // CONSULTA DE BUSQUEDA DE CARGOS
        let cargo = await pool.query(
            `
            SELECT tc.id AS id_cargo, tc.cargo AS name_cargo
            FROM e_cat_tipo_cargo AS tc 
            ORDER BY tc.cargo ASC
            `
        ).then((result: any) => { return result.rows });

        if (cargo.length === 0) return res.status(404).jsonp({ message: 'No se han encontrado registros.' });

        // CONSULTA DE BUSQUEDA DE EMPLEADOS
        let empleados = await Promise.all(cargo.map(async (empl: any) => {
            if (estado === '1') {
                empl.empleados = await pool.query(
                    "SELECT DISTINCT e.id, CONCAT(e.nombre, ' ' , e.apellido) name_empleado, e.nombre, e.apellido, e.codigo, " +
                    "e.cedula, e.genero, e.correo, ca.id AS id_cargo, tc.cargo, " +
                    "co.id AS id_contrato, r.id AS id_regimen, r.descripcion AS regimen, " +
                    "d.id AS id_departamento, d.nombre AS departamento, s.id AS id_sucursal, " +
                    "s.nombre AS sucursal, c.descripcion AS ciudad, ca.hora_trabaja " +
                    "FROM eu_empleado_cargos AS ca, eu_empleado_contratos AS co, ere_cat_regimenes AS r, eu_empleados AS e, " +
                    "e_cat_tipo_cargo AS tc, ed_departamentos AS d, e_sucursales AS s, e_ciudades AS c " +
                    "WHERE ca.id = (SELECT da.id_cargo FROM informacion_general AS da WHERE " +
                    "da.id_empleado = e.id) " +
                    "AND tc.id = ca.id_tipo_cargo " +
                    "AND ca.id_tipo_cargo = $1 " +
                    "AND ca.id_departamento = d.id " +
                    "AND co.id = (SELECT da.id_contrato FROM informacion_general AS da WHERE " +
                    "da.id_empleado = e.id) " +
                    "AND s.id = d.id_sucursal " +
                    "AND s.id_ciudad = c.id " +
                    "AND co.id_regimen = r.id AND e.estado = $2 " +
                    "AND s.id IN (" + id_sucursal + ") " +
                    "ORDER BY name_empleado ASC "
                    , [empl.id_cargo, estado]

                ).then((result: any) => { return result.rows });
            }
            else {
                empl.empleados = await pool.query(
                    "SELECT DISTINCT e.id, CONCAT(e.nombre, ' ' , e.apellido) name_empleado, e.nombre, e.apellido, e.codigo, " +
                    "e.cedula, e.genero, e.correo, ca.id AS id_cargo, tc.cargo, " +
                    "co.id AS id_contrato, r.id AS id_regimen, r.descripcion AS regimen, " +
                    "d.id AS id_departamento, d.nombre AS departamento, s.id AS id_sucursal, " +
                    "s.nombre AS sucursal, c.descripcion AS ciudad, ca.fecha_final, ca.hora_trabaja " +
                    "FROM eu_empleado_cargos AS ca, eu_empleado_contratos AS co, ere_cat_regimenes AS r, eu_empleados AS e, " +
                    "e_cat_tipo_cargo AS tc, ed_departamentos AS d, e_sucursales AS s, e_ciudades AS c " +
                    "WHERE ca.id = (SELECT da.id_cargo FROM informacion_general AS da WHERE " +
                    "da.id_empleado = e.id) ) " +
                    "AND tc.id = ca.id_tipo_cargo " +
                    "AND ca.id_tipo_cargo = $1 " +
                    "AND ca.id_departamento = d.id " +
                    "AND co.id = (SELECT da.id_contrato FROM informacion_general AS da WHERE " +
                    "da.id_empleado = e.id) " +
                    "AND s.id = d.id_sucursal " +
                    "AND s.id_ciudad = c.id " +
                    "AND co.id_regimen = r.id AND e.estado = $2 " +
                    "AND s.id IN (" + id_sucursal + ") " +
                    "ORDER BY name_empleado ASC "
                    ,
                    [empl.id_cargo, estado])
                    .then((result: any) => { return result.rows });
            }
            return empl;
        }));

        let respuesta = empleados.filter((obj: any) => {
            return obj.empleados.length > 0
        });

        if (respuesta.length === 0) return res.status(404).jsonp({ message: 'No se han encontrado registros.' });

        return res.status(200).jsonp(respuesta);
    }

    // METODO DE BUSQUEDA DE USUARIOS QUE NO HAN SIDO ASIGNADOS A UNA UBICACION    **USADO
    public async DatosGeneralesUbicacion(req: Request, res: Response) {
        let estado = req.params.estado;
        let { ubicacion } = req.body;

        // CONSULTA DE BUSQUEDA DE SUCURSALES
        let respuesta = await pool.query(
            `
            SELECT * FROM informacion_general
            WHERE estado = $1
                AND NOT EXISTS (SELECT eu.id_empleado FROM mg_empleado_ubicacion AS eu 
                    WHERE eu.id_empleado = id AND eu.id_ubicacion = $2)
            ORDER BY id ASC
            `
            , [estado, ubicacion]
        ).then((result: any) => { return result.rows });

        if (respuesta.length === 0) return res.status(404)
            .jsonp({ message: 'No se han encontrado registros.' })

        return res.status(200).jsonp(respuesta);
    }

    // METODO PARA LISTAR DATOS ACTUALES DEL USUARIO  
    public async ListarDatosActualesEmpleado(req: Request, res: Response) {
        const DATOS = await pool.query(
            `
            SELECT e_datos.id, e_datos.cedula, e_datos.apellido, e_datos.nombre, e_datos.estado_civil, 
                e_datos.genero, e_datos.correo, e_datos.fecha_nacimiento, e_datos.estado, 
                e_datos.domicilio, e_datos.telefono, e_datos.id_nacionalidad, e_datos.imagen, 
                e_datos.codigo, e_datos.id_contrato, e_datos.id_regimen, e_datos.name_regimen AS regimen,
                e_datos.id_cargo, e_datos.id_cargo_ AS id_tipo_cargo, e_datos.name_cargo AS cargo, 
                e_datos.id_depa AS id_departamento, e_datos.name_dep AS departamento, e_datos.id_suc AS id_sucursal, 
                e_datos.name_suc AS sucursal, s.id_empresa, empre.nombre AS empresa, e_datos.id_ciudad, e_datos.ciudad, 
                e_datos.hora_trabaja
            FROM informacion_general AS e_datos, e_sucursales AS s, e_empresa AS empre
            WHERE s.id = e_datos.id_suc AND s.id_empresa = empre.id 
            ORDER BY e_datos.nombre ASC
            `
        );
        if (DATOS.rowCount != 0) {
            return res.jsonp(DATOS.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'error' });
        }
    }

    // METODO PARA LISTAR ID ACTUALES DE USUARIOS   **USADO
    public async ListarIdDatosActualesEmpleado(req: Request, res: Response) {
        const DATOS = await pool.query(
            `
            SELECT dae.id_empleado AS id
            FROM contrato_cargo_vigente AS dae
            ORDER BY dae.id_empleado ASC
            `
        );
        if (DATOS.rowCount != 0) {
            return res.jsonp(DATOS.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'error' });
        }
    }


    // METODO PARA VER INFORMACION DE UN USUARIO AUTORIZA   **USADO
    public async ListarDatosEmpleadoAutoriza(req: Request, res: Response) {
        const { empleado_id } = req.params;
        const DATOS = await pool.query(
            `
            SELECT (da.nombre ||' '|| da.apellido) AS fullname, da.cedula, da.name_cargo AS cargo, 
                da.name_dep AS departamento
            FROM informacion_general AS da
            WHERE da.id = $1
            `, [empleado_id]);
        if (DATOS.rowCount != 0) {
            return res.jsonp(DATOS.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'error' });
        }
    }

    // TODO: ESTE METODO GENERA EL ERROR AL ELIMINAR VACACIONES
    // METODO PARA BUSCAR JEFES
    public async BuscarJefes(req: Request, res: Response): Promise<Response> {

        const { objeto, depa_user_loggin } = req.body;

        const permiso = objeto
        const JefesDepartamentos = await pool.query(
            `
            SELECT da.id, da.estado, n.id_departamento as id_dep, n.id_departamento_nivel, n.departamento_nombre_nivel, 
                n.nivel, n.id_sucursal AS id_suc, n.departamento, s.nombre AS sucursal, da.id_empleado_cargo as cargo, 
                dae.id_contrato as contrato, da.id_empleado AS empleado, (dae.nombre || ' ' || dae.apellido) as fullname,
                dae.cedula, dae.correo, c.permiso_mail, c.permiso_notificacion, c.vacacion_mail, c.vacacion_notificacion, 
                c.hora_extra_mail, c.hora_extra_notificacion, c.comida_mail, c.comida_notificacion 
            FROM ed_niveles_departamento AS n, ed_autoriza_departamento AS da, informacion_general AS dae,
                eu_configurar_alertas AS c, ed_departamentos AS cg, e_sucursales AS s
            WHERE n.id_departamento = $1
                AND da.id_departamento = n.id_departamento_nivel
                AND dae.id_cargo = da.id_empleado_cargo
                AND dae.id_contrato = c.id_empleado
                AND cg.id = $1
                AND s.id = n.id_sucursal
            ORDER BY nivel ASC
            `
            ,
            [depa_user_loggin]).then((result: any) => { return result.rows });

        if (JefesDepartamentos.length === 0) return res.status(400)
            .jsonp({
                message: `Revisar configuración de departamento y autorización de solicitudes.`
            });

        const obj = JefesDepartamentos[JefesDepartamentos.length - 1];
        let depa_padre = obj.id_departamento_nivel;
        let JefeDepaPadre;

        if (depa_padre !== null) {

            /*JefeDepaPadre = await pool.query(
                `
                SELECT da.id, da.estado, cg.id AS id_dep, cg.depa_padre, 
                    cg.nivel, s.id AS id_suc, cg.nombre AS departamento, s.nombre AS sucursal, 
                    ecr.id AS cargo, ecn.id AS contrato, e.id AS empleado, 
                    (e.nombre || ' ' || e.apellido) as fullname, e.cedula, e.correo, c.permiso_mail, 
                    c.permiso_noti, c.vaca_mail, c.vaca_noti, c.hora_extra_mail, 
                    c.hora_extra_noti, c.comida_mail, c.comida_noti
                FROM ed_autoriza_departamento AS da, eu_empleado_cargos AS ecr, ed_departamentos AS cg, 
                    e_sucursales AS s, eu_empleado_contratos AS ecn,empleados AS e, eu_configurar_alertas AS c 
                WHERE da.id_departamento = $1 AND da.id_empl_cargo = ecr.id AND 
                    da.id_departamento = cg.id AND 
                    da.estado = true AND cg.id_sucursal = s.id AND ecr.id_contrato = ecn.id AND 
                    ecn.id_empleado = e.id AND e.id = c.id_empleado
                `
                , [depa_padre]);*/
            //JefesDepartamentos.push(JefeDepaPadre.rows[0]);

            permiso.EmpleadosSendNotiEmail = JefesDepartamentos
            return res.status(200).jsonp(permiso);

        } else {
            permiso.EmpleadosSendNotiEmail = JefesDepartamentos
            return res.status(200).jsonp(permiso);
        }
    }

    // METODO PARA BUSCAR INFORMACION DE CONFIGURACIONES DE PERMISOS
    public async BuscarConfigEmpleado(req: Request, res: Response): Promise<Response> {

        try {

            const { id_empleado } = req.params;
            console.log('***************', id_empleado)

            const response: QueryResult = await pool.query(
                `
                SELECT da.id_departamento,  cn.* , (da.nombre || ' ' || da.apellido) as fullname, 
                    da.cedula, da.correo, da.codigo, da.estado, da.id_sucursal, 
                    da.id_contrato, 
                    da.name_dep AS ndepartamento,
                    da.name_suc AS nsucursal
                FROM informacion_general AS da, eu_configurar_alertas AS cn 
                WHERE da.id = $1 AND cn.id_empleado = da.id
                `
                , [id_empleado]);

            const [infoEmpleado] = response.rows;
            console.log(infoEmpleado);

            return res.status(200).jsonp(infoEmpleado);
        } catch (error) {
            console.log(error);
            return res.status(500)
                .jsonp({ message: `Contactese con el Administrador del sistema (593) 2 – 252-7663 o https://casapazmino.com.ec` });
        }
    };



    // METODO PARA BUSCAR USUARIOS DE UNA SUCURSAL
    public async BuscarUsuariosSucursal(req: Request, res: Response) {
        const { sucursal, estado } = req.body;
        const DATOS = await pool.query(
            `
            SELECT  da.id, da.nombre, da.apellido, da.name_rol AS rol, da.name_dep AS departamento, da.id_depa
            FROM informacion_general AS da
            WHERE da.id_suc = $1 AND da.estado = $2
            ORDER BY da.apellido ASC
            `,
            [sucursal, estado]);

        if (DATOS.rowCount != 0) {
            return res.jsonp(DATOS.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'error' });
        }
    }



}

const DATOS_GENERALES_CONTROLADOR = new DatosGeneralesControlador();

export default DATOS_GENERALES_CONTROLADOR;


