import type { NoteData } from "../model/data_store"
import { Content, put_caret } from "./content"
import type { Note } from "./note"

export class CsvContent extends Content{

    table:HTMLTableElement
    rows:number
    columns:number
    constructor(note:Note){
        super(note)
        this.element.innerHTML = ""
        this.element.contentEditable = "false"
        this.element.style.padding = "0"
        let container = document.createElement("div")
        let supercontainer = document.createElement("div");

        // (this.note.head!.element.children[0]as HTMLElement).style.marginBottom = "0"
        this.note.head?.element.remove()

        container.classList.add("tablecontainer")
        supercontainer.classList.add("supercontainer")
        
        this.table = document.createElement("table")
        this.table.classList.add("tablecontent")

        let nodes = this.data.Content.split("\n").map(t=>this.make_line(t,true))
        console.log("creating table", this.data.Content);
        
        this.table.append(...nodes)
        this.rows = this.table.childNodes.length
        
        this.columns = this.table.childNodes[0].childNodes.length
        this.element.innerHTML = ""

        this.element.replaceWith(supercontainer)
        this.element = supercontainer


        const removecolumns = document.createElement("tr")
        for (var i =0;i<this.columns;i++){
            if (i==0)removecolumns.append(document.createElement("span"))
            else removecolumns.append(this.removecolumn(this.table,i))
        }

        this.table.prepend(removecolumns)
        supercontainer.append(container)
        container.append(this.table)

        const newcolumn = document.createElement("button")
        newcolumn.addEventListener("click", e=>{
            this.table.childNodes.forEach((tr,i)=>{
                let newtd
                if (i==0) {
                    newtd = this.removecolumn(this.table, this.columns)
                }else{
                    newtd = document.createElement("td")
                    newtd.append(super.make_line(""))
                    console.log(newtd);
                }
                tr.appendChild(newtd)
            })
            this.columns ++
        })
        newcolumn.classList.add("newcolumn")
        newcolumn.innerHTML = "+"
        container.appendChild(newcolumn)

        const newrow = document.createElement("button")
        newrow.addEventListener("click", e=>{
            let row = this.table.insertRow(-1)
            row.replaceWith(this.make_line(",".repeat(this.columns-2)))
        })
        newrow.innerHTML = "+"
        newrow.classList.add("newrow")
        supercontainer.append(newrow)

        this.element.addEventListener("click",(e)=>{
            let target = e.target as HTMLElement
            if (target.nodeName == "BUTTON") return
            if (target.nodeName == "TD" || target.parentNode?.nodeName == "TD"){
                let target = ((e.target as HTMLElement).nodeName == "TD" ? e.target : (e.target as HTMLElement).parentNode) as HTMLTableCellElement
                target.contentEditable = "true"
                let p = target.querySelector("p")!
                if ([p,p.parentElement].includes(document.activeElement as HTMLElement)) return
                p.focus()
                put_caret(p,this.get_line_text(p).length)
            }
        })

        this.element.addEventListener("input",(e)=>{
            if ((e.target as HTMLElement).nodeName == "TD" || (e.target as HTMLElement).parentNode?.nodeName == "TD"){
                this.on_input(e)
            }
        })
    }

    set_data(data: NoteData): void {
        
    }

    removecolumn(table:HTMLTableElement, columnindex:number):  Node {
        let td = document.createElement("td")
        let but = document.createElement("span")
        but.innerHTML = "-"
        // but.style.all = 'unset'

        but.addEventListener("click",e=>{
            console.log('remove col',columnindex);
            table.childNodes.forEach((e,i)=>e.childNodes[columnindex].remove())
        })
        this.save_lazy()
        but.style.width = "100%"
        td.style.padding = "0";
        td.append(but)
        td.classList.add('removecolumn')
        td.style.border = "unset"
        return td
    }

    make_line(txt: string, compact?: boolean): HTMLElement {

        const tr = document.createElement("tr")
        let remove = tr.append(this.removerow(tr))
        for (let cell of txt.split(",")){
            let td = document.createElement("td")
            td.append(super.make_line(cell))
            tr.append(td)
        }
        return tr
    }

    removerow(tr:HTMLTableRowElement){
        let remove = document.createElement("button")
        remove.innerHTML="-"
        remove.addEventListener("click",()=>tr.remove())
        remove.classList.add("removerow")
        return remove
    }

    get_text(){

        const table = this.element.querySelector("table")
        let res = ""

        for (let k = 1; k < table!.childNodes!.length; k++) {
            const tr = table?.childNodes![k] as HTMLTableRowElement;
            for (let i =1; i < tr.childNodes.length; i++) {
                const td = tr.childNodes[i];

                console.log(td);
                

                let t = this.get_line_text((td as HTMLTableCellElement).querySelector("p") as HTMLParagraphElement)
                res += t + ","
            }
            res = res.slice(0,-1) + "\n"
        }
        res = res.slice(0,-1)
        console.log(res);
        return res
    }

    async on_input(e: Event) {
        this.save_lazy()
    }
}

