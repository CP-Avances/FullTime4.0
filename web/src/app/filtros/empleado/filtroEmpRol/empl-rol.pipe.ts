import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'emplRol'
})
export class EmplRolPipe implements PipeTransform {

  transform(value: any, arg: any): any {
    if (arg === undefined || arg === null || arg.length < 2) return value;

    const RESULTADO_BUSQUEDAS: any = [];

    for (const resultados of value) {
      if (resultados.rol) {
        if (resultados.rol.toLowerCase().indexOf(arg.toLowerCase()) > -1) {
          RESULTADO_BUSQUEDAS.push(resultados);
        }
      }
    };
    return RESULTADO_BUSQUEDAS;

  }

}
