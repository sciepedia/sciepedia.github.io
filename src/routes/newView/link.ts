
import type {Note} from "./note"
import type { PathData } from "../model/data_store"


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

        console.log(name);
        
        const splits = name.split(".")
        for (let item of splits[splits.length-1]){
            if (/^[0-9]+$/.test(item)) this.linenumber = +item
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
            this.parent.content.save_linkstate()
        })
        linkCounter ++ 
        this.element.id = `L${linkCounter}`
        linkRepo.set(this.element,this)
        this.path = this.parent.path().create_child(this.name)        
    }

    set_path(newpath:PathData){
        console.log(newpath);
        
        this.path = newpath
        this.name = newpath.relative_path_string(this.parent.path())
        this.element.textContent = this.name
    }

    remove(){
        this.child?.remove()
    }

    set_open(value:boolean){

        if (value == this.open) return
        this.element.classList.toggle("open")
        if (value){
            let line = this.element.parentElement as HTMLParagraphElement
            this.child = this.parent.create_child(this.path,this)
            line.append(this.child!.element)

            if (this.linenumber!=null){
                let item = this.child.content.element.childNodes.item(this.linenumber-1);
                (item as HTMLParagraphElement).style.background = "var(--focus)"
            }
        }else{
            this.child!.remove()
        }
        this.open=value

    }
}

