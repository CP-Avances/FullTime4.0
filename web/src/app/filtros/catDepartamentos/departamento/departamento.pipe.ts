import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'departamento'
})
export class DepartamentoPipe implements PipeTransform {

  transform(value: any, arg: any): any {

    if(arg === undefined || arg === null || arg.length < 2 ) return value;

    const resultadoEmpleado: any = [];

    for(const empleado of value){
      if(empleado.departamento && empleado.departamento.toLowerCase().indexOf(arg.toLowerCase()) > -1){
        resultadoEmpleado.push(empleado);
      };
    };
    return resultadoEmpleado;
  }

}
