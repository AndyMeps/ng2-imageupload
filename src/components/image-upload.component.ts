import { Component, Input, Output, EventEmitter, OnInit, Self } from '@angular/core';
import { NgModel, ControlValueAccessor } from '@angular/forms';

import { ImageUpload, ImageUploadConfiguration, IImageUploadConfiguration } from '../models';

/**
 * Image upload component to be referenced in component markup
 *
 * @export
 * @class ImageUploadComponent
 * @implements {OnInit}
 */
@Component({
    selector: `image-upload[ngModel]`,
    template: `
        <div class="row images-detail">
            <div class="col-xs-12">

            <h4 *ngIf="cd.viewModel.length > 0">{{config.uploadedHeader}}</h4>

            <div class="upload-container">
                <div class="upload-item" *ngFor="let image of cd.viewModel; let i = index;" (click)="removeImage(i)">
                    <img [src]="image.data" style="max-height: 100px; max-width: 100px;" />
                    <p class="upload-title">{{image.fileName}}</p>
                    <p class="upload-file-size">{{image.size | fileSize:1}}</p>
                </div>
            </div>

            <h4>{{config.addSectionHeader}}</h4>
            <input type="file" #fileUpload style="display: none;" [accept]="config.accepts" (change)="upload(fileUpload.files, fileUpload)" />
            <button class="btn btn-bordered" (click)="fileUpload.click();"><i class="fa fa-plus"></i> {{config.buttonLabel}}</button>
            <p *ngIf="config.accepts.indexOf('image/*') === -1"><small>Accepted image formats: {{config.accepts}}</small></p>
            </div>
        </div>
    `,
    styles: [
        `.upload-container {
            display: flex; }`,

        `.upload-item {
            display: inline-block;
            max-width: 120px;
            text-align: center; }`,

        `.upload-item + .upload-item {
            margin-left: 2rem; }`,

        `.upload-title {
            margin-top: 1rem;
            word-wrap: break-word; }`,

        `.upload-file-size {
            font-weight: bold; }`
    ],
    providers: [ NgModel ]
})
export class ImageUploadComponent implements ControlValueAccessor, OnInit {

    /**
     * Configuration object to customize ImageUploadComponent, mapped to ImageUploadComponent.config
     *
     * @type {IImageUploadConfiguration}
     */
    @Input('upload-config') opts: IImageUploadConfiguration;

    /**
     * OnChange event emitter, returns the removed single image.
     *
     * @type {EventEmitter<any>}
     */
    @Output() onRemove: EventEmitter<any> = new EventEmitter();

    /**
     * OnAdd event emitter, returns the added single image.
     *
     * @type {EventEmitter<any>}
     */
    @Output() onAdd: EventEmitter<any> = new EventEmitter();

    // -----------------------------------------------------------------

    public cd: NgModel;

    public onChange: any = Function.prototype;
    public onTouched: any = Function.prototype;

    /**
     * Configuration object to customize ImageUploadComponent
     *
     * @type {ImageUploadConfiguration}
     */
    public config: ImageUploadConfiguration;

    // -----------------------------------------------------------------

    /**
     * Receives the File object and interprets
     *
     * @private
     * @type {FileReader}
     */
    private fileReader: FileReader;

    /**
     * Currently selected file object.
     *
     * @private
     * @type {File}
     */
    private currentFile: File;

    private files: ImageUpload[];

    // -----------------------------------------------------------------

    /**
     * Creates an instance of ImageUploadComponent.
     *
     */
    constructor(@Self() cd: NgModel) {
        this.cd = cd;
        cd.valueAccessor = this;

        this.files = [];
        this.config = new ImageUploadConfiguration();

        this.fileReader = new FileReader();

        this.fileReader.addEventListener('load', this._fileReaderLoad);
    }

    /**
     * Angular2 lifecycle event, triggered after constructor()
     */
    ngOnInit() {
        this._processOptions();
    }

    // -----------------------------------------------------------------

    public writeValue(value: any): void {

    }

    /**
     * Upload file array
     *
     * @param {File[]} files
     */
    public upload(files: File[], elem: HTMLInputElement) {
        let filesLength = files.length;

        if (filesLength > 0) {
            for (let i = 0; i < filesLength; i++) {
                this.currentFile = files[i];
                this.fileReader.readAsDataURL(this.currentFile);
            }
        }

        elem.value = '';
    }

    /**
     * Remove an image at index from ImageUploadComponent.images.
     *
     * @param {number} index
     */
    public removeImage(index: number) {
        let image = this.files.splice(index, 1);
        this.cd.viewToModelUpdate(this.files);
        this._onRemove(image[0]);
    }

    // -----------------------------------------------------------------

    /**
     * Process configuration object to set personalisation.
     *
     * @private
     */
    private _processOptions() {
        if (this.opts != null) {
            // addSectionHeader
            if (this.opts.addSectionHeader != null) {
                this.config.addSectionHeader = this.opts.addSectionHeader;
            }

            // uploadedHeader
            if (this.opts.uploadedHeader != null) {
                this.config.uploadedHeader = this.opts.uploadedHeader;
            }

            // buttonLabel
            if (this.opts.buttonLabel != null) {
                this.config.buttonLabel = this.opts.buttonLabel;
            }

            // accepts
            if (this.opts.accepts != null) {
                this.config.accepts = this.opts.accepts;
            }
        }
    }

    /**
     * Emit an onremove event
     *
     * @private
     * @param {ImageUpload} image
     */
    private _onRemove(image: ImageUpload) {
        this.onRemove.emit(image);
    }

    /**
     * Emit an onadd event
     *
     * @private
     * @param {ImageUpload} image
     */
    private _onAdd(image: ImageUpload) {
        this.onAdd.emit(image);
    }

    /**
     * Called after file read
     *
     * @private
     */
    private _fileReaderLoad = () => {
        let data = this.fileReader.result;

        let img = new ImageUpload(data, this.currentFile.name, this.currentFile.size);

        this._onAdd(img);

        this.files.push(img);
        this.cd.viewToModelUpdate(this.files);
    }

    public registerOnChange(fn: (_: any) => {}): void {
        this.onChange = fn;
    }

    public registerOnTouched(fn: () => {}): void {
        this.onTouched = fn;
    }

}
