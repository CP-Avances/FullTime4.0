// IMPORTACION DE LIBRERIAS
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { environment } from 'src/environments/environment';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { DateTime } from 'luxon';
import { Router } from '@angular/router';

import ExcelJS, { FillPattern } from "exceljs";
import * as xml2js from 'xml2js';
import * as FileSaver from 'file-saver';
import { FillPatterns } from 'exceljs';

import { MetodosComponent } from 'src/app/componentes/generales/metodoEliminar/metodos.component';

import { AccionPersonalService } from 'src/app/servicios/modulos/modulo-acciones-personal/accionPersonal/accion-personal.service';
import { ValidacionesService } from 'src/app/servicios/generales/validaciones/validaciones.service';
import { EmpleadoService } from 'src/app/servicios/usuarios/empleado/empleadoRegistro/empleado.service';
import { EmpresaService } from 'src/app/servicios/configuracion/parametrizacion/catEmpresa/empresa.service';
import { MainNavService } from 'src/app/componentes/generales/main-nav/main-nav.service';
import { auto } from '@popperjs/core';

(ExcelJS as any).crypto = null; // Desactiva funciones no soportadas en el navegador

@Component({
  selector: 'app-listar-tipo-accion',
  templateUrl: './listar-tipo-accion.component.html',
  styleUrls: ['./listar-tipo-accion.component.css']
})

export class ListarTipoAccionComponent implements OnInit {
  ips_locales: any = '';

  archivoForm = new FormControl('', Validators.required);

  // ITEMS DE PAGINACION DE LA TABLA
  tamanio_pagina: number = 5;
  numero_pagina: number = 1;
  pageSizeOptions = [5, 10, 20, 50];

  empleado: any = [];
  idEmpleado: number;

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
    hipervinculo: string = environment.url

  // CONTROL DE CAMPOS Y VALIDACIONES DEL FORMULARIO
  nombreF = new FormControl('', [Validators.minLength(2)]);

  // ASIGNACION DE VALIDACIONES A INPUTS DEL FORMULARIO
  public BuscarTipoAccionForm = new FormGroup({
    nombreForm: this.nombreF,
  });

  get habilitarAccion(): boolean { return this.funciones.accionesPersonal; }

  private bordeCompleto!: Partial<ExcelJS.Borders>;
  private bordeGrueso!: Partial<ExcelJS.Borders>;
  private fillAzul!: FillPatterns;
  private fontTitulo!: Partial<ExcelJS.Font>;
  private imagen: any;

  constructor(
    public restEmpre: EmpresaService,
    public ventana: MatDialog,
    public restE: EmpleadoService,
    private rest: AccionPersonalService,
    private toastr: ToastrService,
    private router: Router,
    private validar: ValidacionesService,
    private funciones: MainNavService,
  ) {
    this.idEmpleado = parseInt(localStorage.getItem('empleado') as string);
  }

  ngOnInit(): void {
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
      this.ObtenerTipoAccionesPersonal();
      this.ObtenerEmpleados(this.idEmpleado);
      this.ObtenerLogo();
      this.ObtenerColores();
    }
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

  // METODO PARA MANEJAR PAGINACION
  ManejarPagina(e: PageEvent) {
    this.tamanio_pagina = e.pageSize;
    this.numero_pagina = e.pageIndex + 1;
  }

  // EVENTO PARA MOSTRAR FILAS DETERMINADAS EN LA TABLA
  ManejarPaginaMulti(e: PageEvent) {
    this.tamanio_paginaMul = e.pageSize;
    this.numero_paginaMul = e.pageIndex + 1
  }

  // METODO PARA OBTENER TIPOS DE ACCIONES
  tipo_acciones: any = [];
  ObtenerTipoAccionesPersonal() {
    this.rest.ConsultarTipoAccionPersonal().subscribe(datos => {
      this.tipo_acciones = datos;
    });
  }

  // FUNCION PARA ELIMINAR REGISTROS
  Eliminar(id_accion: number) {
    let datos = {
      user_name: this.user_name,
      ip: this.ip, ip_local: this.ips_locales
    };
    this.rest.EliminarRegistro(id_accion, datos).subscribe((res: any) => {
      if (res.message === 'error') {
        this.toastr.error('Existen datos relacionados con este registro.', 'No fue posible eliminar.', {
          timeOut: 6000,
        });
      } else {
        this.toastr.error('Registro eliminado.', '', {
          timeOut: 6000,
        });
        this.ObtenerTipoAccionesPersonal();
      }
    });
  }

  // FUNCION PARA CONFIRMAR ELIMINAR REGISTROS
  ConfirmarDelete(datos: any) {
    this.ventana.open(MetodosComponent, { width: '450px' }).afterClosed()
      .subscribe((confirmado: Boolean) => {
        if (confirmado) {
          this.Eliminar(datos.id);
        } else {
          this.router.navigate(['/acciones-personal']);
        }
      });
  }

  // METODO PARA LIMPIAR FORMULARIO
  LimpiarCampos() {
    this.archivoSubido = [];
    this.nameFile = '';
    this.archivoForm.reset();
    this.Datos_tipoAccion_personal = null;
    this.messajeExcel = '';
    this.mostrarbtnsubir = false;
    this.BuscarTipoAccionForm.setValue({
      nombreForm: '',
    });
    this.ObtenerTipoAccionesPersonal();
  }


  // METODO PARA ABRIR EL FORMULARIO REGISTRAR
  ver_registrar: boolean = false;
  ver_lista: boolean = true;
  AbrirRegistrar() {
    this.ver_registrar = true;
    this.ver_lista = false;
  }

  // METODO PARA ABRIR EL FORMULARIO EDITAR
  ver_editar: boolean = false;
  accion: any;
  pagina: string = '';
  AbrirEditar(datos: any) {
    this.ver_lista = false;
    this.ver_editar = true;
    this.accion = datos;
    this.pagina = 'listar-tipos-acciones';
  }

  // METODO PARA ABRIR DATOS DE TIPO DE ACCION
  ver_datos: boolean = false;
  accion_id: number;
  AbrirDatosAccion(id: number) {
    this.ver_lista = false;
    this.ver_datos = true;
    this.accion_id = id;
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
  Datos_tipoAccion_personal: any;
  listaTipoAccionesCorrectas: any = [];
  listaTipoAccionesCorrectasCont: number;
  // METODO PARA VERIFICAR DATOS DE PLANTILLA
  VerificarPlantilla() {
    this.listaTipoAccionesCorrectas = [];
    let formData = new FormData();
    
    for (let i = 0; i < this.archivoSubido.length; i++) {
      formData.append("uploads", this.archivoSubido[i], this.archivoSubido[i].name);
    }

    // VERIFICACION DE DATOS FORMATO - DUPLICIDAD DENTRO DEL SISTEMA
    this.rest.RevisarFormato(formData).subscribe(res => {
      this.Datos_tipoAccion_personal = res.data;
        this.messajeExcel = res.message;

      if (this.messajeExcel == 'error') {
        this.toastr.error('Revisar que la numeración de la columna "item" sea correcta.', 'Plantilla no aceptada.', {
          timeOut: 4500,
        });
        this.mostrarbtnsubir = false;
      }
      else if (this.messajeExcel == 'no_existe') {
        this.toastr.error('No se ha encontrado pestaña procesos en la plantilla.', 'Plantilla no aceptada.', {
          timeOut: 4500,
        });
        this.mostrarbtnsubir = false;
      }
      else {

        this.Datos_tipoAccion_personal.sort((a: any, b: any) => {
          if (a.observacion !== 'ok' && b.observacion === 'ok') {
            return -1;
          }
          if (a.observacion === 'ok' && b.observacion !== 'ok') {
            return 1;
          }
          return 0;
        });

        this.Datos_tipoAccion_personal.forEach((item: any) => {
          if (item.observacion.toLowerCase() == 'ok') {
            this.listaTipoAccionesCorrectas.push(item);
          }
        });
        this.listaTipoAccionesCorrectasCont = this.listaTipoAccionesCorrectas.length;
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
            this.RegistrarAcciones();
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
    } else if (observacion == 'Ya existe el detalle de la accion personal en el sistema') {
      return 'rgb(239, 203, 106)';
    } else if (observacion  == 'Registro cruzado' ||
      observacion == 'No existe el tipo de accion en el sistema'
    ) {
      return 'rgb(238, 21, 242)';
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
   RegistrarAcciones() {
    console.log('listaProcesosCorrectas: ',this.listaTipoAccionesCorrectas.length)
    if (this.listaTipoAccionesCorrectas?.length > 0) {
      const data = {
        plantilla: this.listaTipoAccionesCorrectas,
        user_name: this.user_name,
        ip: this.ip, ip_local: this.ips_locales
      }
      this.rest.RegistrarPlantilla(data).subscribe({
        next: (response: any) => {
          this.toastr.success('Plantilla de Tipo de accion personal importada.', 'Operación exitosa.', {
            timeOut: 5000,
          });
          if (this.listaTipoAccionesCorrectas?.length > 0) {
            setTimeout(() => {
              this.ngOnInit();
            }, 500);
          }
          this.LimpiarCampos();
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


  /******************************************************************************************************
 *                                         METODO PARA EXPORTAR A PDF
 ******************************************************************************************************/


  async GenerarPdf(action = 'open') {
    const pdfMake = await this.validar.ImportarPDF();
    const documentDefinition = this.DefinirInformacionPDF();
    switch (action) {
      case 'open': pdfMake.createPdf(documentDefinition).open(); break;
      case 'print': pdfMake.createPdf(documentDefinition).print(); break;
      case 'download': pdfMake.createPdf(documentDefinition).download(); break;
      default: pdfMake.createPdf(documentDefinition).open(); break;
    }

  }

  DefinirInformacionPDF() {

    return {

      // ENCABEZADO DE LA PAGINA
      pageSize: 'A4',
      pageOrientation: 'landscape',
      watermark: { text: this.frase, color: 'blue', opacity: 0.1, bold: true, italics: false },
      header: { text: 'Impreso por:  ' + this.empleado[0].nombre + ' ' + this.empleado[0].apellido, margin: 10, fontSize: 9, opacity: 0.3, alignment: 'right' },

      // PIE DE PAGINA
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
        { image: this.logo, width: 100, margin: [10, -25, 0, 5] },
        { text: localStorage.getItem('name_empresa')?.toUpperCase(), bold: true, fontSize: 14, alignment: 'center', margin: [0, -30, 0, 5] },
        { text: 'LISTA DE TIPOS DE ACCIONES DE PERSONAL', bold: true, fontSize: 12, alignment: 'center', margin: [0, 0, 0, 0] },
        this.presentarDataPDFTipoPermisos(),
      ],
      styles: {
        tableHeader: { fontSize: 9, bold: true, alignment: 'center', fillColor: this.p_color },
        itemsTable: { fontSize: 8, alignment: 'center', },
        tableMarginCabecera: { margin: [0, 10, 0, 0] },
      }
    };
  }

  presentarDataPDFTipoPermisos() {
    return {
      columns: [
        { width: '*', text: '' },
        {
          width: 'auto',
          style: 'tableMarginCabecera',
          table: {
            widths: ['auto', '*', '*', '*', '*'],
            body: [
              [
                { text: 'CÓDIGO', style: 'tableHeader' },
                { text: 'TIPO DE ACCIÓN DE PERSONAL', style: 'tableHeader' },
                { text: 'DESCRIPCIÓN', style: 'tableHeader' },
                { text: 'BASE LEGAL', style: 'tableHeader' },
                { text: 'TIPO', style: 'tableHeader' },
              ],
              ...this.tipo_acciones.map((obj: any) => {
                return [
                  { text: obj.id, style: 'itemsTable' },
                  { text: obj.nombre, style: 'itemsTable' },
                  { text: obj.descripcion, style: 'itemsTable' },
                  { text: obj.base_legal, style: 'itemsTable' },
                  { text: (obj.tipo_permiso == true ? 'Permiso' : obj.tipo_vacacion == true ? 'Vacación' : 'Situación propuesta'), style: 'itemsTable' },
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
  async exportToExcel() {  
      var f = DateTime.now();
      let fecha = f.toFormat('yyyy-MM-dd');
      let hora = f.toFormat('HH:mm:ss');
  
      let fechaHora = 'Fecha: ' + fecha + ' Hora: ' + hora;

      console.log('this.tipo_acciones: ',this.tipo_acciones);
  
      const tipo_acciones_perso: any[] = [];
      this.tipo_acciones.forEach((accion: any, index: number) => {
    
        tipo_acciones_perso.push([
          index + 1,
          accion.nombre,
          accion.descripcion,
          accion.base_legal
        ]);
      });
  
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Tipos accion personal");
  
  
      console.log("ver logo. ", this.logo)
      this.imagen = workbook.addImage({
        base64: this.logo,
        extension: "png",
      });
  
      worksheet.addImage(this.imagen, {
        tl: { col: 0, row: 0 },
        ext: { width: 250, height: 100 },
      });

      //APLICAR ESTILOS DE WIDTH (ANCHO) A LA COLUMNAS
      worksheet.getColumn('A').width = 2;
      worksheet.getColumn('B').width = 10;
      worksheet.getColumn('C').width = 10;
      worksheet.getColumn('D').width = 10;
      worksheet.getColumn('F').width = 10;
      worksheet.getColumn('G').width = 10;
      worksheet.getColumn('H').width = 2;
      worksheet.getColumn('I').width = 1;
      worksheet.getColumn('J').width = 10;
      worksheet.getColumn('P').width = 2;

      worksheet.getRow(1).height = 70;
      worksheet.getRow(2).height = 13;
      worksheet.getRow(3).height = 40;
      worksheet.getRow(5).height = 40;
      worksheet.getRow(6).height = 40;
      worksheet.getRow(7).height = 40;
      worksheet.getRow(8).height = 30;
      worksheet.getRow(10).height = 40;
      worksheet.getRow(11).height = 40;
      worksheet.getRow(12).height = 15;
      worksheet.getRow(21).height = 14;
      worksheet.getRow(22).height = 40;
      worksheet.getRow(23).height = 200;
      worksheet.getRow(24).height = 40;
      worksheet.getRow(25).height = 15;
      worksheet.getRow(45).height = 40;

      // COMBINAR CELDAS
      worksheet.mergeCells("A1:J5");
      worksheet.mergeCells("K1:P1");
      worksheet.mergeCells("K2:P2");
      worksheet.mergeCells("K3:L3");
      worksheet.mergeCells("M3:P3");
      worksheet.mergeCells("K4:P4");
      worksheet.mergeCells("K5:P5");
      worksheet.mergeCells("A6:H6");
      worksheet.mergeCells("I6:P6");
      worksheet.mergeCells("A7:H7");
      worksheet.mergeCells("I7:P7");
      worksheet.mergeCells("A8:D9");
      worksheet.mergeCells("E8:H9");
      worksheet.mergeCells("I8:P8");
      worksheet.mergeCells("I9:L9");
      worksheet.mergeCells("M9:P9");
      worksheet.mergeCells("A10:D10");
      worksheet.mergeCells("E10:H10");
      worksheet.mergeCells("I10:L10");
      worksheet.mergeCells("M10:P10");
      worksheet.mergeCells("A11:P11");

      // COMBINAR CELDAS PARA LOS CHECKBOX
      worksheet.mergeCells("A12:P12");
      worksheet.mergeCells("A13:A19");
      worksheet.mergeCells("P13:P19");
      worksheet.mergeCells("A21:P21");
      worksheet.mergeCells("A22:P22");

      worksheet.mergeCells("B13:C13");
      worksheet.mergeCells("B14:C14");
      worksheet.mergeCells("B15:C15");
      worksheet.mergeCells("B16:C16");
      worksheet.mergeCells("B17:C17");
      worksheet.mergeCells("B18:C18");

      worksheet.mergeCells("E13:F13");
      worksheet.mergeCells("E14:F14");
      worksheet.mergeCells("E15:F15");
      worksheet.mergeCells("E16:F16");
      worksheet.mergeCells("E17:F17");
      worksheet.mergeCells("E18:F18");

      worksheet.mergeCells("J13:K13");
      worksheet.mergeCells("J14:K14");
      worksheet.mergeCells("J15:K15");
      worksheet.mergeCells("J16:K16");
      worksheet.mergeCells("J17:K17");
      worksheet.mergeCells("J18:K18");

      worksheet.mergeCells("M13:N13");
      worksheet.mergeCells("M14:N14");
      worksheet.mergeCells("M15:O15");
      worksheet.mergeCells("M16:O16");
      worksheet.mergeCells("M17:O17");
      worksheet.mergeCells("M18:O18");

      worksheet.mergeCells("B19:F19");
      worksheet.mergeCells("G19:O19");

      worksheet.mergeCells("H20:I20");
      worksheet.mergeCells("M20:P20");
      worksheet.mergeCells("A23:P23");
      worksheet.mergeCells("A24:H24");
      worksheet.mergeCells("I24:P24");
      worksheet.mergeCells("A25:P25");

      worksheet.mergeCells("A26:H26");
      worksheet.mergeCells("I26:P26");
      worksheet.mergeCells("A27:H27");
      worksheet.mergeCells("I27:P27");
      worksheet.mergeCells("A28:H28");
      worksheet.mergeCells("I28:P28");
      worksheet.mergeCells("A29:H29");
      worksheet.mergeCells("I29:P29");
      worksheet.mergeCells("A30:H30");
      worksheet.mergeCells("I30:P30");
      worksheet.mergeCells("A31:H31");
      worksheet.mergeCells("I31:P31");
      worksheet.mergeCells("A32:H32");
      worksheet.mergeCells("I32:P32");
      worksheet.mergeCells("A33:H33");
      worksheet.mergeCells("I33:P33");
      worksheet.mergeCells("A34:H34");
      worksheet.mergeCells("I34:P34");
      worksheet.mergeCells("A35:H35");
      worksheet.mergeCells("I35:P35");
      worksheet.mergeCells("A36:H36");      
      worksheet.mergeCells("I36:P36");
      worksheet.mergeCells("A37:H37");
      worksheet.mergeCells("I37:P37");
      worksheet.mergeCells("A38:H38");
      worksheet.mergeCells("I38:P38");
      worksheet.mergeCells("A39:H39");
      worksheet.mergeCells("I39:P39");
      worksheet.mergeCells("A40:H40");
      worksheet.mergeCells("I40:P40");
      worksheet.mergeCells("A41:H41");
      worksheet.mergeCells("I41:P41");
      worksheet.mergeCells("A42:H42");
      worksheet.mergeCells("I42:P42");
      worksheet.mergeCells("A43:H44");
      worksheet.mergeCells("I43:P44");
      worksheet.mergeCells("A45:P45");
      worksheet.mergeCells("A46:P46");
      worksheet.mergeCells("A47:A53");
      worksheet.mergeCells("P47:P53");
      worksheet.mergeCells("C47:D47");
      worksheet.mergeCells("A54:P54");
      worksheet.mergeCells("A55:P55");


  
      // AGREGAR LOS VALORES A LAS CELDAS COMBINADAS
      //worksheet.getCell("K1").value = localStorage.getItem('name_empresa')?.toUpperCase();
      worksheet.getCell("K1").value = "Acción de Personal".toUpperCase();
      worksheet.getCell("K3").value = "Nro.";
      worksheet.getCell("K4").value = "Fecha de elaboración".toUpperCase();
      worksheet.getCell("A6").value = "apellidos".toUpperCase();
      worksheet.getCell("I6").value = "nombres".toUpperCase();
      worksheet.getCell("A8").value = "documento de identificación".toUpperCase();
      worksheet.getCell("E8").value = "nro. de identifiación".toUpperCase();
      worksheet.getCell("I8").value = "rige:".toUpperCase();
      worksheet.getCell("I9").value = "Desde ".toUpperCase()+"(dd-mm-aaaa)"
      worksheet.getCell("M9").value = "Hasta ".toUpperCase()+"(dd-mm-aaaa)(cuando aplica)"
      worksheet.getCell("A11").value = "Escoja una opción (según lo estipulado en el artículo 21 del Reglamento General a la Ley Orgánica del Servicio Público)"
      
      
      worksheet.getCell("B13").value = "ingreso".toUpperCase()
      worksheet.getCell("B14").value = "reingreso".toUpperCase()
      worksheet.getCell("B15").value = "restitución".toUpperCase()
      worksheet.getCell("B16").value = "reintegro".toUpperCase()
      worksheet.getCell("B17").value = "ascenso".toUpperCase()
      worksheet.getCell("B18").value = "traslado".toUpperCase()

      worksheet.getCell("E13").value = "traspaso".toUpperCase()
      worksheet.getCell("E14").value = "cambio administrativo".toUpperCase()
      worksheet.getCell("E15").value = "itercambio voluntario".toUpperCase()
      worksheet.getCell("E16").value = "licencia".toUpperCase()
      worksheet.getCell("E17").value = "comisión de servicios".toUpperCase()
      worksheet.getCell("E18").value = "sanciones".toUpperCase()

      worksheet.getCell("J13").value = "incremento rmu".toUpperCase()
      worksheet.getCell("J14").value = "subrogación".toUpperCase()
      worksheet.getCell("J15").value = "encargo".toUpperCase()
      worksheet.getCell("J16").value = "cesación de funciones".toUpperCase()
      worksheet.getCell("J17").value = "destitución".toUpperCase()
      worksheet.getCell("J18").value = "vacaciones".toUpperCase()

      worksheet.getCell("M13").value = "revisión clasi. puesto".toUpperCase()
      worksheet.getCell("M14").value = "otro (detallar)".toUpperCase()

      worksheet.getCell("B19").value = "EN CASO DE REQUERIR ESPECIFICACIÓN DE LO SELECCIONADO: ".toUpperCase()
      worksheet.getCell("B20").value = " * PRESENTÓ LA DECLARACIÓN JURADA (número 2 del art. 3 RLOSEP) "
      worksheet.getCell("H20").value = "SI"
      worksheet.getCell("K20").value = "NO APLICA"
      worksheet.getCell("B22").value = "   MOTIVACIÓN: (adjuntar anexo si lo posee) "

      worksheet.getCell("A23").value = "(Explicar el motivo por el cual se está colocando el movimiento escogido en el anterior paso)"
      worksheet.getCell("A24").value = "SITUACION ACTUAL"
      worksheet.getCell("I24").value = "SITUACION PROPUESTA"

      worksheet.getCell("A26").value = "  PROCESO INSTITUCIONAL: (ESCOGER DE LA LISTA DESPLEGABLE)"
      worksheet.getCell("I26").value = "  PROCESO INSTITUCIONAL: (ESCOGER DE LA LISTA DESPLEGABLE)"
      worksheet.getCell("A28").value = "  NIVEL DE GESTIÓN: (VICEMINISTERIO, SUBSECRETARÍA, COORDINACIÓN, ETC)"
      worksheet.getCell("I28").value = "  NIVEL DE GESTIÓN: (VICEMINISTERIO, SUBSECRETARÍA, COORDINACIÓN, ETC)"
      worksheet.getCell("A30").value = "  UNIDAD ADMINISTRATIVA: (UNIDAD, GESTIÓN INTERNA)"
      worksheet.getCell("I30").value = "  UNIDAD ADMINISTRATIVA: (UNIDAD, GESTIÓN INTERNA)"
      worksheet.getCell("A32").value = "  LUGAR DE TRABAJO: (CIUDAD)"
      worksheet.getCell("I32").value = "  LUGAR DE TRABAJO: (CIUDAD)"
      worksheet.getCell("A34").value = "  DENOMINACIÓN DEL PUESTO:"
      worksheet.getCell("I34").value = "  DENOMINACIÓN DEL PUESTO:"
      worksheet.getCell("A36").value = "  GRUPO OCUPACIONAL:"
      worksheet.getCell("I36").value = "  GRUPO OCUPACIONAL:"
      worksheet.getCell("A38").value = "  GRADO:"
      worksheet.getCell("I38").value = "  GRADO:"
      worksheet.getCell("A40").value = "  REMUNERACIÓN MENSUAL:"
      worksheet.getCell("I40").value = "  REMUNERACIÓN MENSUAL:"
      worksheet.getCell("A42").value = "  PARTIDA INDIVIDUAL:"
      worksheet.getCell("I42").value = "  PARTIDA INDIVIDUAL:"
      worksheet.getCell("A45").value = "  POSESIÓN DEL PUESTO:"
      worksheet.getCell("B47").value = "  YO,  "


      // Definir la validación de datos (lista desplegable)
      worksheet.getCell("D13").dataValidation = {
        type: "list",
        allowBlank: true,
        formulae: ["✔", "✘"], // Opciones: Marcado (✔) o No marcado (✘)
      };



      //DAMOS EL ESTILO DE BORDES A LAS CELDAS
      const borderStyle: Partial<ExcelJS.Borders> = {
        top: { style: "thin", color: { argb: "000000" } }, // Borde superior negro
        left: { style: "thin", color: { argb: "000000" } }, // Borde izquierdo negro
        bottom: { style: "thin", color: { argb: "000000" } }, // Borde inferior negro
        right: { style: "thin", color: { argb: "000000" } }, // Borde derecho negro
      };

      const borderRightStyle: Partial<ExcelJS.Borders> = {
        right: { style: "thin", color: { argb: "000000" } }, // Borde derecho negro
      };

      const borderbottomStyle: Partial<ExcelJS.Borders> = {
        bottom: { style: "thin", color: { argb: "000000" } }, // Borde derecho negro
      };

      //DAMOS EL ESTILO DE BACKGROUND COLOR A LAS CELDAS
      const backgroundColorStyle: ExcelJS.FillPattern  = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "F2F1EC" }, // Amarillo (puedes cambiarlo por otro color)
      };

      const backgroundColorStyleWhite: ExcelJS.FillPattern  = {
        type: "pattern",
        pattern: "solid",
        bgColor: { argb: "FFFFFF" },
        fgColor: { argb: "FFFFFF" }, // BLANCO (puedes cambiarlo por otro color)
      };

      const totalFilas = 55; // Empieza en la fila 6 (donde comienza la tabla)
      const totalColumnas = 16; // Número de columnas en la tabla

      for (let i = 0; i <= totalFilas; i++) {
        for (let j = 1; j <= totalColumnas; j++) {
          const cell = worksheet.getRow(i).getCell(j);

          if(i <= 11 || i == 22 || i == 23 || i == 24 || i == 25 || i == 45 || i == 55){
            cell.border = borderStyle; // Aplicar bordes negros
          }else if((i >= 12 && i <= 21 && j == 16) || (i >= 26 && i <= 44) || (i >= 46 && i <= 54 && j == 16)){
            cell.border = borderRightStyle
          }else if(i >= 15 && i <= 18 && j >= 13 && j <= 15){
            cell.border = borderbottomStyle
          }

          if(i == 19 && j >= 7 && j <= 15){
            cell.border = borderbottomStyle
          }else if(i == 47 && j >= 3 && j <= 7){
            cell.border = borderbottomStyle
          }
          
          if((i == 1 && j >= 11) || 
            (i == 3 && (j >= 11 && j < 13)) || 
            (i == 4 && j >= 11) || (i == 6) ||  
            (i >= 8 && i <= 9) || (i == 11) ||
            (i == 22) ||
            (i == 20 && j >= 2 && j<= 12) ||
            (i == 24) ||
            (i == 26) || (i == 28) || (i == 30) || (i == 32) || (i == 34) || 
            (i == 36) || (i == 38) || (i == 40) || (i == 42) || (i == 45) || (i == 55)
          ){
            cell.fill = backgroundColorStyle; // Aplicar color de fondo
          }

          if((i >= 13 && i <= 19) || (i >= 46 && i <= 54) ){
            cell.fill = backgroundColorStyleWhite
          }

          if (i === 0) {
            cell.alignment = { vertical: "middle", horizontal: "center" };
          } else {
            cell.alignment = {
              vertical: "middle",
              //horizontal: this.obtenerAlineacionHorizontalEmpleados(j),
            };
          }
          
        }
      }
      
      // APLICAR ESTILO DE CENTRADO Y NEGRITA A LAS CELDAS COMBINADAS
      ["A1", "K1", "K3", "K4", "A6", "I6", "A8", "A9", "E8", "E9", "I8", "I9", "M9", "A11", "A22", "A23","A24", "I24", 
        "B13", "B14", "B15", "B16", "B17", "B18", "B19", "B20", "E13", "E14", "E15", "E16", "E17", "E18", "J13", "J14", 
        "J15", "J16", "J17", "J18", "M13", "M14", "H20", "K20",
        "A26", "I26", "A27", "I27", "A28", "I28", "A29", "I29", "A30", "I30", "A32", "I32", "A34", "I34", "A36", "I36", 
        "A38", "I38", "A40", "I40", "A42", "I42", "A44", "I44", "A45"
      ].forEach((cell) => {
        if (
          cell != 'B13' && cell != 'B14' && cell != 'B15' && cell != 'B16' && cell != 'B17' && cell != 'B18' &&
          cell != 'B19' && cell != 'B20' && cell != 'E13' && cell != 'E14' && cell != 'E15' && cell != 'E16' &&
          cell != 'E17' && cell != 'E18' && cell != 'J13' && cell != 'J14' && cell != 'J15' && cell != 'J16' &&
          cell != 'J17' && cell != 'J18' && cell != 'M13' && cell != 'M14' && 
          cell != 'A22' && cell != 'A26' && cell != 'I26' && cell != 'A27' && cell != 'I27' &&
          cell != 'A28' && cell != 'I28' && cell != 'A29' && cell != 'I29' && cell != 'A30' && cell != 'I30' &&
          cell != 'A32' && cell != 'I32' && cell != 'A34' && cell != 'I34' && cell != 'A36' && cell != 'I36' && 
          cell != 'A38' && cell != 'I38' && cell != 'A40' && cell != 'I40' && cell != 'A42' && cell != 'I42' &&
          cell != 'A44' && cell != 'I44' && cell != 'A45'
        ){
          worksheet.getCell(cell).alignment = {
            horizontal: "center",
            vertical: "middle",
          };
        }

        if(cell == 'K1'){
          worksheet.getCell(cell).font = { bold: true, size: 18 };
        }else if(cell == "A8" || cell == 'A9' ||
                cell == "K3" || cell == 'K4' || 
                cell == 'A6' || cell == 'I6' || 
                cell == 'I8' || cell == 'I9' ||
                cell == 'E8' || cell == 'E9' ||
                cell == 'M9' || cell == "A11" || cell == 'A22' ||
                cell == 'A24' || cell == "I24" ||
                cell == 'A26' || cell == "I26" ||
                cell == 'A27' || cell == "I27" ||
                cell == 'A28' || cell == "I28" ||
                cell == 'A29' || cell == "I29" ||
                cell == 'A30' || cell == "I30" ||
                cell == 'A32' || cell == "I32" ||
                cell == 'A34' || cell == "I34" ||
                cell == 'A36' || cell == "I36" ||
                cell == 'A38' || cell == "I38" ||
                cell == 'A40' || cell == "I40" ||
                cell == 'A42' || cell == "I42" ||
                cell == 'A44' || cell == "I44" ||
                cell == 'A45'
              ){
          worksheet.getCell(cell).font = { bold: true, size: 9 };
        }else{
          worksheet.getCell(cell).font = { size: 9 };
        }
          
      });

      worksheet.getCell('A1').alignment = {
          horizontal: "center",
          vertical: "middle",
      };
  
  
      const columnas = [
        { name: "ITEM", totalsRowLabel: "Total:", filterButton: false },
        { name: "NOMBRE", totalsRowLabel: "Total:", filterButton: true },
        { name: "DESCRIPCION", totalsRowLabel: "Total:", filterButton: true },
        { name: "BASE LEGAL", totalsRowLabel: "Total:", filterButton: true },
      ];
      console.log("ver tipo_acciones_perso", tipo_acciones_perso);
      console.log("Columnas:", columnas);
  
      worksheet.addTable({
        name: "Tipo accion personal",
        ref: "A60",
        headerRow: true,
        totalsRow: false,
        style: {
          theme: "TableStyleMedium16",
          showRowStripes: true,
        },
        columns: columnas,
        rows: tipo_acciones_perso,
      });
  
      try {
        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: "application/octet-stream" });
        FileSaver.saveAs(blob, "tipo_acciones_personal.xlsx");
      } catch (error) {
        console.error("Error al generar el archivo Excel:", error);
      }
  }

    private obtenerAlineacionHorizontalEmpleados(
      j: number
    ): "left" | "center" | "right" {
      if (j === 1 || j === 9 || j === 10 || j === 11) {
        return "center";
      } else {
        return "left";
      }
    }

  /** ************************************************************************************************** **
   ** **                                   METODO PARA EXPORTAR A CSV                                 ** **
   ** ************************************************************************************************** **/

  exportToCVS() {
    /*
    const wse: xlsx.WorkSheet = xlsx.utils.json_to_sheet(this.tipo_acciones);
    const csvDataH = xlsx.utils.sheet_to_csv(wse);
    const data: Blob = new Blob([csvDataH], { type: 'text/csv;charset=utf-8;' });
    FileSaver.saveAs(data, "TipoAccionesPersonalCSV" + new Date().getTime() + '.csv');
    */
  }

  /** ************************************************************************************************* **
   ** **                            PARA LA EXPORTACION DE ARCHIVOS XML                               ** **
   ** ************************************************************************************************* **/

  urlxml: string;
  data: any = [];
  exportToXML() {
    var objeto;
    var arregloTipoAcciones: any = [];
    this.tipo_acciones.forEach((obj: any) => {
      objeto = {
        "tipo_accion_personal": {
          '@id': obj.id,
          "nombre": obj.nombre,
          "descripcion": obj.descripcion,
          "base_legal": obj.base_legal,
          "tipo_permiso": obj.tipo_permiso == true ? 'Permiso' : obj.tipo_vacacion == true ? 'Vacación' : 'Situación propuesta'
        }
      }
      arregloTipoAcciones.push(objeto)
    });
    this.rest.CrearXML(arregloTipoAcciones).subscribe(res => {
      this.data = res;
      this.urlxml = `${environment.url}/departamento/download/` + this.data.name;
      window.open(this.urlxml, "_blank");
    });
  }
}
