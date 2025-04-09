const db = require('../database_cliente')
const bdd = require('../database_Fulltime');

class Vacaciones {
    constructor() {}

    async ObtenerPeriodosVacacionCliente() {
        return await db.cliente.query('SELECT epva_id, epva_id AS id, empl_id, descripcion, estado, fecha_desde, dias_perdidos, horas FROM empleado_periodo_vacacion ORDER BY epva_id')
            .then(result => { return result.rows})
    }

}

module.exports = Vacaciones; 