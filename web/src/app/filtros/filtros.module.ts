import { NgModule } from '@angular/core';

import { OrdenarAsignacionesPipe } from './ordenarAsignaciones/ordenar-asignaciones.pipe';
import { DepartamentoPadrePipe } from './catDepartamentos/departamentoPadre/departamento-padre.pipe';
import { FiltroDescripcionPipe } from './descripcion/filtro-descripcion.pipe';
import { FiltroProvinciaPipe } from './catProvincias/filtro-provincia/filtro-provincia.pipe';
import { FiltrosNombresPipe } from './filtrosNombre/filtros-nombres.pipe';
import { NombreCompletoPipe } from './empleado/nombreCompleto/nombre-completo.pipe';
import { DepartamentoPipe } from './catDepartamentos/departamento/departamento.pipe';
import { FiltroCodigoPipe } from './filtro-codigo/filtro-codigo.pipe';
import { FiltroFechaPipe } from './filtroFecha/filtro-fecha.pipe';
import { EmplUsuarioPipe } from './empleado/filtroEmpUsuario/empl-usuario.pipe';
import { EmplCedulaPipe } from './empleado/filtroEmpCed/empl-cedula.pipe';
import { EmplEstadoPipe } from './empleado/filtroEmpEstado/empl-estado.pipe';
import { FitroNivelPipe } from './filtroNivel/fitro-nivel.pipe';
import { FecTimbrePipe } from './timbres/fec-timbre.pipe';
import { AvisoEmplPipe } from './avisos/aviso-empl.pipe';
import { SucNombrePipe } from './sucursales/suc-nombre.pipe';
import { EmplCargoPipe } from './empleado/filtroEmpCargo/empl-cargo.pipe';
import { FiltroIpPipe } from './filtroIp/filtro-ip.pipe';
import { PaginatePipe } from './pipes/paginate.pipe';
import { BPaisesPipe } from './catProvincias/filtroPaises/b-paises.pipe';
import { ModulosPipe } from './modulos/modulos.pipe';
import { RolesPipe } from './roles/roles.pipe';
import { PadrePipe } from './filtroProcesoPadre/padre.pipe';
import { TipoPipe } from './tipoServicio/tipo.pipe';
// PIPE PAGINACION
import { CustomMatPaginatorIntl } from './pipes/paginator-es';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { FiltroGeneroPipe } from './filtroGenero/filtro-genero.pipe';
import { FiltroEstadoCivilPipe } from './filtroEstadoCivil/filtro-estado-civil.pipe';

@NgModule({
  declarations: [
    OrdenarAsignacionesPipe,
    DepartamentoPadrePipe,
    FiltroDescripcionPipe,
    FiltroProvinciaPipe,
    NombreCompletoPipe,
    FiltrosNombresPipe,
    DepartamentoPipe,
    DepartamentoPipe,
    FiltroCodigoPipe,
    FiltroFechaPipe,
    EmplUsuarioPipe,
    EmplCedulaPipe,
    EmplEstadoPipe,
    FitroNivelPipe,
    SucNombrePipe,
    EmplCargoPipe,
    AvisoEmplPipe,
    FecTimbrePipe,
    PaginatePipe,
    FiltroIpPipe,
    ModulosPipe,
    BPaisesPipe,
    RolesPipe,
    PadrePipe,
    TipoPipe,
    FiltroGeneroPipe,
    FiltroEstadoCivilPipe
  ],
  exports: [
    OrdenarAsignacionesPipe,
    DepartamentoPadrePipe,
    DepartamentoPadrePipe,
    FiltroDescripcionPipe,
    FiltroProvinciaPipe,
    FiltrosNombresPipe,
    NombreCompletoPipe,
    DepartamentoPipe,
    FiltroCodigoPipe,
    DepartamentoPipe,
    FiltroFechaPipe,
    EmplUsuarioPipe,
    EmplCedulaPipe,
    EmplEstadoPipe,
    FitroNivelPipe,
    SucNombrePipe,
    EmplCargoPipe,
    AvisoEmplPipe,
    FecTimbrePipe,
    FiltroIpPipe,
    PaginatePipe,
    BPaisesPipe,
    ModulosPipe,
    RolesPipe,
    PadrePipe,
    TipoPipe,
    FiltroGeneroPipe,
    FiltroEstadoCivilPipe
  ],
  providers: [
    { provide: MatPaginatorIntl, useClass: CustomMatPaginatorIntl },
  ]
})

export class FiltrosModule { }
