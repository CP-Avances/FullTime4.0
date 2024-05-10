import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DocumentosService } from 'src/app/servicios/documentos/documentos.service';
import { environment } from '../../../../environments/environment';
import { SubirDocumentoComponent } from '../../documentos/subir-documento/subir-documento.component';
import { FormControl, FormGroup, Validators } from '@angular/forms';

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

  // VARIABLES PARA AUDITORIA
  user_name: string | null;
  ip: string | null;

  // CONTROL DE CAMPOS Y VALIDACIONES DEL FORMULARIO
  nombreF = new FormControl('', [Validators.minLength(2)]);

  // ASIGNACION DE VALIDACIONES A INPUTS DEL FORMULARIO
  public BuscarTipoPermisoForm = new FormGroup({
    nombreForm: this.nombreF,
  });

  constructor(
    private rest: DocumentosService,
    public ventana: MatDialog,
  ) { }

  ngOnInit(): void {
    this.user_name = localStorage.getItem('usuario');
    this.ip = localStorage.getItem('ip');

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
      this.archivosFiltro = [...this.archivos];
        console.log('archivosFiltro: ',this.archivosFiltro);
    })
  }

  DescargarArchivo(filename: string) {
    console.log('llego');
    this.rest.DownloadFile(this.Dirname, filename).subscribe(res => {
      console.log(res);
    })
  }

  EliminarArchivo(filename: string, id: number) {
    const datos = {
      user_name: this.user_name,
      ip: this.ip
    };

    this.rest.EliminarRegistro(id, filename, datos).subscribe(res => {
      this.MostrarArchivos();
    })
  }

  AbrirVentanaRegistrar(): void {
    this.ventana.open(SubirDocumentoComponent, { width: '400px' })
      .afterClosed().subscribe(item => {
        this.MostrarArchivos();
      });
  }
  filtroDescripcion = '';
  archivosFiltro: any;
  Filtrar(e: any, tipo: string){
    console.log('e: ',e.target.value);
    const query: string = e.target.value;
    const filtro = this.archivos.filter((o:any) => {
      console.log('o: ',o);
      if(tipo == 'carpeta'){
        return (o.indexOf(query) > -1);
      }else{
        return (o.nombre.indexOf(query) > -1);
      }

    })
    this.archivosFiltro = filtro;
  }

}
