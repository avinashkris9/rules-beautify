'use strict';
import * as vscode from 'vscode';
import { ProbeRulesFormatter } from './formatter';
export function activate(context: vscode.ExtensionContext) {
    let formatProvider = new ProbeRulesFormatter();
 
    
    vscode.languages.registerDocumentFormattingEditProvider('probe-rules', formatProvider);
}


