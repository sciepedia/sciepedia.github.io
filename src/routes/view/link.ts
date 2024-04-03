
import type {Note} from "./note"
import type { PathData } from "../model/data_store"
// import { last_focused_content } from "./content"
import type { Content } from "./content"


let linkRepo = new WeakMap<HTMLSpanElement, Link> ()
let linkCounter = 0


export function get_link(span:HTMLSpanElement){
    return linkRepo.get(span)
}

export class Link{

    name:string = ""
    parent:Note
    element:HTMLSpanElement
    open:boolean
    child?:Note
    path:PathData
    linenumber:number|null = null

    constructor(name:string, parent:Note, open = false){        
        
        for (let at of name.split(".").slice(-1)[0].split(":").slice(1)){
            if (/^[0-9]+$/.test(at)) this.linenumber = +at
        }

        this.name = name
        this.parent = parent
        this.element = document.createElement("span")
        this.element.textContent = name
        this.element.classList.add("link")
        this.element.spellcheck = false
        this.open = open
        this.element.addEventListener("click", ()=>{
            this.set_open(!this.open)
        })

        linkCounter ++ 
        this.element.id = `L${linkCounter}`
        linkRepo.set(this.element,this)
        this.path = this.parent.path().create_child(this.name)
              
    }

    set_path(newpath:PathData){

        console.log("renaming link", newpath.tostring(),this.parent.path().tostring());
        
        this.path = newpath
        this.name = newpath.relative_path_string(this.parent.path())
        console.log("new name:",this.name);
        
        this.element.textContent = this.name
    }

    set_collapsed(value:boolean){
        if (this.open || this.path.get_language() != "txt"){
            return
        }
        if (value){
            this.element.textContent = this.path.collapsed_link_name(this.parent.path())
        }else{
            this.element.textContent = this.name
        }
    }

    remove(){
        this.child?.remove()
    }

    set_open(value:boolean){

        if (value == this.open) return

        this.element.classList.toggle("open")
        
        if (value){

            this.set_collapsed(false)

            let line = this.element.parentElement as HTMLParagraphElement
            this.child = this.parent.create_child(this.path,this)

            if (this.linenumber!=null){
                console.log(this.linenumber);
                
                let item = this.child.content.element.childNodes.item(this.linenumber-1);
                (item as HTMLParagraphElement).style.background = "var(--focus)"
            }
            
            if (line.textContent?.trim() == this.name && this.path.get_language() != "csv"){
                this.element.remove()
            }
            line.append(this.child!.element)

        }else{
            if (this.element.parentElement == null){
                this.child!.element.replaceWith(this.element)
            }
            this.child!.remove()
        }
        this.open=value
        if (this.parent.content) this.parent.content.save_linkstate()

    }
}

