import { FormControl, Validators, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Component, OnInit, Inject } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

import { CiudadFeriadosService } from 'src/app/servicios/horarios/ciudadFeriados/ciudad-feriados.service';
import { ProvinciaService } from 'src/app/servicios/configuracion/localizacion/catProvincias/provincia.service';
import { CiudadService } from 'src/app/servicios/configuracion/localizacion/ciudad/ciudad.service'
import { ValidacionesService } from 'src/app/servicios/generales/validaciones/validaciones.service';

@Component({
  selector: 'app-editar-ciudad',
  standalone: false,
  templateUrl: './editar-ciudad.component.html',
  styleUrls: ['./editar-ciudad.component.css']
})

export class EditarCiudadComponent implements OnInit {
  ips_locales: any = '';

  // DATOS CIUDAD-FERIADO
  ciudadFeriados: any = [];
  nombreProvincias: any = [];

  actualizarPagina: boolean = false;

  // DATOS PROVINCIAS, CONTINENTES, PAÍSES Y CIUDADES
  nombreCiudades: any = [];
  continentes: any = [];
  provincias: any = [];
  paises: any = [];

  // BUSCAR ID
  idProv: any = [];
  idPais: any = [];
  idContin: any = [];

  // CONTROL DE LOS CAMPOS DEL FORMULARIO
  nombreContinenteF = new FormControl('', Validators.required);
  nombreCiudadF = new FormControl('', [Validators.required]);
  idProvinciaF = new FormControl('', [Validators.required]);
  nombrePaisF = new FormControl('', Validators.required);

  // ASIGNAR LOS CAMPOS EN UN FORMULARIO EN GRUPO
  public asignarCiudadForm = new FormGroup({
    nombreContinenteForm: this.nombreContinenteF,
    nombreCiudadForm: this.nombreCiudadF,
    idProvinciaForm: this.idProvinciaF,
    nombrePaisForm: this.nombrePaisF,
  });

  // VARIABLES PARA AUDITORIA
  user_name: string | null;
  ip: string | null;

  constructor(
    public restCiudad: CiudadService,
    private restF: CiudadFeriadosService,
    private restP: ProvinciaService,
    private toastr: ToastrService,
    public ventana: MatDialogRef<EditarCiudadComponent>,
    public validar: ValidacionesService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit(): void {
    this.user_name = localStorage.getItem('usuario');
    this.ip = localStorage.getItem('ip');  
    this.validar.ObtenerIPsLocales().then((ips) => {
      this.ips_locales = ips;
    }); 

    this.ObtenerContinentes();
    this.CargarDatos();
  }

  // METODO PARA MOSTRAR DATOS EN FORMULARIO
  CargarDatos() {
    // BUSCAR DATOS DE LA CIUDAD
    this.restCiudad.BuscarUnaCiudad(this.data.idciudad).subscribe(datosC => {
      this.idProv = datosC;
      //BUSCAR DATOS DE LA PROVINCIA
      this.restP.BuscarUnaProvinciaId(this.idProv[0].id_provincia).subscribe(datosP => {
        this.idPais = datosP;
        // CARGAR PROVINCIAS DEL PAIS ESTABLECIDO
        this.ObtenerProvincias(this.idPais[0].id_pais);
        // CARGAR CIUDADES DE LA PROVINCIA ESTABLECIDA
        this.ObtenerCiudades(this.idPais[0].nombre);
        // IMPRIMIR DATOS EN PANTALLA
        this.asignarCiudadForm.patchValue({
          idProvinciaForm: this.idPais[0].nombre,
        })
        // BUSCAR DATOS DEL PAIS
        this.restP.BuscarPaisId(this.idPais[0].id_pais).subscribe(datosC => {
          this.idContin = datosC;
          // CARGAR DATOS DEL PAIS ESTABLECIDO
          this.ObtenerPaises(this.idContin[0].continente);
          // MOSTRAR DATOS EN PANTALLA
          this.asignarCiudadForm.patchValue({
            nombreContinenteForm: this.idContin[0].continente,
            nombrePaisForm: this.idContin[0].id,
            nombreCiudadForm: this.data.idciudad,
          })
        })
      })
    })
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
    })
  }

  // METODO PARA MOSTRAR LISTA DE PAISES
  FiltrarPaises(form: any) {
    var nombreContinente = form.nombreContinenteForm;
    this.ObtenerPaises(nombreContinente);
    this.LimpiarDatosContinente();
  }

  // METODO PARA BUSCAR PROVINCIAS
  ObtenerProvincias(pais: any) {
    this.provincias = [];
    this.restP.BuscarProvinciaPais(pais).subscribe(datos => {
      this.provincias = datos;
    }, error => {
      this.toastr.info('El País seleccionado no tiene Provincias, Departamentos o Estados registrados.', '', {
        timeOut: 6000,
      })
    })
  }

  // METODO PARA MOSTRAR LISTA DE PROVINCIAS
  FiltrarProvincias(form: any) {
    var nombrePais = form.nombrePaisForm;
    this.ObtenerProvincias(nombrePais);
    this.LimpiarDatosPais()
  }

  // METODO PARA BUSCAR CIUDADES
  ObtenerCiudades(provincia: any) {
    this.nombreCiudades = [];
    this.restF.BuscarCiudadProvincia(provincia).subscribe(datos => {
      this.nombreCiudades = datos;
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
    this.LimpiarDatosProvincia();
  }

  // METODO PARA SELECCIONAR CIUDAD
  SeleccionarCiudad(form: any) {
    var nombreCiudad = form.nombreCiudadForm;
    if (nombreCiudad === undefined) {
      this.toastr.info('No ha seleccionado una CIUDAD.', '', {
        timeOut: 6000,
      })
    }
  }

  // METODO PARA LIMPIAR FORMULARIO
  LimpiarCampos() {
    this.asignarCiudadForm.reset();
    this.ObtenerContinentes();
    this.paises = [];
    this.provincias = [];
    this.nombreCiudades = [];
  }

  // METODO PARA LIMPIAR FORMULARIO CONTINENTE
  LimpiarDatosContinente() {
    this.paises = [];
    this.provincias = [];
    this.nombreCiudades = [];
    this.asignarCiudadForm.patchValue({
      nombreCiudadForm: '',
      idProvinciaForm: '',
      nombrePaisForm: '',
    })
  }

  // METODO PARA LIMPIAR FORMULARIO PAIS
  LimpiarDatosPais() {
    this.provincias = [];
    this.nombreCiudades = [];
    this.asignarCiudadForm.patchValue({
      nombreCiudadForm: '',
      idProvinciaForm: '',
    })
  }

  // METODO PARA LIMPIAR FORMULARIO PROVINCIAS
  LimpiarDatosProvincia() {
    this.nombreCiudades = [];
    this.asignarCiudadForm.patchValue({
      nombreCiudadForm: '',
    })
  }

  // METODO PARA CERRAR VENTANA DE REGISTRO
  CerrarVentana() {
    this.LimpiarCampos();
    this.ventana.close();
  }

  // METODO PARA ACTUALIZAR REGISTRO
  InsertarFeriadoCiudad(form: any) {
    var idFeriado = this.data.idferiado;
    var nombreCiudad = form.nombreCiudadForm;
    var ciudad = {
      id_feriado: idFeriado,
      id_ciudad: nombreCiudad,
      id: this.data.idciudad_asignada,
      user_name: this.user_name,
      ip: this.ip, ip_local: this.ips_locales,
    }
    this.ciudadFeriados = [];
    // VALIDAR EXISTENCIA DE REGISTRO
    this.restF.BuscarIdCiudad(ciudad).subscribe(datos => {
      this.ciudadFeriados = datos;
      this.toastr.info('Se le recuerda que esta Ciudad ya fue asignada a este Feriado.', '', {
        timeOut: 6000,
      })
    }, error => {
      // METODO PARA ACTUALIZAR DATOS
      this.restF.ActualizarDatos(ciudad).subscribe(response => {
        this.toastr.success('Operación exitosa.', 'Registro actualizado.', {
          timeOut: 6000,
        });
        this.CerrarVentana();
      }, error => {
        this.toastr.error('Ups! algo salio mal..', 'Ups! algo salio mal.', {
          timeOut: 6000,
        });
      });
    });
  }

}
