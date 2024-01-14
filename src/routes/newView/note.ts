import { store } from "../model/data_store";
import type { PathData, language } from "../model/data_store";
import { TextContent, make_editable } from "./content";
import type { Link } from "./link";
import { PythonContent } from "./python";
import { ScriptContent } from "./script";


export class Note{
    path:PathData
    creator?: Link
    element:HTMLDivElement
    head:Head
    content:TextContent
    language:language
    call_hist:PathData[] = []

    constructor(path:PathData, creator?:Link){
        console.log("creating note", path);
        
        this.path = path
        this.creator = creator
        // let data = store.getitem(path,(newdata)=>{})
        this.element = document.createElement("div")
        this.element.classList.add("note")
        this.head = new Head(this)

        this.language = this.path.get_language()
        if (this.language == "txt"){
            this.content = new TextContent(this)
        }else if(this.language == "js"){
            this.content = new ScriptContent(this)
        }else if (this.language == "py"){
            this.content = new PythonContent(this)
        }else{
            this.content = new TextContent(this)
        }

        if (creator){
            this.call_hist = creator!.parent.call_hist.concat(creator!.parent.path)
        }

        // this.content.setText(data.Content)
        this.element.addEventListener("click",(e)=>{
            if (!this.content.element.contains(e.target as Node)){
                make_editable(null)
                e.preventDefault()
            }
        })
    }

    remove(){

        this.content.save()
        this.content.save_linkstate()
        this.element.remove()
    }

    create_child(path:PathData){
        return new Note(path)
    }
}


export class Head{
    note:Note
    element:HTMLElement
    constructor(note:Note){
        this.note = note
        this.element = document.createElement("h1")
        this.element.textContent = note.path.tostring()        
        this.note.element.append(this.element)
    }
}