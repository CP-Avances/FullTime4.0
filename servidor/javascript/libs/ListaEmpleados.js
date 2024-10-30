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
        return yield database_1.default.query(`
        SELECT CONCAT(e.nombre, \' \', e.apellido) name_empleado, e.cedula, e.codigo, co.id_regimen, ca.id_tipo_cargo,
            d.nombre AS nom_depa 
        FROM eu_empleados AS e, eu_empleado_contratos AS co, eu_empleado_cargos AS ca, ed_departamentos AS d 
        WHERE e.id = $1 AND e.estado = 1 AND e.id = co.id_empleado AND ca.id_contrato = co.id 
            AND ca.id_departamento = d.id 
        ORDER BY co.fecha_ingreso DESC, ca.fecha_inicio DESC LIMIT 1
        `, [id_empleado])
            .then(result => {
            return result.rows[0];
        }).then((obj) => __awaiter(this, void 0, void 0, function* () {
            let data = {
                cedula: obj.cedula,
                codigo: obj.codigo,
                nom_completo: obj.name_empleado,
                departamento: obj.nom_depa,
                cargo: obj.id_tipo_cargo,
                grupo: 'Regimen Laboral',
                detalle_grupo: yield database_1.default.query(`
                    SELECT descripcion FROM ere_cat_regimenes where id = $1
                    `, [obj.id_regimen])
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
        return yield database_1.default.query(`
        SELECT DISTINCT co.id_empleado, e.apellido 
        FROM e_sucursales AS s, ed_departamentos AS d, eu_empleado_cargos AS ca, eu_empleado_contratos AS co, 
            eu_empleados AS e 
        WHERE s.id_empresa = $1 AND s.id = d.id_sucursal AND ca.id_sucursal = s.id AND d.id = ca.id_departamento 
            AND co.id = ca.id_contrato AND e.id = co.id_empleado AND e.estado = 1 
        ORDER BY e.apellido ASC
        `, [id_empresa])
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
