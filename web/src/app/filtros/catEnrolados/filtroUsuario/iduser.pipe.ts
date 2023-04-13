import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'iduser'
})
export class IduserPipe implements PipeTransform {

  transform(value: any, arg: number): any {

    if(arg === null || arg === undefined) return value;

    const resultadoEnrolado: any = [];

    for(const enrolado of value){
      if(enrolado.id_usuario == arg){
        resultadoEnrolado.push(enrolado);
      };
    };
    return resultadoEnrolado;
  }

}
