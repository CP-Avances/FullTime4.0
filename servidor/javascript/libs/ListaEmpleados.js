"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Consultar = void 0;
const database_1 = __importDefault(require("../database"));
function EmpleadoDepartamentos(id_empleado) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield database_1.default.query('SELECT CONCAT(e.nombre, \' \', e.apellido) name_empleado, e.cedula, e.codigo, co.id_regimen, ca.cargo, d.nombre AS nom_depa FROM empleados AS e, empl_contratos AS co, empl_cargos AS ca, cg_departamentos AS d WHERE e.id = $1 AND e.estado = 1 AND  e.id = co.id_empleado AND ca.id_empl_contrato = co.id AND ca.id_departamento = d.id ORDER BY co.fec_ingreso DESC, ca.fec_inicio DESC LIMIT 1', [id_empleado])
            .then(result => {
            return result.rows[0];
        }).then((obj) => __awaiter(this, void 0, void 0, function* () {
            let data = {
                cedula: obj.cedula,
                codigo: obj.codigo,
                nom_completo: obj.name_empleado,
                departamento: obj.nom_depa,
                cargo: obj.cargo,
                grupo: 'Regimen Laboral',
                detalle_grupo: yield database_1.default.query('select descripcion from cg_regimenes where id = $1', [obj.id_regimen])
                    .then(res => {
                    return res.rows[0].descripcion;
                })
            };
            // console.log(data);
            return data;
        }));
    });
}
function IdsEmpleados(id_empresa) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield database_1.default.query('SELECT distinct co.id_empleado, e.apellido FROM sucursales AS s, cg_departamentos AS d, empl_cargos AS ca, empl_contratos AS co, empleados AS e WHERE s.id_empresa = $1 AND s.id = d.id_sucursal AND ca.id_sucursal = s.id AND d.id = ca.id_departamento AND co.id = ca.id_empl_contrato AND e.id = co.id_empleado AND e.estado = 1 ORDER BY e.apellido ASC', [id_empresa])
            .then(result => {
            return result.rows;
        });
    });
}
function Consultar(id_empresa) {
    return __awaiter(this, void 0, void 0, function* () {
        let ids = yield IdsEmpleados(id_empresa);
        // console.log(ids);    
        var results = yield Promise.all(ids.map((item) => __awaiter(this, void 0, void 0, function* () {
            return yield EmpleadoDepartamentos(item.id_empleado);
        })));
        // console.log(results);
        return results;
    });
}
exports.Consultar = Consultar;
