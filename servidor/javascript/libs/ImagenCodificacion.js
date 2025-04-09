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
exports.ComprimirImagen = exports.ConvertirImagenBase64 = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const sharp_1 = __importDefault(require("sharp"));
const ConvertirImagenBase64 = function (ruta) {
    console.log("Path img: ", ruta);
    try {
        let path_file = path_1.default.resolve(ruta);
        //console.log('ver si ingresa ', ruta)
        let data = fs_1.default.readFileSync(path_file);
        //console.log('data img', data)
        return data.toString('base64');
    }
    catch (error) {
        return 0;
    }
};
exports.ConvertirImagenBase64 = ConvertirImagenBase64;
const ComprimirImagen = function (ruta_temporal, ruta_guardar) {
    //console.log(' dos rutas ', ruta_temporal, ' guardar ', ruta_guardar)
    try {
        fs_1.default.access(ruta_temporal, fs_1.default.constants.F_OK, (err) => {
            if (!err) {
                (0, sharp_1.default)(ruta_temporal)
                    .resize(800) // CAMBIA EL TAMAÑO DE LA IMAGEN A UN ANCHO DE 800 PÍXELES, MANTIENE LA RELACION DE ASPECTO
                    .jpeg({ quality: 80 }) // CONFIGURA LA CALIDAD DE LA IMAGEN JPEG AL 80%
                    .toFile(ruta_guardar);
                // ELIMIAR EL ARCHIVO ORIGINAL
                setTimeout(() => __awaiter(this, void 0, void 0, function* () {
                    fs_1.default.unlinkSync(ruta_temporal);
                }), 1000); // ESPERAR 1 SEGUNDO
            }
        });
    }
    catch (error) {
        //console.log('error ', error)
        return false;
    }
};
exports.ComprimirImagen = ComprimirImagen;
