import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';

import { ValidacionesService } from 'src/app/servicios/generales/validaciones/validaciones.service';

import { MetodosComponent } from 'src/app/componentes/generales/metodoEliminar/metodos.component';
import { MainNavService } from 'src/app/componentes/generales/main-nav/main-nav.service';
import { ConfigurarVacacionesService } from '../../../../../servicios/modulos/modulo-vacaciones/configurar-vacaciones/configurar-vacaciones.service';
import { EmpresaService } from 'src/app/servicios/configuracion/parametrizacion/catEmpresa/empresa.service';
import { DateTime } from 'luxon';
import { EmpleadoService } from 'src/app/servicios/usuarios/empleado/empleadoRegistro/empleado.service';
import * as ExcelJS from 'exceljs';
import * as FileSaver from 'file-saver';
import * as xml2js from 'xml2js';

@Component({
  selector: 'app-listar-configurar-vacacion',
  standalone: false,
  templateUrl: './listar-configurar-vacacion.component.html',
  styleUrl: './listar-configurar-vacacion.component.css'
})

export class ListarConfigurarVacacionComponent implements OnInit {

  // VARIABLES USUARIO QUE INICIA SESION
  empleado: any = [];
  idEmpleado: number;

  // VARIABLES PARA AUDITORIA
  user_name: string | null;
  ips_locales: any = '';
  ip: string | null

  ver_lista: boolean = true;
  configuracion: any = [];

  // CONTROL DE CAMPOS Y VALIDACIONES DEL FORMULARIO
  nombreF = new FormControl('', [Validators.minLength(2)]);

  // ASIGNACION DE VALIDACIONES A INPUTS DEL FORMULARIO
  public BuscarTipoPermisoForm = new FormGroup({
    nombreForm: this.nombreF,
  });

  // ITEMS DE PAGINACION DE LA TABLA
  numero_pagina: number = 1;
  tamanio_pagina: number = 5;
  pageSizeOptions = [5, 10, 20, 50];

  // VERIFICAR ACTIVACION DE MODULO DE VACACIONES
  get habilitarVacaciones(): boolean { return this.funciones.vacaciones; }

  constructor(
    private funciones: MainNavService,
    private validar: ValidacionesService,
    private router: Router,
    public restEmpre: EmpresaService,
    public ventana: MatDialog,
    public rest: ConfigurarVacacionesService,
    public restE: EmpleadoService,
  ) {
    this.idEmpleado = parseInt(localStorage.getItem('empleado') as string);
  }

  ngOnInit(): void {
    if (this.habilitarVacaciones === false) {
      let mensaje = {
        access: false,
        title: `Ups! al parecer no tienes activado en tu plan el Módulo de Vacaciones. \n`,
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
      this.ObtenerEmpleados(this.idEmpleado);
      this.ObtenerConfiguraciones();
      this.ObtenerColores();
      this.ObtenerLogo();
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

  // METODO DE BUSQUEDA DE CONFIGURACIONES DE VACACIONES
  ObtenerConfiguraciones() {
    this.configuracion = [];
    this.rest.BuscarConfiguracionVacaciones().subscribe((datos: any) => {
      this.configuracion = datos;
    });
  }

  // METODO PARA LIMPIAR FORMULARIO
  LimpiarCampos() {
    this.BuscarTipoPermisoForm.setValue({
      nombreForm: '',
    });
    this.ObtenerConfiguraciones();
  }

  // EVENTOS DE PAGINACION
  ManejarPagina(e: PageEvent) {
    this.tamanio_pagina = e.pageSize;
    this.numero_pagina = e.pageIndex + 1;
  }

  // METODO PARA VER DATOS DE TIPO DE PERMISO
  ver_datos: boolean = false;
  configuracion_id: number
  VerDatosConfiguracion(id: number) {
    this.ver_datos = true;
    this.ver_lista = false;
    this.configuracion_id = id;
  }

  // METODO PARA VER FORMULARIO REGISTRAR TIPO PERMISO
  ver_registrar: boolean = false;
  VerFormularioRegistrar() {
    this.ver_lista = false;
    this.ver_registrar = true;
  }

  // METODO PARA VER FOMULARIO EDITAR
  ver_editar: boolean = false;
  pagina: string = '';
  VerFormularioEditar(id: number) {
    this.ver_editar = true;
    this.ver_lista = false;
    this.pagina = 'configurar-vacaciones';
    this.configuracion_id = id;
  }

  // FUNCION PARA CONFIRMAR SI SE ELIMINA O NO UN REGISTRO
  ConfirmarDelete(datos: any) {
    (document.activeElement as HTMLElement)?.blur();
    this.ventana.open(MetodosComponent, { width: '450px' }).afterClosed()
      .subscribe((confirmado: Boolean) => {
        if (confirmado) {
          //this.Eliminar(datos.id);
        } else {
          this.router.navigate(['/configurar-vacacion']);
        }
      });
  }


  /** ************************************************************************************************* **
   ** **                                 METODO PARA EXPORTAR A EXCEL                                ** **
   ** ************************************************************************************************* **/
  private bordeCompleto!: Partial<ExcelJS.Borders>;
  private fontTitulo!: Partial<ExcelJS.Font>;
  private imagen: any;

  async exportToExcel() {
    const listaConfiguracion: any[] = [];
    this.configuracion.forEach((config: any, index: number) => {
      listaConfiguracion.push([
        index + 1,
        config.descripcion,
        config.permite_horas ? 'SI' : 'NO',
        config.minimo_horas,
        config.minimo_dias,
        config.incluir_feriados ? 'SI' : 'NO',
        config.documento ? 'REQUERIDO' : 'OPCIONAL',
      ]);
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Configuracion_Vacaciones");

    // LOGO
    this.imagen = workbook.addImage({
      base64: this.logo,
      extension: "png",
    });

    worksheet.addImage(this.imagen, {
      tl: { col: 0, row: 0 },
      ext: { width: 220, height: 105 },
    });

    // COLUMNAS
    const columnas = [
      { name: "ITEM", totalsRowLabel: "Total:", filterButton: false },
      { name: "DESCRIPCION", totalsRowLabel: "", filterButton: true },
      { name: "PERMITIR HORAS", totalsRowLabel: "", filterButton: true },
      { name: "MINIMO HORAS", totalsRowLabel: "", filterButton: true },
      { name: "MINIMO DIAS", totalsRowLabel: "", filterButton: true },
      { name: "INCLUIR FERIADOS", totalsRowLabel: "", filterButton: true },
      { name: "DOCUMENTO", totalsRowLabel: "", filterButton: true },
    ];

    worksheet.columns = columnas.map((col) => ({
      key: col.name.toLowerCase().replace(/\s+/g, '_'),
      width: 20,
    }));

    // OBTENER ULTIMA LETRA DE COLUMNA DINAMICAMENTE
    const totalColumnas = columnas.length;
    const ultimaColumnaLetra = this.obtenerLetraColumnaExcel(totalColumnas);

    // COMBINAR CELDAS DESDE A1 HASTA ULTIMA COLUMNA (EJ: G1, H1...)
    for (let fila = 1; fila <= 5; fila++) {
      worksheet.mergeCells(`A${fila}:${ultimaColumnaLetra}${fila}`);
    }

    // INSERTAR VALORES CENTRADOS EN FILAS ESPECIFICAS
    worksheet.getCell("A1").value = localStorage.getItem('name_empresa')?.toUpperCase() || '';
    worksheet.getCell("A2").value = "CONFIGURACIÓN DE VACACIONES";

    ["A1", "A2"].forEach((cellRef) => {
      worksheet.getCell(cellRef).alignment = {
        horizontal: "center",
        vertical: "middle",
      };
      worksheet.getCell(cellRef).font = { bold: true, size: 14 };
    });

    // CREAR TABLA
    worksheet.addTable({
      name: "ConfiguracionTabla",
      ref: "A6",
      headerRow: true,
      totalsRow: false,
      style: {
        theme: "TableStyleMedium16",
        showRowStripes: true,
      },
      columns: columnas,
      rows: listaConfiguracion,
    });

    // COLUMNAS QUE NO QUIERES CENTRAR HORIZONTALMENTE (BASADO EN INDICE 1-BASED)
    const columnasExcluidasCentrado: number[] = [2];

    // APLICAR ESTILOS A CELDAS DE LA TABLA
    const numeroFilas = listaConfiguracion.length;

    for (let i = 0; i <= numeroFilas; i++) {
      for (let j = 1; j <= totalColumnas; j++) {
        const cell = worksheet.getRow(i + 6).getCell(j);

        if (i === 0) {
          cell.alignment = { vertical: "middle", horizontal: "center" };
        } else {
          const horizontal = columnasExcluidasCentrado.includes(j) ? "left" : "center";
          cell.alignment = { vertical: "middle", horizontal };
        }

        cell.border = this.bordeCompleto;
      }
    }

    // ESTILOS A LA FILA DE ENCABEZADOS
    worksheet.getRow(6).font = this.fontTitulo;

    // EXPORTAR ARCHIVO
    try {
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: "application/octet-stream" });
      FileSaver.saveAs(blob, "Configuracion_Vacaciones.xlsx");
    } catch (error) {
      console.error("Error al generar el archivo Excel:", error);
    }
  }

  // FUNCION AUXILIAR PARA CONVERTIR INDICE DE COLUMNA A LETRA
  private obtenerLetraColumnaExcel(colIndex: number): string {
    let letra = '';
    while (colIndex > 0) {
      const mod = (colIndex - 1) % 26;
      letra = String.fromCharCode(65 + mod) + letra;
      colIndex = Math.floor((colIndex - 1) / 26);
    }
    return letra;
  }


  /** ************************************************************************************************** **
   ** **                                  METODO PARA EXPORTAR A PDF                                  ** **
   ** ************************************************************************************************** **/

  async GenerarPdf(action = 'open') {
    const pdfMake = await this.validar.ImportarPDF();
    const documentDefinition = this.DefinirInformacionPDF();
    switch (action) {
      case 'open': pdfMake.createPdf(documentDefinition).open(); break;
      case 'print': pdfMake.createPdf(documentDefinition).print(); break;
      case 'download': pdfMake.createPdf(documentDefinition).download('Configuracion_Vacaciones'); break;
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
        { image: this.logo, width: 150, margin: [10, -25, 0, 5] },
        { text: 'CONFIGURACIÓN DE SOLICITUDES DE VACACIONES', bold: true, fontSize: 20, alignment: 'center', margin: [0, -30, 0, 10] },
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
            widths: ['auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto'],
            body: [
              [
                { rowSpan: 2, text: 'Descripción', style: 'tableHeader' },
                { colSpan: 2, text: 'Solicitud por horas', style: 'tableHeader' },
                {},
                { rowSpan: 2, text: 'Solicitudes por días', style: 'tableHeader' },
                { rowSpan: 2, text: 'Incluir feriados', style: 'tableHeader' },
                { rowSpan: 2, text: 'Cargar documento', style: 'tableHeader' },
                { rowSpan: 2, text: 'Estado', style: 'tableHeader' }
              ],
              [
                {},
                { text: 'Permitido', style: 'tableHeader' },
                { text: 'Horas', style: 'tableHeader' },
                {},
                {},
                {},
                {},
              ],
              ...this.configuracion.map((obj: any) => {
                return [
                  { text: obj.descripcion, style: 'itemsTable' },
                  { text: obj.permite_horas == true ? 'Sí' : 'No', style: 'itemsTable' },
                  { text: obj.minimo_horas, style: 'itemsTable' },
                  { text: obj.minimo_dias, style: 'itemsTable' },
                  { text: obj.incluir_feriados, style: 'itemsTable' },
                  { text: obj.documento == true ? 'Requerido' : 'Opcional', style: 'itemsTable' },
                  { text: obj.estado == true ? 'Activo' : 'Inactivo', style: 'itemsTable' },
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
   ** **                               METODO PARA EXPORTAR A CSV                                     ** **
   ** ************************************************************************************************** **/

  exportToCVS() {
    const encabezados = [
      "ID",
      "DESCRIPCION",
      "PERMITIR_HORAS",
      "MINIMO_HORAS",
      "MINIMO_DIAS",
      "INCLUIR_FERIADOS",
      "DOCUMENTO"
    ];

    const filas = this.configuracion.map((config: any) => {
      return [
        config.id,
        `"${config.descripcion}"`, // ENTRE COMILLAS POR SI TIENE COMAS
        config.permite_horas ? "SI" : "NO",
        config.minimo_horas,
        config.minimo_dias,
        config.incluir_feriados ? "SI" : "NO",
        config.documento ? "REQUERIDO" : "OPCIONAL"
      ].join(","); // SEPARADOR CSV
    });

    const contenido = [encabezados.join(","), ...filas].join("\n");
    const blob = new Blob([contenido], { type: "text/csv;charset=utf-8" });

    FileSaver.saveAs(blob, "Configuracion_Vacaciones.csv");
  }

  /** ************************************************************************************************* **
   ** **                              PARA LA EXPORTACION DE ARCHIVOS XML                             ** **
   ** ************************************************************************************************* **/

  urlxml: string;
  data: any = [];
  exportToXML() {
    var objeto: any;
    var arregloConfiguracion: any = [];
    this.configuracion.forEach((obj: any) => {
      objeto = {
        "configuracion_vacaciones": {
          "$": { "id": obj.id },
          "descripcion": obj.descripcion,
          "permite_horas": obj.permite_horas,
          "minimo_horas": obj.minimo_horas,
          "minimo_dias": obj.minimo_dias,
          "incluir_feriados": obj.incluir_feriados,
          "docuemnto": obj.documento,
        }
      }
      arregloConfiguracion.push(objeto)
    });

    const xmlBuilder = new xml2js.Builder({ rootName: 'Configuracion' });
    const xml = xmlBuilder.buildObject(arregloConfiguracion);

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
    } else {
      alert('No se pudo abrir una nueva pestaña. Asegúrese de permitir ventanas emergentes.');
    }

    const a = document.createElement('a');
    a.href = xmlUrl;
    a.download = 'Configurar_Vacaciones.xml';
    // SIMULAR UN CLIC EN EL ENLACE PARA INICIAR LA DESCARGA
    a.click();
  }


}
