import { Validators, FormControl, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Component, OnInit, Inject } from '@angular/core';
import { ProgressSpinnerMode } from '@angular/material/progress-spinner';
import { startWith, map } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { ThemePalette } from '@angular/material/core';
import { Observable } from 'rxjs';

import { CiudadFeriadosService } from 'src/app/servicios/ciudadFeriados/ciudad-feriados.service';
import { ProvinciaService } from 'src/app/servicios/catalogos/catProvincias/provincia.service';
import { SucursalService } from 'src/app/servicios/sucursales/sucursal.service';
import { CiudadService } from 'src/app/servicios/ciudad/ciudad.service';

@Component({
  selector: 'app-editar-sucursal',
  templateUrl: './editar-sucursal.component.html',
  styleUrls: ['./editar-sucursal.component.css']
})

export class EditarSucursalComponent implements OnInit {

  // DATOS PROVINCIAS, CONTINENTES, PAÍSES Y CIUDADES
  continentes: any = [];
  provincias: any = [];
  empresas: any = [];
  ciudades: any = [];
  paises: any = [];

  filteredOptPais: Observable<any[]>;
  filteredOptProv: Observable<any[]>;
  filteredOptCiud: Observable<any[]>;

  ver_provincia: boolean = true;
  ver_ciudad: boolean = true;
  ver_pais: boolean = true;
  sucursal: boolean = true;

  nombreContinenteF = new FormControl('', Validators.required);
  idProvinciaF = new FormControl('', [Validators.required]);
  nombrePaisF = new FormControl('', Validators.required);
  idEmpresaF = new FormControl('', Validators.required);
  idCiudad = new FormControl('', [Validators.required]);
  nombre = new FormControl('', [Validators.required, Validators.minLength(4)]);

  /**
   * VARIABLES PROGRESS SPINNER
   */
  habilitarprogress: boolean = false;
  color: ThemePalette = 'primary';
  mode: ProgressSpinnerMode = 'indeterminate';
  value = 10;

  public formulario = new FormGroup({
    nombreContinenteForm: this.nombreContinenteF,
    sucursalNombreForm: this.nombre,
    idProvinciaForm: this.idProvinciaF,
    nombrePaisForm: this.nombrePaisF,
    idCiudadForm: this.idCiudad,
  });

  constructor(
    private restP: ProvinciaService,
    private restF: CiudadFeriadosService,
    private ciudad: CiudadService,
    private toastr: ToastrService,
    public ventana: MatDialogRef<EditarSucursalComponent>,
    public restSucursal: SucursalService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit(): void {
    this.ObtenerContinentes();
  }

  // BUSQUEDA DE DATOS INGRESANDO LETRAS
  private _filterPais(value: string): any {
    if (value != null) {
      const filterValue = value.toLowerCase();
      return this.paises.filter(pais => pais.nombre.toLowerCase().includes(filterValue));
    }
  }

  private _filterProvincia(value: string): any {
    if (value != null) {
      const filterValue = value.toLowerCase();
      return this.provincias.filter(provincias => provincias.nombre.toLowerCase().includes(filterValue));
    }
  }

  private _filterCiudad(value: string): any {
    if (value != null) {
      const filterValue = value.toLowerCase();
      return this.ciudades.filter(ciudades => ciudades.descripcion.toLowerCase().includes(filterValue));
    }
  }

  // METODO DE BUSQUEDA DE CONTINENTES
  ObtenerContinentes() {
    this.continentes = [];
    this.restP.BuscarContinente().subscribe(datos => {
      this.continentes = datos;
      this.ObtenerInformacion();
    });
  }

  // METODO DE BUSQUEDA DE CIUDADES
  informacion: any = [];
  ObtenerInformacion() {
    this.informacion = [];
    this.ciudad.BuscarInformacionCiudad(this.data.id_ciudad).subscribe(datos => {
      this.informacion = datos[0];
      this.ObtenerPaises(this.informacion.continente);
      this.ObtenerProvincias(this.informacion.id_pais);
      this.ObtenerCiudades(this.informacion.provincia);
      this.CargarDatos();
    });
  }

  CargarDatos() {
    this.nombreContinenteF.setValue(this.informacion.continente);
    this.nombrePaisF.setValue(this.informacion.pais);
    this.idProvinciaF.setValue(this.informacion.provincia);
    this.idCiudad.setValue(this.data.descripcion);
    this.nombre.setValue(this.data.nombre);
    this.sucursal = false;
  }

  // METODO DE BUSQUEDA DE PAISES
  ObtenerPaises(continente: any) {

    this.LimpiarPais();
    this.LimpiarCiudad();
    this.LimpiarSucursal();
    this.LimpiarProvincia();

    this.restP.BuscarPais(continente).subscribe(datos => {
      this.paises = datos;
      this.ver_pais = false;
      this.filteredOptPais = this.nombrePaisF.valueChanges
        .pipe(
          startWith(''),
          map((value: any) => this._filterPais(value))
        );
    })
  }

  // METODO PARA CARGAR DATOS DE PAISES EN EL FORMULARIO
  FiltrarPaises(form: any) {
    this.ObtenerPaises(form.nombreContinenteForm);
  }

  // METODO PARA BUSCAR PROVINCIAS
  ObtenerProvincias(pais: any) {

    this.LimpiarProvincia();
    this.LimpiarSucursal();
    this.LimpiarCiudad();

    this.restP.BuscarProvinciaPais(pais).subscribe(datos => {
      this.provincias = datos;
      this.ver_provincia = false;
      this.filteredOptProv = this.idProvinciaF.valueChanges
        .pipe(
          startWith(''),
          map((value: any) => this._filterProvincia(value))
        );
    }, error => {
      this.toastr.info('El País seleccionado no tiene Provincias, Departamentos o Estados registrados.', '', {
        timeOut: 6000,
      });
      this.nombrePaisF.reset();
      this.ver_provincia = true;
    })
  }

  // METODO PARA CARGAR INFORMACION DE PROVINCIAS EN EL FORMULARIO
  FiltrarProvincias(form: any) {
    let idPais: number = 0;
    this.paises.forEach(obj => {
      if (obj.nombre === form.nombrePaisForm) {
        idPais = obj.id
      }
    });
    this.ObtenerProvincias(idPais);
  }

  // METODO PARA CONSULTAR CIUDADES
  ObtenerCiudades(provincia: any) {

    this.LimpiarCiudad();
    this.LimpiarSucursal();

    this.restF.BuscarCiudadProvincia(provincia).subscribe(datos => {
      this.ciudades = datos;
      this.ver_ciudad = false;
      this.filteredOptCiud = this.idCiudad.valueChanges
        .pipe(
          startWith(''),
          map((value: any) => this._filterCiudad(value))
        );
    }, error => {
      this.toastr.info('Provincia, Departamento o Estado no tiene ciudades registradas', '', {
        timeOut: 6000,
      });
      this.idProvinciaF.reset();
      this.ver_ciudad = true;
    })
  }

  // METODO PARA CARGAR CIUDADES EN EL FORMULARIO
  FiltrarCiudades(form: any) {
    this.ObtenerCiudades(form.idProvinciaForm);
  }

  // METODO PARA ACTIVAR REGISTRO DE ESTABLECIMIENTO
  SeleccionarCiudad() {
    this.sucursal = false;
  }

  // METODO PARA REGISTRAR SUCURSAL
  InsertarSucursal(form: any) {

    // VALIDAR REGISTRO DE CIUDAD
    let ciudad_id: number = 0;
    this.ciudades.forEach(obj => {
      if (obj.descripcion.toUpperCase() === form.idCiudadForm.toUpperCase()) {
        ciudad_id = obj.id
      }
    });

    // VALIDAR SI LA CIUDAD SELECCIONADA ES CORRECTA
    if (ciudad_id != 0) {

      this.habilitarprogress = true;
      let sucursal = {
        id: this.data.id,
        nombre: form.sucursalNombreForm,
        id_ciudad: ciudad_id,
      }

      // VERIFICAR SI EL NOMBRE DEL REGISTRO FUE CAMBIADO
      if (form.sucursalNombreForm.toUpperCase() === this.data.nombre.toUpperCase()) {
        this.ActualizarSucursal(sucursal);
      }
      else {
        let buscar = {
          nombre: form.sucursalNombreForm.toUpperCase()
        }
        // VERIFICACION DE NOMBRES DUPLICADOS
        this.restSucursal.BuscarNombreSucursal(buscar).subscribe(responseS => {
          this.toastr.warning('El nombre de Sucursal ya se encuentra registrado.', 'Ups!! algo salio mal.', {
            timeOut: 6000,
          });
          this.habilitarprogress = false;
        }, vacio => {
          this.ActualizarSucursal(sucursal);
        })
      }
    }
    else {
      this.toastr.warning('Verificar registro de ciudad.', '', {
        timeOut: 6000,
      });
    }
  }

  // METODO PARA ACTUALIZAR REGISTRO
  ActualizarSucursal(sucursal: any) {
    this.restSucursal.ActualizarSucursal(sucursal).subscribe(response => {
      this.toastr.success('Operación exitosa.', 'Registro actualizado.', {
        timeOut: 6000,
      });
      this.habilitarprogress === false;
      this.CerrarVentana();
    });
  }

  // METODO PARA CERRAR VENTANA
  CerrarVentana() {
    this.ventana.close(this.data.id);
  }

  Salir() {
    this.ventana.close(0);
  }

  // METODOS PARA LIMPIAR FORMULARIO SEGUN SELECCION
  LimpiarPais() {
    this.paises = [];
    this.ver_pais = true;
    this.nombrePaisF.reset();
  }

  LimpiarProvincia() {
    this.provincias = [];
    this.idProvinciaF.reset();
    this.ver_provincia = true;
  }

  LimpiarCiudad() {
    this.ciudades = [];
    this.idCiudad.reset();
    this.ver_ciudad = true;
  }

  LimpiarSucursal() {
    this.sucursal = true;
    this.nombre.reset();
  }

}
