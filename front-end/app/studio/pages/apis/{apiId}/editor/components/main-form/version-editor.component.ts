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

import {
    Component, Input, ViewEncapsulation, ElementRef,
    ViewChildren, QueryList, AfterViewInit
} from '@angular/core';
import {AbstractInlineEditor} from "../../../../../../components/inline-editor.base";


@Component({
    moduleId: module.id,
    selector: 'version-editor',
    templateUrl: 'version-editor.component.html',
    encapsulation: ViewEncapsulation.None
})
export class VersionEditorComponent extends AbstractInlineEditor<string> implements AfterViewInit {

    @Input() version: string;

    @ViewChildren("newvalue") input: QueryList<ElementRef>;

    ngAfterViewInit(): void {
        this.input.changes.subscribe(changes => {
            if (changes.last) {
                changes.last.nativeElement.focus();
                changes.last.nativeElement.select();
                let targetRect: any = changes.last.nativeElement.getBoundingClientRect();
                setTimeout(() => {
                    this.editingDims = {
                        left: targetRect.left,
                        top: targetRect.top,
                        width: targetRect.right - targetRect.left,
                        height: targetRect.bottom - targetRect.top
                    };
                });
            }
        });
    }

    protected initialValueForEditing(): string {
        return this.version;
    }

}
