
import { browser } from "$app/environment";
import type {PyodideInterface} from "pyodide"
import { Body, Note } from "./note";
import type { Link, PathData } from "./link";


let pyo : PyodideInterface | undefined 

async function setup_python(){
    await import ("https://cdn.jsdelivr.net/pyodide/v0.24.1/full/pyodide.js") // @type:ignore
    pyo = await loadPyodide() as PyodideInterface
}

export async function run_python_code(code : string){
    if (pyo == undefined){
        await setup_python()
        return run_python_code(code)
    }
    let res = pyo.runPython(code)

    return res
}
