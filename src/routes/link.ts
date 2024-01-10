
import {root, setCaret, title_list} from "./note"

import {Note,Body} from "./note"

import { add_title_completion } from "./autocomplete"
import { username } from "./store"
import { get } from "svelte/store"
import { ScriptNote } from "./note"

export let link_repo = new Map<string,Link>()
let link_counter = 0

export class Link {

    name : string;
    path : PathData;

    public element : HTMLSpanElement;
    public childnote : Note | null = null

    is_open : boolean = false
    parent : Body
    focusline: number | null = null

    constructor(name:string, parent:Body, compact:boolean) {
        
        this.element = document.createElement("span");
        
        this.parent = parent
        this.element.classList.add("link")
        
        this.path = parent.owner.data.Path.create_child(name)
        
        this.name = name;
        this.name.split(":").slice(1).forEach(p=>{
            if (!isNaN(Number(p))) this.focusline = Number(p) - 1
        })
        
        this.element.textContent = name

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
        this.name = new_path.tostring()

        if (!this.expanded && !this.is_open){
            let compact_name = get_compact_link_name(this.name)
            this.element.textContent = compact_name
        }else{
            this.element.textContent = this.name
        }

        this.parent.save_lazy()

        setCaret(this.element,1)

        return this.name
    }

    open(call_hist:string[] = []){
        
        this.is_open = true
        this.element.classList.add("open")

        if (this.path.location.includes("js")){
            this.childnote = new ScriptNote(this.name, this.path,this,call_hist)
        }else{
            this.childnote = new Note(this.name, this.path,this,call_hist)
        }

        const line = this.element.parentElement!
        line.appendChild(this.childnote.element)

        if (this.focusline != null){
            const line = this.childnote.body.element.childNodes[0].childNodes[this.focusline] as HTMLParagraphElement
            line.style.backgroundColor = "var(--brown)"
        }
        
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

            let compact_name = get_compact_link_name(name,!this.parent.owner.data.Path.location.includes("js"))
            this.element.textContent = compact_name
        }else{
            this.element.textContent = this.name
        }
    }
}

export function remove_link_id(id:string){
    link_repo.delete(id)
}

export function get_link(id:string){
    return link_repo.get(id)
}

function get_compact_link_name(path:string, clearunderscore = true){

    let suffix = ""
    let possible_suffixes = [".",":"]
    possible_suffixes.forEach(s=>{
        if (path.endsWith(s)){
            suffix = s
            path = path.slice(0,path.length-1)
        }
    })

    let loc = path.split(":")[0]
    const words = loc.split(".")
    let name = islanguageending(words.slice(-1)[0]) ? words.slice(-2).join(".") : words.slice(-1)[0]

    .replace(/[:].*/g,"")

    const possible_prefixes = ["#","_"]
    possible_prefixes.forEach(p=>{
        if (name.startsWith(p)){
            name = name.slice(1)
        }
    })

    if(clearunderscore) name = name.replaceAll("_"," ")
    
    return name + suffix
}

function islanguageending(s:string){return s.length < 3 || ["csv"].includes(s)}

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
        if (this.location.join(".") == "me") return "@"+this.author
        return (this.pub?"#":"_" )+this.location.join(".")+`:${this.author}`
    }

    relative_path(parent:PathData){
        const parent_log_json = JSON.stringify(parent.location)
        if (parent_log_json == JSON.stringify(this.location.slice(0,parent.location.length))){
            return new PathData(this.pub, this.author, [""].concat(this.location.slice(parent.location.length)))
        }else if(parent.location.length > 2 && JSON.stringify(parent.location.slice(0,-1)) == JSON.stringify(this.location.slice(0,parent.location.length))){
            return new PathData(this.pub,this.author, ["."].concat(this.location.slice(parent.location.length-1)))
        }
        return this
    }

    parent(){
        return this.location.length>1? new PathData(this.pub, this.author,this.location.slice(0,-1)):null
    }

    create_child(title:string){

        if (title.startsWith("@")) return get_path_data(title)

        if (title.endsWith(".") || title.endsWith(":")){
            title = title.slice(0,-1)
        }
        
        if (title.startsWith("#") || title.startsWith("_")){
            return get_path_data(title, this.author)
        }
        if (title.startsWith("..")){
            const parent = this.parent()
            if (parent == null)throw "no parent here for ..path"

            return get_path_data ( parent.tostring()+ title.substring(1), this.author)
        }

        if (title.startsWith(".")){
            const ret = get_path_data(this.tostring() + title, this.author)
            return ret
        }
        throw "invalid path: "+title
    }

    // pretty(){
    //     const res = this.location.join(".")+`<span class='author'> by ${this.author}</span>`
    //     return res
    // }
}

export function get_path_data(path:string, default_author?:string):PathData{

    if (path.startsWith("@")) path = path.replace("@", "#me:")

    let pub = path.startsWith("#")
    if (!path.startsWith("#") && !path.startsWith("_")){
        throw new Error("invalid path: "+path)
    }
    path = path.substring(1)

    let author = default_author ?? get(username)

    const location = path.split(".").map(s=>{
        const su = s.split(":")
        for (let p of su.slice(1)){
            if (isNaN(Number(p))) author=p
        }
        return su[0]
    })    
    return new PathData(pub,author,location)
}

export function is_uuid(input:string) {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(input)
}