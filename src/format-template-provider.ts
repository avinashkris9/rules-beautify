
const COMMENT_LINE = /^(#{3,})$/;
const COMMENT_STRING_LENGTH = 64; //Numbers of #### on comment header
const TUPLE_FUNCTIONS = "regmatch,match,contains,nmatch,extract,regreplace,nvp_add,nvp_remove,scanformat,substr";


export const TUPLE_FUNCTIONS_REGEX = new RegExp("(" + TUPLE_FUNCTIONS.split(",").join('|') + ")\\s*(\\(.*?,)\\s*(.*?\\))");
export const CONTROL_FUNCTION_REGEX = /(if|foreach|switch|else if)\s*(\()\s*(.*\).*)/;
export  const caseRegex = /(if|foreach|switch|else if)\s*(\(.*?\))\s*({)\s*(.*?)(})/;


/**
 * @deprecated . Encourage use of insertHeader over this.
 * @param fileName 
 * @returns 
 */
 export function insertHeaders(fileName: string) {
    return `###############################################################################
#
# Rules  ${fileName}
###############################################################################
# Version Control
# 
###############################################################################

`;

}

/**
 * An extremely dumb function to insert a text header for rules.
 * @param fileName 
 * @returns 
 */
export function insertHeader(fileName:string)
{
    let x:string[]=[];
    x[0]=getCommentString();
    x[1]="#";
    x[2]="# Rule: "+fileName;
    x[3]=getCommentString();
    x[4]="# Version Control";
    x[5]="# <version>, <project>, <author name>, <author email>";
    x[6] ="# ";
    x[7]=getCommentString()+"\n\n";

    return x.join("\n");
}

/**
 * formatComment - 
 *  - Add a whitespace after #
 *  - Append #s to the #### comment header to COMMENT_STRING_LENGTH for consistency.
 * @param commentText 
 * @returns commentText
 */
export function formatComment(commentText: string ): string {
    
    // if the line only contain ## , extend it to a block.
    if (commentText.trimLeft().match(COMMENT_LINE)) {
        return commentText.replace(COMMENT_LINE, getCommentString());
    }

    else // add a space
    { 
        return commentText.replace(/#([^\s#+].*)/, "# $1");
    }
}

/**
 * getCommentString - Repeat #s to the length COMMENT_STRING_LENGTH
 * @returns 
 */
function getCommentString():string {
    return "#".repeat(COMMENT_STRING_LENGTH);

}
 

/**
 * addVariableAssignmentSpacing
 * Add one space around assignment operator.
 * @param variableAssignmentLine 
 * @returns 
 */
export function addVariableAssignmentSpacing(variableAssignmentLine: string):string {

    const VARIABLE_ASSIGNMENT_REGEX=/([@$]\w+)\s*(=)\s*(.*)/;
    if (variableAssignmentLine.trimLeft().startsWith("$") || variableAssignmentLine.trimLeft().startsWith("@")) {
      
        variableAssignmentLine = variableAssignmentLine.replace(VARIABLE_ASSIGNMENT_REGEX, "$1 $2 $3");
    }
    // I FORGOT WHY I HAVE ADDED THIS
    // else if(/([$@\w+])\s*(=)(.*)/.test(variableAssignmentLine))
    // {
    //     variableAssignmentLine = variableAssignmentLine.replace(/([$@\w+])\s*(=)(.*)/, "$1 $2 $3");
    // }
   
    return variableAssignmentLine;
}

/**
 * Convert all tabs to space
 * @param lineText 
 * @returns formatted lineText
 */
export function convertTabToSpace(lineText: string): string {
    return lineText.replace("(\t)", '    ');
}

