'use strict';

import { workspace } from "vscode";



export interface ProbeRuleConfigs
{
    readonly  isIndentWithSpace?:boolean;
    readonly  indentSize?:number;
    readonly splitOnBraces?:boolean;
    readonly isBackupRequired?:boolean;

  
}

export function getConfig(): ProbeRuleConfigs {
    const config = workspace.getConfiguration(
        'probeRules');

    const configData: ProbeRuleConfigs = {
    indentSize:config.get('numberOfWhiteSpaces')  || 4,
    isIndentWithSpace:config.get('indentWithWhiteSpace'),
    splitOnBraces: config.get('splitBracesToNewLine'),
    isBackupRequired: config.get('backupBeforeFormatting')
    };
   
    return configData;
  }


