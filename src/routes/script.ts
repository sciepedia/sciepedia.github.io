
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


export function wrap_code_function(code:string){


    try{

        let ast = esprima.parseScript(code,{range:true})
        let final_statement = ast.body[ast.body.length-1]


        if (final_statement.type == "ExpressionStatement"){
            let final_range= final_statement.range!
            let final_block = code.slice(...final_range)
            code = code.slice(0,final_range[0])
            code += "\nreturn   " + final_block
        }

    }catch (e){
        console.log(e);
    }

    const asyncContent = `return async function(){${code}}`
    console.log(asyncContent);
    
    return asyncContent
}
