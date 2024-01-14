
import { browser } from "$app/environment";
import type {PyodideInterface} from "pyodide"
import { TextBody, Note, ScriptNote, ScriptBody } from "./note";
import type { Link, PathData } from "./link";
import { store, type NoteData } from "../model/data_store";



let pyo : PyodideInterface | undefined 

async function setup_python(){
    await import ("https://cdn.jsdelivr.net/pyodide/v0.24.1/full/pyodide.js") // @type:ignore
    pyo = await loadPyodide() as PyodideInterface
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


export class PythonBody extends ScriptBody{

    // language:language = "py"
    // outfield:HTMLDivElement

    
    constructor(txt:string,owner:Note|CommentElement,content:NoteData,call_hist:string[] = []){

        super(txt,owner,content,call_hist)
        // this.language = "py"
        // this.data.language = "py"

        // this.body.content.classList.add("js")
        // this.outfield = document.createElement("div")


        // if (this.data.Path.location[this.data.Path.location.length-1]=="py"){

        //     const runbutton = document.createElement("div")
        //     runbutton.innerHTML = "▶"
        //     runbutton.classList.add("runbutton")

        //     const preprun = ()=>{
        //         function deepsave(b:TextBody){
        //             if (b.saves_pending) b.save()
        //             b.get_links().forEach(l=>{
        //                 if (l.is_open && l.childnote){
        //                     deepsave(l.childnote.body)
        //                 }
        //             })
        //         }
        //         deepsave(this.body)
        //         runbutton.innerHTML = "O"
        //         this.outfield!.innerHTML = ""

        //     }
        //     const execute = ()=>{
        //         this.execute_script(this.body)
        //         runbutton.innerHTML = "▶"
        //     }
            
        //     runbutton.addEventListener("mousedown", preprun)
        //     runbutton.addEventListener("click", execute)
        //     this.body.content.addEventListener("keydown",  (e:KeyboardEvent)=>{
        //         if (e.key == "Enter" && e.ctrlKey){
        //             preprun()
        //             execute()
        //         }
        //     })
        //     this.body.element.appendChild(runbutton)
        //     this.outfield.classList.add("content")
        //     this.outfield.classList.add("js")
        //     this.body.element.appendChild(this.outfield)
        // }

}