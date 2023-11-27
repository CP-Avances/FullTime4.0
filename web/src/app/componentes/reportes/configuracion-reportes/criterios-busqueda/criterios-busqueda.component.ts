import { Component, Input, OnInit, OnDestroy, SimpleChanges } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatRadioChange } from '@angular/material/radio';
import { checkOptions, FormCriteriosBusqueda } from 'src/app/model/reportes.model';
import { ReportesService } from 'src/app/servicios/reportes/reportes.service';
import { ValidacionesService } from '../../../../servicios/validaciones/validaciones.service';

@Component({
  selector: 'app-criterios-busqueda',
  templateUrl: './criterios-busqueda.component.html',
  styleUrls: ['./criterios-busqueda.component.css']
})
export class CriteriosBusquedaComponent implements OnInit, OnDestroy {

  buscador !: FormGroup;

  codigo = new FormControl('');
  cedula = new FormControl('', [Validators.minLength(2)]);
  nombre_emp = new FormControl('', [Validators.minLength(2)]);
  nombre_dep = new FormControl('', [Validators.minLength(2)]);
  nombre_suc = new FormControl('', [Validators.minLength(2)]);
  nombre_reg = new FormControl('', [Validators.minLength(2)]);
  nombre_cargo = new FormControl('', [Validators.minLength(2)]);
  seleccion = new FormControl('');

  filtroNombreSuc: string = '';
  filtroNombreCargo: string = '';
  filtroNombreReg: string = '';
  filtroNombreDep: string = '';

  filtroCodigo: number;
  filtroCedula: string = '';
  filtroNombreEmp: string = '';

  filtroCodigo_tab: number;
  filtroCedula_tab: string = '';
  filtroNombreTab: string = '';

  filtroCodigo_inc: number;
  filtroCedula_inc: string = '';
  filtroNombreInc: string = '';

  public _booleanOptions: FormCriteriosBusqueda = {
    bool_cargo: false,
    bool_suc: false,
    bool_dep: false,
    bool_emp: false,
    bool_reg: false,
    bool_tab: false,
    bool_inc: false
  };

  public check: checkOptions[];

  @Input('num_option') num_option: number = 0;
  @Input('limpiar') limpiar: number = 0;

  constructor(
    private reporteService: ReportesService,
    private validacionService: ValidacionesService
  ) { }

  ngOnInit(): void {
    console.log('atributo', this.num_option);
    console.log('opcion: ' + this.limpiar);
    this.check = this.reporteService.checkOptionsN(this.num_option);
    console.log('CHECK ', this.check);

  }

  ngOnDestroy() {

    this.reporteService.GuardarCheckOpcion('');
    this.reporteService.DefaultFormCriterios();
    this.reporteService.DefaultValoresFiltros();
    console.log('Componenete destruido');

  }

  ngOnChanges(changes: SimpleChanges) {
    console.log('opcion: ' + this.limpiar);
    if (this.limpiar !=0) {
      this.limpiarCampos();
    }  }



  opcion: string;
  BuscarPorTipo(e: MatRadioChange) {
    console.log('CHECK ', e.value);
    this.opcion = e.value;
    switch (this.opcion) {
      case 's':
        this._booleanOptions.bool_suc = true;
        this._booleanOptions.bool_dep = false;
        this._booleanOptions.bool_emp = false;
        this._booleanOptions.bool_reg = false;
        this._booleanOptions.bool_tab = false;
        this._booleanOptions.bool_inc = false;
        this._booleanOptions.bool_cargo = false;
        break;
      case 'c':
        this._booleanOptions.bool_cargo = true;
        this._booleanOptions.bool_suc = false;
        this._booleanOptions.bool_dep = false;
        this._booleanOptions.bool_emp = false;
        this._booleanOptions.bool_reg = false;
        this._booleanOptions.bool_tab = false;
        this._booleanOptions.bool_inc = false;
        break;
      case 'd':
        this._booleanOptions.bool_suc = false;
        this._booleanOptions.bool_dep = true;
        this._booleanOptions.bool_emp = false;
        this._booleanOptions.bool_reg = false;
        this._booleanOptions.bool_tab = false;
        this._booleanOptions.bool_inc = false;
        this._booleanOptions.bool_cargo = false;
        break;
      case 'e':
        this._booleanOptions.bool_suc = false;
        this._booleanOptions.bool_dep = false;
        this._booleanOptions.bool_emp = true;
        this._booleanOptions.bool_reg = false;
        this._booleanOptions.bool_tab = false;
        this._booleanOptions.bool_inc = false;
        this._booleanOptions.bool_cargo = false;
        break;
      case 'r':
        this._booleanOptions.bool_suc = false;
        this._booleanOptions.bool_dep = false;
        this._booleanOptions.bool_emp = false;
        this._booleanOptions.bool_reg = true;
        this._booleanOptions.bool_tab = false;
        this._booleanOptions.bool_inc = false;
        this._booleanOptions.bool_cargo = false;
        break;
      case 't':
        this._booleanOptions.bool_suc = false;
        this._booleanOptions.bool_dep = false;
        this._booleanOptions.bool_emp = false;
        this._booleanOptions.bool_reg = false;
        this._booleanOptions.bool_tab = true;
        this._booleanOptions.bool_inc = false;
        this._booleanOptions.bool_cargo = false;
        break;
      case 'i':
        this._booleanOptions.bool_suc = false;
        this._booleanOptions.bool_dep = false;
        this._booleanOptions.bool_emp = false;
        this._booleanOptions.bool_reg = false;
        this._booleanOptions.bool_tab = false;
        this._booleanOptions.bool_inc = true;
        this._booleanOptions.bool_cargo = false;
        break;
      default:
        this._booleanOptions.bool_cargo = false;
        this._booleanOptions.bool_suc = false;
        this._booleanOptions.bool_dep = false;
        this._booleanOptions.bool_emp = false;
        this._booleanOptions.bool_reg = false;
        this._booleanOptions.bool_tab = false;
        this._booleanOptions.bool_inc = false;
        break;
    }
    this.reporteService.GuardarFormCriteriosBusqueda(this._booleanOptions);
    this.reporteService.GuardarCheckOpcion(this.opcion)

  }

  Filtrar(e, orden: number) {
    switch (orden) {
      case 1: this.reporteService.setFiltroNombreSuc(e); break;
      case 2: this.reporteService.setFiltroNombreReg(e); break;
      case 3: this.reporteService.setFiltroNombreCarg(e); break;
      case 4: this.reporteService.setFiltroNombreDep(e); break;
      case 5: this.reporteService.setFiltroCodigo(e); break;
      case 6: this.reporteService.setFiltroCedula(e); break;
      case 7: this.reporteService.setFiltroNombreEmp(e); break;
      case 8: this.reporteService.setFiltroCodigo_tab(e); break;
      case 9: this.reporteService.setFiltroCedula_tab(e); break;
      case 10: this.reporteService.setFiltroNombreTab(e); break;
      case 11: this.reporteService.setFiltroCodigo_inc(e); break;
      case 12: this.reporteService.setFiltroCedula_inc(e); break;
      case 13: this.reporteService.setFiltroNombreInc(e); break;
      default:
        break;
    }
  }

  IngresarSoloLetras(e) {
    return this.validacionService.IngresarSoloLetras(e);
  }

  IngresarSoloNumeros(evt) {
    return this.validacionService.IngresarSoloNumeros(evt);
  }

  limpiarCampos() {
    if (this._booleanOptions.bool_emp === true || this._booleanOptions.bool_tab === true || this._booleanOptions.bool_inc === true) {
      this.codigo.reset();
      this.cedula.reset();
      this.nombre_emp.reset();
      this._booleanOptions.bool_emp = false;
      this._booleanOptions.bool_tab = false;
      this._booleanOptions.bool_inc = false;
    }
    if (this._booleanOptions.bool_dep) {
      this.nombre_dep.reset();
      this._booleanOptions.bool_dep = false;
    }
    if (this._booleanOptions.bool_suc) {
      this.nombre_suc.reset();
      this._booleanOptions.bool_suc = false;
    }
    if (this._booleanOptions.bool_reg) {
      this.nombre_reg.reset();
      this._booleanOptions.bool_reg = false;
    }
    if (this._booleanOptions.bool_cargo) {
      this.nombre_cargo.reset();
      this._booleanOptions.bool_cargo = false;
    }
    this.seleccion.reset();
    this.seleccion.patchValue(null);
  }

}
