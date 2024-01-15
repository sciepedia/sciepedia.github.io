import type { Note } from "./note"

export function open_context_menu(e:MouseEvent, note:Note){
    e.preventDefault()
    let div = document.createElement("div")

    div.style.position = "fixed"
    div.style.top = e.pageY - window.scrollY + "px"
    div.style.left = e.pageX + "px"
    div.style.backgroundColor = "var(--focus)"
    div.style.border = "2px solid grey"
    div.style.padding = ".5em"
    div.style.cursor="pointer"

    {
        const items =[
            {
                tag : "share link",
                fn : async(p:HTMLParagraphElement )=>{
                    await navigator.clipboard.writeText(location.origin + "?" + note.path().tostring().replace("#",""))
                    p.textContent = "copied."}
            },
            {
                tag : `expand note ${note.path().tostring()}`,
                fn : async (p:HTMLParagraphElement)=>{
                    window.location.search = note.path().tostring().replace("#","")
                }
            }
        ]
        for (let {tag, fn} of items){

            let p = document.createElement("p")
            p.textContent = tag
            p.addEventListener("click",(e)=>fn(p))
            p.style.padding=".2em"
            div.append(p)
        }
    }
    
    let page = document.querySelector('#page')
    page?.appendChild(div)
    window.addEventListener("click",()=>div.remove())
    div.addEventListener("mouseleave", ()=>div.remove())
}

