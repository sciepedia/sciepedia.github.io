
import { TextContent } from "./content";
import type { Note } from "./note";

export class ScriptContent extends TextContent{
    outfield:HTMLDivElement
    constructor(note:Note){
        super(note)
        this.element.classList.add("js")

        let runbutton = document.createElement("div")
        runbutton.classList.add("runbutton")
        runbutton.textContent = "▶"
        runbutton.addEventListener("click",(e)=>this.execute())
        this.element.addEventListener("keydown",(e)=>{
            console.log(e);
            
            if (e.ctrlKey && e.key == "Enter"){
                this.execute()
            }
        })
        this.element.parentElement!.append(runbutton)
        this.outfield = document.createElement("div")
        this.outfield.classList.add("content")
        this.element.parentElement!.append(this.outfield)
    }

    execute(){
        // window.print = (...x:any[])=>{
        //     console.log(x);
            
        //     this.outfield.innerHTML = ""
        //     for (let e of x){
        //         let p = document.createElement("p")
        //         p.textContent = e
        //         this.outfield.append(p)
        //     }
        // }
        window.print = this.print
        let fn = Function(this.get_text())
        fn()
    }

    print(...args:any[]){
        let p = document.createElement("p")
        for (let arg of args){
            p.textContent += String(arg)
        }
        this.outfield.append(p)
    }
}

