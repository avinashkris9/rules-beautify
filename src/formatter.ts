'use strict';

import { DocumentFormattingEditProvider, TextDocument, TextEdit, Uri, window, workspace } from 'vscode';
import * as templates from './format-template-provider';

import { getConfig} from './formatter-options';
const defaultOps = getConfig();

export class ProbeRulesFormatter implements DocumentFormattingEditProvider {

    protected indentLevel: number = 0;
    protected isALineInASwitchCase: number = 0;
    protected switchLevel: number = 0;
    protected isASwitchCaseLine: number = 0;
    protected blockArr:number[] =[];
    
    provideDocumentFormattingEdits(document: TextDocument): TextEdit[] {

        this.createBackupBeforeFormatting(document);

        let formattedText: TextEdit[] = [];
  
        formattedText = this.formatDocument(document);
        return formattedText;
    }

    /**
     * 
     * @param currentFile - The URI of current document which is being formatted
     */
    createBackupBeforeFormatting(currentFile: TextDocument) {
        if (defaultOps.isBackupRequired) {
            let fileDetails = currentFile.uri.fsPath;
            fileDetails = fileDetails + "-rules-beautify-backup.rules";

            let newURI = Uri.file(fileDetails);


            workspace.fs.copy(currentFile.uri, newURI, { overwrite: true });
            window.showInformationMessage(`Backup file ${newURI.fsPath} created`);
        }
    }
    /**
     * 
     * @param document document to be formatted
     * @returns vscode TextEdits
     */
    public formatDocument(document: TextDocument): TextEdit[] {

        const fileName = document.fileName;
        let textEdits: TextEdit[] = [];
        let lines = document.lineCount;
        this.indentLevel = 0;
        let blocks: boolean[] = [];

        /// add a standard header if first line of file is not a comment.
        if (!document.lineAt(0).text.startsWith("#")) {
            textEdits.push(TextEdit.insert(document.lineAt(0).range.start, templates.insertHeader(fileName)));
        }

        for (let i = 0; i < lines; i++) {

            let line = document.lineAt(i);
            let lineText = line.text;
            lineText = lineText.trim();
            lineText = templates.convertTabToSpace(lineText);// @TODO 
            
            if(/^(table|default)/.test(lineText)) {
                continue;
            }
            let formattedText = this.formatCodeText(lineText);
             formattedText = this.formatCodeLine(formattedText);

            if (line.text !== formattedText) {
                textEdits.push(TextEdit.replace(line.range, this.removeTrailingWhitespace(formattedText)));
            }
        }
        if (this.indentLevel != 0) {

            window.showWarningMessage(`Formatting might be incorrect as there is no matching closing braces found for ${this.indentLevel} opening braces`);
        }
        return textEdits;
    }

    /**
     * formatCodeText function add simple formats to the line.
     * @param lineText 
     * @returns formatted lineText
     */

    public formatCodeText(lineText: string): string {


        if (!lineText.startsWith("#")) {

            lineText = templates.addVariableAssignmentSpacing(lineText);

            // add a space after function and parameter.
            if (lineText.trimLeft().match(templates.CONTROL_FUNCTION_REGEX)) {
                lineText = lineText.replace(templates.CONTROL_FUNCTION_REGEX, "$1 $2$3");

                // add a space between comparison function parameters
                if (lineText.trimLeft().match(templates.TUPLE_FUNCTIONS_REGEX)) {
                    lineText = lineText.replace(templates.TUPLE_FUNCTIONS_REGEX, "$1$2 $3");
                }
            }

        }
        else {
            //format comment 
            lineText = templates.formatComment(lineText);
        }

        return lineText;

    }

    public testForBlocks(lineText:string)
    {
        if(/(if|else|switch|foreach|if\s*else)/.test(lineText))
        {
            console.log(`sucess `)
           return true;
        }
        return false;
    }

    public formatCodeLine(lineText: string) {

        let formattedText = lineText;
        let bracesVerificationText = lineText.replace(/["]+[^"]*["]+/, "");
        let openBracesPosition = bracesVerificationText.indexOf("{");
        let closingBracesPosition = bracesVerificationText.indexOf("}");
        let commentIndex = lineText.indexOf("#");



        if (/switch\s*\(.*\)/.test(lineText)) {
           this.blockArr.push(this.indentLevel);
        }
        
        if (/(case.*?:)|(default.*?:)/.test(lineText)) 
        {
           this.isASwitchCaseLine=Math.max(this.blockArr.length,1)
           this.isALineInASwitchCase=0;
       //    console.log(` Found a case ${lineText} ifLevel = ${this.isASwitchCaseLine} cle = ${this.isALineInASwitchCase}ind = ${this.indentLevel}`)
        }
        else if(this.isASwitchCaseLine>0)
        {
            this.isALineInASwitchCase=1;
        }
     
        this.depthCalculator(openBracesPosition, closingBracesPosition, lineText.length);

        if(closingBracesPosition !=-1 )
        {
          
            if(this.blockArr.length>0 && this.blockArr[this.blockArr.length-1]==this.indentLevel)
            {
                this.isASwitchCaseLine=0;
        
                this.blockArr.pop();
                // console.log(` Found a end ${formattedText} ifLevel = ${this.ifLevel} ${this.indentLevel}  `)
            }
            if(this.blockArr.length===0)
            {
                this.isALineInASwitchCase=0
            }
        }
        formattedText = this.addIndentation(formattedText, openBracesPosition);
      
       // if(this.ifLevel==1 && this.caseLevel ===1 && this.blockArr.length>0)
  
       if( (this.isALineInASwitchCase ===1 || this.isASwitchCaseLine >1 ) && this.blockArr.length>0 )
        {
            console.log(`line=${lineText} + ${this.indentLevel}`);
            formattedText=this.getIndentString(1)+formattedText;

            
        }

        

        if (openBracesPosition === -1 && closingBracesPosition === -1) { return formattedText; }
        else if (openBracesPosition === 0 && formattedText.trim().length === 1) { return formattedText; }
        else if (closingBracesPosition === 0 && formattedText.trim().length === 1) { return formattedText; }
        else if ((commentIndex === -1 || (openBracesPosition < commentIndex && closingBracesPosition < commentIndex)) && defaultOps.splitOnBraces === true
        && this.testForBlocks(formattedText)) {
            let ba: string[] = this.splitOnBraces(formattedText);
            var filtered = ba.filter(function (el) {
                return el !== null && el !== "" && el.trim() !== "";
            });
            for (let i = 0; i < filtered.length; i++) {
                filtered[i] = this.formatCodeLine(filtered[i]);
            }
            formattedText = filtered.join("\n");
            return formattedText;
        }
        else {
            return formattedText;
        }

    }
    /**
     * formatCodeLine
     * Function recursively split the given line and check existence of braces to process indentation logics.Also performs formatting of texts.
     * @param lineText 
     * @returns 
     */
    public formatCodeLines(lineText: string): string {

        lineText = lineText.trim();
        let formattedText = lineText;



        // braces need to be checked only if it is outside quotes. For ease of use, here we are removing the double quoted text from the line and then do the braces check.

        let bracesVerificationText = lineText.replace(/["]+[^"]*["]+/, "");

        let openBracesPosition = bracesVerificationText.indexOf("{");
        let closingBracesPosition = bracesVerificationText.indexOf("}");

        let commentIndex = lineText.indexOf("#");


        formattedText = this.formatCodeText(formattedText);

        if (/switch\s*\(.*\)/.test(lineText)) {
            this.switchLevel++;
        }
        if (/(case.*?:)|(default.*?:)/.test(lineText)) {
            console.log(` Found Case Line${lineText} , caseLevel = ${this.isALineInASwitchCase}`);
            if (this.isALineInASwitchCase > 0 && this.isALineInASwitchCase == this.switchLevel) {

                this.isALineInASwitchCase--;
                this.indentLevel--;
            }
        }
        if (this.isALineInASwitchCase > 0 && closingBracesPosition != -1) {
            this.isALineInASwitchCase--;
            this.indentLevel--;
        }
        if (this.switchLevel > 0 && closingBracesPosition != -1) {
            this.switchLevel--;

        }

        this.depthCalculator(openBracesPosition, closingBracesPosition, lineText.length);
        console.log(` ${this.indentLevel} --> ${lineText} `)

        formattedText = this.addIndentation(formattedText, openBracesPosition);



        if (/(case.*?:)|(default.*?:)/.test(lineText)) {
            this.isALineInASwitchCase++;
            this.indentLevel++;
        }



        //     this.caseLevel++;
        //     this.indentLevel++;
        //     console.log(` Adding indentation from case ${this.caseLevel} ${this.indentLevel}`)
        // }


        ///@TODO -- this looks stupid. Need to refactor
        //trim format text to verify only parenthesis is present on line.
        /**
         * return if there is no bracket on line
         * return if the line only contain an opening curly braces.
         * return if the line only contain a clsoing curly braces
         * else if braces is present and not in a comment, split on braces  & recursively format the lines.
         */
        if (openBracesPosition === -1 && closingBracesPosition === -1) { return formattedText; }
        else if (openBracesPosition === 0 && formattedText.trim().length === 1) { return formattedText; }
        else if (closingBracesPosition === 0 && formattedText.trim().length === 1) { return formattedText; }
        else if (commentIndex === -1 || (openBracesPosition < commentIndex && closingBracesPosition < commentIndex) && defaultOps.splitOnBraces === true) {

            /// issue with rules going into infinite loop if the double quotes is not closed. The openbraces Position is based on closed qutes.
            //let ba = formattedText.split(/([{}])/);

            let ba: string[] = this.splitOnBraces(formattedText);

            var filtered = ba.filter(function (el) {
                return el !== null && el !== "" && el.trim() !== "";
            });

            for (let i = 0; i < filtered.length; i++) {

                filtered[i] = this.formatCodeLine(filtered[i]);

            }
            formattedText = filtered.join("\n");

            return formattedText;
        }
        else {

            return formattedText;
        }

    }

    /**
     * Function to add or remove depth level; 
     * @param openingBracesPosition index of curly start brace {
     * @param closingBracesPosition index of curly end brace }
     * @param lineLength length of line in consideration
     */
    depthCalculator(openingBracesPosition: number, closingBracesPosition: number, lineLength: number) {

        if (closingBracesPosition !== -1 && lineLength === 1) {
            this.indentLevel--;
        }
        if (openingBracesPosition !== -1 && lineLength === 1) {
            this.indentLevel++;
        }
    }




    /**
     * addIndentation
     * Prefix lines with indentation levels.
     * Starting { lines are indented with the base indent as the depth is incremented for each { lines befor indent calculation.
     * @param formattedText 
     * @param isAnOpeningBracketPresent 
     * @returns formattedText
     */
    addIndentation(formattedText: string, isAnOpeningBracketPresent: number): string {

        if (this.indentLevel > 0) {
            if (this.indentLevel > 1 && isAnOpeningBracketPresent >= 0) {
                let v = this.indentLevel - 1;
                formattedText = this.getIndentString(v) + formattedText;
            }
            else if (isAnOpeningBracketPresent === -1) {

                formattedText = this.getIndentString(this.indentLevel) + formattedText;
            }



        }
        return formattedText;
    }
    /**
 * A parser function for brackets.
 * The function splits the input line into multiple lines if encounter a curly braces
 * @param str 
 * @returns Array of strings
 * @throws syntax error, if the double quotes is not properly closed.
 */
    splitOnBraces(str: string): string[] {
        var parse: string[] = [];
        var inString: boolean = false;
        var escape: number = 0;
        var end: number = 0;

        for (var i = 0, c; c = str[i]; i++) { // looping over the characters in str
            if (c === '\\') { escape ^= 1; continue; } // 1 when odd number of consecutive \
            if (c === '{' || c === '}') {
                if (!inString) {
                    parse.push(str.slice(end, i));
                    parse.push(str.slice(i, i + 1));
                    end = i + 1;
                }
            }
            else if (str.indexOf(c) > -1 && !escape) {
                if (c === '"' && inString) { inString = false; }
                else if (c === '"' && !inString) { inString = true; }
            }
            escape = 0;
        }
        // now we finished parsing, strings should be closed
        if (inString) {
            window.showErrorMessage('Error: Looks like you have unclosed quotes present');
            throw SyntaxError('Unclosed quotes present');
        }
        if (end < i) { parse.push(str.slice(end, i)); }

        return parse;
    }
    /**
     * Generate an indentation string using the depth level.
     * @param indentLevel 
     * @returns indentString using the indentation character repeated to the indentLevel
     */
    getIndentString(indentLevel: number): string {


        const indentChar = " ";

        if (defaultOps.isIndentWithSpace) {

         

            indentString = new Array(defaultOps.indentSize! + 1).join(indentChar);
        }

        else {
            var indentString = "\t";
        }
        if (indentLevel > 0) {

            return indentString.repeat(indentLevel);
        }
        else {
            return "";
        }
    }

    removeTrailingWhitespace(currentLineText: string): string {

        return currentLineText.trimRight();
    }



    ifMatchBlock(line: String): boolean {
        const IF_REGEX = /((if|else\s*if|foreach|switch)(\s*\(.+\))\s*)/ig;
        const elseifRegex = /^((else\s*if)(\s*\(.+\))\s*)/ig;
        const elseRegex = /^(else\s*)/ig;
        if (line.match(IF_REGEX)) return true;
        if (line.match(elseifRegex)) return true;
        if (line.match(elseifRegex)) return true;
        return false;

    }
}




