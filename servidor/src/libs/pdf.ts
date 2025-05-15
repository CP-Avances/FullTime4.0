/** ********************************************************************************* **
 ** **                     IMPORTAR SCRIPT DE ARCHIVOS DE PDF                      ** **
 ** ********************************************************************************* **/

export const ImportarPDF = async function () {
  const pdfMake = require("pdfmake/build/pdfmake");
  const pdfFonts = require("pdfmake/build/vfs_fonts");
  // pdfMake.vfs = pdfFonts.pdfMake.vfs; // PARA PRODUCCION
  (pdfMake as any).vfs = pdfFonts.vfs; // PARA DESARROLLO
  return pdfMake;
};
