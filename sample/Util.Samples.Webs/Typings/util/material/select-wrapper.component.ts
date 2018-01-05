﻿//============== 下拉列表包装器===================
//Copyright 2018 何镇汐
//Licensed under the MIT license
//================================================
import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { FormControlWrapperBase } from './base/form-control-wrapper-base';
import { Select, SelectItem, SelectOption, SelectOptionGroup } from '../core/select';
import { WebApi as webapi } from '../common/webapi';
import { MessageConfig } from '../config/message-config';

/**
 * Mat下拉列表包装器
 */
@Component({
    selector: 'mat-select-wrapper',
    template:`
        <mat-form-field [floatPlaceholder]="floatPlaceholder">
            <mat-select #select="matSelect" #selectModel="ngModel" [name]="name" [placeholder]="placeholder" [multiple]="multiple" 
                [ngModel]="model" (ngModelChange)="onModelChange($event)" [required]="required">
                <mat-select-trigger *ngIf="template">{{getTemplate(select.triggerValue)}}</mat-select-trigger>
                <mat-option *ngIf="enableResetOption && !multiple">{{resetOptionText }}</mat-option>
                <ng-container *ngIf="!isGroup">
                    <mat-option *ngFor="let item of options" [value]="item.value" [disabled]="item.disabled">
                        {{ item.text }}
                    </mat-option>
                </ng-container>
                <ng-container *ngIf="isGroup">
                    <mat-optgroup *ngFor="let group of optionGroups" [label]="group.text" [disabled]="group.disabled">
                        <mat-option *ngFor="let item of group.value" [value]="item.value" [disabled]="item.disabled">
                            {{ item.text }}
                        </mat-option>
                    </mat-optgroup>
                </ng-container>
            </mat-select>
            <mat-hint *ngIf="startHint" align="start">{{startHint}}</mat-hint>
            <mat-hint *ngIf="endHint" align="end">{{endHint}}</mat-hint>
            <span matPrefix *ngIf="prefixText">{{prefixText}}&nbsp;</span>
            <mat-icon matSuffix [style.cursor]="'pointer'" (click)="$event.stopPropagation();suffixIconClick()" *ngIf="suffixMaterialIcon">{{suffixMaterialIcon}}</mat-icon>
            <i matSuffix class="fa fa-lg {{suffixFontAwesomeIcon}}" [style.cursor]="'pointer'" (click)="$event.stopPropagation();suffixIconClick()" *ngIf="suffixFontAwesomeIcon"></i>
            <span matSuffix *ngIf="suffixText">{{suffixText}}</span>
            <mat-error *ngIf="selectModel?.hasError( 'required' )">{{requiredMessage}}</mat-error>
        </mat-form-field>
    `
})
export class SelectWrapperComponent extends FormControlWrapperBase implements OnInit {
    /**
     * 按组显示
     */
    private isGroup: boolean;
    /**
     * 列表项集合
     */
    private options: SelectOption[];
    /**
     * 列表组集合
     */
    private optionGroups: SelectOptionGroup[];
    /**
     * 数据源
     */
    @Input() dataSource: SelectItem[];
    /**
     * 请求地址
     */
    @Input() url: string;
    /**
     * 多选
     */
    @Input() multiple: boolean;
    /**
     * 启用重置项
     */
    @Input() enableResetOption: boolean;
    /**
     * 重置项文本
     */
    @Input() resetOptionText: string;
    /**
     * 变更事件
     */
    @Output() onChange = new EventEmitter<any>();
    /**
     * 显示模板，值用|表示，范例：当前选中：| ,显示为 当前选中：1,2,3
     */
    @Input() template: string;

    /**
     * 初始化Mat下拉列表包装器
     */
    constructor() {
        super();
        this.enableResetOption = true;
        this.resetOptionText = MessageConfig.resetOptionText;
    }

    /**
     * 组件初始化
     */
    ngOnInit() {
        this.loadData();
        if (this.dataSource)
            return;
        this.loadUrl();
    }

    /**
     * 加载数据
     * @param data 列表项集合
     */
    loadData(data?: SelectItem[]) {
        data = data || this.dataSource;
        if (!data)
            return;
        let select = new Select(data);
        if (select.isGroup()) {
            this.isGroup = true;
            this.optionGroups = select.toGroups();
            return;
        }
        this.options = select.toOptions();
    }

    /**
     * 从服务器加载
     * @param url 请求地址
     */
    loadUrl(url?: string) {
        url = url || this.url;
        if (!url) {
            console.log("请设置下拉列表Url");
            return;
        }
        webapi.get<SelectItem[]>(url).handle({
            handler: result => {
                this.loadData(result);
            }
        });
    }

    /**
     * 模型变更事件处理
     */
    protected onModelChange(value) {
        super.onModelChange(value);
        this.onChange.emit(value);
    }

    /**
     * 获取模板
     */
    private getTemplate(value) {
        return this.template.replace(/\|/g, value);
    }
}