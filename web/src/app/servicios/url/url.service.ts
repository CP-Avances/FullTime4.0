import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UrlService {
  private urlSocketSubject: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);

  constructor() { }

  // METODO PARA ACTUALIZAR LA URL DEL SOCKET   **USADO
  updateSocketUrl(url: string) {
    this.urlSocketSubject.next(url);
  }

  // METODO PARA OBTENER LA URL DEL SOCKET COMO UN OBSERVABLE   **USADO
  getSocketUrl(): Observable<string | null> {
    return this.urlSocketSubject.asObservable();
  }
}
