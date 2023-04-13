import { Component, Input, OnInit, OnDestroy } from '@angular/core';
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
  seleccion = new FormControl('');

  filtroNombreSuc: string = '';

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
    bool_suc: false,
    bool_dep: false,
    bool_emp: false,
    bool_tab: false,
    bool_inc: false
  };

  public check: checkOptions[];

  @Input('num_option') num_option: number = 0;

  constructor(
    private reporteService: ReportesService,
    private validacionService: ValidacionesService
  ) { }

  ngOnInit(): void {
    console.log('atributo', this.num_option);

    this.check = this.reporteService.checkOptions(this.num_option);
    console.log('CHECK ', this.check);

  }

  ngOnDestroy() {

    this.reporteService.GuardarCheckOpcion(0);
    this.reporteService.DefaultFormCriterios();
    this.reporteService.DefaultValoresFiltros();
    console.log('Componenete destruido');

  }

  opcion: number;
  BuscarPorTipo(e: MatRadioChange) {
    console.log('CHECK ', e.value);
    this.opcion = e.value;
    switch (this.opcion) {
      case 1:
        this._booleanOptions.bool_suc = true;
        this._booleanOptions.bool_dep = false;
        this._booleanOptions.bool_emp = false;
        this._booleanOptions.bool_tab = false;
        this._booleanOptions.bool_inc = false;
        break;
      case 2:
        this._booleanOptions.bool_suc = false;
        this._booleanOptions.bool_dep = true;
        this._booleanOptions.bool_emp = false;
        this._booleanOptions.bool_tab = false;
        this._booleanOptions.bool_inc = false;
        break;
      case 3:
        this._booleanOptions.bool_suc = false;
        this._booleanOptions.bool_dep = false;
        this._booleanOptions.bool_emp = true;
        this._booleanOptions.bool_tab = false;
        this._booleanOptions.bool_inc = false;
        break;
      case 4:
        this._booleanOptions.bool_suc = false;
        this._booleanOptions.bool_dep = false;
        this._booleanOptions.bool_emp = false;
        this._booleanOptions.bool_tab = true;
        this._booleanOptions.bool_inc = false;
        break;
      case 5:
        this._booleanOptions.bool_suc = false;
        this._booleanOptions.bool_dep = false;
        this._booleanOptions.bool_emp = false;
        this._booleanOptions.bool_tab = false;
        this._booleanOptions.bool_inc = true;
        break;
      default:
        this._booleanOptions.bool_suc = false;
        this._booleanOptions.bool_dep = false;
        this._booleanOptions.bool_emp = false;
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
      case 2: this.reporteService.setFiltroNombreDep(e); break;
      case 3: this.reporteService.setFiltroCodigo(e); break;
      case 4: this.reporteService.setFiltroCedula(e); break;
      case 5: this.reporteService.setFiltroNombreEmp(e); break;
      case 6: this.reporteService.setFiltroCodigo_tab(e); break;
      case 7: this.reporteService.setFiltroCedula_tab(e); break;
      case 8: this.reporteService.setFiltroNombreTab(e); break;
      case 9: this.reporteService.setFiltroCodigo_inc(e); break;
      case 10: this.reporteService.setFiltroCedula_inc(e); break;
      case 11: this.reporteService.setFiltroNombreInc(e); break;
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
    this.seleccion.reset();
  }

}
