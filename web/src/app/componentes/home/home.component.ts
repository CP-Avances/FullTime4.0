import { TooltipComponent, LegendComponent, GridComponent } from 'echarts/components';
import { PieChart, BarChart, LineChart } from 'echarts/charts';
import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { CanvasRenderer } from 'echarts/renderers';
import { environment } from 'src/environments/environment';
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
import { EmpleadoService } from 'src/app/servicios/empleado/empleadoRegistro/empleado.service';

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

  datosEmpleado: any;
  idEmpleado: any = 0;

  constructor(
    private funciones: MainNavService,
    private graficar: GraficasService,
    private router: Router,
    private route: ActivatedRoute,
    public validar: ValidacionesService,
    public parametro: ParametrosService,
    public restEmpleado: EmpleadoService,
  ) { }

  ngOnInit(): void {
    this.idEmpleado = localStorage.getItem('empleado');
    this.BuscarParametro();
  }

  /** **************************************************************************************** **
   ** **                   BUSQUEDA DE FORMATOS DE FECHAS Y HORAS                           ** ** 
   ** **************************************************************************************** **/

  formato_fecha: string = 'DD/MM/YYYY';
  formato_hora: string = 'HH:mm:ss';

  // METODO PARA BUSCAR PARAMETRO DE FORMATO DE FECHA
  BuscarParametro() {

    this.VerEmpleado(this.formato_fecha)

    // id_tipo_parametro Formato fecha = 1
    this.parametro.ListarDetalleParametros(1).subscribe(
      res => {
        this.formato_fecha = res[0].descripcion;
        this.FormatearFechas(this.formato_fecha);
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

  // METODO PARA VER LA INFORMACION DEL USUARIO 
  imagenEmpleado: any;
  urlImagen: any;
  iniciales: any;
  mostrarImagen: boolean = false;
  VerEmpleado(formato_fecha: string) {
    this.datosEmpleado = [];
    this.restEmpleado.BuscarUnEmpleado(parseInt(this.idEmpleado)).subscribe(data => {
      this.datosEmpleado = data[0];
      this.datosEmpleado.fec_nacimiento_ = this.validar.FormatearFecha(this.datosEmpleado.fecha_nacimiento, formato_fecha, this.validar.dia_abreviado);
      if (data[0].imagen != null) {
        this.urlImagen = `${(localStorage.getItem('empresaURL') as string)}/empleado/img/` + data[0].id + '/' + data[0].imagen;
        this.restEmpleado.obtenerImagen(data[0].id, data[0].imagen).subscribe(data => {
          //console.log('ver imagen data ', data)
          if (data.imagen != 0) {
            this.imagenEmpleado = 'data:image/jpeg;base64,' + data.imagen;
          }
          else {
            this.ImagenLocalUsuario("assets/imagenes/user.png").then(
              (result) => (this.imagenEmpleado = result)
            );
          }
        });
        //console.log('ver urlImagen ', this.urlImagen)
        this.mostrarImagen = true;
      } else {
        this.iniciales = data[0].nombre.split(" ")[0].slice(0, 1) + data[0].apellido.split(" ")[0].slice(0, 1);
        this.mostrarImagen = false;
        this.ImagenLocalUsuario("assets/imagenes/user.png").then(
          (result) => (this.imagenEmpleado = result)
        );
      }
    })
  }

  // METODO PARA MOSTRAR IMAGEN EN PDF
  ImagenLocalUsuario(localPath: string): Promise<string> {
    return new Promise((resolve, reject) => {
      let canvas = document.createElement('canvas');
      let img = new Image();
      img.onload = () => {
        canvas.height = img.height;
        canvas.width = img.width;
        const context = canvas.getContext("2d")!;
        context.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      }
      img.onerror = () => reject('Imagen no disponible')
      img.src = localPath;
    });
  }

  // METODO DE MENU RAPIDO
  MenuRapido(num: number) {
    switch (num) {
      case 0: // Info Usuario
        this.router.navigate(['/verEmpleado/'+this.idEmpleado], { relativeTo: this.route, skipLocationChange: false });
        break; 
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
