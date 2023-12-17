import { get } from "svelte/store"
import { title_set, updated_title_list } from "./autocomplete"
import { PathData } from "./link"
import { lightmode } from "./store"


type searchItem = {tags: string[], rep:string, executor: Function}

let searchspace: searchItem[]= [
    {tags:["lightmode", "darkmode"], rep: "switch lightmode", executor:()=>{
        lightmode.set(!get(lightmode))
    }},
    {tags:["account", "login", "signup", "sign in", "log out", "sign out", "user account"],rep:"account settings", executor:()=>{
        window.location.pathname = "login"
    }}
]
export function setup_search(){
    let titles = updated_title_list().map(item=>{
        const pretty = decodeURI(item[0]).replaceAll("_", " ")
        return {
            tags:[pretty],
            rep:pretty,
            executor: ()=> {
                const data = new PathData(item[1].pub, item[1].author, item[1].location)
                const path = data.tostring()
                window.location.search = path.replace("#", "")
            }
        }
    })
    searchspace.push(...titles)
}

export type searchResult = {rep:string, executor: Function}

export function search(query:string,maxres=10):searchResult[]{
    return searchspace
        .filter(item=>item.tags.filter(tag=>tag.startsWith(query)).length>0)
        .slice(0,maxres)
        .map(item=>{return {rep:item.rep,executor:item.executor}})
}

