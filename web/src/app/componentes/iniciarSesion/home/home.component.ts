import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';

import { ValidacionesService } from 'src/app/servicios/generales/validaciones/validaciones.service';
import { ParametrosService } from 'src/app/servicios/configuracion/parametrizacion/parametrosGenerales/parametros.service';
import { EmpleadoService } from 'src/app/servicios/usuarios/empleado/empleadoRegistro/empleado.service';
import { MainNavService } from '../../generales/main-nav/main-nav.service';

@Component({
  selector: 'app-home',
  standalone: false,
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})

export class HomeComponent implements OnInit {

  // BUSQUEDA DE FUNCIONES ACTIVAS
  get geolocalizacion(): boolean { return this.funciones.geolocalizacion; }
  get alimentacion(): boolean { return this.funciones.alimentacion; }
  get horasExtras(): boolean { return this.funciones.horasExtras; }
  get teletrabajo(): boolean { return this.funciones.timbre_web; }
  get vacaciones(): boolean { return this.funciones.vacaciones; }
  get permisos(): boolean { return this.funciones.permisos; }
  get accion(): boolean { return this.funciones.accionesPersonal; }
  get movil(): boolean { return this.funciones.app_movil; }

  datosEmpleado: any = [];
  idEmpleado: any = 0;

  constructor(
    private funciones: MainNavService,
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

  formato_fecha: string = 'dd/MM/yyyy';
  formato_hora: string = 'HH:mm:ss';
  idioma_fechas: string = 'es';
  // METODO PARA BUSCAR PARAMETRO DE FORMATO DE FECHA
  BuscarParametro() {
    // id_tipo_parametro Formato fecha = 1
    this.parametro.ListarDetalleParametros(1).subscribe(
      res => {
        this.formato_fecha = res[0].descripcion;
        this.VerEmpleado(this.formato_fecha);
      }, vacio => {
        this.VerEmpleado(this.formato_fecha);
      });
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
      this.datosEmpleado.fec_nacimiento_ = this.validar.FormatearFecha(this.datosEmpleado.fecha_nacimiento, formato_fecha, this.validar.dia_abreviado, this.idioma_fechas);
      if (data[0].imagen != null) {
        this.urlImagen = `${(localStorage.getItem('empresaURL') as string)}/empleado/img/` + data[0].id + '/' + data[0].imagen;
        this.restEmpleado.ObtenerImagen(data[0].id, data[0].imagen).subscribe(data => {
          if (data.imagen != 0) {
            this.imagenEmpleado = 'data:image/jpeg;base64,' + data.imagen;
          }
          else {
            this.ImagenLocalUsuario("assets/imagenes/user.png").then(
              (result) => (this.imagenEmpleado = result)
            );
          }
        });
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
        this.router.navigate(['/verEmpleado/' + this.idEmpleado], { relativeTo: this.route, skipLocationChange: false });
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

}
