
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { DateTime } from 'luxon';

import { ToastrService } from 'ngx-toastr';
import { EmpresaService } from 'src/app/servicios/configuracion/parametrizacion/catEmpresa/empresa.service';
import { MainNavService } from 'src/app/componentes/generales/main-nav/main-nav.service';
import { GraficasService } from 'src/app/servicios/graficas/graficas.service';
import { ValidacionesService } from 'src/app/servicios/generales/validaciones/validaciones.service';

import * as pdfMake from 'pdfmake/build/pdfmake.js';
import * as pdfFonts from 'pdfmake/build/vfs_fonts.js';
pdfMake.vfs = pdfFonts.pdfMake.vfs;

import * as echarts from 'echarts/core';
import { TooltipComponent, LegendComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import { PieChart } from 'echarts/charts';

@Component({
  selector: 'app-jornada-vs-hora-extra-macro',
  templateUrl: './jornada-vs-hora-extra-macro.component.html',
  styleUrls: ['./jornada-vs-hora-extra-macro.component.css'],

})
export class JornadaVsHoraExtraMacroComponent implements OnInit {

  anio_inicio = new FormControl('', Validators.required);
  anio_final = new FormControl('', Validators.required);

  public fechasConsultaForm = new FormGroup({
    fec_inicio: this.anio_inicio,
    fec_final: this.anio_final
  });

  f_inicio_req: string = '';
  f_final_req: string = '';

  jornada_hora_extra: any;

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
        [TooltipComponent, LegendComponent, PieChart, CanvasRenderer]
      );
      this.llamarGraficaOriginal();
    }
  }

  thisChart: any;
  chartDom: any;
  llamarGraficaOriginal() {
    let local = sessionStorage.getItem('JornadaHoraExtra');
    this.chartDom = document.getElementById('charts_jornada_macro') as HTMLCanvasElement;
    this.thisChart = echarts.init(this.chartDom, 'light', { width: 1050, renderer: 'svg', devicePixelRatio: 5 });

    if (local === null) {
      this.restGraficas.MetricaJornadaHoraExtraMicro().subscribe(res => {
        // console.log('************* JornadaHoraExtra Micro **************');
        // console.log(res);
        sessionStorage.setItem('JornadaHoraExtra', JSON.stringify(res))
        this.jornada_hora_extra = res.datos_grafica;
        this.thisChart.setOption(res.datos_grafica);
      });
    } else {
      let data_JSON = JSON.parse(local);
      this.jornada_hora_extra = data_JSON.datos_grafica;
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

        this.restGraficas.MetricaJornadaHoraExtraMacro(this.f_inicio_req, this.f_final_req).subscribe(res => {
          console.log('#################### Jornada hora extra Macro #######################');
          console.log(res);
          this.jornada_hora_extra = res.datos_grafica;
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
    let doc_name = "metrica_jornadaVShoraExtra" + f.toLocaleString() + ".pdf";
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
        return {
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
      },
      content: [
        { image: this.logo, width: 100, margin: [10, -25, 0, 5] },
        { text: 'Métrica Jornada VS Hora Extra', bold: true, fontSize: 15, alignment: 'center', margin: [0, -40, 0, 10] },
        { text: 'Desde: ' + this.f_inicio_req + " Hasta: " + this.f_final_req, bold: true, fontSize: 13, alignment: 'center' },
        { image: this.graficaBase64, width: 525, margin: [0, 10, 0, 10] },
        this.ImprimirDatos(),
        { text: this.texto_grafica, margin: [10, 10, 10, 10], alignment: 'justify' },
      ],
      styles: {
        tableHeader: { fontSize: 10, bold: true, alignment: 'center', fillColor: this.p_color },
        itemsTable: { fontSize: 8 },
        itemsTableD: { fontSize: 8, alignment: 'center' }
      }
    };
  }

  ImprimirDatos() {
    let datos = this.jornada_hora_extra.series.data;
    let tabla: any = {
      table: {
        // widths: ['auto',40,'auto',40,'auto',40],
        body: []
      }
    }
    let colums: any = [];

    for (let i = 0; i < datos.length; i++) {

      if (i >= 0 && i <= 2) {
        colums.push({ text: datos[i].name, margin: [0, 3, 0, 3], fillColor: this.p_color });
        colums.push({ text: datos[i].value, margin: [0, 3, 0, 3], alignment: 'center' });
      };
    }

    if (colums.length > 0) { tabla.table.body.push(colums); }

    let columnas = {
      alignment: 'justify',
      columns: [
        { width: 100, text: '' },
        tabla,
        { width: 100, text: '' }
      ]
    }

    return columnas
  }

  limpiarCamposRango() {
    this.fechasConsultaForm.reset();
    this.llamarGraficaOriginal();
  }

  texto_grafica: string =
    "El establecer a nivel general las horas de jornada, y contrastarlas con las horas extraordinarias que " +
    "se están ocupando en la empresa, permite determinar cómo se está empleando el tiempo laboral.";

}
