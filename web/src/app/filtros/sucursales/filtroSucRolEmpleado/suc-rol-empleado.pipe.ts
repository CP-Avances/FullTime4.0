import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'sucRolEmpleado'
})
export class SucRolEmpleadoPipe implements PipeTransform {

  transform(value: any, arg: any) {
    if (arg === '' || arg.length < 2) return value;
    const RESULTADO_BUSQUEDAS: any[] = [];
    for (const resultados of value) {
      if (resultados.rol && resultados.rol.toLowerCase().indexOf(arg.toLowerCase()) > -1) {
        RESULTADO_BUSQUEDAS.push(resultados);
      }
    };
    return RESULTADO_BUSQUEDAS;
  }

}
