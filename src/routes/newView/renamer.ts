import { get_path_data, type PathData } from "../model/data_store"


export var rename_window = (path:PathData) => new Promise<PathData>((resolve,reject)=>{
    console.log("rename_note",path);
    
    const background = document.createElement("div")
    background.classList.add("bg")
    background.addEventListener("click",e=>{
        if (e.target == background){
            background.remove()
            reject()
        }
    })

    document.querySelector("#page")!.appendChild(background)

    const container = document.createElement("div")
    container.classList.add("container")
    background.appendChild(container)

    const header = document.createElement("h2")
    header.innerHTML = "rename note"

    const input = document.createElement("input")
    input.value = path.tostring()

    const errormsg = document.createElement("p")
    const finish = ()=>{
        const newpath = get_path_data(input.value)
        if (newpath != path){
            resolve(newpath)
            background.remove()
        }else{
            errormsg.innerHTML = "invalid name"
        }
    }

    //check for enter press
    input.addEventListener("keyup",e=>{
        if (e.key == "Enter")finish()
    })

    const button = document.createElement("button")
    button.innerHTML = "rename"
    button.onclick = ()=>finish()

    container.appendChild(header)
    container.appendChild(input)
    container.appendChild(errormsg)
    container.appendChild(document.createElement("br"))
    container.appendChild(button)
})
