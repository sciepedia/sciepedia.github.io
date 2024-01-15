
import type { Note } from "./note";
import { store, type NoteData } from "../model/data_store";

import { Link, get_link } from "./link";
import { is_http_link, is_link, is_youtube_link, make_http_link, make_youtube_player } from "../controller/util";
import {Image} from "./image"


export abstract class Content{

    note:Note
    element:HTMLDivElement
    data:NoteData
    saves_pending:boolean
    constructor(note:Note){
        this.note = note
        this.element = document.createElement("div")
        this.element.classList.add("content")
        note.element.append(this.element)

        this.data = store.getitem(note.path(),newdata=>{
            this.set_data(newdata)
        })
        this.set_data (this.data)

        repoCounter ++ 
        this.element.id = `C${repoCounter}`
        contentRepo.set(this.element,this)
        this.saves_pending = false
    }

    set_data(data:NoteData){
        throw "not implemented"
    }

    on_input(e:Event){}


    get_text(){
        let lines = []
        for (let p of this.element.children){
            if (p.nodeName == "P"){
                lines.push(this.get_line_text(p as HTMLParagraphElement))
            }
        }
        return lines.join("\n")
    }


    save(){
        this.data.Content = this.get_text()
        this.saves_pending = false
        store.setitem(this.data)
    }


    save_linkstate(){
        let linkstate:boolean[] = []
        this.get_links().forEach(link=>linkstate.push(link.open))
        store.set_linkstate(this.note.path(),linkstate)
    }

    save_lazy(){
    
        if (this.saves_pending){
            return
        }
        this.saves_pending = true
        setTimeout(()=>{
            if(!this.saves_pending){return}
            this.save()
        },1000)
    }

    get_links(){
        let links:Link[] = []
        this.element.childNodes.forEach(p=>{
            if (p.nodeName =="P"){
                p.childNodes.forEach(n=>{
                    if (is_link_element(n)){
                        let link = get_link(n as HTMLSpanElement)
                        if (link) links.push(link)
                    }
                })
            }
        })
        return links
    }



    get_line_text(line:HTMLParagraphElement):string{
        
        let txt = ""
        
        line.childNodes.forEach(node=>{
            
            if(is_link_element(node)){
                let span = node as HTMLSpanElement
                const link = get_link(span)
                if (link == undefined){
                    txt += ""
                // }else if (link?.expanded){
                //     txt += node.textContent!
                }else{
                    txt += span.textContent
                }
            }else if ((node as HTMLElement).classList && (node as HTMLElement).classList.contains("image")){

                let img = (node as HTMLImageElement)
                console.log(img?.style.width);
                
                txt += `##image:${img?.src}#${encodeURI(img?.style.width)}`
                console.log(txt);
                
            }else if((node as HTMLElement).classList && (node as HTMLElement).classList.contains("youtubeplayer")){
                txt += (node as HTMLIFrameElement).src
            }else if (node.nodeName == "#text" || node.nodeName == "SPAN"){
                txt+= node.textContent!
            }
            
        })

        return txt
    }


    make_word(t:string){
        return new Text(t)
    }


    make_line(txt:string,compact:boolean=true): HTMLElement{

        if (txt == ""){
            let p = document.createElement("p")
            p.innerHTML = "<br>"
            return p
        }
    
        txt = txt.replaceAll(" ", "\xa0")
        txt = txt.replace(/(\S)\u00A0(\S)/g, "$1 $2");

        let words = txt.split(/([\s+[\]{}(),])/);
        let p = document.createElement("p")
        let nodes:Node[] = []

        for (let c in words){
            // let i  = +c
            let w = words[c]
            if (is_link(w) && (!w.startsWith(".") || /\s+| | /.test(words[+c-1]) || words[+c-1] == undefined ) ){
                try{
                    const link = new Link(w,this.note)
                    nodes.push(link.element)
                }catch(e){
                    console.log("failed link", w,e);
                    nodes.push(this.make_word(w))
                }
            
            }else if(is_http_link(w)){
                if (is_youtube_link(w))nodes.push(make_youtube_player(w))
                else nodes.push(make_http_link(w))
            }else if(w.startsWith("##image:")){
                const img = new Image(txt.slice(8))
                nodes.push(img.element)
                break
            }else{
                nodes.push(this.make_word(w))
            }
        }
        nodes.forEach(n=>{
            p.appendChild(n)
        })
        
        return p
    }
}


let contentRepo = new WeakMap<HTMLDivElement, Content> ()
let repoCounter = 0


export function is_link_element(element:Node){
    return (element instanceof HTMLElement) && element.classList.contains("link")
}

export function get_content(div: HTMLDivElement){
    return contentRepo.get(div)
}




export function put_caret(line:HTMLElement, offset:number):Node|null{

    
    let next = line.firstChild
    while (offset > next?.textContent?.length!)
    {
        offset -= next?.textContent?.length!
        next = next?.nextSibling!
    }

    let link = null

    if (next != null){

        if (next.nodeName == "SPAN"){
            
            link = next as Node
            next = next.firstChild
        }else{
            
            link = next
        }
    }

    setCaret(next!,offset)
    return link
}

export function setCaret(node:Node,offset:number) {

    var range = document.createRange()
    var sel = window.getSelection()

    try{

        range.setStart(node , offset)
        
        range.collapse(true)
    }catch(e){
    }

    if (sel!=null){
        
        sel.removeAllRanges()
        sel.addRange(range)
    }
}
