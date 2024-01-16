
import { ScriptContent } from "./script";
import type {PyodideInterface} from "pyodide"
import { last_focused_content } from "./textContent";


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
    // pyo = await loadPyodide({stdout:print}) as PyodideInterface
    pyo = await loadPyodide() as PyodideInterface
    active_content!.outfield.innerHTML = "";
    (window as any).pyo = pyo
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

        try{

            let res = await this.run_python_code(code)
            if (res != undefined) print(res)
        }catch(e){
            console.log(e);
            this.handle_error(e as Error)
        }

    }


    async run_python_code(code : string, ){
        console.log("run python");
        if (pyo == undefined){
            await setup_python();
        }
        await pyo!.loadPackage("micropip")

        let need_installs = false
        code = code.split("\n").map((line,i)=>{

            if (/^\%pip\s*install/.test(line)){
                let importtarget = line.split(/^\%pip\s*install/)[1].trim()
                need_installs = true
                return `await micropip.install("${importtarget}")`
            }
            return line
        }).join("\n")
        if (need_installs){
            code = "import micropip\n" + code
        }
        console.log(code);
        let globals = pyo?.globals

        globals!.set("print", (...x:any[])=> this.print(...x.map(item=>item.toJs())) )
        let res = pyo!.runPythonAsync(code)
        return res
    }



    handle_error(error:Error){
        let lines = error.stack!.split("\n")
        console.log(lines);
        
        lines.filter(line=>{
            return line.startsWith('  File "<exec>", line') || (!line.startsWith(" ") && !line.startsWith("PythonError:"))
        }).map(line=>print(line))
    }

    on_input(e: Event): void {
        if (this.data.Path.location.indexOf("py")==this.data.Path.location.length -1){
            active_content = this
        }
        super.on_input(e)
    }

    make_word(t: string): Text {
        return python_element(t)
    }

    print(...args:any[]){
        console.log("printing from", this);
        
        let p = document.createElement("p")
        for (let arg of args){
            p.append(parse(arg))
        }
        this.outfield.append(p)
    }
}


function parse(t:any):HTMLElement{
    
    let is_simple = (t:any)=> ["string", "number", "boolean", "symbol", "undefined", "function"].includes(typeof t) || t == null

    let sp = document.createElement("span")    
    if (is_simple(t)){

        if ( ["number", "boolean"].includes(typeof t)) {
            sp.style.color = "orange"
        }
        let st = String(t)
        sp.textContent = st

    }else{
        let tag = t.type
        sp.textContent = tag + " "

        sp.style.color = "var(--blue)"
        sp.style.cursor = "pointer"

        let isopen = false
        let p : HTMLParagraphElement | undefined

        function open(){
            console.log("open", t);

            isopen = true
            p = document.createElement("p")
            p.style.paddingLeft = "2em"

            sp.append(p)
            let maxcount = 20

            if (tag == "list"){

                for (let item of t){
                    if ((maxcount--) < 0) break
                    p!.append(parse(item))
                    p!.append(document.createElement("br"))
                }
            }else{
                try{

                    for (let key of t.__dict__){
                        if ((maxcount--) < 0) break
                        p.append(key, ": ")
                        p.append(parse(t[key]))
                        p.append(document.createElement("br"))
                    }
                }catch{
                    try{
                        for (let item of t){
                            if ((maxcount--) < 0) break
                            p!.append(parse(item))
                            p!.append(document.createElement("br"))
                        }
                    }catch{}
                }
            }
        }
        sp.addEventListener('click',(e)=>{
            if (e.target != sp) return
            
            if (isopen){
                p?.remove()
                isopen = false
                return
            }
            open()
        })

        let prev = String(t)
        // if (prev.length > 20) prev = prev.slice(0,19) + "..."
        sp.append(prev)
        
    }

    return sp
}

