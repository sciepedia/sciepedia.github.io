import { get_author_name } from "./link"



export function inspector(path:string){

    const author = get_author_name(path)

    const background = document.createElement("div")
    background.classList.add("bg")

    const container = document.createElement("div")
    container.classList.add("center")

    const header = document.createElement("h2")

    header.innerHTML = path

    const author_element = document.createElement("h3")
    author_element.innerHTML = author

    const close_button = document.createElement("button")
    close_button.innerHTML = "close"
    close_button.onclick = ()=>{
        background.remove()
    }

    
    container.appendChild(header)
    container.appendChild(author_element)
    container.appendChild(close_button)

    return background

}
