

import { get } from "svelte/store"
import { username } from "../model/store"
import type {Note} from "./note"
import type { PathData } from "../model/data_store"


let linkRepo = new WeakMap<HTMLSpanElement, Link> ()
let linkCounter = 0


export function get_link(span:HTMLSpanElement){
    return linkRepo.get(span)
}

export class Link{

    name:string
    parent:Note
    element:HTMLSpanElement
    open:boolean
    child?:Note
    path:PathData

    constructor(name:string, parent:Note, open = false){
        this.name = name
        this.parent = parent
        this.element = document.createElement("span")
        this.element.textContent = name
        this.element.classList.add("link")
        this.open = open
        this.element.addEventListener("click", ()=>this.set_open(!this.open))
        linkCounter ++ 
        this.element.id = `L${linkCounter}`
        linkRepo.set(this.element,this)
        this.path = this.parent.path.create_child(this.name)
    }
    remove(){
        this.child?.remove()
    }

    set_open(value:boolean){
        if (value == this.open) return
        if (value){
            let line = this.element.parentElement as HTMLParagraphElement
            this.child = this.parent.create_child(this.path)
            line.append(this.child!.element)
        }else{
            this.child!.remove()
        }
        this.open=value
    }
}

