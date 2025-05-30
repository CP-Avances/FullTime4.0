"use strict";
/** ********************************************************************************* **
 ** **                     IMPORTAR SCRIPT DE ARCHIVOS DE PDF                      ** **
 ** ********************************************************************************* **/
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImportarPDF = void 0;
const ImportarPDF = function () {
    return __awaiter(this, void 0, void 0, function* () {
        const pdfMake = require("pdfmake/build/pdfmake");
        const pdfFonts = require("pdfmake/build/vfs_fonts");
        // pdfMake.vfs = pdfFonts.pdfMake.vfs; // PARA PRODUCCION
        pdfMake.vfs = pdfFonts.vfs; // PARA DESARROLLO
        return pdfMake;
    });
};
exports.ImportarPDF = ImportarPDF;
