

import { get } from "svelte/store"
import {getiditem, getitem,setitem} from "./backend"
import { username } from "./store"



export type uuid = `${string}-${string}-${string}-${string}-${string}`
export type language = 'txt' | 'js' | 'py' | 'csv'
export type NoteData = {Path:PathData, Content:string, comments?:uuid[], id:uuid, comment_of?:uuid}



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
        console.log(this,parent);
        
        const parent_log_json = JSON.stringify(parent.location)
        if (parent_log_json == JSON.stringify(this.location.slice(0,parent.location.length))){
            return new PathData(this.pub, this.author, [""].concat(this.location.slice(parent.location.length)))
        }else if(parent.location.length > 2 && JSON.stringify(parent.location.slice(0,-1)) == JSON.stringify(this.location.slice(0,parent.location.length))){
            return new PathData(this.pub,this.author, ["."].concat(this.location.slice(parent.location.length-1)))
        }
        return this
    }

    abbreviated(parent:PathData|null){
        if (parent){

            let rel = this.relative_path(parent)
            if (parent.author == this.author){
                return rel.location.join(".")
            }
            return rel.tostring()
        }
        return this.tostring()
    }

    get_language():language{
        let res:language = "txt"
        for (let item of this.location){
            if (["js","txt","py"].includes(item)){
                res = item as language
            }
        }
        return res
    }

    parent(){
        return this.location.length>1? new PathData(this.pub, this.author,this.location.slice(0,-1)):null
    }


    mini(){
        return this.location.filter(item=>!["","."].includes(item)).join(".")
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
}

export let store = {

    getitem : (Path:PathData,callback:(s:NoteData)=>void)=>{

        var res:NoteData = {Path, Content:"…",id:crypto.randomUUID() as uuid}
        const key = JSON.stringify(Path)

        if (store.has(Path)){
            
            try{
                res = JSON.parse(localStorage[key]) as NoteData
            }catch{
                console.warn("error parsing json",localStorage[key])
                res = {Path, Content:"<Error>",id:"----"};
            }
        }

        getitem(Path).then(content=> {
            if (content!=null && (content.Content != res.Content || content!.id != res.id)){
                res = {...res, Content:content!.Content, id:content!.id}
                localStorage[key] = JSON.stringify(res)
                callback(res)
            }
        })

        if (res != null){
            res.Path = new PathData(res.Path.pub,res.Path.author,res.Path.location)
        }
        return res
    },

    getitemblocking : async (Path:PathData)=>{
        var res:NoteData | null = {Path, Content:"…",id:crypto.randomUUID() as uuid}
        const key = JSON.stringify(Path)

        if (store.has(Path)){
            try{
                res = JSON.parse(localStorage[key]) as NoteData
            }catch{
                console.warn("error parsing json",localStorage[key])
                res = {Path, Content:"<Error>",id:"----"};
            }
        }else{

            let content = await getitem(Path)
            if (content !=null){
                res = {...res, Content:content!.Content, id:content!.id}
                localStorage[key] = JSON.stringify(res)
            }else{
                console.error("got no result for", Path.tostring())
            }
        }

        if (res != null){
            res.Path = new PathData(res.Path.pub,res.Path.author,res.Path.location)
        }

        return res
    },

    getById : (id:uuid, callback:(p:NoteData)=>void)=>{

        const key = 'pid_'+ id
        if (key in localStorage){
            const path = JSON.parse(localStorage[key]) as PathData
            callback(store.getitem(path,callback))
        }else getiditem(id).then (d => {
            if (d==null)throw new Error ("no data found: "+id)

            localStorage[key] = JSON.stringify(d.Path)
            localStorage[JSON.stringify(d.Path)] = JSON.stringify(d)
            callback(d)
        })
    },
   
    setitem:(n : NoteData)=>{    
        
        const key = JSON.stringify(n.Path)
        const data = JSON.stringify(n)

        localStorage[key] = data

        if (n.Path.author != "me"){
            try{
                setitem(n)
            }catch (e){
                throw e
            }      
        }
    },
    
    set_linkstate:(path:PathData, state:boolean[])=>{
        localStorage["ls_"+JSON.stringify(path)] = JSON.stringify(state)
    },
    get_linkstate:(path:PathData):boolean[]=>{
        let res = localStorage["ls_"+JSON.stringify(path)]
        if (res){
            return JSON.parse(res) as boolean[]
        }else{
            return []
        }
    },
    
    has:(Path:PathData)=>{
        const key = JSON.stringify(Path)
        let found =  localStorage[key]!=undefined ? true : false
        return found
    },

    hascomment:(id:uuid)=>{
        return id in localStorage
    }
}
