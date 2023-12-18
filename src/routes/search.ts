import { get } from "svelte/store"
import { title_set, updated_title_list } from "./autocomplete"
import { PathData } from "./link"
import { lightmode, searchhist } from "./store"
import { openaisetup } from "./ai"


export type searchTag = string | ((x:string)=>boolean) | searchTag[]
function check_tag(tag:searchTag, query:string):boolean{
    if (typeof(tag)== "string")return tag.startsWith(query)
    if (typeof(tag)=="function") return tag(query)
    return tag.reduce((p,n)=>(p || check_tag(n, query)),false)
}
export type itemRep = string | ((x:string)=>string)

export type searchItem = {tags: searchTag, rep:itemRep, executor: Function, }

let searchspace: searchItem[]= [
    {tags:["lightmode", "darkmode"], rep: "⚙️ switch lightmode", executor:()=>{
        lightmode.set(!get(lightmode))
    }},
    {tags:["account", "login", "signup", "sign in", "log out", "sign out", "user account"],rep:"⚙️ account settings", executor:()=>{
        window.location.pathname = "login"
    }},
    openaisetup,
    
]
export function setup_search(){
    let titles = updated_title_list().map(item=>{
        const pretty = decodeURI(item[0]).replaceAll("_", " ")

        const rep = (item[1].pub ? "📃 " : "🔒 ") + pretty.replace(":"," by ")

        return {
            tags:[pretty],
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

    searchspace.push(...titles,
        {tags: (s)=>!s.includes(" "), rep:x=>`⚙️ create Page: ${x}`, executor:(x:string)=>{
        console.log("redirect to ",x);

        window.location.search = x
    }})

}

export type searchResult = {rep:string, executor: Function}

export function search(query:string,maxres=10):searchResult[]{
    return searchspace
        .filter(item=>check_tag(item.tags, query))
        .slice(0,maxres)
        .map(item=>{return {rep: typeof(item.rep)=="string" ? item.rep: item.rep(query),executor:item.executor}})
}


import { FalconForCausalLM, env, pipeline } from "@xenova/transformers"

console.log(pipeline);
