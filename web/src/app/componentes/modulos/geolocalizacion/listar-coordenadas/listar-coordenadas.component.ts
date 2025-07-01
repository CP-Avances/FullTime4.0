// SECCION DE LIBRERIAS
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { PageEvent } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { DateTime } from 'luxon';
import { Router } from '@angular/router';

import * as xml2js from 'xml2js';
import * as FileSaver from 'file-saver';
import ExcelJS, { FillPattern } from "exceljs";

import { EmpleadoUbicacionService } from 'src/app/servicios/modulos/empleadoUbicacion/empleado-ubicacion.service';
import { ValidacionesService } from 'src/app/servicios/generales/validaciones/validaciones.service';
import { EmpleadoService } from 'src/app/servicios/usuarios/empleado/empleadoRegistro/empleado.service';
import { EmpresaService } from 'src/app/servicios/configuracion/parametrizacion/catEmpresa/empresa.service';
import { MainNavService } from 'src/app/componentes/generales/main-nav/main-nav.service';

import { EditarCoordenadasComponent } from '../editar-coordenadas/editar-coordenadas.component';
import { CrearCoordenadasComponent } from '../crear-coordenadas/crear-coordenadas.component';
import { MetodosComponent } from 'src/app/componentes/generales/metodoEliminar/metodos.component';

@Component({
  selector: 'app-listar-coordenadas',
  standalone: false,
  templateUrl: './listar-coordenadas.component.html',
  styleUrls: ['./listar-coordenadas.component.css']
})

export class ListarCoordenadasComponent implements OnInit {
  ips_locales: any = '';

  private imagen: any;

  private bordeCompleto!: Partial<ExcelJS.Borders>;

  private bordeGrueso!: Partial<ExcelJS.Borders>;

  private fillAzul!: FillPattern;

  private fontTitulo!: Partial<ExcelJS.Font>;

  private fontHipervinculo!: Partial<ExcelJS.Font>;

  // ITEMS DE PAGINACION DE LA TABLA
  numero_pagina: number = 1;
  tamanio_pagina: number = 5;
  pageSizeOptions = [5, 10, 20, 50];

  tipoPermiso: any = [];
  empleado: any = [];
  idEmpleado: number;

  // VARIABLES PARA AUDITORIA
  user_name: string | null;
  ip: string | null;

  // CONTROL DE CAMPOS Y VALIDACIONES DEL FORMULARIO
  descripcionF = new FormControl('', [Validators.minLength(2)]);

  // ASIGNACION DE VALIDACIONES A INPUTS DEL FORMULARIO
  public CoordenadasForm = new FormGroup({
    descripcionForm: this.descripcionF,
  });

  get habilitarGeolocalizacion(): boolean { return this.funciones.geolocalizacion; }

  constructor(
    public restEmpre: EmpresaService,
    public ventana: MatDialog,
    public restE: EmpleadoService,
    private restU: EmpleadoUbicacionService,
    private toastr: ToastrService,
    private router: Router,
    private validar: ValidacionesService,
    private funciones: MainNavService,

  ) {
    this.idEmpleado = parseInt(localStorage.getItem('empleado') as string);
  }

  ngOnInit(): void {
    if (this.habilitarGeolocalizacion === false) {
      let mensaje = {
        access: false,
        title: `Ups! al parecer no tienes activado en tu plan el Módulo de Geolocalización. \n`,
        message: '¿Te gustaría activarlo? Comunícate con nosotros.',
        url: 'www.casapazmino.com.ec'
      }
      return this.validar.RedireccionarHomeAdmin(mensaje);
    }
    else {
      this.user_name = localStorage.getItem('usuario');
      this.ip = localStorage.getItem('ip');  
      this.validar.ObtenerIPsLocales().then((ips) => {
      this.ips_locales = ips;
    }); 
      this.ObtenerCoordenadas();
      this.ObtenerEmpleados(this.idEmpleado);
      this.ObtenerLogo();
      this.ObtenerColores();
    }

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

  // EVENTO PARA MANEJAR PAGINACIÓN EN TABLAS
  ManejarPagina(e: PageEvent) {
    this.tamanio_pagina = e.pageSize;
    this.numero_pagina = e.pageIndex + 1;
  }

  // METODO PARA LISTAR UBICACIONES GEOGRÁFICAS
  coordenadas: any = [];
  ObtenerCoordenadas() {
    this.coordenadas = [];
    this.restU.ListarCoordenadas().subscribe(datos => {
      this.coordenadas = datos;
    });
  }

  // METODO PARA LIMPIAR CAMPO DE BUSQUEDA
  LimpiarCampos() {
    this.CoordenadasForm.setValue({
      descripcionForm: '',
    });
    this.ObtenerCoordenadas();
  }

  // METODO PARA ABRIR VENTANA CREACIÓN DE REGISTRO
  CrearParametro(): void {
    (document.activeElement as HTMLElement)?.blur();
    this.ventana.open(CrearCoordenadasComponent,
      { width: '400px' }).afterClosed().subscribe(item => {
        if (item) {
          this.VerDetallesCoordenadas(item);
        }
      });
  }

  // METODO PARA ABRIR VENTANA EDICIÓN DE REGISTRO
  AbrirEditar(datos: any): void {
    this.ventana.open(EditarCoordenadasComponent,
      { width: '400px', data: { ubicacion: datos, actualizar: false } }).afterClosed().subscribe(item => {
        if (item) {
          this.VerDetallesCoordenadas(item);
        }
      });
  }

  // FUNCION PARA ELIMINAR REGISTRO SELECCIONADO
  Eliminar(id: number) {
    const datos = {
      user_name: this.user_name,
      ip: this.ip, ip_local: this.ips_locales
    };
    this.restU.EliminarCoordenadas(id, datos).subscribe((res: any) => {
      if (res.message === 'false') {
        this.toastr.warning('Existen datos relacionados con este registro.', 'No fue posible eliminar.', {
          timeOut: 6000,
        });
      }
      else {
        this.toastr.error('Registro eliminado.', '', {
          timeOut: 6000,
        });
        this.ObtenerCoordenadas();
      }
    });
  }

  // FUNCION PARA CONFIRMAR SI SE ELIMINA O NO UN REGISTRO
  ConfirmarDelete(datos: any) {
    (document.activeElement as HTMLElement)?.blur();
    this.ventana.open(MetodosComponent, { width: '450px' }).afterClosed()
      .subscribe((confirmado: Boolean) => {
        if (confirmado) {
          this.Eliminar(datos.id);
        } else {
          this.router.navigate(['/coordenadas']);
        }
      });
  }

  // METODO PARA VER DETALLE DE COORDENADAS
  ver_lista: boolean = true;
  ver_detalles: boolean = false;
  coordenada_id: number;
  VerDetallesCoordenadas(id: number) {
    this.ver_lista = false;
    this.ver_detalles = true;
    this.coordenada_id = id;
  }

  /** ************************************************************************************************** **
   ** **                              METODO PARA EXPORTAR A PDF                                      ** **
   ** ************************************************************************************************** **/


async GenerarPdf(action = 'open') {
  if (action === 'download') {
    const data = {
      usuario: this.empleado[0].nombre + ' ' + this.empleado[0].apellido,
      empresa: localStorage.getItem('name_empresa')?.toUpperCase(),
      fraseMarcaAgua: this.frase,
      logoBase64: this.logo,
      colorPrincipal: this.p_color,
      coordenadas: this.coordenadas.map((obj: any) => ({
        id: obj.id,
        descripcion: obj.descripcion,
        latitud: obj.latitud,
        longitud: obj.longitud
      }))
    };

    console.log("Enviando al microservicio:", data);

    this.validar.generarReporteCoordenadas(data).subscribe((pdfBlob: Blob) => {
      FileSaver.saveAs(pdfBlob, 'CoordenadasGeograficas.pdf');
      console.log("PDF generado correctamente desde el microservicio.");
    }, error => {
                      console.error("Error al generar PDF desde el microservicio:", error);


        this.toastr.error(
          'No se pudo generar el reporte. El servicio de reportes no está disponible en este momento. Intentelo mas tarde',
          'Error'
        );
    });

  } else {
    const pdfMake = await this.validar.ImportarPDF();
    const documentDefinition = this.DefinirInformacionPDF();

    switch (action) {
      case 'open': pdfMake.createPdf(documentDefinition).open(); break;
      case 'print': pdfMake.createPdf(documentDefinition).print(); break;
      default: pdfMake.createPdf(documentDefinition).open(); break;
    }
  }
}


  DefinirInformacionPDF() {
    return {
      // ENCABEZADO DE LA PAGINA
      pageSize: 'A4',
      pageOrientation: 'portrait',
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
        { image: this.logo, width: 150, margin: [10, -25, 0, 5] },
        { text: 'Lista de coordenadas geográficas', bold: true, fontSize: 20, alignment: 'center', margin: [0, -30, 0, 10] },
        this.presentarDataPDFTipoPermisos(),
      ],
      styles: {
        tableHeader: { fontSize: 9, bold: true, alignment: 'center', fillColor: this.p_color },
        itemsTable: { fontSize: 8, alignment: 'center', }
      }
    };
  }

  presentarDataPDFTipoPermisos() {
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
                { text: 'Latitud', style: 'tableHeader' },
                { text: 'Longitud', style: 'tableHeader' },
              ],
              ...this.coordenadas.map((obj: any) => {
                return [
                  { text: obj.id, style: 'itemsTable' },
                  { text: obj.descripcion, style: 'itemsTable' },
                  { text: obj.latitud, style: 'itemsTable' },
                  { text: obj.longitud, style: 'itemsTable' },
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
   ** **                                  METODO PARA EXPORTAR A EXCEL                                ** **
   ** ************************************************************************************************** **/
  async generarExcel() {
    let datos: any[] = [];
    let n: number = 1;

    this.coordenadas.map((obj: any) => {
      datos.push([
        n++,
        obj.id,
        obj.latitud,
        obj.longitud,
        obj.descripcion
      ])
    })

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Coordenadas");
    this.imagen = workbook.addImage({
      base64: this.logo,
      extension: "png",
    });

    worksheet.addImage(this.imagen, {
      tl: { col: 0, row: 0 },
      ext: { width: 220, height: 105 },
    });
    // COMBINAR CELDAS
    worksheet.mergeCells("B1:E1");
    worksheet.mergeCells("B2:E2");
    worksheet.mergeCells("B3:E3");
    worksheet.mergeCells("B4:E4");
    worksheet.mergeCells("B5:E5");

    // AGREGAR LOS VALORES A LAS CELDAS COMBINADAS
    worksheet.getCell("B1").value = localStorage.getItem('name_empresa')?.toUpperCase();
    worksheet.getCell("B2").value = 'Lista de Coordenadas'.toUpperCase();

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
      { key: "latitud", width: 30 },
      { key: "longitud", width: 30 },
      { key: "descripcion", width: 30 },

    ];

    const columnas = [
      { name: "ITEM", totalsRowLabel: "Total:", filterButton: false },
      { name: "CODIGO", totalsRowLabel: "Total:", filterButton: true },
      { name: "LATITUD", totalsRowLabel: "", filterButton: true },
      { name: "LONGITUD", totalsRowLabel: "", filterButton: true },
      { name: "DESCRIPCIÓN", totalsRowLabel: "", filterButton: true },
    ]

    worksheet.addTable({
      name: "CoordenadasTabla",
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
      for (let j = 1; j <= 5; j++) {
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
      FileSaver.saveAs(blob, "CoordenadasGeograficasEXCEL.xlsx");
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


  /** ************************************************************************************************** **
   ** **                                    METODO PARA EXPORTAR A CSV                                ** **
   ** ************************************************************************************************** **/
  ExportToCSV() {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('CoordenadasGeograficasCSV');
    console.log("ver doordenadas: ", this.coordenadas)
    //  Agregar encabezados dinámicos basados en las claves del primer objeto
    const keys = Object.keys(this.coordenadas[0] || {}); // Obtener las claves
    worksheet.columns = keys.map(key => ({ header: key, key, width: 20 }));
    // Llenar las filas con los datos
    this.coordenadas.forEach((obj: any) => {
      worksheet.addRow(obj);
    });
  
    workbook.csv.writeBuffer().then((buffer) => {
      const data: Blob = new Blob([buffer], { type: 'text/csv;charset=utf-8;' });
      FileSaver.saveAs(data, "CoordenadasGeograficasCSV.csv");
    });

  }

  /** ************************************************************************************************* **
   ** **                               PARA LA EXPORTACION DE ARCHIVOS XML                            ** **
   ** ************************************************************************************************* **/

  urlxml: string;
  data: any = [];
  exportToXML() {
    var objeto: any;
    var arregloCoordenadas: any = [];
    this.coordenadas.forEach((obj: any) => {
      objeto = {
        codigo: {
          "$": { "id": obj.id },
          descripcion: obj.descripcion,
          latitud: obj.latitud,
          longitud: obj.longitud
        },
      }
      arregloCoordenadas.push(objeto)
    });
    const xmlBuilder = new xml2js.Builder({ rootName: 'Coordenadas' });
    const xml = xmlBuilder.buildObject(arregloCoordenadas);

    if (xml === undefined) {
      console.error('Error al construir el objeto XML.');
      return;
    }

    const blob = new Blob([xml], { type: 'application/xml' });
    const xmlUrl = URL.createObjectURL(blob);

    // ABRIR UNA NUEVA PESTAÑA O VENTANA CON EL CONTENIDO XML
    const newTab = window.open(xmlUrl, '_blank');
    if (newTab) {
      newTab.opener = null; // EVITAR QUE LA NUEVA PESTAÑA TENGA ACCESO A LA VENTANA PADRE
      newTab.focus(); // DAR FOCO A LA NUEVA PESTAÑA
    }
    else {
      alert('No se pudo abrir una nueva pestaña. Asegúrese de permitir ventanas emergentes.');
    }

    const a = document.createElement('a');
    a.href = xmlUrl;
    a.download = 'CoordenadasUbicacion.xml';
    // SIMULAR UN CLIC EN EL ENLACE PARA INICIAR LA DESCARGA
    a.click();
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

  getRegistrarPerimetro(){
    return this.tienePermiso('Registrar Ubicación');
  }

  getVer(){
    return this.tienePermiso('Ver Ubicación');
  }

  getEditar(){
    return this.tienePermiso('Editar Ubicación');
  }

  getEliminar(){
    return this.tienePermiso('Eliminar Ubicación');
  }

  getDescargarReportes(){
    return this.tienePermiso('Descargar Reportes Ubicación');
  }

}
