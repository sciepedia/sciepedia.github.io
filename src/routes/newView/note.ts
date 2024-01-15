import { get } from "svelte/store";
import { store } from "../model/data_store";
import type { PathData, language } from "../model/data_store";
import { username } from "../model/store";
import type { Content } from "./content";
import {open_context_menu} from "./contextMenu"
import { CsvContent } from "./csvContent";
import type { Link } from "./link";
import { PythonContent } from "./python";
import { rename_note } from "./renamer";
import { ScriptContent } from "./script";
import { TextContent } from "./textContent";


export class Note{

    creator?: Link
    element:HTMLDivElement
    head?:Head
    content:Content
    language:language
    call_hist:PathData[] = []
    init_path:PathData

    constructor(path:PathData, creator?:Link){
        this.init_path = path
        console.log("creating note", path);

        this.creator = creator

        this.element = document.createElement("div")
        this.element.classList.add("note")

        this.head = new Head(this,path)
        this.element.append(this.head.element)

        this.language = path.get_language()

        
        if (this.language == "txt"){
            this.content = new TextContent(this)
        }else if(this.language == "js"){
            this.content = new ScriptContent(this)
        }else if (this.language == "py"){
            this.content = new PythonContent(this)
        }else if (this.language == "csv"){
            console.log("creating csv");
            
            this.content = new CsvContent(this)
        }else{
            this.content = new TextContent(this)
        }

        if (creator){
            this.call_hist = creator!.parent.call_hist.concat(creator!.parent.path())
        }
    }

    path(){
        try{
            return this.content.data.Path
        }catch{
            return this.init_path
        }
    }

    remove(){
        this.content.save()
        this.content.save_linkstate()
        this.element.remove()
    }

    create_child(path:PathData, link:Link){
        return new Note(path,link)
    }


    rename(newpath:PathData){

        let item = store.getitem(newpath,newitem=>{
            this.content.data.id = newitem.id
            this.content.save()
        })

        this.content.data.Path = newpath
        this.content.data.id = item.id
        this.content.get_links().forEach(link=>{            
            link.set_path(link.path)
        })
        this.content.save()
        
        let newnote = new Note(this.path())
        this.element.replaceWith(newnote.element)
        
        if(this.creator){
            this.creator.set_path(newpath)    
            this.creator.child = newnote
            this.creator.parent.content.save()
        }else{
            window.location.search = newpath.tostring().replace("#","")
        }
    }
}


export class Head{
    note:Note
    element:HTMLElement
    constructor(note:Note,path:PathData){

        this.note = note
        this.element = document.createElement("div")
        this.element.classList.add("head")
        this.element.contentEditable = "false"
        let titleElement = document.createElement("h2")

        let title:string
        if (this.note.creator){
            title = path.title_string(this.note.creator!.parent.path())
        }else{
            title = path.title_string()
        }
        titleElement.textContent = title
        this.element.append(titleElement)
        this.note.element.append(this.element)

        this.element.addEventListener("click",(e)=>{
            rename_note(this.note.content.data.Path)
            .catch(()=>{})
            .then(newpath=>{if (newpath) this.note.rename(newpath)})
        })
        this.element.addEventListener("contextmenu",(e)=>{
            open_context_menu(e,this.note)
        })
    }

}