import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'sucNombre'
})

export class SucNombrePipe implements PipeTransform {

  transform(value: any, arg: any): any {

    if (arg === undefined || arg === null || arg.length < 2) return value;

    const RESULTADO_BUSQUEDAS: any = [];

    for (const resultados of value) {

      if (resultados.nombre) {
        if (resultados.nombre.toLowerCase().indexOf(arg.toLowerCase()) > -1) {
          RESULTADO_BUSQUEDAS.push(resultados);
        }
      }

      if (resultados.sucursal) {
        if (resultados.sucursal.toLowerCase().indexOf(arg.toLowerCase()) > -1) {
          RESULTADO_BUSQUEDAS.push(resultados);
        }
      }

      if (resultados.establecimiento) {
        if (resultados.establecimiento.toLowerCase().indexOf(arg.toLowerCase()) > -1) {
          RESULTADO_BUSQUEDAS.push(resultados);
        }
      }

      if (resultados.nomsucursal && resultados.nomsucursal.toLowerCase().indexOf(arg.toLowerCase()) > -1) {
        RESULTADO_BUSQUEDAS.push(resultados);
      }

    };
    
    return RESULTADO_BUSQUEDAS;
  }

}
