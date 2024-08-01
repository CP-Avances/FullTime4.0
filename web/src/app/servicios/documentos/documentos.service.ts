import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment'

@Injectable({
  providedIn: 'root'
})

export class DocumentosService {

  constructor(
    private http: HttpClient,
  ) { }

  /** ************************************************************************************* **
   ** **                       MANEJO DE ARCHIVOS DESDE EL SERVIDOR                      ** **
   ** ************************************************************************************* **/

  // METODO PARA LISTAR CARPETAS EXISTENTES EN EL SERVIDOR    **USADO
  ListarCarpeta() {
    return this.http.get<any>(`${environment.url}/archivosCargados/carpetas`)
  }

  // METODO PARA LISTAR LOS ARCHIVOS DE CADA CARPETA    **USADO
  ListarArchivosDeCarpeta(nom_carpeta: string) {
    return this.http.get<any>(`${environment.url}/archivosCargados/lista-carpetas/${nom_carpeta}`)
  }

  // METODO PARA LISTAR LOS ARCHIVOS DE CONTRATOS   **USADO
  ListarContratos(nom_carpeta: string) {
    return this.http.get<any>(`${environment.url}/archivosCargados/lista-contratos/${nom_carpeta}`)
  }

  // METODO PARA LISTAR LOS ARCHIVOS DE PERMISOS    **USADO
  ListarPermisos(nom_carpeta: string) {
    return this.http.get<any>(`${environment.url}/archivosCargados/lista-permisos/${nom_carpeta}`)
  }

  // METODO PARA LISTAR LOS ARCHIVOS INDIVIDUALES     **USADO
  ListarArchivosIndividuales(nom_carpeta: string, tipo: string) {
    return this.http.get<any>(`${environment.url}/archivosCargados/lista-archivos-individuales/${nom_carpeta}/tipo/${tipo}`)
  }

  // METODO PARA LISTAR LOS ARCHIVOS DE HORARIOS     **USADO
  ListarHorarios(nom_carpeta: string) {
    return this.http.get<any>(`${environment.url}/archivosCargados/lista-horarios/${nom_carpeta}`)
  }

  // METODO PARA DESCARGAR LOS ARCHIVOS     **USADO
  DownloadFile(nom_carpeta: string, filename: string) {
    return this.http.get<any>(`${environment.url}/archivosCargados/download/files/${nom_carpeta}/${filename}`)
  }

  // METODO PARA DESCARGAR LOS ARCHIVOS               **USADO
  DescargarIndividuales(nom_carpeta: string, filename: string, tipo: string) {
    return this.http.get<any>(`${environment.url}/archivosCargados/download/files/${nom_carpeta}/${filename}/tipo/${tipo}`)
  }

  /** ********************************************************************************************* **
   ** **                        MANEJO DE ARCHIVOS DOCUMENTACION                                 ** **
   ** ********************************************************************************************* **/

  // REGISTRAR DOCUMENTO    **USADO
  CrearArchivo(data: any, doc_nombre: string) {
    return this.http.post(`${environment.url}/archivosCargados/registrar/${doc_nombre}`, data);
  }

  // ELIMINAR REGISTRO DE DOCUMENTACION    **USADO
  EliminarRegistro(id: number, documento: string, datos: any) {
    const url = `${environment.url}/archivosCargados/eliminar/${id}/${documento}`;
    const httpOtions = {
      body: datos
    };
    return this.http.request('delete', url, httpOtions);
  }

  // METODO PARA LISTAR LOS ARCHIVOS DE CADA CARPETA  **USADO
  ListarDocumentacion(nom_carpeta: string) {
    return this.http.get<any>(`${environment.url}/archivosCargados/documentacion/${nom_carpeta}`)
  }


}
