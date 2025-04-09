const db = require('../database_cliente')
const bdd = require('../database_Fulltime');

class Permisos {
    constructor() {}

    async ObtenerTipoPermisos() {
        return await db.cliente.query('SELECT tipe_id, tipe_id AS id, descripcion, descuento, maximo_dias, maximo_horas, afecta_fecha_vacacion, acumula_anios, genera_just, valida_fechas, acceso_empleados, legalizar, incluir_almuerzo, dias_justificacion FROM tipo_permiso ORDER BY tipe_id')
            .then(result => { return result.rows})
    }

    async Set_Cg_tipo_permiso(obj) {
        let tipo_permiso = await bdd.fulltime.query('SELECT id FROM mp_cat_tipo_permisos WHERE descripcion = $1',[obj.descripcion])
            .then(res => { return res.rows });
        if (tipo_permiso.length === 0) {
            return await bdd.fulltime.query('INSERT INTO mp_cat_tipo_permisos(descripcion, tipo_descuento, num_dia_maximo, num_dia_ingreso, vaca_afecta, anio_acumula, gene_justificacion, fec_validar, acce_empleado, legalizar, almu_incluir, num_dia_justifica) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING id',
            [obj.descripcion, obj.descuento, obj.maximo_dias, obj.maximo_horas, obj.afecta_fecha_vacacion, obj.acumula_anios, obj.genera_just, obj.valida_fechas, obj.acceso_empleados, obj.legalizar, obj.incluir_almuerzo, obj.dias_justificacion])
            .then(result => { 
                console.log(result.command, 'TIPO PERMISO', obj.descripcion ) 
                return result.rows[0].id;
            });
        } else {
            return tipo_permiso[0].id
        }
    }

    
}

module.exports = Permisos; 