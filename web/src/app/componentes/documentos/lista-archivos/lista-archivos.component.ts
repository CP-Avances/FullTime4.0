import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { MatDialog } from '@angular/material/dialog';

import { SubirDocumentoComponent } from '../subir-documento/subir-documento.component';

import { DocumentosService } from 'src/app/servicios/documentos/documentos.service';

@Component({
  selector: 'app-lista-archivos',
  templateUrl: './lista-archivos.component.html',
  styleUrls: ['./lista-archivos.component.css']
})

export class ListaArchivosComponent implements OnInit {

  hipervinculo: string = environment.url;
  archivos: any = [];
  Dirname: string;
  subir: boolean = false;

  constructor(
    private rest: DocumentosService,
    private route: ActivatedRoute,
    public ventana: MatDialog,
  ) { }

  ngOnInit(): void {
    this.MostrarArchivos();
  }

  // METODO PARA MOSTRAR ARCHIVOS DE CARPETAS
  MostrarArchivos() {
    this.route.params.subscribe((obj: any) => {
      this.Dirname = obj.filename
      this.ObtenerArchivos(obj.filename)
    })

    if (this.Dirname === 'documentacion') {
      this.subir = true;
    } else {
      this.subir = false;
    }
  }

  // METODO PARA BUSCAR ARCHIVOS DE CARPETAS
  ObtenerArchivos(nombre_carpeta: string) {
    this.archivos = [];
    if (this.Dirname === 'documentacion') {
      this.rest.ListarDocumentacion(nombre_carpeta).subscribe(res => {
        this.archivos = res
      })
    }
    else if (this.Dirname === 'contratos') {
      this.rest.ListarContratos(nombre_carpeta).subscribe(res => {
        this.archivos = res
      })
    }
    else if (this.Dirname === 'permisos') {
      this.rest.ListarPermisos(nombre_carpeta).subscribe(res => {
        this.archivos = res
      })
    }
    else if (this.Dirname === 'horarios') {
      this.rest.ListarHorarios(nombre_carpeta).subscribe(res => {
        this.archivos = res
      })
    }
    else {
      this.rest.ListarArchivosDeCarpeta(nombre_carpeta).subscribe(res => {
        this.archivos = res
      })
    }
  }

  // METODO PARA DESCARGAR ARCHIVOS
  DescargarArchivo(filename: string) {
    this.rest.DownloadFile(this.Dirname, filename).subscribe(res => {
    })
  }

  // METODO PARA ELIMINAR ARCHIVOS
  EliminarArchivo(filename: string, id: number) {
    this.rest.EliminarRegistro(id, filename).subscribe(res => {
      this.MostrarArchivos();
    })

  }

  // METODO PARA REGISTRAR ARCHIVOS
  AbrirVentanaRegistrar(): void {
    this.ventana.open(SubirDocumentoComponent, { width: '400px' })
      .afterClosed().subscribe(item => {
        this.MostrarArchivos();
        this.rest.ListarDocumentacion('documentacion').subscribe(res => {
          this.archivos = res
        })
      });
  }

}
