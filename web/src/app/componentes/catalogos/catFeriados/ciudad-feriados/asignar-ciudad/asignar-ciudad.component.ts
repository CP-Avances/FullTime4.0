import { FormControl, Validators, FormGroup } from '@angular/forms';
import { ProgressSpinnerMode } from '@angular/material/progress-spinner';
import { Component, OnInit, Input } from '@angular/core';
import { startWith, map } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { ThemePalette } from '@angular/material/core';
import { Observable } from 'rxjs';

import { CiudadFeriadosService } from 'src/app/servicios/ciudadFeriados/ciudad-feriados.service';
import { ProvinciaService } from 'src/app/servicios/catalogos/catProvincias/provincia.service';
import { FeriadosService } from 'src/app/servicios/catalogos/catFeriados/feriados.service';

import { ListarCiudadFeriadosComponent } from '../listar-ciudad-feriados/listar-ciudad-feriados.component';
import { ListarFeriadosComponent } from '../../feriados/listar-feriados/listar-feriados.component';

@Component({
  selector: 'app-asignar-ciudad',
  templateUrl: './asignar-ciudad.component.html',
  styleUrls: ['./asignar-ciudad.component.css']
})

export class AsignarCiudadComponent implements OnInit {

  @Input() id_feriado: number;
  @Input() pagina: string;

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

  // CONTROL DE LOS CAMPOS DEL FORMULARIO
  nombreContinenteF = new FormControl('', Validators.required);
  nombreCiudadF = new FormControl('');
  idProvinciaF = new FormControl('', [Validators.required]);
  nombrePaisF = new FormControl('', Validators.required);
  tipoF = new FormControl('');

  // ASIGNAR LOS CAMPOS EN UN FORMULARIO EN GRUPO
  public formulario = new FormGroup({
    nombreContinenteForm: this.nombreContinenteF,
    nombreCiudadForm: this.nombreCiudadF,
    idProvinciaForm: this.idProvinciaF,
    nombrePaisForm: this.nombrePaisF,
    tipoForm: this.tipoF,
  });

  /**
   * VARIABLES PROGRESS SPINNER
   */
  habilitarprogress: boolean = false;
  color: ThemePalette = 'primary';
  mode: ProgressSpinnerMode = 'indeterminate';
  value = 10;

  // VARIABLES PARA AUDITORIA
  user_name: string | null;
  ip: string | null;

  constructor(
    private restF: CiudadFeriadosService,
    private restP: ProvinciaService,
    private toastr: ToastrService,
    private feriado_: FeriadosService,
    public componentec: ListarCiudadFeriadosComponent,
    public componentef: ListarFeriadosComponent,
  ) { }

  ngOnInit(): void {
    this.user_name = localStorage.getItem('usuario');
    this.ip = localStorage.getItem('ip');

    this.ObtenerContinentes();
    this.BuscarDatosFeriado(this.id_feriado);
  }

  // METODO PARA BUSCAR INFORMACION DE UN FERIADO
  feriado: any = [];
  BuscarDatosFeriado(idFeriado: number) {
    this.feriado = [];
    this.feriado_.ConsultarUnFeriado(idFeriado).subscribe(data => {
      this.feriado = data[0];
      this.feriado.descripcion = this.feriado.descripcion.toUpperCase();
    })
  }

  // METODO PARA FILTRAR DATOS DE PAISES
  private _filterPais(value: string): any {
    if (value != null) {
      const filterValue = value.toLowerCase();
      return this.paises.filter(pais => pais.nombre.toLowerCase().includes(filterValue));
    }
  }

  // METODO PARA FILTRAR DATOS DE PROVINCIAS
  private _filterProvincia(value: string): any {
    if (value != null) {
      const filterValue = value.toLowerCase();
      return this.provincias.filter(provincias => provincias.nombre.toLowerCase().includes(filterValue));
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
  contador: number = 0;
  ingresar: number = 0;
  InsertarFeriadoCiudad() {
    this.ingresar = 0;
    this.contador = 0;
    // VALIDAR SI SE HA SELECCIONADO CIUDADES
    if (this.ciudadesSeleccionadas.length != 0) {
      this.habilitarprogress = true;
      // RECORRER LA LISTA DE CIUDADES SELECCIONADAS
      this.ciudadesSeleccionadas.map((obj: any) => {
        var buscarCiudad = {
          id_feriado: this.id_feriado,
          id_ciudad: obj.id,
          user_name: this.user_name,
          ip: this.ip,
        }
        // BUSCAR ID DE CIUDADES EXISTENTES
        this.ciudadFeriados = [];
        this.restF.BuscarIdCiudad(buscarCiudad).subscribe(datos => {
          this.contador = this.contador + 1;
          this.ciudadFeriados = datos;
          this.habilitarprogress = false;
          this.VerMensaje();
          this.toastr.info('Se indica que ' + obj.descripcion + ' ya fue asignada a este Feriado.', '', {
            timeOut: 7000,
          })
        }, error => {
          this.habilitarprogress = false;
          this.restF.CrearCiudadFeriado(buscarCiudad).subscribe(response => {
            this.contador = this.contador + 1;
            this.ingresar = this.ingresar + 1;
            this.VerMensaje();
          }, error => {
            this.contador = this.contador + 1;
            this.VerMensaje();
            this.toastr.error('Ups!!! algo salio mal..', 'Ups!!! algo salio mal.', {
              timeOut: 6000,
            })
          });
        });
      });
    }
    else {
      this.toastr.warning('No ha seleccionado CIUDADES.', 'Ups!!! algo salio mal.', {
        timeOut: 6000,
      })
    }
  }

  // MOSTRAR MENSAJE DE REGISTRO
  VerMensaje() {
    if (this.contador === this.ciudadesSeleccionadas.length) {
      this.toastr.success('Operación exitosa.', 'Se ha asignado ' + this.ingresar + ' ciudades a este feriado.', {
        timeOut: 1000,
      });
      this.CerrarVentana(2);
    }
  }

  // METODO PARA LIMPIAR FORMULARIO
  LimpiarCampos() {
    this.formulario.reset();
  }

  // METODO PARA CERRAR VENTA DE REGISTRO
  CerrarVentana(opcion: number) {
    this.LimpiarCampos();
    if (this.pagina === 'listar-ciudades') {
      this.componentec.ver_lista = true;
      this.componentec.ver_asignar = false;
      if (opcion === 2) {
        this.componentec.ListarCiudadesFeriados(this.id_feriado);
      }
    }
    else {
      this.componentef.ver_asignar = false;
      this.componentef.ver_ciudades = true;
    }
  }
}
