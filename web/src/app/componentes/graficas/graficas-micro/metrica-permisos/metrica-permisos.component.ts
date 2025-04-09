
import { TooltipComponent, LegendComponent, GridComponent } from 'echarts/components';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { DateTime } from 'luxon';

import { ToastrService } from 'ngx-toastr';
import { EmpresaService } from 'src/app/servicios/configuracion/parametrizacion/catEmpresa/empresa.service';
import { GraficasService } from 'src/app/servicios/graficas/graficas.service';
import { ValidacionesService } from 'src/app/servicios/generales/validaciones/validaciones.service';

import * as echarts from 'echarts/core';
import { BarChart } from 'echarts/charts';
import { CanvasRenderer } from 'echarts/renderers';

@Component({
  selector: 'app-metrica-permisos',
  standalone: false,
  templateUrl: './metrica-permisos.component.html',
  styleUrls: ['./metrica-permisos.component.css'],
})

export class MetricaPermisosComponent implements OnInit {

  anio_inicio = new FormControl('', Validators.required);
  anio_final = new FormControl('', Validators.required);

  public fechasConsultaForm = new FormGroup({
    fec_inicio: this.anio_inicio,
    fec_final: this.anio_final
  });

  habilitar: boolean = false;
  f_inicio_req: string = '';
  f_final_req: string = '';

  permisos: any;

  constructor(
    private restGraficas: GraficasService,
    private restEmpre: EmpresaService,
    private toastr: ToastrService,
    public validar: ValidacionesService,
  ) {
    this.ObtenerLogo();
    this.ObtenerColores();
   }

  ngOnInit(): void {
    echarts.use(
      [TooltipComponent, LegendComponent, BarChart, GridComponent, CanvasRenderer]
    );
    this.llamarGraficaOriginal();
  }

  thisChart: any;
  chartDom: any;
  llamarGraficaOriginal() {
    let local = sessionStorage.getItem('permisos');
    this.chartDom = document.getElementById('charts_permisos_macro') as HTMLCanvasElement;
    this.thisChart = echarts.init(this.chartDom, 'light', {width: 1050, renderer: 'svg',devicePixelRatio: 5 });


    if (local === null) {
      this.restGraficas.EmpleadoPermisos().subscribe(res => {
        // console.log('************* permisos Micro **************');
        sessionStorage.setItem('permisos', JSON.stringify(res))
        // console.log(res);
        this.permisos = res;
        this.thisChart.setOption(res);
      });
    } else {
      let data_JSON = JSON.parse(local);
      this.permisos = data_JSON;
      this.thisChart.setOption(data_JSON);
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
        this.toastr.success('Fechas validas','', {
          timeOut: 6000,
        });

        this.f_inicio_req = f_i.toJSON().split('T')[0];
        this.f_final_req = f_f.toJSON().split('T')[0];
        this.habilitar = true

        this.restGraficas.EmpleadoPermisosMacro(this.f_inicio_req, this.f_final_req).subscribe(res => {
          console.log('#################### Permisos Macro Retorna #######################');
          console.log(res);
          this.permisos = res
          this.thisChart.setOption(res);
        });
      } else {
        this.toastr.error('Años de consulta diferente','Solo puede consultar datos de un año en concreto', {
          timeOut: 6000,
        });
      }      

    } else if (f_i > f_f) {
      this.toastr.info('Fecha final es menor a la fecha inicial','', {
        timeOut: 6000,
      });
      this.fechasConsultaForm.reset();
    } else if (f_i.toLocaleDateString() === f_f.toLocaleDateString()) {
      this.toastr.info('Fecha inicial es igual a la fecha final','', {
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
  metodosPDF(accion){  
    this.graficaBase64 = this.thisChart.getDataURL({type: 'jpg' , pixelRatio: 5 });
    this.GenerarPdf(accion) 
  }



  async GenerarPdf(action: any) {
    const pdfMake = await this.validar.ImportarPDF();
    const documentDefinition = this.DefinirInformacionPDF();
    var f = new Date()
    let doc_name = "metrica_permisos" + f.toLocaleString() + ".pdf";
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
      pageMargins: [ 30, 60, 30, 40 ],
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
            { text: [
                {
                  text: '© Pag ' + currentPage.toString() + ' of ' + pageCount,
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
        { text: 'Métrica  Permisos', bold: true, fontSize: 20, alignment: 'center', margin: [0, -40, 0, 10] },
        { text: 'Desde: ' + this.f_inicio_req + " Hasta: " + this.f_final_req, bold: true, fontSize: 13, alignment: 'center' },
        { image: this.graficaBase64, width: 550, margin: [0, 10, 0, 10] },
        this.ImprimirDatos(),
        { text: this.texto_grafica, margin: [10, 10, 10, 10], alignment: 'justify'},
      ],
      styles: {
        tableHeader: { fontSize: 10, bold: true, alignment: 'center', fillColor: this.p_color },
        itemsTable: { fontSize: 8 },
        itemsTableD: { fontSize: 8, alignment: 'center' }
      }
    };
  }

  ImprimirDatos() {
    let meses = this.permisos.xAxis.data
    let valor = this.permisos.series.data
    let datos: any = [];

    for (let i = 0; i < meses.length; i++) {
      let obj = {
        mes: meses[i],
        valor: valor[i]
      };
      datos.push(obj)
    }
    
    let colums: any = [], colums1: any = [], colums2: any = [], colums3: any = [];
    const border = [true, true, true, true]
    for (let i = 0; i < datos.length; i++) { // Ciclo For para crear celdas de la tabla

      if (i >= 0 && i <= 2) { // Rango para colocar las celdas de máximo 3 meses
        colums.push({ text: datos[i].mes, margin: [0,3,0,3], fillColor: this.p_color, border: border });
        colums.push({ text: datos[i].valor, margin: [0,3,0,3], alignment: 'center', border: border });
      };
      if (i >= 3 && i <= 5) { // Rango para colocar las celdas de máximo 3 meses
        colums1.push({ text: datos[i].mes, margin: [0,3,0,3], fillColor: this.p_color, border: border });
        colums1.push({ text: datos[i].valor, margin: [0,3,0,3], alignment: 'center', border: border });
      };
      if (i >= 6 && i <= 8) { // Rango para colocar las celdas de máximo 3 meses
        colums2.push({ text: datos[i].mes, margin: [0,3,0,3], fillColor: this.p_color, border: border });
        colums2.push({ text: datos[i].valor, margin: [0,3,0,3], alignment: 'center', border: border });
      }; 
      if (i >= 9 && i <= 11) { // Rango para colocar las celdas de máximo 3 meses
        colums3.push({ text: datos[i].mes, margin: [0,3,0,3], fillColor: this.p_color, border: border });
        colums3.push({ text: datos[i].valor, margin: [0,3,0,3], alignment: 'center', border: border });
      }
    }

    var other : any= [];

    switch (colums.length) {
      case 2: other = ['auto',40]; break;
      case 4: other = ['auto',40,'auto',40]; break;
      case 6: other = ['auto',40,'auto',40,'auto',40]; break;
      default: other = []; break;
    }

    let tabla: any = {
			table: {
        widths: other,
				body: []
			}
		}

    const texto_push = {text: '', border: [false, false, false, false] };

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
    // console.log(tabla);

    const columnas = {
      alignment: 'justify',
			columns: [
				{ width: 95, text: '' },
				tabla,
				{ width: 95, text: '' }
			]
		}

    return columnas
  }

  limpiarCamposRango() {
    this.fechasConsultaForm.reset();
    this.habilitar = false;
    this.llamarGraficaOriginal();
  }

  texto_grafica: string = 
  "Permisos"

}
