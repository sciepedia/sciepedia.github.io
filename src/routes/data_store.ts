
import { get } from "svelte/store";
import {getiditem, getitem,setitem} from "./backend"
import { PathData, get_path_data } from "./link";
import { is_link } from "./util";
import { is_online } from "./store";

export type uuid = `${string}-${string}-${string}-${string}-${string}`
export type language = 'txt' | 'js' | 'csv'
export type NoteData = {Path:PathData, Content:string, language?:language, comments?:uuid[], id:uuid, comment_of?:uuid}

export let store = {

    getitem : (Path:PathData,callback:(s:NoteData)=>void)=>{

        var res:NoteData = {Path, Content:"…",language:Path.location.slice(-1)[0]=='js'?"js":"txt",id:crypto.randomUUID()}
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
        res.language = Path.location.slice(-1)[0]=='js'?"js":"txt"

        return res
    },

    getitemblocking : async (Path:PathData)=>{
        var res:NoteData | null = {Path, Content:"…",language:Path.location.slice(-1)[0]=='js'?"js":"txt",id:crypto.randomUUID()}
        const key = JSON.stringify(Path)

        if (store.has(Path)){
            try{
                res = JSON.parse(localStorage[key]) as NoteData
            }catch{
                console.warn("error parsing json",localStorage[key])
                res = {Path, Content:"<Error>",id:"----"};
            }
        }else{

            let content = await getitem(Path)//.then(content=> {
                // if (content!=null && (content.Content != res.Content || content!.id != res.id)){
                //     res = {...res, Content:content!.Content, id:content!.id}
                //     localStorage[key] = JSON.stringify(res)
                //     callback(res)
                // }
            // })
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
        res.language = Path.location.slice(-1)[0]=='js'?"js":"txt"

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
            setitem(n)
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
