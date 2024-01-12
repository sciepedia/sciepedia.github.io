
import * as esprima from  "esprima"


export function can_preview_code(code:string){



    // esprima.Syntax.ArrayExpression
    function can_preview_expression(expression:any){
        if (["MemberExpression","Literal","Identifier"].includes(expression.type)) return true
        console.log(expression.type);
        
        if (expression.type == "BinaryExpression"){
            if (can_preview_expression(expression.left) && can_preview_expression(expression.right)){
                return true
            }
        }else if (expression.type == "ObjectExpression"){
            console.log(expression);
            for (let prop of expression.properties ){
                if (! can_preview_expression(prop.key) && can_preview_expression(prop.value)){
                    console.log("cant prev",prop);
                    
                    return false
                }
            }
            return true
            
        }else if (expression.type == "ArrayExpression"){
            for (let el of expression.elements){
                if (! can_preview_expression(el)){
                    console.log("cant preview", el);
                    return false
                }
            }
            return true
        }else if(expression.type == "CallExpression"){
            if (expression.callee.type =="MemberExpression"){

                if (expression.callee.object.type == "Literal"){
                    console.log("literal");
                    
                    for (let arg of expression.arguments){
                        if (! can_preview_expression(arg)) return false
                    }
                    return true
                }
            }
        }
        console.log("cant preview",expression );
        return false
    }
    try{ 
        let statement = esprima.parseScript(code).body[0]
        if (statement.type == "ExpressionStatement"){
            return can_preview_expression(statement.expression)
        }
        console.log(statement);
    }catch(e){
        console.log(e);   
    }
    return false
}


export function preview_code(code:string){
    try{

        if (can_preview_code(code)){
            let fn = Function(`return ${code}`)
            return fn()
        }
    }catch{}
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
