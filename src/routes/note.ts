import { is_http_link, is_link, make_http_link, cleanMarkup } from "./util"
import { Link, get_link, get_path_data, is_link_element, is_typo_element, type PathData } from "./link"
import { store, type NoteData, type uuid } from "./data_store"

import { rename_note } from "./renamer"
import { Autocomplete, add_title_completion } from "./autocomplete"
import { typo_element } from "./spellchecker"
import { username } from "./store"

import { get } from "svelte/store"
import type { CommentElement } from "./comments"
import { insert_hydration } from "svelte/internal"
export var title_list:{element:HTMLElement,fullpath:PathData}[] = [] 
export var root = {path:get_path_data("_home:"+get(username))}
let hist: PathData[] = []
export let autocomplete = new Autocomplete()


export class Note {
    
    // title:string

    txt:string

    element:HTMLDivElement

    head : Head
    body : Body
    data : NoteData

    constructor(title:string, path?:PathData, creator?:Link, call_hist:PathData[] = []){        

        if (path==undefined){
            path = get_path_data(title)
        }

        let content = store.getitem(path, newcontent =>{
            this.body.free()
            this.body.render(newcontent.Content)
        })
        this.data = content
        
        this.txt = content.Content
        if (this.txt==undefined){
            this.txt = "<error getting content>"
        }

        this.element = document.createElement("div")
        this.element.classList.add("note")
        this.head = new Head(title,get(username),this,creator)

        this.body = new Body(this.txt,this,content,call_hist)
        this.element.appendChild(this.head.element)
        this.element.appendChild(this.body.element)
    }

    save(){
        let txt = this.body.get_content_text()
        console.log("saving", this);
        this.data.Content = txt
        store.setitem(this.data)
    }

    close(){
        this.save()
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

                rename_note(this.note.data.Path).then((newpath)=>{
                    this.note.data.Path = newpath
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

        this.create_share_button()
    }


    set_title(title:string){

        title = title
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

            let name = (this.note.data.Path.pub?"_":"")+this.note.data.Path.location.join(".")
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

            let base_note = new Note(root.location[root.location.length-1],root)
            page.append(base_note.element)
            title_list = [{element:base_note.head.title_element,fullpath:root}]

            let newUrl = window.location.protocol + '//' + window.location.host + window.location.pathname + '?' + root.location.join(".")
            window.history.pushState({path: newUrl}, '', newUrl)

        }

        const setroot = (_:MouseEvent)=>{
            
            this.title = pretty_path(this.note.data.Path)
            this.title_element.innerHTML = this.title

            page.removeChild(page.firstChild!)
            page.appendChild(this.note.element)

            expandbutton.innerHTML = "⇦"
            
            hist.push(this.note.data.Path)
            expandbutton.removeEventListener("click",setroot)
            expandbutton.addEventListener("click",revertroot)
            expandbutton.focus()



            let newUrl = window.location.protocol + '//' + window.location.host + window.location.pathname + '?' + this.note.data.Path.location.join(".")
            window.history.pushState({path: newUrl}, '', newUrl);

            root.path = this.note.data.Path
        }

        if(!this.istop){
            expandbutton.innerHTML = "⇨"
            expandbutton.addEventListener("click",setroot)
        }else{
            if(hist.length>1){
                expandbutton.innerHTML =  "⇦"
            expandbutton.addEventListener("click",revertroot)

            }else{
                hist.push(this.note.data.Path)
            }
        }
        this.element.appendChild(this.title_element)
    }
}

var last_editable : Body | null = null

export function make_editable (target:Body|null){

    if (target == last_editable){
        return
    }
    
    if (last_editable != null){

        last_editable.set_editable(false)
    }
    if (target != null){
        target.set_editable(true)
    }
    last_editable = target
}

export class Body {
    
    element : HTMLDivElement
    txt : string
    owner : Note | CommentElement

    can_write = false
    
    saves_pending:boolean = false

    comments:uuid[]

    constructor(txt:string,owner:Note|CommentElement,content:NoteData | NoteData,call_hist:PathData[] = []){

        console.log(txt);
        
        this.comments = content.comments?? []

        if (call_hist.length == 0){
            call_hist = [owner.data.Path]
        }
        this.txt = txt

        this.element = document.createElement("div")
        this.element.classList.add("content")

        this.owner = owner
        owner.body = this

        this.can_write = this.owner.data.Path.author == get(username)

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
                make_editable(this)
                autocomplete.clear()
            }
        })

        this.element.addEventListener("input",e=>this.on_input(e))
        this.element.addEventListener("blur",_=> {if(this.editable)make_editable(null)})
        this.element.addEventListener("paste",this.on_paste);
        this.element.addEventListener("copy",this.on_copy)

        const linkstate = store.get_linkstate(this.owner.data.Path)
        
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


            // if (dest.startsWith(this.owner.path) && dest.length > this.owner.path.length){
            //     dest = dest.substring(this.owner.path.length)
            // }else{
            //     if (this.owner.path.includes(".")){
            //         const prepath = this.owner.path.split(".").slice(0,-1).join(".")
            //         if (dest.startsWith(prepath)&& dest.length > prepath.length){
            //             dest = "."+dest.substring(prepath.length)
            //         }
            //     }
            // }
            
            const link = new Link(dest,this, false)
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
                const link = new Link(w,this,compact)
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
        this.owner.save()
        this.saves_pending = false
    }

    save_linkstate(){
        const linkstate:boolean[] = []
        const links = this.get_links()
        links.forEach(l=>linkstate.push(l.is_open))
        store.set_linkstate(this.owner.data.Path,linkstate)
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

export function pretty_path (path:PathData):string{

    let res = path.location.join(".")

    const authortag = "<span class='author'> by "+path.author+"</span>"
    res += authortag


    return res
}
