import { get } from "svelte/store";
import { cleanMarkup, is_http_link, is_link, is_youtube_link, make_http_link, make_youtube_player } from "../controller/util";
import { store, type NoteData, PathData, get_path_data } from "../model/data_store";
import { Link, get_link } from "./link";
import type { Note } from "./note";
import { username } from "../model/store";
import {Image, image_from_file} from "./image"
import { Content, get_content, is_link_element, put_caret } from "./content";


export let last_focused_content:Content | null = null

export class TextContent extends Content{

    constructor(note:Note){
        super (note)

        this.element.addEventListener("keydown",(e)=>{
            if (e.key=="Tab" && e.target == this.element){
                e.preventDefault()
                this.insert_text(document.createTextNode("  "))
            }
        })

        function get_parent_content(target:HTMLElement){
            while (true){
                if (target.classList && target.classList.contains("content"))break
                target = target.parentNode as HTMLElement
            }
            return target
        }

        this.element.addEventListener("input",(e)=>{
            
            let target = get_parent_content(window.getSelection()?.focusNode as HTMLElement)
            let cont = get_content(target as HTMLDivElement)
            cont?.on_input(e)
        })

        this.element.addEventListener("paste", this.on_paste)

        this.element.contentEditable = String(this.data.Path.author == get(username))
        if (this.element.contentEditable == "false"){
            this.element.addEventListener("click",()=>{
                let path = new PathData(this.data.Path.pub, get(username), this.data.Path.location)
                let newpath = window.prompt(`to edit ${this.data.Path.author}'s note you need to make a copy`, path.tostring())
                if (newpath == null) return
                console.log(newpath);
                // throw "not implemented"
                this.note.rename(get_path_data(newpath))
            })
        }

        let linkstate=  store.get_linkstate(note.path())

        this.get_links().forEach((link,i)=>{
            if (linkstate[i] && !this.note.call_hist.includes(link.path)){
                link.set_open(true)
            }
        })
    }

    set_data(data:NoteData){
        this.element.innerHTML = ""
        this.data = data
        this.setText(this.data.Content)
    }


    setText(text:string){
        // this.element.textContent = text
        let lines = text.split("\n")

        for (let line of lines){
            this.element.append(this.make_line(line))
        }
    }

    on_paste = (event:ClipboardEvent)=>{

        var target = event.target as HTMLElement
        while (target.nodeName != "DIV"){
            target = target.parentElement!
            if (target == null){
                return
            }
        }
        if (target != this.element){
            return
        }

        const clip = event.clipboardData!

        for (var i = 0; i < clip.items.length; i++) {
            if (clip.items[i].type.indexOf('image') !== -1) {

                var blob = clip.items[i].getAsFile();
                if (blob){
                    const img = image_from_file(blob)
                    this.insert_text(img.element)
                }
            }
        }


        let paste = (event.clipboardData )!.getData("text");

        paste = cleanMarkup(paste)

        if (paste.startsWith(window.location.origin) && paste.includes("?")){

            console.log("pasting link");
            event.preventDefault();
            
            let dest = paste.split("?")[1]
            if (!is_link(dest)){
                dest = "#"+dest
            }

            const link = new Link(dest,this.note, false)
            this.insert_text(link.element)


        }else{

            console.log("pasting normal text",paste);
            event.preventDefault();
            this.insert_text(document.createTextNode(paste))

            if (paste.includes("\n")){
                let txt = this.get_text()
                // this.render(txt)
            }
        }
        this.save_lazy()
    }

    on_input(e:Event){
        // this.set_focused(true)
        if (e.type == "input" && ( ["¨"].includes ((e as InputEvent).data!) )){
            return
        }
        
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

    // set_focused(value:boolean){
        
    //     if (value){
    //         if (this == last_focused_content) return
    //         last_focused_content?.set_focused(false)
    //         last_focused_content = this
    //     }
    // }
}

