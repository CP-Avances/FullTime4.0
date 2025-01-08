import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Component, OnInit, Inject } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

import { PlanComidasService } from 'src/app/servicios/modulos/modulo-alimentacion/planComidas/plan-comidas.service';
import { TipoComidasService } from 'src/app/servicios/modulos/modulo-alimentacion/catTipoComidas/tipo-comidas.service';
import { ValidacionesService } from 'src/app/servicios/generales/validaciones/validaciones.service';

@Component({
  selector: 'app-editar-tipo-comidas',
  templateUrl: './editar-tipo-comidas.component.html',
  styleUrls: ['./editar-tipo-comidas.component.css']
})

export class EditarTipoComidasComponent implements OnInit {
  ips_locales: any = '';

  // VARIABLES PARA AUDITORIA
  user_name: string | null;
  ip: string | null;

  // CONTROL DE CAMPOS Y VALIDACIONES DEL FORMULARIO
  tipoF = new FormControl('');
  nombreF = new FormControl('', [Validators.required, Validators.minLength(4)]);
  horaFinF = new FormControl('', [Validators.required]);
  servicioF = new FormControl('', [Validators.minLength(3)]);
  horaInicioF = new FormControl('', [Validators.required]);

  // ASIGNACION DE VALIDACIONES A INPUTS DEL FORMULARIO
  public TipoComidaForm = new FormGroup({
    tipoForm: this.tipoF,
    nombreForm: this.nombreF,
    horaFinForm: this.horaFinF,
    servicioForm: this.servicioF,
    horaInicioForm: this.horaInicioF,
  });

  constructor(
    private rest: TipoComidasService,
    private toastr: ToastrService,
    public ventana: MatDialogRef<EditarTipoComidasComponent>,
    public restPlan: PlanComidasService,
    public validar: ValidacionesService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit(): void {
    this.user_name = localStorage.getItem('usuario');
    this.ip = localStorage.getItem('ip');  
    this.validar.ObtenerIPsLocales().then((ips) => {
      this.ips_locales = ips;
    }); 

    this.ObtenerServicios();
    this.servicios[this.servicios.length] = { nombre: "OTRO" };
    this.ImprimirDatos();
  }

  // METODO PARA MOSTRAR DATOS EN EL FORMULARIO
  ImprimirDatos() {
    this.TipoComidaForm.patchValue({
      nombreForm: this.data.nombre,
      tipoForm: this.data.tipo,
      horaInicioForm: this.data.hora_inicio,
      horaFinForm: this.data.hora_fin
    })
  }

  // METODO PARA REGISTRAR DATOS
  GuardarDatos(datos: any) {
    this.rest.ActualizarUnAlmuerzo(datos).subscribe(response => {
      this.toastr.success('Operación exitosa.', 'Registro actualizado.', {
        timeOut: 6000,
      })
      this.Salir(2);
    }, error => {
      this.toastr.error('Ups!!! algo salio mal.', 'No se guardo el registro.', {
        timeOut: 6000,
      })
    });
  }

  // METODO PARA CAPTURAR DATOS DEL FORMULARIO
  InsertarTipoComida(form: any) {
    let datosTipoComida = {
      id: this.data.id,
      nombre: form.nombreForm,
      tipo_comida: form.tipoForm,
      hora_inicio: form.horaInicioForm,
      hora_fin: form.horaFinForm,
      user_name: this.user_name,
      ip: this.ip, ip_local: this.ips_locales,
    };
    if (form.tipoForm === undefined) {
      this.RegistrarServicio(form, datosTipoComida);
    }
    else {
      this.GuardarDatos(datosTipoComida);
    }
    this.ObtenerServicios();
  }

  // METODO PARA LIMPIAR FORMULARIO
  LimpiarCampos() {
    this.TipoComidaForm.reset();
  }

  // METODO PARA SALIR DEL REGISTRO
  Salir(opcion: number) {
    this.LimpiarCampos();
    this.ventana.close(opcion);
  }

  // METODO PARA REGISTRAR UN NUEVO TIPO DE SERVICIO
  habilitarServicio: boolean = false;
  IngresarServicio(form: any) {
    if (form.tipoForm === undefined) {
      this.TipoComidaForm.patchValue({
        servicioForm: '',
      });
      this.habilitarServicio = true;
      this.toastr.info('Ingresar nombre del nuevo tipo de servicio.', 'Etiqueta Ingresar Servicio activa.', {
        timeOut: 6000,
      })
      this.habilitarSeleccion = false;
    }
  }

  // METODO PARA VER LISTA DE SERVICIOS
  habilitarSeleccion: boolean = true;
  VerTiposServicios() {
    this.TipoComidaForm.patchValue({
      servicioForm: '',
    });
    this.habilitarServicio = false;
    this.habilitarSeleccion = true;
  }

  // METODO PARA LISTAR SERVICIOS
  servicios: any = [];
  ObtenerServicios() {
    this.servicios = [];
    this.restPlan.ObtenerTipoComidas().subscribe(datos => {
      this.servicios = datos;
      this.servicios[this.servicios.length] = { nombre: "OTRO" };
    })
  }

  // METODO PARA REGISTRAR NUEVO SERVICIO
  RegistrarServicio(form: any, datos: any) {
    if (form.servicioForm != '') {
      let tipo_servicio = {
        nombre: form.servicioForm,
        user_name: this.user_name,
        ip: this.ip, ip_local: this.ips_locales
      }
      this.restPlan.CrearTipoComidas(tipo_servicio).subscribe(res => {
        datos.tipo_comida = res.id;
        this.GuardarDatos(datos);
      });
    }
    else {
      this.toastr.info('Ingresar el tipo de servicio.', 'Ups!!! algo salio mal.', {
        timeOut: 6000,
      });
    }
  }

}
