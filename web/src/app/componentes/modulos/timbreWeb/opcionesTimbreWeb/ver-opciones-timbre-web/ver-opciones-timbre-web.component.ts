import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Component, Input, OnInit } from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import { ToastrService } from 'ngx-toastr';
import { PageEvent } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { DateTime } from 'luxon';

import ExcelJS, { FillPattern } from "exceljs";
import * as FileSaver from 'file-saver';

import { ValidacionesService } from 'src/app/servicios/generales/validaciones/validaciones.service';
import { EmpleadoService } from 'src/app/servicios/usuarios/empleado/empleadoRegistro/empleado.service';
import { TimbresService } from 'src/app/servicios/timbres/timbrar/timbres.service';
import { EmpresaService } from 'src/app/servicios/configuracion/parametrizacion/catEmpresa/empresa.service';

import { OpcionesTimbreWebComponent } from '../opciones-timbre-web/opciones-timbre-web.component';
import { MetodosComponent } from 'src/app/componentes/generales/metodoEliminar/metodos.component';
import { GenerosService } from 'src/app/servicios/usuarios/catGeneros/generos.service';


@Component({
  selector: 'app-ver-opciones-timbre-web',
  standalone: false,
  templateUrl: './ver-opciones-timbre-web.component.html',
  styleUrl: './ver-opciones-timbre-web.component.css'
})

export class VerOpcionesTimbreWebComponent implements OnInit {
  ips_locales: any = '';

  private imagen: any;

  private bordeCompleto!: Partial<ExcelJS.Borders>;

  private bordeGrueso!: Partial<ExcelJS.Borders>;

  private fillAzul!: FillPattern;

  private fontTitulo!: Partial<ExcelJS.Font>;

  private fontHipervinculo!: Partial<ExcelJS.Font>;

  @Input() informacion: any;
  @Input() opcion: any;

  configuracion: any = [];
  empleado: any = [];
  idEmpleadoLogueado: any;
  // VARIABLES PARA AUDITORIA
  user_name: string | null;
  ip: string | null;

  // CONTROL DE CAMPOS Y VALIDACIONES DEL FORMULARIO
  nombreF = new FormControl('', Validators.minLength(2));;
  codigoF = new FormControl('');

  // ASIGNACION DE VALIDACIONES A INPUTS DEL FORMULARIO
  public formulario = new FormGroup({
    nombreForm: this.nombreF,
    codigoForm: this.codigoF,
  });

  // ITEMS DE PAGINACION DE LA TABLA
  pageSizeOptions = [5, 10, 20, 50];
  tamanio_pagina: number = 5;
  numero_pagina: number = 1;

  constructor(
    public restEmpre: EmpresaService,
    public ventanac: OpcionesTimbreWebComponent,
    public ventanae: MatDialog,
    public validar: ValidacionesService,
    public opciones: TimbresService,
    public restE: EmpleadoService,
    private toastr: ToastrService,
    private restGenero: GenerosService,
  ) {
    this.idEmpleadoLogueado = parseInt(localStorage.getItem('empleado') as string);
  }

  ngOnInit(): void {
    this.user_name = localStorage.getItem('usuario');
    this.ip = localStorage.getItem('ip');  
    this.validar.ObtenerIPsLocales().then((ips) => {
      this.ips_locales = ips;
    }); 
    console.log('ver info ', this.informacion)
    this.ObtenerEmpleados(this.idEmpleadoLogueado);
    this.RevisarEmpleados();
    this.ObtenerColores();
    this.ObtenerLogo();
    this.ObtenerGeneros();

    this.bordeCompleto = {
      top: { style: "thin" as ExcelJS.BorderStyle },
      left: { style: "thin" as ExcelJS.BorderStyle },
      bottom: { style: "thin" as ExcelJS.BorderStyle },
      right: { style: "thin" as ExcelJS.BorderStyle },
    };

    this.bordeGrueso = {
      top: { style: "medium" as ExcelJS.BorderStyle },
      left: { style: "medium" as ExcelJS.BorderStyle },
      bottom: { style: "medium" as ExcelJS.BorderStyle },
      right: { style: "medium" as ExcelJS.BorderStyle },
    };

    this.fillAzul = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "4F81BD" }, // Azul claro
    };

    this.fontTitulo = { bold: true, size: 12, color: { argb: "FFFFFF" } };
    this.fontHipervinculo = { color: { argb: "0000FF" }, underline: true };
  }

  // METODO PARA VER LA INFORMACION DEL EMPLEADO
  ObtenerEmpleados(idemploy: any) {
    this.empleado = [];
    this.restE.BuscarUnEmpleado(idemploy).subscribe(data => {
      this.empleado = data;
    })
  }


  // METODO PARA OBTENER IDs DE EMPLEADOS
  RevisarEmpleados() {
    let id = '';
    this.informacion.forEach((empl: any) => {
      if (id === '') {
        id = empl.id;
      }
      else {
        id = id + ', ' + empl.id;
      }
    })
    let buscar = {
      id_empleado: id,
    }
    //console.log('ver id ', buscar)
    this.ActualizarOpcionMarcacion(buscar);
  }

  // METODO PARA ACTUALIZAR OPCION DE MARCACION
  ActualizarOpcionMarcacion(informacion: any) {
    this.configuracion = [];
    let numero = 1;
    this.opciones.BuscarVariasOpcionesMarcacionWeb(informacion).subscribe((a) => {
      //console.log('ver datos ', a)
      // FILTRAR Y COMBINAR LOS ARRAYS SOLO SI EXISTE COINCIDENCIA EN EL id DEL EMPLEADO
      this.configuracion = this.informacion
        .filter((info: any) => a.respuesta.some((res: any) => info.id === res.id_empleado)) // FILTRAR LOS QUE ESTAN EN AMBOS ARRAYS
        .map((info: any) => {
          const res = a.respuesta.find((res: any) => res.id_empleado === info.id); // ENCONTRAR LOS DATOS CORRESPONDIENTES
          
          return {
            ...info,
            // COMBINAR CON LA INFORMACION DE LA CONFIGURACION
            timbre_especial: res.timbre_especial,
            timbre_foto: res.timbre_foto,
            timbre_ubicacion_desconocida: res.timbre_ubicacion_desconocida,
            opcional_obligatorio: res.opcional_obligatorio,
            n: numero++
          };
        });
      //console.log('veificar datos ', this.configuracion);
    }, (vacio: any) => {
      //console.log('vacio ')
      this.toastr.info('No se han encontrado registros.', '', {
        timeOut: 6000,
      });
      this.Regresar();
    });
  }

  // METODO PARA SALIR DE LA PANTALLA
  Regresar() {
    this.ventanac.configurar = true;
    this.ventanac.ver_configurar = false;
  }

  // METODO PARA MANEJAR PAGINACION 
  ManejarPagina(e: PageEvent) {
    this.numero_pagina = e.pageIndex + 1;
    this.tamanio_pagina = e.pageSize;
  }

  /** ************************************************************************************************* **
   ** **                          METODO DE SELECCION MULTIPLE DE DATOS                              ** **
   ** ************************************************************************************************* **/

  // METODOS PARA LA SELECCION MULTIPLE
  btnCheckHabilitar: boolean = false;
  auto_individual: boolean = true;
  selectionUsuario = new SelectionModel<any>(true, []);
  eliminar_datos: any = [];

  HabilitarSeleccion() {
    if (this.btnCheckHabilitar === false) {
      this.btnCheckHabilitar = true;
      this.auto_individual = false;
    }
    else if (this.btnCheckHabilitar === true) {
      this.btnCheckHabilitar = false;
      this.auto_individual = true;
      this.selectionUsuario.clear();
      this.eliminar_datos = [];
    }
  }

  // SI EL NUMERO DE ELEMENTOS SELECCIONADOS COINCIDE CON EL NUMERO TOTAL DE FILAS.
  isAllSelectedPag() {
    const numSelected = this.selectionUsuario.selected.length;
    return numSelected === this.configuracion.length
  }

  // SELECCIONA TODAS LAS FILAS SI NO ESTAN TODAS SELECCIONADAS; DE LO CONTRARIO, SELECCION CLARA.
  masterTogglePag() {
    this.isAllSelectedPag() ?
      this.selectionUsuario.clear() :
      this.configuracion.forEach((row: any) => this.selectionUsuario.select(row));
  }

  // LA ETIQUETA DE LA CASILLA DE VERIFICACION EN LA FILA PASADA
  checkboxLabelPag(row?: any): string {
    if (!row) {
      return `${this.isAllSelectedPag() ? 'select' : 'deselect'} all`;
    }
    this.eliminar_datos = this.selectionUsuario.selected;

    return `${this.selectionUsuario.isSelected(row) ? 'deselect' : 'select'} row ${row.descripcion + 1}`;
  }

  // FUNCION PARA ELIMINAR REGISTRO SELECCIONADO
  EliminarDetalle(id_opcion: any) {
    const datos = {
      user_name: this.user_name,
      ip: this.ip, ip_local: this.ips_locales,
      ids: [id_opcion]
    };
    console.log('ver datos ', datos)
    this.opciones.EliminarOpcionesMarcacionWeb(datos).subscribe((res: any) => {

      this.toastr.error('Registro eliminado.', '', {
        timeOut: 6000,
      });
      this.RevisarEmpleados();

    });
  }

  // FUNCION PARA CONFIRMAR SI SE ELIMINA O NO UN REGISTRO
  ConfirmarDelete(datos: any) {
    this.ventanae.open(MetodosComponent, { width: '450px' }).afterClosed()
      .subscribe((confirmado: Boolean) => {
        if (confirmado) {
          this.EliminarDetalle(datos.id);
          this.RevisarEmpleados();
        }
      });
  }

  // METODO PARA ELIMINAR REGISTROS
  contador: number = 0;
  ingresar: boolean = false;
  EliminarMultiple() {

    this.ingresar = false;
    this.eliminar_datos = this.selectionUsuario.selected;
    if (this.selectionUsuario.selected.length > 0) {
      const ids: number[] = this.selectionUsuario.selected.map((obj: any) => obj.id).filter((id) => id !== undefined);
      const data = {
        user_name: this.user_name,
        ip: this.ip, ip_local: this.ips_locales,
        ids: ids,
      };

      this.opciones.EliminarOpcionesMarcacionWeb(data).subscribe((res: any) => {
        if (res.message === 'error') {
          this.toastr.error('Existen datos relacionados con los registros ' + '.', 'No fue posible eliminar.', {
            timeOut: 6000,
          });
        } else {
          if (!this.ingresar) {
            this.toastr.error(res.message, '', {
              timeOut: 6000,
            });
            this.ingresar = true;
          }
          this.RevisarEmpleados();
        }
      });
    }
  }

  // METODO PARA CONFIRMAR ELIMINACION MULTIPLE
  ConfirmarDeleteMultiple() {
    if (this.eliminar_datos.length != 0) {
      this.ventanae.open(MetodosComponent, { width: '450px' }).afterClosed()
        .subscribe((confirmado: Boolean) => {
          if (confirmado) {
            this.EliminarMultiple();
            this.HabilitarSeleccion();
            this.RevisarEmpleados();
          }
        });
    } else {
      this.toastr.warning('No ha seleccionado Usuarios.', 'Ups!!! algo salio mal.', {
        timeOut: 6000,
      })
      this.HabilitarSeleccion();
    }
  }


  /** ************************************************************************************************** **
   ** **                                       METODO PARA EXPORTAR A PDF                             ** **
   ** ************************************************************************************************** **/
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



  async GenerarPDF(action: any) {
    const pdfMake = await this.validar.ImportarPDF();
    const documentDefinition = this.DefinirInformacionPDF();
    switch (action) {
      case 'open': pdfMake.createPdf(documentDefinition).open(); break;
      case 'print': pdfMake.createPdf(documentDefinition).print(); break;
      case 'download': pdfMake.createPdf(documentDefinition).download('OpcionesMarcacionWeb'); break;
      default: pdfMake.createPdf(documentDefinition).open(); break;
    }
  }

  // METODO PARA ARMAR LA INFORMACION DEL PDF
  DefinirInformacionPDF() {
    return {
      pageSize: 'A4',
      pageOrientation: 'landscape',
      pageMargins: [40, 60, 40, 40],
      watermark: { text: this.frase, color: 'blue', opacity: 0.1, bold: true, italics: false },
      header: { text: 'Impreso por:  ' + localStorage.getItem('fullname_print'), margin: 10, fontSize: 9, opacity: 0.3, alignment: 'right' },

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
                  text: '© Pag ' + currentPage.toString() + ' de ' + pageCount,
                  alignment: 'right', opacity: 0.3
                }
              ],
            }
          ],
          fontSize: 10
        }
      },
      content: [
        { image: this.logo, width: 100, margin: [10, -25, 0, 5] },
        { text: localStorage.getItem('name_empresa')?.toUpperCase(), bold: true, fontSize: 14, alignment: 'center', margin: [0, -30, 0, 5] },
        { text: `OPCIONES MARCACIÓN APLICACIÓN WEB`, bold: true, fontSize: 12, alignment: 'center', margin: [0, 0, 0, 0], },
        this.PresentarDataPDF(),
      ],
      styles: {
        cabeceras: { fontSize: 8, bold: true, alignment: 'center', fillColor: this.p_color, margin: [0, 5, 0, 0] },
        tableHeader: { fontSize: 8, bold: true, alignment: 'center', fillColor: this.p_color, margin: [0, 2, 0, 2] },
        itemsTable: { fontSize: 8, margin: [0, 2, 0, 0] },
        itemsTableCentrado: { fontSize: 8, alignment: 'center', margin: [0, 2, 0, 0] },
      }
    };
  }

  PresentarDataPDF() {
    return {
      columns: [
        { width: '*', text: '' },
        {
          width: 'auto',
          table: {
            widths: ['auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto'],
            headerRows: 2,
            body: [
              [
                { rowSpan: 2, text: 'N°', style: 'cabeceras' },
                { rowSpan: 2, text: 'IDENTIFICACIÓN', style: 'cabeceras' },
                { rowSpan: 2, text: 'CÓDIGO', style: 'cabeceras' },
                { rowSpan: 2, text: 'EMPLEADO', style: 'cabeceras' },
                { rowSpan: 2, text: 'GÉNERO', style: 'cabeceras' },
                { rowSpan: 2, text: 'CIUDAD', style: 'cabeceras' },
                { rowSpan: 2, text: 'SUCURSAL', style: 'cabeceras' },
                { rowSpan: 2, text: 'RÉGIMEN', style: 'cabeceras' },
                { rowSpan: 2, text: 'DEPARTAMENTO', style: 'cabeceras' },
                { rowSpan: 2, text: 'CARGO', style: 'cabeceras' },
                { rowSpan: 1, colSpan: 3, text: 'CONFIGURACIÓN', style: 'tableHeader' },
                {},
                {},
              ],
              [
                {},
                {},
                {},
                {},
                {},
                {},
                {},
                {},
                {},
                {},
                { rowSpan: 1, text: 'ENVIAR FOTO', style: 'tableHeader' },
                { rowSpan: 1, text: 'TIMBRE ESPECIAL', style: 'tableHeader' },
                { rowSpan: 1, text: 'TIMBRE UBICACIÓN DESCONOCIDA', style: 'tableHeader' },
              ],
              ...this.configuracion.map((obj: any) => {
                let genero: any;
                this.generos.forEach((element: any) => {
                  if (obj.genero == element.id) {
                    genero = element.genero;
                  }
                });
                console.log(genero)
                return [
                  { style: 'itemsTableCentrado', text: obj.n },
                  { style: 'itemsTable', text: obj.identificacion },
                  { style: 'itemsTableCentrado', text: obj.codigo },
                  { style: 'itemsTable', text: obj.apellido + ' ' + obj.nombre },
                  { style: 'itemsTableCentrado', text: genero },
                  { style: 'itemsTable', text: obj.ciudad },
                  { style: 'itemsTable', text: obj.sucursal },
                  { style: 'itemsTable', text: obj.regimen },
                  { style: 'itemsTable', text: obj.departamento },
                  { style: 'itemsTable', text: obj.cargo },
                  { style: 'itemsTableCentrado', text: (obj.timbre_foto === true) ? 'Sí' : 'No' },
                  { style: 'itemsTableCentrado', text: (obj.timbre_especial === true) ? 'Sí' : 'No' },
                  { style: 'itemsTableCentrado', text: (obj.timbre_ubicacion_desconocida === true) ? 'Sí' : 'No' },
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

  /** ****************************************************************************************** **
   ** **                               METODOS PARA EXPORTAR A EXCEL                          ** **
   ** ****************************************************************************************** **/

   generos: any=[];
   ObtenerGeneros(){
     this.restGenero.ListarGeneros().subscribe(datos => {
       this.generos = datos;
     })
   }


  async generarExcel() {
    let datos: any[] = [];
    let n: number = 1;

    this.configuracion.map((usu: any) => {

      let genero: any;
      this.generos.forEach((element: any) => {
        if (usu.genero == element.id) {
          genero = element.genero;
        }
      });

      datos.push([
        n++,
        usu.identificacion,
        usu.codigo,
        usu.apellido,
        usu.nombre,
        genero,
        usu.ciudad,
        usu.sucursal,
        usu.regimen,
        usu.departamento,
        usu.cargo,
        usu.timbre_foto == true ? 'SI' : 'NO',
        usu.timbre_especial == true ? 'SI' : 'NO',
        usu.timbre_ubicacion_desconocida == true ? 'SI' : 'NO',
      ])
    })

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Opciones Marcacion Web");
    this.imagen = workbook.addImage({
      base64: this.logo,
      extension: "png",
    });

    worksheet.addImage(this.imagen, {
      tl: { col: 0, row: 0 },
      ext: { width: 220, height: 105 },
    });
    // COMBINAR CELDAS
    worksheet.mergeCells("B1:N1");
    worksheet.mergeCells("B2:N2");
    worksheet.mergeCells("B3:N3");
    worksheet.mergeCells("B4:N4");
    worksheet.mergeCells("B5:N5");

    // AGREGAR LOS VALORES A LAS CELDAS COMBINADAS
    worksheet.getCell("B1").value = localStorage.getItem('name_empresa')?.toUpperCase();
    worksheet.getCell("B2").value = 'Lista de Opciones Marcación Web'.toUpperCase();

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
      { key: "identificacion", width: 20 },
      { key: "codigo", width: 20 },
      { key: "apellido", width: 20 },
      { key: "nombre", width: 20 },
      { key: "genero", width: 20 },
      { key: "ciudad", width: 20 },
      { key: "sucursal", width: 20 },
      { key: "regimen", width: 20 },
      { key: "departamento", width: 20 },
      { key: "cargo", width: 20 },
      { key: "timbre_foto", width: 20 },
      { key: "timbre_especial", width: 20 },
      { key: "timbre_ubicacion_desconocida", width: 35},
    ];

    const columnas = [
      { name: "ITEM", totalsRowLabel: "Total:", filterButton: false },
      { name: "IDENTIFICACIÓN", totalsRowLabel: "Total:", filterButton: true },
      { name: "CÓDIGO", totalsRowLabel: "", filterButton: true },
      { name: "APELLIDO", totalsRowLabel: "", filterButton: true },
      { name: "NOMBRE", totalsRowLabel: "", filterButton: true },
      { name: "GÉNERO", totalsRowLabel: "", filterButton: true },
      { name: "CIUDAD", totalsRowLabel: "", filterButton: true },
      { name: "SUCURSAL", totalsRowLabel: "", filterButton: true },
      { name: "RÉGIMEN", totalsRowLabel: "", filterButton: true },
      { name: "DEPARTAMENTO", totalsRowLabel: "", filterButton: true },
      { name: "CARGO", totalsRowLabel: "", filterButton: true },
      { name: "ENVIAR FOTO", totalsRowLabel: "", filterButton: true },
      { name: "TIMBRE ESPECIAL", totalsRowLabel: "", filterButton: true },
      { name: "TIMBRE UBICACIÓN DESCONOCIDA", totalsRowLabel: "", filterButton: true },

    ]

    worksheet.addTable({
      name: "OpcionesMarcacionWebTabla",
      ref: "A6",
      headerRow: true,
      totalsRow: false,
      style: {
        theme: "TableStyleMedium16",
        showRowStripes: true,
      },
      columns: columnas,
      rows: datos,
    });


    const numeroFilas = datos.length;
    for (let i = 0; i <= numeroFilas; i++) {
      for (let j = 1; j <= 14; j++) {
        const cell = worksheet.getRow(i + 6).getCell(j);
        if (i === 0) {
          cell.alignment = { vertical: "middle", horizontal: "center" };
        } else {
          cell.alignment = {
            vertical: "middle",
            horizontal: this.obtenerAlineacionHorizontal(j),
          };
        }
        cell.border = this.bordeCompleto;
      }
    }
    worksheet.getRow(6).font = this.fontTitulo;

    try {
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: "application/octet-stream" });
      FileSaver.saveAs(blob, "OpcionesMarcacionWeb.xlsx");
    } catch (error) {
      console.error("Error al generar el archivo Excel:", error);
    }
  }

  private obtenerAlineacionHorizontal(
    j: number
  ): "left" | "center" | "right" {
    if (j === 1 || j === 9 || j === 10 || j === 11) {
      return "center";
    } else {
      return "left";
    }
  }

  //CONTROL BOTONES
  private tienePermiso(accion: string, idFuncion?: number): boolean {
    const datosRecuperados = sessionStorage.getItem('paginaRol');
    if (datosRecuperados) {
      try {
        const datos = JSON.parse(datosRecuperados);
        return datos.some((item: any) =>
          item.accion === accion && (idFuncion === undefined || item.id_funcion === idFuncion)
        );
      } catch {
        return false;
      }
    } else {
      return parseInt(localStorage.getItem('rol') || '0') === 1;
    }
  }

  getEliminarConfiguracionTimbreWeb(){
    return this.tienePermiso('Eliminar Configuración Timbre Web');
  }

  getDescargarReportesConfiguracionTimbreWeb(){
    return this.tienePermiso('Descargar Reportes Configuración Timbre Web');
  }

}
