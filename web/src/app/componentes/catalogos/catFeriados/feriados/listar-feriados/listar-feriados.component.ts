// IMPORTACION DE LIBRERIAS
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { environment } from 'src/environments/environment';
import { PageEvent } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import * as FileSaver from 'file-saver';
import * as moment from 'moment';
import * as xlsx from 'xlsx';
import * as pdfMake from 'pdfmake/build/pdfmake.js';
import * as pdfFonts from 'pdfmake/build/vfs_fonts.js';
pdfMake.vfs = pdfFonts.pdfMake.vfs;

// IMPORTACION DE COMPONENTES
import { RegistrarFeriadosComponent } from 'src/app/componentes/catalogos/catFeriados/feriados/registrar-feriados/registrar-feriados.component';
import { EditarFeriadosComponent } from 'src/app/componentes/catalogos/catFeriados/feriados/editar-feriados/editar-feriados.component';
import { MetodosComponent } from 'src/app/componentes/administracionGeneral/metodoEliminar/metodos.component';

// IMPORTACION DE SERVICIOS
import { PlantillaReportesService } from 'src/app/componentes/reportes/plantilla-reportes.service';
import { ValidacionesService } from 'src/app/servicios/validaciones/validaciones.service';
import { ParametrosService } from 'src/app/servicios/parametrosGenerales/parametros.service';
import { FeriadosService } from 'src/app/servicios/catalogos/catFeriados/feriados.service';
import { EmpleadoService } from 'src/app/servicios/empleado/empleadoRegistro/empleado.service';

@Component({
  selector: 'app-listar-feriados',
  templateUrl: './listar-feriados.component.html',
  styleUrls: ['./listar-feriados.component.css'],
})

export class ListarFeriadosComponent implements OnInit {

  // CONTROL DE CAMPOS Y VALIDACIONES DEL FORMULARIO
  descripcionF = new FormControl('');
  archivoForm = new FormControl('', Validators.required);
  fechaF = new FormControl('');

  // ASIGNACION DE VALIDACIONES A INPUTS DEL FORMULARIO
  public formulario = new FormGroup({
    descripcionForm: this.descripcionF,
    fechaForm: this.fechaF,
  });

  // ALMACENAMIENTO DE DATOS CONSULTADOS  
  feriados: any = [];
  empleado: any = [];

  // VARAIBLES USADAS PARA FILTROS DE BUSQUEDA
  filtroDescripcion = '';
  filtradoFecha = '';

  idEmpleado: number; // VARIABLE DE ALMACENAMIENTO DE ID DE EMPLEADO QUE INICIA SESION

  // ITEMS DE PAGINACION DE LA TABLA
  pageSizeOptions = [5, 10, 20, 50];
  tamanio_pagina: number = 5;
  numero_pagina: number = 1;

  // VARIABLES DE MANEJO DE PLANTILLA DE DATOS
  nameFile: string;
  archivoSubido: Array<File>;

  // VARIABLE PARA TOMAR RUTA DEL SISTEMA
  hipervinculo: string = environment.url

  // METODO DE LLAMADO DE DATOS DE EMPRESA COLORES - LOGO - MARCA DE AGUA
  get s_color(): string { return this.plantillaPDF.color_Secundary }
  get p_color(): string { return this.plantillaPDF.color_Primary }
  get frase(): string { return this.plantillaPDF.marca_Agua }
  get logo(): string { return this.plantillaPDF.logoBase64 }

  constructor(
    private plantillaPDF: PlantillaReportesService, // SERVICIO DATOS DE EMPRESA
    private toastr: ToastrService, // VARIABLE MANEJO DE MENSAJES DE NOTIFICACIONES
    private restE: EmpleadoService, // SERVICIO DATOS DE EMPLEADO
    private rest: FeriadosService, // SERVICIO DATOS DE FERIADOS
    public ventana: MatDialog, // VARIABLE DE USO DE VENTANAS DE DIÁLOGO
    public validar: ValidacionesService,
    public parametro: ParametrosService,
  ) {
    this.idEmpleado = parseInt(localStorage.getItem('empleado') as string);
  }

  ngOnInit(): void {
    this.ObtenerEmpleados(this.idEmpleado);
    this.BuscarParametro();
  }

  /** **************************************************************************************** **
   ** **                          BUSQUEDA DE FORMATOS DE FECHAS                            ** ** 
   ** **************************************************************************************** **/

  formato_fecha: string = 'DD/MM/YYYY';

  // METODO PARA BUSCAR PARÁMETRO DE FORMATO DE FECHA
  BuscarParametro() {
    // id_tipo_parametro Formato fecha = 25
    this.parametro.ListarDetalleParametros(25).subscribe(
      res => {
        this.formato_fecha = res[0].descripcion;
        this.ObtenerFeriados(this.formato_fecha)
      },
      vacio => {
        this.ObtenerFeriados(this.formato_fecha)
      });
  }

  // METODO PARA VER LA INFORMACION DEL EMPLEADO 
  ObtenerEmpleados(idemploy: any) {
    this.empleado = [];
    this.restE.BuscarUnEmpleado(idemploy).subscribe(data => {
      this.empleado = data;
    })
  }

  // LECTURA DE DATOS
  ObtenerFeriados(formato: string) {
    this.feriados = [];
    this.rest.ConsultarFeriado().subscribe(datos => {
      this.feriados = datos;
      this.feriados.forEach(data => {
        data.fecha_ = this.validar.FormatearFecha(data.fecha, formato, this.validar.dia_abreviado);
        if (data.fec_recuperacion != null) {
          data.fec_recuperacion_ = this.validar.FormatearFecha(data.fec_recuperacion, formato, this.validar.dia_abreviado);
        }
      })
    })
  }

  // ORDENAR LOS DATOS SEGUN EL ID 
  OrdenarDatos(array: any) {
    function compare(a: any, b: any) {
      if (a.id < b.id) {
        return -1;
      }
      if (a.id > b.id) {
        return 1;
      }
      return 0;
    }
    array.sort(compare);
  }

  // METODO PARA REGISTRAR FERIADO
  AbrirVentanaRegistrarFeriado(): void {
    this.ventana.open(RegistrarFeriadosComponent, { width: '350px' }).afterClosed().subscribe(items => {
      if (items == true) {
        this.BuscarParametro();
      }
    });
  }

  // METODO PARA EDITAR FERIADOS
  AbrirVentanaEditarFeriado(datosSeleccionados: any): void {
    this.ventana.open(EditarFeriadosComponent,
      { width: '350px', data: { datosFeriado: datosSeleccionados, actualizar: true } }).disableClose = true;
  }

  // FUNCION PARA ELIMINAR REGISTRO SELECCIONADO 
  Eliminar(id_feriado: number) {
    this.rest.EliminarFeriado(id_feriado).subscribe(res => {
      this.toastr.error('Registro eliminado.', '', {
        timeOut: 6000,
      });
      this.BuscarParametro();
    });
  }

  // FUNCION PARA CONFIRMAR SI SE ELIMINA O NO UN REGISTRO 
  ConfirmarDelete(datos: any) {
    this.ventana.open(MetodosComponent, { width: '450px' }).afterClosed()
      .subscribe((confirmado: Boolean) => {
        if (confirmado) {
          this.Eliminar(datos.id);
        }
      });
  }

  // METODO PARA LIMPIAR FORMULARIO
  LimpiarCampos() {
    this.formulario.setValue({
      descripcionForm: '',
      fechaForm: ''
    });
    this.BuscarParametro();
  }

  // METODO PARA INGRESAR SOLO LETRAS
  IngresarSoloLetras(e: any) {
    return this.validar.IngresarSoloLetras(e);
  }

  // EVENTO PARA MOSTRAR FILAS DETERMINADAS EN LA TABLA
  ManejarPagina(e: PageEvent) {
    this.tamanio_pagina = e.pageSize;
    this.numero_pagina = e.pageIndex + 1
  }

  // METODO PARA VISUALIZAR PANTALLA ASIGNAR CIUDAD FERIADO
  ver_lista: boolean = true;
  ver_asignar: boolean = false;
  pagina: string = '';
  feriado_id: number;
  VerAsignarCiudad(id: number) {
    this.feriado_id = id;
    this.pagina = 'listar-feriados';
    this.ver_ciudades = false;
    this.ver_asignar = true;
    this.ver_lista = false;
  }

  // METODO PARA VISUALIZAR PANTALLA VER CIUDADES FERIADOS
  ver_ciudades: boolean = false;
  VerListaCiudades(id: number) {
    this.feriado_id = id;
    this.pagina = 'listar-ciudades';
    this.ver_ciudades = true;
    this.ver_asignar = false;
    this.ver_lista = false;
  }



  // METODO PARA SELECCIONAR PLANTILLA DE DATOS DE FERIADOS
  FileChange(element: any) {
    this.archivoSubido = element.target.files;
    this.nameFile = this.archivoSubido[0].name;
    let arrayItems = this.nameFile.split(".");
    let itemExtencion = arrayItems[arrayItems.length - 1];
    let itemName = arrayItems[0].slice(0, 8);
    if (itemExtencion == 'xlsx' || itemExtencion == 'xls') {
      if (itemName.toLowerCase() == 'feriados') {
        this.Revisarplantilla();
      } else {
        this.toastr.error('Seleccione plantilla con nombre Feriados', 'Plantilla seleccionada incorrecta', {
          timeOut: 6000,
        });
        this.archivoForm.reset();
        this.nameFile = '';
      }
    } else {
      this.toastr.error('Error en el formato del documento', 'Plantilla no aceptada', {
        timeOut: 6000,
      });
      this.archivoForm.reset();
      this.nameFile = '';
    }
  }

  // METODO PARA ENVIAR MENSAJES DE ERROR O CARGAR DATOS SI LA PLANTILLA ES CORRECTA
  Revisarplantilla() {
    let formData = new FormData();
    for (var i = 0; i < this.archivoSubido.length; i++) {
      formData.append("uploads[]", this.archivoSubido[i], this.archivoSubido[i].name);
    }
    // VERIFICACIÓN DE DATOS FORMATO - DUPLICIDAD DENTRO DEL SISTEMA
    this.rest.RevisarFormato(formData).subscribe(res => {
      console.log('probando plantilla1', res);
      if (res.message === 'CAMPO FECHA ES OBLIGATORIO') {
        this.toastr.error('Para asegurar el buen funcionamiento del sistema es necesario que verifique los datos ' +
          'de la plantilla ingresada. No se encuentra el registro del campo fecha en la ' + res.data + '.',
          'Recuerde el campo fecha es obligatorio.', {
          timeOut: 10000,
        });
        this.archivoForm.reset();
        this.nameFile = '';
      }
      else if (res.message === 'CAMPO DESCRIPCION ES OBLIGATORIO') {
        this.toastr.error('Para asegurar el buen funcionamiento del sistema es necesario que verifique los datos ' +
          'de la plantilla ingresada. No se encuentra el registro del campo descripcion en la ' + res.data + '.',
          'Recuerde el campo descripcion es obligatorio.', {
          timeOut: 10000,
        });
        this.archivoForm.reset();
        this.nameFile = '';
      }
      else if (res.message === 'FECHA INVALIDA') {
        this.toastr.error('Para asegurar el buen funcionamiento del sistema es necesario que verifique los datos ' +
          'de la plantilla ingresada. Las fechas con formato incorrecto o fuera de rango se encuentran en la ' +
          res.data + '.', 'Recuerde las fechas en la plantilla EXCEL deben estar en formato texto.', {
          timeOut: 10000,
        });
        this.archivoForm.reset();
        this.nameFile = '';
      }
      else if (res.message === 'FECHA YA EXISTE') {
        this.toastr.error('Para asegurar el buen funcionamiento del sistema es necesario que verifique los datos ' +
          'de la plantilla ingresada. Se encuentran fechas que ya estan registradas en el sistema en la ' + res.data + '.',
          'Recuerde que el sistema no permite registros duplicados.', {
          timeOut: 10000,
        });
        this.archivoForm.reset();
        this.nameFile = '';
      }
      else if (res.message === 'FECHA DE RECUPERACION INVALIDA') {
        this.toastr.error('Para asegurar el buen funcionamiento del sistema es necesario que verifique los datos ' +
          'de la plantilla ingresada. Las fechas de recuperación con formato incorrecto o fuera de rango se encuentran en la '
          + res.data + '.', 'Recuerde las fechas de recuperación en la plantilla EXCEL deben estar en formato texto.', {
          timeOut: 10000,
        });
        this.archivoForm.reset();
        this.nameFile = '';
      }
      else if (res.message === 'FECHA DE RECUPERACION ANTERIOR') {
        this.toastr.error('Para asegurar el buen funcionamiento del sistema es necesario que verifique los datos ' +
          'de la plantilla ingresada. Las fechas de recuperación que no son válidas se encuentran en la ' +
          res.data + '.', 'Recuerde la fecha de recuperación debe ser posterior a la fecha que registra como un feriado.', {
          timeOut: 10000,
        });
        this.archivoForm.reset();
        this.nameFile = '';
      }
      else if (res.message === 'FECHA DE RECUPERACION YA EXISTE') {
        this.toastr.error('Para asegurar el buen funcionamiento del sistema es necesario que verifique los datos ' +
          'de la plantilla ingresada. Se encuentran fechas de recuperación que ya se encuentran registradas en el sistema en la ' +
          res.data + '.', 'Recuerde que el sistema no permite ingresar fechas de recuperación duplicadas.', {
          timeOut: 10000,
        });
        this.archivoForm.reset();
        this.nameFile = '';
      }
      else if (res.message === 'CORRECTO') {
        // VERIFICAR DATOS DUPLICADOS DENTRO DE LA MISMA PLANTILLA
        this.rest.RevisarDuplicidad(formData).subscribe(respose => {
          console.log('probando plantilla2', respose);
          if (respose.message === 'ERROR FECHA') {
            this.toastr.error('Para asegurar el buen funcionamiento del sistema es necesario que verifique los datos ' +
              'de la plantilla ingresada. Se encuentran fechas duplicadas dentro de su plantilla en la ' + respose.data,
              'Recuerde que el sistema no admite duplicidad de registros.', {
              timeOut: 10000,
            });
            this.archivoForm.reset();
            this.nameFile = '';
          }
          else if (respose.message === 'ERROR RECUPERACION') {
            this.toastr.error('Para asegurar el buen funcionamiento del sistema es necesario que verifique los datos ' +
              'de la plantilla ingresada. Se encuentran fechas de recuperación duplicadas dentro de su plantilla en la ' + respose.data,
              'Recuerde que el sistema no admite duplicidad de registros.', {
              timeOut: 10000,
            });
            this.archivoForm.reset();
            this.nameFile = '';
          }
          else if (respose.message === 'SIMILAR FECHA-RECUPERACION') {
            this.toastr.error('Para asegurar el buen funcionamiento del sistema es necesario que verifique los datos ' +
              'de la plantilla ingresada.' + respose.data,
              'Recuerde que el sistema no admite duplicidad de registros.', {
              timeOut: 10000,
            });
            this.archivoForm.reset();
            this.nameFile = '';
          }
          else if (respose.message === 'CORRECTO') {
            // SUBIR LOS DATOS CUANDO TODOS SON CORRECTOS
            this.rest.subirArchivoExcel(formData).subscribe(subido => {
              window.location.reload();
              this.toastr.success('Operación exitosa.', 'Plantilla de Feriados importada.', {
                timeOut: 10000,
              });
              this.archivoForm.reset();
              this.nameFile = '';
            });
          }
        });
      }
    });
  }

  /** ************************************************************************************************* **
   ** **                           PARA LA EXPORTACION DE ARCHIVOS PDF                               ** **
   ** ************************************************************************************************* **/

  GenerarPdf(action = 'open') {
    this.OrdenarDatos(this.feriados);
    const documentDefinition = this.GetDocumentDefinicion();
    switch (action) {
      case 'open': pdfMake.createPdf(documentDefinition).open(); break;
      case 'print': pdfMake.createPdf(documentDefinition).print(); break;
      case 'download': pdfMake.createPdf(documentDefinition).download(); break;
      default: pdfMake.createPdf(documentDefinition).open(); break;
    }
    this.BuscarParametro();
  }

  GetDocumentDefinicion() {
    sessionStorage.setItem('Feriados', this.feriados);
    return {
      // ENCABEZADO DE LA PÁGINA
      watermark: { text: this.frase, color: 'blue', opacity: 0.1, bold: true, italics: false },
      header: { text: 'Impreso por: ' + this.empleado[0].nombre + ' ' + this.empleado[0].apellido, margin: 10, fontSize: 9, opacity: 0.3, alignment: 'right' },
      // PIE DE PÁGINA
      footer: function (currentPage: any, pageCount: any, fecha: any, hora: any) {
        var f = moment();
        fecha = f.format('YYYY-MM-DD');
        hora = f.format('HH:mm:ss');
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
        { text: 'Lista de Feriados', bold: true, fontSize: 20, alignment: 'center', margin: [0, -10, 0, 10] },
        this.PresentarDataPDFFeriados(),
      ],
      styles: {
        tableHeader: { fontSize: 12, bold: true, alignment: 'center', fillColor: this.p_color },
        itemsTable: { fontSize: 10, alignment: 'center' },
        itemsTableD: { fontSize: 10 }
      }
    };
  }

  PresentarDataPDFFeriados() {
    return {
      columns: [
        { width: '*', text: '' },
        {
          width: 'auto',
          table: {
            widths: ['auto', 'auto', 'auto', 'auto'],
            body: [
              [
                { text: 'Código', style: 'tableHeader' },
                { text: 'Descripción', style: 'tableHeader' },
                { text: 'Fecha', style: 'tableHeader' },
                { text: 'Fecha Recuperación', style: 'tableHeader' },
              ],
              ...this.feriados.map(obj => {
                return [
                  { text: obj.id, style: 'itemsTable' },
                  { text: obj.descripcion, style: 'itemsTableD' },
                  { text: obj.fecha_, style: 'itemsTable' },
                  { text: obj.fec_recuperacion_, style: 'itemsTable' },
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

  /** ************************************************************************************************* **
   ** **                          PARA LA EXPORTACION DE ARCHIVOS EXCEL                              ** **
   ** ************************************************************************************************* **/

  ExportToExcel() {
    this.OrdenarDatos(this.feriados);
    const wsr: xlsx.WorkSheet = xlsx.utils.json_to_sheet(this.feriados.map(obj => {
      return {
        CODIGO: obj.id,
        FERIADO: obj.descripcion,
        FECHA: obj.fecha_,
        FECHA_RECUPERA: obj.fec_recuperacion_
      }
    }));
    // METODO PARA DEFINIR TAMAÑO DE LAS COLUMNAS DEL REPORTE
    const header = Object.keys(this.feriados[0]); // NOMBRE DE CABECERAS DE COLUMNAS
    var wscols: any = [];
    for (var i = 0; i < header.length; i++) {  // CABECERAS AÑADIDAS CON ESPACIOS
      wscols.push({ wpx: 100 })
    }
    wsr["!cols"] = wscols;
    const wb: xlsx.WorkBook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, wsr, 'LISTA FERIADOS');
    xlsx.writeFile(wb, "FeriadosEXCEL" + new Date().getTime() + '.xlsx');
    this.BuscarParametro();
  }

  /** ************************************************************************************************* **
   ** **                              PARA LA EXPORTACION DE ARCHIVOS XML                            ** **
   ** ************************************************************************************************* **/

  urlxml: string;
  data: any = [];
  ExportToXML() {
    this.OrdenarDatos(this.feriados);
    var objeto;
    var arregloFeriados: any = [];
    this.feriados.forEach(obj => {
      objeto = {
        "roles": {
          '@id': obj.id,
          "descripcion": obj.descripcion,
          "fecha": obj.fecha_,
          "fec_recuperacion": obj.fec_recuperacion_,
        }
      }
      arregloFeriados.push(objeto)
    });

    this.rest.CrearXML(arregloFeriados).subscribe(res => {
      this.data = res;
      this.urlxml = `${environment.url}/feriados/download/` + this.data.name;
      window.open(this.urlxml, "_blank");
    });
    this.BuscarParametro();
  }

  /** ************************************************************************************************** ** 
   ** **                                METODO PARA EXPORTAR A CSV                                    ** **
   ** ************************************************************************************************** **/

  ExportToCVS() {
    this.OrdenarDatos(this.feriados);
    const wse: xlsx.WorkSheet = xlsx.utils.json_to_sheet(this.feriados.map(obj => {
      return {
        CODIGO: obj.id,
        FERIADO: obj.descripcion,
        FECHA: obj.fecha_,
        FECHA_RECUPERA: obj.fec_recuperacion_
      }
    }));
    const csvDataC = xlsx.utils.sheet_to_csv(wse);
    const data: Blob = new Blob([csvDataC], { type: 'text/csv;charset=utf-8;' });
    FileSaver.saveAs(data, "FeriadosCSV" + new Date().getTime() + '.csv');
    this.BuscarParametro();
  }

}