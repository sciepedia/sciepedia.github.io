import { get_custom_elements_slots } from "svelte/internal"
import { Body, Note } from "./note"
import type { PathData,  } from "./link"
import type { store,  NoteData,  uuid } from "./data_store"
import { userId, username } from "./store"
import { get } from "svelte/store"

export class CommentSection{

    comments :CommentElement[] =[]
    element : HTMLDivElement 
    head :{title_element: HTMLElement} 
    parent:Body
    content: HTMLDivElement

    constructor(parent:Body,path:PathData){
        this.parent = parent

        this.element = document.createElement("div")
        this.head = {title_element: document.createElement("div")}
        
        this.content = document.createElement("div")
        this.content.classList.add("content")
        this.element.appendChild(this.content)

        // parent.comments.forEach(id=>{

        //     const data = store.getcomment(id)
        //     const newcomment = new CommentElement(data!)
        //     this.content.appendChild(newcomment.element)

        // })

        const comment_button = document.createElement("button")
        comment_button.innerHTML = "comment"
        this.element.appendChild(comment_button)
        comment_button.addEventListener("click",()=>{
            this.add(get(userId))
        })
        comment_button.classList.add("commentbutton")

    }

    add(user_id:uuid){

        // const id = crypto.randomUUID()

        // const data:NoteData = {
        //     Path: new PathData(true,get(username),[id]),
        //     Content:"content",
        //     comment_of : this.
        // }

        // let newcomment = new CommentElement(data)
        // this.comments.push(newcomment)
        // this.content.appendChild(newcomment.element)

        // this.parent.comments.push(id)
        // this.parent.save()
        // newcomment.save()
    }

    close(){
        this.element.remove()
    }
}

export class CommentElement{
    
    body : Body
    element:HTMLElement
    title : HTMLHeadingElement
    data : NoteData


    constructor(data:NoteData){

        this.data = data
        this.element = document.createElement("div")
        this.title = document.createElement("h3") 
        this.title.textContent = data.Path.author
        this.element.appendChild(this.title)


        this.body = new Body(data.Content, this, data,[])
        this.element.appendChild (this.body.element)
    }

    save(){

        // store.setcomment(this.data)
    }

}
