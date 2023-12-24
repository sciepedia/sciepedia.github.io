import { get } from "svelte/store"
import { title_set, updated_title_list } from "./autocomplete"
import { PathData } from "./link"
import { lightmode, searchhist } from "./store"
import { openaisetup } from "./ai"
import { store } from "./data_store"
import { Note } from "./note"


export type searchTag = string | ((x:string)=>boolean) | searchTag[]
function check_tag(tag:searchTag, query:string):boolean{
    
    if (typeof(tag)== "string")return tag.startsWith(query)
    if (typeof(tag)=="function") return tag(query)
    return tag.reduce((p,n)=>(p || check_tag(n, query)),false)
}
export type itemRep = string | ((x:string)=>string)
export type searchItem = {tags: searchTag, rep:itemRep, executor: Function, }

let tools: searchItem[]= [
    {tags:["lightmode", "darkmode"], rep: "⚙️ switch lightmode", executor:()=>{
        lightmode.set(!get(lightmode))
    }},
    {tags:["account", "login", "signup", "sign in", "log out", "sign out", "user account"],rep:"⚙️ account settings", executor:()=>{
        window.location.pathname = "login"
    }},
    openaisetup,
]

let searchspace:searchItem[]

export function setup_search(){
    let notelist:searchItem[] = updated_title_list().map(item=>{
        const pretty = decodeURI(item[0]).replaceAll("_", " ").trimStart()
        const rep = (item[1].pub ? "📃 " : "🔒 ") + pretty.replace(":"," by ")

        return {
            tags:pretty,
            rep,
            executor: ()=> {
                const data = new PathData(item[1].pub, item[1].author, item[1].location)
                const path = data.tostring()
                window.location.search = path.replace("#", "")
                searchhist.update(h => {h[rep] = Date.now();return h})
                console.log(get(searchhist));

            }
        }
    }).sort((a,b)=> (get(searchhist)[b.rep]?? 0) - (get(searchhist)[a.rep] ?? 0));

    searchspace = tools.concat(...notelist) //, ...tools2)
}

export function search(query:string,maxres=10):searchItem[]{

    let res = searchspace
        .filter(item=>check_tag(item.tags, query))
        .slice(0,maxres)
        // .map(item=>{return {rep: typeof(item.rep)=="string" ? item.rep: item.rep(query),executor:item.executor}})
    return res
}

