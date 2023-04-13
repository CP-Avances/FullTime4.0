import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'avisoDesc'
})
export class AvisoDescPipe implements PipeTransform {

  transform(value: any, arg: any): any {

    if(arg === undefined || arg === null || arg.length < 2 ) return value;
    
    const resultadoAvisos : any = [];

    for(const avisos of value){
      if(avisos.descripcion && avisos.descripcion.toLowerCase().indexOf(arg.toLowerCase()) > -1){
        resultadoAvisos.push(avisos);
      };
    };
    return resultadoAvisos;
  }

}
