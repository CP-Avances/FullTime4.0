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

  // METODO PARA LISTAR CARPETAS EXISTENTES EN EL SERVIDOR
  ListarCarpeta() {
    return this.http.get<any>(`${environment.url}/archivosCargados/carpetas`)
  }

  // METODO PARA LISTAR LOS ARCHIVOS DE CADA CARPETA
  ListarArchivosDeCarpeta(nom_carpeta: string) {
    return this.http.get<any>(`${environment.url}/archivosCargados/lista-carpetas/${nom_carpeta}`)
  }

  // METODO PARA LISTAR LOS ARCHIVOS DE CONTRATOS
  ListarContratos(nom_carpeta: string) {
    return this.http.get<any>(`${environment.url}/archivosCargados/lista-contratos/${nom_carpeta}`)
  }

  // METODO PARA LISTAR LOS ARCHIVOS DE PERMISOS
  ListarPermisos(nom_carpeta: string) {
    return this.http.get<any>(`${environment.url}/archivosCargados/lista-permisos/${nom_carpeta}`)
  }

  // METODO PARA LISTAR LOS ARCHIVOS DE PERMISOS
  ListarArchivosIndividuales(nom_carpeta: string, tipo: string) {
    return this.http.get<any>(`${environment.url}/archivosCargados/lista-archivos-individuales/${nom_carpeta}/tipo/${tipo}`)
  }

  // METODO PARA LISTAR LOS ARCHIVOS DE HORARIOS
  ListarHorarios(nom_carpeta: string) {
    return this.http.get<any>(`${environment.url}/archivosCargados/lista-horarios/${nom_carpeta}`)
  }

  // METODO PARA DESCARGAR LOS ARCHIVOS
  DownloadFile(nom_carpeta: string, filename: string) {
    return this.http.get<any>(`${environment.url}/archivosCargados/download/files/${nom_carpeta}/${filename}`)
  }

  // METODO PARA DESCARGAR LOS ARCHIVOS
  DescargarIndividuales(nom_carpeta: string, filename: string, tipo: string) {
    return this.http.get<any>(`${environment.url}/archivosCargados/download/files/${nom_carpeta}/${filename}/tipo/${tipo}`)
  }

  /** ********************************************************************************************* **
   ** **                        MANEJO DE ARCHIVOS DOCUMENTACION                                 ** **        
   ** ********************************************************************************************* **/

  // REGISTRAR DOCUMENTO
  CrearArchivo(data: any, doc_nombre: string) {
    return this.http.post(`${environment.url}/archivosCargados/registrar/${doc_nombre}`, data);
  }

  // ELIMINAR REGISTRO DE DOCUMENTACION
  EliminarRegistro(id: number, documento: string) {
    return this.http.delete(`${environment.url}/archivosCargados/eliminar/${id}/${documento}`);
  }

  // METODO PARA LISTAR LOS ARCHIVOS DE CADA CARPETA   --**VERIFICADO
  ListarDocumentacion(nom_carpeta: string) {
    return this.http.get<any>(`${environment.url}/archivosCargados/documentacion/${nom_carpeta}`)
  }


}
