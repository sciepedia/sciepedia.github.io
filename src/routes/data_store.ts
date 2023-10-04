

import {getitem,rate,setitem} from "./backend"
import type { PathData } from "./link";
import { is_link } from "./util";


export type NoteData = {Path:PathData, Content:string}

function check_title(title:string){

    if (!is_link(title)){
        throw new Error("illegal title " + title);
    }
}

function is_public(title:string):boolean{
    return title.startsWith("#")
}

function title_to_name(title:string):string{
    return title.slice(1)
}

export let store = {
   
    getitem : (Path:PathData,callback:(s:NoteData)=>void)=>{

        var res:NoteData = {Path, Content:"…"}

        const key = JSON.stringify(Path)

        if (store.has(Path)){
            try{
                res = JSON.parse(localStorage[key]) as NoteData
                
                //check if res is of type NoteData or string
                if (typeof res == "string"){
                    res = {Path, Content:res};
                }
                
            }catch{
                console.warn("error parsing json",localStorage[key])
                res = {Path, Content:"<Error>"};
            }
        }
        getitem(Path).then(content=> {
            console.log('got new content',content);
            
            callback( {...res, Content:content })
        })
        return res

    },
    setitem:(n : NoteData)=>{
        
        const data = JSON.stringify(n)

        const key = JSON.stringify(n.Path)

        localStorage[key] = data
        setitem(n.Path,n.Content)

    },
    set_linkstate:(title:string, state:boolean[])=>{
        localStorage["ls_"+title] = JSON.stringify(state)
    },
    get_linkstate:(title:string)=>{
        let res = localStorage["ls_"+title]
        if (res){
            return JSON.parse(res)
        }else{
            return []
        }
    },
    
    has:(Path:PathData)=>{
        const key = JSON.stringify(Path)
        let found =  localStorage[key]!=undefined ? true : false
        return found
    },
}

