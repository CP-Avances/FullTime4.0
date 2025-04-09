const db = require('../database_cliente')
const bdd = require('../database_Fulltime');

class Timbres {
    constructor() {}

    async ObtenerRelojesCliente() {
        return await db.cliente.query('SELECT relo_id, relo_id AS id, descripcion, ip, puerto_com, marca, modelo, serie FROM reloj').then(result => { return result.rows});
    }

    async setRelojes(lista_relojes, id_depa, id_suc) {
        return Promise.all(lista_relojes.map(async(obj) => {
            obj.id = await bdd.fulltime.query('INSERT INTO ed_relojes (nombre, ip, puerto, marca, modelo, serie, tien_funciones, id_sucursal, id_departamento) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id',
            [obj.descripcion, obj.ip, obj.puerto_com, obj.marca, obj.modelo, obj.serie, true, id_depa, id_suc])
            .then(result => { console.log(result.command, 'reloj', obj.descripcion ); return result.rows[0].id})
            return obj
        }))
    }

    async ObtenerRelojesIngresados() {
        return await bdd.fulltime.query('SELECT id, nombre FROM ed_relojes ORDER BY id ASC').then(res => { return res.rows})
    }

    async ObtenerTimbres() {
        return await db.cliente.query('SELECT fecha_hora_timbre, accion, tecla_funcion, observacion, latitud, longitud, codigo_reloj, codigo_empleado FROM timbre ORDER BY fecha_hora_timbre')
            .then(result => { return result.rows})
    }

    async SetTimbre(obj, id_reloj) {
        await bdd.fulltime.query('INSERT INTO timbres (fec_hora_timbre, accion, tecl_funcion, observacion, latitud, longitud, id_empleado, id_reloj) VALUES($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id',
        [obj.fecha_hora_timbre, obj.accion, obj.tecla_funcion, obj.observacion, obj.latitud, obj.longitud, obj.codigo_empleado, id_reloj])
        .then(result => {
            console.log(result.command, 'timbre: ', result.rows[0].id);
        });
        return 0 
    }
}

module.exports = Timbres; 