import { Request, Response } from 'express';
import { QueryResult } from 'pg';
import pool from '../../database';

class DatosGeneralesControlador {

    // METODO DE BUSQUEDA DE DATOS ACTUALES DEL USUARIO
    public async DatosActuales(req: Request, res: Response) {
        const { empleado_id } = req.params;
        const DATOS = await pool.query(
            `
            SELECT * FROM datos_actuales_empleado WHERE id = $1
            `
            , [empleado_id]);
        if (DATOS.rowCount > 0) {
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
            "FROM sucursales AS s, ciudades AS c " +
            "WHERE s.id_ciudad = c.id AND s.id IN (" + id_sucursal + ")" +
            "ORDER BY s.id ASC"
        ).then((result: any) => { return result.rows });

        if (suc.length === 0) return res.status(404).jsonp({ message: 'No se han encontrado registros.' });

        // CONSULTA DE BUSQUEDA DE DEPARTAMENTOS
        let departamentos = await Promise.all(suc.map(async (dep: any) => {
            dep.departamentos = await pool.query(
                `
                SELECT d.id as id_depa, d.nombre as name_dep, s.nombre AS sucursal
                FROM cg_departamentos AS d, sucursales AS s
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
                        FROM empl_cargos AS ca, empl_contratos AS co, cg_regimenes AS r, empleados AS e,
                            tipo_cargo AS tc, cg_departamentos AS d, sucursales AS s, ciudades AS c
                        WHERE ca.id = (SELECT da.id_cargo FROM datos_actuales_empleado AS da WHERE 
                            da.id = e.id) 
                            AND tc.id = ca.cargo
                            AND ca.id_departamento = $1
                            AND ca.id_departamento = d.id
                            AND co.id = (SELECT da.id_contrato FROM datos_actuales_empleado AS da WHERE 
                            da.id = e.id) 
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
                            s.nombre AS sucursal, c.descripcion AS ciudad, ca.fec_final, ca.hora_trabaja
                        FROM empl_cargos AS ca, empl_contratos AS co, cg_regimenes AS r, empleados AS e,
                            tipo_cargo AS tc, cg_departamentos AS d, sucursales AS s, ciudades AS c
                        WHERE ca.id = (SELECT da.id_cargo FROM datos_actuales_empleado AS da WHERE 
                            da.id = e.id) 
                            AND tc.id = ca.cargo
                            AND ca.id_departamento = $1
                            AND ca.id_departamento = d.id
                            AND co.id = (SELECT da.id_contrato FROM datos_actuales_empleado AS da WHERE 
                            da.id = e.id) 
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
                            FROM cg_regimenes AS r
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


    public async BuscarDataGeneral(req: Request, res: Response) {
        let estado = req.params.estado;
        let { id_sucursal } = req.body;

        console.log('ver id_sucursal ', id_sucursal)

        // CONSULTA DE BUSQUEDA DE SUCURSALES
        let sucursal_ = await pool.query(
            "SELECT ig.id_suc, ig.name_suc " +
            "FROM informacion_general AS ig " +
            "WHERE ig.id_suc IN (" + id_sucursal + ")" +
            "GROUP BY ig.id_suc, ig.name_suc " +
            "ORDER BY ig.name_suc ASC"
        ).then((result: any) => { return result.rows });

        console.log('sucursal ', sucursal_)

        if (sucursal_.length === 0) return res.status(404).jsonp({ message: 'No se han encontrado registros.' });

        // CONSULTA DE BUSQUEDA DE REGIMEN
        let regimen_ = await Promise.all(sucursal_.map(async (reg: any) => {
            reg.regimenes = await pool.query(
                `
                SELECT ig.id_suc, ig.name_suc, ig.id_regimen, ig.name_regimen
                FROM informacion_general AS ig
                WHERE ig.id_suc = $1
                GROUP BY ig.id_suc, ig.name_suc, ig.id_regimen, ig.name_regimen
                ORDER BY ig.name_suc ASC
                `
                , [reg.id_suc]
            ).then((result: any) => { return result.rows });
            return reg;
        }));

        let lista_regimen = regimen_.filter((obj: any) => {
            return obj.regimenes.length > 0
        });

        console.log('lista regimen ', lista_regimen)

        if (lista_regimen.length === 0) return res.status(404).jsonp({ message: 'No se han encontrado registros.' });

        // CONSULTA DE BUSQUEDA DE DEPARTAMENTOS
        let departamentos_ = await Promise.all(lista_regimen.map(async (reg: any) => {

            reg.regimenes = await Promise.all(reg.regimenes.map(async (dep: any) => {

                dep.departamentos = await pool.query(
                    `
                    SELECT ig.id_suc, ig.name_suc, ig.id_depa, ig.name_dep
                    FROM informacion_general AS ig
                    WHERE ig.id_regimen = $1 AND ig.id_suc = $2
                    GROUP BY ig.id_suc, ig.name_suc, ig.id_depa, ig.name_dep
                    ORDER BY ig.name_suc ASC
                    `
                    , [dep.id_regimen, dep.id_suc]
                ).then((result: any) => { return result.rows });

                return dep;
            }))

            return reg;

        }));

        let lista_departamentos = departamentos_.map((reg: any) => {
            reg.regimenes = reg.regimenes.filter((dep: any) => {
                return dep.departamentos.length > 0;
            })
            return reg;
        }).filter((obj: any) => {
            return obj.regimenes.length > 0;
        });

        console.log('lista departamentos ', lista_departamentos)

        if (lista_departamentos.length === 0) return res.status(404).jsonp({ message: 'No se han encontrado registros.' });

        // CONSULTA DE BUSQUEDA DE CARGOS
        let cargos_ = await Promise.all(lista_departamentos.map(async (reg: any) => {
            reg.regimenes = await Promise.all(reg.regimenes.map(async (dep: any) => {
                dep.departamentos = await Promise.all(dep.departamentos.map(async (car: any) => {
                    console.log('ver car ', car)
                    car.cargos = await pool.query(
                        `
                        SELECT ig.id_suc, ig.name_suc, ig.id_cargo_, ig.name_cargo
                        FROM informacion_general AS ig
                        WHERE ig.id_depa = $1 AND ig.id_suc = $2
                        GROUP BY ig.id_suc, ig.name_suc, ig.id_cargo_, ig.name_cargo
                        ORDER BY ig.name_suc ASC
                        `
                        , [car.id_depa, car.id_suc]
                    ).then((result: any) => { return result.rows });

                    return car;
                }))

                return dep;
            }))

            return reg;
        }));

        let lista_cargos = cargos_.map((reg: any) => {
            reg.regimenes = reg.regimenes.filter((dep: any) => {
                dep.departamentos = dep.departamentos.filter((car: any) => {
                    return car.cargos.length > 0;
                })
                return dep;
            })
            return reg;
        }).filter((obj: any) => {
            return obj.regimenes.length > 0;
        });

        console.log('ver cargos ', lista_cargos)

        if (lista_cargos.length === 0) return res.status(404).jsonp({ message: 'No se han encontrado registros.' });

        // CONSULTA DE BUSQUEDA DE COLABORADORES POR CARGO
        let lista = await Promise.all(lista_cargos.map(async (reg: any) => {

            reg.regimenes = await Promise.all(reg.regimenes.map(async (dep: any) => {

                dep.departamentos = await Promise.all(dep.departamentos.map(async (car: any) => {

                    car.cargos = await Promise.all(car.cargos.map(async (empl: any) => {
                        if (estado === '1') {
                            empl.empleado = await pool.query(
                                `
                                SELECT * FROM informacion_general 
                                WHERE id_cargo_= $1 AND id_suc = $2 AND estado = $3
                                `,
                                [empl.id_cargo_, empl.id_suc, estado])
                                .then((result: any) => { return result.rows });

                        } else {
                            empl.empleado = await pool.query(
                                `
                                SELECT * FROM informacion_general 
                                WHERE id_cargo_= 1 AND id_suc = 20 AND estado = $3
                                `,
                                [empl.id_cargo_, empl.id_suc, estado])
                                .then((result: any) => { return result.rows });
                        }

                        return empl;
                    }));

                    return car;

                }))

                return dep;
            }))

            return reg;
        }))

        let empleados = lista.map((reg: any) => {
            reg.regimenes = reg.regimenes.filter((dep: any) => {

                dep.departamentos = dep.departamentos.filter((car: any) => {

                    car.cargos = car.cargos.filter((empl: any) => {
                        return empl.empleado.length > 0;
                    })
                    return car;
                })
                return dep;
            })
            return reg;
        }).filter((obj: any) => {
            return obj.regimenes.length > 0;
        });

        console.log('lista empleados ', empleados)

        if (empleados.length === 0) return res.status(404)
            .jsonp({ message: 'No se han encontrado registros.' })

        return res.status(200).jsonp(empleados);
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
            FROM tipo_cargo AS tc 
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
                    "FROM empl_cargos AS ca, empl_contratos AS co, cg_regimenes AS r, empleados AS e, " +
                    "tipo_cargo AS tc, cg_departamentos AS d, sucursales AS s, ciudades AS c " +
                    "WHERE ca.id = (SELECT da.id_cargo FROM datos_actuales_empleado AS da WHERE " +
                    "da.id = e.id) " +
                    "AND tc.id = ca.cargo " +
                    "AND ca.cargo = $1 " +
                    "AND ca.id_departamento = d.id " +
                    "AND co.id = (SELECT da.id_contrato FROM datos_actuales_empleado AS da WHERE " +
                    "da.id = e.id) " +
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
                    "s.nombre AS sucursal, c.descripcion AS ciudad, ca.fec_final, ca.hora_trabaja " +
                    "FROM empl_cargos AS ca, empl_contratos AS co, cg_regimenes AS r, empleados AS e, " +
                    "tipo_cargo AS tc, cg_departamentos AS d, sucursales AS s, ciudades AS c " +
                    "WHERE ca.id = (SELECT da.id_cargo FROM datos_actuales_empleado AS da WHERE " +
                    "da.id = e.id) " +
                    "AND tc.id = ca.cargo " +
                    "AND ca.cargo = $1 " +
                    "AND ca.id_departamento = d.id " +
                    "AND co.id = (SELECT da.id_contrato FROM datos_actuales_empleado AS da WHERE " +
                    "da.id = e.id) " +
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

    /**
     * METODO DE CONSULTA DE DATOS GENERALES DE USUARIOS CON CONFIGURACION DE COMUNICADOS
     * REALIZA UN ARRAY DE SUCURSALES CON DEPARTAMENTOS Y EMPLEADOS DEPENDIENDO DEL ESTADO DEL 
     * EMPLEADO SI BUSCA EMPLEADOS ACTIVOS O INACTIVOS. 
     * @returns Retorna Array de [Sucursales[Departamentos[empleados[]]]]
     **/

    // METODO PARA BUSCAR DATOS DE CONFIGURACION DE RECEPCION DE NOTIFICACIONES
    public async DatosGeneralesComunicados(req: Request, res: Response) {
        let estado = req.params.estado;

        // CONSULTA DE BUSQUEDA DE SUCURSALES
        let suc = await pool.query(
            `
            SELECT s.id AS id_suc, s.nombre AS name_suc, c.descripcion AS ciudad 
            FROM sucursales AS s, ciudades AS c 
            WHERE s.id_ciudad = c.id 
            ORDER BY s.id
            `
        )
            .then((result: any) => { return result.rows });

        if (suc.length === 0) return res.status(404).jsonp({ message: 'No se han encontrado registros.' });

        let departamentos = await Promise.all(suc.map(async (dep: any) => {
            dep.departamentos = await pool.query(
                `
                SELECT d.id as id_depa, d.nombre as name_dep, s.nombre AS sucursal
                FROM cg_departamentos AS d, sucursales AS s
                WHERE d.id_sucursal = $1 AND d.id_sucursal = s.id
                `
                , [dep.id_suc])
                .then((result: any) => {
                    return result.rows
                });
            return dep;
        }));

        let depa = departamentos.filter((obj: any) => {
            return obj.departamentos.length > 0
        });

        if (depa.length === 0) return res.status(404).jsonp({ message: 'No se han encontrado registros.' })

        let lista = await Promise.all(depa.map(async (obj: any) => {
            obj.departamentos = await Promise.all(obj.departamentos.map(async (ele: any) => {
                if (estado === '1') {
                    ele.empleado = await pool.query(
                        `
                        SELECT DISTINCT e.id, CONCAT(nombre, ' ' , apellido)
                            name_empleado, e.codigo, e.cedula, e.genero, e.correo, cn.comunicado_mail,
                            cn.comunicado_noti, r.id AS id_regimen 
                        FROM empl_cargos AS ca, empl_contratos AS co, cg_regimenes AS r, empleados AS e,
                            config_noti AS cn 
                        WHERE ca.id = (SELECT da.id_cargo FROM datos_actuales_empleado AS da WHERE da.id = e.id)  
                            AND ca.id_departamento = $1 
                            AND co.id = (SELECT da.id_contrato FROM datos_actuales_empleado AS da WHERE da.id = e.id)  
                            AND e.id = cn.id_empleado 
                            AND co.id_regimen = r.id AND e.estado = $2
                            AND (cn.comunicado_mail = true OR cn.comunicado_noti = true)
                        `
                        , [ele.id_depa, estado])
                        .then((result: any) => { return result.rows })

                } else {
                    ele.empleado = await pool.query(
                        `
                        SELECT DISTINCT e.id, CONCAT(nombre, ' ' , apellido)
                            name_empleado, e.codigo, e.cedula, e.genero, e.correo, cn.comunicado_mail,
                            cn.comunicado_noti, ca.fec_final, r.id AS id_regimen 
                        FROM empl_cargos AS ca, empl_contratos AS co, cg_regimenes AS r, empleados AS e,
                            config_noti AS cn 
                        WHERE ca.id = (SELECT da.id_cargo FROM datos_actuales_empleado AS da WHERE da.id = e.id)  
                            AND ca.id_departamento = $1 
                            AND co.id = (SELECT da.id_contrato FROM datos_actuales_empleado AS da WHERE da.id = e.id)  
                            AND e.id = cn.id_empleado 
                            AND co.id_regimen = r.id AND e.estado = $2
                            AND (cn.comunicado_mail = true OR cn.comunicado_noti = true)
                        `
                        , [ele.id_depa, estado])
                        .then((result: any) => { return result.rows })
                }
                return ele
            }));
            return obj
        }))

        if (lista.length === 0) return res.status(404).jsonp({ message: 'No se ha encontrado registros de usuarios.' })

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
                            FROM cg_regimenes AS r
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
            .jsonp({ message: 'Usuarios no han configurado recepción de notificaciones de comunicados.' })

        return res.status(200).jsonp(respuesta)
    }


    /**
     * METODO DE CONSULTA DE DATOS GENERALES DE USUARIOS CON CONFIGURACION DE COMUNICADOS
     * REALIZA UN ARRAY DE CARGOS Y EMPLEADOS DEPENDIENDO DEL ESTADO DEL 
     * EMPLEADO SI BUSCA EMPLEADOS ACTIVOS O INACTIVOS. 
     * @returns Retorna Array de [Cargos[empleados[]]]
     **/

    public async DatosCargoComunicados(req: Request, res: Response) {
        let estado = req.params.estado;

        // CONSULTA DE BUSQUEDA DE CARGOS
        let cargo = await pool.query(
            `
            SELECT tc.id AS id_cargo, tc.cargo AS name_cargo
            FROM tipo_cargo AS tc 
            ORDER BY tc.cargo ASC
            `
        ).then((result: any) => { return result.rows });

        if (cargo.length === 0) return res.status(404).jsonp({ message: 'No se han encontrado registros.' });

        // CONSULTA DE BUSQUEDA DE EMPLEADOS
        let empleados = await Promise.all(cargo.map(async (empl: any) => {
            if (estado === '1') {
                empl.empleados = await pool.query(
                    `
                    SELECT DISTINCT e.id, CONCAT(e.nombre, ' ' , e.apellido) name_empleado, e.codigo, 
                        e.cedula, e.genero, e.correo, ca.id AS id_cargo, tc.cargo,
                        co.id AS id_contrato, r.id AS id_regimen, r.descripcion AS regimen, 
                        d.id AS id_departamento, d.nombre AS departamento, s.id AS id_sucursal, 
                        s.nombre AS sucursal, ca.hora_trabaja, cn.comunicado_mail, cn.comunicado_noti
                    FROM empl_cargos AS ca, empl_contratos AS co, cg_regimenes AS r, empleados AS e,
                        tipo_cargo AS tc, cg_departamentos AS d, sucursales AS s, config_noti AS cn
                    WHERE ca.id = (SELECT da.id_cargo FROM datos_actuales_empleado AS da WHERE 
                        da.id = e.id) 
                        AND tc.id = ca.cargo
                        AND ca.cargo = $1
                        AND ca.id_departamento = d.id
                        AND co.id = (SELECT da.id_contrato FROM datos_actuales_empleado AS da WHERE 
                        da.id = e.id)
                        AND e.id = cn.id_empleado 
                        AND s.id = d.id_sucursal
                        AND co.id_regimen = r.id AND e.estado = $2
                        AND (cn.comunicado_mail =true OR cn.comunicado_noti = true)
                    ORDER BY name_empleado ASC
                    `
                    , [empl.id_cargo, estado]

                ).then((result: any) => { return result.rows });
            }
            else {
                empl.empleados = await pool.query(
                    `
                    SELECT DISTINCT e.id, CONCAT(e.nombre, ' ' , e.apellido) name_empleado, e.codigo, 
                        e.cedula, e.genero, e.correo, ca.id AS id_cargo, tc.cargo,
                        co.id AS id_contrato, r.id AS id_regimen, r.descripcion AS regimen, 
                        d.id AS id_departamento, d.nombre AS departamento, s.id AS id_sucursal, 
                        s.nombre AS sucursal, ca.fec_final, ca.hora_trabaja, cn.comunicado_mail, 
                        cn.comunicado_noti
                    FROM empl_cargos AS ca, empl_contratos AS co, cg_regimenes AS r, empleados AS e,
                        tipo_cargo AS tc, cg_departamentos AS d, sucursales AS s, config_noti AS cn
                    WHERE ca.id = (SELECT da.id_cargo FROM datos_actuales_empleado AS da WHERE 
                        da.id = e.id) 
                        AND tc.id = ca.cargo
                        AND ca.cargo = $1
                        AND ca.id_departamento = d.id
                        AND co.id = (SELECT da.id_contrato FROM datos_actuales_empleado AS da WHERE 
                        da.id = e.id) 
                        AND e.id = cn.id_empleado 
                        AND s.id = d.id_sucursal
                        AND co.id_regimen = r.id AND e.estado = $2
                        AND (cn.comunicado_mail =true OR cn.comunicado_noti = true)
                    ORDER BY name_empleado ASC
                    `,
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


    /**
     * METODO DE CONSULTA DE DATOS GENERALES DE USUARIOS ASIGNADOS A UBICACIONES
     * REALIZA UN ARRAY DE SUCURSALES CON DEPARTAMENTOS Y EMPLEADOS DEPENDIENDO DEL ESTADO DEL 
     * EMPLEADO SI BUSCA EMPLEADOS ACTIVOS O INACTIVOS. 
     * @returns Retorna Array de [Sucursales[Departamentos[empleados[]]]]
     **/

    public async DatosGeneralesUbicacion(req: Request, res: Response) {
        let estado = req.params.estado;
        let { ubicacion } = req.body;

        // CONSULTA DE BUSQUEDA DE SUCURSALES
        let suc = await pool.query(
            `
            SELECT s.id AS id_suc, s.nombre AS name_suc, c.descripcion AS ciudad 
            FROM sucursales AS s, ciudades AS c 
            WHERE s.id_ciudad = c.id ORDER BY s.id ASC
            `
        ).then((result: any) => { return result.rows });

        if (suc.length === 0) return res.status(404).jsonp({ message: 'No se han encontrado registros.' });

        // CONSULTA DE BUSQUEDA DE DEPARTAMENTOS
        let departamentos = await Promise.all(suc.map(async (dep: any) => {
            dep.departamentos = await pool.query(
                `
                SELECT d.id as id_depa, d.nombre as name_dep, s.nombre AS sucursal
                FROM cg_departamentos AS d, sucursales AS s
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
                        SELECT DISTINCT e.id, CONCAT(e.nombre, ' ' , e.apellido) name_empleado, e.codigo, 
                            e.cedula, e.genero, e.correo, ca.id AS id_cargo, tc.cargo,
                            co.id AS id_contrato, r.id AS id_regimen, r.descripcion AS regimen, 
                            d.id AS id_departamento, d.nombre AS departamento, s.id AS id_sucursal, 
                            s.nombre AS sucursal, ca.hora_trabaja
                        FROM empl_cargos AS ca, empl_contratos AS co, cg_regimenes AS r, empleados AS e,
                            tipo_cargo AS tc, cg_departamentos AS d, sucursales AS s
                        WHERE ca.id = (SELECT da.id_cargo FROM datos_actuales_empleado AS da WHERE 
                            da.id = e.id) 
                            AND tc.id = ca.cargo
                            AND ca.id_departamento = $1
                            AND ca.id_departamento = d.id
                            AND co.id = (SELECT da.id_contrato FROM datos_actuales_empleado AS da WHERE 
                            da.id = e.id) 
                            AND s.id = d.id_sucursal
                            AND co.id_regimen = r.id AND e.estado = $2
                            AND NOT EXISTS (SELECT eu.id_empl FROM empl_ubicacion AS eu 
                                WHERE eu.id_empl = e.id AND eu.id_ubicacion = $3)
                        ORDER BY name_empleado ASC
                        `,
                        [empl.id_depa, estado, ubicacion])
                        .then((result: any) => { return result.rows });

                } else {
                    empl.empleado = await pool.query(
                        `
                        SELECT DISTINCT e.id, CONCAT(e.nombre, ' ' , e.apellido) name_empleado, e.codigo, 
                            e.cedula, e.genero, e.correo, ca.id AS id_cargo, tc.cargo,
                            co.id AS id_contrato, r.id AS id_regimen, r.descripcion AS regimen, 
                            d.id AS id_departamento, d.nombre AS departamento, s.id AS id_sucursal, 
                            s.nombre AS sucursal, ca.fec_final, ca.hora_trabaja
                        FROM empl_cargos AS ca, empl_contratos AS co, cg_regimenes AS r, empleados AS e,
                            tipo_cargo AS tc, cg_departamentos AS d, sucursales AS s
                        WHERE ca.id = (SELECT da.id_cargo FROM datos_actuales_empleado AS da WHERE 
                            da.id = e.id) 
                            AND tc.id = ca.cargo
                            AND ca.id_departamento = $1
                            AND ca.id_departamento = d.id
                            AND co.id = (SELECT da.id_contrato FROM datos_actuales_empleado AS da WHERE 
                            da.id = e.id) 
                            AND s.id = d.id_sucursal
                            AND co.id_regimen = r.id AND e.estado = $2
                            AND NOT EXISTS (SELECT eu.id_empl FROM empl_ubicacion AS eu 
                                WHERE eu.id_empl = e.id AND eu.id_ubicacion = $3)
                        ORDER BY name_empleado ASC
                        `,
                        [empl.id_depa, estado, ubicacion])
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
                    FROM cg_regimenes AS r
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
     * METODO DE CONSULTA DE DATOS GENERALES DE USUARIOS ASIGNADOS A UBICACION
     * REALIZA UN ARRAY DE CARGOS Y EMPLEADOS DEPENDIENDO DEL ESTADO DEL 
     * EMPLEADO SI BUSCA EMPLEADOS ACTIVOS O INACTIVOS. 
     * @returns Retorna Array de [Cargos[empleados[]]]
     **/

    public async DatosGeneralesCargoUbicacion(req: Request, res: Response) {
        let estado = req.params.estado;
        let { ubicacion } = req.body;

        // CONSULTA DE BUSQUEDA DE CARGOS
        let cargo = await pool.query(
            `
            SELECT tc.id AS id_cargo, tc.cargo AS name_cargo
            FROM tipo_cargo AS tc 
            ORDER BY tc.cargo ASC
            `
        ).then((result: any) => { return result.rows });

        if (cargo.length === 0) return res.status(404).jsonp({ message: 'No se han encontrado registros.' });

        // CONSULTA DE BUSQUEDA DE EMPLEADOS
        let empleados = await Promise.all(cargo.map(async (empl: any) => {
            if (estado === '1') {
                empl.empleados = await pool.query(
                    `
                    SELECT DISTINCT e.id, CONCAT(e.nombre, ' ' , e.apellido) name_empleado, e.codigo, 
                        e.cedula, e.genero, e.correo, ca.id AS id_cargo, tc.cargo,
                        co.id AS id_contrato, r.id AS id_regimen, r.descripcion AS regimen, 
                        d.id AS id_departamento, d.nombre AS departamento, s.id AS id_sucursal, 
                        s.nombre AS sucursal, ca.hora_trabaja
                    FROM empl_cargos AS ca, empl_contratos AS co, cg_regimenes AS r, empleados AS e,
                        tipo_cargo AS tc, cg_departamentos AS d, sucursales AS s
                    WHERE ca.id = (SELECT da.id_cargo FROM datos_actuales_empleado AS da WHERE 
                        da.id = e.id) 
                        AND tc.id = ca.cargo
                        AND ca.cargo = $1
                        AND ca.id_departamento = d.id
                        AND co.id = (SELECT da.id_contrato FROM datos_actuales_empleado AS da WHERE 
                        da.id = e.id) 
                        AND s.id = d.id_sucursal
                        AND co.id_regimen = r.id AND e.estado = $2
                        AND NOT EXISTS (SELECT eu.id_empl FROM empl_ubicacion AS eu 
                            WHERE eu.id_empl = e.id AND eu.id_ubicacion = $3)
                    ORDER BY name_empleado ASC
                    `
                    , [empl.id_cargo, estado, ubicacion]

                ).then((result: any) => { return result.rows });
            }
            else {
                empl.empleados = await pool.query(
                    `
                    SELECT DISTINCT e.id, CONCAT(e.nombre, ' ' , e.apellido) name_empleado, e.codigo, 
                        e.cedula, e.genero, e.correo, ca.id AS id_cargo, tc.cargo,
                        co.id AS id_contrato, r.id AS id_regimen, r.descripcion AS regimen, 
                        d.id AS id_departamento, d.nombre AS departamento, s.id AS id_sucursal, 
                        s.nombre AS sucursal, ca.fec_final, ca.hora_trabaja
                    FROM empl_cargos AS ca, empl_contratos AS co, cg_regimenes AS r, empleados AS e,
                        tipo_cargo AS tc, cg_departamentos AS d, sucursales AS s
                    WHERE ca.id = (SELECT da.id_cargo FROM datos_actuales_empleado AS da WHERE 
                        da.id = e.id) 
                        AND tc.id = ca.cargo
                        AND ca.cargo = $1
                        AND ca.id_departamento = d.id
                        AND co.id = (SELECT da.id_contrato FROM datos_actuales_empleado AS da WHERE 
                        da.id = e.id) 
                        AND s.id = d.id_sucursal
                        AND co.id_regimen = r.id AND e.estado = $2
                        AND NOT EXISTS (SELECT eu.id_empl FROM empl_ubicacion AS eu 
                            WHERE eu.id_empl = e.id AND eu.id_ubicacion = $3)
                    ORDER BY name_empleado ASC
                    `,
                    [empl.id_cargo, estado, ubicacion])
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


    // METODO PARA LISTAR DATOS ACTUALES DEL USUARIO
    public async ListarDatosActualesEmpleado(req: Request, res: Response) {
        const DATOS = await pool.query(
            `
            SELECT e_datos.id, e_datos.cedula, e_datos.apellido, e_datos.nombre, e_datos.esta_civil, 
                e_datos.genero, e_datos.correo, e_datos.fec_nacimiento, e_datos.estado, 
                e_datos.domicilio, e_datos.telefono, e_datos.id_nacionalidad, e_datos.imagen, 
                e_datos.codigo, e_datos.id_contrato, r.id AS id_regimen, r.descripcion AS regimen,
                e_datos.id_cargo, tc.id AS id_tipo_cargo, tc.cargo, c.id_departamento, 
                d.nombre AS departamento, c.id_sucursal, s.nombre AS sucursal, s.id_empresa, 
                empre.nombre AS empresa, s.id_ciudad, ciudades.descripcion AS ciudad, c.hora_trabaja
            FROM datos_actuales_empleado AS e_datos, empl_cargos AS c, cg_departamentos AS d, 
                sucursales AS s, cg_empresa AS empre, ciudades, cg_regimenes AS r, tipo_cargo AS tc, 
                empl_contratos AS co 
            WHERE c.id = e_datos.id_cargo AND d.id = c.id_departamento AND s.id = c.id_sucursal AND 
                s.id_empresa = empre.id AND ciudades.id = s.id_ciudad AND c.cargo = tc.id AND 
                e_datos.id_contrato = co.id AND co.id_regimen = r.id 
            ORDER BY e_datos.nombre ASC
            `
        );
        if (DATOS.rowCount > 0) {
            return res.jsonp(DATOS.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'error' });
        }
    }

    public async ListarDatosEmpleadoAutoriza(req: Request, res: Response) {
        const { empleado_id } = req.params;
        const DATOS = await pool.query(
            `
            SELECT (da.nombre ||' '|| da.apellido) AS fullname, da.cedula, tc.cargo, 
                cd.nombre AS departamento
            FROM datos_actuales_empleado AS da, empl_cargos AS ec, tipo_cargo AS tc,
                cg_departamentos AS cd
            WHERE da.id_cargo = ec.id AND ec.cargo = tc.id AND cd.id = da.id_departamento AND 
            da.id = $1
            `, [empleado_id]);
        if (DATOS.rowCount > 0) {
            return res.jsonp(DATOS.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'error' });
        }
    }

    // METODO PARA BUSCAR JEFES
    public async BuscarJefes(req: Request, res: Response): Promise<Response> {

        const { objeto, depa_user_loggin } = req.body;

        const permiso = objeto
        const JefesDepartamentos = await pool.query(
            `
            SELECT da.id, da.estado, n.id_departamento as id_dep, n.id_dep_nivel, n.dep_nivel_nombre, n.nivel, 
                n.id_establecimiento AS id_suc, n.departamento, s.nombre AS sucursal, da.id_empl_cargo as cargo, 
                dae.id_contrato as contrato, da.id_empleado AS empleado, (dae.nombre || ' ' || dae.apellido) as fullname,
                dae.cedula, dae.correo, c.permiso_mail, c.permiso_noti, c.vaca_mail, c.vaca_noti, c.hora_extra_mail, 
                c.hora_extra_noti, c.comida_mail, c.comida_noti 
            FROM nivel_jerarquicodep AS n, depa_autorizaciones AS da, datos_actuales_empleado AS dae,
                config_noti AS c, cg_departamentos AS cg, sucursales AS s
            WHERE n.id_departamento = $1
                AND da.id_departamento = n.id_dep_nivel
                AND dae.id_cargo = da.id_empl_cargo
                AND dae.id_contrato = c.id_empleado
                AND cg.id = $1
                AND s.id = n.id_establecimiento
            ORDER BY nivel ASC
            `
            ,
            [depa_user_loggin]).then((result: any) => { return result.rows });

        if (JefesDepartamentos.length === 0) return res.status(400)
            .jsonp({
                message: `Ups!!! algo salio mal. 
            Solicitud ingresada, pero es necesario verificar configuraciones jefes de departamento.` });

        const obj = JefesDepartamentos[JefesDepartamentos.length - 1];
        let depa_padre = obj.id_dep_nivel;
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
                FROM depa_autorizaciones AS da, empl_cargos AS ecr, cg_departamentos AS cg, 
                    sucursales AS s, empl_contratos AS ecn,empleados AS e, config_noti AS c 
                WHERE da.id_departamento = $1 AND da.id_empl_cargo = ecr.id AND 
                    da.id_departamento = cg.id AND 
                    da.estado = true AND cg.id_sucursal = s.id AND ecr.id_empl_contrato = ecn.id AND 
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
                    (SELECT cd.nombre FROM cg_departamentos AS cd WHERE cd.id = da.id_departamento) AS ndepartamento,
                    (SELECT s.nombre FROM sucursales AS s WHERE s.id = da.id_sucursal) AS nsucursal
                FROM datos_actuales_empleado AS da, config_noti AS cn 
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




    // METODO PARA BUSCAR USUARIOS ADMINISTRADORES Y JEFES DE UNA SUCURSAL
    public async BuscarAdminJefes(req: Request, res: Response) {
        const { lista_sucursales, estado } = req.body;
        console.log('ver ', lista_sucursales)
        const DATOS = await pool.query(
            "SELECT da.id, da.nombre, da.apellido, da.id_sucursal AS suc_pertenece, s.nombre AS sucursal, " +
            "   ce.jefe, r.nombre AS rol, us.id_sucursal, us.principal, us.id AS id_usucursal " +
            "FROM datos_actuales_empleado AS da, empl_cargos AS ce, cg_roles AS r, usuario_sucursal AS us, " +
            "   sucursales AS s " +
            "WHERE da.id_cargo = ce.id AND da.id_rol = r.id AND NOT da.id_rol = 2 AND s.id = da.id_sucursal " +
            "   AND da.estado = $1 AND us.id_empleado = da.id AND us.id_sucursal IN (" + lista_sucursales + ") " +
            "ORDER BY da.apellido ASC "
            , [estado]);

        if (DATOS.rowCount > 0) {
            return res.jsonp(DATOS.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'error' });
        }
    }



}

const DATOS_GENERALES_CONTROLADOR = new DatosGeneralesControlador();

export default DATOS_GENERALES_CONTROLADOR;


