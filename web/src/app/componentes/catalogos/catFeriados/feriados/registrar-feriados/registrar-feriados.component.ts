// IMPORTAR LIBRERIAS
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ProgressSpinnerMode } from '@angular/material/progress-spinner';
import { Component, OnInit } from '@angular/core';
import { startWith, map } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { ThemePalette } from '@angular/material/core';
import { Observable } from 'rxjs';
import * as moment from 'moment';

// IMPORTAR SERVICIOS
import { CiudadFeriadosService } from 'src/app/servicios/ciudadFeriados/ciudad-feriados.service';
import { ProvinciaService } from 'src/app/servicios/catalogos/catProvincias/provincia.service';
import { FeriadosService } from 'src/app/servicios/catalogos/catFeriados/feriados.service';

import { ListarFeriadosComponent } from '../listar-feriados/listar-feriados.component';

@Component({
  selector: 'app-registrar-feriados',
  templateUrl: './registrar-feriados.component.html',
  styleUrls: ['./registrar-feriados.component.css'],
})

export class RegistrarFeriadosComponent implements OnInit {

  // CONTROL DE CAMPOS Y VALIDACIONES DEL FORMULARIO
  fechaRecuperacionF = new FormControl('');
  descripcionF = new FormControl('');
  fechaF = new FormControl('', Validators.required);

  // CONTROL DE LOS CAMPOS DEL FORMULARIO
  nombreContinenteF = new FormControl('', Validators.required);
  nombreCiudadF = new FormControl('');
  idProvinciaF = new FormControl('', [Validators.required]);
  nombrePaisF = new FormControl('', Validators.required);
  tipoF = new FormControl('');

  // ASIGNACION DE VALIDACIONES A INPUTS DEL FORMULARIO
  public formulario = new FormGroup({
    fechaRecuperacionForm: this.fechaRecuperacionF,
    descripcionForm: this.descripcionF,
    fechaForm: this.fechaF,
    nombreContinenteForm: this.nombreContinenteF,
    nombreCiudadForm: this.nombreCiudadF,
    idProvinciaForm: this.idProvinciaF,
    nombrePaisForm: this.nombrePaisF,
    tipoForm: this.tipoF,
  });

  // VARIABLES PROGRESS SPINNER
  habilitarprogress: boolean = false;
  mode: ProgressSpinnerMode = 'indeterminate';
  color: ThemePalette = 'primary';
  value = 10;

  constructor(
    private rest: FeriadosService,
    private restP: ProvinciaService,
    private restF: CiudadFeriadosService,
    private toastr: ToastrService,
    public componentel: ListarFeriadosComponent,
  ) { }

  ngOnInit(): void {
    this.ObtenerFeriados();
    this.ObtenerContinentes();
  }

  // METODO PARA CONSULTAR FERIADOS
  feriados: any = [];
  ObtenerFeriados() {
    this.feriados = [];
    this.rest.ConsultarFeriado().subscribe(response => {
      this.feriados = response;
    })
  }

  // METODO PARA GUARDAR DATOS 
  contador: number = 0;
  InsertarFeriado(form: any) {
    this.contador = 0;
    let feriado = {
      fecha: form.fechaForm,
      descripcion: form.descripcionForm,
      fec_recuperacion: form.fechaRecuperacionForm
    };
    // VERIFICAR INGRESO DE FECHAS
    if (feriado.fec_recuperacion === '' || feriado.fec_recuperacion === null) {
      feriado.fec_recuperacion = null;
      this.VerificarSinRecuperacion(feriado);
    }
    else {
      this.ValidarFechaRecuperacion(feriado, form);
    }
  }

  // METODO PARA VALIDAR REGISTRO SIN FECHA DE RECUPERACION
  VerificarSinRecuperacion(feriado: any) {
    // VERIFICAMOS SI EXISTE REGISTROS
    if (this.feriados.length != 0) {
      this.feriados.forEach((obj: any) => {
        if (moment(obj.fecha_recuperacion).format('YYYY-MM-DD') === moment(feriado.fecha).format('YYYY-MM-DD')) {
          this.contador = 1;
        }
      })
      if (this.contador === 0) {
        this.CrearFeriado(feriado);
      }
      else {
        this.toastr.error('La fecha asignada para feriado ya se encuentra registrada como una fecha de recuperación.', 'Verificar fecha de recuperación.', {
          timeOut: 6000,
        })
      }
    }
    else {
      this.CrearFeriado(feriado);
    }
  }

  // VALIDAR REGISTRO CON FECHA DE RECUPERACION
  ValidarFechaRecuperacion(feriado: any, form: any) {
    // VERIFICAMOS SI EXISTE REGISTROS
    if (this.feriados.length != 0) {
      this.feriados.forEach((obj: any) => {
        if (obj.fecha.split('T')[0] === moment(feriado.fecha_recuperacion).format('YYYY-MM-DD') ||
          moment(obj.fecha_recuperacion).format('YYYY-MM-DD') === moment(feriado.fecha).format('YYYY-MM-DD')) {
          this.contador = 1;
        }
      })
      if (this.contador === 0) {
        if (Date.parse(form.fechaForm) < Date.parse(feriado.fecha_recuperacion)) {
          this.CrearFeriado(feriado);
        }
        else {
          this.toastr.error('La fecha de recuperación debe ser posterior a la fecha del feriado registrado.', 'Fecha de recuperación incorrecta', {
            timeOut: 6000,
          })
        }
      }
      else {
        this.toastr.error('La fecha asignada para feriado ya se encuentra registrada como una fecha de recuperación o la fecha de recuperación ya se encuentra registrada como un feriado', 'Verificar fecha de recuperación', {
          timeOut: 6000,
        })
      }
    }
    else {
      this.CrearFeriado(feriado);
    }
  }

  // METODO PARA REGISTRAR DATOS EN BASE DE DATOS
  CrearFeriado(datos: any) {
    // VALIDAR SI SE HA SELECCIONADO CIUDADES
    if (this.ciudadesSeleccionadas.length != 0) {
      this.habilitarprogress = true;
      this.rest.CrearNuevoFeriado(datos).subscribe(response => {
        this.habilitarprogress = false;
        console.log('ver ', response, 'response ', response.message)
        if (response.message === 'error') {
          this.toastr.error('La fecha del feriado o la fecha de recuperación se encuentran dentro de otro registro.', 'Upss!!! algo salio mal.', {
            timeOut: 6000,
          })
        }
        else if (response.message === 'existe') {
          this.toastr.warning('Nombre de feriado ya existe en el sistema.', 'Upss!!! algo salio mal.', {
            timeOut: 6000,
          })
        }
        else {
          this.InsertarFeriadoCiudad(response.id)
        }
      });
    }
    else {
      this.toastr.warning('No ha seleccionado CIUDADES.', 'Ups!!! algo salio mal.', {
        timeOut: 6000,
      })
    }
  }

  // METODO PARA CERRAR VENTANA DE REGISTRO
  CerrarVentana(valor: number) {
    if (valor === 0) {
      this.componentel.ver_lista = true;
      this.componentel.ver_registrar = false;
    } else {
      this.componentel.ver_ciudades = true;
      this.componentel.ver_registrar = false;
      this.componentel.pagina = 'listar-feriados';
      this.componentel.feriado_id = valor;
      this.componentel.BuscarParametro();
    }
  }

  /** ******************************************************************************************************* **
   ** **                                         ASIGNAR CIUDADES                                          ** **                                                   
   ** ******************************************************************************************************* **/

  // DATOS CIUDAD-FERIADO
  ciudadFeriados: any = [];
  nombreProvincias: any = [];

  actualizarPagina: boolean = false;

  // HABILITAR O DESHABILITAR SELECTOR DE CIUDADES
  Habilitar: boolean = true;

  // DATOS PROVINCIAS, CONTINENTES, PAÍSES Y CIUDADES
  nombreCiudades: any = [];
  continentes: any = [];
  provincias: any = [];
  paises: any = [];

  filteredOptPais: Observable<any[]>;
  filteredOptProv: Observable<any[]>;

  // METODO PARA FILTRAR DATOS DE PAISES
  private _filterPais(value: string): any {
    if (value != null) {
      const filterValue = value.toLowerCase();
      return this.paises.filter((pais: any) => pais.nombre.toLowerCase().includes(filterValue));
    }
  }

  // METODO PARA FILTRAR DATOS DE PROVINCIAS
  private _filterProvincia(value: string): any {
    if (value != null) {
      const filterValue = value.toLowerCase();
      return this.provincias.filter((provincias: any) => provincias.nombre.toLowerCase().includes(filterValue));
    }
  }

  // METODO PARA LISTAR CONTINENTES
  ObtenerContinentes() {
    this.continentes = [];
    this.restP.BuscarContinente().subscribe(datos => {
      this.continentes = datos;
    })
  }

  // METODO PARA BUSCAR PAISES
  ObtenerPaises(continente: any) {
    this.paises = [];
    this.restP.BuscarPais(continente).subscribe(datos => {
      this.paises = datos;
      this.filteredOptPais = this.nombrePaisF.valueChanges
        .pipe(
          startWith(''),
          map((value: any) => this._filterPais(value))
        );
    })
  }

  // METODO PARA MOSTRAR LISTA EN FORMULARIO
  FiltrarPaises(form: any) {
    var nombreContinente = form.nombreContinenteForm;
    this.ObtenerPaises(nombreContinente);
  }

  // METODO PARA BUSCAR PROVINCIAS
  ObtenerProvincias(pais: any) {
    this.provincias = [];
    this.restP.BuscarProvinciaPais(pais).subscribe(datos => {
      this.provincias = datos;
      this.filteredOptProv = this.idProvinciaF.valueChanges
        .pipe(
          startWith(''),
          map((value: any) => this._filterProvincia(value))
        );
    }, error => {
      this.toastr.info('El País seleccionado no tiene Provincias, Departamentos o Estados registrados.', '', {
        timeOut: 6000,
      })
    })
  }

  // METODO PARA MOSTRAR LISTA EN FORMULARIO
  FiltrarProvincias(form: any) {
    let idPais = 0;
    this.paises.forEach((obj: any) => {
      if (obj.nombre === form.nombrePaisForm) {
        idPais = obj.id
      }
    });
    this.ObtenerProvincias(idPais);
  }

  // METODO PARA LISTAR CIUDADES
  ObtenerCiudades(provincia: any) {
    this.nombreCiudades = [];
    this.restF.BuscarCiudadProvincia(provincia).subscribe(datos => {
      this.nombreCiudades = datos;
      this.Habilitar = false;
      if (this.ciudadesSeleccionadas.length != 0) {
        (<HTMLInputElement>document.getElementById('seleccionar')).checked = false;
      }
    }, error => {
      this.toastr.info('Provincia, Departamento o Estado no tiene ciudades registradas.', '', {
        timeOut: 6000,
      })
    })
  }

  // METODO PARA MOSTRAR LISTA DE CIUDADES
  FiltrarCiudades(form: any) {
    var nombreProvincia = form.idProvinciaForm;
    this.ObtenerCiudades(nombreProvincia);
  }

  // METODO PARA SELECCIONAR AGREGAR CIUDADES
  ciudadesSeleccionadas: any = [];
  AgregarCiudad(data: string) {
    this.ciudadesSeleccionadas.push(data);
  }

  // METODO PARA RETIRAR CIUDADES
  QuitarCiudad(data: any) {
    this.ciudadesSeleccionadas = this.ciudadesSeleccionadas.filter(s => s !== data);
  }

  // AGREGAR DATOS MULTIPLES DE CIUDADES DE LA PROVINCIA INDICADA
  AgregarTodos() {
    this.ciudadesSeleccionadas = this.nombreCiudades;
    for (var i = 0; i <= this.nombreCiudades.length - 1; i++) {
      (<HTMLInputElement>document.getElementById('ciudadesSeleccionadas' + i)).checked = true;
    }
  }

  // QUITAR TODOS LOS DATOS SELECCIONADOS DE LA PROVINCIA INDICADA
  limpiarData: any = [];
  QuitarTodos() {
    this.limpiarData = this.nombreCiudades;
    for (var i = 0; i <= this.limpiarData.length - 1; i++) {
      (<HTMLInputElement>document.getElementById('ciudadesSeleccionadas' + i)).checked = false;
      this.ciudadesSeleccionadas = this.ciudadesSeleccionadas.filter(s => s !== this.nombreCiudades[i]);
    }
  }

  // METODO PARA VERIFICAR SELECCION DE OPCION "Todas"
  isChecked: boolean = false;
  SeleccionarTodas(event: any) {
    if (event === true) {
      this.AgregarTodos();
    }
    else {
      this.QuitarTodos();
    }
  }

  // METODO PARA VERIFICAR SELECCION DE CIUDADES
  isChecked_: boolean = false;
  SeleccionarIndividual(event: any, valor: any) {
    const target = event.target as HTMLInputElement;
    if (target.checked === true) {
      this.AgregarCiudad(valor);
    }
    else {
      this.QuitarCiudad(valor);
    }
  }

  // METODO PARA ASIGNAR CIUDADES A FERIADO
  contadorc: number = 0;
  ingresar: number = 0;
  InsertarFeriadoCiudad(id: number) {
    this.ingresar = 0;
    this.contadorc = 0;

    this.habilitarprogress = true;
    // RECORRER LA LISTA DE CIUDADES SELECCIONADAS
    this.ciudadesSeleccionadas.map((obj: any) => {
      var buscarCiudad = {
        id_feriado: id,
        id_ciudad: obj.id
      }
      // BUSCAR ID DE CIUDADES EXISTENTES
      this.ciudadFeriados = [];
      this.restF.BuscarIdCiudad(buscarCiudad).subscribe(datos => {
        this.contadorc = this.contadorc + 1;
        this.ciudadFeriados = datos;
        this.VerMensaje(id);
        this.toastr.info('',
          'Se indica que ' + obj.descripcion + ' ya fue asignada a este Feriado.', {
          timeOut: 7000,
        })
      }, error => {
        this.restF.CrearCiudadFeriado(buscarCiudad).subscribe(response => {
          this.contadorc = this.contadorc + 1;
          this.ingresar = this.ingresar + 1;
          this.VerMensaje(id);
        }, error => {
          this.contadorc = this.contadorc + 1;
          this.VerMensaje(id);
          this.toastr.error('Verificar asignación de ciudades.', 'Ups!!! algo salio mal.', {
            timeOut: 6000,
          })
        });
      });
    });
  }

  // MOSTRAR MENSAJE DE REGISTRO
  VerMensaje(id: any) {
    if (this.contadorc === this.ciudadesSeleccionadas.length) {
      this.habilitarprogress = false;
      this.toastr.success('Feriado registrado exitosamente.',
        'Se ha asignado ' + this.ingresar + ' ciudades a este feriado.', {
        timeOut: 1000,
      });
      this.CerrarVentana(id);
    }
  }

  // METODO PARA LIMPIAR FORMULARIO
  LimpiarCampos() {
    this.formulario.reset();
  }

}
