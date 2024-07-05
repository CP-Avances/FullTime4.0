import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'sucNomEmpleado'
})
export class SucNomEmpleadoPipe implements PipeTransform {

  transform(value: any[], arg: any): any[] {
    if (arg === undefined || arg === null || arg.length < 2) return value;
    const RESULTADO_BUSQUEDAS: any[] = [];
    for (const resultados of value) {
      let nombreCompleto = resultados.apellido + ' ' + resultados.nombre;
      if (nombreCompleto && nombreCompleto.toLowerCase().indexOf(arg.toLowerCase()) > -1) {
        RESULTADO_BUSQUEDAS.push(resultados);
      }
    };
    return RESULTADO_BUSQUEDAS;
  }

}
