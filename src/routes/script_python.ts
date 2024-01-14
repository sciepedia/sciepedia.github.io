
import { browser } from "$app/environment";
import type {PyodideInterface} from "pyodide"
import { Body, Note } from "./note";
import type { Link, PathData } from "./link";


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