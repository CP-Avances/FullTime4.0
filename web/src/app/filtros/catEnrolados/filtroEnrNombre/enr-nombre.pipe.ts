import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'enrNombre'
})
export class EnrNombrePipe implements PipeTransform {

  transform(value: any, arg: any): any {

    if(arg === '' || arg === null || arg.length < 2 ) return value;

    const resultadoEnrolado: any = [];

    for(const enrolado of value){
      if(enrolado.nombre.toLowerCase().indexOf(arg.toLowerCase()) > -1){
        resultadoEnrolado.push(enrolado);
      };
    };
    return resultadoEnrolado;
  }

}
