import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment'

@Injectable({
  providedIn: 'root'
})
export class BirthdayService {

  constructor(
    private http: HttpClient,
  ) { }

  // METODO PARA VER MENSAJE DE CUMPLEAÑOS
  VerMensajeCumpleanios(id_empresa: number) {
    return this.http.get(`${environment.url}/birthday/${id_empresa}`);
  }

  // METODO PARA REGISTRAR MENSAJE
  CrearMensajeCumpleanios(data: any) {
    return this.http.post(`${environment.url}/birthday`, data);
  }

  // METODO PARA CARGAR IMAGEN DE CUMPLEAÑOS
  SubirImagenBirthday(formData: any, id_empresa: number) {
    return this.http.put(`${environment.url}/birthday/${id_empresa}/uploadImage`, formData)
  }

  // METODO PARA ACTUALIZAR MENSAJE DE CUMPLEAÑOS
  EditarMensajeCumpleanios(id_birthday: number, data: any) {
    return this.http.put(`${environment.url}/birthday/editar/${id_birthday}`, data)
  }

}
