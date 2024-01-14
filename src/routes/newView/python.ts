import { ScriptContent } from "./script";
import type {PyodideInterface} from "pyodide"


let pyo : PyodideInterface | undefined 

let print = (...x:any[])=>console.warn(x)

async function setup_python(){
    await import ("https://cdn.jsdelivr.net/pyodide/v0.24.1/full/pyodide.js") // @type:ignore
    window.print = (...x:any)=>{}
    pyo = await loadPyodide({stdout:print}) as PyodideInterface

    // console.log(pyo.setStdout)
    // pyo.setStdout((...a:any[])=>{console.log("out:",a)})

    // await pyo.loadPackage("numpy")

}

export async function run_python_code(code : string){

    if (pyo == undefined){
        await setup_python()
        return run_python_code(code)
    }
    let lines = code.split("\n")

    let imports = lines.filter(s=>/^\%pip\s*install/.test(s)).map(s=>{

        return s.split(/^\%pip\s*install/)[1].trim()
    })


    for (let imp of imports){
        await pyo.loadPackage(imp)
    }
    
    code = code.replace(/^\%pip\s*install\s*.*/, "")

    let res = pyo.runPython(code)

    return res
}


let pythonKeywords = [
    "False",	"await",	"else",	"import",	"pass",
    "None",	"break",	"except",	"in",	"raise",
    "True",	"class",	"finally",	"is",	"return",
    "and",	"continue",	"for",	"lambda",	"try",
    "as",	"def",	"from",	"nonlocal",	"while",
    "assert",	"del",	"global",	"not",	"with",
    "async",	"elif",	"if",	"or",	"yield"
];



// Construct a regex pattern from the keywords
let keywordRegex = new RegExp("\\b" + pythonKeywords.join("\\b|\\b") + "\\b");

const syntaxclasses = [
    {pattern:(x:string)=>/[\[\]{}()]/.test(x),color:"yellow"},
    {pattern:(x:string)=>pythonKeywords.includes(x),color:"lightblue"},
    {pattern:(x:string)=>!isNaN(parseFloat(x)),color:"orange"}, // number
    {pattern:(x:string)=>/^"(.*)"/.test(x),color:"orange"}, // string
]


export function python_element(word:string){

    let res : Text | HTMLSpanElement = new Text(word)
    syntaxclasses.forEach(i=>{

        if (i.pattern(word)){
            res = document.createElement("span")
            res.textContent = word
            res.style.color = i.color
        }
    })
    return res

}


export class PythonContent extends ScriptContent{

    execute(): void {
        this.outfield.innerHTML = ""
        let code = this.get_text()

        print = (...args:any[])=>{            
            this.print(...args)
        }
        code = code.replaceAll(" "," ")

        run_python_code(code).catch(e=>{
            console.log(e);
            this.handle_error(e)
            
        })

    }

    handle_error(error:Error){
        let lines = error.stack!.split("\n")
        console.log(lines);
        
        lines.filter(line=>{
            return line.startsWith('  File "<exec>", line') || (!line.startsWith(" ") && !line.startsWith("PythonError:"))
        }).map(line=>print(line))
    }

    on_input(e: Event): void {
        super.on_input(e)
    }

    make_word(t: string): Text {
        return python_element(t)
    }
}

