// import { get_custom_elements_slots } from "svelte/internal"
// import { TextBody, Note, make_editable } from "./note"
// import { PathData,  } from "./link"
// import { store,  type NoteData,  type uuid } from "../model/data_store"
// import { userId, username } from "../model/store"
// import { get } from "svelte/store"
// import { getcomments } from "../model/backend"

// export class CommentSection{

//     comments :CommentElement[] =[]
//     element : HTMLDivElement 
//     parent:TextBody
//     content: HTMLDivElement

//     constructor(parent:TextBody,path:PathData){
//         this.parent = parent

//         this.element = document.createElement("div")
//         this.element.classList.add("content")
//         const title = document.createElement("p")
//         title.innerHTML = "comments:"
//         title.classList.add("link","open")
//         this.element.appendChild(title)

//         this.content = document.createElement("div")
//         this.content.classList.add("content")
//         this.element.appendChild(this.content)

//         const comment_button = document.createElement("p")
//         comment_button.innerHTML = "+ comment"
//         this.element.appendChild(comment_button)

//         getcomments(parent.owner.data.id).then(comments=>comments.forEach(data=>{

//             const newcomment = new CommentElement(data)
//             this.comments.push(newcomment)
//             this.content.appendChild(newcomment.element)
//         }))

//         comment_button.addEventListener("click",()=>{
//             this.add(get(userId))
//         })
//         comment_button.classList.add("content","link")
//     }

//     add(user_id:uuid){

//         const id = crypto.randomUUID()

//         const data:NoteData = {
//             Path: new PathData(true,get(username),[id]),
//             Content:"content",
//             id,
//             comment_of:this.parent.owner.data.id
//         }

//         const parent_data = this.parent.owner.data
//         parent_data.comments = parent_data.comments? parent_data.comments.concat(id) : [id]

//         let newcomment = new CommentElement(data)
//         this.comments.push(newcomment)
//         this.content.appendChild(newcomment.element)
//         console.log("save parent");
        
//         this.parent.save()
//         console.log("save newcomment");
        
//         newcomment.body.save()
//         make_editable(newcomment.body)
//         newcomment.body.element.focus()
        
//     }

//     opened = false

//     toggle(){
//         this.opened ? this.close() : this.open()
//         this.opened = ! this.opened
//     }

//     open(){
//         this.parent.element.appendChild(this.element)
//     }

//     close(){
//         this.element.remove()
//     }
// }

// export class CommentElement{
    
//     body : TextBody
//     element:HTMLElement
//     title : HTMLHeadingElement
//     data : NoteData


//     constructor(data:NoteData){

//         this.data = data
//         this.element = document.createElement("div")
//         this.title = document.createElement("p") 
//         this.title.textContent = data.Path.author + ":"
//         this.element.appendChild(this.title)

//         this.body = new TextBody(data.Content, this, data,[])
//         this.element.appendChild (this.body.content)
//     }
//     save(){
//         let txt = this.body.get_content_text()
//         console.log("saving", this);
//         this.data.Content = txt
//         store.setitem(this.data)

//     }
// }
