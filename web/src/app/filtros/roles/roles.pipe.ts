import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'roles'
})

export class RolesPipe implements PipeTransform {

  transform(value: any, arg: any): any {

    if (arg === undefined || arg === null || arg.length < 2) return value;

    const RESULTADO_BUSQUEDAS: any = [];

    for (const resultados of value) {

      if (resultados.nombre && resultados.nombre.toLowerCase().indexOf(arg.toLowerCase()) > -1) {
        RESULTADO_BUSQUEDAS.push(resultados);
      }
      else if (resultados.pagina && resultados.pagina.toLowerCase().indexOf(arg.toLowerCase()) > -1) {
        RESULTADO_BUSQUEDAS.push(resultados);
      }
      else if (resultados.rol && resultados.rol.toLowerCase().indexOf(arg.toLowerCase()) > -1) {
        RESULTADO_BUSQUEDAS.push(resultados);
      }
      else if (resultados.name_rol && resultados.name_rol.toLowerCase().indexOf(arg.toLowerCase()) > -1) {
        RESULTADO_BUSQUEDAS.push(resultados);
      };

    };

    return RESULTADO_BUSQUEDAS;
  }

}
