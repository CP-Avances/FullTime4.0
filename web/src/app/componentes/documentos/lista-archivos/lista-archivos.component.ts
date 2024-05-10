import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { MatDialog } from '@angular/material/dialog';
import { FormGroup, FormControl, Validators } from '@angular/forms';

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
  listad: boolean = true;
  listap: boolean = false;

  filtroDescripcion = '';

  // VARIABLES PARA AUDITORIA
  user_name: string | null;
  ip: string | null;

  // CONTROL DE CAMPOS Y VALIDACIONES DEL FORMULARIO
  nombreF = new FormControl('', [Validators.minLength(2)]);

  // ASIGNACION DE VALIDACIONES A INPUTS DEL FORMULARIO
  public BuscarTipoPermisoForm = new FormGroup({
    nombreForm: this.nombreF,
  });


  archivosFiltro: any;
  constructor(
    private rest: DocumentosService,
    private route: ActivatedRoute,
    public ventana: MatDialog,
  ) { }

  ngOnInit(): void {
    this.user_name = localStorage.getItem('usuario');
    this.ip = localStorage.getItem('ip');

    this.MostrarArchivos();
  }

  // METODO PARA MOSTRAR ARCHIVOS DE CARPETAS
  MostrarArchivos() {
    this.route.params.subscribe((obj: any) => {
      this.Dirname = obj.filename
      console.log('ver carpetas ', obj.filename)
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
        this.archivosFiltro = [...this.archivos];
        console.log('archivosFiltro: ',this.archivosFiltro);
      })
    }
    else if (this.Dirname === 'contratos') {
      this.rest.ListarContratos(nombre_carpeta).subscribe(res => {
        this.archivos = res;
        this.archivosFiltro = [...this.archivos];
        console.log('archivosFiltro: ',this.archivosFiltro);
        console.log('contratos ', res)
      })
    }
    else if (this.Dirname === 'permisos') {
      this.rest.ListarPermisos(nombre_carpeta).subscribe(res => {
        this.archivos = res
        this.archivosFiltro = [...this.archivos];
        console.log('archivosFiltro: ',this.archivosFiltro);
        //console.log('permisos ', res)
      })
    }
    else if (this.Dirname === 'horarios') {
      this.rest.ListarHorarios(nombre_carpeta).subscribe(res => {
        this.archivos = res
        this.archivosFiltro = [...this.archivos];
        console.log('archivosFiltro: ',this.archivosFiltro);
      })
    }
    else {
      this.rest.ListarArchivosDeCarpeta(nombre_carpeta).subscribe(res => {
        this.archivos = res
        this.archivosFiltro = [...this.archivos];
        console.log('archivosFiltro: ',this.archivosFiltro);
      })
    }
  }

  // METODO PARA DESCARGAR ARCHIVOS
  DescargarArchivo(filename: string) {
    this.rest.DownloadFile(this.Dirname, filename).subscribe(res => {
    })
  }

  // METODO PARA DESCARGAR ARCHIVOS
  DescargarArchivoIndividual(filename: string, tipo: any) {
    this.rest.DescargarIndividuales(this.Dirname, filename, tipo).subscribe(res => {
    })
  }

  // METODO PARA ELIMINAR ARCHIVOS
  EliminarArchivo(filename: string, id: number) {
    const datos = {
      user_name: this.user_name,
      ip: this.ip
    };

    this.rest.EliminarRegistro(id, filename, datos).subscribe(res => {
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
          this.archivosFiltro = [...this.archivos];
          console.log('archivosFiltro: ',this.archivosFiltro);
        })
      });
  }

  // METODO PARA VER LISTA DE ARCHIVOS DE PERMISOS
  archivoi: any = '';
  VerPermisos(nombre_carpeta: any, tipo: string) {
    this.listad = false;
    this.listap = true;
    this.archivoi = nombre_carpeta;
    this.rest.ListarArchivosIndividuales(nombre_carpeta, tipo).subscribe(res => {
      this.archivos = res
      this.archivosFiltro = [...this.archivos];
      console.log('archivosFiltro: ',this.archivosFiltro);
    })
  }

  VerListaIndividuales() {
    this.listap = false;
    this.listad = true;
    this.ObtenerArchivos(this.Dirname);
  }


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
