import { is_http_link, is_link, make_http_link, cleanMarkup } from "./util"
import { Link, get_link, get_path_data, is_link_element, is_typo_element, type PathData } from "./link"
import { Image, image_from_file } from "./image"
import { store, type NoteData, type uuid } from "./data_store"

import { rename_note } from "./renamer"
import { Autocomplete, add_title_completion } from "./autocomplete"
import { code_element, typo_element } from "./spellchecker"
import { username } from "./store"

import { get } from "svelte/store"
import { CommentSection, type CommentElement } from "./comments"

export var title_list:{element:HTMLElement,fullpath:PathData}[] = [] 
export var root = {path:"_home:"+get(username)}
export let autocomplete = new Autocomplete()

let hist: PathData[] = []



export class Note {

    txt:string

    element:HTMLDivElement

    head : Head
    body : Body
    data : NoteData

    constructor(title:string, path?:PathData, creator?:Link, call_hist:string[] = [], BodyType = Body){        

        console.log("new note", path);
        

        if (path==undefined){
            path = get_path_data(title)
        }

        let content = store.getitem(path, newcontent =>{
            this.body.free()
            this.body.render(newcontent.Content)
            this.data.language = newcontent.language
        })

        this.data = content
        if (path.location.includes("js")){
            this.data.language = "js"
        }else if(path.location[path.location.length-1] == "csv"){
            this.data.language = "csv"
            BodyType = TableBody
        }

        
        this.txt = content.Content
        if (this.txt==undefined){
            this.txt = "<error getting content>"
        }

        this.element = document.createElement("div")
        this.element.classList.add("note")
        this.head = new Head(title,get(username),this,creator)

        this.body = new BodyType(this.txt,this,content,call_hist)

        this.element.appendChild(this.head.element)
        this.element.appendChild(this.body.element)
    }

    save(){
        let txt = this.body.get_content_text()
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
                    
                    this.set_title(title)

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
        this.element.spellcheck = false
        this.create_expand_button()

        this.create_share_button()

        {
            let commentbutton = document.createElement("span")
            commentbutton.innerHTML = "comments"
            commentbutton.classList.add("sharebutton")
            commentbutton.classList.add("navbutton")
            commentbutton.addEventListener("click",async(_)=>{
                this.note.body.commentSection.toggle()
            })
            this.element.appendChild(commentbutton)
        }
    }

    set_title(title:string){

        if (title.startsWith("#") || title.startsWith("_")){
            title = title.substring(1)
        }
        const loc = this.note.data.Path.location

        let parts:string[]
        if (title.startsWith("..")){
            parts = title.split(".").slice(2)
        }else if (title.startsWith(".")){
            parts = title.split(".").slice(1)
        }else{   
            parts = loc
        }
        parts = parts.map(p => p.split(":")[0])

        const ht = parts.join(".").replaceAll("_"," ") + (`<span class='author'> by ${this.note.data.Path.author} </span>`)
        this.title_element.innerHTML = ht
    }


    create_share_button(){

        let sharebutton = document.createElement("span")
        sharebutton.innerHTML = "share"
        sharebutton.classList.add("sharebutton")
        sharebutton.classList.add("navbutton")
        sharebutton.addEventListener("click",async(_)=>{

            let name = encodeURI((this.note.data.Path.pub?"":"_")+this.note.data.Path.location.join("."))
            if (!name.includes(":")){
                name += ":" + this.note.data.Path.author
            }
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
            
            this.title = this.note.data.Path.pretty()
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

            root.path = this.note.data.Path.tostring()
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
    content : HTMLDivElement

    commentSection : CommentSection
    txt : string
    owner : Note | CommentElement

    can_write = false
    saves_pending:boolean = false
    comments:uuid[]

    constructor(txt:string,owner:Note|CommentElement,content:NoteData,call_hist:string[] = []){

        this.comments = content.comments?? []

        if (call_hist.length == 0){
            call_hist = [owner.data.Path.tostring()]
        }
        this.txt = txt

        this.element = document.createElement("div")
        this.element.classList.add("body")
        this.element.spellcheck = false
        this.content = document.createElement("div")
        this.content.classList.add("content")
        this.element.appendChild(this.content)

        this.owner = owner
        owner.body = this

        this.can_write = this.owner.data.Path.author == get(username)

        if (txt==""){
            let p = document.createElement("p")
            p.innerHTML = "<br>"
            this.content.appendChild(p)
        }else{
            let lines = txt.split("\n")
            lines.forEach(l=>{
                let p = this.make_line(l)
                this.content.appendChild(p)
            })
        }

        this.content.addEventListener("click",this.on_click)

        this.content.addEventListener("input",e=>this.on_input(e))
        this.content.addEventListener("blur",_=> {if(this.editable)make_editable(null)})
        this.content.addEventListener("paste",this.on_paste);
        this.content.addEventListener("copy",this.on_copy)
        this.content.addEventListener("keydown", (e)=>{
            if (e.key == "Tab"){
                e.preventDefault()
            }            
        })
        this.content.addEventListener("keydown",e=>{
            if (e.key == "Tab" && e.target == this.content){
                const t = document.createTextNode("  ")
                this.insert_text(t)
            }
        })

        const linkstate = store.get_linkstate(this.owner.data.Path)
        
        this.get_links().forEach((link,i)=>{
            
            if(linkstate[i] && !call_hist.includes(link.path.tostring())){
                link.open(call_hist.concat([link.path.tostring()]))
            }
            add_title_completion(link.path)
        })

        this.commentSection = new CommentSection(this, this.owner.data.Path)
    }

    on_click = (e:MouseEvent)=>{
        if ((e.target as HTMLElement).parentElement == this.content || (e.target as HTMLElement) == this.content){
            make_editable(this)
            autocomplete.clear()
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
        if (target != this.content){
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

            const link = new Link(dest,this, false)
            this.insert_text(link.element)


        }else{

            console.log("pasting normal text",paste);
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

        e.preventDefault();
        let selectedText = window.getSelection()!.toString();
        let modifiedText = selectedText.replaceAll("\n\n","\n")
        e.clipboardData!.setData('text/plain', modifiedText);
    }

    render(txt:string){
        this.txt = txt
        this.free()

        if (txt==""){
            let p = document.createElement("p")
            p.innerHTML = "<br>"
            this.content.appendChild(p)
        }else{
            let lines = txt.split("\n")

            lines.forEach(l=>{
                let p = this.make_line(l)
                this.content.appendChild(p)
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
        this.content.innerHTML = ""

    }

    get_links():Link[]{
        let links:Link[] = []
        this.content.childNodes.forEach(p=>{
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

    make_line(txt:string,compact:boolean=true): HTMLElement{

        if (txt == ""){
            let p = document.createElement("p")
            p.innerHTML = "<br>"
            return p
        }
    
        txt = txt.replaceAll(" ", "\xa0")
        txt = txt.replace(/(\S)\u00A0(\S)/g, "$1 $2");
        // let words = txt.split(/(\s+)/);    
        let words = txt.split(/([\s+[\]{}(),])/);
        let p = document.createElement("p")

        let nodes = words.map( (w,i)=>{

            if (is_link(w) && (!w.startsWith(".") || /\s+| | /.test(words[i-1]) || words[i-1] == undefined ) ){
                const link = new Link(w,this,compact)
                return link.element
            }else if(is_http_link(w)){
                return make_http_link(w)
            }else if(w.startsWith("##image:")){
                const img = new Image(w.slice(8))
                return img.element
            }else{
                if (this.owner.data.language == "txt"){
                    const typo = typo_element(w)
                    if (typo != undefined){
                        return typo
                    }
                }else if (this.owner.data.language == "js"){
                    const ret = code_element(w)
                    return ret
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
        if (this.owner.data.language == "js"){return}
        this.content.childNodes.forEach(p=>{
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

        if(this.content.contentEditable != "true"){return}
        if (e.target != this.content){return}

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
            
            this.content.childNodes.forEach(c=>{

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
        this.content.contentEditable = editable.toString()
        this.content.classList.toggle("editable",editable)

        this.content.childNodes.forEach(p=>{

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
        this.content.childNodes.forEach(paragraph => {
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
            }else if ((node as HTMLElement).classList && (node as HTMLElement).classList.contains("image")){

                let img = (node as HTMLImageElement)
                txt += `##image:${img?.src}#${encodeURI(img?.style.width)}`

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


export type scriptLanguage = "js" 

export class ScriptNote extends Note{

    language:scriptLanguage
    outfield:HTMLDivElement

    constructor(title:string, path?:PathData, creator?:Link, call_hist:string[] = []){

        super(title,path, creator,call_hist)
        this.language = "js"
        this.data.language = "js"

        this.body.content.classList.add("js")
        const runbutton = document.createElement("div")
        runbutton.innerHTML = "▶"
        runbutton.classList.add("runbutton")


        const preprun = ()=>{
            function deepsave(b:Body){
                if (b.saves_pending) b.save()
                b.get_links().forEach(l=>{
                    if (l.is_open && l.childnote){
                        deepsave(l.childnote.body)
                    }
                })
            }
            deepsave(this.body)
            runbutton.innerHTML = "O"
            this.outfield.innerHTML = ""

        }
        const execute = ()=>{
            this.execute_script(this.body)
            runbutton.innerHTML = "▶"
        }
        
        runbutton.addEventListener("mousedown", preprun)
        runbutton.addEventListener("click", execute)
        this.body.content.addEventListener("keydown",  (e:KeyboardEvent)=>{
            if (e.key == "Enter" && e.ctrlKey){
                preprun()
                execute()
            }
        })
        this.body.element.appendChild(runbutton)
        this.outfield = document.createElement("div")
        this.outfield.classList.add("content")
        this.outfield.classList.add("js")
        this.body.element.appendChild(this.outfield)
    }


    async get_content_text(body:Body, path:PathData, predefs: {vars:Set<string>, values: Array<[string,string]>}){
        const dat = (await store.getitemblocking(path)).Content

        console.log("dat:",dat);        
        
        const lines = dat.split("\n")
        let lns = (await Promise.all(lines.map(async line=>{

            let words = line.split(/([\s+[\]{}(),])/);

            return (await Promise.all(words.map(async (word,i)=>{
                
                if (is_link(word) && (!word.startsWith(".") || /\s+| | /.test(words[i-1]) || words[i-1] == undefined ) ){

                    const L = new Link(word, body, true)
                    const pstring = L.path.tostring().replaceAll(".", "$").replaceAll(":", "$$$$").replace("#","")

                    if (!predefs.vars.has(pstring)){
                        predefs.vars.add(pstring)

                        const nt = new Note(L.name, L.path,L,[])
                        const link_content = await this.get_content_text(nt.body, L.path, predefs)                        

                        predefs.values.push([pstring, link_content])
                    }
                    return pstring
                }
                return word
            }))).join("")
        })))
        console.log(lns);
        
        let txt = lns.join("\n")

        return txt
    }

    async execute_script(body:Body){

        this.outfield.innerHTML = ""
        // const predefs = new Map<string,string> ()
        const predefs = {vars:new Set<string>,values:new Array<[string,string]>}
        let content = await this.get_content_text(body, body.owner.data.Path, predefs)

        const pref:string[] = []
        let linecount = 0
        let functdict:Map<string,number>  = new Map()
        predefs.values.forEach(i=>{
            const newlines = i[1].match(/\n/g)?.length ?? 0
            pref.push(`${i[0]} = ${i[1]}`)
            functdict.set(i[0], linecount)
            linecount += newlines + 1
        })

        content = "\n" +pref.join("\n") + "\n" + content
        console.log(content);

        window.print = ((...a:any[])=>{this.print(...a)}) as ()=>void

        (window as any).putout = ((element:any)=>{this.outfield.append(element)})
        try {
            const asyncContent = `return async function(){${content}}`
            console.log(asyncContent);

            const fn = Function(asyncContent)()
            let res = await fn()
            if (res != undefined) this.print (res)
        } catch (error) {

    
            let stack = (error as Error).stack?.split("\n");
            console.log(stack?.join("\n"));
            
            this.print("&nbsp;")
            this.print(stack![0])
            stack?.slice(1,-2).forEach(l=>{
                // this.outfield.appendChild(this.body.make_line(l))
                if (l.startsWith("    at ")){
                    let loc = l.slice(7).split(" ",2)[0]
                    let lnum = l.split("<anonymous>:")[1].slice(0,-1)
                    let linenum = Number(lnum.split(":")[0]) - 3 - functdict.get(loc)!
                    l =  "at #" + loc.replace("$$",":").replaceAll("$", ".") + ":" +  linenum
                    this.outfield.appendChild(this.body.make_line(l))
                }else{
                    this.print(l)
                }
            })
            if (stack){
                let l = stack[stack?.length-2]
                console.log(linecount);
                
                let lnum = Number(l.split("<anonymous>:")[1].slice(0,-1).split(":")[0])-linecount - 3
                console.log(lnum)
                this.outfield.appendChild(this.body.make_line("at "+ this.data.Path.tostring() + ":" +lnum))
            }
        }
    }

    print(...texts:any[]){
        const p = document.createElement("p")

        function stringify(t:any):string{

            if (["string", "number", "boolean", "symbol", "undefined", "function"].includes(typeof t) || t == null) return String(t)
            if (t instanceof Array){
                return `[${(t.map(stringify).join(","))}]`
            }

            return JSON.stringify(t)
        }

        p.innerHTML = texts.map(stringify).join(" ")
        this.outfield.appendChild(p)
    }
}


class TableBody extends Body{

    table:HTMLTableElement
    rows:number
    columns:number
    constructor(txt:string,owner:Note|CommentElement,content:NoteData,call_hist:string[] = []){
        super(txt,owner,content,call_hist)

        const nodes = this.content.childNodes

        let container = document.createElement("div")
        let precontainer = document.createElement("div")
        container.classList.add("tablecontainer")
        precontainer.classList.add("supercontainer")

        
        this.table = document.createElement("table")
        this.table.classList.add("tablecontent")
        this.table.append(...nodes)
        this.rows = this.table.childNodes.length
        console.log(this.rows);
        
        this.columns = this.table.childNodes[0].childNodes.length
        this.content.innerHTML = ""


        this.content.append(precontainer)
        precontainer.append(container)

        container.append(this.table)

        const newcolumn = document.createElement("button")
        newcolumn.addEventListener("click", e=>{
            this.table.childNodes.forEach(tr=>{
                tr.appendChild(document.createElement("td"))
            })
            this.columns ++
        })
        newcolumn.classList.add("newcolumn")
        newcolumn.innerHTML = "+"
        container.appendChild(newcolumn)


        const newrow = document.createElement("button")

        newrow.addEventListener("click", e=>{
            let row = document.createElement("tr")
            for (let i=0;i < this.columns;i++){
                row.append(document.createElement("td"))
            }
            this.rows++
            this.table.append(row)
        })

        newrow.innerHTML = "+"
        newrow.classList.add("newrow")

        precontainer.append(newrow)


        this.can_write = false

        this.content.addEventListener("click",(e)=>{
            console.log((e.target as HTMLElement).nodeName);
            if ((e.target as HTMLElement).nodeName == "TD"){
                let target = e.target as HTMLTableCellElement
                target.contentEditable = "true"
                target.focus()
            }
        })

    }

    make_line(txt: string, compact?: boolean): HTMLElement {
        
        const tr = document.createElement("tr")
        for (let cell of txt.split(",")){
            let td = document.createElement("td")
            td.innerHTML = cell
            tr.append(td)
        }
        return tr
    }

    get_content_text(){

        this.table.querySelectorAll("button").forEach(b=>{
            b.remove()
        })

        const table = this.content.querySelector("table")
        let res = ""

        for (let tr of table!.childNodes){
            for (let td of tr.childNodes){
                let i = (td as HTMLTableElement).innerHTML
                // if (i){
                    res += i + ","
                // }
            }
            res = res.slice(0,-1) + "\n"
        }
        res = res.slice(0,-1)
        return res
    }

    async on_input(e: Event) {
        this.save_lazy()
    }
}
