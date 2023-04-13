import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'finger'
})
export class FingerPipe implements PipeTransform {

  transform(value: any, arg: number): any {

    if(arg === null || arg === undefined) return value;

    const resultadoEnrolado: any = [];

    for(const enrolado of value){
      if(enrolado.finger == arg){
        resultadoEnrolado.push(enrolado);
      };
    };
    return resultadoEnrolado;
  }

}
