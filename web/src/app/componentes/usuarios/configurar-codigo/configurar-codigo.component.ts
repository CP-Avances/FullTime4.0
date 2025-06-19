// IMPORTAR LIBRERIAS
import { FormControl, FormGroup } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';

// IMPORTAR SERVICIOS
import { EmpleadoService } from 'src/app/servicios/usuarios/empleado/empleadoRegistro/empleado.service'
import { ValidacionesService } from 'src/app/servicios/generales/validaciones/validaciones.service';

@Component({
  selector: 'app-configurar-codigo',
  standalone: false,
  templateUrl: './configurar-codigo.component.html',
  styleUrls: ['./configurar-codigo.component.css']
})

export class ConfigurarCodigoComponent implements OnInit {
  ips_locales: any = '';

  // VARIABLES DE MANEJO DE ACTIVACIÓN O DESACTIVACIÓN DE FUNCIONES
  HabilitarDescrip: boolean = true;
  automaticoF = false;
  manualF = false;
  cedulaF = false;
  registrar: boolean = true;

  // VARIABLES PARA AUDITORIA
  user_name: string | null;
  ip: string | null;

  // CAMPOS FORMULARIO
  inicioF = new FormControl('');
  seleccionF = new FormControl('');

  // CAMPOS DEL FORMULARIO DENTRO DE UN GRUPO
  public formulario = new FormGroup({
    inicioForm: this.inicioF,
    seleccionForm: this.seleccionF,
  });

  constructor(
    private toastr: ToastrService, // VARIABLE MANEJO DE MENSAJES DE NOTIFICACIONES
    private router: Router, // VARIABLE DE NAVEGACIÓN RUTAS URL
    public validar: ValidacionesService,
    public rest: EmpleadoService, // SERVICIO DATOS DE EMPLEADO
  ) { }

  ngOnInit(): void {
    this.user_name = localStorage.getItem('usuario');
    this.ip = localStorage.getItem('ip');
    this.validar.ObtenerIPsLocales().then((ips) => {
      this.ips_locales = ips;
    });

    this.VerUltimoCodigo();
  }

  // SELECCION DE METODO DE REGISTRO DE CODIGO DE EMPLEADO
  RegistrarConfiguracion(form: any) {
    this.ver_informacion = false;
    this.rest.ObtenerCodigo().subscribe(datos => {
      if (this.automaticoF === true) {
        this.ActualizarAutomatico(form);
      }
      else {
        this.ActualizarManualCedula();
      }
    }, error => {
      if (this.automaticoF === true) {
        this.CrearAutomatico(form);
      }
      else {
        console.log('llamado a actualizar manual')
        this.CrearManualCedula();
      }
    });
  }

  // METODO DE REGISTRO AUTOMATICO DE CÓDIGO DE EMPLEADO
  CrearAutomatico(form: any) {
    let dataCodigo = {
      id: 1,
      valor: form.inicioForm,
      manual: this.manualF,
      automatico: this.automaticoF,
      identificacion: this.cedulaF,
      user_name: this.user_name,
      ip: this.ip, ip_local: this.ips_locales
    }
    if (form.inicioForm != '') {
      this.rest.CrearCodigo(dataCodigo).subscribe(datos => {
        this.toastr.success('Configuración Registrada', '', {
          timeOut: 6000,
        });
        this.router.navigate(['/empleado/']);
      })
      this.Limpiar();
    }
    else {
      this.toastr.info('Por favor ingresar un valor para generación de código', '', {
        timeOut: 6000,
      })
    }
  }

  // METODO DE REGISTRO DE CODIGO MANUAL
  CrearManualCedula() {
    let dataCodigo = {
      id: 1,
      valor: null,
      manual: this.manualF,
      automatico: this.automaticoF,
      identificacion: this.cedulaF,
      user_name: this.user_name,
      ip: this.ip, ip_local: this.ips_locales
    }
    this.rest.CrearCodigo(dataCodigo).subscribe(datos => {
      this.toastr.success('Configuración Registrada', '', {
        timeOut: 6000,
      });
      this.router.navigate(['/empleado/']);
    })
    this.Limpiar();
  }


  // METODO DE ACTUALIZACION DE CODIGO DE EMPLEADO AUTOMATICO
  ActualizarAutomatico(form: any) {
    let dataCodigo = {
      id: 1,
      valor: form.inicioForm,
      manual: this.manualF,
      automatico: this.automaticoF,
      identificacion: this.cedulaF,
      user_name: this.user_name,
      ip: this.ip, ip_local: this.ips_locales,
    }
    if (form.inicioForm != '') {
      this.rest.ObtenerCodigoMAX().subscribe(datosE => {
        if (parseInt(datosE[0].codigo) <= parseInt(form.inicioForm)) {
          this.rest.ActualizarCodigoTotal(dataCodigo).subscribe(datos => {
            this.toastr.success('Configuración Registrada', '', {
              timeOut: 6000,
            });
            this.router.navigate(['/empleado/']);
          })
          this.Limpiar();
        }
        else {
          this.toastr.info('Para el buen funcionamiento del sistema ingrese un nuevo valor y recuerde que ' +
            'este debe ser diferente a los valores anteriormente registrados.', '', {
            timeOut: 6000,
          });
        }
      })
    }
    else {
      this.toastr.info('Por favor ingresar un valor para generación de código', '', {
        timeOut: 6000,
      });
    }
  }

  // METODO DE ACTUALIZACION DE CODIGO DE EMPLEADO MANUAL
  ActualizarManualCedula() {
    let dataCodigo = {
      id: 1,
      valor: null,
      manual: this.manualF,
      automatico: this.automaticoF,
      identificacion: this.cedulaF,
      user_name: this.user_name,
      ip: this.ip, ip_local: this.ips_locales,
    }
    this.rest.ActualizarCodigoTotal(dataCodigo).subscribe(datos => {
      this.toastr.success('Configuración Registrada', '', {
        timeOut: 6000,
      });
      this.router.navigate(['/empleado/']);
    })
    this.Limpiar();
  }

  // METODO PARA VER CAMPO DE REGISTRO DE CODIGO
  VerCampo() {
    this.HabilitarDescrip = false;
    this.formulario.patchValue({
      inicioForm: this.valor_codigo
    })
    if (this.valor_codigo == '') {
      this.toastr.error('El registro automático solo funciona con valores numéricos', 'Existen códigos no numéricos ', {
        timeOut: 6000,
      })
    }
    this.automaticoF = true;
    this.registrar = false;
    this.manualF = false;
    this.cedulaF = false;
  }

  // METODO PARA OCULTAR CAMPO DE REGISTRO DE CODIGO
  QuitarCampo() {
    this.HabilitarDescrip = true;
    this.formulario.patchValue({
      inicioForm: ''
    })
    this.automaticoF = false;
    this.registrar = false;
    this.manualF = true;
  }

  // METODO PARA OCULTAR CAMPO DE REGISTRO DE CODIGO AL SELECCIONAR CEDULA
  QuitarCampoCedula() {
    this.HabilitarDescrip = true;
    this.formulario.patchValue({
      inicioForm: ''
    })
    this.automaticoF = false;
    this.registrar = false;
    this.manualF = false;
    this.cedulaF = true;
  }

  //TODO obtener codigo max
  // METODO PARA BUSCAR EL ULTIMO CODIGO REGISTRADO EN EL SISTEMA
  valor_codigo: any;
  VerUltimoCodigo() {
    this.rest.ObtenerCodigoMAX().subscribe(datosE => {
      this.valor_codigo = parseInt(datosE[0].codigo);
    }, error => {
      this.valor_codigo = '';
    })
  }

  // METODO DE INGRESO DE SOLO NUMEROS EN EL CAMPO DEL FORMULARIO
  IngresarSoloNumeros(evt: any) {
    return this.validar.IngresarSoloNumeros(evt);
  }

  // METODO DE RESETEAR VALORES EN EL FORMULARIO
  Limpiar() {
    this.formulario.reset();
    if (this.cedulaF === true) {
      this.QuitarCampoCedula();
    } else {
      this.QuitarCampo();
    }
  }

  // METODO PARA VISUALIZAR LA CONFIGURACION
  informacion: string = '';
  ver_informacion: boolean = false;
  VisualizarConfiguracion() {
    if (this.ver_informacion === false) {
      this.ver_informacion = true;
      this.rest.ObtenerCodigo().subscribe(datos => {
        if (datos[0].automatico === true) {
          this.informacion = 'El sistema se encuentra configurado para generar automáticamente el código de enrolamiento de los usuarios.';
        }
        else if (datos[0].manual === true) {
          this.informacion = 'El sistema se encuentra configurado para ingresar de forma manual el código de enrolamiento de los usuarios.';
        }
        else if (datos[0].cedula === true) {
          this.informacion = 'El sistema se encuentra configurado para considerar el número de identificación como código de enrolamiento de los usuarios.';
        }
      }, error => {
        this.informacion = 'El sistema no tienen una configuración de registro de código de enrolamiento.';
      });
    }
    else {
      this.ver_informacion = false;
    }
  }

  //CONTROL BOTONES
  private tienePermiso(accion: string, idFuncion?: number): boolean {
    const datosRecuperados = sessionStorage.getItem('paginaRol');
    if (datosRecuperados) {
      try {
        const datos = JSON.parse(datosRecuperados);
        return datos.some((item: any) =>
          item.accion === accion && (idFuncion === undefined || item.id_funcion === idFuncion)
        );
      } catch {
        return false;
      }
    } else {
      return parseInt(localStorage.getItem('rol') || '0') === 1;
    }
  }

  getConfigurar(){
    return this.tienePermiso('Guardar Configuración Código');
  }

  getVerConfiguracion(){
    return this.tienePermiso('Ver Configuración Código');
  }

}
