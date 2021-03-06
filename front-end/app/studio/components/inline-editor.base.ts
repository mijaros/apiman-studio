/**
 * @license
 * Copyright 2017 JBoss Inc
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {EventEmitter, Output} from '@angular/core';
import {TimerObservable} from "rxjs/observable/TimerObservable";
import {Subscription} from "rxjs";


export abstract class AbstractInlineEditor<T> {

    @Output() onChange: EventEmitter<T> = new EventEmitter<T>();

    private _mousein: boolean = false;
    private _hoverSub: Subscription;
    private _hoverElem: any;

    public hovering: boolean = false;
    public editing: boolean = false;
    public hoverDims: any = {
        left: 0,
        top: 0,
        width: 0,
        height: 0
    };
    public editingDims: any = {
        left: 0,
        top: 0,
        width: 0,
        height: 0
    };

    public inputHover: boolean = false;
    public inputFocus: boolean = false;

    public value: T;

    public onMouseIn(event: MouseEvent): void {
        if (this.editing) {
            return;
        }
        this._mousein = true;
        this._hoverElem = event.currentTarget;
        this._hoverSub = TimerObservable.create(100).subscribe(() => {
            if (this._mousein) {
                let target: any = this._hoverElem;
                let targetRect: any = target.getBoundingClientRect();
                this.hoverDims = {
                    left: targetRect.left - 5,
                    top: targetRect.top,
                    width: targetRect.right - targetRect.left + 10 + 20,
                    height: targetRect.bottom - targetRect.top + 3
                };
                this.hovering = true;
            }
        });
    }

    public onMouseOut(): void {
        if (this.editing) {
            return;
        }
        if (this._mousein && !this.hovering) {
            this.hovering = false;
        }
        if (this._hoverSub) {
            this._hoverSub.unsubscribe();
            this._hoverSub = null;
        }
        this._mousein = false;
    }

    public onOverlayOut(): void {
        if (this.hovering) {
            this.hovering = false;
            this._mousein = false;
        }
    }

    public onStartEditing(): void {
        this.value = this.initialValueForEditing();
        this.hovering = false;
        this._mousein = false;
        this.editingDims = this.hoverDims;
        this.editingDims.height += 2;
        this.inputFocus = true;
        this.inputHover = true;
        this.editing = true;
    }

    protected abstract initialValueForEditing(): T;

    public onSave(): void {
        this.onChange.emit(this.value);
        this.editing = false;
    }

    public onCancel(): void {
        this.editing = false;
        this.value = this.initialValueForEditing();
    }

    public onInputKeypress(event: KeyboardEvent): void {
        if (event.key === 'Escape') {
            this.onCancel();
        }
    }

    public onInputFocus(isFocus: boolean): void {
        if (this.inputFocus !== isFocus) {
            this.inputFocus = isFocus;
        }
    }

    public onInputIn(isIn: boolean): void {
        if (this.inputHover !== isIn) {
            this.inputHover = isIn;
        }
    }

}
