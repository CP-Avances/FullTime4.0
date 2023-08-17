import { TooltipComponent, LegendComponent, GridComponent } from 'echarts/components';
import { PieChart, BarChart, LineChart } from 'echarts/charts';
import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { CanvasRenderer } from 'echarts/renderers';
import * as echarts_asis from 'echarts/core';
import * as echarts_inas from 'echarts/core';
import * as echarts_retr from 'echarts/core';
import * as echarts_sali from 'echarts/core';
import * as echarts_marc from 'echarts/core';
import * as echarts_hora from 'echarts/core';
import * as echarts_tiem from 'echarts/core';
import * as echarts_jorn from 'echarts/core';
import * as moment from 'moment';

import { ValidacionesService } from 'src/app/servicios/validaciones/validaciones.service';
import { ParametrosService } from 'src/app/servicios/parametrosGenerales/parametros.service';
import { GraficasService } from 'src/app/servicios/graficas/graficas.service';
import { MainNavService } from '../administracionGeneral/main-nav/main-nav.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})

export class HomeComponent implements OnInit {

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
    private funciones: MainNavService,
    private graficar: GraficasService,
    private router: Router,
    private route: ActivatedRoute,
    public validar: ValidacionesService,
    public parametro: ParametrosService,
  ) { }

  ngOnInit(): void {
    // GRAFICA DE ASISTENCIA
    echarts_asis.use(
      [TooltipComponent, LegendComponent, PieChart, CanvasRenderer]
    );
    // GRAFICA INASISTENCIA
    echarts_inas.use(
      [TooltipComponent, LegendComponent, LineChart, GridComponent, CanvasRenderer]
    );
    // GRAFICA ATRASOS
    echarts_retr.use(
      [TooltipComponent, LegendComponent, BarChart, GridComponent, CanvasRenderer]
    );
    // GRAFICA SALIDA ANTICIPADA
    echarts_sali.use(
      [TooltipComponent, LegendComponent, LineChart, GridComponent, CanvasRenderer]
    );
    // GRAFICA MARCACIONES
    echarts_marc.use(
      [TooltipComponent, LegendComponent, LineChart, GridComponent, CanvasRenderer]
    );
    // GRAFICA HORAS EXTRAS
    echarts_hora.use(
      [TooltipComponent, LegendComponent, BarChart, GridComponent, CanvasRenderer]
    );
    // GRAFICA TIEMPO DE JORNADA 
    echarts_tiem.use(
      [TooltipComponent, LegendComponent, BarChart, CanvasRenderer]
    );
    // GRAFICA JORNADA EXTRA
    echarts_jorn.use(
      [TooltipComponent, LegendComponent, PieChart, CanvasRenderer]
    );

    this.ModeloGraficas();
    this.BuscarParametro();
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
        this.FormatearFechas(this.formato_fecha)
      },
      vacio => {
        this.FormatearFechas(this.formato_fecha)
      });
  }

  // METODO PARA FORMATEAR FECHAS
  FormatearFechas(formato_fecha: string) {
    var f = moment();
    this.fecha = this.validar.FormatearFecha(moment(f).format('YYYY-MM-DD'), formato_fecha, this.validar.dia_completo);
  }

  // METODO PARA PRESENTAR GRAFICAS
  ModeloGraficas() {
    // GRAFICA ASISTENCIA
    this.GraficaUno()
    // GRAFICA INASISTENCIA
    this.GraficaDos();
    // GRAFICA ATRASOS
    this.GraficaTres();
    // GRAFICA SALIDA ANTICIPADA
    this.GraficaCuatro();
    // GRAFICA MARCACIONES
    this.GraficaCinco();
    // GRAFICA HORAS EXTRAS
    this.GraficaSeis();
    // GRAFICA TIEMPO JORNADA
    this.GraficaSiete();
    // GRAFICA JORNADA EXTRA
    this.GraficaOcho();
  }

  // METODO GRAFICA ASISTENCIA
  GraficaUno() {
    let local = sessionStorage.getItem('asistencia');
    var chartDom = document.getElementById('charts_asistencia') as HTMLCanvasElement;
    var thisChart = echarts_asis.init(chartDom, 'light', { width: 350, renderer: 'svg', devicePixelRatio: 5 });

    if (local === null) {
      this.graficar.MetricaAsistenciaMicro().subscribe(res => {
        sessionStorage.setItem('asistencia', JSON.stringify(res))
        thisChart.setOption(res.datos_grafica);
      });
    } else {
      var data_JSON = JSON.parse(local);
      thisChart.setOption(data_JSON.datos_grafica);
    }
  }

  // METODO GRAFICA INASISTENCIA
  GraficaDos() {
    let local = sessionStorage.getItem('inasistencia');
    var chartDom = document.getElementById('charts_inasistencia') as HTMLCanvasElement;
    var thisChart = echarts_inas.init(chartDom, 'light', { width: 350, renderer: 'svg', devicePixelRatio: 5 });

    if (local === null) {
      this.graficar.MetricaInasistenciaMicro().subscribe(res => {
        sessionStorage.setItem('inasistencia', JSON.stringify(res))
        thisChart.setOption(res.datos_grafica);
      });
    } else {
      var data_JSON = JSON.parse(local);
      thisChart.setOption(data_JSON.datos_grafica);
    }
  }

  // METODO GRAFICA ATRASOS
  GraficaTres() {
    let local = sessionStorage.getItem('retrasos');
    var chartDom = document.getElementById('charts_retrasos') as HTMLCanvasElement;
    var thisChart = echarts_retr.init(chartDom, 'light', { width: 350, renderer: 'svg', devicePixelRatio: 5 });

    if (local === null) {
      this.graficar.MetricaRetrasoMicro().subscribe(res => {
        sessionStorage.setItem('retrasos', JSON.stringify(res))
        thisChart.setOption(res.datos_grafica);
      });
    } else {
      var data_JSON = JSON.parse(local);
      thisChart.setOption(data_JSON.datos_grafica);
    }
  }

  // METODO GRAFICA SALIDA ANTICIPADA
  GraficaCuatro() {
    let local = sessionStorage.getItem('salida_antes');
    var chartDom = document.getElementById('charts_salidas_antes') as HTMLCanvasElement;
    var thisChart = echarts_sali.init(chartDom, 'light', { width: 350, renderer: 'svg', devicePixelRatio: 5 });

    if (local === null) {
      this.graficar.MetricaSalidasAntesMicro().subscribe(res => {
        sessionStorage.setItem('salida_antes', JSON.stringify(res))
        thisChart.setOption(res.datos_grafica);
      });
    } else {
      var data_JSON = JSON.parse(local);
      thisChart.setOption(data_JSON.datos_grafica);
    }
  }

  // METODO GRAFICA MARCACIONES
  GraficaCinco() {
    let local = sessionStorage.getItem('marcaciones');
    var chartDom = document.getElementById('charts_marcaciones') as HTMLCanvasElement;
    var thisChart = echarts_marc.init(chartDom, 'light', { width: 350, renderer: 'svg', devicePixelRatio: 5 });

    if (local === null) {
      this.graficar.MetricaMarcacionesMicro().subscribe(res => {
        sessionStorage.setItem('marcaciones', JSON.stringify(res))
        thisChart.setOption(res.datos_grafica);
      });
    } else {
      var data_JSON = JSON.parse(local);
      thisChart.setOption(data_JSON.datos_grafica);
    }
  }

  // METODO GRAFICA HORAS EXTRAS
  GraficaSeis() {
    if (this.horasExtras === true) {
      let local = sessionStorage.getItem('HoraExtra');
      var chartDom = document.getElementById('charts_hora_extra') as HTMLCanvasElement;
      var thisChart = echarts_hora.init(chartDom, 'light', { width: 350, renderer: 'svg', devicePixelRatio: 5 });

      if (local === null) {
        this.graficar.MetricaHoraExtraMicro().subscribe(res => {
          sessionStorage.setItem('HoraExtra', JSON.stringify(res))
          thisChart.setOption(res.datos_grafica);
        });
      } else {
        var data_JSON = JSON.parse(local);
        thisChart.setOption(data_JSON.datos_grafica);
      }
    }
  }

  // METODO GRAFICA TIEMPO JORNADA
  GraficaSiete() {
    if (this.horasExtras === true) {
      let local = sessionStorage.getItem('tiempo_jornada');
      var chartDom = document.getElementById('charts_tiempo_jornada') as HTMLCanvasElement;
      var thisChart = echarts_tiem.init(chartDom, 'light', { width: 350, renderer: 'svg', devicePixelRatio: 5 });

      if (local === null) {
        this.graficar.MetricaTiempoJornadaHoraExtraMicro().subscribe(res => {
          sessionStorage.setItem('tiempo_jornada', JSON.stringify(res))
          thisChart.setOption(res.datos_grafica);
        });
      } else {
        var data_JSON = JSON.parse(local);
        thisChart.setOption(data_JSON.datos_grafica);
      }
    }
  }

  // METODO GRAFICA JORNADA EXTRA
  GraficaOcho() {
    if (this.horasExtras === true) {
      let local = sessionStorage.getItem('JornadaHoraExtra');
      var chartDom = document.getElementById('charts_jornada_hora_extra') as HTMLCanvasElement;
      var thisChart = echarts_jorn.init(chartDom, 'light', { width: 350, renderer: 'svg', devicePixelRatio: 5 });

      if (local === null) {
        this.graficar.MetricaJornadaHoraExtraMicro().subscribe(res => {
          sessionStorage.setItem('JornadaHoraExtra', JSON.stringify(res))
          thisChart.setOption(res.datos_grafica);
        });
      } else {
        var data_JSON = JSON.parse(local);
        thisChart.setOption(data_JSON.datos_grafica);
      }
    }
  }

  // METODO PARA ACTUALIZAR GRAFICAS
  RefrescarGraficas() {
    sessionStorage.removeItem('asistencia');
    sessionStorage.removeItem('inasistencia');
    sessionStorage.removeItem('retrasos');
    sessionStorage.removeItem('salida_antes');
    sessionStorage.removeItem('marcaciones');
    sessionStorage.removeItem('HoraExtra');
    sessionStorage.removeItem('tiempo_jornada');
    sessionStorage.removeItem('JornadaHoraExtra');
    this.ModeloGraficas();
  }

  // METODO DE MENU RAPIDO
  MenuRapido(num: number) {
    switch (num) {
      case 1: // REPORTES
        this.router.navigate(['/timbres-personal'], { relativeTo: this.route, skipLocationChange: false });
        break;
      case 2: // HORAS EXTRAS
        this.router.navigate(['/horas-extras-solicitadas'], { relativeTo: this.route, skipLocationChange: false });
        break;
      case 3: // VACACIONES
        this.router.navigate(['/vacaciones-solicitados'], { relativeTo: this.route, skipLocationChange: false });
        break;
      case 4: // PERMISOS
        this.router.navigate(['/permisos-solicitados'], { relativeTo: this.route, skipLocationChange: false });
        break;
      case 5: // ACCIONES PERSONAL
        this.router.navigate(['/proceso'], { relativeTo: this.route, skipLocationChange: false });
        break;
      case 6: // APP MOVIL
        this.router.navigate(['/app-movil'], { relativeTo: this.route, skipLocationChange: false });
        break;
      case 7: // ALIMENTACION
        this.router.navigate(['/listarTipoComidas'], { relativeTo: this.route, skipLocationChange: false });
        break;
      case 8: // GEOLOCALIZACION
        this.router.navigate(['/coordenadas'], { relativeTo: this.route, skipLocationChange: false });
        break;
      default:
        this.router.navigate(['/home'], { relativeTo: this.route, skipLocationChange: false });
        break;
    }
  }

  // METODO PARA DIRECCIONAR A RUTA DE GRAFICAS
  RedireccionarRutas(num: number) {
    switch (num) {
      case 1: // ASISTENCIA
        this.router.navigate(['/macro/asistencia'], { relativeTo: this.route, skipLocationChange: false });
        break;
      case 2: // INASISTENCIA
        this.router.navigate(['/macro/inasistencia'], { relativeTo: this.route, skipLocationChange: false });
        break;
      case 3: // ATRASOS
        this.router.navigate(['/macro/retrasos'], { relativeTo: this.route, skipLocationChange: false });
        break;
      case 4: // SALIDA ANTICIPADA
        this.router.navigate(['/macro/salidas-antes'], { relativeTo: this.route, skipLocationChange: false });
        break;
      case 5: // MARCACIONES
        this.router.navigate(['/macro/marcaciones'], { relativeTo: this.route, skipLocationChange: false });
        break;
      case 6: // HORAS EXTRAS
        this.router.navigate(['/macro/hora-extra'], { relativeTo: this.route, skipLocationChange: false });
        break;
      case 7: // TIEMPO JORNADA
        this.router.navigate(['/macro/tiempo-jornada-vs-hora-ext'], { relativeTo: this.route, skipLocationChange: false });
        break;
      case 8: // JORNADA HORAS EXTRAS
        this.router.navigate(['/macro/jornada-vs-hora-extra'], { relativeTo: this.route, skipLocationChange: false });
        break;
      default:
        this.router.navigate(['/home'], { relativeTo: this.route, skipLocationChange: false });
        break;
    }
  }

}
