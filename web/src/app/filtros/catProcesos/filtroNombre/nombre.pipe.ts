import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'nombre'
})
export class NombrePipe implements PipeTransform {

  transform(value: any, arg: any): any {

    if(arg === '' || arg === null || arg.length < 2 ) return value;

    const resultadoProceso: any = [];

    for(const proceso of value){
      if(proceso.nombre.toLowerCase().indexOf(arg.toLowerCase()) > -1){
        resultadoProceso.push(proceso);
      };
    };
    return resultadoProceso;
  }

}
