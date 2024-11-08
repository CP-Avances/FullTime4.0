import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { LuxonDateAdapter, MAT_LUXON_DATE_FORMATS } from '@angular/material-luxon-adapter';
import { NgModule } from '@angular/core';

// MATERIAL
import { ErrorStateMatcher, ShowOnDirtyErrorStateMatcher, MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatStepperModule } from '@angular/material/stepper';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatSliderModule } from '@angular/material/slider';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { MatInputModule } from "@angular/material/input";
import { MatRadioModule } from '@angular/material/radio';
import { MatBadgeModule } from '@angular/material/badge';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatMenuModule } from '@angular/material/menu';
import { MatTreeModule } from '@angular/material/tree';
import { LayoutModule } from '@angular/cdk/layout';

@NgModule({
  declarations: [ ],
  imports: [
    BrowserAnimationsModule,
    LayoutModule,
    MatToolbarModule,
    MatButtonModule,
    MatSidenavModule,
    MatIconModule,
    MatListModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCardModule,
    MatSliderModule,
    MatBadgeModule,
    MatSlideToggleModule,
    MatCheckboxModule,
    MatRadioModule,
    MatGridListModule,
    MatDialogModule,
    MatExpansionModule,
    MatStepperModule,
    DragDropModule,
    MatTooltipModule,
    MatAutocompleteModule,
    MatTableModule,
    MatPaginatorModule,
    MatTabsModule,
    MatDatepickerModule, 
    MatNativeDateModule,
    MatTabsModule,
    MatMenuModule,
    MatTreeModule,
    MatProgressSpinnerModule,
  ],
  exports: [
    BrowserAnimationsModule,
    LayoutModule,
    MatToolbarModule,
    MatButtonModule,
    MatSidenavModule,
    MatIconModule,
    MatListModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCardModule,
    MatSliderModule,
    MatBadgeModule,
    MatSlideToggleModule,
    MatCheckboxModule,
    MatRadioModule,
    MatGridListModule,
    MatDialogModule,
    MatExpansionModule,
    MatStepperModule,
    DragDropModule,
    MatTooltipModule,
    MatAutocompleteModule,
    MatTableModule,
    MatPaginatorModule,
    MatTabsModule,
    MatDatepickerModule, 
    MatNativeDateModule,
    MatTabsModule,
    MatMenuModule,
    MatTreeModule,
    MatProgressSpinnerModule,
  ],
  providers: [
    { provide: ErrorStateMatcher, useClass: ShowOnDirtyErrorStateMatcher },
    { provide: DateAdapter, useClass: LuxonDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: MAT_LUXON_DATE_FORMATS },
    { provide: MAT_DATE_LOCALE, useValue: 'es' }
  ],
})

export class MaterialModule { }
