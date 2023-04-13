import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'provincia'
})
export class ProvinciaPipe implements PipeTransform {

  transform(value: any, filtroProvincia: any): any {
    if (filtroProvincia === '' || filtroProvincia.length < 2) return value;
    const RESULTADO_PROVINCIAS: any = [];
    for (const provincias of value) {
      if (provincias.nombre && provincias.nombre.toLowerCase().indexOf(filtroProvincia.toLowerCase()) > -1) {
        RESULTADO_PROVINCIAS.push(provincias);
      }
    };
    return RESULTADO_PROVINCIAS;
  }
  
}
