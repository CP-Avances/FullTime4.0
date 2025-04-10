import { Component, Output, EventEmitter } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { ToastrService } from 'ngx-toastr';
import { MetodosComponent } from 'src/app/componentes/generales/metodoEliminar/metodos.component';
import { ValidacionesService } from 'src/app/servicios/generales/validaciones/validaciones.service';
import { CatGrupoOcupacionalService } from 'src/app/servicios/modulos/modulo-acciones-personal/catGrupoOcupacional/cat-grupo-ocupacional.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-registro-multiple-grupo',
  templateUrl: './registro-multiple-grupo.component.html',
  styleUrl: './registro-multiple-grupo.component.css'
})
export class RegistroMultipleGrupoComponent {

  @Output() cerrarComponente = new EventEmitter<boolean>();

  // VARIABLES PARA AUDITORIA
  user_name: string | null;
  ip: string | null;

  ips_locales: any = '';

  archivoForm = new FormControl('', Validators.required);
  // VARIABLE PARA TOMAR RUTA DEL SISTEMA
  hipervinculo: string = environment.url

  // VARIABLES DE MANEJO DE PLANTILLA DE DATOS
  nameFile: string;
  archivoSubido: Array<File>;
  mostrarbtnsubir: boolean = false;

  // ITEMS DE PAGINACION DE LA TABLA
  tamanio_paginaMul: number = 5;
  numero_paginaMul: number = 1;
  pageSizeOptionsMul = [5, 10, 20, 50];

  empleado: any = [];
  idEmpleado: number;

  constructor(
    public ventana: MatDialog, // VARIABLE DE MANEJO DE VENTANAS
    private toastr: ToastrService, // VARIABLE DE MENSAJES DE NOTIFICACIONES
    public validar: ValidacionesService,
    public rest: CatGrupoOcupacionalService
  ) {
    this.idEmpleado = parseInt(localStorage.getItem('empleado') as string);
  }

  ngOnInit(): void {
    this.user_name = localStorage.getItem('usuario');
    this.ip = localStorage.getItem('ip');  
    this.validar.ObtenerIPsLocales().then((ips) => {
      this.ips_locales = ips;
    }); 
  }

  // EVENTO PARA MOSTRAR FILAS DETERMINADAS EN LA TABLA
  ManejarPaginaMulti(e: PageEvent) {
    this.tamanio_paginaMul = e.pageSize;
    this.numero_paginaMul = e.pageIndex + 1
  }

  /** ************************************************************************************************************* **
** **                       TRATAMIENTO DE PLANTILLA DE CONTRATOS DE EMPLEADOS                                ** **
** ************************************************************************************************************* **/
  // METODO PARA SELECCIONAR PLANTILLA DE DATOS DE CARGOS EMPLEADOS
  nameFileCargo: string;
  archivoSubidoCargo: Array<File>;

  messajeExcel: string = '';
  // METODO PARA SELECCIONAR PLANTILLA DE DATOS DE CONTRATOS EMPLEADOS
  FileChange(element: any, tipo: string) {
    this.numero_paginaMul = 1;
    this.tamanio_paginaMul = 5;
    this.archivoSubido = [];
    this.nameFile = '';
    this.archivoSubido = element.target.files;
    this.nameFile = this.archivoSubido[0].name;
    let arrayItems = this.nameFile.split(".");
    let itemExtencion = arrayItems[arrayItems.length - 1];
    let itemName = arrayItems[0];
    if (itemExtencion == 'xlsx' || itemExtencion == 'xls') {
      if (itemName.toLowerCase().startsWith('plantillaconfiguraciongeneral')) {
        this.numero_paginaMul = 1;
        this.tamanio_paginaMul = 5;
        this.VerificarPlantilla();
      } else {
        this.toastr.error('Seleccione plantilla con nombre plantillaConfiguracionGeneral.', 'Plantilla seleccionada incorrecta', {
          timeOut: 6000,
        });

        this.nameFile = '';
      }
    } else {
      this.toastr.error('Error en el formato del documento.', 'Plantilla no aceptada.', {
        timeOut: 6000,
      });
      this.nameFile = '';
    }
    this.archivoForm.reset();
    this.mostrarbtnsubir = true;
  }

  // METODO PARA VALIDAR DATOS DE PLANTILLAS
  Datos_grupoOcupacional: any
  listaGrupoOcupacionalCorrectas: any = [];
  listaGrupoOcupacionalCorrectasCont: number;
  // METODO PARA VERIFICAR DATOS DE PLANTILLA
  VerificarPlantilla() {
    this.listaGrupoOcupacionalCorrectas = [];
    let formData = new FormData();
    
    for (let i = 0; i < this.archivoSubido.length; i++) {
      formData.append("uploads", this.archivoSubido[i], this.archivoSubido[i].name);
    }

    // VERIFICACION DE DATOS FORMATO - DUPLICIDAD DENTRO DEL SISTEMA
    this.rest.RevisarFormatoEmpleGrupoOcu(formData).subscribe(res => {
        this.Datos_grupoOcupacional = res.data;
        this.messajeExcel = res.message;

        console.log('this.Datos_procesos: ',this.Datos_grupoOcupacional)

      if (this.messajeExcel == 'error') {
        this.toastr.error('Revisar que la numeración de la columna "item" sea correcta.', 'Plantilla no aceptada.', {
          timeOut: 4500,
        });
        this.mostrarbtnsubir = false;
      }
      else if (this.messajeExcel == 'no_existe') {
        this.toastr.error('No se ha encontrado pestaña grupo ocupacional en la plantilla.', 'Plantilla no aceptada.', {
          timeOut: 4500,
        });
        this.mostrarbtnsubir = false;
      }
      else {

        this.Datos_grupoOcupacional.sort((a: any, b: any) => {
          if (a.observacion !== 'ok' && b.observacion === 'ok') {
            return -1;
          }
          if (a.observacion === 'ok' && b.observacion !== 'ok') {
            return 1;
          }
          return 0;
        });

        this.Datos_grupoOcupacional.forEach((item: any) => {
          if (item.observacion.toLowerCase() == 'ok') {
            this.listaGrupoOcupacionalCorrectas.push(item);
          }
        });
        this.listaGrupoOcupacionalCorrectasCont = this.listaGrupoOcupacionalCorrectas.length;
      }
    }, error => {
      this.toastr.error('Error al cargar los datos', 'Plantilla no aceptada', {
        timeOut: 4000,
      });
    });
  }

  // FUNCION PARA CONFIRMAR EL REGISTRO MULTIPLE DE DATOS DEL ARCHIVO EXCEL
  ConfirmarRegistroMultiple() {
    const mensaje = 'registro';
    this.ventana.open(MetodosComponent, { width: '450px', data: mensaje }).afterClosed()
      .subscribe((confirmado: Boolean) => {
        if (confirmado) {
          this.RegistrarProcesos();
        }
      });
   }

   // METODO PARA DAR COLOR A LAS CELDAS Y REPRESENTAR LAS VALIDACIONES
   colorCelda: string = ''
   EstiloCelda(observacion: string): string {
     let arrayObservacion = observacion.split(" ");
     if (observacion == 'Registro duplicado') {
       return 'rgb(156, 214, 255)';
     } else if (observacion == 'ok') {
       return 'rgb(159, 221, 154)';
     } else if (observacion == 'Ya existe un registro activo con este Grupo Ocupacional.') {
       return 'rgb(239, 203, 106)';
     } else if (observacion  == 'La cédula ingresada no esta registrada en el sistema' ||
       observacion == 'Grupo Ocupacional no esta registrado en el sistema'
     ) {
       return 'rgb(255, 192, 203)';
     } else {
       return 'rgb(242, 21, 21)';
     }
   }
 
   colorTexto: string = '';
   EstiloTextoCelda(texto: string): string {
     texto = texto.toString()
     let arrayObservacion = texto.split(" ");
     if (arrayObservacion[0] == 'No') {
       return 'rgb(255, 80, 80)';
     } else {
       return 'black'
     }
   }
 
   // METODO PARA REGISTRAR DATOS
   RegistrarProcesos() {

    console.log('listaGrupoOcupacionalCorrectas: ',this.listaGrupoOcupacionalCorrectas.length)
     if (this.listaGrupoOcupacionalCorrectas?.length > 0) {
       const data = {
         plantilla: this.listaGrupoOcupacionalCorrectas,
         user_name: this.user_name,
         ip: this.ip, ip_local: this.ips_locales
       }

       this.rest.RegistrarPlantillaEmpleGrupoOcu(data).subscribe({
         next: (response: any) => {
           this.toastr.success('Plantilla de Grupo Ocupacional importada.', 'Operación exitosa.', {
             timeOut: 5000,
           });
           if (this.listaGrupoOcupacionalCorrectas?.length > 0) {
             setTimeout(() => {
              this.cerrarComponente.emit(false);
             }, 500);
           }
           
         },
         error: (error) => {
           this.toastr.error('No se pudo cargar la plantilla', 'Ups !!! algo salio mal', {
             timeOut: 4000,
           });
           this.archivoForm.reset();
         }
       });

     } else {
       this.toastr.error('No se ha encontrado datos para su registro.', 'Plantilla procesada.', {
         timeOut: 4000,
       });
       this.archivoForm.reset();
     }
 
     this.archivoSubido = [];
     this.nameFile = '';


   }


}
