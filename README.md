# Rules-Beautify - VSCode Extension for Netcool probe rules

The `rules-beautify` is a language extension & formatter for IBM Netcool rules language.

## Features

- Syntax highlighting for `.rules` and `.include` extensions.
- An opinionated code formatting.
    - Adds a header comment if the first line of file is not a comment.
    - Single whitespace between control function and its parameters.

        ` if($a>$b)` will be `if ($a>$b)`
    - Arguments passed to functions with multiple parameters (regmatch,match,contains,nmatch) are separated by a comma and a space character.

        ` if (regmatch($Node,$Node))` will be `if (regmatch($Node, $Node))`
    - Split all parenthesis to newline.
    - Single white space between variable assignment operator.
    
        `@Node=$Node or $Node   =@Node ` will be `@Node = $Node`
    - Format blocks & nested blocks (if,switch,foreach) using tab or whitespace indentation.
    - Log errors if any double quotes or parenthesis is not closed.

- Snippets
    - `###` adds a comment block with placeholders for comment.
    - `log` adds a debug log with placeholders for log level.
    - `extract` adds a regmatch and extract block for regular expression based extracts. Placeholders for all variables.



## Extension Settings

The extension offers below configuration for users to customise the formatting.

| Settings ID 	| Default Value   	| Description 	|
|-------------	|-----------------	|-------------	|
| probeRules.indentWithWhiteSpace          	| true         	| Use whitespace as indent string           	|
| probeRules.numberOfWhiteSpaces          	| 4     	|      Number of whitespace for indentation       	|
| probeRules.splitBracesToNewLine          	| true     	|            Split curly braces to newline 	|
| probeRules.backupBeforeFormatting          	| true     	|            Take backup of file with extension `-rules-beautify-backup.rules` before formatting 	|


## Known Issues

- The formatter is a stupid formatter which uses regex replace for formatting. I am hoping someone will build or re-use a real AST parser and a proper formatter for rules language in future :).

- Formatter won't work if there is a lookup table definition (inline/multiline) present on the rules. The indentation will be unpredictable. Only works if lookup as an include file. 

- This is a hobby project and there is no guarantee to work. If you are seeing any issues, please raise a github issue.

## Acknowledgement

- Inspired from [ibm_rules_extension](https://github.com/TheGreatSardini/ibm_rules_extension)

## Footnote

IBM Tivoli Netcool is a Trademark owned by International Business Machines Corporation (“IBM”)

This extension has no relation to IBM company/products/services and is just meant to assist developers for rules file development using VSCode.

**Enjoy coding :)**
