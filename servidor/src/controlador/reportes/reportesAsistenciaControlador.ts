import { IReporteTimbres } from '../../class/Asistencia';
import { Request, Response } from 'express';
import pool from '../../database';

class ReportesAsistenciaControlador {

    /**
     * REALIZA UN ARRAY DE SUCURSALES CON DEPARTAMENTOS Y EMPLEADOS DEPENDIENDO DEL ESTADO DEL EMPLEADO
     * SI BUSCA EMPLEADOS ACTIVOS O INACTIVOS. 
     * @returns Retorna Array de [Sucursales[Departamentos[empleados[]]]]
     */

    // METODO PARA BUSCAR DATOS DE USUARIO
    public async DatosGeneralesUsuarios(req: Request, res: Response) {
        let estado = req.params.estado;

        // CONSULTA DE BUSQUEDA DE SUCURSALES
        let suc = await pool.query(
            `
            SELECT s.id AS id_suc, s.nombre AS name_suc, c.descripcion AS ciudad 
            FROM e_sucursales AS s, e_ciudades AS c 
            WHERE s.id_ciudad = c.id 
            ORDER BY s.id
            `
        ).then((result: any) => { return result.rows });

        if (suc.length === 0) return res.status(404).jsonp({ message: 'No se han encontrado registros.' });



        let departamentos = await Promise.all(suc.map(async (dep: any) => {
            dep.departamentos = await pool.query(
                `
                SELECT d.id as id_depa, d.nombre as name_dep, s.nombre AS sucursal
                FROM ed_departamentos AS d, e_sucursales AS s
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
                        //empl-contratos esta el id_regimen
                        `
                        SELECT DISTINCT e.id, CONCAT(e.nombre, ' ' , e.apellido) name_empleado, e.codigo, 
                            e.cedula, e.correo, ca.id AS id_cargo, tc.cargo,
                            co.id AS id_contrato, d.id AS id_departamento, d.nombre AS departamento, s.id AS id_sucursal, 
                            s.nombre AS sucursal, ca.hora_trabaja, r.id AS id_regimen, r.descripcion AS regimen, 
                            c.descripcion AS ciudad, 
                            CASE 
								WHEN e.genero = 1 THEN 'Masculino'
								WHEN e.genero = 2 THEN 'Femenino'
							END AS genero
                        FROM eu_empleado_cargos AS ca, eu_empleado_contratos AS co, eu_empleados AS e, 
                            e_cat_tipo_cargo AS tc, ed_departamentos AS d, e_sucursales AS s, ere_cat_regimenes AS r, 
                            e_ciudades AS c
                        WHERE ca.id = (SELECT da.id_cargo FROM datos_actuales_empleado AS da WHERE 
                            da.id = e.id) 
                            AND tc.id = ca.id_tipo_cargo
                            AND ca.id_departamento = $1
                            AND ca.id_departamento = d.id
                            AND co.id = (SELECT da.id_contrato FROM datos_actuales_empleado AS da WHERE da.id = e.id)
                            AND co.id_regimen = r.id 
                            AND s.id = d.id_sucursal
                            AND s.id_ciudad = c.id
                            AND e.estado = $2
                        ORDER BY name_empleado ASC
                        `
                        , [ele.id_depa, estado])
                        .then((result: any) => { return result.rows })

                } else {
                    ele.empleado = await pool.query(
                        `
                        SELECT DISTINCT e.id, CONCAT(e.nombre, ' ' , e.apellido) name_empleado, e.codigo, 
                            e.cedula, e.correo, ca.id AS id_cargo, tc.cargo,
                            co.id AS id_contrato, d.id AS id_departamento, d.nombre AS departamento, s.id AS id_sucursal, 
                            s.nombre AS sucursal, ca.hora_trabaja, e.estado AS estado, r.id AS id_regimen, r.descripcion AS regimen,
                            c.descripcion AS ciudad, 
                            CASE 
								WHEN e.genero = 1 THEN 'Masculino'
								WHEN e.genero = 2 THEN 'Femenino'
							END AS genero
                        FROM eu_empleado_cargos AS ca, eu_empleado_contratos AS co, eu_empleados AS e,
                            e_cat_tipo_cargo AS tc, ed_departamentos AS d, e_sucursales AS s, ere_cat_regimenes AS r, 
                            e_ciudades AS c
                        WHERE ca.id = (SELECT de.cargo_id FROM datos_empleado_cargo AS de WHERE 
                            de.empl_id = e.id) 
                            AND tc.id = ca.id_tipo_cargo
                            AND ca.id_departamento = $1
                            AND ca.id_departamento = d.id
                            AND co.id = (SELECT de.contrato_id FROM datos_empleado_cargo AS de WHERE de.empl_id = e.id) 
							AND co.id_regimen = r.id
                            AND s.id = d.id_sucursal
                            AND s.id_ciudad = c.id
                            AND e.estado = $2
                        ORDER BY name_empleado ASC
                        `
                        , [ele.id_depa, estado])
                        .then((result: any) => { return result.rows })
                }
                return ele
            }));
            return obj
        }))

        if (lista.length === 0) return res.status(404).jsonp({ message: 'No se ha encontrado registros de usuarios.' })

        let respuesta = lista.map((obj: any) => {
            obj.departamentos = obj.departamentos.filter((ele: any) => {
                return ele.empleado.length > 0
            })
            return obj
        }).filter((obj: any) => {
            return obj.departamentos.length > 0
        });

        if (respuesta.length === 0) return res.status(404)
            .jsonp({ message: 'Usuarios no han configurado recepción de notificaciones de comunicados.' })

        return res.status(200).jsonp(respuesta)
    }


    public async DatosGeneralesCargo(req: Request, res: Response) {
        let estado = req.params.estado;

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
                    `
                    SELECT DISTINCT e.id, CONCAT(e.nombre, ' ' , e.apellido) name_empleado, e.codigo, 
                        e.cedula, e.correo, ca.id AS id_cargo, tc.cargo,
                        co.id AS id_contrato, d.id AS id_departamento, d.nombre AS departamento, s.id AS id_sucursal, 
                        s.nombre AS sucursal, ca.hora_trabaja, r.id AS id_regimen, r.descripcion AS regimen, c.descripcion AS ciudad,  
					    CASE 
						    WHEN e.genero = 1 THEN 'Masculino'
						    WHEN e.genero = 2 THEN 'Femenino'
					    END AS genero
                    FROM eu_empleado_cargos AS ca, eu_empleado_contratos AS co, eu_empleados AS e, e_ciudades AS c,
                        e_cat_tipo_cargo AS tc, ed_departamentos AS d, e_sucursales AS s, ere_cat_regimenes AS r
                    WHERE ca.id = (SELECT da.id_cargo FROM datos_actuales_empleado AS da WHERE da.id = e.id) 
                        AND tc.id = ca.id_tipo_cargo
                        AND ca.id_departamento = d.id
                        AND co.id = (SELECT da.id_contrato FROM datos_actuales_empleado AS da WHERE da.id = e.id)
                        AND co.id_regimen = r.id 
                        AND s.id = d.id_sucursal
                        AND s.id_ciudad = c.id
                        AND ca.id_tipo_cargo = $1
                        AND e.estado = $2
                    ORDER BY name_empleado ASC
                    `
                    , [empl.id_cargo, estado]

                ).then((result: any) => { return result.rows });
            }
            else {
                empl.empleados = await pool.query(
                    `
                    SELECT DISTINCT e.id, CONCAT(e.nombre, ' ' , e.apellido) name_empleado, e.codigo, 
                        e.cedula, e.correo, e.estado, ca.id AS id_cargo, tc.cargo,
                        d.id AS id_departamento, d.nombre AS departamento, s.id AS id_sucursal, 
                        s.nombre AS sucursal, ca.hora_trabaja, c.descripcion AS ciudad, r.id AS id_regimen, r.descripcion AS regimen,
						 CASE 
							WHEN e.genero = 1 THEN 'Masculino'
							WHEN e.genero = 2 THEN 'Femenino'
						END AS genero
                    FROM eu_empleados e, eu_empleado_cargos AS ca, eu_empleado_contratos AS co, e_cat_tipo_cargo AS tc,
                        ed_departamentos AS d, e_sucursales AS s, e_ciudades AS c, ere_cat_regimenes AS r
                    WHERE ca.id = (SELECT de.cargo_id FROM datos_empleado_cargo AS de WHERE de.empl_id = e.id)
                        AND ca.id = (SELECT de.contrato_id FROM datos_empleado_cargo AS de WHERE de.empl_id = e.id) 
						AND ca.id_contrato = co.id
						AND co.id_regimen = r.id
                        AND ca.id_departamento = d.id
                        AND s.id = d.id_sucursal
                        AND s.id_ciudad = c.id
                        AND tc.id = ca.id_tipo_cargo
                        AND ca.id_tipo_cargo = $1
                        AND e.estado = $2
                    ORDER BY name_empleado ASC
                    `
                    , [empl.id_cargo, estado])
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


    public async ReporteTimbresMultiple(req: Request, res: Response) {

        let { desde, hasta } = req.params;
        let datos: any[] = req.body;
        //El reporte funciona para relojs de 6, 3 y sin acciones.        

        let n: Array<any> = await Promise.all(datos.map(async (obj: IReporteTimbres) => {
            obj.departamentos = await Promise.all(obj.departamentos.map(async (ele) => {
                ele.empleado = await Promise.all(ele.empleado.map(async (o) => {
                    o.timbres = await BuscarTimbres(desde, hasta, o.codigo);
                    console.log('Timbres: ', o);
                    return o
                })
                )
                return ele
            })
            )
            return obj
        })
        )


        let nuevo = n.map((obj: IReporteTimbres) => {

            obj.departamentos = obj.departamentos.map((e) => {

                e.empleado = e.empleado.filter((t: any) => { return t.timbres.length > 0 })
                // console.log('Empleados: ',e);
                return e

            }).filter((e: any) => { return e.empleado.length > 0 })
            return obj

        }).filter(obj => { return obj.departamentos.length > 0 })

        if (nuevo.length === 0) return res.status(400).jsonp({ message: 'No hay timbres en ese periodo.' })

        return res.status(200).jsonp(nuevo)

    }

    public async ReporteTimbresMultipleRegimenCargo(req: Request, res: Response) {
        console.log('datos recibidos', req.body)
        let { desde, hasta } = req.params;
        let datos: any[] = req.body;
        let n: Array<any> = await Promise.all(datos.map(async (obj: any) => {
            obj.empleados = await Promise.all(obj.empleados.map(async (o: any) => {
                o.timbres = await BuscarTimbres(desde, hasta, o.codigo);
                console.log('Timbres: ', o);
                return o;
            }));
            return obj;
        }));

        let nuevo = n.map((e: any) => {
            e.empleados = e.empleados.filter((t: any) => { return t.timbres.length > 0 })
            return e
        }).filter(e => { return e.empleados.length > 0 })

        if (nuevo.length === 0) return res.status(400).jsonp({ message: 'No hay timbres en ese periodo.' })

        return res.status(200).jsonp(nuevo)

    }

    public async ReporteTimbresIncompletos(req: Request, res: Response) {
        let { desde, hasta } = req.params;
        let datos: any[] = req.body;
        let n: Array<any> = await Promise.all(datos.map(async (obj: IReporteTimbres) => {
            obj.departamentos = await Promise.all(obj.departamentos.map(async (ele) => {
                ele.empleado = await Promise.all(ele.empleado.map(async (o) => {
                    o.timbres = await BuscarTimbresIncompletos(desde, hasta, o.codigo);
                    console.log('Timbres: ', o);
                    return o
                })
                )
                return ele
            })
            )
            return obj
        })
        )
        let nuevo = n.map((obj: IReporteTimbres) => {
            obj.departamentos = obj.departamentos.map((e) => {
                e.empleado = e.empleado.filter((t: any) => { return t.timbres.length > 0 })
                return e
            }).filter((e: any) => { return e.empleado.length > 0 })
            return obj

        }).filter(obj => { return obj.departamentos.length > 0 })

        if (nuevo.length === 0) return res.status(400).jsonp({ message: 'No hay timbres incompletos en ese periodo.' })

        return res.status(200).jsonp(nuevo)

    }

    public async ReporteTimbresIncompletosRegimenCargo(req: Request, res: Response) {
        console.log('datos recibidos', req.body)
        let { desde, hasta } = req.params;
        let datos: any[] = req.body;
        let n: Array<any> = await Promise.all(datos.map(async (obj: any) => {
            obj.empleados = await Promise.all(obj.empleados.map(async (o: any) => {
                o.timbres = await BuscarTimbresIncompletos(desde, hasta, o.codigo);
                console.log('Timbres: ', o);
                return o;
            }));
            return obj;
        }));

        let nuevo = n.map((e: any) => {
            e.empleados = e.empleados.filter((t: any) => { return t.timbres.length > 0 })
            return e
        }).filter(e => { return e.empleados.length > 0 })

        if (nuevo.length === 0) return res.status(400).jsonp({ message: 'No hay timbres incompletos en ese periodo.' })

        return res.status(200).jsonp(nuevo)

    }

    // REPORTE DE TIMBRES REALIZADOS EN EL SISTEMA
    public async ReporteTimbreSistema(req: Request, res: Response) {

        let { desde, hasta } = req.params;
        let datos: any[] = req.body;
        //El reporte funciona para relojs de 6, 3 y sin acciones.        

        let n: Array<any> = await Promise.all(datos.map(async (obj: IReporteTimbres) => {
            obj.departamentos = await Promise.all(obj.departamentos.map(async (ele) => {
                ele.empleado = await Promise.all(ele.empleado.map(async (o) => {
                    o.timbres = await BuscarTimbreSistemas(desde, hasta, o.codigo);
                    console.log('Timbres: ', o);
                    return o
                })
                )
                return ele
            })
            )
            return obj
        })
        )

        let nuevo = n.map((obj: IReporteTimbres) => {

            obj.departamentos = obj.departamentos.map((e) => {

                e.empleado = e.empleado.filter((t: any) => { return t.timbres.length > 0 })
                // console.log('Empleados: ',e);
                return e

            }).filter((e: any) => { return e.empleado.length > 0 })
            return obj

        }).filter(obj => { return obj.departamentos.length > 0 })

        if (nuevo.length === 0) return res.status(400).jsonp({ message: 'No hay timbres en ese periodo.' })

        return res.status(200).jsonp(nuevo)
    }

    // REPORTE DE TIMBRES REALIZADOS EN EL SISTEMA PARA REGIMEN Y CARGO
    public async ReporteTimbreSistemaRegimenCargo(req: Request, res: Response) {
        let { desde, hasta } = req.params;
        let datos: any[] = req.body;
        let n: Array<any> = await Promise.all(datos.map(async (obj: any) => {
            obj.empleados = await Promise.all(obj.empleados.map(async (o: any) => {
                o.timbres = await BuscarTimbreSistemas(desde, hasta, o.codigo);
                console.log('Timbres: ', o);
                return o;
            }));
            return obj;
        }));

        let nuevo = n.map((e: any) => {
            e.empleados = e.empleados.filter((t: any) => { return t.timbres.length > 0 })
            return e
        }).filter(e => { return e.empleados.length > 0 })

        if (nuevo.length === 0) return res.status(400).jsonp({ message: 'No hay timbres en ese periodo.' })

        return res.status(200).jsonp(nuevo)
    }

    // REPORTE DE TIMBRES REALIZADOS EN EL RELOJ VIRTUAL
    public async ReporteTimbreRelojVirtual(req: Request, res: Response) {

        let { desde, hasta } = req.params;
        let datos: any[] = req.body;
        //El reporte funciona para relojs de 6, 3 y sin acciones.        

        let n: Array<any> = await Promise.all(datos.map(async (obj: IReporteTimbres) => {
            obj.departamentos = await Promise.all(obj.departamentos.map(async (ele) => {
                ele.empleado = await Promise.all(ele.empleado.map(async (o) => {
                    o.timbres = await BuscarTimbreRelojVirtual(desde, hasta, o.codigo);
                    console.log('Timbres: ', o);
                    return o
                })
                )
                return ele
            })
            )
            return obj
        })
        )

        let nuevo = n.map((obj: IReporteTimbres) => {

            obj.departamentos = obj.departamentos.map((e) => {

                e.empleado = e.empleado.filter((t: any) => { return t.timbres.length > 0 })
                // console.log('Empleados: ',e);
                return e

            }).filter((e: any) => { return e.empleado.length > 0 })
            return obj

        }).filter(obj => { return obj.departamentos.length > 0 })

        if (nuevo.length === 0) return res.status(400).jsonp({ message: 'No hay timbres en ese periodo.' })

        return res.status(200).jsonp(nuevo)
    }

    // REPORTE DE TIMBRES REALIZADOS EN EL RELOJ VIRTUAL PARA REGIMEN Y CARGO
    public async ReporteTimbreRelojVirtualRegimenCargo(req: Request, res: Response) {
        let { desde, hasta } = req.params;
        let datos: any[] = req.body;
        let n: Array<any> = await Promise.all(datos.map(async (obj: any) => {
            obj.empleados = await Promise.all(obj.empleados.map(async (o: any) => {
                o.timbres = await BuscarTimbreRelojVirtual(desde, hasta, o.codigo);
                console.log('Timbres: ', o);
                return o;
            }));
            return obj;
        }));

        let nuevo = n.map((e: any) => {
            e.empleados = e.empleados.filter((t: any) => { return t.timbres.length > 0 })
            return e
        }).filter(e => { return e.empleados.length > 0 })

        if (nuevo.length === 0) return res.status(400).jsonp({ message: 'No hay timbres en ese periodo.' })

        return res.status(200).jsonp(nuevo)
    }

    // REPORTE DE TIMBRES HORARIO ABIERTO
    public async ReporteTimbreHorarioAbierto(req: Request, res: Response) {

        let { desde, hasta } = req.params;
        let datos: any[] = req.body;
        //El reporte funciona para relojs de 6, 3 y sin acciones.        

        let n: Array<any> = await Promise.all(datos.map(async (obj: IReporteTimbres) => {
            obj.departamentos = await Promise.all(obj.departamentos.map(async (ele) => {
                ele.empleado = await Promise.all(ele.empleado.map(async (o) => {
                    o.timbres = await BuscarTimbreHorarioAbierto(desde, hasta, o.codigo);
                    console.log('Timbres: ', o);
                    return o
                })
                )
                return ele
            })
            )
            return obj
        })
        )

        let nuevo = n.map((obj: IReporteTimbres) => {

            obj.departamentos = obj.departamentos.map((e) => {

                e.empleado = e.empleado.filter((t: any) => { return t.timbres.length > 0 })
                // console.log('Empleados: ',e);
                return e

            }).filter((e: any) => { return e.empleado.length > 0 })
            return obj

        }).filter(obj => { return obj.departamentos.length > 0 })

        if (nuevo.length === 0) return res.status(400).jsonp({ message: 'No hay timbres en ese periodo.' })

        return res.status(200).jsonp(nuevo)
    }

    // REPORTE DE TIMBRES HORARIO ABIERTO
    public async ReporteTimbreHorarioAbiertoRegimenCargo(req: Request, res: Response) {
        console.log('datos recibidos', req.body)
        let { desde, hasta } = req.params;
        let datos: any[] = req.body;
        let n: Array<any> = await Promise.all(datos.map(async (obj: any) => {
            obj.empleados = await Promise.all(obj.empleados.map(async (o: any) => {
                o.timbres = await BuscarTimbreHorarioAbierto(desde, hasta, o.codigo);
                console.log('Timbres: ', o);
                return o;
            }));
            return obj;
        }));

        let nuevo = n.map((e: any) => {
            e.empleados = e.empleados.filter((t: any) => { return t.timbres.length > 0 })
            return e
        }).filter(e => { return e.empleados.length > 0 })


        if (nuevo.length === 0) return res.status(400).jsonp({ message: 'No hay timbres en ese periodo.' })

        return res.status(200).jsonp(nuevo)
    }


    public async ReporteTimbresAbiertos(req: Request, res: Response) {

        const { data, desde, hasta }: any = req.query;

        try {
            const array = JSON.parse(data);
            if (array.length === 0) return res.status(400).jsonp({ message: 'No existe datos de consulta.' })

            const resultado = await Promise.all(array.map(async (o: any) => {
                return {
                    id: o.id,
                    codigo: o.codigo,
                    fullname: o.fullname,
                    cedula: o.cedula,
                    timbres: await pool.query(
                        `
                        SELECT CAST(fecha_hora_timbre AS VARCHAR), accion, observacion, latitud, longitud, 
                            CAST(fecha_hora_timbre_servidor AS VARCHAR), dispositivo_timbre 
                        FROM eu_timbres WHERE codigo = $1 AND accion = \'HA\' AND fecha_hora_timbre BETWEEN $2 AND $3 
                        ORDER BY fecha_hora_timbre DESC 
                        `
                        , [o.codigo, new Date(desde), new Date(hasta)])
                        .then(result => { return result.rows })
                }
            }))

            const nuevo = resultado.filter((obj: any) => { return obj.timbres.length > 0 })

            return res.status(200).jsonp(nuevo)
        } catch (error) {
            return res.status(500).jsonp({ message: error })
        }

    }

}

const REPORTE_A_CONTROLADOR = new ReportesAsistenciaControlador();
export default REPORTE_A_CONTROLADOR


const BuscarTimbres = async function (fec_inicio: string, fec_final: string, codigo: string | number) {
    return await pool.query(
        `
        SELECT CAST(fecha_hora_timbre AS VARCHAR), id_reloj, accion, observacion, 
            latitud, longitud, CAST(fecha_hora_timbre_servidor AS VARCHAR) 
        FROM eu_timbres WHERE CAST(fecha_hora_timbre AS VARCHAR) BETWEEN $1 || \'%\' 
            AND ($2::timestamp + \'1 DAY\') || \'%\' AND codigo = $3 
        ORDER BY fecha_hora_timbre ASC
        `
        , [fec_inicio, fec_final, codigo])
        .then(res => {
            return res.rows;
        })
}

const BuscarTimbresIncompletos = async function (fec_inicio: string, fec_final: string, codigo: string | number) {
    return await pool.query(
        `
        SELECT CAST(fecha_hora_horario AS VARCHAR), codigo, estado_timbre, tipo_accion AS accion, tipo_dia, estado_origen
        FROM plan_general WHERE CAST(fecha_hora_horario AS VARCHAR) BETWEEN $1 || \'%\' 
            AND ($2::timestamp + \'1 DAY\') || \'%\' AND codigo = $3 
            AND fecha_hora_timbre IS null AND estado_origen IN (\'N\',\'HL\', \'HFD\') 
        ORDER BY fecha_hora_horario ASC
        `
        , [fec_inicio, fec_final, codigo])
        .then(res => {
            return res.rows;
        })
}

// CONSULTA TIMBRES REALIZADOS EN EL SISTEMA CODIGO 98
const BuscarTimbreSistemas = async function (fec_inicio: string, fec_final: string, codigo: string | number) {
    return await pool.query(
        `
        SELECT CAST(fecha_hora_timbre AS VARCHAR), id_reloj, accion, observacion, 
            latitud, longitud, CAST(fecha_hora_timbre_servidor AS VARCHAR) 
        FROM eu_timbres WHERE CAST(fecha_hora_timbre AS VARCHAR) BETWEEN $1 || \'%\' 
            AND ($2::timestamp + \'1 DAY\') || \'%\' AND codigo = $3 AND id_reloj = \'98\' 
            AND NOT accion = \'HA\'
        ORDER BY fecha_hora_timbre ASC
        `
        , [fec_inicio, fec_final, codigo])
        .then(res => {
            return res.rows;
        })
}

// CONSULTA TIMBRES REALIZADOS EN EL RELOJ VIRTUAL CODIGO 97
const BuscarTimbreRelojVirtual = async function (fec_inicio: string, fec_final: string, codigo: string | number) {
    return await pool.query(
        `
        SELECT CAST(fecha_hora_timbre AS VARCHAR), id_reloj, accion, observacion, 
            latitud, longitud, CAST(fecha_hora_timbre_servidor AS VARCHAR) 
        FROM eu_timbres WHERE CAST(fecha_hora_timbre AS VARCHAR) BETWEEN $1 || \'%\' 
            AND ($2::timestamp + \'1 DAY\') || \'%\' AND codigo = $3 AND id_reloj = \'97\' 
            AND NOT accion = \'HA\' 
        ORDER BY fecha_hora_timbre ASC
        `
        , [fec_inicio, fec_final, codigo])
        .then(res => {
            return res.rows;
        })
}

// CONSULTA TIMBRES REALIZADOS EN EL RELOJ VIRTUAL CODIGO 97
const BuscarTimbreHorarioAbierto = async function (fec_inicio: string, fec_final: string, codigo: string | number) {
    return await pool.query(
        `
        SELECT CAST(fecha_hora_timbre AS VARCHAR), id_reloj, accion, observacion, 
            latitud, longitud, CAST(fecha_hora_timbre_servidor AS VARCHAR) 
        FROM eu_timbres WHERE CAST(fecha_hora_timbre AS VARCHAR) BETWEEN $1 || \'%\' 
            AND ($2::timestamp + \'1 DAY\') || \'%\' AND codigo = $3 AND accion = \'HA\' 
        ORDER BY fecha_hora_timbre ASC
        `
        , [fec_inicio, fec_final, codigo])
        .then(res => {
            return res.rows;
        })
}