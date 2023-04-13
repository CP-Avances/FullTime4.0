import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'nivel'
})
export class NivelPipe implements PipeTransform {

  transform(value: any, arg: number): any {

    if(arg === null || arg === undefined) return value;

    const resultadoProceso: any = [];

    for(const proceso of value){
      if(proceso.nivel == arg){
        resultadoProceso.push(proceso);
      };
    };
    return resultadoProceso;
  }

}
