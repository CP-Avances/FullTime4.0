import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'bPaises',
  standalone: false,
})

export class BPaisesPipe implements PipeTransform {

  transform(value: any, filtroPais: any): any {

    if (filtroPais === '' || filtroPais.length < 2) return value;

    const RESULTADO_PROVINCIAS: any = [];

    for (const provincias of value) {

      if (provincias.pais && provincias.pais.toLowerCase().indexOf(filtroPais.toLowerCase()) > -1) {
        RESULTADO_PROVINCIAS.push(provincias);
      }

    };
    
    return RESULTADO_PROVINCIAS;
  }

}
