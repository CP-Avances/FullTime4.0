import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DocumentosService } from 'src/app/servicios/documentos/documentos.service';
import { environment } from '../../../../environments/environment';
import { SubirDocumentoComponent } from '../../documentos/subir-documento/subir-documento.component';

@Component({
  selector: 'app-ver-documentacion',
  templateUrl: './ver-documentacion.component.html',
  styleUrls: ['./ver-documentacion.component.css']
})
export class VerDocumentacionComponent implements OnInit {

  archivos: any = [];
  Dirname: string;
  hipervinculo: string = environment.url
  subir: boolean = false;

  constructor(
    private rest: DocumentosService,
    public ventana: MatDialog,
  ) { }

  ngOnInit(): void {
    this.MostrarArchivos();
  }

  MostrarArchivos() {
    this.Dirname = 'documentacion'
    this.ObtenerArchivos(this.Dirname);
    this.subir = true;
  }

  ObtenerArchivos(nombre_carpeta: string) {
    this.rest.ListarDocumentacion(nombre_carpeta).subscribe(res => {
      console.log(res);
      this.archivos = res
    })
  }

  DescargarArchivo(filename: string) {
    console.log('llego');
    this.rest.DownloadFile(this.Dirname, filename).subscribe(res => {
      console.log(res);
    })
  }

  EliminarArchivo(filename: string, id: number) {
    console.log('llego');
    this.rest.EliminarRegistro(id, filename).subscribe(res => {
      console.log(res);
      this.MostrarArchivos();
    })
  }

  AbrirVentanaRegistrar(): void {
    this.ventana.open(SubirDocumentoComponent, { width: '400px' })
      .afterClosed().subscribe(item => {
        this.MostrarArchivos();
      });
  }

}
