import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class EmpresaService {

  constructor(
    private http: HttpClient,
  ) { }

  // CONSULTAR DATOS DE EMPRESA PARA RECUPERAR CUENTA
  ConsultarEmpresaCadena() {
    return this.http.get(`${(localStorage.getItem('empresaURL') as string)}/empresas/navegar`);
  }

  // CONSULTAR DATOS DE EMPRESA             **USADO
  ConsultarDatosEmpresa(id: number) {
    return this.http.get(`${(localStorage.getItem('empresaURL') as string)}/empresas/buscar/datos/${id}`);
  }

  // METODO PARA ACTUALIZAR DATOS EMPRESA **USADO
  ActualizarEmpresa(datos: any) {
    return this.http.put(`${(localStorage.getItem('empresaURL') as string)}/empresas`, datos);
  }

  // METODO PARA ACTUALIZAR COLORES DE REPORTES **USADO
  ActualizarColores(formData: any) {
    return this.http.put<any>(`${(localStorage.getItem('empresaURL') as string)}/empresas/colores`, formData);
  }

  // METODO PARA ACTUALIZAR MARCA DE AGUA **USADO
  ActualizarMarcaAgua(formData: any) {
    return this.http.put<any>(`${(localStorage.getItem('empresaURL') as string)}/empresas/reporte/marca`, formData);
  }

  // METODO PARA ACTUALIZAR NIVEL DE SEGURIDAD **USADO
  ActualizarSeguridad(formData: any) {
    return this.http.put<any>(`${(localStorage.getItem('empresaURL') as string)}/empresas/doble/seguridad`, formData);
  }


  /**
   * METODO PARA LLAMAR AL LOGOTIPO, ESTE LLEGA CODIFICADO EN BASE64
   * @param id_empresa ID DE LA EMPRESA
   */

  // METODO PARA OBTENER LOGO DE EMPRESA              **USADO
  LogoEmpresaImagenBase64(id_empresa: string) {
    return this.http.get<any>(`${(localStorage.getItem('empresaURL') as string)}/empresas/logo/codificado/${parseInt(id_empresa)}`)
  }

  // METODO PARA EDITAR LOGO DE EMPRESA **USADO
  EditarLogoEmpresa(id_empresa: number, formData: any) {
    return this.http.put<any>(`${(localStorage.getItem('empresaURL') as string)}/empresas/logo/${id_empresa}/uploadImage`, formData);
  }

  // METODO PARA BUSCAR IMAGEN DE CABECERA DE CORREO **USADO
  EditarCabeceraCorreo(id_empresa: number, formData: any) {
    return this.http.put<any>(`${(localStorage.getItem('empresaURL') as string)}/empresas/cabecera/${id_empresa}/uploadImage`, formData);
  }

  // METODO PARA BUSCAR LOGO CABECERA DE CORREO  **USADO
  ObtenerCabeceraCorreo(id_empresa: string) {
    return this.http.get<any>(`${(localStorage.getItem('empresaURL') as string)}/empresas/cabecera/codificado/${parseInt(id_empresa)}`)
  }

  // ACTUALIZAR LOGO DE PIE DE FIRMA DE CORREO  **USADO
  EditarPieCorreo(id_empresa: number, formData: any) {
    return this.http.put<any>(`${(localStorage.getItem('empresaURL') as string)}/empresas/pie-firma/${id_empresa}/uploadImage`, formData);
  }

  // METODO PARA BUSCAR LOGO PIE DE FIRMA DE CORREO  **USADO
  ObtenerPieCorreo(id_empresa: string) {
    return this.http.get<any>(`${(localStorage.getItem('empresaURL') as string)}/empresas/pie-firma/codificado/${parseInt(id_empresa)}`)
  }

  // METODO PARA EDITAR DATOS DE CORREO  **USADO
  EditarCredenciales(id_empresa: number, data: any) {
    return this.http.put<any>(`${(localStorage.getItem('empresaURL') as string)}/empresas/credenciales/${id_empresa}`, data);
  }

  //Empresas
  ConsultarEmpresas() {
    return this.http.get(`${(localStorage.getItem('empresaURL') as string)}/empresas`);
  }

}
