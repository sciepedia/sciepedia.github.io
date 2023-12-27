import { getContext } from "svelte";
import { store } from "./data_store";
import { Link, PathData } from "./link";
import { Note, type Body } from "./note";
import { is_link } from "./util";



function get_content_text(body:Body, path:PathData, predefs: Map<string, string>){

    const dat = store.getitem(path, ndat=>console.log("new:", ndat)).Content
    const lines = dat.split("\n")

    const txt = lines.map(line=>{

        // const words = line.split(" ")
        const words = line.split(/\s+/)

        return words.map(word=>{
            
            if (is_link(word)){

                const L = new Link(word, body, true)
                const pstring = L.path.tostring().replaceAll(".", "$").replaceAll(":", "$").replace("#","")

                if (!predefs.has(pstring)){
                    predefs.set(pstring, "#")

                    const nt = new Note(L.name, L.path,L,[])
                    const link_content = get_content_text(nt.body, L.path, predefs)
                    predefs.set(pstring, link_content)
                }
                return pstring
            }
            return word
        }).join(" ")
    }).join ("\n")
    return txt    
}


export function execute_script(body:Body){

    const predefs = new Map<string,string> ()
    let content = get_content_text(body, body.owner.data.Path, predefs)

    const pref:string[] = []
    predefs.forEach((a,b)=>{pref.push(`${b} = ${a}`)})

    content = pref.join("\n") + "\n" + content

    console.log(content);

    const fn = Function(content)
    fn()

}

