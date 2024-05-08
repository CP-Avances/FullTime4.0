import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';

import { ToastrService } from 'ngx-toastr';

import { FormGroup, FormControl, Validators } from '@angular/forms';

import { SubirDocumentoComponent } from '../subir-documento/subir-documento.component';
import { MetodosComponent } from 'src/app/componentes/administracionGeneral/metodoEliminar/metodos.component';

import { DocumentosService } from 'src/app/servicios/documentos/documentos.service';


import { SelectionModel } from '@angular/cdk/collections';
import { ITableArchivos } from 'src/app/model/reportes.model';

@Component({
  selector: 'app-lista-archivos',
  templateUrl: './lista-archivos.component.html',
  styleUrls: ['./lista-archivos.component.css']
})

export class ListaArchivosComponent implements OnInit {


  archivosEliminar: any = [];

  hipervinculo: string = environment.url;
  archivos: any = [];
  Dirname: string;
  subir: boolean = false;
  listad: boolean = true;
  listap: boolean = false;

  filtroDescripcion = '';

  // CONTROL DE CAMPOS Y VALIDACIONES DEL FORMULARIO
  nombreF = new FormControl('', [Validators.minLength(2)]);

  // ASIGNACION DE VALIDACIONES A INPUTS DEL FORMULARIO
  public BuscarTipoPermisoForm = new FormGroup({
    nombreForm: this.nombreF,
  });


  archivosFiltro: any;
  constructor(
    private toastr: ToastrService,
    private router: Router,

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
        console.log('archivosFiltro: ', this.archivosFiltro);
      })
    }
    else if (this.Dirname === 'contratos') {
      this.rest.ListarContratos(nombre_carpeta).subscribe(res => {
        this.archivos = res;
        this.archivosFiltro = [...this.archivos];
        console.log('archivosFiltro: ', this.archivosFiltro);
        console.log('contratos ', res)
      })
    }
    else if (this.Dirname === 'permisos') {
      this.rest.ListarPermisos(nombre_carpeta).subscribe(res => {
        this.archivos = res
        this.archivosFiltro = [...this.archivos];
        console.log('archivosFiltro: ', this.archivosFiltro);
        //console.log('permisos ', res)
      })
    }
    else if (this.Dirname === 'horarios') {
      this.rest.ListarHorarios(nombre_carpeta).subscribe(res => {
        this.archivos = res
        this.archivosFiltro = [...this.archivos];
        console.log('archivosFiltro: ', this.archivosFiltro);
      })
    }
    else {
      this.rest.ListarArchivosDeCarpeta(nombre_carpeta).subscribe(res => {
        this.archivos = res
        this.archivosFiltro = [...this.archivos];
        console.log('archivosFiltro: ', this.archivosFiltro);
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

  // METODO PARA REGISTRAR ARCHIVOS
  AbrirVentanaRegistrar(): void {
    this.ventana.open(SubirDocumentoComponent, { width: '400px' })
      .afterClosed().subscribe(item => {
        this.MostrarArchivos();
        this.rest.ListarDocumentacion('documentacion').subscribe(res => {
          this.archivos = res
          this.archivosFiltro = [...this.archivos];
          console.log('archivosFiltro: ', this.archivosFiltro);
        })
      });
    this.MostrarArchivos();
    this.activar_seleccion = true;
    this.plan_multiple = false;
    this.plan_multiple_ = false;
    this.selectionArchivos.clear();
    this.archivosEliminar = [];


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
      console.log('archivosFiltro: ', this.archivosFiltro);
    })
  }

  VerListaIndividuales() {
    this.listap = false;
    this.listad = true;
    this.ObtenerArchivos(this.Dirname);
  }


  Filtrar(e: any, tipo: string) {
    console.log('e: ', e.target.value);
    const query: string = e.target.value;
    const filtro = this.archivos.filter((o: any) => {
      console.log('o: ', o);
      if (tipo == 'carpeta') {
        return (o.indexOf(query) > -1);
      } else {
        return (o.nombre.indexOf(query) > -1);
      }

    })
    this.archivosFiltro = filtro;
  }



  // METODOS PARA LA SELECCION MULTIPLE

  plan_multiple: boolean = false;
  plan_multiple_: boolean = false;

  HabilitarSeleccion() {
    this.plan_multiple = true;
    this.plan_multiple_ = true;
    this.auto_individual = false;
    this.activar_seleccion = false;
  }

  auto_individual: boolean = true;
  activar_seleccion: boolean = true;
  seleccion_vacia: boolean = true;

  selectionArchivos = new SelectionModel<ITableArchivos>(true, []);



  // SI EL NUMERO DE ELEMENTOS SELECCIONADOS COINCIDE CON EL NUMERO TOTAL DE FILAS.
  isAllSelectedPag() {
    const numSelected = this.selectionArchivos.selected.length;
    return numSelected === this.archivosFiltro.length
  }


  // SELECCIONA TODAS LAS FILAS SI NO ESTAN TODAS SELECCIONADAS; DE LO CONTRARIO, SELECCION CLARA.
  masterTogglePag() {
    this.isAllSelectedPag() ?
      this.selectionArchivos.clear() :
      this.archivosFiltro.forEach((row: any) => this.selectionArchivos.select(row));
  }


  // LA ETIQUETA DE LA CASILLA DE VERIFICACION EN LA FILA PASADA
  checkboxLabelPag(row?: ITableArchivos): string {
    if (!row) {
      return `${this.isAllSelectedPag() ? 'select' : 'deselect'} all`;
    }
    this.archivosEliminar = this.selectionArchivos.selected;
    //console.log('paginas para Eliminar',this.paginasEliminar);

    //console.log(this.selectionPaginas.selected)
    return `${this.selectionArchivos.isSelected(row) ? 'deselect' : 'select'} row ${row.nombre + 1}`;

  }



  // METODO PARA ELIMINAR ARCHIVOS
  EliminarArchivo(filename: string, id: number) {
    this.rest.EliminarRegistro(id, filename).subscribe(res => {


      if (res.message === 'error') {
        this.toastr.error('No se puede eliminar.', '', {
          timeOut: 6000,
        });
      } else {
        this.toastr.error('Registro eliminado.', '', {
          timeOut: 6000,
        });


        this.MostrarArchivos();

      }
    })

  }



  // FUNCION PARA CONFIRMAR SI SE ELIMINA O NO UN REGISTRO
  ConfirmarDelete(datos: any) {
    this.ventana.open(MetodosComponent, { width: '450px' }).afterClosed()
      .subscribe((confirmado: Boolean) => {
        if (confirmado) {
          this.EliminarArchivo(datos.filename, datos.id);
          this.activar_seleccion = true;

          this.plan_multiple = false;
          this.plan_multiple_ = false;
          this.archivosEliminar = [];
          this.selectionArchivos.clear();


          this.MostrarArchivos();

        } else {
          this.router.navigate(['/archivos/documentacion']);
        }
      });


  }



  contador: number = 0;
  ingresar: boolean = false;
  EliminarMultiple() {

    this.ingresar = false;
    this.contador = 0;

    this.archivosEliminar = this.selectionArchivos.selected;
    this.archivosEliminar.forEach((datos: any) => {

      this.archivosFiltro = this.archivosFiltro.filter(item => item.id !== datos.id);

      this.contador = this.contador + 1;

      this.rest.EliminarRegistro(datos.id, datos.filename).subscribe(res => {


        if (res.message === 'error') {
          this.toastr.error('No se puede eliminar.', '', {
            timeOut: 6000,
          });

          this.contador = this.contador - 1;

        } else {

          if (!this.ingresar) {
            this.toastr.error('Se ha eliminado ' + this.contador + ' registros.', '', {
              timeOut: 6000,
            });
            this.ingresar = true;
          }
          this.MostrarArchivos();

        }
      })
    }
    )
  }


  ConfirmarDeleteMultiple() {
    this.ventana.open(MetodosComponent, { width: '450px' }).afterClosed()
      .subscribe((confirmado: Boolean) => {
        if (confirmado) {

          if (this.archivosEliminar.length != 0) {
            this.EliminarMultiple();
            this.activar_seleccion = true;
            this.plan_multiple = false;
            this.plan_multiple_ = false;
            this.archivosEliminar = [];
            this.selectionArchivos.clear();

            this.MostrarArchivos();

          } else {
            this.toastr.warning('No ha seleccionado ARCHIVOS.', 'Ups!!! algo salio mal.', {
              timeOut: 6000,
            })

          }

          this.selectionArchivos.clear();

        } else {
          this.router.navigate(['/archivos/documentacion']);
        }


      });


  }


}
