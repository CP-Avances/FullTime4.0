import { NgModule } from '@angular/core';

import { DepartamentoPipe } from './catDepartamentos/departamento/departamento.pipe'
import { DepartamentoPadrePipe } from './catDepartamentos/departamentoPadre/departamento-padre.pipe'
import { FiltroDepartamentoPipe } from './catDepartamentos/nombreDepartamento/filtro-departamento.pipe'
import { FiltrarRucPipe } from './catEmpresa/filtrarRuc/filtrar-ruc.pipe'
import { FecTimbrePipe } from './timbres/fec-timbre.pipe';
import { AvisoEmplPipe } from './lista-realtime/avisos/aviso-empl.pipe';
import { AvisoDescPipe } from './lista-realtime/avisos/aviso-desc.pipe';
import { AvisoFechPipe } from './lista-realtime/avisos/aviso-fech.pipe';
import { AvisoEstadoPipe } from './lista-realtime/avisos/aviso-estado.pipe';
import { ProvinciaPipe } from './catProvincias/filtroProvincia/provincia.pipe';
import { BPaisesPipe } from './catProvincias/filtroPaises/b-paises.pipe';
import { FiltroRegionPipe } from './catRegimen/filtro-region.pipe';
import { FiltroNombrePipe } from './catFeriados/filtroNombre/filtro-nombre.pipe';
import { FiltroFechaPipe } from './catFeriados/filtroFecha/filtro-fecha.pipe';
import { RolesPipe } from './catRolesPermiso/roles.pipe';
import { PadrePipe } from './catProcesos/filtroProcesoPadre/padre.pipe';
import { NivelPipe } from './catProcesos/filtroNivel/nivel.pipe';
import { NombrePipe } from './catProcesos/filtroNombre/nombre.pipe';
import { IduserPipe } from './catEnrolados/filtroUsuario/iduser.pipe';
import { ActivoPipe } from './catEnrolados/filtroActivo/activo.pipe';
import { FingerPipe } from './catEnrolados/filtroFinger/finger.pipe';
import { EnrNombrePipe } from './catEnrolados/filtroEnrNombre/enr-nombre.pipe';
import { FiltrosNombresPipe } from './filtrosNombre/filtros-nombres.pipe';
import { FiltroModeloPipe } from './catRelojes/filtroModelo/filtro-modelo.pipe';
import { FiltroIpPipe } from './catRelojes/filtroIp/filtro-ip.pipe';
import { EmplCodigoPipe } from './empleado/filtroEmpCod/empl-codigo.pipe';
import { EmplCedulaPipe } from './empleado/filtroEmpCed/empl-cedula.pipe';
import { EmplNombrePipe } from './empleado/filtroEmpNom/empl-nombre.pipe';
import { EmplApellidoPipe } from './empleado/filtroEmpApe/empl-apellido.pipe';
import { EmplDepaPipe } from './empleado/nombreDepartamento/empl-depa.pipe';
import { EmplEstadoPipe } from './empleado/filtroEmpEstado/empl-estado.pipe';
import { EmplUsuarioPipe } from './empleado/filtroEmpUsuario/empl-usuario.pipe';
import { FitroNivelPipe } from './catTitulos/filtroNivel/fitro-nivel.pipe';
import { SucEmpresaPipe } from './sucursales/filtroSucEmpresa/suc-empresa.pipe';
import { FiltroEmpresaRPipe } from './catRelojes/filtroEmpresa/filtro-empresa-r.pipe';
import { FiltroSucursalRPipe } from './catRelojes/filtroSucursal/filtro-sucursal-r.pipe';
import { FiltroDepartamentoRPipe } from './catRelojes/filtroDepartamento/filtro-departamento-r.pipe';
import { SucNombrePipe } from './sucursales/filtroSucNom/suc-nombre.pipe';
import { SucCiudadPipe } from './sucursales/filtroSucCiu/suc-ciudad.pipe';
import { FiltrarNombreDocuPipe } from './documentos/filtrar-nombre-docu.pipe';
import { RegimenPipe } from './catRegimen/regimen/regimen.pipe';
import { EmplCargoPipe } from './empleado/filtroEmpCargo/empl-cargo.pipe';
import { PaginatePipe } from './pipes/paginate.pipe';
import { TimbreEmpleadoPipe } from './empleado/timbre-empleado.pipe';
import { NombreApellidoPipe } from './comidas/nombreApellido/nombre-apellido.pipe';
import { TipoPipe } from './comidas/tipoServicio/tipo.pipe';
// Pipe Paginacion
import { CustomMatPaginatorIntl } from './pipes/paginator-es';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { FiltroProvinciaPipe } from './catProvincias/filtro-provincia/filtro-provincia.pipe';
import { FiltroCodigoPipe } from './catHorarios/filtro-codigo/filtro-codigo.pipe';
import { FiltroDescripcionPipe } from './catHorarios/filtro-descripcion/filtro-descripcion.pipe';
import { ModalidadLaboralPipe } from './catModalidadLaboral/modalidad-laboral.pipe';

@NgModule({
  declarations: [
    DepartamentoPipe,
    DepartamentoPadrePipe,
    FiltroDepartamentoPipe,
    FiltrarRucPipe,
    FiltroDepartamentoPipe,
    DepartamentoPadrePipe,
    ProvinciaPipe,
    BPaisesPipe,
    FiltroRegionPipe,
    FiltroNombrePipe,
    FiltroFechaPipe,
    FiltrosNombresPipe,
    FiltroModeloPipe,
    FiltroIpPipe,
    RolesPipe,
    PadrePipe,
    NivelPipe,
    NombrePipe,
    IduserPipe,
    ActivoPipe,
    FingerPipe,
    EnrNombrePipe,
    EmplCodigoPipe,
    EmplCedulaPipe,
    EmplNombrePipe,
    EmplApellidoPipe,
    EmplDepaPipe,
    EmplEstadoPipe,
    EmplUsuarioPipe,
    FitroNivelPipe,
    SucNombrePipe,
    SucCiudadPipe,
    SucEmpresaPipe,
    PaginatePipe,
    FiltroEmpresaRPipe,
    FiltroSucursalRPipe,
    FiltroDepartamentoRPipe,
    FiltrarRucPipe,
    FiltrarNombreDocuPipe,
    DepartamentoPipe,
    RegimenPipe,
    EmplCargoPipe,
    AvisoEmplPipe,
    AvisoDescPipe,
    AvisoFechPipe,
    AvisoEstadoPipe,
    FecTimbrePipe,
    TimbreEmpleadoPipe,
    TipoPipe,
    NombreApellidoPipe,
    FiltroProvinciaPipe,
    FiltroCodigoPipe,
    FiltroDescripcionPipe,
    ModalidadLaboralPipe,
  ],
  exports: [
    DepartamentoPipe,
    DepartamentoPadrePipe,
    FiltroDepartamentoPipe,
    FiltrarRucPipe,
    FiltroDepartamentoPipe,
    DepartamentoPadrePipe,
    ProvinciaPipe,
    BPaisesPipe,
    FiltroCodigoPipe,
    FiltroDescripcionPipe,
    FiltroRegionPipe,
    FiltroNombrePipe,
    FiltroFechaPipe,
    FiltrosNombresPipe,
    FiltroModeloPipe,
    FiltroIpPipe,
    RolesPipe,
    PadrePipe,
    NivelPipe,
    NombrePipe,
    IduserPipe,
    ActivoPipe,
    FingerPipe,
    EnrNombrePipe,
    EmplCodigoPipe,
    EmplCedulaPipe,
    EmplNombrePipe,
    EmplApellidoPipe,
    EmplDepaPipe,
    EmplEstadoPipe,
    EmplUsuarioPipe,
    FitroNivelPipe,
    SucNombrePipe,
    SucCiudadPipe,
    SucEmpresaPipe,
    PaginatePipe,
    FiltroEmpresaRPipe,
    FiltroSucursalRPipe,
    FiltroDepartamentoRPipe,
    FiltrarRucPipe,
    FiltrarNombreDocuPipe,
    DepartamentoPipe,
    RegimenPipe,
    EmplCargoPipe,
    AvisoEmplPipe,
    AvisoDescPipe,
    AvisoFechPipe,
    AvisoEstadoPipe,
    FecTimbrePipe,
    TimbreEmpleadoPipe,
    TipoPipe,
    NombreApellidoPipe,
    FiltroProvinciaPipe,
    ModalidadLaboralPipe,
  ],
  providers: [
    { provide: MatPaginatorIntl, useClass: CustomMatPaginatorIntl },
  ]
})
export class FiltrosModule { }
