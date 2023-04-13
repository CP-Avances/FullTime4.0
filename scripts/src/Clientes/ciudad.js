const db = require('../database_cliente')
const bdd = require('../database_Fulltime');

class Ciudades {
    constructor() {}

    async ObtenerCiudades() {
        return await db.cliente.query('SELECT upper(c.descripcion) AS ciudad, upper(p.descripcion) AS provincia FROM ciudad AS c, provincia AS p WHERE c.prov_id = p.prov_id')
            .then(result => { return result.rows})
    }

    async BusquedaIdCiudad(ciudad, provincia) {
        let ids = await bdd.fulltime.query('SELECT c.id AS id_ciudad, upper(c.descripcion) AS ciudad, p.id AS id_provincia, upper(p.nombre) AS provincia FROM cg_provincias AS p, ciudades AS c WHERE UPPER(c.descripcion) like $1 AND UPPER(p.nombre) like $2',[ciudad, provincia])
                .then(result => { return result.rows});
        // console.log(ids);
        if (ids.length === 0) return 0;

        return ids 
    }
}

module.exports = Ciudades; 