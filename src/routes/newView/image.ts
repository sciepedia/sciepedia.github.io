// import { upload_image } from "../model/backend";

// export class Image{

//     element: HTMLImageElement;
//     editable: boolean;

//     constructor(url:string){

//         let parts = url.split("#")
//         console.log(url);
        
//         let maxw = decodeURI(parts[1])
//         url = parts[0]

//         this.editable = false
//         this.element = document.createElement("img")
//         this.element.classList.add("image")
//         this.element.src = url
//         this.element.style.width = maxw
//         document.addEventListener("click",(e)=>{
//             if (e.target != this.element && e.target != this.element.parentElement){
//                 this.set_sizable(false)
//             }
//         })
//         this.element.addEventListener("dblclick",()=>{
//             this.set_sizable(true)

//         })

//     }

//     set_sizable(on:boolean){

//         if (on){
//             let box = document.createElement("div")
//             this.element.replaceWith(box)
//             box.style.width = this.element.style.width
//             this.element.style.width = "100%"
//             box.appendChild(this.element)
//             box.style.resize = "both"
//             box.style.overflow = "auto"
//             box.style.border = "2px solid white"

//         }else if (this.editable){
            
//             let newwidth = this.element.width            
//             this.element.style.width = `min(${newwidth}px, 100%)`
//             this.element.parentElement?.replaceWith(this.element)
            
//         }
//         this.editable = on
//     }
// }

// export function image_from_file(file:File){
//     console.log("create image", file);
//     const ret = new Image("")
//     upload_image(crypto.randomUUID(),file).then(url => ret.element.src = url)
//     return ret
// }
