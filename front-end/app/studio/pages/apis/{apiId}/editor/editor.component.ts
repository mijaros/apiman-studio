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

import {Component, EventEmitter, Output, Input, ViewEncapsulation, ViewChild} from '@angular/core';
import {ApiDefinition} from "../../../../models/api.model";
import {Oas20Document, OasLibraryUtils, Oas20PathItem, Oas20Operation} from "oai-ts-core";
import {CommandsManager, ICommand} from "./commands.manager";
import {ModalDirective} from 'ng2-bootstrap';
import {NewPathCommand} from "./commands/new-path.command";


@Component({
    moduleId: module.id,
    selector: 'api-editor',
    templateUrl: 'editor.component.html',
    styleUrls: ['editor.component.css'],
    encapsulation: ViewEncapsulation.None
})
export class ApiEditorComponent {

    @Input() api: ApiDefinition;
    @Output() onDirty: EventEmitter<boolean> = new EventEmitter<boolean>();
    @Output() onSave: EventEmitter<any> = new EventEmitter<any>();

    @ViewChild("addPathModal") public addPathModal: ModalDirective;

    public modals: any = {
        addPath: {}
    };

    private _library: OasLibraryUtils = new OasLibraryUtils();
    private _document: Oas20Document = null;
    private _commands: CommandsManager = new CommandsManager();

    theme: string = "light";
    selectedItem: string = null;
    selectedType: string = "main";
    subselectedItem: string = null;

    /**
     * Constructor.
     */
    constructor() {}

    /**
     * Gets the OpenAPI spec as a document.
     */
    public document(): Oas20Document {
        if (this._document === null) {
            this._document = <Oas20Document>this._library.createDocument(this.api.spec);
        }
        return this._document;
    }

    /**
     * Returns an array of path names.
     * @return {any}
     */
    public pathNames(): string[] {
        if (this.document().paths) {
            return this.document().paths.pathItemNames().sort();
        } else {
            return [];
        }
    }

    /**
     * Returns an array of definition names.
     * @return {any}
     */
    public definitionNames(): string[] {
        if (this.document().definitions) {
            return this.document().definitions.definitionNames().sort();
        } else {
            return [];
        }
    }

    /**
     * Returns an array of response names.
     * @return {any}
     */
    public responseNames(): string[] {
        if (this.document().responses) {
            return this.document().responses.responseNames().sort();
        } else {
            return [];
        }
    }

    /**
     * Called when the user selects the main/default element from the master area.
     */
    public selectMain(): void {
        this.selectedItem = null;
        this.selectedType = "main";
    }

    /**
     * Called when the user selects a path from the master area.
     * @param name
     */
    public selectPath(name: string): void {
        this.selectedItem = name;
        this.selectedType = "path";
    }

    /**
     * Called when the user clicks an operation.
     * @param pathName
     * @param opName
     */
    public selectOperation(pathName: string, opName: string): void {
        console.info("Selected operation: %s :: %s", pathName, opName);
        // Possible de-select the operation if it's clicked on but already selected.
        if (this.selectedType === 'operation' && this.selectedItem === pathName && this.subselectedItem === opName) {
            this.selectPath(pathName);
        } else {
            this.selectedType = "operation";
            this.selectedItem = pathName;
            this.subselectedItem = opName;
        }
    }

    /**
     * Called when the user selects a definition from the master area.
     * @param name
     */
    public selectDefinition(name: string): void {
        this.selectedItem = name;
        this.selectedType = "definition";

        console.info("Selected item: %s", this.selectedItem);
        console.info("Selected type: %s", this.selectedType);
    }

    /**
     * Called when the user selects a response from the master area.
     * @param name
     */
    public selectResponse(name: string): void {
        this.selectedItem = name;
        this.selectedType = "response";
    }

    /**
     * Called whenever the user presses a key.
     * @param event
     */
    public onGlobalKeyDown(event: KeyboardEvent): void {
        // TODO skip any event that was sent to an input field (e.g. input, textarea, etc)
        if (event.ctrlKey && event.key === 'z' && !event.metaKey && !event.altKey) {
            console.info("[ApiEditorComponent] User wants to 'undo' the last command.");
            this._commands.undoLastCommand(this.document());
        }
        if (event.ctrlKey && event.key === 'y' && !event.metaKey && !event.altKey) {
            console.info("[ApiEditorComponent] User wants to 'undo' the last command.");
            this._commands.redoLastCommand(this.document());
        }
    }

    /**
     * Called when an editor component creates a command that should be executed.
     * @param command
     */
    public onCommand(command: ICommand): void {
        console.info("[ApiEditorComponent] Executing a command.");
        this._commands.executeCommand(command, this.document());
    }

    /**
     * Called to initialize the model used by the Add Path modal (based on the path selected).
     */
    public initAddPath(): string {
        if (this.selectedType === "path") {
            this.modals.addPath.path = this.selectedItem;
        } else {
            this.modals.addPath.path = "";
        }
        return this.modals.addPath.path;
    }

    /**
     * Called when the user fills out the Add Path modal dialog and clicks Add.
     */
    public addPath(): void {
        let command: ICommand = new NewPathCommand(this.modals.addPath.path);
        this.onCommand(command);
        this.addPathModal.hide();
        this.selectPath(this.modals.addPath.path);
    }

    /**
     * Returns the currently selected path item.
     * @return {any}
     */
    public selectedPath(): Oas20PathItem {
        if (this.selectedType === "path") {
            return this.document().paths.pathItem(this.selectedItem);
        } else {
            return null;
        }
    }

    /**
     * Returns the currently selected operation.
     */
    public selectedOperation(): Oas20Operation {
        if (this.selectedType === "operation") {
            return this.document().paths.pathItem(this.selectedItem)[this.subselectedItem];
        } else {
            return null;
        }
    }

    /**
     * Called to test whether the given resource path has an operation of the given type defined.
     * @param path
     * @param operation
     */
    public hasOperation(path: string, operation: string): boolean {
        let pathItem: Oas20PathItem = this.document().paths.pathItem(path);
        if (pathItem) {
            let op: Oas20Operation = pathItem[operation];
            if (op !== null && op !== undefined) {
                return true;
            }
        }
        return false;
    }

}
