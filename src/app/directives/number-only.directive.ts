import { Directive, ElementRef, HostListener, Input, NgZone } from '@angular/core';

@Directive({
    selector: '[appNumberOnly]'
})
export class NumberOnlyDirective {
    constructor(
        private el: ElementRef,
        private zone: NgZone
    ) { }

    @HostListener('input', ['$event']) onInputChange(event) {
        const initalValue = this.el.nativeElement.value;
        this.el.nativeElement.value = initalValue.replace(/[^0-9]*/g, '');
        if (initalValue !== this.el.nativeElement.value) {
            event.stopPropagation();
        }
    }
}
