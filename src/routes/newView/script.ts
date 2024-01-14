
import { exclude_internal_props } from "svelte/internal";
import { store, type PathData } from "../model/data_store";
import { TextContent } from "./content";
import { Note } from "./note";
import { Link } from "./link";
import { is_link } from "../controller/util";

export class ScriptContent extends TextContent{
    outfield:HTMLDivElement
    constructor(note:Note,path:PathData){
        super(note,path)
        this.element.classList.add("js")
        this.element.spellcheck = false

        let runbutton = document.createElement("div")
        runbutton.classList.add("runbutton")
        runbutton.textContent = "▶"
        runbutton.addEventListener("click",(e)=>this.execute())
        this.element.addEventListener("keydown",(e)=>{
            console.log(e);
            
            if (e.ctrlKey && e.key == "Enter"){
                this.execute()
            }
        })
        this.element.parentElement!.append(runbutton)
        this.outfield = document.createElement("div")
        this.outfield.classList.add("content")
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

        let predefs = {vars:new Set<string>, values: new Array<[string,string]>()}

        let code = await this.get_content_text(this,this.data.Path,predefs)
        console.log(code);
        
        try{
            let fn = Function(code)
            let res = fn()
            this.print(res)
        }catch (e){
            this.print("error",e)
        }

    }


    

    print(...args:any[]){
        let loc = args[0]
        args = args.slice(1)
        let p = document.createElement("p")
        let L = new Link(loc,this.note)
        L.element.style.float = "right"
        p.append(L.element)
        for (let arg of args){
            p.append(document.createTextNode(arg))
            p.append(document.createTextNode(" "))
        }
        this.outfield.append(p)
    }
}


let scriptKeywords = ['abstract', 'arguments', 'await', 'boolean', 'break', 'byte', 'case', 'catch', 'char', 'class', 'const', 'continue', 'debugger', 'default', 'delete', 'do', 'double', 'else', 'enum', 'eval', 'export', 'extends', 'false', 'final', 'finally', 'float', 'for', 'function', 'goto', 'if', 'implements', 'import', 'in', 'instanceof', 'int', 'interface', 'let', 'long', 'native', 'new', 'null', 'package', 'private', 'protected', 'public', 'return', 'short', 'static', 'super', 'switch', 'synchronized', 'this', 'throw', 'throws', 'transient', 'true', 'try', 'typeof', 'var', 'void', 'volatile', 'while', 'with', 'yield']



// Construct a regex pattern from the keywords
// let keywordRegex = new RegExp("\\b" + scriptKeywords.join("\\b|\\b") + "\\b");

const syntaxclasses = [
    {pattern:(x:string)=>/[\[\]{}()]/.test(x),color:"yellow"},
    {pattern:(x:string)=>scriptKeywords.includes(x),color:"lightblue"},
    {pattern:(x:string)=>!isNaN(parseFloat(x)),color:"orange"}, // number
    {pattern:(x:string)=>/^"(.*)"/.test(x),color:"orange"}, // string
]
