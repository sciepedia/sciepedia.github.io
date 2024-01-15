
import { exclude_internal_props } from "svelte/internal";
import { store, type PathData } from "../model/data_store";
import { Content } from "./content";
import { Note } from "./note";
import { Link } from "./link";
import { is_link } from "../controller/util";
import { TextContent } from "./textContent";

export class ScriptContent extends TextContent{
    outfield:HTMLDivElement
    constructor(note:Note){
        super(note)
        this.element.classList.add("js")
        this.element.spellcheck = false

        let runbutton = document.createElement("div")
        runbutton.classList.add("runbutton")
        runbutton.textContent = "▶"
        runbutton.contentEditable = "false"
        runbutton.addEventListener("click",async (e)=>{
            runbutton.textContent = "O"
            await this.execute()
            runbutton.textContent = "▶"

        })
        this.element.addEventListener("keydown",(e)=>{
            console.log(e);
            if (e.ctrlKey && e.key == "Enter"){
                runbutton.textContent = 'O'
                console.log("start running");
                
                this.execute()
                runbutton.textContent = "▶"
            }
        })
        this.element.parentElement!.append(runbutton)
        this.outfield = document.createElement("div")
        this.outfield.classList.add("content")
        this.outfield.contentEditable = "false"
        this.element.parentElement!.append(this.outfield)
    }


    make_word(word:string){

        let res : Text | HTMLSpanElement = new Text(word)
        syntaxclasses.forEach(i=>{
    
            if (i.pattern(word)){
                res = document.createElement("span")
                res.textContent = word
                res.style.color = i.color
            }
        })
        return res
    
    }


    async get_flat_text(rawtext:string, body:ScriptContent):Promise<[string,[string,Link][]]>{

        rawtext = rawtext.replaceAll(/print\s*\(/g, `print(`)
        const lines = rawtext.split("\n")
        let links:[string, Link][] = []
        let lns = (await Promise.all(lines.map(async (line,lineidx)=>{

            if (/print\s*\(/.test(line)){

                line = line.replaceAll(/print\s*\(/g, `print('${body.data.Path.tostring()}:${lineidx+1}',`)
            }

            if (line.trimStart().startsWith("//")) return

            let words = line.split(/([\s+[\]{}(),])/);

            return (await Promise.all(words.map(async (word,i)=>{
                
                if (is_link(word) && (!word.startsWith(".") || /\s+| | /.test(words[i-1]) || words[i-1] == undefined ) ){

                    const L = new Link(word, body.note, true)
                    const pstring = L.path.tostring().replaceAll(".", "$").replaceAll(":", "$$$$").replace("#","")
                    links.push([pstring,L])
                    return pstring
                }
                
                return word
            }))).join("")
        }))).filter(l=>!l?.startsWith("//")).join("\n")
        return [lns, links]
    }

    async get_content_text(body:ScriptContent, path:PathData, predefs: {vars:Set<string>, values: Array<[string,string]>}){

        const dat = (await store.getitemblocking(path)).Content

        let [txt,lnks] = await this.get_flat_text(dat,body)

        for (let [pstring, L]  of lnks){
            if (!predefs.vars.has(pstring)){
                predefs.vars.add(pstring)
                const nt = new Note(L.path, L)
                const link_content = await this.get_content_text(nt.content as ScriptContent, L.path, predefs)
                predefs.values.push([pstring, link_content])
            }
        }
        return txt
    }

    async execute(){
        this.save()
        this.outfield.innerHTML = ""
        
        window.print = (...x:any[])=>{this.print(...x)}
        (window as any).putout = (x:any)=>this.outfield.append(x)

        let predefs = {vars:new Set<string>, values: new Array<[string,string]>()}


        let code = await this.get_content_text(this,this.data.Path,predefs)
        
        for (let [name, payload] of predefs.values){
            code = `${name} = ${payload};\n`+ code
        }
        console.log(code);
        
        try{
            let fn = Function(`return async()=>{${code}}`)()
            let res = await fn()
            console.log(res);
            
            this.print(res)
        }catch (e){

            console.error(e)
        }

    }

    print(...args:any[]){
        let loc = args[0]
        args = args.slice(1)

        
        let p = document.createElement("p")
        if(loc!=undefined){
            let L = new Link(loc,this.note)
            L.element.style.float = "right"
            p.append(L.element)
        }
        for (let arg of args){

            p.append(parse(arg))
            p.append(document.createTextNode(" "))
        }
        this.outfield.append(p)
    }
}


let scriptKeywords = ['abstract', 'arguments', 'await', 'boolean', 'break', 'byte', 'case', 'catch', 'char', 'class', 'const', 'continue', 'debugger', 'default', 'delete', 'do', 'double', 'else', 'enum', 'eval', 'export', 'extends', 'false', 'final', 'finally', 'float', 'for', 'function', 'goto', 'if', 'implements', 'import', 'in', 'instanceof', 'int', 'interface', 'let', 'long', 'native', 'new', 'null', 'package', 'private', 'protected', 'public', 'return', 'short', 'static', 'super', 'switch', 'synchronized', 'this', 'throw', 'throws', 'transient', 'true', 'try', 'typeof', 'var', 'void', 'volatile', 'while', 'with', 'yield']



function parse(t:any):HTMLElement{

    console.log("parse", t);
    
    let is_simple = (t:any)=> ["string", "number", "boolean", "symbol", "undefined", "function"].includes(typeof t) || t == null


    let sp = document.createElement("span")
    let tag = t.constructor.name
    if (is_simple(t)){

        if ( ["number", "boolean"].includes(typeof t)) {
            sp.style.color = "orange"
        }
        let st = String(t)
        sp.textContent = st

    }else{

        tag += ` [${Object.keys(t).length}]`
        sp.style.color = "var(--blue)"

        sp.style.cursor = "pointer"

        let isopen = false
        let p : HTMLParagraphElement | undefined

        function open(){
            isopen = true
            p = document.createElement("p")
            p.style.paddingLeft = "2em"

            sp.append(p)
            for (let key of Object.keys(t)){
                p.append(key, ": ")
                p.append(parse(t[key]))
                p.append(document.createElement("br"))
            }
        }
        sp.addEventListener('click',(e)=>{
            if (e.target != sp) return
            
            if (isopen){
                p?.remove()
                isopen = false
                return
            }
            open()
        })

        let previtems = []
        for (let key of Object.keys(t)){
            if (previtems.length>3){
                previtems.push("...")
                break
            }
            let newitem = ""
            if (!(t instanceof Array)){
                newitem += key + ": "
            }
            newitem  += t[key]
            previtems.push(newitem)
        }

        let preview = document.createElement("span")
        preview.textContent = previtems.join(", ")
        preview.style.color = "var(--color)"

        sp.textContent = tag + " "
        sp.append(preview)

    }
    return sp
}



const syntaxclasses = [
    {pattern:(x:string)=>/[\[\]{}()]/.test(x),color:"yellow"},
    {pattern:(x:string)=>scriptKeywords.includes(x),color:"lightblue"},
    {pattern:(x:string)=>!isNaN(parseFloat(x)),color:"orange"}, // number
    {pattern:(x:string)=>/^"(.*)"/.test(x),color:"orange"}, // string
]
