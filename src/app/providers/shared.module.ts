import { NgModule } from '@angular/core';
import { NumberOnlyDirective } from '../directives/number-only.directive';

@NgModule({
    declarations: [NumberOnlyDirective],
    exports: [NumberOnlyDirective]
})
export class SharedModule{}