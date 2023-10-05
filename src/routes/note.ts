import { is_http_link, is_link, make_http_link } from "./util"

import { Link, get_link, get_path_data, is_link_element, is_typo_element } from "./link"
import { store } from "./data_store"
import { cleanMarkup } from "./UX"

import { rename_note } from "./renamer"
import { Autocomplete, add_title_completion } from "./autocomplete"
import { typo_element } from "./spellchecker"
import { username } from "./store"

import { get } from "svelte/store"

export var title_list:{element:HTMLElement,fullpath:string}[] = [] 
export var root = {path:"_home:"+get(username)}
let hist: string[] = []
export let autocomplete = new Autocomplete()


export class Note {
    
    // title:string
    path:string

    txt:string

    element:HTMLDivElement

    head : Head
    body : Body
    username: string

    constructor(title:string, path?:string, creator?:Link, call_hist:string[] = []){

        // this.title = title
        if (path==undefined){
            path = title
        }
        this.path = path

        const pathdata = get_path_data(path)
        this.username = pathdata.author

        let content = store.getitem(pathdata, newcontent =>{
            this.body.free()
            this.body.render(newcontent.Content)
        })
        
        this.txt = content.Content
        if (this.txt==undefined){
            this.txt = "<error getting content>"
        }

        this.element = document.createElement("div")
        this.element.classList.add("note")

        this.head = new Head(title,get(username),this,creator)
        this.body = new Body(this.txt,this,path,call_hist)

        this.element.appendChild(this.head.element)
        this.element.appendChild(this.body.element)
    }

    close(){
        
        this.body.save()
        this.body.free()
        this.element.remove()
    }
}

export class Head {
    
    element : HTMLDivElement
    title : string = ""

    title_element : HTMLElement
    note : Note
    istop : boolean
    username :string = ""
    
    constructor(title:string, username:string, parent:Note, creator?:Link){
        this.title_element = document.createElement("span")
        this.title_element.classList.add("title")
        this.note = parent

        this.username = username

        if (creator!=undefined){
            this.title_element.addEventListener("click",(_)=>{

                rename_note(this.note.path).then((newpath)=>{
                    this.note.path = newpath
                    const new_title = creator.rename(newpath)
                    
                    this.set_title(new_title)

                    this.note.body.get_links().forEach((link)=>{
                        if (link.name.startsWith(".")){
                            link.close()
                            link.rename(link.path)
                        }
                    })
                    this.note.body.save_lazy()
                })
            })
        }

        this.set_title(title)
        this.istop = creator==undefined

        this.element = document.createElement("div")
        this.element.classList.add("head")
        this.create_expand_button()

        // if (this.username){ // author tag
        //     let authorbutton = document.createElement("span")
        //     authorbutton.innerHTML = `by ${this.username}`
        //     // sharebutton.classList.add("navbutton")
        //     // authorbutton.classList.add("sharebutton")
        //     authorbutton.classList.add("navbutton")
        //     this.element.appendChild(authorbutton)
    
        // }

        this.create_share_button()
    }


    set_title(title:string){

        title = pretty_path(title)
        title = title.replaceAll("_", " ")
        if (title.endsWith(":")){
            title = title.slice(0,-1)
        }
        this.title_element.innerHTML = title
        this.title = title
    }

    create_share_button(){

        let sharebutton = document.createElement("span")
        sharebutton.innerHTML = "share"
        // sharebutton.classList.add("navbutton")
        sharebutton.classList.add("sharebutton")
        sharebutton.classList.add("navbutton")
        sharebutton.addEventListener("click",async(_)=>{

            let name = this.note.path.startsWith("#") ? this.note.path.slice(1) : this.note.path
            await navigator.clipboard.writeText(location.origin + "?"+name);
            sharebutton.innerHTML = "copied"
        })
        this.element.appendChild(sharebutton)
        
    }

    create_expand_button(){
        
        const expandbutton = document.createElement("span")
        expandbutton.classList.add("expandbutton")
        expandbutton.classList.add("navbutton")

        this.element.appendChild(expandbutton)

        const page = document.querySelector("#page")!

        const revertroot = (_:MouseEvent)=>{
            
            page.removeChild(page.firstChild!)
            hist.pop()
            let root = hist[hist.length-1]

            let base_note = new Note(root,root)
            page.append(base_note.element)
            title_list = [{element:base_note.head.title_element,fullpath:root}]

            let newUrl = window.location.protocol + '//' + window.location.host + window.location.pathname + '?' + root.slice(1)
            window.history.pushState({path: newUrl}, '', newUrl)

        }

        const setroot = (_:MouseEvent)=>{
            
            this.title = pretty_path(this.note.path)
            this.title_element.innerHTML = this.title

            page.removeChild(page.firstChild!)
            page.appendChild(this.note.element)

            expandbutton.innerHTML = "⇦"
            
            hist.push(this.note.path)
            expandbutton.removeEventListener("click",setroot)
            expandbutton.addEventListener("click",revertroot)
            expandbutton.focus()

            let location = window.location.origin + "?" + this.note.path.slice(1)

            let newUrl = window.location.protocol + '//' + window.location.host + window.location.pathname + '?' + this.note.path.slice(1)
            window.history.pushState({path: newUrl}, '', newUrl);

            root.path = this.note.path

        }


        if(!this.istop){
            expandbutton.innerHTML = "⇨"
            expandbutton.addEventListener("click",setroot)
        }else{
            if(hist.length>1){
                expandbutton.innerHTML =  "⇦"
            expandbutton.addEventListener("click",revertroot)

            }else{
                hist.push(this.note.path)
            }
        }
        this.element.appendChild(this.title_element)
    }
}

var last_editable : Note | null = null

export function make_editable (target:Note|null){

    if (target == last_editable){
        return
    }
    
    if (last_editable != null){

        last_editable.body.set_editable(false)
    }
    if (target != null){
        target.body.set_editable(true)
    }
    last_editable = target
}

export class Body {
    
    element : HTMLDivElement
    txt : string
    note : Note
    can_write = false
    
    saves_pending:boolean = false

    constructor(txt:string,parent:Note,path:string,call_hist:string[] = []){

        if (call_hist.length == 0){
            call_hist = [parent.path]
        }
        this.txt = txt
        
        this.element = document.createElement("div")
        this.element.classList.add("content")

        this.note = parent

        this.can_write = parent.username == get(username)

        if (txt==""){
            let p = document.createElement("p")
            p.innerHTML = "<br>"
            this.element.appendChild(p)
        }else{
            let lines = txt.split("\n")

            lines.forEach(l=>{
                let p = this.make_line(l)
                this.element.appendChild(p)
            })
        }

        this.element.addEventListener("click",e=>{
            if ((e.target as HTMLElement).parentElement == this.element || (e.target as HTMLElement) == this.element){
                make_editable(this.note)
                autocomplete.clear()
            }
        })

        this.element.addEventListener("input",e=>this.on_input(e))
        this.element.addEventListener("blur",_=> {if(this.editable)make_editable(null)})
        this.element.addEventListener("paste",this.on_paste);
        this.element.addEventListener("copy",this.on_copy)

        const linkstate = store.get_linkstate(path)
        this.get_links().forEach((link,i)=>{
            if(linkstate[i] && !call_hist.includes(link.path)){
                link.open(call_hist.concat([link.path]))
            }
            add_title_completion(link.path)
        })
    }

    on_paste = (event:ClipboardEvent)=>{
            
        // is paste in this element?
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

        let paste = (event.clipboardData )!.getData("text");

        paste = cleanMarkup(paste)

        if (paste.startsWith(window.location.origin) && paste.includes("?")){

            console.log("pasting link");
            
            event.preventDefault();
            
            let dest = paste.split("?")[1]
            if (!is_link(dest)){
                dest = "#"+dest
            }

            if (dest.startsWith(this.note.path) && dest.length > this.note.path.length){
                dest = dest.substring(this.note.path.length)
            }else{
                if (this.note.path.includes(".")){
                    const prepath = this.note.path.split(".").slice(0,-1).join(".")
                    if (dest.startsWith(prepath)&& dest.length > prepath.length){
                        dest = "."+dest.substring(prepath.length)
                    }
                }
            }
            
            const link = new Link(dest,this.note, false)
            this.insert_text(link.element)

        }else{

            console.log("pasting normal text",paste);
            //pasting normal text
            
            event.preventDefault();

            this.insert_text(document.createTextNode(paste))

            if (paste.includes("\n")){
                let txt = this.get_content_text()
                this.render(txt)
            }
        }
        this.save_lazy()
    }

    on_copy(e:ClipboardEvent){

        // Prevent the default Range.set action
        e.preventDefault();

        // Get the selected text
        let selectedText = window.getSelection()!.toString();

        // Modify the selected text
        let modifiedText = selectedText.replaceAll("\n\n","\n")

        // Copy the modified text to the clipboard
        e.clipboardData!.setData('text/plain', modifiedText);
    }

    render(txt:string){
        this.txt = txt
        this.free()

        if (txt==""){
            let p = document.createElement("p")
            p.innerHTML = "<br>"
            this.element.appendChild(p)
        }else{
            let lines = txt.split("\n")

            lines.forEach(l=>{
                let p = this.make_line(l)
                this.element.appendChild(p)
            })
        }
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

        //put caret at end of inserted element
        const range = document.createRange();
        range.selectNodeContents(element);
        range.collapse(false);
        const sel = window.getSelection()!;
        sel.removeAllRanges();
        sel.addRange(range);

    }

    free(){

        const links = this.get_links()

        links.forEach(l=>{
            l.remove()
        })
        this.element.innerHTML = ""

    }

    get_links():Link[]{
        let links:Link[] = []
        this.element.childNodes.forEach(p=>{
            p.childNodes.forEach(n=>{
                if (is_link_element(n)){
                    const link = get_link((n as HTMLSpanElement).id)
                    if (link != null){
                        links.push(link)
                    }
                }
            })
        })
        return links
    }

    make_line(txt:string,compact:boolean=true){

        if (txt == ""){
            let p = document.createElement("p")
            p.innerHTML = "<br>"
            return p
        }
    
        //first make all space to nonbreak space
        txt = txt.replaceAll(" ", "\xa0")

        //now make spaces between words breakable again :)
        txt = txt.replace(/(\S)\u00A0(\S)/g, "$1 $2");
    
        // let words = txt.split(" ")
        let words = txt.split(/(\s+)/);
    
        let p = document.createElement("p")
    
        let nodes = words.map( w=>{
            
            if (is_link(w)){
                const link = new Link(w,this.note,compact)
                return link.element
            }else if(is_http_link(w)){
                return make_http_link(w)
            }else {

                const typo = typo_element(w)
                if (typo != undefined){
                    return typo
                }
                return new Text(w)
            }
        })
        
        nodes.forEach(n=>{
            p.appendChild(n)
        })

        return p
    }

    spellcheck(){

        this.element.childNodes.forEach(p=>{
            if (p.nodeName == "P"){
                p.childNodes.forEach(node=>{

                    if (node.nodeType == Node.TEXT_NODE){

                        const typo = typo_element(node.textContent!)
                        if (typo != undefined){
                            node.replaceWith(typo)
                            return
                        }
                    }
                })
            }
        })
    }

    async on_input(e:Event){


        if(this.element.contentEditable != "true"){return}

        if (e.target != this.element){return}
        
        if (e.type == "input" && ( ["¨"].includes ((e as InputEvent).data!) )){
            return
        }
        autocomplete.clear()

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
            autocomplete.clear()
            p.firstChild?.replaceWith(p.firstChild?.textContent!)
            const newline = this.reload_line(p)
            put_caret(newline,0)
            return
        }        
        
        let txt = this.get_line_text(p)

        if (txt != ""){
            
            let prev:Node|null = target

            if (target.nodeName == "P"){
                
                prev = target.childNodes[offset]
                offset = 0
            // }else if (is_link_element(target.parentElement!)){
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

        const current = put_caret(newline,offset)  

        this.save_lazy()
        
        if (current != null && e.type == "input"){

            if (is_link_element(current) ){
                autocomplete.create(current as HTMLSpanElement)
            }
        }
    }

    reload_line(p:HTMLParagraphElement,txt?:string){
        if (txt == undefined){
            txt = this.get_line_text(p)
        }
        const newline = this.make_line(txt,false)
        p.replaceWith(newline)
        p.childNodes.forEach(c =>{
            if(is_link_element(c)){
                const link = get_link((c as HTMLSpanElement).id)
                link?.remove()
            }
        })
        return newline
    }

    editable = false
    set_editable(editable:boolean){
        if (!this.can_write){return}
        this.editable = editable
        this.element.contentEditable = editable.toString()
        this.element.classList.toggle("editable",editable)

        this.element.childNodes.forEach(p=>{

            if (p.nodeName == "P"){
                p.childNodes.forEach(node=>{

                    if (is_link_element(node)){
                        let span = node as HTMLSpanElement
                        get_link(span.id)?.set_expanded(editable)
                    }
                })
            }
        })
    }

    save(){
        let txt = this.get_content_text()
        store.setitem({Path: get_path_data(this.note.path),Content:txt})
        this.saves_pending = false
    }

    save_linkstate(){
        const linkstate:boolean[] = []
        const links = this.get_links()
        links.forEach(l=>linkstate.push(l.is_open))
        store.set_linkstate(this.note.path,linkstate)
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

    get_content_text():string{

        let lines:string[] = []
        this.element.childNodes.forEach(paragraph => {
            if (paragraph.nodeName == "P"){
                
                lines.push(this.get_line_text(paragraph as HTMLParagraphElement))
            }
        });
        
        let txt = lines.join("\n")
        return txt
    }

    get_line_text(line:HTMLParagraphElement):string{
        let txt = ""

        const autocomplete_was_active = autocomplete.open
        if (autocomplete_was_active){
            autocomplete.clear()
        }
        line.childNodes.forEach(node=>{
            
            if(is_link_element(node)){
                let span = node as HTMLSpanElement
                const link = get_link(span.id)
                if (link == undefined){
                    txt += ""
                }else if (link?.expanded){
                    txt += node.textContent!
                }else{
                    txt += link?.name
                }
            }else if (node.nodeName == "#text" || node.nodeName == "SPAN"){
                txt+= node.textContent!
            }
        })
        if (autocomplete_was_active){
            autocomplete.restore()
        }
        return txt
    }
}


function put_caret(line:HTMLParagraphElement, offset:number):Node|null{

    
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
    }else{
        
    }

    setCaret(next!,offset)

    return link
    // next?.after(pred)
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

export function pretty_path (path:string):string{

    if (path.startsWith("..")){
        path = path.slice(2)
    }else if (path.startsWith("#") || path.startsWith("_") || path.startsWith(".")){
        path = path.slice(1)
    }
    let author = ""

    let all_parts = path.split(".")
    .map(part=>part.split("@")[0])
    .map(part=>{
        const s = part.split(":")
        if (s.length>1){
            author = s[1]
        }
        return part.split(":")[0]
    })

    .join(".")

    if (author!=""){

        const authortag = "<span class='author'> by "+author+"</span>"
        all_parts += authortag
    }

    return all_parts
}
