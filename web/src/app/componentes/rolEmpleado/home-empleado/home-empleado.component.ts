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

import { ValidacionesService } from 'src/app/servicios/validaciones/validaciones.service';
import { ParametrosService } from 'src/app/servicios/parametrosGenerales/parametros.service';
import { GraficasService } from 'src/app/servicios/graficas/graficas.service';
import { MainNavService } from '../../administracionGeneral/main-nav/main-nav.service';

@Component({
  selector: 'app-home-empleado',
  templateUrl: './home-empleado.component.html',
  styleUrls: ['./home-empleado.component.css']
})

export class HomeEmpleadoComponent implements OnInit {

  fecha: string;

  // BUSQUEDA DE FUNCIONES ACTIVAS
  get geolocalizacion(): boolean { return this.funciones.geolocalizacion; }
  get alimentacion(): boolean { return this.funciones.alimentacion; }
  get horasExtras(): boolean { return this.funciones.horasExtras; }
  get teletrabajo(): boolean { return this.funciones.timbre_web; }
  get vacaciones(): boolean { return this.funciones.vacaciones; }
  get permisos(): boolean { return this.funciones.permisos; }
  get accion(): boolean { return this.funciones.accionesPersonal; }
  get movil(): boolean { return this.funciones.app_movil; }

  constructor(
    private restGraficas: GraficasService,
    private funciones: MainNavService,
    private toastr: ToastrService,
    private router: Router,
    private route: ActivatedRoute,
    public validar: ValidacionesService,
    public parametro: ParametrosService,
  ) { }

  ngOnInit(): void {
    // echarts_hora.use(
    //   [TooltipComponent, LegendComponent, BarChart, GridComponent, CanvasRenderer]
    // );
    // echarts_perm.use(
    //   [TooltipComponent, LegendComponent, BarChart, GridComponent, CanvasRenderer]
    // );
    // echarts_vaca.use(
    //   [TooltipComponent, LegendComponent, BarChart, GridComponent, CanvasRenderer]
    // );
    // echarts_atra.use(
    //   [TooltipComponent, LegendComponent, BarChart, GridComponent, CanvasRenderer]
    // );

    this.BuscarParametro();
    // this.ModeloGraficas();
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
        this.FormatearFechas(fecha);
      },
      vacio => {
        this.FormatearFechas(fecha);
      });
  }

  // METODO PARA FORMATEAR FECHAS
  FormatearFechas(formato_fecha: string) {
    var f = moment();
    this.fecha = this.validar.FormatearFecha(moment(f).format('YYYY-MM-DD'), formato_fecha, this.validar.dia_completo);
  }

  // METODO PARA PRESENTAR GRAFICAS
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

  // METODO DE MENU RAPIDO
  MenuRapido(num: number) {
    switch (num) {
      case 1: // PERMISOS
        this.router.navigate(['/solicitarPermiso'], { relativeTo: this.route, skipLocationChange: false });
        break;
      case 2: // VACACIONES
        this.router.navigate(['/vacacionesEmpleado'], { relativeTo: this.route, skipLocationChange: false });
        break;
      case 3: // HORAS EXTRAS
        this.router.navigate(['/horaExtraEmpleado'], { relativeTo: this.route, skipLocationChange: false });
        break;
      case 4: // ALIMENTACION
        this.router.navigate(['/comidasEmpleado'], { relativeTo: this.route, skipLocationChange: false });
        break;
      case 5: // ACCIONES DE PERSONAL
        this.router.navigate(['/procesosEmpleado'], { relativeTo: this.route, skipLocationChange: false });
        break;
      case 8: // TIMBRE TELETRABAJO
        this.router.navigate(['/timbres-personal'], { relativeTo: this.route, skipLocationChange: false });
        break;
      default:
        this.router.navigate(['/estadisticas'], { relativeTo: this.route, skipLocationChange: false });
        break;
    }
  }

}
