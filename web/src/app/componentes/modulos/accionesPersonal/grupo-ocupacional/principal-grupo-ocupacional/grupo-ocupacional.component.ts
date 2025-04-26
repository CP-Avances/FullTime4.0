import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { FormControl, Validators } from '@angular/forms';
import { SelectionModel } from '@angular/cdk/collections';
import { ToastrService } from 'ngx-toastr';
import { MatDialog } from '@angular/material/dialog';
import { DateTime } from 'luxon';
import { Router } from '@angular/router';

import { MetodosComponent } from 'src/app/componentes/generales/metodoEliminar/metodos.component';
import { RegistrarGrupoOcupacionalComponent } from '../registrar-grupo-ocupacional/registrar-grupo-ocupacional.component';
import { EditarGrupoOcupacionalComponent } from '../editar-grupo-ocupacional/editar-grupo-ocupacional.component';

import { EmpleadoService } from 'src/app/servicios/usuarios/empleado/empleadoRegistro/empleado.service';
import { MainNavService } from 'src/app/componentes/generales/main-nav/main-nav.service';
import { EmpresaService } from 'src/app/servicios/configuracion/parametrizacion/catEmpresa/empresa.service';
import { ValidacionesService } from 'src/app/servicios/generales/validaciones/validaciones.service';
import { CatGrupoOcupacionalService } from 'src/app/servicios/modulos/modulo-acciones-personal/catGrupoOcupacional/cat-grupo-ocupacional.service';


import ExcelJS, { FillPattern } from "exceljs";
import * as xml2js from 'xml2js';
import * as FileSaver from 'file-saver';
import { FillPatterns } from 'exceljs';

@Component({
  selector: 'app-grupo-ocupacional',
  standalone: false,
  templateUrl: './grupo-ocupacional.component.html',
  styleUrl: './grupo-ocupacional.component.css'
})

export class GrupoOcupacionalComponent implements OnInit {

  buscarGrupo = new FormControl('', [Validators.minLength(2)]);
  archivoForm = new FormControl('', Validators.required);

  ListGrupoOcupacional: any

  private bordeCompleto!: Partial<ExcelJS.Borders>;
  private bordeGrueso!: Partial<ExcelJS.Borders>;
  private fillAzul!: FillPatterns;
  private fontTitulo!: Partial<ExcelJS.Font>;
  private imagen: any;

  // VARIABLES PARA AUDITORIA
  user_name: string | null;
  ip: string | null;
  ips_locales: any = '';

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
  grupoOcupacionalEliminar: any = [];

  constructor(
    private funciones: MainNavService,
    private _GrupoOp: CatGrupoOcupacionalService,
    private validar: ValidacionesService,
    private toastr: ToastrService,
    private router: Router,
    public restE: EmpleadoService,
    public ventana: MatDialog,
    public restEmpre: EmpresaService,
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
      this.OptenerListaGrupoOcupacional();
      this.ObtenerEmpleados(this.idEmpleado);
      this.ObtenerLogo();
      this.ObtenerColores();
    }
  }

  LimpiarCampos() {
    this.archivoSubido = [];
    this.nameFile = '';
    this.archivoForm.reset();
    this.Datos_gruposOcupacional = null;
    this.messajeExcel = '';
    this.buscarGrupo.reset();
    this.OptenerListaGrupoOcupacional();
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

  OptenerListaGrupoOcupacional() {
    this.ListGrupoOcupacional = []
    this._GrupoOp.ConsultarGrupoOcupacion().subscribe({
      next: (respuesta: any) => {
        this.ListGrupoOcupacional = respuesta
      }, error: (err) => {
        this.toastr.error(err.error.message, 'Ups!!! se ha producido un error.', {
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
    const numRows = this.ListGrupoOcupacional.length;
    return numSelected === numRows;
  }

  // SELECCIONA TODAS LAS FILAS SI NO ESTÁN TODAS SELECCIONADAS; DE LO CONTRARIO, SELECCION CLARA.
  masterToggle() {
    this.isAllSelected() ?
      this.selectionUno.clear() :
      this.ListGrupoOcupacional.forEach((row: any) => this.selectionUno.select(row));
  }

  // LA ETIQUETA DE LA CASILLA DE VERIFICACION EN LA FILA PASADA
  checkboxLabel(row?: any): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    this.grupoOcupacionalEliminar = this.selectionUno.selected;
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


  //METODO PARA ABRIR VENTANA EDITAR GRUPO OCUPACIONAL
  AbrirVentanaRegistrarGrupo() {
    //console.log(datosSeleccionados);
    this.ventana.open(RegistrarGrupoOcupacionalComponent,
      { width: '450px' }).afterClosed().subscribe(items => {
        this.OptenerListaGrupoOcupacional();
      });
  }

  // METODO PARA ABRIR VENTANA EDITAR GRUPO OCUPACIONAL
  AbrirVentanaEditar(datosSeleccionados: any): void {
    //console.log(datosSeleccionados);
    this.ventana.open(EditarGrupoOcupacionalComponent,
      {
        width: '450px', data: datosSeleccionados
      }).afterClosed().subscribe(items => {
        this.OptenerListaGrupoOcupacional();
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
          this.router.navigate(['/grupo-ocupacional']);
        }
      });
  }
  // FUNCION PARA ELIMINAR REGISTROS
  Eliminar(id_grupo: number) {
    let dataGrupo = {
      id_grupo: id_grupo,
      user_name: this.user_name,
      ip: this.ip, ip_local: this.ips_locales
    };

    this._GrupoOp.ElminarGrupoOcupacion(dataGrupo).subscribe((res: any) => {
      if (res.codigo != 200) {
        this.toastr.error('No se completo el proceso.', 'No fue posible eliminar.', {
          timeOut: 6000,
        });
      } else {
        this.toastr.error('Registro eliminado.', '', {
          timeOut: 6000,
        });
        this.OptenerListaGrupoOcupacional();
      }
    }, (error: any) => {
      this.toastr.warning(error.error.message, 'No fue posible eliminar.', {
        timeOut: 6000,
      });
    });
  }

  // METODO PARA CONFIRMAR ELIMINACION MULTIPLE
  ConfirmarDeleteMultiple() {
    this.ventana.open(MetodosComponent, { width: '450px' }).afterClosed()
      .subscribe((confirmado: Boolean) => {
        if (confirmado) {
          if (this.grupoOcupacionalEliminar.length != 0) {
            this.EliminarMultiple();
            this.btnCheckHabilitar = false;
            this.grupoOcupacionalEliminar = [];
            this.selectionUno.clear();
          } else {
            this.toastr.warning('No ha seleccionado registros.', 'Ups!!! algo salio mal.', {
              timeOut: 6000,
            })
          }
        }
      });
  }
  EliminarMultiple() {
    const data = {
      listaEliminar: this.grupoOcupacionalEliminar,
      user_name: this.user_name,
      ip: this.ip, ip_local: this.ips_locales
    }

    this._GrupoOp.EliminarGrupoMult(data).subscribe({
      next: (response: any) => {
        console.log('response: ', response)
        this.toastr.error(response.message, 'Operación exitosa.', {
          timeOut: 4500,
        });
        if (response.relacionados > 0) {
          response.listaNoEliminados.forEach(item => {
            this.toastr.warning(response.ms2 + ' ' + item.trim(), 'Advertencia.', {
              timeOut: 5000,
            });
          });

        }

        this.ngOnInit();
      }, error: (err) => {
        if (err.status == 300) {
          this.toastr.error(err.error.message, '', {
            timeOut: 4500,
          });
          this.toastr.warning(err.error.ms2, 'Advertencia.', {
            timeOut: 5000,
          });
        } else {
          this.toastr.error(err.error.message, 'Ups !!! algo salio mal.', {
            timeOut: 4000,
          });
        }
      },
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
  Datos_gruposOcupacional: any
  listaGrupoOcupacionalCorrectas: any = [];
  listaGrupoOcupaciCorrectasCont: number;
  // METODO PARA VERIFICAR DATOS DE PLANTILLA
  VerificarPlantilla() {
    this.listaGrupoOcupacionalCorrectas = [];
    let formData = new FormData();

    for (let i = 0; i < this.archivoSubido.length; i++) {
      formData.append("uploads", this.archivoSubido[i], this.archivoSubido[i].name);
    }

    // VERIFICACION DE DATOS FORMATO - DUPLICIDAD DENTRO DEL SISTEMA
    this._GrupoOp.RevisarFormato(formData).subscribe(res => {
      this.Datos_gruposOcupacional = res.data;
      this.messajeExcel = res.message;

      if (this.messajeExcel == 'error') {
        this.toastr.error('Revisar que la numeración de la columna "item" sea correcta.', 'Plantilla no aceptada.', {
          timeOut: 4500,
        });
        this.mostrarbtnsubir = false;
      }
      else if (this.messajeExcel == 'no_existe') {
        this.toastr.error('No se ha encontrado pestaña GRUPO_OCUPACIONAL en la plantilla.', 'Plantilla no aceptada.', {
          timeOut: 4500,
        });
        this.mostrarbtnsubir = false;
      }
      else {

        this.Datos_gruposOcupacional.sort((a: any, b: any) => {
          if (a.observacion !== 'ok' && b.observacion === 'ok') {
            return -1;
          }
          if (a.observacion === 'ok' && b.observacion !== 'ok') {
            return 1;
          }
          return 0;
        });

        this.Datos_gruposOcupacional.forEach((item: any) => {
          if (item.observacion.toLowerCase() == 'ok') {
            this.listaGrupoOcupacionalCorrectas.push(item);
          }
        });
        this.listaGrupoOcupaciCorrectasCont = this.listaGrupoOcupacionalCorrectas.length;
      }
    }, error => {
      this.toastr.error('Error al cargar los datos.', 'Plantilla no aceptada.', {
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
    } else if (observacion == 'Grupo Ocupacional ya existe en el sistema'
    ) {
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
          this.RegistrarGrupoOcupacional();
        }
      });
  }

  RegistrarGrupoOcupacional() {
    console.log('listaGrupoOcupacionalCorrectas: ', this.listaGrupoOcupacionalCorrectas.length)
    if (this.listaGrupoOcupacionalCorrectas?.length > 0) {
      const data = {
        plantilla: this.listaGrupoOcupacionalCorrectas,
        user_name: this.user_name,
        ip: this.ip, ip_local: this.ips_locales
      }

      this._GrupoOp.RegistrarPlantilla(data).subscribe({
        next: (response: any) => {
          this.toastr.success('Plantilla de Grupo Ocupacional importada.', 'Operación exitosa.', {
            timeOut: 5000,
          });
          if (this.listaGrupoOcupacionalCorrectas?.length > 0) {
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



  /** ************************************************************************************************** **
       ** **                               METODO PARA EXPORTAR A PDF                                     ** **
       ** ************************************************************************************************** **/


  async GenerarPdf(action = 'open') {
    const pdfMake = await this.validar.ImportarPDF();
    const documentDefinition = this.DefinirInformacionPDF();
    switch (action) {
      case 'open': pdfMake.createPdf(documentDefinition).open(); break;
      case 'print': pdfMake.createPdf(documentDefinition).print(); break;
      case 'download': pdfMake.createPdf(documentDefinition).download('GrupoOcupacional.pdf'); break;
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
        { text: 'LISTA DE GRUPO OCUPACIONAL', bold: true, fontSize: 12, alignment: 'center', margin: [10, -25, 10, 10] },
        this.presentarDataPDFGrupoOcu(),
      ],
      styles: {
        tableHeader: { fontSize: 10, bold: true, alignment: 'center', fillColor: this.p_color },
        itemsTable: { fontSize: 9 },
        itemsTableC: { fontSize: 9, alignment: 'center' }
      }
    };
  }

  presentarDataPDFGrupoOcu() {
    return {
      columns: [
        { width: '*', text: '' },
        {
          width: 'auto',
          table: {
            width: ['auto', 'auto', 'auto'],
            body: [
              [
                { text: 'CÓDIGO', style: 'tableHeader' },
                { text: 'GRUPO OCUPACIONAL', style: 'tableHeader' },
                //{ text: 'NÚMERO DE PARTIDA', style: 'tableHeader' },
              ],
              ...this.ListGrupoOcupacional.map((obj: any) => {
                return [
                  { text: obj.id, style: 'itemsTableC' },
                  { text: obj.descripcion, style: 'itemsTable' },
                  //{ text: obj.numero_partida, style: 'itemsTable' }
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
    const grupoOcupacional: any[] = [];

    console.log('this.grupoOcupacional: ', this.ListGrupoOcupacional);
    this.ListGrupoOcupacional.forEach((accion: any, index: number) => {

    grupoOcupacional.push([
        index + 1,
        accion.id,
        accion.descripcion,
        //accion.numero_partida
      ]);
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Grupo Ocupacional");

    this.imagen = workbook.addImage({
      base64: this.logo,
      extension: "png",
    });

    worksheet.addImage(this.imagen, {
      tl: { col: 0, row: 0 },
      ext: { width: 220, height: 105 },
    });

    // COMBINAR CELDAS
    worksheet.mergeCells("B1:M1");
    worksheet.mergeCells("B2:M2");
    worksheet.mergeCells("B3:M3");
    worksheet.mergeCells("B4:M4");
    worksheet.mergeCells("B5:M5");

    // AGREGAR LOS VALORES A LAS CELDAS COMBINADAS
    worksheet.getCell("B1").value = localStorage.getItem('name_empresa')?.toUpperCase();
    worksheet.getCell("B2").value = "Lista de Grupo Ocupacional".toUpperCase();

    // APLICAR ESTILO DE CENTRADO Y NEGRITA A LAS CELDAS COMBINADAS
    ["B1", "B2"].forEach((cell) => {
      worksheet.getCell(cell).alignment = {
        horizontal: "center",
        vertical: "middle",
      };
      worksheet.getCell(cell).font = { bold: true, size: 14 };
    });

    worksheet.columns = [
      { key: "n", width: 10 },
      { key: "codigo", width: 20 },
      { key: "grupo_ocupacional", width: 20 },
      //{ key: "numero_partida", width: 20 },
    ];

    const columnas = [
      { name: "ITEM", totalsRowLabel: "Total:", filterButton: false },
      { name: "CODIGO", totalsRowLabel: "Total:", filterButton: true },
      { name: "GRUPO OCUPACIONAL", totalsRowLabel: "", filterButton: true },
      //{ name: "NUMERO PARTIDA", totalsRowLabel: "", filterButton: true },
    ];
    console.log("ver Grupo Ocupacional", grupoOcupacional);
    console.log("Columnas:", columnas);

    worksheet.addTable({
      name: "GrupoOcupacional",
      ref: "A6",
      headerRow: true,
      totalsRow: false,
      style: {
        theme: "TableStyleMedium16",
        showRowStripes: true,
      },
      columns: columnas,
      rows: grupoOcupacional,
    });


    worksheet.getRow(6).font = this.fontTitulo;

    const numeroFilas = grupoOcupacional.length;
    for (let i = 0; i <= numeroFilas; i++) {
      for (let j = 1; j <= 3; j++) {
        const cell = worksheet.getRow(i + 6).getCell(j);
        if (i === 0) {
          cell.alignment = { vertical: "middle", horizontal: "center" };
        } else {
          cell.alignment = {
            vertical: "middle",
            horizontal: this.obtenerAlineacionHorizontalEmpleados(j),
          };
        }
        cell.border = this.bordeCompleto;
      }
    }

    try {
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: "application/octet-stream" });
      FileSaver.saveAs(blob, "Lista_grupoOcupacional.xlsx");
    } catch (error) {
      console.error("Error al generar el archivo Excel:", error);
    }

  }
  private obtenerAlineacionHorizontalEmpleados(j: number): "left" | "center" | "right" {
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
    var arreglo = this.ListGrupoOcupacional;
    // 1. Crear un nuevo workbook
    const workbook = new ExcelJS.Workbook();
    // 2. Crear una hoja en el workbook
    const worksheet = workbook.addWorksheet('GrupoOcupacionalCSV');
    // 3. Agregar encabezados de las columnas
    worksheet.columns = [
      { header: 'ID', key: 'id', width: 30 },
      { header: 'DESCRIPCION', key: 'descripcion', width: 15 },
      //{ header: 'NUMERO_PARTIDA', key: 'numero_partida', width: 15 },
    ];

    // 4. Llenar las filas con los datos
    arreglo.map((obj: any) => {
      worksheet.addRow({
        id: obj.id,
        descripcion: obj.descripcion,
        //numero_partida: obj.numero_partida,
      }).commit();
    });

    // 5. Escribir el CSV en un buffer
    workbook.csv.writeBuffer().then((buffer) => {
      // 6. Crear un blob y descargar el archivo
      const data: Blob = new Blob([buffer], { type: 'text/csv;charset=utf-8;' });
      FileSaver.saveAs(data, "GrupoOcupacionalCSV.csv");
    });
  }

  /** ************************************************************************************************* **
   ** **                            PARA LA EXPORTACION DE ARCHIVOS XML                               ** **
   ** ************************************************************************************************* **/

   urlxml: string;
   data: any = [];
   exportToXML() {
     
    var objeto: any;
    var arregloGrupoOcupaciona: any = [];
    console.log('this.GrupoOcupaciona: ',this.ListGrupoOcupacional)
    this.ListGrupoOcupacional.forEach((obj: any) => {
      objeto = {
        "grupo_ocupacional": {
          "$": { "id": obj.id },
          "descripcion": obj.descripcion,
          //"numero_partida": obj.numero_partida,
        }
      }
      arregloGrupoOcupaciona.push(objeto)
     });
     const xmlBuilder = new xml2js.Builder({ rootName: 'GrupoOcupacional' });
     const xml = xmlBuilder.buildObject(arregloGrupoOcupaciona);
 
     if (xml === undefined) {
       return;
     }
 
     const blob = new Blob([xml], { type: 'application/xml' });
     const xmlUrl = URL.createObjectURL(blob);
 
     // ABRIR UNA NUEVA PESTAÑA O VENTANA CON EL CONTENIDO XML
     const newTab = window.open(xmlUrl, '_blank');
     if (newTab) {
       newTab.opener = null; // EVITAR QUE LA NUEVA PESTAÑA TENGA ACCESO A LA VENTANA PADRE
       newTab.focus(); // DAR FOCO A LA NUEVA PESTAÑA
     } else {
       alert('No se pudo abrir una nueva pestaña. Asegúrese de permitir ventanas emergentes.');
     }
     const a = document.createElement('a');
     a.href = xmlUrl;
     a.download = 'GrupoOcupacional.xml';
     // SIMULAR UN CLIC EN EL ENLACE PARA INICIAR LA DESCARGA
     a.click();
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
  
  getCrearGrupoOcupacional(): boolean {
    return this.tienePermiso('Crear Grupo Ocupacional');
  }

  getEditarGrupoOcupacional(): boolean {
    return this.tienePermiso('Editar Grupo Ocupacional');
  }

  getEliminarGrupoOcupacional(): boolean {
    return this.tienePermiso('Eliminar Grupo Ocupacional');
  }

  getCargarPlantillaGrupoOcupacional(): boolean {
    return this.tienePermiso('Cargar Plantilla Grupo Ocupacional');
  }

  getDescargarReportesGrupoOcupacional(): boolean {
    return this.tienePermiso('Descargar Reportes Grupo Ocupacional');
  }

}
