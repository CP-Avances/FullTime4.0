import pool from '../database'

async function EmpleadoDepartamentos(id_empleado: number) {
    return await pool.query(
        `
        SELECT CONCAT(e.nombre, \' \', e.apellido) name_empleado, e.identificacion, e.codigo, co.id_regimen, ca.id_tipo_cargo,
            d.nombre AS nom_depa 
        FROM eu_empleados AS e, eu_empleado_contratos AS co, eu_empleado_cargos AS ca, ed_departamentos AS d 
        WHERE e.id = $1 AND e.estado = 1 AND e.id = co.id_empleado AND ca.id_contrato = co.id 
            AND ca.id_departamento = d.id 
        ORDER BY co.fecha_ingreso DESC, ca.fecha_inicio DESC LIMIT 1
        `
        , [id_empleado])
        .then(result => {
            return result.rows[0]
        }).then(async (obj) => {

            let data = {
                identificacion: obj.identificacion,
                codigo: obj.codigo,
                nom_completo: obj.name_empleado,
                departamento: obj.nom_depa,
                cargo: obj.id_tipo_cargo,
                grupo: 'Regimen Laboral',
                detalle_grupo: await pool.query(
                    `
                    SELECT descripcion FROM ere_cat_regimenes where id = $1
                    `
                    , [obj.id_regimen])
                    .then(res => {
                        return res.rows[0].descripcion
                    })
            }
            // console.log(data);

            return data
        })
}

async function IdsEmpleados(id_empresa: number) {
    return await pool.query(
        `
        SELECT DISTINCT co.id_empleado, e.apellido 
        FROM e_sucursales AS s, ed_departamentos AS d, eu_empleado_cargos AS ca, eu_empleado_contratos AS co, 
            eu_empleados AS e 
        WHERE s.id_empresa = $1 AND s.id = d.id_sucursal AND ca.id_sucursal = s.id AND d.id = ca.id_departamento 
            AND co.id = ca.id_contrato AND e.id = co.id_empleado AND e.estado = 1 
        ORDER BY e.apellido ASC
        `
        , [id_empresa])
        .then(result => {
            return result.rows
        })
}

export async function Consultar(id_empresa: number) {

    let ids = await IdsEmpleados(id_empresa)
    // console.log(ids);    
    var results: any[] = await Promise.all(ids.map(async (item): Promise<any> => {
        return await EmpleadoDepartamentos(item.id_empleado);
    }));
    // console.log(results);
    return results
}