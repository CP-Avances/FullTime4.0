import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'paginate'
})
export class PaginatePipe implements PipeTransform {

  transform(array: any[], tamanio_pagina: number | string, numero_pagina: number): any[] {
    if(!array.length) return [];
    if(tamanio_pagina === 'all') {
      return array;
    }

    tamanio_pagina = tamanio_pagina || 5;
    numero_pagina = numero_pagina || 1;
    --numero_pagina;
    // @ts-ignore
    return array.slice(numero_pagina * tamanio_pagina, (numero_pagina + 1) * tamanio_pagina);
  }

}
