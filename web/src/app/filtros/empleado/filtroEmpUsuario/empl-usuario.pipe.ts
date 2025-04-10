import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'emplUsuario',
  standalone: false,
})

export class EmplUsuarioPipe implements PipeTransform {

  listaUsuarios: any = [];

  transform(value: any, arg: any): any []{
    
    if(arg === '' || arg === undefined || arg === null || arg.length < 2 ) return value;

    const RESULTADO_BUSQUEDAS: any = [];
    
    for (const resultados of value) {

      if (resultados.fullname.toLowerCase().indexOf(arg.toLowerCase()) > -1) {
        RESULTADO_BUSQUEDAS.push(resultados);
      }

    };

    this.listaUsuarios = [];
    
    this.listaUsuarios = RESULTADO_BUSQUEDAS;

    return RESULTADO_BUSQUEDAS;
  }


}
