// IMPORTAR LIBRERIAS
import { FormControl, FormGroup } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';

// IMPORTAR SERVICIOS
import { EmpleadoService } from 'src/app/servicios/empleado/empleadoRegistro/empleado.service'

@Component({
  selector: 'app-configurar-codigo',
  templateUrl: './configurar-codigo.component.html',
  styleUrls: ['./configurar-codigo.component.css']
})

export class ConfigurarCodigoComponent implements OnInit {

  // VARIABLES DE MANEJO DE ACTIVACIÓN O DESACTIVACIÓN DE FUNCIONES
  HabilitarDescrip: boolean = true;
  automaticoF = false;
  manualF = false;
  registrar: boolean = true;

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
    public rest: EmpleadoService, // SERVICIO DATOS DE EMPLEADO
  ) { }

  ngOnInit(): void {
    this.VerUltimoCodigo();
  }

  // SELECCION DE METODO DE REGISTRO DE CODIGO DE EMPLEADO
  RegistrarConfiguracion(form: any) {
    this.rest.ObtenerCodigo().subscribe(datos => {
      if (this.automaticoF === true) {
        this.ActualizarAutomatico(form);
      }
      else {
        this.ActualizarManual();
      }
    }, error => {
      if (this.automaticoF === true) {
        this.CrearAutomatico(form);
      }
      else {
        this.CrearManual();
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
  CrearManual() {
    let dataCodigo = {
      id: 1,
      valor: null,
      manual: this.manualF,
      automatico: this.automaticoF,
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
    }
    if (form.inicioForm != '') {
      this.rest.ObtenerCodigoMAX().subscribe(datosE => {
        if (parseInt(datosE[0].codigo) < parseInt(form.inicioForm)) {
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
  ActualizarManual() {
    let dataCodigo = {
      id: 1,
      valor: null,
      manual: this.manualF,
      automatico: this.automaticoF,
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
    this.automaticoF = true;
    this.registrar = false;
    this.manualF = false;
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

  //TODO obtener codigo max
  // METODO PARA BUSCAR EL ULTIMO CODIGO REGISTRADO EN EL SISTEMA
  valor_codigo: any;
  VerUltimoCodigo() {
    this.rest.ObtenerCodigoMAX().subscribe(datosE => {
      this.valor_codigo = parseInt(datosE[0].codigo) + 1;
    }, error => {
      this.valor_codigo = '';
    })
  }

  // METODO DE INGRESO DE SOLO NUMEROS EN EL CAMPO DEL FORMULARIO
  IngresarSoloNumeros(evt: any) {
    if (window.event) {
      var keynum = evt.keyCode;
    }
    else {
      keynum = evt.which;
    }
    // COMPROBAMOS SI SE ENCUENTRA EN EL RANGO NUMERICO Y QUE TECLAS NO RECIBIRA.
    if ((keynum > 47 && keynum < 58) || keynum == 8 || keynum == 13 || keynum == 6) {
      return true;
    }
    else {
      this.toastr.info('No se admite el ingreso de letras', 'Usar solo números', {
        timeOut: 6000,
      })
      return false;
    }
  }

  // METODO DE RESETEAR VALORES EN EL FORMULARIO
  Limpiar() {
    this.formulario.reset();
    this.QuitarCampo();
  }

}
