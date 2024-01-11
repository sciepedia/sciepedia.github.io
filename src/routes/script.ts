
import * as esprima from  "esprima"


export function can_preview_code(code:string){

    try{
                
        let statement = esprima.parseScript(code).body[0]
        if (statement.type == "ExpressionStatement"){
            if (["MemberExpression","Literal","Identifier"].includes(statement.expression.type)){
                return true
            }            
        }
        console.log(statement);
    }catch(e){
        console.log(e);   
    }
    return false
}

export function preview_code(code:string){

    if (can_preview_code(code)){
        let fn = Function(`return ${code}`)
        return fn()
    }
    return ""

}


