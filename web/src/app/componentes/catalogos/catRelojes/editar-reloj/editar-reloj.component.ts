import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';

import { DepartamentosService } from 'src/app/servicios/catalogos/catDepartamentos/departamentos.service';
import { SucursalService } from 'src/app/servicios/sucursales/sucursal.service';
import { RelojesService } from 'src/app/servicios/catalogos/catRelojes/relojes.service';
import { ValidacionesService } from 'src/app/servicios/validaciones/validaciones.service';

@Component({
  selector: 'app-editar-reloj',
  templateUrl: './editar-reloj.component.html',
  styleUrls: ['./editar-reloj.component.css']
})

export class EditarRelojComponent implements OnInit {

  // CONTROL DE FORMULARIOS
  isLinear = true;
  primerFormulario: FormGroup;
  segundoFormulario: FormGroup;

  // VARIABLES DE ALMACENAMIENTO
  empresas: any = [];
  datosReloj: any = [];
  sucursales: any = [];
  departamento: any = [];
  idReloj: number;
  activarCampo: boolean = false;

  // VARIABLES DE SELECCION DE FUNCIONES
  selec1 = false;
  selec2 = false;

  // CONTROL DE CAMPOS Y VALIDACIONES DEL FORMULARIO

  // PRIMER FORMULARIO
  ipF = new FormControl('', [Validators.required, Validators.pattern("[0-9]{1,3}[.][0-9]{1,3}[.][0-9]{1,3}[.][0-9]{1,3}")]);
  nombreF = new FormControl('', [Validators.required, Validators.minLength(4)]);
  codigoF = new FormControl('', Validators.required);
  numeroF = new FormControl('', [Validators.required]);
  funcionesF = new FormControl('', [Validators.required]);
  idSucursalF = new FormControl('', Validators.required);
  idDepartamentoF = new FormControl('', [Validators.required]);

  // SEGUNDO FORMULARIO
  macF = new FormControl('');
  marcaF = new FormControl('', [Validators.minLength(4)]);
  serieF = new FormControl('', Validators.minLength(4));
  modeloF = new FormControl('', [Validators.minLength(3)]);
  puertoF = new FormControl('', [Validators.required, Validators.pattern('[0-9]{4}')]);
  fabricanteF = new FormControl('', [Validators.minLength(4)]);
  contraseniaF = new FormControl('', [Validators.minLength(4)]);
  idFabricacionF = new FormControl('', [Validators.minLength(4)]);

  constructor(
    private restCatDepartamento: DepartamentosService,
    private restSucursales: SucursalService,
    private formulario: FormBuilder,
    private validar: ValidacionesService,
    private toastr: ToastrService,
    private rest: RelojesService,
    public router: Router,
  ) {
    // OBTENER ID DE REGISTRO
    var cadena = this.router.url;
    var aux = cadena.split("/");
    this.idReloj = parseInt(aux[2]);
  }

  ngOnInit(): void {
    this.FiltrarSucursales();
    this.ValidarFormulario();
    this.ObtenerDatos();
  }

  // VALIDACIONES DE FORMULARIO
  ValidarFormulario() {
    this.primerFormulario = this.formulario.group({
      ipForm: this.ipF,
      nombreForm: this.nombreF,
      puertoForm: this.puertoF,
      numeroForm: this.numeroF,
      codigoForm: this.codigoF,
      funcionesForm: this.funcionesF,
      idSucursalForm: this.idSucursalF,
      idDepartamentoForm: this.idDepartamentoF,
    });
    this.segundoFormulario = this.formulario.group({
      macForm: this.macF,
      marcaForm: this.marcaF,
      serieForm: this.serieF,
      modeloForm: this.modeloF,
      fabricanteForm: this.fabricanteF,
      contraseniaForm: this.contraseniaF,
      idFabricacionForm: this.idFabricacionF,
    });
  }

  // METODO PARA IMPRIMIR DATOS EN FORMULARIO
  ObtenerDatos() {
    this.datosReloj = [];
    this.rest.ConsultarUnReloj(this.idReloj).subscribe(datos => {
      this.datosReloj = datos[0];
      this.BuscarDatos(this.datosReloj.id_sucursal);
      if (this.datosReloj.tien_funciones === true) {
        this.selec1 = true;
        this.activarCampo = true;
        this.primerFormulario.patchValue({
          numeroForm: this.datosReloj.numero_accion
        })
      }
      else {
        this.selec2 = true;
        this.activarCampo = false;
        this.primerFormulario.patchValue({
          numeroForm: 0
        })
      }
      this.primerFormulario.patchValue({
        ipForm: this.datosReloj.ip,
        nombreForm: this.datosReloj.nombre,
        puertoForm: this.datosReloj.puerto,
        codigoForm: this.datosReloj.id,
        funcionesForm: this.datosReloj.tien_funciones,
        idSucursalForm: this.datosReloj.id_sucursal,
        idDepartamentoForm: this.datosReloj.id_departamento,
      })
      this.segundoFormulario.patchValue({
        macForm: this.datosReloj.mac,
        marcaForm: this.datosReloj.marca,
        serieForm: this.datosReloj.serie,
        modeloForm: this.datosReloj.modelo,
        fabricanteForm: this.datosReloj.fabricante,
        contraseniaForm: this.datosReloj.contrasenia,
        idFabricacionForm: this.datosReloj.id_fabricacion,
      })
    })
  }

// METODO PARA BUSCAR DEPARTAMENTOS
  BuscarDatos(id_sucursal: number) {
    this.departamento = [];
    this.restCatDepartamento.BuscarDepartamentoSucursal(id_sucursal).subscribe(datos => {
      this.departamento = datos;
    });
  }

  // METODO PARA LISTAR SUCURSALES
  FiltrarSucursales() {
    let idEmpresa = parseInt(localStorage.getItem('empresa') as string);
    this.sucursales = [];
    this.restSucursales.BuscarSucursalEmpresa(idEmpresa).subscribe(datos => {
      this.sucursales = datos;
    }, error => {
      this.toastr.info('No se han encontrado registros de establecimientos.', '', {
        timeOut: 6000,
      })
    })
  }

  // METODO PARA LISTAR DEPARTAMENTOS POR SUCURSAL
  ObtenerDepartamentos(form: any) {
    this.departamento = [];
    let idSucursal = form.idSucursalForm;
    this.restCatDepartamento.BuscarDepartamentoSucursal(idSucursal).subscribe(datos => {
      this.departamento = datos;
    }, error => {
      this.toastr.info('Sucursal no cuenta con departamentos registrados.', '', {
        timeOut: 6000,
      })
    });
  }

  // METODO PARA REGISTRAR DATOS
  InsertarReloj(form1: any, form2: any) {
    let datosReloj = {
      // PRIMER FORMULARIO
      id: form1.codigoForm,
      ip: form1.ipForm,
      id_real: this.idReloj,
      nombre: form1.nombreForm,
      puerto: form1.puertoForm,
      id_sucursal: form1.idSucursalForm,
      numero_accion: form1.numeroForm,
      tien_funciones: form1.funcionesForm,
      id_departamento: form1.idDepartamentoForm,

      // SEGUNDO FORMULARIO
      mac: form2.macForm,
      marca: form2.marcaForm,
      serie: form2.serieForm,
      modelo: form2.modeloForm,
      fabricante: form2.fabricanteForm,
      contrasenia: form2.contraseniaForm,
      id_fabricacion: form2.idFabricacionForm,
    };

    this.rest.ActualizarDispositivo(datosReloj).subscribe(response => {
      if (response.message === 'actualizado') {
        this.toastr.success('Operación Exitosa.', 'Registro actualizado.', {
          timeOut: 6000,
        });
        this.router.navigate(['/verDispositivos/', this.idReloj]);
      }
      else {
        this.toastr.error(
          'Verificar que el código de reloj y la ip del dispositivo no se encuentren registrados.',
          'Operación Fallida', {
          timeOut: 6000,
        })
      }
    });
  }

  // MENSAJES DE ERROR
  ObtenerMensajeErrorIp() {
    if (this.ipF.hasError('pattern')) {
      return 'Ingresar IP Ej: 0.0.0.0';
    }
  }

  // MENSAJE DE ERROR
  ObtenerMensajeErrorPuerto() {
    if (this.puertoF.hasError('pattern')) {
      return 'Ingresar 4 números.';
    }
  }

  // METODO PARA REGISTRAR IP 
  IngresarIp(evt: any) {
    if (window.event) {
      var keynum = evt.keyCode;
    }
    else {
      keynum = evt.which;
    }
    // COMPROBAMOS SI SE ENCUENTRA EN EL RANGO NUMÉRICO Y QUE TECLAS NO RECIBIRÁ.
    if ((keynum > 47 && keynum < 58) || keynum == 8 || keynum == 13 || keynum == 6 || keynum == 46) {
      return true;
    }
    else {
      this.toastr.info('No se admite el ingreso de letras.', 'Usar solo números.', {
        timeOut: 6000,
      })
      return false;
    }
  }

  // METODO PARA INGRESAR SOLO NUMEROS
  IngresarSoloNumeros(evt: any) {
    return this.validar.IngresarSoloNumeros(evt);
  }

  // METODO PARA ACTIVAR CAMPO NUMERO DE FUNCIONES
  ActivarVista() {
    this.activarCampo = true;
    this.primerFormulario.patchValue({
      numeroForm: ''
    })
  }

  // METODO PARA OCULTAR CAMPO NUMERO DE FUNCIONES
  DesactivarVista() {
    this.activarCampo = false;
    this.primerFormulario.patchValue({
      numeroForm: 0
    })
  }

  // METODO PARA LIMPIAR FORMULARIO
  LimpiarCampos() {
    this.primerFormulario.reset();
    this.segundoFormulario.reset();
  }

  CerrarVentana() {
    this.LimpiarCampos();
  }

}
