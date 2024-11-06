
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { DateTime } from 'luxon';

import { ToastrService } from 'ngx-toastr';
import { MainNavService } from 'src/app/componentes/generales/main-nav/main-nav.service';
import { EmpresaService } from 'src/app/servicios/configuracion/parametrizacion/catEmpresa/empresa.service';
import { GraficasService } from 'src/app/servicios/graficas/graficas.service';
import { ValidacionesService } from 'src/app/servicios/generales/validaciones/validaciones.service';

import * as pdfMake from 'pdfmake/build/pdfmake.js';
import * as pdfFonts from 'pdfmake/build/vfs_fonts.js';
pdfMake.vfs = pdfFonts.pdfMake.vfs;

import * as echarts from 'echarts/core';
import { TooltipComponent, LegendComponent, DatasetComponent, GridComponent } from 'echarts/components';
import { BarChart } from 'echarts/charts';
import { CanvasRenderer } from 'echarts/renderers';

@Component({
  selector: 'app-tiempo-jornada-vs-hora-ext-macro',
  templateUrl: './tiempo-jornada-vs-hora-ext-macro.component.html',
  styleUrls: ['./tiempo-jornada-vs-hora-ext-macro.component.css'],

})
export class TiempoJornadaVsHoraExtMacroComponent implements OnInit {

  anio_inicio = new FormControl('', Validators.required);
  anio_final = new FormControl('', Validators.required);

  public fechasConsultaForm = new FormGroup({
    fec_inicio: this.anio_inicio,
    fec_final: this.anio_final
  });

  habilitar: boolean = false;
  f_inicio_req: string = '';
  f_final_req: string = '';

  tiempo_jornada: any;
  datos_tiempo: any = [];

  get habilitarHorasE(): boolean { return this.funciones.horasExtras; }

  constructor(
    private restGraficas: GraficasService,
    private toastr: ToastrService,
    private restEmpre: EmpresaService,
    private funciones: MainNavService,
    private validar: ValidacionesService,
  ) {
    this.ObtenerLogo();
    this.ObtenerColores();
  }

  ngOnInit(): void {
    if (this.habilitarHorasE === false) {
      let mensaje = {
        access: false,
        title: `Ups!!! al parecer no tienes activado en tu plan el Módulo de Horas Extras. \n`,
        message: '¿Te gustaría activarlo? Comunícate con nosotros.',
        url: 'www.casapazmino.com.ec'
      }
      return this.validar.RedireccionarHomeAdmin(mensaje);
    }
    else {
      echarts.use(
        [TooltipComponent, DatasetComponent, GridComponent, LegendComponent, BarChart, CanvasRenderer]
      );
      this.llamarGraficaOriginal();
    }
  }

  thisChart: any;
  chartDom: any;
  llamarGraficaOriginal() {
    let local = sessionStorage.getItem('tiempo_jornada');
    //
    this.chartDom = document.getElementById('charts_tiempo_jor_macro') as HTMLCanvasElement;
    this.thisChart = echarts.init(this.chartDom, 'light', { width: 1050, renderer: 'svg', devicePixelRatio: 5 });

    if (local === null) {
      this.restGraficas.MetricaTiempoJornadaHoraExtraMicro().subscribe(res => {
        // console.log('************* Tiempo jornada Micro **************');
        // console.log(res);
        sessionStorage.setItem('tiempo_jornada', JSON.stringify(res))
        this.tiempo_jornada = res.datos_grafica;
        this.datos_tiempo = res.datos;
        this.thisChart.setOption(res.datos_grafica);
      });
    } else {
      let data_JSON = JSON.parse(local);
      this.tiempo_jornada = data_JSON.datos_grafica;
      this.datos_tiempo = data_JSON.datos;
      this.thisChart.setOption(data_JSON.datos_grafica);
    }
    this.llenarFecha();
  }

  llenarFecha() {
    var f_i = new Date()
    var f_f = new Date()
    f_i.setUTCDate(1); f_i.setUTCMonth(0);
    f_f.setUTCMonth(f_f.getMonth()); f_f.setUTCDate(f_f.getDate());
    this.f_inicio_req = f_i.toJSON().split('T')[0]
    this.f_final_req = f_f.toJSON().split('T')[0]
  }

  ValidarRangofechas(form: any) {
    var f_i = new Date(form.fec_inicio)
    var f_f = new Date(form.fec_final)

    if (f_i < f_f) {

      if (f_i.getFullYear() === f_f.getFullYear()) {
        this.toastr.success('Fechas validas', '', {
          timeOut: 6000,
        });

        this.f_inicio_req = f_i.toJSON().split('T')[0];
        this.f_final_req = f_f.toJSON().split('T')[0];
        this.habilitar = true

        this.restGraficas.MetricaTiempoJornadaHoraExtraMacro(this.f_inicio_req, this.f_final_req).subscribe(res => {
          console.log('#################### Tiempo Jornada hora extra Macro #######################');
          console.log(res);
          this.tiempo_jornada = res.datos_grafica;
          this.datos_tiempo = res.datos;
          this.thisChart.setOption(res.datos_grafica);
        });
      } else {
        this.toastr.error('Años de consulta diferente', 'Solo puede consultar datos de un año en concreto', {
          timeOut: 6000,
        });
      }

    } else if (f_i > f_f) {
      this.toastr.info('Fecha final es menor a la fecha inicial', '', {
        timeOut: 6000,
      });
      this.fechasConsultaForm.reset();
    } else if (f_i.toLocaleDateString() === f_f.toLocaleDateString()) {
      this.toastr.info('Fecha inicial es igual a la fecha final', '', {
        timeOut: 6000,
      });
      this.fechasConsultaForm.reset();
    }
    console.log(f_i.toJSON());
    console.log(f_f.toJSON());
  }

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

  graficaBase64: any;
  metodosPDF(accion) {
    this.graficaBase64 = this.thisChart.getDataURL({ type: 'jpg', pixelRatio: 5 });
    this.generarPdf(accion)
  }

  generarPdf(action) {
    const documentDefinition = this.DefinirInformacionPDF();
    var f = new Date()
    let doc_name = "metrica_TiempoJ_VS_HoraE" + f.toLocaleString() + ".pdf";
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
      pageOrientation: 'portrait',
      pageMargins: [30, 60, 30, 40],
      watermark: { text: this.frase, color: 'blue', opacity: 0.1, bold: true, italics: false },
      header: { text: 'Impreso por:  ' + localStorage.getItem('fullname_print'), margin: 10, fontSize: 9, opacity: 0.3, alignment: 'right' },

      footer: function (currentPage: any, pageCount: any, fecha: any, hora: any) {
        let f = DateTime.now();
        fecha = f.toFormat('yyyy-MM-dd');
        let time = f.toFormat('HH:mm:ss');
        return [
          {
            table: {
              widths: ['auto', 'auto'],
              body: [
                [
                  { text: 'HE: ', bold: true, border: [false, false, false, false], style: ['quote', 'small'] },
                  { text: 'Hora extra en tiempo decimal.', border: [false, false, false, false], style: ['quote', 'small'] },
                ],
                [
                  { text: 'TJ ', bold: true, border: [false, false, false, false], style: ['quote', 'small'] },
                  { text: 'Tiempo de jornada.', border: [false, false, false, false], style: ['quote', 'small'] },
                ]
              ]
            }
          },
          {
            margin: 10,
            columns: [
              { text: 'Fecha: ' + fecha + ' Hora: ' + time, opacity: 0.3 },
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
        ]
      },
      content: [
        { image: this.logo, width: 100, margin: [10, -25, 0, 5] },
        { text: 'Métrica Tiempo Jornada VS Horas Extras', bold: true, fontSize: 15, alignment: 'center', margin: [0, -40, 0, 10] },
        { text: 'Desde: ' + this.f_inicio_req + " Hasta: " + this.f_final_req, bold: true, fontSize: 13, alignment: 'center' },
        { image: this.graficaBase64, width: 550, margin: [0, 10, 0, 10] },
        this.ImprimirDatos(),
        { text: this.texto_grafica, margin: [0, 10, 0, 10], alignment: 'justify' },
      ],
      styles: {
        tableHeader: { fontSize: 10, bold: true, alignment: 'center', fillColor: this.p_color },
        itemsTable: { fontSize: 8 },
        itemsTableD: { fontSize: 8, alignment: 'center' }
      }
    };
  }

  ImprimirDatos() {
    let datos = this.tiempo_jornada.dataset.source;

    let colums: any = [], colums1: any = [], colums2: any = [], colums3: any = [];
    const border = [true, true, true, true]
    for (let i = 0; i < datos.length; i++) { // Ciclo For para crear celdas de la tabla

      if (i >= 0 && i <= 2) { // Rango para colocar las celdas de máximo 3 meses
        colums.push({ text: datos[i].mouth, margin: [0, 3, 0, 3], fillColor: this.p_color, border: border });
        colums.push({ text: 'TJ = ' + datos[i]['Tiempo Jornada'] + ', HE = ' + datos[i]['Horas Extras'], margin: [0, 3, 0, 3], alignment: 'center', border: border, fontSize: 9 });
      };
      if (i >= 3 && i <= 5) { // Rango para colocar las celdas de máximo 3 meses
        colums1.push({ text: datos[i].mouth, margin: [0, 3, 0, 3], fillColor: this.p_color, border: border });
        colums1.push({ text: 'TJ = ' + datos[i]['Tiempo Jornada'] + ', HE = ' + datos[i]['Horas Extras'], margin: [0, 3, 0, 3], alignment: 'center', border: border, fontSize: 9 });
      };
      if (i >= 6 && i <= 8) { // Rango para colocar las celdas de máximo 3 meses
        colums2.push({ text: datos[i].mouth, margin: [0, 3, 0, 3], fillColor: this.p_color, border: border });
        colums2.push({ text: 'TJ = ' + datos[i]['Tiempo Jornada'] + ', HE = ' + datos[i]['Horas Extras'], margin: [0, 3, 0, 3], alignment: 'center', border: border, fontSize: 9 });
      };
      if (i >= 9 && i <= 11) { // Rango para colocar las celdas de máximo 3 meses
        colums3.push({ text: datos[i].mouth, margin: [0, 3, 0, 3], fillColor: this.p_color, border: border });
        colums3.push({ text: 'TJ = ' + datos[i]['Tiempo Jornada'] + ', HE = ' + datos[i]['Horas Extras'], margin: [0, 3, 0, 3], alignment: 'center', border: border, fontSize: 9 });
      }
    }

    var other: any = [];

    switch (colums.length) {
      case 2: other = ['auto', '*']; break;
      case 4: other = ['auto', '*', 'auto', '*']; break;
      case 6: other = ['auto', '*', 'auto', '*', 'auto', '*']; break;
      default: other = []; break;
    }

    let tabla: any = {
      table: {
        widths: other,
        body: []
      }
    }

    const texto_push = { text: '', border: [false, false, false, false] };

    switch (colums1.length) { // Agrega celdas faltantes en blanco. para q no exista conflicto en la generación del PDF
      case 2: for (let i = 0; i < 4; i++) { colums1.push(texto_push); } break;
      case 4: for (let i = 0; i < 2; i++) { colums1.push(texto_push); } break;
      default: break;
    }

    switch (colums2.length) { // Agrega celdas faltantes en blanco. para q no exista conflicto en la generación del PDF
      case 2: for (let i = 0; i < 4; i++) { colums2.push(texto_push); } break;
      case 4: for (let i = 0; i < 2; i++) { colums2.push(texto_push); } break;
      default: break;
    }

    switch (colums3.length) { // Agrega celdas faltantes en blanco. para q no exista conflicto en la generación del PDF
      case 2: for (let i = 0; i < 4; i++) { colums3.push(texto_push); } break;
      case 4: for (let i = 0; i < 2; i++) { colums3.push(texto_push); } break;
      default: break;
    }

    if (colums.length > 0) { tabla.table.body.push(colums); }
    if (colums1.length > 0) { tabla.table.body.push(colums1); }
    if (colums2.length > 0) { tabla.table.body.push(colums2); }
    if (colums3.length > 0) { tabla.table.body.push(colums3); }

    return tabla
  }

  limpiarCamposRango() {
    this.fechasConsultaForm.reset();
    this.habilitar = false;
    this.llamarGraficaOriginal();
  }

  texto_grafica: string =
    "Este cálculo corresponde a la comparación del tiempo en que el trabajador se encuentra presente en su " +
    "horario establecido, versus el resultado mensual del cálculo de horas extras representado en el reporte " +
    "legal de asistencia." +
    "Esto nuevamente permite medir la efectividad de la empresa, evaluando a nivel general o específico " +
    "el comportamiento y uso de las horas de forma mensual.";

}
