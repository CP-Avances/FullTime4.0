import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment'

@Injectable({
  providedIn: 'root'
})
export class NotiAutorizacionesService {

  constructor(
    private http: HttpClient,
  ) { }

  // Catálogo de Horarios
  getNotiAutoriRest(){
    return this.http.get<any>(`${environment.url}/noti-autorizaciones`);
  }

  getOneNotiAutorioRest(id:number){
    return this.http.get<any>(`${environment.url}/noti-autorizaciones/${id}`);
  }
  
  getListaNotiAutorioRest(id_notificacion: number){
    return this.http.get<any>(`${environment.url}/noti-autorizaciones/lista/${id_notificacion}`);
  }
  
  postNotiAutoriRest(data: any){
    return this.http.post(`${environment.url}/noti-autorizaciones`, data);
  } 
}
