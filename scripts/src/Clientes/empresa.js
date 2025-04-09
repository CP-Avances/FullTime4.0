const db = require('../database_cliente')
const bdd = require('../database_Fulltime');

class Empresa {
    constructor() {}
    /**
     * tipo empresa => Pública, Privada, ONG, Persona Natural, Otro. 
     * establecimiento => Sucursales, Agencias, Otro.
     * cambios => true, false
     */

    async getEmpresa() {
        return await bdd.fulltime.query('SELECT id, establecimiento FROM e_empresa').then(result => { return result.rows});
    }

    async setEmpresa(nombre, ruc, direccion, telefono, correo, representante, tipo_empresa, establecimiento, dias_cambio, cambios) {
        return await bdd.fulltime.query('INSERT INTO e_empresa (nombre, ruc, direccion, telefono, correo, representante, tipo_empresa, establecimiento, dias_cambio, cambios) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id, establecimiento',[nombre, ruc, direccion, telefono, correo, representante, tipo_empresa, establecimiento, dias_cambio, cambios])
            .then(result => { 
                console.log(result.command);
                return result.rows[0];
            })
            .catch(err => { console.log(err);});
        //  await bdd.fulltime.query('SELECT id, establecimiento FROM e_empresa WHERE ruc = $1',[ruc]).then(result => {return result.rows[0]});
    }

    async setSucursales(nombre, id_ciudad, id_empresa) {
        if (nombre.split(' ')[0] === 'Sucursales') {
            nombre = 'SUCURSAL ' + nombre.split(' ')[1]; 
        } else if (nombre.split(' ')[0] === 'Agencias') {
            nombre = 'AGENCIA ' + nombre.split(' ')[1]; 
        } else {
            nombre = nombre.toUpperCase();
        }
        console.log(nombre, id_ciudad, id_empresa);

        let sucursal = await this.getSucursal(nombre, id_ciudad, id_empresa);
        if (sucursal.id === undefined ) {
            return await bdd.fulltime.query('INSERT INTO sucursales (nombre, id_ciudad, id_empresa) VALUES($1, $2, $3) RETURNING id, nombre',[nombre, id_ciudad, id_empresa])
            .then(result => { 
                console.log( result.command, ' sucursal');
                return result.rows[0]
            })
            .catch(err => { console.log(err);})
        } else {
            console.log('Ya existe sucursal con esos datos.');
            return sucursal
        }
    }
    
    async getSucursal(nombre, id_ciudad, id_empresa) {
        return await bdd.fulltime.query('SELECT id, nombre FROM sucursales WHERE nombre like $1 AND id_ciudad = $2 AND id_empresa = $3',[nombre, id_ciudad, id_empresa]).then(result => {return result.rows[0]})
    }

    async getDepartamentosCliente() {
        return await db.cliente.query('SELECT depa_id, dep_depa_id, depa_id AS id, dep_depa_id AS depa_padre, descripcion AS nombre, nivel, empl_id FROM departamento ORDER BY id').then(result => { return result.rows});
    }

    async setDepatamentoFulltime(nombre, nivel, id_sucursal) {
        
        let comparar = await this.CompararDepartamentos(nombre, id_sucursal);
        if (comparar.length === 0) {
            console.log(nombre, nivel, id_sucursal);
            return await bdd.fulltime.query('INSERT INTO ed_departamentos(nombre, nivel, id_sucursal) VALUES($1, $2, $3) RETURNING id',[nombre, nivel, id_sucursal])
            .then(result => { 
                console.log(result.command, 'Departamento', result.rows[0].id)
                return result.rows[0].id
            });
        } else {
            return comparar[0].id
        }

    }

    async CompararDepartamentos(nombre, id_sucursal) {
        return await bdd.fulltime.query('SELECT id FROM ed_departamentos WHERE nombre like $1 AND id_sucursal = $2 ORDER BY id',[nombre.toString(), id_sucursal])
        .then(result => { return result.rows })
    }

    async updateDepaPadre(id, depa_padre) {
        return await bdd.fulltime.query('UPDATE ed_departamentos SET depa_padre = $1 WHERE id = $2', [depa_padre, id])
        .then(result => { console.log(result.command, id);})
    }
}

module.exports = Empresa; 