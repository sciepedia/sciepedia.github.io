
import {root, setCaret, title_list} from "./note"

import {Note,Body} from "./note"

import { add_title_completion } from "./autocomplete"
import { username } from "./store"
import { get } from "svelte/store"

import type { uuid } from "./data_store"

export let link_repo = new Map<string,Link>()
let link_counter = 0

export class Link {

    name : string;
    path : PathData;

    public element : HTMLSpanElement;
    private childnote : Note | null = null

    is_open : boolean = false

    private parent : Body

    constructor(name:string, parent:Body, compact:boolean) {

        this.name = name;
        this.element = document.createElement("span");

        this.parent = parent
        this.element.classList.add("link")
        let path_string = name

        // remove useless trailing dot and colon
        if (path_string.endsWith(".") || path_string.endsWith(":")){
            path_string = path_string.slice(0,path_string.length-1)
        }

        var parent_path = parent.owner.data
        console.log(parent_path.Path)

        if (path_string.startsWith("..")){

            if (parent_path.Path.location.length == 1){
                this.element.classList.add("error")
            }else{
                parent_path.Path.location = parent_path.Path.location.slice(0,parent_path.Path.location.length-1)
                path_string = parent_path+path_string.slice(1)
            }

        }else if(path_string.startsWith(".")){
            console.log(parent_path.Path);
            
            path_string = parent_path.Path.tostring()+path_string
        }


        if (!path_string.includes(":")){

            let author = parent.owner.data.Path.author

            path_string += `:${author}`
        }

        this.path = get_path_data(path_string)

        
        this.element.innerHTML = name

        this.element.onclick = (e)=>{

            if (e.target != this.element){return} // dont activate on prediction click which is child element

            if (this.is_open){
                this.close()
            }else{
                this.open()
            }

            this.parent.save_linkstate()
        }

        this.element.id = "link"+link_counter++
        link_repo.set(this.element.id,this)

        if(compact){
            this.set_expanded(false)
        }
    }

    remove(){
        if(this.is_open){
            this.close()
        }
        // this.element.remove()
        link_repo.delete(this.element.id)
    }

    rename(new_path:PathData):string{

        this.path = new_path

        // if (new_path.startsWith(this.parent.path) && this.parent.path.length < new_path.length){
        //     const diff = new_path.slice(this.parent.path.length)
        //     if (diff.startsWith(".")){
        //         new_path = diff
        //     }
        // }else if(this.parent.path.includes(".")){
        //     const prepath = this.parent.path.split(".").slice(0,-1).join(".")
        //     if (new_path.startsWith(prepath)){
        //         const diff = new_path.slice(prepath.length)
        //         if (diff.startsWith("."))
        //         new_path.location.push(diff)
        //     }
        // }

        this.name = new_path.tostring()

        if (!this.expanded && !this.is_open){
            let compact_name = get_compact_link_name(this.name)
            this.element.innerHTML = compact_name
        }else{
            this.element.innerHTML = this.name
        }

        this.parent.save_lazy()

        setCaret(this.element,1)

        return this.name
    }

    open(call_hist:PathData[] = []){
        this.is_open = true

        this.is_open = true
        this.element.classList.add("open")

        this.childnote = new Note(this.name, this.path,this,call_hist)

        const line = this.element.parentElement!
        line.appendChild(this.childnote.element)
        title_list.push({element:this.childnote.head.title_element,fullpath:this.path})
        
        this.set_expanded(true)

        add_title_completion(this.path)
    }

    close(){
        
        this.element.classList.remove("open")
        if(!this.is_open){
            return
        }
        this.is_open = false

        this.is_open = false
        let line = this.element.parentElement
        this.childnote!.close()
        
        if (!this.parent.editable){
            this.set_expanded(false)
        }
    }

    expanded = true

    set_expanded(expanded:boolean){
        
        this.expanded = expanded
        if (!expanded && !this.is_open){
            let name = this.name
            if (name==""){
                return
            }

            let compact_name = get_compact_link_name(name)
            this.element.innerHTML = compact_name
        }else{
            this.element.innerHTML = this.name
        }
    }
}

export function remove_link_id(id:string){
    link_repo.delete(id)

}

export function get_link(id:string){
    return link_repo.get(id)
}

function get_compact_link_name(path:string){

    let suffix = ""
    let possible_suffixes = [".",":"]
    possible_suffixes.forEach(s=>{
        if (path.endsWith(s)){
            suffix = s
            path = path.slice(0,path.length-1)
        }
    })

    // remove anything before the last dot 
    let name = path.replace(/.*\./g,"")
    //remove anything after the first @ or :
    .replace(/[@,:].*/g,"")

    const possible_prefixes = ["#","_"]
    possible_prefixes.forEach(p=>{
        if (name.startsWith(p)){
            name = name.slice(1)
        }
    })

    name = name.replaceAll("_"," ")
    
    return name + suffix
}

export function is_link_element(element:Node){
    return element instanceof HTMLSpanElement && element.classList.contains("link")
}

export function is_typo_element(element:Node){
    return element instanceof HTMLSpanElement && element.classList.contains("typo")
}

export class PathData{
    pub:boolean
    location:string[]
    author:string

    constructor(pub:boolean, author: string, location: string[]){
        this.pub = pub
        this.author =author
        this.location = location
    }

    tostring(){
        return (this.pub?"#":"_" )+this.location.join(".")+`:${this.author}`
    }
}

export function get_path_data(path:string):PathData{

    let pub = path.startsWith("#")
    if (!path.startsWith("#") && !path.startsWith("_")){
        throw new Error("invalid path: "+path)
    }
    path = path.substring(1)

    let author = get(username)

    const location = path.split(".").map(s=>{
        const su = s.split(":")
        if (su.length>1){
            author = su[1]
        }
        return su[0]
    })

    return new PathData(pub,author,location)
}

export function is_uuid(input:string) {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(input)
}