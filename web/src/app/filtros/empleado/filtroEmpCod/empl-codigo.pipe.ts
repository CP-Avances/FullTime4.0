import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'emplCodigo'
})
export class EmplCodigoPipe implements PipeTransform {

  transform(value: any, arg: any): any {

   if (arg === undefined || arg === null || arg.length < 1) return value;

    const resultadoEmpleado: any = [];

    for (const empleado of value) {
      if (empleado.codigo && empleado.codigo.toLowerCase().indexOf(arg.toLowerCase()) > -1) {
        resultadoEmpleado.push(empleado);
      };
    };
    return resultadoEmpleado;
  }

}
