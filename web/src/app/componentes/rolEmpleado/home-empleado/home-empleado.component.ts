import { TooltipComponent, LegendComponent, GridComponent } from 'echarts/components';
import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { CanvasRenderer } from 'echarts/renderers';
import { environment } from 'src/environments/environment';
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
import { EmpleadoService } from 'src/app/servicios/empleado/empleadoRegistro/empleado.service';

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

  datosEmpleado: any;
  idEmpleado: any = 0;

  constructor(
    private restGraficas: GraficasService,
    private funciones: MainNavService,
    private toastr: ToastrService,
    private router: Router,
    private route: ActivatedRoute,
    public validar: ValidacionesService,
    public parametro: ParametrosService,
    public restEmpleado: EmpleadoService
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


  // METODO PARA VER LA INFORMACION DEL USUARIO 
  imagenEmpleado: any;
  urlImagen: any;
  iniciales: any;
  mostrarImagen: boolean = false;
  VerEmpleado(formato_fecha: string) {
    this.datosEmpleado = [];
    this.restEmpleado.BuscarUnEmpleado(parseInt(this.idEmpleado)).subscribe(data => {
      this.datosEmpleado = data[0];
      this.datosEmpleado.fec_nacimiento_ = this.validar.FormatearFecha(this.datosEmpleado.fec_nacimiento, formato_fecha, this.validar.dia_abreviado);
      if (data[0].imagen != null) {
        this.urlImagen = `${environment.url}/empleado/img/` + data[0].id + '/' + data[0].imagen;
        this.restEmpleado.obtenerImagen(data[0].id, data[0].imagen).subscribe(data => {
          console.log('ver imagen data ', data)
          if (data.imagen != 0) {
            this.imagenEmpleado = 'data:image/jpeg;base64,' + data.imagen;
          }
          else {
            this.ImagenLocalUsuario("assets/imagenes/user.png").then(
              (result) => (this.imagenEmpleado = result)
            ).catch(Error => {
              this.imagenEmpleado = 'sin imagen';
            });
          }
        });
        //console.log('ver urlImagen ', this.urlImagen)
        this.mostrarImagen = true;
      } else {
        this.iniciales = data[0].nombre.split(" ")[0].slice(0, 1) + data[0].apellido.split(" ")[0].slice(0, 1);
        this.mostrarImagen = false;
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
      case 0: //Info Empleado
        this.router.navigate(['/datosEmpleado'], { relativeTo: this.route, skipLocationChange: false });
        break;
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
