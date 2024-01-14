import { store } from "../model/data_store";
import type { PathData, language } from "../model/data_store";
import { TextContent, make_editable } from "./content";
import type { Link } from "./link";
import { PythonContent } from "./python";
import { rename_note } from "./renamer";
import { ScriptContent } from "./script";


export class Note{

    creator?: Link
    element:HTMLDivElement
    head?:Head
    content:TextContent
    language:language
    call_hist:PathData[] = []

    constructor(path:PathData, creator?:Link){

        this.path=()=>path // hack for initialization

        this.creator = creator

        this.element = document.createElement("div")
        this.element.classList.add("note")

        this.head = new Head(this,path)
        this.element.append(this.head.element)

        this.language = path.get_language()

        
        if (this.language == "txt"){
            this.content = new TextContent(this,path)
        }else if(this.language == "js"){
            this.content = new ScriptContent(this,path)
        }else if (this.language == "py"){
            this.content = new PythonContent(this,path)
        }else{
            this.content = new TextContent(this,path)
        }

        if (creator){
            this.call_hist = creator!.parent.call_hist.concat(creator!.parent.path())
        }

        // this.content.setText(data.Content)
        this.element.addEventListener("click",(e)=>{
            if (!this.content.element.contains(e.target as Node)){
                make_editable(null)
                e.preventDefault()
            }
        })
    }

    path(){
        return this.content.data.Path
    }

    remove(){

        this.content.save()
        this.content.save_linkstate()
        this.element.remove()
    }

    create_child(path:PathData, link:Link){
        return new Note(path,link)
    }

}


export class Head{
    note:Note
    element:HTMLElement
    constructor(note:Note,path:PathData){

        this.note = note
        this.element = document.createElement("h2")

        let title:string
        if (this.note.creator){
            title = path.relative_path(this.note.creator!.parent.path()).mini()
        }else{
            title = path.mini()
        }
        this.element.textContent = title
        this.note.element.append(this.element)

        this.element.addEventListener("click",()=>{
            rename_note(this.note.content.data.Path).then(newpath=>{

                let item = store.getitem(newpath,newitem=>{
                    this.note.content.data.id = newitem.id
                    this.note.content.save()
                })

                this.note.content.data.Path = newpath
                this.note.content.data.id = item.id

                title = note.content.data.Path.relative_path(this.note.creator!.parent.path()).mini()
                this.element.textContent = title


            })
        })
    }
}