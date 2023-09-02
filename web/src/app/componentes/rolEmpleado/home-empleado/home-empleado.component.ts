import { TooltipComponent, LegendComponent, GridComponent } from 'echarts/components';
import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { CanvasRenderer } from 'echarts/renderers';
import { ToastrService } from 'ngx-toastr';
import { BarChart } from 'echarts/charts';
import * as echarts_hora from 'echarts/core';
import * as echarts_perm from 'echarts/core';
import * as echarts_vaca from 'echarts/core';
import * as echarts_atra from 'echarts/core';
import * as moment from 'moment';

import { GraficasService } from 'src/app/servicios/graficas/graficas.service';
import { TimbresService } from 'src/app/servicios/timbres/timbres.service';
import { ValidacionesService } from 'src/app/servicios/validaciones/validaciones.service';
import { ParametrosService } from 'src/app/servicios/parametrosGenerales/parametros.service';

@Component({
  selector: 'app-home-empleado',
  templateUrl: './home-empleado.component.html',
  styleUrls: ['./home-empleado.component.css']
})

export class HomeEmpleadoComponent implements OnInit {

  fecha: string;
  horas_extras: any;
  vacaciones: any;
  permisos: any;
  atrasos: any;

  ultimoTimbre: any = {
    timbre: '',
    accion: ''
  };

  constructor(
    private restGraficas: GraficasService,
    private restTimbres: TimbresService,
    private toastr: ToastrService,
    private router: Router,
    private route: ActivatedRoute,
    public validar: ValidacionesService,
    public parametro: ParametrosService,
  ) { }

  ngOnInit(): void {
    echarts_hora.use(
      [TooltipComponent, LegendComponent, BarChart, GridComponent, CanvasRenderer]
    );
    echarts_perm.use(
      [TooltipComponent, LegendComponent, BarChart, GridComponent, CanvasRenderer]
    );
    echarts_vaca.use(
      [TooltipComponent, LegendComponent, BarChart, GridComponent, CanvasRenderer]
    );
    echarts_atra.use(
      [TooltipComponent, LegendComponent, BarChart, GridComponent, CanvasRenderer]
    );

    this.BuscarParametro();
    this.SaldoVacaciones();
    this.ModeloGraficas();
  }

  /** **************************************************************************************** **
   ** **                   BUSQUEDA DE FORMATOS DE FECHAS Y HORAS                           ** ** 
   ** **************************************************************************************** **/

  formato_fecha: string = 'DD/MM/YYYY';
  formato_hora: string = 'HH:mm:ss';

  // METODO PARA BUSCAR PARAMETRO DE FORMATO DE FECHA
  BuscarParametro() {
    // id_tipo_parametro Formato fecha = 25
    this.parametro.ListarDetalleParametros(25).subscribe(
      res => {
        this.formato_fecha = res[0].descripcion;
        this.BuscarHora(this.formato_fecha)
      },
      vacio => {
        this.BuscarHora(this.formato_fecha)
      });
  }

  BuscarHora(fecha: string) {
    // id_tipo_parametro Formato hora = 26
    this.parametro.ListarDetalleParametros(26).subscribe(
      res => {
        this.formato_hora = res[0].descripcion;
        this.FormatearFechas(fecha, this.formato_hora);
      },
      vacio => {
        this.FormatearFechas(fecha, this.formato_hora);
      });
  }

  FormatearFechas(formato_fecha: string, formatear_hora: string) {
    var f = moment();
    this.fecha = this.validar.FormatearFecha(moment(f).format('YYYY-MM-DD'), formato_fecha, this.validar.dia_completo);
    this.UltimoTimbre(formato_fecha, formatear_hora);
  }

  async UltimoTimbre(formato_fecha: string, formato_hora: string) {
    await this.restTimbres.UltimoTimbreEmpleado().subscribe(res => {
      console.log('ULTIMO TIMBRE:', res.timbre);
      var fecha = this.validar.FormatearFecha(res.timbre.split(' ')[0], formato_fecha, this.validar.dia_abreviado);
      var hora = this.validar.FormatearHora(res.timbre.split(' ')[1], formato_hora);
      this.ultimoTimbre = res;
      this.ultimoTimbre.fecha = fecha + ' ' + hora;
    }, err => {
      this.toastr.error(err.error.message)
    })
  }

  SaldoVacaciones() {
    console.log('SALDO DE VACACIONES: ');
  }

  ModeloGraficas() {
    this.GraficaUno()
    this.GraficaDos();
    this.GraficaTres();
    this.GraficaCuatro();
  }

  GraficaUno() {
    let local = sessionStorage.getItem('horasExtras');
    var chartDom = document.getElementById('charts_horas_extras') as HTMLCanvasElement;
    var thisChart = echarts_hora.init(chartDom, 'light', { width: 350, renderer: 'svg', devicePixelRatio: 5 });

    if (local === null) {
      this.restGraficas.EmpleadoHoraExtra().subscribe(res => {
        // console.log('************* Horas extras **************');
        sessionStorage.setItem('horasExtras', JSON.stringify(res))
        // console.log(res);
        thisChart.setOption(res);
      });
    } else {
      var data_JSON = JSON.parse(local);
      thisChart.setOption(data_JSON);
    }
  }

  GraficaDos() {
    let local = sessionStorage.getItem('vacaciones');
    var chartDom = document.getElementById('charts_vacaciones') as HTMLCanvasElement;
    var thisChart = echarts_hora.init(chartDom, 'light', { width: 350, renderer: 'svg', devicePixelRatio: 5 });

    if (local === null) {
      this.restGraficas.EmpleadoVacaciones().subscribe(res => {
        // console.log('************* Vacaciones **************');
        sessionStorage.setItem('vacaciones', JSON.stringify(res))
        // console.log(res);
        thisChart.setOption(res);
      });
    } else {
      var data_JSON = JSON.parse(local);
      thisChart.setOption(data_JSON);
    }
  }

  GraficaTres() {
    let local = sessionStorage.getItem('permisos');
    var chartDom = document.getElementById('charts_permisos') as HTMLCanvasElement;
    var thisChart = echarts_hora.init(chartDom, 'light', { width: 350, renderer: 'svg', devicePixelRatio: 5 });

    if (local === null) {
      this.restGraficas.EmpleadoPermisos().subscribe(res => {
        // console.log('************* Permisos **************');
        // console.log(res);
        sessionStorage.setItem('permisos', JSON.stringify(res))
        thisChart.setOption(res);
      });
    } else {
      var data_JSON = JSON.parse(local);
      thisChart.setOption(data_JSON);
    }
  }

  GraficaCuatro() {
    let local = sessionStorage.getItem('atrasos');
    var chartDom = document.getElementById('charts_atraso') as HTMLCanvasElement;
    var thisChart = echarts_hora.init(chartDom, 'light', { width: 350, renderer: 'svg', devicePixelRatio: 5 });

    if (local === null) {
      this.restGraficas.EmpleadoAtrasos().subscribe(res => {
        // console.log('*************  ATRASOS **************');
        // console.log(res);
        sessionStorage.setItem('atrasos', JSON.stringify(res))
        thisChart.setOption(res);
      });
    } else {
      var data_JSON = JSON.parse(local);
      thisChart.setOption(data_JSON);
    }
  }

  RefrescarGraficas() {
    sessionStorage.removeItem('atrasos');
    sessionStorage.removeItem('permisos');
    sessionStorage.removeItem('vacaciones');
    sessionStorage.removeItem('horasExtras');
    this.ModeloGraficas();
  }

  MenuRapido(num: number) {
    console.log(num);

    switch (num) {
      case 1: //Horas Extras
        this.router.navigate(['/horaExtraEmpleado'], { relativeTo: this.route, skipLocationChange: false });
        break;
      case 2: //Vacaciones
        this.router.navigate(['/vacacionesEmpleado'], { relativeTo: this.route, skipLocationChange: false });
        break;
      case 3: //Permisos
        this.router.navigate(['/solicitarPermiso'], { relativeTo: this.route, skipLocationChange: false });
        break;
      case 4: //Retrasos
        this.router.navigate(['/macro/user/atrasos'], { relativeTo: this.route, skipLocationChange: false });
        break;
      case 5: //Timbres
        this.router.navigate(['/timbres-personal'], { relativeTo: this.route, skipLocationChange: false });
        break;
      default:
        this.router.navigate(['/estadisticas'], { relativeTo: this.route, skipLocationChange: false });
        break;
    }
  }

}
