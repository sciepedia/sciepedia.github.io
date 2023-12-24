import { get_link, get_path_data, type Link, type PathData } from "./link";
import { setCaret } from "./note";
import { setup_search } from "./search";

export var title_set = new Map<string,PathData>()
var title_list:[string,PathData][] =[]
var title_added = false

export function setup_autocomplete(){
    
    for (let index = 0; index < localStorage.length; index++) {
        const key = localStorage.key(index)!
        try {
            const d = JSON.parse(key)
            if (d.location){
                add_title_completion(d)
            }
        }catch{}
    }
}

export function add_title_completion(path:PathData){

    const pathstring = (path.pub?"":"_") + path.location.join(".")+":"+path.author
    
    const size = title_set.size
    title_set.set(pathstring,path)

    if (size != title_set.size){
        title_added = true
    }
}

export function updated_title_list(){
    if (title_added){        
        title_list = Array.from(title_set)
        title_list.sort((a,b)=>a[0].localeCompare(b[0]))
        title_added = false
    }        
    return title_list
}

export function get_completions(content:string, maxres = 10){
    content = content.replaceAll(" ", "_")
    
    updated_title_list()
    var results = [];
    for (var i = 0; i < title_list.length && results.length < maxres; i++) {
        if (title_list[i][0].toLowerCase().startsWith(content.toLowerCase())) {
            results.push(title_list[i]);
        }
    }
    return results;
}

export class Autocomplete{

    element?: HTMLDivElement;

    parent:ParentNode|null = null
    open = false


    create(parent:HTMLSpanElement){

        this.open = true

        document.addEventListener("click",e=>{
            if ((e.target as HTMLElement).parentElement != this.element ){
                this.clear()
            }
        })

        const link = get_link(parent.id)!
        const path  = link.path

        this.parent = parent

        this.element = document.createElement("div")
        this.element.id = "autocomplete"
        this.element.innerHTML = ""

        //TODO: wrong?
        const pred = get_completions(path.tostring()).filter(el => el[0] != path.tostring())

        if (pred.length == 0){return}

        pred.forEach(element => {

            const prediction_line = document.createElement("p")
            prediction_line.innerHTML = element[0]
            this.element!.appendChild(prediction_line)

            prediction_line.addEventListener("click", ()=>{

                link.rename(get_path_data(element[0]))
                this.clear()
            });
        });
        parent.appendChild(this.element)
    }

    fill(parent:HTMLSpanElement, items:string[]){
        
        this.open = true

        document.addEventListener("click",e=>{
            if ((e.target as HTMLElement).parentElement != this.element )this.clear()
        })

        this.parent = parent
        this.element = document.createElement("div")
        this.element.id = "autocomplete"
        this.element.innerHTML = ""

        items.forEach(element => {

            const prediction_line = document.createElement("p")
            prediction_line.innerHTML = element 
            this.element!.appendChild(prediction_line)

            prediction_line.addEventListener("click", ()=>{

                const newtext = new Text(element)
                parent.replaceWith(newtext)
                setCaret(newtext,element.length)
                this.clear()

            });
        });
        parent.appendChild(this.element)

    }

    clear(){
        this.open = false
        if(this.element!=undefined){
            this.element.remove()
        }
    }

    restore(){
        this.open = true
        if(this.element!=undefined){
            this.parent!.appendChild(this.element)
        }
    }
}


