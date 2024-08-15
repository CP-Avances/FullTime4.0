import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PerfilEmpleadoService {

  private urlImagenSubject = new BehaviorSubject<string>('');
  urlImagen$ = this.urlImagenSubject.asObservable();

  constructor() { }

  SetImagen(url: string) {
    this.urlImagenSubject.next(url);
    console.log(url);
  }

  GetImagen() {
    return this.urlImagenSubject.getValue();
  }

}
