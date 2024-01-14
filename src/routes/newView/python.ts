
import { ScriptContent } from "./script";
import type {PyodideInterface} from "pyodide"


let pyo : PyodideInterface | undefined 

let active_content: PythonContent|null = null
let print = (...x:any[])=>{active_content?.print(...x)}

async function setup_python(){
    console.log("python setup...");
    print("python setup ...")
    
    // @ts-ignore
    await import ("https://cdn.jsdelivr.net/pyodide/v0.24.1/full/pyodide.js")
    // window.print = (...x:any)=>{}
    // @ts-ignore
    pyo = await loadPyodide({stdout:print}) as PyodideInterface
    active_content!.outfield.innerHTML = ""
}

export async function run_python_code(code : string){
    console.log("run python");
    

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

    async execute() {
        this.outfield.innerHTML = ""
        let code = this.get_text()
        active_content = this
        code = code.replaceAll(" "," ")

        run_python_code(code).catch(e=>{
            console.log(e);
            this.handle_error(e)
        }).then(res=>{
            print(res)
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
    print(...args:any[]){
        let p = document.createElement("p")
        for (let arg of args){
            p.textContent += String(arg)
        }
        this.outfield.append(p)
    }
}

