import { get } from "svelte/store";
import { is_link } from "../controller/util";
import { store, type NoteData, PathData } from "../model/data_store";
import { Link, get_link } from "./link";
import type { Note } from "./note";
import { username } from "../model/store";


let last_editable:TextContent | null
export function make_editable(content:TextContent|null){
    if (content == last_editable)return 
    last_editable?.set_editable(false)
    last_editable = content
    last_editable?.set_editable(true)
}


export class TextContent{

    note:Note
    element:HTMLDivElement
    data: NoteData
    saves_pending: boolean
    constructor(note:Note,path:PathData){
        this.note = note
        this.element = document.createElement("div")
        this.element.classList.add("content")
        note.element.append(this.element)
        this.element.addEventListener("click", (e)=>{
            let target = e.target as HTMLElement
            if (target.classList.contains("link")){
                e.preventDefault()
                return
            }
            while (target.parentElement && !target.classList.contains("content") && !target.classList.contains("note")){
                target = target.parentElement
            }
            if (target == this.element){
                make_editable(this)
            }
        })

        this.element.addEventListener("keydown",(e)=>{
            if (e.key=="Tab" && e.target == this.element){
                e.preventDefault()
                this.insert_text(document.createTextNode("  "))
            }
        })
        this.element.addEventListener("input",(e)=>this.on_input(e))
        this.data = store.getitem(path,newdata=>{})
        this.setText(this.data.Content)
        this.saves_pending = false

        let linkstate=  store.get_linkstate(path)

        this.get_links().forEach((link,i)=>{
            if (linkstate[i] && !this.note.call_hist.includes(link.path)){
                link.set_open(true)
            }
        })

    }

    setText(text:string){
        console.log("newtext", text,this);
        // this.element.textContent = text
        let lines = text.split("\n")

        for (let line of lines){
            this.element.append(this.make_line(line))
        }
    }

    get_text(){
        let lines = []
        for (let p of this.element.children){
            if (p.nodeName == "P"){
                lines.push(this.get_line_text(p as HTMLParagraphElement))
            }
        }
        return lines.join("\n")
    }

    get_line_text(line:HTMLParagraphElement):string{

        // let ret = line.textContent ?? ""
        // console.log(ret);
        // return ret
        
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
            let i  = Number (c)
            let w = words[i]
            if (is_link(w) && (!w.startsWith(".") || /\s+| | /.test(words[i-1]) || words[i-1] == undefined ) ){
                try{
                    const link = new Link(w,this.note)
                    nodes.push(link.element)
                }catch(e){
                    console.log("failed link", w,e);
                    nodes.push(this.make_word(w))
                }
            // }else if(is_http_link(w)){
            //     if (is_youtube_link(w))nodes.push(make_youtube_player(w))
            //     else nodes.push(make_http_link(w))
            // }else if(w.startsWith("##image:")){
            //     const img = new Image(txt.slice(8))
            //     nodes.push(img.element)
            //     break
            }else{
                nodes.push(this.make_word(w))
            }
        }
        nodes.forEach(n=>{
            p.appendChild(n)
        })

        return p
    }

    make_word(t:string){
        return new Text(t)
    }

    on_input(e:Event){

        if(this.element.contentEditable != "true"){return}
        if (e.target != this.element){return}

        if (e.type == "input" && ( ["¨"].includes ((e as InputEvent).data!) )){
            return
        }
        
        // autocomplete.clear()

        const sel = window.getSelection()
        const target = sel?.focusNode! as Node
        var offset = sel?.focusOffset!

        var p: HTMLParagraphElement 

        if (target.nodeName == "P"){
            p = target as HTMLParagraphElement
        }else if (target.nodeName == "DIV"){
            p = target.firstChild as HTMLParagraphElement
        }else if (target.parentElement?.nodeName == "P"){
            p = target.parentElement as HTMLParagraphElement
        }else if (target.parentElement?.parentElement?.nodeName == "P"){
            p = target.parentElement?.parentElement as HTMLParagraphElement
        }else{
            
            this.element.childNodes.forEach(c=>{

                if (c.nodeName != "P"){
                    const newp = document.createElement("p")
                    if (c.nodeName == "DIV"){
                        c.replaceWith(newp)
                        newp.appendChild(c.firstChild!)
                    }else{
                        c.replaceWith(newp)
                        newp.appendChild(c)
                    }
                    put_caret(newp,0)
                }
            })

            return
        }

        if ((e as InputEvent).inputType == "insertParagraph"){

            const prev_p = p.previousElementSibling as HTMLParagraphElement
            
            if (prev_p.lastChild?.textContent == ""){
                prev_p.lastChild?.remove()
            }

            this.reload_line(prev_p)
            // autocomplete.clear()
            p.firstChild?.replaceWith(p.firstChild?.textContent!)
            const newline = this.reload_line(p)
            put_caret(newline,0)
            const pc = prev_p.textContent          
            if (pc){    
                const wspc = pc?.length - pc.trimStart().length + (["{","[","("].includes(pc.slice(-1)) ? 2 : 0)
                if (wspc){
                    this.insert_text(document.createTextNode(" ".repeat(wspc)))
                    put_caret(newline, wspc)
                }
            }
            return
        }        
        
        let txt = this.get_line_text(p)

        if (txt != ""){
            
            let prev:Node|null = target

            if (target.nodeName == "P"){
                
                prev = target.childNodes[offset]
                offset = 0

            }else if (target.parentElement?.nodeName == "SPAN"){
                prev = target.parentElement;
            }

            if (prev == undefined){
                console.warn("prev is undefined");
                return
            }

            prev = prev.previousSibling
            
            while(prev !=null){
                offset += prev.textContent?.length!
                prev = prev.previousSibling
            }
        }else{
            offset = 0
        }

        const newline = this.reload_line(p,txt)

        put_caret(newline,offset)  

        this.save_lazy()
        
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

    save(){
        this.data.Content = this.get_text()
        this.saves_pending = false
        store.setitem(this.data)
    }


    reload_line(p:HTMLParagraphElement,txt?:string){
        if (txt == undefined){
            txt = this.get_line_text(p)
        }
        const newline = this.make_line(txt)//,false)
        p.replaceWith(newline)
        p.childNodes.forEach(c =>{
            if(is_link_element(c)){
                const link = get_link(c as HTMLSpanElement)
                link?.remove()
            }
        })
        return newline
    }


    insert_text(element:Node){

        const selection = window.getSelection()!;
        selection.deleteFromDocument();
        selection.getRangeAt(0).insertNode(element);
        if (element.parentElement instanceof HTMLBRElement){
            element.parentElement.replaceWith(element)
            console.log("replaced br");
        }
        selection.collapseToEnd()

        const range = document.createRange();
        range.selectNodeContents(element);
        range.collapse(false);
        const sel = window.getSelection()!;
        sel.removeAllRanges();
        sel.addRange(range);
    }

    set_editable(value:boolean){
        if (get(username)!=this.data.Path.author) return
        if (value){
            this.element.contentEditable = "true"
            this.element.focus()
        }else{
            this.element.contentEditable = "false"
        }
    }
}

function is_link_element(element:Node){
    return (element instanceof HTMLElement) && element.classList.contains("link")
}

function put_caret(line:HTMLElement, offset:number):Node|null{

    
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
