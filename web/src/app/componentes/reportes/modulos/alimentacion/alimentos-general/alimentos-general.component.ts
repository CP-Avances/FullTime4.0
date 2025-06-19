import { Validators, FormControl, FormGroup } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { PageEvent } from '@angular/material/paginator';
import { DateTime } from 'luxon';
import { Router } from '@angular/router';

// LIBRERIA PARA GENERAR ARCHIVOS EXCEL

// LLAMADA DE SERVICIOS GENERALES
import { HorasExtrasRealesService } from 'src/app/servicios/reportes/modulos/horasExtrasReales/horas-extras-reales.service';
import { DatosGeneralesService } from 'src/app/servicios/generales/datosGenerales/datos-generales.service';
import { ValidacionesService } from '../../../../../servicios/generales/validaciones/validaciones.service';
import { AlimentacionService } from 'src/app/servicios/reportes/modulos/alimentacion/alimentacion.service';
import { EmpleadoService } from 'src/app/servicios/usuarios/empleado/empleadoRegistro/empleado.service';
import { ReportesService } from 'src/app/servicios/reportes/opcionesReportes/reportes.service';
import { EmpresaService } from 'src/app/servicios/configuracion/parametrizacion/catEmpresa/empresa.service';

@Component({
  selector: 'app-alimentos-general',
  standalone: false,
  templateUrl: './alimentos-general.component.html',
  styleUrls: ['./alimentos-general.component.css'],
})

export class AlimentosGeneralComponent implements OnInit {

  // Datos del Empleado Timbre
  empleado: any = [];

  // Arreglo datos del empleado
  datosEmpleado: any = [];

  // Datos del Formulario de BUSQUEDA
  codigo = new FormControl('');
  cedula = new FormControl('', [Validators.minLength(2)]);
  nombre = new FormControl('', [Validators.minLength(2)]);
  apellido = new FormControl('', [Validators.minLength(2)]);
  departamentoF = new FormControl('', [Validators.minLength(2)]);
  regimenF = new FormControl('', [Validators.minLength(2)]);
  cargoF = new FormControl('', [Validators.minLength(2)]);

  // Datos del Formulario de Periodo
  fechaInicialF = new FormControl('', [Validators.required]);
  fechaFinalF = new FormControl('', [Validators.required]);

  // Formulario de Periodo
  public fechasForm = new FormGroup({
    inicioForm: this.fechaInicialF,
    finalForm: this.fechaFinalF,
  });

  // Datos de filtros de BUSQUEDA
  filtroCodigo: number;
  filtroCedula: '';
  filtroNombre: '';
  filtroApellido: '';
  filtroDepartamento: '';
  filtroRegimen: '';
  filtroCargo: '';

  // ITEMS DE PAGINACION DE LA TABLA
  tamanio_pagina: number = 5;
  numero_pagina: number = 1;
  pageSizeOptions = [5, 10, 20, 50];

  // Datos del empleado Logueado
  empleadoLogueado: any = [];
  idEmpleado: number;

  constructor(
    public rest: EmpleadoService,
    public restH: HorasExtrasRealesService,
    public restR: ReportesService,
    public restEmpre: EmpresaService,
    public restD: DatosGeneralesService,
    public restA: AlimentacionService,
    public router: Router,
    private toastr: ToastrService,
    private validar: ValidacionesService
  ) {
    this.idEmpleado = parseInt(localStorage.getItem('empleado') as string);
  }

  ngOnInit(): void {
    this.ObtenerEmpleadoLogueado(this.idEmpleado);
    this.VerDatosEmpleado();
    this.ObtenerLogo();
    this.ObtenerColores();
  }

  // METODO PARA VER LA INFORMACION DEL EMPLEADO
  ObtenerEmpleadoLogueado(idemploy: any) {
    this.empleadoLogueado = [];
    this.rest.BuscarUnEmpleado(idemploy).subscribe(data => {
      this.empleadoLogueado = data;
      console.log('emple', this.empleadoLogueado)
    })
  }

  // METODO PARA OBTENER EL LOGO DE LA EMPRESA
  logo: any = String;
  ObtenerLogo() {
    this.restEmpre.LogoEmpresaImagenBase64(localStorage.getItem('empresa') as string).subscribe(res => {
      this.logo = 'data:image/jpeg;base64,' + res.imagen;
    });
  }

  // METODO para obtener colores de empresa
  p_color: any;
  s_color: any;
  empresa: any;
  frase: any;
  ObtenerColores() {
    this.restEmpre.ConsultarDatosEmpresa(parseInt(localStorage.getItem('empresa') as string)).subscribe(res => {
      this.p_color = res[0].color_principal;
      this.s_color = res[0].color_secundario;
      this.empresa = res[0].nombre;
      this.frase = res[0].marca_agua;
    });
  }

  // EVENTO PARA MANEJAR LA PAGINACION
  ManejarPagina(e: PageEvent) {
    this.tamanio_pagina = e.pageSize;
    this.numero_pagina = e.pageIndex + 1;
  }

  // Lista de datos de empleados
  VerDatosEmpleado() {
    this.datosEmpleado = [];
    this.restD.ListarInformacionActual().subscribe(data => {
      this.datosEmpleado = data;
      console.log('datos_actuales', this.datosEmpleado)
    });
  }

  // Control para verificar ingreso de fechas
  timbres: any = [];
  planificados: any = [];
  solicitados: any = [];
  extras: any = [];
  inicio: any;
  fin: any;
  VerFechas(form, archivo) {
    if (Date.parse(form.inicioForm) <= Date.parse(form.finalForm)) {
      let fechas = {
        fec_inicio: form.inicioForm,
        fec_final: form.finalForm
      }
      this.inicio = DateTime.fromISO(form.inicioForm).toFormat('yyyy-MM-dd');
      this.fin = DateTime.fromISO(form.finalForm).toFormat('yyyy-MM-dd');
      console.log('fechas', DateTime.fromISO(this.inicio).toFormat('yyyy-MM-dd'), this.fin)
      // Limpiar array de datos
      this.planificados = [];
      this.solicitados = [];
      this.extras = [];
      // 1. Buscamos registros de servicios planificados
      this.restA.ObtenerPlanificadosConsumidos(fechas).subscribe(plan => {
        this.planificados = plan;
        // 2. Buscamos registros de servicios solicitados
        this.restA.ObtenerSolicitadosConsumidos(fechas).subscribe(sol => {
          this.solicitados = sol;
          // 3. METODO de BUSQUEDA de registros de servicios extras
          this.ObtenerExtrasConsumidos(fechas, archivo, form);
        }, err => {
          // 4. METODO de BUSQUEDA de registros de servicios extras
          this.ObtenerExtrasConsumidos(fechas, archivo, form);
          return this.validar.RedireccionarHomeAdmin(err.error)
        });
      }, err => {
        // 5. Buscamos registros de servicios solicitados
        this.restA.ObtenerSolicitadosConsumidos(fechas).subscribe(sol => {
          this.solicitados = sol;
          // 6. METODO de BUSQUEDA de registros de servicios extras
          this.ObtenerExtrasConsumidos(fechas, archivo, form);
        }, err => {
          // 7. METODO de BUSQUEDA de registros de servicios extras
          this.ObtenerExtrasConsumidos(fechas, archivo, form);
          return this.validar.RedireccionarHomeAdmin(err.error)
        });

        return this.validar.RedireccionarHomeAdmin(err.error)
      });
    }
    else {
      this.toastr.info('La fecha de inicio de Periodo no puede ser posterior a la fecha de fin de Periodo.', 'VERIFICAR', {
        timeOut: 6000,
      });
    }
  }

  // METODO de BUSQUEDA de registros de servicios extras
  ObtenerExtrasConsumidos(fecha, archivo, form) {
    // 1. BUSQUEDA de servicios extras planificados
    this.restA.ObtenerExtrasPlanConsumidos(fecha).subscribe(plan => {
      this.extras = plan;
      console.log('comidas 1', this.extras);
      // 2. BUSQUEDA de servicios extras solicitados
      this.restA.ObtenerExtrasSolConsumidos(fecha).subscribe(sol => {
        this.extras = this.extras.concat(sol);
        console.log('comidas 2', this.extras);
        // Llamado a METODO de impresión de archivos
        this.ImprimirArchivo(archivo, form);
      }, err => {
        // Llamado a METODO de impresión de archivos
        this.ImprimirArchivo(archivo, form);
        return this.validar.RedireccionarHomeAdmin(err.error)
      });
    }, err => {
      // 3. BUSQUEDA de servicios extras solicitados
      this.restA.ObtenerExtrasSolConsumidos(fecha).subscribe(sol2 => {
        this.extras = sol2;
        console.log('comidas 3', this.extras);
        // Llamado a METODO de impresión de archivos
        this.ImprimirArchivo(archivo, form);
      }, err => {
        // Revisamos si todos los datos son vacios
        if (this.planificados.length === 0 && this.solicitados.length === 0 && this.extras.length === 0) {
          // Mensaje indicando que no existen registros
          this.toastr.info('No existen registros en el periodo indicado.', 'Dar click aquí, para obtener reporte, en el que se indica que no existen registros.', {
            timeOut: 10000,
          }).onTap.subscribe(obj => {
            // Llamado a METODO de impresión de archivo sin registros
            this.GenerarPdf('open');
            this.LimpiarFechas();
          });
        }
        else {
          // Llamado a METODO de impresión de archivos
          this.ImprimirArchivo(archivo, form);
        }

        return this.validar.RedireccionarHomeAdmin(err.error)
      });

      return this.validar.RedireccionarHomeAdmin(err.error)
    });
  }

  ImprimirArchivo(archivo: string, form) {
    if (archivo === 'pdf') {
      this.GenerarPdf('open');
      this.LimpiarFechas();
    }
    else if (archivo === 'excel') {
      this.exportToExcelAlimentacion(form);
      this.LimpiarFechas();
    }
  }

  IngresarSoloLetras(e: any) {
    return this.validar.IngresarSoloLetras(e)
  }

  IngresarSoloNumeros(evt: any) {
    return this.validar.IngresarSoloNumeros(evt)
  }

  LimpiarCampos() {
    this.codigo.reset();
    this.cedula.reset();
    this.nombre.reset();
    this.apellido.reset();
    this.departamentoF.reset();
    this.regimenF.reset();
    this.cargoF.reset();
  }

  LimpiarFechas() {
    this.fechaInicialF.reset();
    this.fechaFinalF.reset();
  }

  /* ****************************************************************************************************
   *                               PARA LA EXPORTACION DE ARCHIVOS PDF
   * ****************************************************************************************************/


  async GenerarPdf(action = 'open') {
    if (this.planificados.length === 0 && this.solicitados.length === 0 && this.extras.length === 0) {
      const pdfMake = await this.validar.ImportarPDF();
      const documentDefinition_ = this.GenerarSinRegstros();
      switch (action) {
        case 'open': pdfMake.createPdf(documentDefinition_).open(); break;
        case 'print': pdfMake.createPdf(documentDefinition_).print(); break;
        case 'download': pdfMake.createPdf(documentDefinition_).download(); break;
        default: pdfMake.createPdf(documentDefinition_).open(); break;
      }
    }
    else {
      const pdfMake = await this.validar.ImportarPDF();
      const documentDefinition = this.DefinirInformacionPDF();
      switch (action) {
        case 'open': pdfMake.createPdf(documentDefinition).open(); break;
        case 'print': pdfMake.createPdf(documentDefinition).print(); break;
        case 'download': pdfMake.createPdf(documentDefinition).download(); break;
        default: pdfMake.createPdf(documentDefinition).open(); break;
      }
    }
  }

  DefinirInformacionPDF() {

    sessionStorage.setItem('Administrador', this.empleadoLogueado);

    return {

      // ENCABEZADO DE LA PAGINA
      pageSize: 'A4',
      pageOrientation: 'landscape',
      watermark: { text: this.frase, color: 'blue', opacity: 0.1, bold: true, italics: false },
      header: { text: 'Impreso por:  ' + this.empleadoLogueado[0].nombre + ' ' + this.empleadoLogueado[0].apellido, margin: 10, fontSize: 9, opacity: 0.3, alignment: 'right' },

      // PIE DE LA PAGINA
      footer: function (currentPage: any, pageCount: any, fecha: any, hora: any) {
        let f = DateTime.now();
        fecha = f.toFormat('yyyy-MM-dd');
        let time = f.toFormat('HH:mm:ss');
        return {
          margin: 10,
          columns: [
            {
              text: [{
                text: 'Fecha: ' + fecha + ' Hora: ' + time,
                alignment: 'left', opacity: 0.3
              }]
            },
            {
              text: [{
                text: '© Pag ' + currentPage.toString() + ' de ' + pageCount, alignment: 'right', opacity: 0.3
              }],
            }
          ], fontSize: 10
        }
      },
      content: [
        { image: this.logo, width: 150, margin: [10, -25, 0, 5] },
        { text: this.empresa.toUpperCase(), bold: true, fontSize: 25, alignment: 'center', margin: [0, -30, 0, 5] },
        { text: 'REPORTE ALIMENTOS CONSUMIDOS', fontSize: 17, alignment: 'center', margin: [0, 0, 0, 5] },
        this.presentarEncabezado('TOTAL DE ALIMENTOS PLANIFICADOS CONSUMIDOS'),
        this.presentarAlimentacion(this.planificados),
        this.presentarTotales(this.planificados),
        this.presentarEspacio(),
        this.presentarEncabezado('TOTAL DE ALIMENTOS SOLICITADOS CONSUMIDOS'),
        this.presentarAlimentacion(this.solicitados),
        this.presentarTotales(this.solicitados),
        this.presentarEspacio(),
        this.presentarEncabezado('TOTAL DE ALIMENTOS EXTRAS CONSUMIDOS'),
        this.presentarAlimentacion(this.extras),
        this.presentarTotales(this.extras),
        this.presentarEspacio_(),
        this.presentarSumatoriaTotal(this.planificados, this.solicitados, this.extras),
      ],
      styles: {
        tableHeader: { fontSize: 10, bold: true, alignment: 'center', fillColor: this.p_color },
        itemsTableD: { fontSize: 9, alignment: 'center' },
        itemsTableI: { fontSize: 9, alignment: 'center' },
        itemsTableT: { fontSize: 10, alignment: 'center', bold: true },
        centrado: { fontSize: 10, bold: true, alignment: 'center', fillColor: this.p_color, margin: [0, 5, 0, 5] },
        ver: { fontSize: 10, bold: true, alignment: 'center', border: false }
      }
    };
  }

  presentarEncabezado(titulo: any) {
    return {
      table: {
        widths: ['*'],
        body: [
          [{ text: titulo, style: 'tableHeader' },],
          [{
            columns: [
              { text: [{ text: 'FECHA INICIO: ' + this.inicio, style: 'itemsTableI' }] },
              { text: [{ text: 'FECHA FIN: ' + this.fin, style: 'itemsTableI' }] },
            ]
          }],
        ]
      },
      layout: {
        hLineColor: function (i, node) {
          return (i === 0 || i === node.table.body.length) ? 'rgb(80,87,97)' : 'rgb(80,87,97)';
        },
        paddingLeft: function (i, node) { return 40; },
        paddingRight: function (i, node) { return 40; },
        paddingTop: function (i, node) { return 6; },
        paddingBottom: function (i, node) { return 6; }
      }
    }
  }

  presentarEspacio() {
    return {
      table: {
        widths: ['*'],
        body: [
          [{ text: '', style: 'ver', margin: [0, 10, 0, 10] },],
        ]
      },
      layout:
        'noBorders'
    }
  }

  presentarEspacio_() {
    return {
      table: {
        widths: ['*'],
        body: [
          [{ text: '', style: 'ver', margin: [0, 5, 0, 5] },],
        ]
      },
      layout:
        'noBorders'
    }
  }

  presentarTotales(arreglo: any) {
    var t_cantida = 0, t_costo = 0, t_total = 0;
    arreglo.forEach((obj: any) => {
      t_cantida = t_cantida + parseInt(obj.cantidad),
        t_costo = t_costo + parseFloat(obj.valor),
        t_total = t_total + parseFloat(obj.total)
    })
    return {
      table: {
        widths: ['*', '*', '*', '*', '*', '*', '*'],
        body: [
          [
            { colSpan: 4, text: 'TOTAL: ', style: 'itemsTableT', fillColor: this.s_color },
            '', '', '',
            { text: t_cantida, style: 'itemsTableT', fillColor: this.s_color },
            { text: '$ ' + t_costo.toFixed(2), style: 'itemsTableT', fillColor: this.s_color },
            { text: '$ ' + t_total.toFixed(2), style: 'itemsTableT', fillColor: this.s_color },
          ]
        ]
      },
      layout: {
        hLineColor: function (i, node) {
          return (i === 0 || i === node.table.body.length) ? 'rgb(80,87,97)' : 'rgb(80,87,97)';
        },
        vLineColor: function (i, node) {
          return (i === 0 || i === node.table.body.length) ? 'rgb(80,87,97)' : 'rgb(80,87,97)';
        },
        paddingLeft: function (i, node) { return 20; },
        paddingRight: function (i, node) { return 20; },
        paddingTop: function (i, node) { return 6; },
        paddingBottom: function (i, node) { return 6; }
      }
    }
  }

  presentarSumatoriaTotal(arreglo1: any, arreglo2: any, arreglo3: any) {
    var t_total1 = 0;
    var t_total2 = 0;
    var t_total3 = 0;
    var suma_total = 0;
    arreglo1.forEach((obj1: any) => {
      t_total1 = t_total1 + parseFloat(obj1.total)
    })
    arreglo2.forEach((obj2: any) => {
      t_total2 = t_total2 + parseFloat(obj2.total)
    })
    arreglo3.forEach((obj3: any) => {
      t_total3 = t_total3 + parseFloat(obj3.total)
    })
    suma_total = t_total1 + t_total2 + t_total3;
    console.log('totales', t_total1, ' ', t_total2, ' ', t_total3, ' ', suma_total)
    return {
      table: {
        widths: ['*', '*', '*', '*', '*', '*', '*'],
        body: [
          [
            { colSpan: 6, text: 'SUMATORIA TOTAL DE ALIMENTOS CONSUMIDOS: ', style: 'itemsTableT', fillColor: this.s_color, fontSize: 12 },
            '', '', '', '', '',
            { text: '$ ' + suma_total.toFixed(2), style: 'itemsTableT', fillColor: this.s_color, fontSize: 12 }
          ]
        ]
      },
      layout: {
        hLineColor: function (i, node) {
          return (i === 0 || i === node.table.body.length) ? 'rgb(80,87,97)' : 'rgb(80,87,97)';
        },
        vLineColor: function (i, node) {
          return (i === 0 || i === node.table.body.length) ? 'rgb(80,87,97)' : 'rgb(80,87,97)';
        },
        paddingLeft: function (i, node) { return 20; },
        paddingRight: function (i, node) { return 20; },
        paddingTop: function (i, node) { return 6; },
        paddingBottom: function (i, node) { return 6; }
      }
    }
  }

  accionT: string;
  contarRegistros: number = 0;
  presentarAlimentacion(arreglo: any) {
    return {
      table: {
        widths: ['*', '*', '*', 'auto', '*', '*', '*'],
        body: [
          [
            { text: 'TIPO COMIDA', style: 'centrado' },
            { text: 'MENÚ', style: 'centrado' },
            { text: 'PLATO', style: 'centrado' },
            { text: 'DESCRIPCIÓN', style: 'centrado' },
            { text: 'CANTIDAD', style: 'centrado' },
            { text: 'COSTO', style: 'centrado' },
            { text: 'COSTO TOTAL', style: 'centrado' },
          ],
          ...arreglo.map((obj: any) => {
            return [
              { text: obj.comida_tipo, style: 'itemsTableD' },
              { text: obj.menu, style: 'itemsTableD' },
              { text: obj.plato, style: 'itemsTableD' },
              { text: obj.observacion, style: 'itemsTableD' },
              { text: obj.cantidad, style: 'itemsTableD' },
              { text: '$ ' + obj.valor, style: 'itemsTableD' },
              { text: '$ ' + obj.total.toFixed(2), style: 'itemsTableD' },
            ];
          })
        ]
      },
      // Estilo de colores formato zebra
      layout: {
        fillColor: function (i, node) {
          return (i % 2 === 0) ? '#CCD1D1' : null;
        }
      }
    };
  }

  /** GENERACIÓN DE PDF AL NO CONTAR CON REGISTROS */
  GenerarSinRegstros() {

    sessionStorage.setItem('Administrador', this.empleadoLogueado);

    return {

      // ENCABEZADO DE LA PAGINA
      pageSize: 'A4',
      //pageOrientation: 'landscape',
      watermark: { text: this.frase, color: 'blue', opacity: 0.1, bold: true, italics: false },
      header: { text: 'Impreso por:  ' + this.empleadoLogueado[0].nombre + ' ' + this.empleadoLogueado[0].apellido, margin: 10, fontSize: 9, opacity: 0.3, alignment: 'right' },

      // PIE DE LA PAGINA
      footer: function (currentPage: any, pageCount: any, fecha: any, hora: any) {
        let f = DateTime.now();
        fecha = f.toFormat('yyyy-MM-dd');
        let time = f.toFormat('HH:mm:ss');
        return {
          margin: 10,
          columns: [
            {
              text: [{
                text: 'Fecha: ' + fecha + ' Hora: ' + time,
                alignment: 'left', opacity: 0.3
              }]
            },
            {
              text: [{
                text: '© Pag ' + currentPage.toString() + ' de ' + pageCount, alignment: 'right', opacity: 0.3
              }],
            }
          ], fontSize: 10
        }
      },
      content: [
        { image: this.logo, width: 150, margin: [10, -25, 0, 5] },
        { text: this.empresa.toUpperCase(), bold: true, fontSize: 25, alignment: 'center', margin: [0, -30, 0, 5] },
        { text: 'REPORTE ALIMENTOS CONSUMIDOS', fontSize: 17, alignment: 'center', margin: [0, 0, 0, 5] },
        this.presentarEspacio(),
        {
          text: [{ text: 'FECHA INICIO: ' + this.inicio, alignment: 'center', margin: [0, 0, 0, 5] },
          { text: '   -   FECHA FIN: ' + this.fin, alignment: 'center', margin: [0, 0, 0, 5] }]
        },
        this.presentarEspacio(),
        { text: 'NO EXISTEN REGISTROS DE SERVICIOS DE ALIMENTACIÓN', fontSize: 15, alignment: 'center', margin: [0, 0, 0, 10] },
      ],
    };
  }

  /******************************************************************************************************
    *                                       METODO PARA EXPORTAR A EXCEL
    ******************************************************************************************************/
  exportToExcelAlimentacion(form: any) {
    /*
    var j = 0;
    const wsp: xlsx.WorkSheet = xlsx.utils.json_to_sheet(this.planificados.map((obj: any) => {
      return {
        N_REGISTROS: j = j + 1,
        TIPO_COMIDA: obj.comida_tipo,
        MENU: obj.menu,
        PLATO: obj.plato,
        DESCRIPCION: obj.observacion,
        CANTIDAD: parseInt(obj.cantidad),
        COSTO: obj.valor,
        COSTO_TOTAL: obj.total,
      }
    }));
    if (this.planificados.length != 0) {
      const header = Object.keys(this.planificados[0]); // columns name
      var wscols: any = [];
      for (var i = 0; i < header.length; i++) {  // columns length added
        wscols.push({ wpx: 110 })
      }
      wsp["!cols"] = wscols;
    }

    var i = 0;
    const wss: xlsx.WorkSheet = xlsx.utils.json_to_sheet(this.solicitados.map((obj: any) => {
      return {
        N_REGISTROS: i = i + 1,
        TIPO_COMIDA: obj.comida_tipo,
        MENU: obj.menu,
        PLATO: obj.plato,
        DESCRIPCION: obj.observacion,
        CANTIDAD: parseInt(obj.cantidad),
        COSTO: obj.valor,
        COSTO_TOTAL: obj.total,
      }
    }));
    if (this.solicitados.length != 0) {
      const header2 = Object.keys(this.solicitados[0]); // columns name
      var wscols2: any = [];
      for (var i = 0; i < header2.length; i++) {  // columns length added
        wscols2.push({ wpx: 110 })
      }
      wss["!cols"] = wscols2;
    }

    var k = 0;
    const wse: xlsx.WorkSheet = xlsx.utils.json_to_sheet(this.extras.map((obj: any) => {
      return {
        N_REGISTROS: k = k + 1,
        TIPO_COMIDA: obj.comida_tipo,
        MENU: obj.menu,
        PLATO: obj.plato,
        DESCRIPCION: obj.observacion,
        CANTIDAD: parseInt(obj.cantidad),
        COSTO: obj.valor,
        COSTO_TOTAL: obj.total,
      }
    }));
    if (this.extras.length != 0) {
      const header3 = Object.keys(this.extras[0]); // columns name
      var wscols3: any = [];
      for (var i = 0; i < header3.length; i++) {  // columns length added
        wscols3.push({ wpx: 110 })
      }
      wse["!cols"] = wscols3;
    }

    const wb: xlsx.WorkBook = xlsx.utils.book_new();
    if (this.planificados.length != 0) {
      xlsx.utils.book_append_sheet(wb, wsp, 'Alimentos Planificados');
    }
    if (this.solicitados.length != 0) {
      xlsx.utils.book_append_sheet(wb, wss, 'Alimentos Solicitados');
    }
    if (this.extras.length != 0) {
      xlsx.utils.book_append_sheet(wb, wse, 'Alimentos Extras');
    }
    xlsx.writeFile(wb, "Alimentacion - " + DateTime.fromFormat(form.inicioForm, 'yyyy/MM/dd').toFormat('dd/MM/yyyy') + ' - ' + DateTime.fromFormat(form.finalForm, 'yyyy/MM/dd').format('dd/MM/yyyy') + '.xlsx');
  */
  }

}
