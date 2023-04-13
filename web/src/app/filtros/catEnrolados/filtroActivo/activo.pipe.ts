import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'activo'
})
export class ActivoPipe implements PipeTransform {

  transform(value: any, arg: boolean): any {

    if(arg === null || arg === undefined ) return value;

    const resultadoEnrolado: any = [];

    for(const enrolado of value){
      if(enrolado.activo == arg){
        resultadoEnrolado.push(enrolado);
      };
    };
    return resultadoEnrolado;
  }

}
