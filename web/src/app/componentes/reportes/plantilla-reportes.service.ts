import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PlantillaReportesService {

  constructor(
    private http: HttpClient,
  ) { }

  // METODO PARA OBTENER COLORES Y LOGOTIPO EMPRESA

  private _imagenBase64: string;
  private _nameEmpresa: string;

  // LOGO DE EMPRESA
  get logoBase64(): string { return this._imagenBase64 }
  setLogoBase64(arg: string) { this._imagenBase64 = arg }

  // NOMBRE DE EMPRESA
  get nameEmpresa(): string { return this._nameEmpresa }
  setNameEmpresa(arg: string) { this._nameEmpresa = arg }

  // VARIABLES DE ALMACENAMIENTO
  private p_color: any;
  private s_color: any;
  private marca: any;

  // COLOR PRINCIPAL
  get color_Primary(): string { return this.p_color }
  setColorPrimary(arg: string) { this.p_color = arg }

  // COLOR SECUNDARIO
  get color_Secundary(): string { return this.s_color }
  setColorSecondary(arg: string) { this.s_color = arg }

  // MARCA DE AGUA 
  get marca_Agua(): string { return this.marca }
  setMarcaAgua(arg: string) { this.marca = arg }

  // METODO DE CONSULTA DE LOGO, COLORES, MARCA DE AGUA DE EMPRESA
  ShowColoresLogo(id: string) {
    const logoBase64 = sessionStorage.getItem('logo');
    const name_empresa = localStorage.getItem('name_empresa');

    // VERIFICACION DE LOGO DE EMPRESA
    if (logoBase64 === null || name_empresa === null) {
      // QUITAR NOMBRE DE EMPRESA
      localStorage.removeItem('name_empresa');
      // BUSCAR DATOS LOGO DE EMPRESA
      this.http.get<any>(`${(localStorage.getItem('empresaURL') as string)}/empresas/logo/codificado/${id}`).subscribe(res => {
        this.setLogoBase64('data:image/jpeg;base64,' + res.imagen);
        this.setNameEmpresa(res.nom_empresa);
        sessionStorage.setItem('logo', 'data:image/jpeg;base64,' + res.imagen)
        localStorage.setItem('name_empresa', res.nom_empresa)
      }, err => {
        // QUITAR DATOS DE EMPRESA
        sessionStorage.removeItem('logo')
        localStorage.removeItem('name_empresa');
      })
    } else {
      // DEFINIR DATOS DE LOGO Y NOMBRE DE EMPRESA
      this.setLogoBase64(logoBase64);
      this.setNameEmpresa(name_empresa);
    }

    // DATOS DE COLORES DE EMPRESA
    const p = sessionStorage.getItem('p_color');
    const s = sessionStorage.getItem('s_color');

    // VERIFICAR EXISTENCIA DE DATOS
    if (p === null || s === null) {
      // BUSCAR DATOS DE COLORES
      this.http.get(`${(localStorage.getItem('empresaURL') as string)}/empresas/buscar/datos/${id}`).subscribe(res => {
        this.setColorPrimary(res[0].color_principal);
        this.setColorSecondary(res[0].color_secundario);
        sessionStorage.setItem('p_color', res[0].color_principal)
        sessionStorage.setItem('s_color', res[0].color_secundario)
      }, err => {
        // QUITAR DATOS DE COLORES
        sessionStorage.removeItem('p_color');
        sessionStorage.removeItem('s_color');
      })
    } else {
      // DEFINIR DATOS DE COLORES
      this.setColorPrimary(p);
      this.setColorSecondary(s);
    }

    // FRASE DE MARCA DE AGUA EN REPORTES
    sessionStorage.removeItem('marca');
    // BUSCAR DATOS DE MARCA DE AGUA
    this.http.get(`${(localStorage.getItem('empresaURL') as string)}/empresas/buscar/datos/${id}`).subscribe(res => {
      this.setMarcaAgua(res[0].marca_agua);
      sessionStorage.setItem('marca', res[0].marca_agua)
    }, err => {
      // QUITAR DATOS DE MARCA DE AGUA
      sessionStorage.removeItem('marca');
    })

  }

  // CABECERA USUARIO IMPRIME REPORTE
  headerText() {
    return {
      text: 'Impreso por:  ' + localStorage.getItem('fullname_print'),
      margin: 10,
      fontSize: 9,
      opacity: 0.3,
      alignment: 'right'
    }
  }

  // ENCABEZADO ORIENTACION VERTICAL REPORTES
  EncabezadoVertical(titulo: any, fec_inicio: any, fec_final: any) {
    return [
      { image: this.logoBase64, width: 100, margin: [10, -25, 0, 5] },
      { text: localStorage.getItem('name_empresa'), bold: true, fontSize: 21, alignment: 'center', margin: [0, -30, 0, 10] },
      { text: titulo, bold: true, fontSize: 12, alignment: 'center', margin: [0, 5, 0, 5] },
      { text: 'Periodo del: ' + fec_inicio + " al " + fec_final, bold: true, fontSize: 12, alignment: 'center', margin: [0, 5, 0, 5] },
    ]
  }


}
