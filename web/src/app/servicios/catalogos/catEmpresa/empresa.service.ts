import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment'

@Injectable({
  providedIn: 'root'
})

export class EmpresaService {

  constructor(
    private http: HttpClient,
  ) { }

  // CONSULTAR DATOS DE EMPRESA PARA RECUPERAR CUENTA
  ConsultarEmpresaCadena() {
    return this.http.get(`${environment.url}/empresas/navegar`);
  }

  // CONSULTAR DATOS DE EMPRESA
  ConsultarDatosEmpresa(id: number) {
    return this.http.get(`${environment.url}/empresas/buscar/datos/${id}`);
  }

  // METODO PARA ACTUALIZAR DATOS EMPRESA
  ActualizarEmpresa(datos: any) {
    return this.http.put(`${environment.url}/empresas`, datos);
  }

  // METODO PARA ACTUALIZAR COLORES DE REPORTES
  ActualizarColores(formData: any) {
    return this.http.put<any>(`${environment.url}/empresas/colores`, formData);
  }

  // METODO PARA ACTUALIZAR MARCA DE AGUA
  ActualizarMarcaAgua(formData: any) {
    return this.http.put<any>(`${environment.url}/empresas/reporte/marca`, formData);
  }

  // METODO PARA ACTUALIZAR NIVEL DE SEGURIDAD
  ActualizarSeguridad(formData: any) {
    return this.http.put<any>(`${environment.url}/empresas/doble/seguridad`, formData);
  }


  /**
   * METODO PARA LLAMAR AL LOGOTIPO, ESTE LLEGA CODIFICADO EN BASE64
   * @param id_empresa ID DE LA EMPRESA
   */

  // METODO PARA OBTENER LOGO DE EMPRESA
  LogoEmpresaImagenBase64(id_empresa: string) {
    return this.http.get<any>(`${environment.url}/empresas/logo/codificado/${parseInt(id_empresa)}`)
  }

  // METODO PARA EDITAR LOGO DE EMPRESA
  EditarLogoEmpresa(id_empresa: number, formData: any) {
    return this.http.put<any>(`${environment.url}/empresas/logo/${id_empresa}/uploadImage`, formData);
  }

  // METODO PARA BUSCAR IMAGEN DE CABECERA DE CORREO
  EditarCabeceraCorreo(id_empresa: number, formData: any) {
    return this.http.put<any>(`${environment.url}/empresas/cabecera/${id_empresa}/uploadImage`, formData);
  }

  // METODO PARA BUSCAR LOGO CABECERA DE CORREO
  ObtenerCabeceraCorreo(id_empresa: string) {
    return this.http.get<any>(`${environment.url}/empresas/cabecera/codificado/${parseInt(id_empresa)}`)
  }

  // ACTUALIZAR LOGO DE PIE DE FIRMA DE CORREO
  EditarPieCorreo(id_empresa: number, formData: any) {
    return this.http.put<any>(`${environment.url}/empresas/pie-firma/${id_empresa}/uploadImage`, formData);
  }

  // METODO PARA BUSCAR LOGO PIE DE FIRMA DE CORREO
  ObtenerPieCorreo(id_empresa: string) {
    return this.http.get<any>(`${environment.url}/empresas/pie-firma/codificado/${parseInt(id_empresa)}`)
  }

  // METODO PARA EDITAR DATOS DE CORREO
  EditarCredenciales(id_empresa: number, data: any) {
    return this.http.put<any>(`${environment.url}/empresas/credenciales/${id_empresa}`, data);
  }

  // ACTUALIZAR EMPRESA INDIAR USO DE ACCIONES
  ActualizarAccionesTimbres(formData: any) {
    return this.http.put<any>(`${environment.url}/empresas/acciones-timbre`, formData);
  }







  

  //Empresas

  ConsultarEmpresas() {
    return this.http.get(`${environment.url}/empresas`);
  }

  IngresarEmpresas(datos: any) {
    return this.http.post(`${environment.url}/empresas`, datos);
  }



  ConsultarUnaEmpresa(nombre: string) {
    return this.http.get(`${environment.url}/empresas/buscar/${nombre}`);
  }

  CrearXML(data: any) {
    return this.http.post(`${environment.url}/empresas/xmlDownload`, data);
  }

  EliminarRegistro(id: number) {
    return this.http.delete(`${environment.url}/empresas/eliminar/${id}`);
  }




























}
