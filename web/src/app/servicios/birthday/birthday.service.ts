import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class BirthdayService {

  constructor(
    private http: HttpClient,
  ) { }

  // METODO PARA VER MENSAJE DE CUMPLEAÑOS    **USADO
  VerMensajeCumpleanios(id_empresa: number) {
    return this.http.get(`${(localStorage.getItem('empresaURL') as string)}/birthday/${id_empresa}`);
  }

  // METODO PARA REGISTRAR MENSAJE     **USADO
  CrearMensajeCumpleanios(data: any) {
    return this.http.post(`${(localStorage.getItem('empresaURL') as string)}/birthday`, data);
  }

  // METODO PARA CARGAR IMAGEN DE CUMPLEAÑOS   **USADO
  SubirImagenBirthday(formData: any, id_empresa: number) {
    return this.http.put(`${(localStorage.getItem('empresaURL') as string)}/birthday/${id_empresa}/uploadImage`, formData)
  }

  // METODO PARA ACTUALIZAR MENSAJE DE CUMPLEAÑOS    **USADO
  EditarMensajeCumpleanios(id_birthday: number, data: any) {
    return this.http.put(`${(localStorage.getItem('empresaURL') as string)}/birthday/editar/${id_birthday}`, data)
  }

}
