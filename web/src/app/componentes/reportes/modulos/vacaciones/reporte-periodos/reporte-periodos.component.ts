import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { FormControl, Validators } from '@angular/forms';
import { ITableEmpleados } from 'src/app/model/reportes.model';
import { SelectionModel } from '@angular/cdk/collections';
import { ToastrService } from 'ngx-toastr';

import { PeriodoVacacionesService } from 'src/app/servicios/modulos/modulo-vacaciones/periodoVacaciones/periodo-vacaciones.service';
import { DatosGeneralesService } from 'src/app/servicios/generales/datosGenerales/datos-generales.service';
import { ValidacionesService } from 'src/app/servicios/generales/validaciones/validaciones.service';
import { ParametrosService } from 'src/app/servicios/configuracion/parametrizacion/parametrosGenerales/parametros.service';
import { ReportesService } from 'src/app/servicios/reportes/opcionesReportes/reportes.service';
import { EmpresaService } from 'src/app/servicios/configuracion/parametrizacion/catEmpresa/empresa.service';
import { DateTime } from 'luxon';
import ExcelJS from "exceljs";
import * as FileSaver from 'file-saver';

@Component({
  selector: 'app-reporte-periodos',
  standalone: false,
  templateUrl: './reporte-periodos.component.html',
  styleUrl: './reporte-periodos.component.css'
})

export class ReportePeriodosComponent implements OnInit {

  // VARIABLES DE ALMACENAMIENTO DE DATOS
  idEmpleadoLogueado: any;
  departamentos: any = [];
  sucursales: any = [];
  empleados: any = [];
  periodos: any = [];
  regimen: any = [];
  cargos: any = [];
  data_pdf: any = [];

  //VARIABLES PARA MOSTRAR DETALLES
  verDetalle: boolean = false;
  estado_periodo: string = 'todos';

  // VARIABLES UTILIZADAS PARA IDENTIFICAR EL TIPO DE USUARIO
  tipoUsuario: string = 'activo';
  opcionBusqueda: number = 1;
  limpiar: number = 0;

  get bool() { return this.reporteService.criteriosBusqueda };

  get opcion() { return this.reporteService.opcion };

  // VARIABLES DE ALMACENAMIENTO DE DATOS SELECCIONADOS EN LA BUSQUEDA
  selectionSuc = new SelectionModel<ITableEmpleados>(true, []);
  selectionReg = new SelectionModel<any>(true, []);
  selectionCar = new SelectionModel<ITableEmpleados>(true, []);
  selectionDep = new SelectionModel<ITableEmpleados>(true, []);
  selectionEmp = new SelectionModel<ITableEmpleados>(true, []);

  // ITEMS DE PAGINACION DE LA TABLA SUCURSAL
  numero_pagina_suc: number = 1;
  tamanio_pagina_suc: number = 5;
  pageSizeOptions_suc = [5, 10, 20, 50];

  // ITEMS DE PAGINACION DE LA TABLA REGIMEN
  numero_pagina_reg: number = 1;
  tamanio_pagina_reg: number = 5;
  pageSizeOptions_reg = [5, 10, 20, 50];

  // ITEMS DE PAGINACION DE LA TABLA CARGO
  numero_pagina_car: number = 1;
  tamanio_pagina_car: number = 5;
  pageSizeOptions_car = [5, 10, 20, 50];

  // ITEMS DE PAGINACION DE LA TABLA DEPARTAMENTO
  numero_pagina_dep: number = 1;
  tamanio_pagina_dep: number = 5;
  pageSizeOptions_dep = [5, 10, 20, 50];

  // ITEMS DE PAGINACION DE LA TABLA EMPLEADOS
  numero_pagina_emp: number = 1;
  tamanio_pagina_emp: number = 5;
  pageSizeOptions_emp = [5, 10, 20, 50];

  // ITEMS DE PAGINACION DE LA TABLA DETALLE
  @ViewChild('paginatorDetalle') paginatorDetalle: MatPaginator;
  pageSizeOptions = [5, 10, 20, 50];
  tamanio_pagina: number = 5;
  numero_pagina: number = 1;

  // CAMPOS DEL FORMULARIO
  codigo = new FormControl('');
  cedula = new FormControl('', [Validators.minLength(2)]);
  nombre = new FormControl('', [Validators.minLength(2)]);

  //FILTROS
  get filtroNombreSuc() { return this.reporteService.filtroNombreSuc };

  get filtroNombreDep() { return this.reporteService.filtroNombreDep };

  get filtroNombreReg() { return this.reporteService.filtroNombreReg };

  get filtroNombreCar() { return this.reporteService.filtroNombreCarg };

  get filtroNombreEmp() { return this.reporteService.filtroNombreEmp };
  get filtroCodigo() { return this.reporteService.filtroCodigo };
  get filtroCedula() { return this.reporteService.filtroCedula };
  get filtroRolEmp() { return this.reporteService.filtroRolEmp };

  // ESTILOS PARA FORMATO EXCEL
  private bordeCompleto!: Partial<ExcelJS.Borders>;
  private fontTitulo!: Partial<ExcelJS.Font>;
  private imagen: any;

  constructor(
    private reporteService: ReportesService,
    private reporteP: PeriodoVacacionesService,
    private informacion: DatosGeneralesService,
    private parametro: ParametrosService,
    private restEmpre: EmpresaService,
    private validar: ValidacionesService,
    private toastr: ToastrService,
  ) {
    this.idEmpleadoLogueado = parseInt(localStorage.getItem('empleado') as string);
    this.ObtenerLogo();
    this.ObtenerColores();
  }

  ngOnInit(): void {
    this.opcionBusqueda = this.tipoUsuario === 'activo' ? 1 : 2;
    this.BuscarInformacionGeneral(this.opcionBusqueda);
    this.BuscarParametro();
    // ESTILOS DE FORMATO EXCEL
    this.bordeCompleto = {
      top: { style: "thin" as ExcelJS.BorderStyle },
      left: { style: "thin" as ExcelJS.BorderStyle },
      bottom: { style: "thin" as ExcelJS.BorderStyle },
      right: { style: "thin" as ExcelJS.BorderStyle },
    };

    this.fontTitulo = { bold: true, size: 12, color: { argb: "FFFFFF" } };
  }

  ngOnDestroy() {
    this.departamentos = [];
    this.sucursales = [];
    this.empleados = [];
    this.regimen = [];
    this.periodos = [];
    this.cargos = [];
  }

  /** ****************************************************************************************** **
   ** **                     BUSQUEDA DE FORMATOS DE FECHAS Y HORAS                           ** **
   ** ****************************************************************************************** **/

  formato_fecha: string = 'dd/MM/yyyy';
  formato_hora: string = 'HH:mm:ss';
  idioma_fechas: string = 'es';
  // METODO PARA BUSCAR DATOS DE PARAMETROS
  BuscarParametro() {
    let datos: any = [];
    let detalles = { parametros: '1, 2' };
    this.parametro.ListarVariosDetallesParametros(detalles).subscribe(
      res => {
        datos = res;
        //console.log('datos ', datos)
        datos.forEach((p: any) => {
          // id_tipo_parametro Formato fecha = 1
          if (p.id_parametro === 1) {
            this.formato_fecha = p.descripcion;
          }
          // id_tipo_parametro Formato hora = 2
          else if (p.id_parametro === 2) {
            this.formato_hora = p.descripcion;
          }
        })
      });
  }

  /** ****************************************************************************************** **
   ** **                           BUSQUEDA Y MODELAMIENTO DE DATOS                           ** **
   ** ****************************************************************************************** **/

  // METODO DE BUSQUEDA DE DATOS GENERALES
  BuscarInformacionGeneral(opcion: any) {
    this.informacion.ObtenerInformacionGeneralRegimen(opcion).subscribe((res: any[]) => {
      this.ProcesarDatos(res);
    }, err => {
      this.toastr.error(err.error.message)
    })
  }

  // METODO PARA PROCESAR LA INFORMACION DE LOS EMPLEADOS
  ProcesarDatos(informacion: any) {
    this.cargos = this.validar.ProcesarDatosCargos(informacion);
    this.regimen = this.validar.ProcesarDatosRegimen(informacion);
    this.empleados = this.validar.ProcesarDatosEmpleados(informacion);
    this.sucursales = this.validar.ProcesarDatosSucursales(informacion);
    this.departamentos = this.validar.ProcesarDatosDepartamentos(informacion);
  }

  // METODO PARA OBTENER DATOS SEGUN EL ESTADO DEL USUARIO
  ObtenerTipoUsuario($event: string) {
    this.tipoUsuario = $event;
    this.opcionBusqueda = this.tipoUsuario === 'activo' ? 1 : 2;
    this.limpiar = this.opcionBusqueda;
    this.selectionSuc.clear();
    this.selectionDep.clear();
    this.selectionCar.clear();
    this.selectionReg.clear();
    this.selectionEmp.clear();
    this.BuscarInformacionGeneral(this.opcionBusqueda);
  }

  // VALIDACIONES DE SELECCION DE BUSQUEDA
  ValidarReporte(action: any) {
    if (
      this.bool.bool_suc === false &&
      this.bool.bool_reg === false &&
      this.bool.bool_cargo === false &&
      this.bool.bool_dep === false &&
      this.bool.bool_emp === false
    )
      return this.toastr.error('Seleccione un criterio de búsqueda.');
    // METODO PARA MODELAR DATOS
    this.ModelarDatos(action);
  }

  // MODELAR DATOS DE ACUERDO AL CRITERIO DE BUSQUEDA
  ModelarDatos(accion: any) {
    let seleccionados: any = [];
    switch (this.opcion) {
      case 's':
        if (this.selectionSuc.selected.length === 0)
          return this.toastr.error(
            'No a seleccionado ninguno.',
            'Seleccione sucursal.'
          );
        seleccionados = this.validar.ModelarSucursal(this.empleados, this.sucursales, this.selectionSuc);
        break;
      case 'r':
        if (this.selectionReg.selected.length === 0)
          return this.toastr.error(
            'No a seleccionado ninguno.',
            'Seleccione régimen.'
          );
        seleccionados = this.validar.ModelarRegimen(this.empleados, this.regimen, this.selectionReg);
        break;
      case 'c':
        if (this.selectionCar.selected.length === 0)
          return this.toastr.error(
            'No a seleccionado ninguno',
            'Seleccione Cargo'
          );
        seleccionados = this.validar.ModelarCargo(this.empleados, this.cargos, this.selectionCar);
        break;
      case 'd':
        if (this.selectionDep.selected.length === 0)
          return this.toastr.error(
            'No a seleccionado ninguno.',
            'Seleccione departamentos.'
          );
        seleccionados = this.validar.ModelarDepartamento(this.empleados, this.departamentos, this.selectionDep);
        break;
      case 'e':
        if (this.selectionEmp.selected.length === 0)
          return this.toastr.error(
            'No a seleccionado ninguno.',
            'Seleccione empleados.'
          );
        seleccionados = this.validar.ModelarEmpleados(this.empleados, this.selectionEmp);
        break;
      default:
        this.toastr.error(
          'Ups! algo salio mal.',
          'Seleccione criterio de búsqueda.'
        );
        this.reporteService.DefaultFormCriterios();
        break;
    }

    // METODO PARA MOSTRAR DATOS DE REGISTROS DEL USUARIO
    console.log("ver seleccionados : ", seleccionados)
    if (seleccionados.length != 0) {
      this.MostrarInformacion(seleccionados, accion);
    }

  }

  // METODO PARA MOSTRAR INFORMACION
  MostrarInformacion(seleccionados: any, accion: any) {
    this.data_pdf = [];
    this.reporteP.ReportePeriodoVacaciones(seleccionados, this.estado_periodo).subscribe(res => {
      this.data_pdf = res;
      console.log('ver ', this.data_pdf, ' estado ', this.estado_periodo)
      switch (accion) {
        case 'excel': this.generarExcel(); break;
        case 'ver': this.VerDatos(); break;
        default: this.GenerarPDF(accion); break;
      }
    }, err => {
      this.toastr.error(err.error.message)
    })
  }

  // MOSTRAR DETALLES
  VerDatos() {
    this.verDetalle = true;
    this.ExtraerDatos();
  }

  // METODO PARA REGRESAR A LA PAGINA ANTERIOR
  Regresar() {
    this.verDetalle = false;
    this.paginatorDetalle.firstPage();
  }

  /** ****************************************************************************************** **
   ** **                 METODOS PARA EXTRAER PERIODOS PARA LA PREVISUALIZACION                ** **
   ** ****************************************************************************************** **/

  ExtraerDatos() {
    this.periodos = [];
    this.data_pdf.forEach((selec: any, index: number) => {
      selec.empleados.map((empl: any) => {
        empl.periodos.map((per: any) => {
          const fecha_inicio = this.validar.FormatearFecha(per.fecha_inicio.split('T')[0], this.formato_fecha, this.validar.dia_abreviado, this.idioma_fechas);
          const fecha_final = this.validar.FormatearFecha(per.fecha_final.split('T')[0], this.formato_fecha, this.validar.dia_abreviado, this.idioma_fechas);
          const fecha_inicial = this.validar.FormatearFecha(per.fecha_desde.split('T')[0], this.formato_fecha, this.validar.dia_abreviado, this.idioma_fechas);
          const fecha_acreditar_vacaciones = this.validar.FormatearFecha(per.fecha_acreditar_vacaciones.split('T')[0], this.formato_fecha, this.validar.dia_abreviado, this.idioma_fechas);
          const formato_hora = this.validar.convertirDiasAHorasMinutos(per.dias_vacacion, empl.hora_trabaja, empl.hora_estandar);
          let datos = {
            item:  index + 1,
            ciudad: empl.ciudad,
            sucursal: empl.sucursal,
            regimen: empl.regimen,
            departamento: empl.departamento,
            cargo: empl.cargo,
            empleado: empl.apellido + ' ' + empl.nombre,
            identificacion: empl.identificacion,
            codigo: empl.codigo,
            rol: empl.rol,
            observacion: per.observacion,
            fecha_inicio: fecha_inicio,
            fecha_final: fecha_final,
            fecha_inicial: fecha_inicial,
            dias_iniciales: (per.dias_iniciales !== 0)
              ? per.dias_iniciales
              : (per.saldo_transferido !== 0 ? per.saldo_transferido : 0),
            fecha_acreditar: fecha_acreditar_vacaciones,
            dias_cargados: per.dias_cargados,
            anios_antiguedad: per.anios_antiguedad,
            dias_antiguedad: per.dias_antiguedad,
            dias_perdidos: per.dias_perdidos,
            usados_vacaciones: per.usados_dias_vacacion + per.usados_antiguedad,
            dias_vacacion: per.dias_vacacion,
            formato_hora: formato_hora,
            estado: per.estado ? 'ACTIVO' : 'INACTIVO',
          }
          this.periodos.push(datos);
        });
      })
    });

  }

  /** ****************************************************************************************** **
   **                              COLORES Y LOGO PARA EL REPORTE                                **
   ** ****************************************************************************************** **/

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

  /** ****************************************************************************************** **
   ** **                               METODOS PARA EXPORTAR A EXCEL                          ** **
   ** ****************************************************************************************** **/

  async generarExcel() {
    const listaPeriodos: any[] = [];
    this.data_pdf.forEach((selec: any, index: number) => {
      selec.empleados.map((empl: any) => {
        empl.periodos.map((per: any) => {
          const fecha_inicio = this.validar.FormatearFecha(per.fecha_inicio.split('T')[0], this.formato_fecha, this.validar.dia_abreviado, this.idioma_fechas);
          const fecha_final = this.validar.FormatearFecha(per.fecha_final.split('T')[0], this.formato_fecha, this.validar.dia_abreviado, this.idioma_fechas);
          const fecha_inicial = this.validar.FormatearFecha(per.fecha_desde.split('T')[0], this.formato_fecha, this.validar.dia_abreviado, this.idioma_fechas);
          const fecha_acreditar_vacaciones = this.validar.FormatearFecha(per.fecha_acreditar_vacaciones.split('T')[0], this.formato_fecha, this.validar.dia_abreviado, this.idioma_fechas);
          const formato_hora = this.validar.convertirDiasAHorasMinutos(per.dias_vacacion, empl.hora_trabaja, empl.hora_estandar);
          listaPeriodos.push([
            index + 1,
            empl.ciudad,
            empl.sucursal,
            empl.regimen,
            empl.departamento,
            empl.cargo,
            empl.apellido + ' ' + empl.nombre,
            empl.identificacion,
            empl.codigo,
            empl.rol,
            per.observacion,
            fecha_inicio,
            fecha_final,
            fecha_inicial,
            (per.dias_iniciales !== 0)
              ? per.dias_iniciales
              : (per.saldo_transferido !== 0 ? per.saldo_transferido : 0),
            fecha_acreditar_vacaciones,
            per.dias_cargados,
            per.anios_antiguedad,
            per.dias_antiguedad,
            per.dias_perdidos,
            per.usados_dias_vacacion + per.usados_antiguedad,
            per.dias_vacacion,
            formato_hora,
            per.estado ? 'ACTIVO' : 'INACTIVO',
          ])
        });
      })
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Periodo_Vacaciones");

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
      { name: "CIUDAD", totalsRowLabel: "", filterButton: true },
      { name: "SUCURSAL", totalsRowLabel: "", filterButton: true },
      { name: "REGIMEN", totalsRowLabel: "", filterButton: true },
      { name: "DEPARTAMENTO", totalsRowLabel: "", filterButton: true },
      { name: "CARGO", totalsRowLabel: "", filterButton: true },
      { name: "EMPLEADO", totalsRowLabel: "", filterButton: true },
      { name: "IDENTIFICACION", totalsRowLabel: "", filterButton: true },
      { name: "CODIGO", totalsRowLabel: "", filterButton: true },
      { name: "ROL", totalsRowLabel: "", filterButton: true },
      { name: "DESCRIPCION", totalsRowLabel: "", filterButton: true },
      { name: "INICIO PERIODO", totalsRowLabel: "", filterButton: true },
      { name: "FIN PERIODO", totalsRowLabel: "", filterButton: true },
      { name: "FECHA CARGA INICIAL", totalsRowLabel: "", filterButton: true },
      { name: "DIAS INICIALES / TRANSFERIDOS", totalsRowLabel: "", filterButton: true },
      { name: "FECHA CARGAR VACACIONES", totalsRowLabel: "", filterButton: true },
      { name: "DIAS CARGADOS", totalsRowLabel: "", filterButton: true },
      { name: "AÑOS TRANSCURRIDOS", totalsRowLabel: "", filterButton: true },
      { name: "DIAS ANTIGUEDDA", totalsRowLabel: "", filterButton: true },
      { name: "DIAS PERDIDOS", totalsRowLabel: "", filterButton: true },
      { name: "DIAS USADOS", totalsRowLabel: "", filterButton: true },
      { name: "TOTAL", totalsRowLabel: "", filterButton: true },
      { name: "TOTAL (dd/hh/mm)", totalsRowLabel: "", filterButton: true },
      { name: "ESTADO", totalsRowLabel: "", filterButton: true },
    ];

    worksheet.columns = columnas.map((col) => ({
      key: col.name.toLowerCase().replace(/\s+/g, '_'),
      width: 25,
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
    worksheet.getCell("A2").value = "PERIODO DE VACACIONES";

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
      rows: listaPeriodos,
    });

    // COLUMNAS QUE NO QUIERES CENTRAR HORIZONTALMENTE (BASADO EN INDICE 1-BASED)
    const columnasExcluidasCentrado: number[] = [7, 11, 23];

    // APLICAR ESTILOS A CELDAS DE LA TABLA
    const numeroFilas = listaPeriodos.length;

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
      FileSaver.saveAs(blob, "Periodo_Vacaciones.xlsx");
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

  /** ****************************************************************************************** **
   ** **                           METODO PARA GENERAR PDF                                    ** **
   ** ****************************************************************************************** **/

  async GenerarPDF(action: any) {
    const pdfMake = await this.validar.ImportarPDF();
    const documentDefinition = this.DefinirInformacionPDF();
    let doc_name = `Periodos_usuarios_${this.opcionBusqueda == 1 ? 'activos' : 'inactivos'}.pdf`;
    switch (action) {
      case 'open': pdfMake.createPdf(documentDefinition).open(); break;
      case 'print': pdfMake.createPdf(documentDefinition).print(); break;
      case 'download': pdfMake.createPdf(documentDefinition).download(doc_name); break;
      default: pdfMake.createPdf(documentDefinition).open(); break;
    }
  }

  DefinirInformacionPDF() {
    return {
      pageSize: 'A4',
      pageOrientation: 'landscape',
      pageMargins: [40, 50, 40, 50],
      watermark: {
        text: this.frase,
        color: 'blue',
        opacity: 0.1,
        bold: true,
        italics: false,
      },
      header: {
        text: 'Impreso por:  ' + localStorage.getItem('fullname_print'),
        margin: 10,
        fontSize: 9,
        opacity: 0.3,
        alignment: 'right',
      },

      footer: function (
        currentPage: any,
        pageCount: any,
        fecha: any,
        hora: any
      ) {
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
                  alignment: 'right',
                  opacity: 0.3,
                },
              ],
            },
          ],
          fontSize: 10,
        };
      },
      content: [
        { image: this.logo, width: 100, margin: [10, -25, 0, 5] },
        {
          text: (localStorage.getItem('name_empresa') as string).toLocaleUpperCase(),
          bold: true,
          fontSize: 14,
          alignment: 'center',
          margin: [0, -30, 0, 5],
        },
        {
          text: `PERIODOS DE VACACIONES USUARIOS - ${this.opcionBusqueda == 1 ? 'ACTIVOS' : 'INACTIVOS'}`,
          bold: true,
          fontSize: 12,
          alignment: 'center',
          margin: [0, 0, 0, 0],
        },
        ...this.EstructurarDatosPDF(this.data_pdf).map((obj) => {
          return obj;
        }),
      ],
      styles: {
        tableHeader: { fontSize: 8, bold: true, alignment: 'center', fillColor: this.p_color },
        tableHeader_secundario: { fontSize: 6, bold: true, alignment: 'center', fillColor: this.p_color },
        centrado: { fontSize: 8, bold: true, alignment: 'center', fillColor: this.p_color, margin: [0, 7, 0, 0] },
        itemsTable: { fontSize: 7 },
        itemsTableInfo: { fontSize: 10, margin: [0, 3, 0, 3], fillColor: this.s_color },
        derecha: { fontSize: 10, margin: [0, 3, 0, 3], fillColor: this.s_color, alignment: 'rigth' },
        itemsTableInfoEmpleado: { fontSize: 9, margin: [0, -1, 0, -2], fillColor: '#E3E3E3' },
        itemsTableCentrado: { fontSize: 7, alignment: 'center' },
        tableMargin: { margin: [0, 0, 0, 0] },
        tableMarginCabecera: { margin: [0, 15, 0, 0] },
        tableMarginCabeceraEmpleado: { margin: [0, 10, 0, 0] },
      },
    };
  }

  // METODO PARA ESTRUCTURAR LA INFORMACION CONSULTADA EN EL PDF
  EstructurarDatosPDF(data: any[]): Array<any> {
    let n: any = [];
    data.forEach((selec: any) => {
      let arr_reg = selec.empleados.map((o: any) => { return o.periodos.length })
      let reg = this.validar.SumarRegistros(arr_reg)
      // NOMBRE DE CABECERAS DEL REPORTE DE ACUERDO CON EL FILTRO DE BUSQUEDA
      let descripcion = '';
      let establecimiento = 'SUCURSAL: ' + selec.sucursal;
      if (this.bool.bool_reg === true) {
        descripcion = 'REGIMEN: ' + selec.nombre;
      }
      else if (this.bool.bool_dep === true) {
        descripcion = 'DEPARTAMENTO: ' + selec.departamento;
      }
      else if (this.bool.bool_cargo === true) {
        descripcion = 'CARGO: ' + selec.nombre;
      }
      else if (this.bool.bool_suc === true) {
        descripcion = 'CIUDAD: ' + selec.ciudad;
      }
      else if (this.bool.bool_emp === true) {
        descripcion = 'LISTA EMPLEADOS';
        establecimiento = '';
      }
      n.push({
        style: 'tableMarginCabecera',
        table: {
          widths: ['*', '*', '*'],
          headerRows: 1,
          body: [
            [
              {
                border: [true, true, false, true],
                bold: true,
                text: descripcion,
                style: 'itemsTableInfo',
              },
              {
                border: [false, true, false, true],
                bold: true,
                text: establecimiento,
                style: 'itemsTableInfo',
              },
              {
                border: [false, true, true, true],
                text: 'N° Registros: ' + reg,
                style: 'derecha',
              },
            ],
          ],
        },
      });

      // PRESENTACION DE LA INFORMACION
      selec.empleados.forEach((empl: any) => {
        // CABECERA INFORMACION REGIMEN
        n.push({
          style: 'tableMarginCabeceraEmpleado',
          table: {
            widths: ['*'],
            headerRows: 1,
            body: [
              [
                {
                  border: [true, true, true, false],
                  text: 'REGIMEN: ' + empl.regimen,
                  style: 'itemsTableInfoEmpleado'
                },
              ]
            ],
          },
        });

        // CABECERA DEPARTAMENTO
        n.push({
          style: 'tableMargin',
          table: {
            widths: ['*', '*'],
            headerRows: 1,
            body: [
              [
                {
                  border: [true, false, false, false],
                  text: 'DEPARTAMENTO: ' + empl.departamento,
                  style: 'itemsTableInfoEmpleado',
                },
                {
                  border: [false, false, true, false],
                  text: 'CARGO: ' + empl.cargo,
                  style: 'itemsTableInfoEmpleado'
                }
              ]
            ],
          },
        });

        // CABECERA EMPLEADO
        n.push({
          style: 'tableMargin',
          table: {
            widths: ['*'],
            headerRows: 1,
            body: [
              [
                {
                  border: [true, false, true, false],
                  text: 'EMPLEADO: ' + empl.apellido + ' ' + empl.nombre,
                  style: 'itemsTableInfoEmpleado',
                }
              ]
            ],
          },
        });

        // CABECERA INFORMACION
        n.push({
          style: 'tableMargin',
          table: {
            widths: ['*', '*', '*'],
            headerRows: 1,
            body: [
              [
                {
                  border: [true, false, false, false],
                  text: 'C.C.: ' + empl.identificacion,
                  style: 'itemsTableInfoEmpleado',
                },
                {
                  border: [false, false, false, false],
                  text: 'COD: ' + empl.codigo,
                  style: 'itemsTableInfoEmpleado'
                },
                {
                  border: [false, false, true, false],
                  text: 'ROL: ' + empl.rol,
                  style: 'itemsTableInfoEmpleado'
                }
              ],
            ],
          },
        });
        console.log(empl)
        n.push({
          style: 'tableMargin',
          table: {
            widths: ['auto', '*', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', '*', 'auto'],
            headerRows: 2,
            body: [
              [
                { rowSpan: 2, text: 'N°', style: 'centrado' },
                { rowSpan: 2, text: 'DESCRIPCIÓN', style: 'centrado' },
                { rowSpan: 1, colSpan: 2, text: 'PERIODO', style: 'tableHeader' },
                {},
                { rowSpan: 1, colSpan: 2, text: 'CARGA INICIAL', style: 'tableHeader' },
                {},
                { rowSpan: 1, colSpan: 2, text: 'CARGA VACACIONES', style: 'tableHeader' },
                {},
                { rowSpan: 1, colSpan: 2, text: 'ANTIGUEDAD', style: 'tableHeader' },
                {},
                { rowSpan: 1, colSpan: 4, text: 'VACACIONES TOTALES', style: 'tableHeader' },
                {},
                {},
                {},
                { rowSpan: 2, text: 'ESTADO', style: 'centrado' },
              ],
              [
                {},
                {},
                { rowSpan: 1, text: 'INICIO', style: 'tableHeader_secundario' },
                { rowSpan: 1, text: 'FIN', style: 'tableHeader_secundario' },
                { rowSpan: 1, text: 'FECHA', style: 'tableHeader_secundario' },
                { rowSpan: 1, text: 'DIAS INICIALES / TRANSFERIDOS', style: 'tableHeader_secundario' },
                { rowSpan: 1, text: 'FECHA', style: 'tableHeader_secundario' },
                { rowSpan: 1, text: 'DIAS CARGADOS', style: 'tableHeader_secundario' },
                { rowSpan: 1, text: 'AÑOS TRANSCURRIDOS', style: 'tableHeader_secundario' },
                { rowSpan: 1, text: 'DÍAS ADICIONALES', style: 'tableHeader_secundario' },
                { rowSpan: 1, text: 'DÍAS PERDIDOS', style: 'tableHeader_secundario' },
                { rowSpan: 1, text: 'DÍAS USADOS', style: 'tableHeader_secundario' },
                { rowSpan: 1, colSpan: 2, text: 'TOTAL', style: 'tableHeader_secundario' },
                {},
                {},
              ],
              ...empl.periodos.map((per: any) => {
                const fecha_inicio = this.validar.FormatearFecha(per.fecha_inicio.split('T')[0], this.formato_fecha, this.validar.dia_abreviado, this.idioma_fechas);
                const fecha_final = this.validar.FormatearFecha(per.fecha_final.split('T')[0], this.formato_fecha, this.validar.dia_abreviado, this.idioma_fechas);
                const fecha_inicial = this.validar.FormatearFecha(per.fecha_desde.split('T')[0], this.formato_fecha, this.validar.dia_abreviado, this.idioma_fechas);
                const fecha_acreditar_vacaciones = this.validar.FormatearFecha(per.fecha_acreditar_vacaciones.split('T')[0], this.formato_fecha, this.validar.dia_abreviado, this.idioma_fechas);
                const formato_hora = this.validar.convertirDiasAHorasMinutos(per.dias_vacacion, empl.hora_trabaja, empl.hora_estandar);
                console.log('hora formato ', formato_hora);
                return [
                  {
                    style: 'itemsTableCentrado',
                    text: empl.periodos.indexOf(per) + 1,
                  },
                  { style: 'itemsTable', text: per.observacion },
                  { style: 'itemsTableCentrado', text: fecha_inicio },
                  { style: 'itemsTableCentrado', text: fecha_final },
                  { style: 'itemsTableCentrado', text: fecha_inicial },
                  {
                    style: 'itemsTableCentrado',
                    text: per.dias_iniciales !== 0
                      ? per.dias_iniciales
                      : (per.saldo_transferido !== 0 ? per.saldo_transferido : per.dias_iniciales)
                  },
                  { style: 'itemsTableCentrado', text: fecha_acreditar_vacaciones },
                  { style: 'itemsTableCentrado', text: per.dias_cargados },
                  { style: 'itemsTableCentrado', text: per.anios_antiguedad },
                  { style: 'itemsTableCentrado', text: per.dias_antiguedad },
                  { style: 'itemsTableCentrado', text: per.dias_perdidos },
                  { style: 'itemsTableCentrado', text: per.usados_dias_vacacion },
                  { style: 'itemsTableCentrado', text: per.dias_vacacion },
                  { style: 'itemsTableCentrado', text: formato_hora },
                  { style: 'itemsTableCentrado', text: per.estado },
                ];
              }),
            ],
          },
          layout: {
            fillColor: function (rowIndex: any) {
              return rowIndex % 2 === 0 ? '#E5E7E9' : null;
            },
          },
        });
      });
    });
    return n;
  }

  /** ****************************************************************************************** **
   **                   VARIOS METODOS COMPLEMENTARIOS AL FUNCIONAMIENTO.                        **
   ** ****************************************************************************************** **/

  // SI EL NUMERO DE ELEMENTOS SELECCIONADOS COINCIDE CON EL NUMERO TOTAL DE FILAS.
  isAllSelectedSuc() {
    const numSelected = this.selectionSuc.selected.length;
    return numSelected === this.sucursales.length
  }

  // SELECCIONA TODAS LAS FILAS SI NO ESTAN TODAS SELECCIONADAS; DE LO CONTRARIO, SELECCION CLARA.
  masterToggleSuc() {
    this.isAllSelectedSuc() ?
      this.selectionSuc.clear() :
      this.sucursales.forEach((row: any) => this.selectionSuc.select(row));
  }

  // LA ETIQUETA DE LA CASILLA DE VERIFICACION EN LA FILA PASADA
  checkboxLabelSuc(row?: ITableEmpleados): string {
    if (!row) {
      return `${this.isAllSelectedSuc() ? 'select' : 'deselect'} all`;
    }
    return `${this.selectionSuc.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1}`;
  }

  // SI EL NUMERO DE ELEMENTOS SELECCIONADOS COINCIDE CON EL NUMERO TOTAL DE FILAS.
  isAllSelectedReg() {
    const numSelected = this.selectionReg.selected.length;
    return numSelected === this.regimen.length;
  }

  // SELECCIONA TODAS LAS FILAS SI NO ESTAN TODAS SELECCIONADAS; DE LO CONTRARIO, SELECCION CLARA.
  masterToggleReg() {
    this.isAllSelectedReg()
      ? this.selectionReg.clear()
      : this.regimen.forEach((row: any) => this.selectionReg.select(row));
  }

  // LA ETIQUETA DE LA CASILLA DE VERIFICACION EN LA FILA PASADA.
  checkboxLabelReg(row?: ITableEmpleados): string {
    if (!row) {
      return `${this.isAllSelectedReg() ? 'select' : 'deselect'} all`;
    }
    return `${this.selectionReg.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1
      }`;
  }

  // SI EL NUMERO DE ELEMENTOS SELECCIONADOS COINCIDE CON EL NUMERO TOTAL DE FILAS.
  isAllSelectedCar() {
    const numSelected = this.selectionCar.selected.length;
    return numSelected === this.cargos.length
  }

  // SELECCIONA TODAS LAS FILAS SI NO ESTAN TODAS SELECCIONADAS; DE LO CONTRARIO, SELECCION CLARA.
  masterToggleCar() {
    this.isAllSelectedCar() ?
      this.selectionCar.clear() :
      this.cargos.forEach((row: any) => this.selectionCar.select(row));
  }

  // LA ETIQUETA DE LA CASILLA DE VERIFICACION EN LA FILA PASADA
  checkboxLabelCar(row?: ITableEmpleados): string {
    if (!row) {
      return `${this.isAllSelectedCar() ? 'select' : 'deselect'} all`;
    }
    return `${this.selectionCar.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1}`;
  }

  // SI EL NUMERO DE ELEMENTOS SELECCIONADOS COINCIDE CON EL NUMERO TOTAL DE FILAS.
  isAllSelectedDep() {
    const numSelected = this.selectionDep.selected.length;
    return numSelected === this.departamentos.length
  }

  // SELECCIONA TODAS LAS FILAS SI NO ESTAN TODAS SELECCIONADAS; DE LO CONTRARIO, SELECCION CLARA.
  masterToggleDep() {
    this.isAllSelectedDep() ?
      this.selectionDep.clear() :
      this.departamentos.forEach((row: any) => this.selectionDep.select(row));
  }

  // LA ETIQUETA DE LA CASILLA DE VERIFICACION EN LA FILA PASADA
  checkboxLabelDep(row?: ITableEmpleados): string {
    if (!row) {
      return `${this.isAllSelectedDep() ? 'select' : 'deselect'} all`;
    }
    return `${this.selectionDep.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1}`;
  }

  // SI EL NUMERO DE ELEMENTOS SELECCIONADOS COINCIDE CON EL NUMERO TOTAL DE FILAS.
  isAllSelectedEmp() {
    const numSelected = this.selectionEmp.selected.length;
    return numSelected === this.empleados.length
  }

  // SELECCIONA TODAS LAS FILAS SI NO ESTAN TODAS SELECCIONADAS; DE LO CONTRARIO, SELECCION CLARA.
  masterToggleEmp() {
    this.isAllSelectedEmp() ?
      this.selectionEmp.clear() :
      this.empleados.forEach((row: any) => this.selectionEmp.select(row));
  }

  // LA ETIQUETA DE LA CASILLA DE VERIFICACION EN LA FILA PASADA
  checkboxLabelEmp(row?: ITableEmpleados): string {
    if (!row) {
      return `${this.isAllSelectedEmp() ? 'select' : 'deselect'} all`;
    }
    return `${this.selectionEmp.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1}`;
  }

  // METODO PARA EVENTOS DE PAGINACION
  ManejarPagina(e: PageEvent) {
    if (this.bool.bool_suc === true) {
      this.tamanio_pagina_suc = e.pageSize;
      this.numero_pagina_suc = e.pageIndex + 1;
    }
    else if (this.bool.bool_reg === true) {
      this.tamanio_pagina_reg = e.pageSize;
      this.numero_pagina_reg = e.pageIndex + 1;
    }
    else if (this.bool.bool_cargo === true) {
      this.tamanio_pagina_car = e.pageSize;
      this.numero_pagina_car = e.pageIndex + 1;
    }
    else if (this.bool.bool_dep === true) {
      this.tamanio_pagina_dep = e.pageSize;
      this.numero_pagina_dep = e.pageIndex + 1;
    }
    else if (this.bool.bool_emp === true) {
      this.tamanio_pagina_emp = e.pageSize;
      this.numero_pagina_emp = e.pageIndex + 1;
    }
  }

  // METODO PARA MANEJAR PAGINACION DETALLE
  ManejarPaginaDetalle(e: PageEvent) {
    this.numero_pagina = e.pageIndex + 1;
    this.tamanio_pagina = e.pageSize;
  }

  // METODOS PARA CONTROLAR INGRESO DE LETRAS
  IngresarSoloLetras(e: any) {
    return this.validar.IngresarSoloLetras(e);
  }

  // METODOS PARA CONTROLAR INGRESO DE NUMEROS
  IngresarSoloNumeros(evt: any) {
    return this.validar.IngresarSoloNumeros(evt);
  }


}
