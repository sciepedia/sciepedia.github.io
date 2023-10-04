import { get_link, type Link } from "./link";
import { setCaret } from "./note";

export var title_set = new Set<string>()
var title_list:string[] =[]
var title_added = false



// for (let index = 0; index < localStorage.length; index++) {

export function setup_autocomplete(){

    for (let index = 0; index < localStorage.length; index++) {
        const key = localStorage.key(index)!
        if (key!.startsWith("#")){
            add_title_completion(key)            
        }
    }
}

export function add_title_completion(title:string){

    const parts = title.split(".")
    const size = title_set.size
    for (let index = 0; index < parts.length; index++) {
        const sub_title = parts.slice(0,index+1).join(".")
        title_set.add(sub_title)
    }
    if (size != title_set.size){
        title_added = true
    }
}

function get_completions(content:string){
    if (title_added){
        title_list = Array.from(title_set)
        title_list.sort()
        title_added = false
    }

    var results = [];
    for (var i = 0; i < title_list.length; i++) {
        if (title_list[i].toLowerCase().startsWith(content.toLowerCase())) {
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

        const pred = get_completions(path).filter(el => el != path)

        if (pred.length == 0){return}

        pred.forEach(element => {

            const prediction_line = document.createElement("p")
            prediction_line.innerHTML = element 
            this.element!.appendChild(prediction_line)


            prediction_line.addEventListener("click", ()=>{

                link.rename(element)
                this.clear()
            });
        });
        parent.appendChild(this.element)
    }

    fill(parent:HTMLSpanElement, items:string[]){

        console.log("filling autocomplete ",parent);
        
        this.open = true

        document.addEventListener("click",e=>{
            if ((e.target as HTMLElement).parentElement != this.element ){
                this.clear()
            }
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


