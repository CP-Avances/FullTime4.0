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
exports.ImagenBase64LogosEmpleado = exports.ImagenBase64LogosEmpresas = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const ImagenBase64LogosEmpresas = function (path_file) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("Path logo: ", path_file);
        let separador = path_1.default.sep;
        try {
            path_file = path_1.default.resolve('logos') + separador + path_file;
            console.log('ver si ingresa ', path_file);
            let data = fs_1.default.readFileSync(path_file);
            console.log('data 8899 ', data);
            return data.toString('base64');
        }
        catch (error) {
            return 0;
        }
    });
};
exports.ImagenBase64LogosEmpresas = ImagenBase64LogosEmpresas;
const ImagenBase64LogosEmpleado = function (ruta) {
    console.log("Path logo: ", ruta);
    let separador = path_1.default.sep;
    try {
        let path_file = path_1.default.resolve(ruta);
        console.log('ver si ingresa ', ruta);
        let data = fs_1.default.readFileSync(path_file);
        console.log('data 9999 ', data);
        return data.toString('base64');
    }
    catch (error) {
        return 0;
    }
};
exports.ImagenBase64LogosEmpleado = ImagenBase64LogosEmpleado;
