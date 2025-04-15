import { Component, OnInit, ViewChild } from '@angular/core';
import { CatGradoService } from 'src/app/servicios/modulos/modulo-acciones-personal/catGrado/cat-grado.service';
import { EditarGradoComponent } from '../editar-grado/editar-grado.component';
import { MatDialog } from '@angular/material/dialog';
import { MetodosComponent } from 'src/app/componentes/generales/metodoEliminar/metodos.component';
import { Router } from '@angular/router';
import { DateTime } from 'luxon';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { FormControl, Validators } from '@angular/forms';
import { ValidacionesService } from 'src/app/servicios/generales/validaciones/validaciones.service';
import { EmpresaService } from 'src/app/servicios/configuracion/parametrizacion/catEmpresa/empresa.service';
import { EmpleadoService } from 'src/app/servicios/usuarios/empleado/empleadoRegistro/empleado.service';
import { MainNavService } from 'src/app/componentes/generales/main-nav/main-nav.service';
import { RegistrarGradoComponent } from '../registrar-grado/registrar-grado.component';
import { ToastrService } from 'ngx-toastr';
import { SelectionModel } from '@angular/cdk/collections';

@Component({
  selector: 'app-grados',
  standalone: false,
  templateUrl: './grados.component.html',
  styleUrl: './grados.component.css'
})

export class GradosComponent implements OnInit {

  ips_locales: any = '';

  buscarGrupo = new FormControl('', [Validators.minLength(2)]);
  archivoForm = new FormControl('', Validators.required);

  ListGrados: any

  // VARIABLES PARA AUDITORIA
  user_name: string | null;
  ip: string | null;

  // VARIABLES USADAS EN SELECCIÓN DE ARCHIVOS
  nameFile: string;
  archivoSubido: Array<File>;

  tamanio_paginaMul: number = 5;
  numero_paginaMul: number = 1;

  @ViewChild(MatPaginator) paginator: MatPaginator;

  // VARIABLE PARA TOMAR RUTA DEL SISTEMA
  hipervinculo: string = (localStorage.getItem('empresaURL') as string);

  // ITEMS DE PAGINACION DE LA TABLA
  tamanio_pagina: number = 5;
  numero_pagina: number = 1;
  pageSizeOptions = [5, 10, 20, 50];

  empleado: any = [];
  idEmpleado: number;

  get habilitarAccion(): boolean { return this.funciones.accionesPersonal; }

  // VARAIBLES DE SELECCION DE DATOS DE UNA TABLA
  selectionUno = new SelectionModel<any>(true, []);
  gradoEliminar: any = [];

  constructor(
    private _grados: CatGradoService,
    public ventana: MatDialog,
    private router: Router,
    private validar: ValidacionesService,
    public restEmpre: EmpresaService,
    public restE: EmpleadoService,
    private funciones: MainNavService,
    private toastr: ToastrService,
  ) {
    this.idEmpleado = parseInt(localStorage.getItem('empleado') as string);
  }

  ngOnInit() {
    this.user_name = localStorage.getItem('usuario');
    this.ip = localStorage.getItem('ip');
    this.validar.ObtenerIPsLocales().then((ips) => {
      this.ips_locales = ips;
    });

    if (this.habilitarAccion === false) {
      let mensaje = {
        access: false,
        title: `Ups!!! al parecer no tienes activado en tu plan el Módulo de Acciones de Personal. \n`,
        message: '¿Te gustaría activarlo? Comunícate con nosotros.',
        url: 'www.casapazmino.com.ec'
      }
      return this.validar.RedireccionarHomeAdmin(mensaje);
    }
    else {
      this.OptenerListaGrados();
      this.ObtenerEmpleados(this.idEmpleado);
      this.ObtenerLogo();
      this.ObtenerColores();
    }
  }

  LimpiarCampos() { 
    this.archivoSubido = [];
    this.nameFile = '';
    this.archivoForm.reset();
    this.Datos_grados = null;
    this.messajeExcel = '';
    this.buscarGrupo.reset();
    this.OptenerListaGrados();
    this.mostrarbtnsubir = false;
  }

  // METODO PARA VER LA INFORMACION DEL EMPLEADO
  ObtenerEmpleados(idemploy: any) {
    this.empleado = [];
    this.restE.BuscarUnEmpleado(idemploy).subscribe(data => {
      this.empleado = data;
    })
  }

  // METODO PARA OBTENER EL LOGO DE LA EMPRESA
  logo: any = String;
  ObtenerLogo() {
    this.restEmpre.LogoEmpresaImagenBase64(localStorage.getItem('empresa') as string).subscribe(res => {
      this.logo = 'data:image/jpeg;base64,' + res.imagen;
    });
  }

  // METODO PARA OBTENER COLORES Y MARCA DE AGUA DE EMPRESA
  p_color: any;
  s_color: any;
  frase: any;
  ObtenerColores() {
    this.restEmpre.ConsultarDatosEmpresa(parseInt(localStorage.getItem('empresa') as string)).subscribe(res => {
      this.p_color = res[0].color_principal;
      this.s_color = res[0].color_secundario;
      this.frase = res[0].marca_agua;
    });
  }

  OptenerListaGrados() {
    this.ListGrados = []
    this._grados.ConsultarGrados().subscribe({
      next: (respuesta: any) => {
        this.ListGrados = respuesta
      }, error: (err) => {
        this.toastr.error(err.error.message, 'Erro server', {
          timeOut: 6000,
        });
      },
    })
  }

  // METODO PARA VALIDAR INGRESO DE NUMEROS
  IngresarSoloNumeros(evt: any) {
    return this.validar.IngresarSoloNumeros(evt);
  }

  // METODO PARA VALIDAR INGRESO DE LETRA
  IngresarSoloLetras(e: any) {
    return this.validar.IngresarSoloLetras(e);
  }


    // SI EL NUMERO DE ELEMENTOS SELECCIONADOS COINCIDE CON EL NUMERO TOTAL DE FILAS.
    isAllSelected() {
      const numSelected = this.selectionUno.selected.length;
      const numRows = this.ListGrados.length;
      return numSelected === numRows;
    }
  
    // SELECCIONA TODAS LAS FILAS SI NO ESTÁN TODAS SELECCIONADAS; DE LO CONTRARIO, SELECCION CLARA.
    masterToggle() {
      this.isAllSelected() ?
        this.selectionUno.clear() :
        this.ListGrados.forEach((row: any) => this.selectionUno.select(row));
    }
  
    // LA ETIQUETA DE LA CASILLA DE VERIFICACION EN LA FILA PASADA
    checkboxLabel(row?: any): string {
      if (!row) {
        return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
      }
      this.gradoEliminar = this.selectionUno.selected;
      return `${this.selectionUno.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1}`;
    }
  
    // METODO PARA HACTIBAR LA SELECCION
    btnCheckHabilitar: boolean = false;
    HabilitarSeleccion() {
      if (this.btnCheckHabilitar === false) {
        this.btnCheckHabilitar = true;
      } else if (this.btnCheckHabilitar === true) {
        this.btnCheckHabilitar = false;
        this.selectionUno.clear();
      }
    }

  //METODO PARA ABRIR VENTANA EDITAR GRADO
  AbrirVentanaRegistrarGrado() { 
    //console.log(datosSeleccionados);
    this.ventana.open(RegistrarGradoComponent,
      {width: '450px'}).afterClosed().subscribe(items => {
        this.OptenerListaGrados();
      });
  }

  // METODO PARA ABRIR VENTANA EDITAR PROCESO
  AbrirVentanaEditar(datosSeleccionados: any): void {
    //console.log(datosSeleccionados);
    this.ventana.open(EditarGradoComponent,
      {
        width: '450px', data: datosSeleccionados
      }).afterClosed().subscribe(items => {
        this.OptenerListaGrados();
      });
  }

  // FUNCION PARA CONFIRMAR ELIMINAR REGISTROS
  ConfirmarDelete(datos: any) {
    //console.log(datos);
    this.ventana.open(MetodosComponent, { width: '450px' }).afterClosed()
      .subscribe((confirmado: Boolean) => {
        if (confirmado) {
          this.Eliminar(datos.id);
        } else {
          this.router.navigate(['/listaGrados']);
        }
      });
  }
  // FUNCION PARA ELIMINAR REGISTROS
  Eliminar(id_grado: number) {
    let dataGrado = {
      id_grado: id_grado,
      user_name: this.user_name,
      ip: this.ip, ip_local: this.ips_locales
    };
    this._grados.ElminarGrado(dataGrado).subscribe((res: any) => {
      if (res.codigo != 200) {
        this.toastr.warning('No se completo el proceso.', 'No fue posible eliminar.', {
          timeOut: 6000,
        });
      } else {
        this.toastr.error('Registro eliminado.', '', {
          timeOut: 6000,
        });
        this.OptenerListaGrados();
      }
    }, (error: any) => {
      this.toastr.error(error.error.message, 'No fue posible eliminar.', {
        timeOut: 6000,
      });
    });
  }

  // METODO PARA CONFIRMAR ELIMINACION MULTIPLE
  ConfirmarDeleteMultiple() {
    this.ventana.open(MetodosComponent, { width: '450px' }).afterClosed()
      .subscribe((confirmado: Boolean) => {
        if (confirmado) {
          if (this.gradoEliminar.length != 0) {
            this.EliminarMultiple();
            this.btnCheckHabilitar = false;
            this.gradoEliminar = [];
            this.selectionUno.clear();
          } else {
            this.toastr.warning('No ha seleccionado registros.', 'Ups!!! algo salio mal.', {
              timeOut: 6000,
            })
          }
        }
      });
  }
  EliminarMultiple(){    
    const data = {
      listaEliminar: this.gradoEliminar,
      user_name: this.user_name,
      ip: this.ip, ip_local: this.ips_locales
    }

    this._grados.EliminarGradoMult(data).subscribe({
       next: (response) => {
         this.toastr.error(response.message, 'Operación exitosa.', {
          timeOut: 5000,
        });
        if(response.relacionados > 0){
          if(response.relacionados > 0){
            response.listaNoEliminados.forEach(item => {
              this.toastr.warning(response.ms2+' '+item.trim(), 'Advertencia.', {
                timeOut: 5000,
              });
            });
          }
        }
         this.ngOnInit();
       },error: (err) => {
        if(err.status == 300){
          this.toastr.error(err.error.message,'', {
            timeOut: 4500,
          });
          this.toastr.warning(err.error.ms2, 'Advertencia.', {
            timeOut: 5000,
          });
        }else{
          this.toastr.error(err.error.message, 'Ups !!! algo salio mal.', {
            timeOut: 4000,
          });
        }
       }
    })
    
  }


  // METODO PARA MANEJAR LA PAGINACION
  ManejarPagina(e: PageEvent) {
    this.tamanio_pagina = e.pageSize;
    this.numero_pagina = e.pageIndex + 1;
  }
  // EVENTO PARA MOSTRAR FILAS DETERMINADAS EN LA TABLA
  ManejarPaginaMulti(e: PageEvent) {
    this.tamanio_paginaMul = e.pageSize;
    this.numero_paginaMul = e.pageIndex + 1
  }

  // VARIABLES DE MANEJO DE PLANTILLA DE DATOS
  mostrarbtnsubir: boolean = false;
  messajeExcel: string = '';
  // METODO PARA SELECCIONAR PLANTILLA DE DATOS
  FileChange(element: any) {
    this.numero_paginaMul = 1;
    this.tamanio_paginaMul = 5;
    this.paginator.firstPage();
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
  Datos_grados: any
  listaGradosCorrectas: any = [];
  listaGradosCorrectasCont: number;
  // METODO PARA VERIFICAR DATOS DE PLANTILLA
  VerificarPlantilla() {
    this.listaGradosCorrectas = [];
    let formData = new FormData();
    
    for (let i = 0; i < this.archivoSubido.length; i++) {
      formData.append("uploads", this.archivoSubido[i], this.archivoSubido[i].name);
    }

    // VERIFICACION DE DATOS FORMATO - DUPLICIDAD DENTRO DEL SISTEMA
    this._grados.RevisarFormato(formData).subscribe(res => {
      this.Datos_grados = res.data;
      this.messajeExcel = res.message;

      if (this.messajeExcel == 'error') {
        this.toastr.error('Revisar que la numeración de la columna "item" sea correcta.', 'Plantilla no aceptada.', {
          timeOut: 4500,
        });
        this.mostrarbtnsubir = false;
      }
      else if (this.messajeExcel == 'no_existe') {
        this.toastr.error('No se ha encontrado pestaña GRADO en la plantilla.', 'Plantilla no aceptada.', {
          timeOut: 4500,
        });
        this.mostrarbtnsubir = false;
      }
      else {

        this.Datos_grados.sort((a: any, b: any) => {
          if (a.observacion !== 'ok' && b.observacion === 'ok') {
            return -1;
          }
          if (a.observacion === 'ok' && b.observacion !== 'ok') {
            return 1;
          }
          return 0;
        });

        this.Datos_grados.forEach((item: any) => {
          if (item.observacion.toLowerCase() == 'ok') {
            this.listaGradosCorrectas.push(item);
          }
        });
        this.listaGradosCorrectasCont = this.listaGradosCorrectas.length;
      }
    }, error => {
      this.toastr.error('Error al cargar los datos.', 'Plantilla no aceptada', {
        timeOut: 4000,
      });
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
    } else if (observacion == 'Ya existe en el sistema') {
      return 'rgb(239, 203, 106)';
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

  // FUNCION PARA CONFIRMAR EL REGISTRO MULTIPLE DE DATOS DEL ARCHIVO EXCEL
  ConfirmarRegistroMultiple() {
    const mensaje = 'registro';
    this.ventana.open(MetodosComponent, { width: '450px', data: mensaje }).afterClosed()
      .subscribe((confirmado: Boolean) => {
        if (confirmado) {
          this.RegistrarGrados();
        }
      });
  }

  RegistrarGrados(){
    console.log('ListaGradosCorrectas: ',this.listaGradosCorrectas.length)
    if (this.listaGradosCorrectas?.length > 0) {
      const data = {
        plantilla: this.listaGradosCorrectas,
        user_name: this.user_name,
        ip: this.ip, ip_local: this.ips_locales
      }

      this._grados.RegistrarPlantilla(data).subscribe({
        next: (response: any) => {
          this.toastr.success('Plantilla de Grado importada.', 'Operación exitosa.', {
            timeOut: 5000,
          });
          if (this.listaGradosCorrectas?.length > 0) {
            setTimeout(() => {
              this.ngOnInit();
            }, 500);
          }
          this.LimpiarCampos();
        },
        error: (error) => {
          this.toastr.error('No se pudo cargar la plantilla.', 'Ups !!! algo salio mal.', {
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




  /** ************************************************************************************************** **
     ** **                               METODO PARA EXPORTAR A PDF                                     ** **
     ** ************************************************************************************************** **/

  async GenerarPdf(action = 'open') {
    const pdfMake = await this.validar.ImportarPDF();
    const documentDefinition = this.DefinirInformacionPDF();
    switch (action) {
      case 'open': pdfMake.createPdf(documentDefinition).open(); break;
      case 'print': pdfMake.createPdf(documentDefinition).print(); break;
      case 'download': pdfMake.createPdf(documentDefinition).download('ListaGrados.pdf'); break;
      default: pdfMake.createPdf(documentDefinition).open(); break;
    }
  }

  DefinirInformacionPDF() {

    return {

      // ENCABEZADO DE LA PAGINA
      pageSize: 'A4',
      pageOrientation: 'portrait',
      watermark: { text: this.frase, color: 'blue', opacity: 0.1, bold: true, italics: false },
      header: { text: 'Impreso por:  ' + this.empleado[0].nombre + ' ' + this.empleado[0].apellido, margin: 10, fontSize: 9, opacity: 0.3, alignment: 'right' },

      // PIE DE LA PAGINA
      footer: function (currentPage: any, pageCount: any, fecha: any, hora: any) {
        var f = DateTime.now();
        fecha = f.toFormat('yyyy-MM-dd');
        hora = f.toFormat('HH:mm:ss');
        return {
          margin: 10,
          columns: [
            { text: 'Fecha: ' + fecha + ' Hora: ' + hora, opacity: 0.3 },
            {
              text: [
                {
                  text: '© Pag ' + currentPage.toString() + ' of ' + pageCount,
                  alignment: 'right', opacity: 0.3
                }
              ],
            }
          ], fontSize: 10
        }
      },
      content: [
        { image: this.logo, width: 150, margin: [10, -25, 0, 5] },
        { text: 'LISTA DE GRADOS', bold: true, fontSize: 12, alignment: 'center', margin: [0, -30, 0, 10] },
        this.presentarDataPDFGrados(),
      ],
      styles: {
        tableHeader: { fontSize: 10, bold: true, alignment: 'center', fillColor: this.p_color },
        itemsTable: { fontSize: 9 },
        itemsTableC: { fontSize: 9, alignment: 'center' }
      }
    };
  }

  presentarDataPDFGrados() {
    return {
      columns: [
        { width: '*', text: '' },
        {
          width: 'auto',
          table: {
            widths: ['auto', 'auto'],
            body: [
              [
                { text: 'CÓDIGO', style: 'tableHeader' },
                { text: 'GRADO', style: 'tableHeader' },
              ],
              ...this.ListGrados.map((obj: any) => {
                return [
                  { text: obj.id, style: 'itemsTableC' },
                  { text: obj.descripcion, style: 'itemsTable' },
                ];
              })
            ]
          },
          // ESTILO DE COLORES FORMATO ZEBRA
          layout: {
            fillColor: function (i: any) {
              return (i % 2 === 0) ? '#CCD1D1' : null;
            }
          }
        },
        { width: '*', text: '' },
      ]
    };
  }

  /** ************************************************************************************************** **
   ** **                                     METODO PARA EXPORTAR A EXCEL                             ** **
   ** ************************************************************************************************** **/
  exportToExcel() {
    /*
    const wsr: xlsx.WorkSheet = xlsx.utils.json_to_sheet(this.procesos);
    const wb: xlsx.WorkBook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, wsr, 'Procesos');
    xlsx.writeFile(wb, "Procesos" + new Date().getTime() + '.xlsx');
    */
  }

  /** ************************************************************************************************** **
   ** **                                   METODO PARA EXPORTAR A CSV                                 ** **
   ** ************************************************************************************************** **/

  exportToCVS() {
    /*
    const wse: xlsx.WorkSheet = xlsx.utils.json_to_sheet(this.procesos);
    const csvDataH = xlsx.utils.sheet_to_csv(wse);
    const data: Blob = new Blob([csvDataH], { type: 'text/csv;charset=utf-8;' });
    FileSaver.saveAs(data, "ProcesosCSV" + new Date().getTime() + '.csv');
    */
  }

  /** ************************************************************************************************* **
   ** **                            PARA LA EXPORTACION DE ARCHIVOS XML                               ** **
   ** ************************************************************************************************* **/

  urlxml: string;
  data: any = [];
  exportToXML() {
    var objeto;
    var arregloGrados: any = [];
    this.ListGrados.forEach((obj: any) => {
      objeto = {
        "grado": {
          '@id': obj.id,
          "nombre": obj.nombre,
          "proceso_superior": obj.proc_padre,
        }
      }
      arregloGrados.push(objeto)
    });

  }

  //CONTROL BOTONES
  private tienePermiso(accion: string): boolean {
    const datosRecuperados = sessionStorage.getItem('paginaRol');
    if (datosRecuperados) {
      try {
        const datos = JSON.parse(datosRecuperados);
        return datos.some((item: any) => item.accion === accion);
      } catch {
        return false;
      }
    } else {
      // Si no hay datos, se permite si el rol es 1 (Admin)
      return parseInt(localStorage.getItem('rol') || '0') === 1;
    }
  }
  
  getCrearGrado(): boolean {
    return this.tienePermiso('Crear Grado');
  }

  getEditarGrado(): boolean {
    return this.tienePermiso('Editar Grado');
  }

  getEliminarGrado(): boolean {
    return this.tienePermiso('Eliminar Grado');
  }

  getCargarPlantillaGrado(): boolean {
    return this.tienePermiso('Cargar Plantilla Grado');
  }

  getDescargarReportesGrado(): boolean {
    return this.tienePermiso('Descargar Reportes Grado');
  }

}
