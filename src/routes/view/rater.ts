
// export class Rater{

//     element:HTMLDivElement

//     constructor(title:string,rating:number,parent:HTMLDivElement, callback:(rating:number)=>void){

//         if (rating > 5){
//             rating = 5
//         }

//         this.element = document.createElement("div")
//         this.element.classList.add("bg")

//         this.element.addEventListener("click",e=>{
//             if (e.target == this.element){
//                 this.element.remove()
//             }
//         })

//         const container = document.createElement("div")
//         container.classList.add("container")
//         this.element.appendChild(container)
        
//         container.append(document.createElement("h2"))
//         container.childNodes[0].textContent = title

//         var stars_element = document.createElement("p")
//         stars_element.classList.add("stars")

//         var star_buttons:HTMLSpanElement[] = []

//         const setrating = ()=>{
//             console.log("setrating",rating);
            
//             for (let j=0;j<5;j++){
//                 if (j<rating){
//                     star_buttons[j].innerHTML = "★"
//                 }else{
//                     star_buttons[j].innerHTML = "☆"
//                 }
//             }
//         }

//         for (let i=0;i<5;i++){
//             let star = document.createElement("span")
//             star.classList.add("star")
//             star.innerHTML = "☆"
//             stars_element.appendChild(star)
//             star_buttons.push(star)
//             star.addEventListener("click",_=>{
//                 rating = i + 1
//                 setrating()
//             })
//         }
//         setrating()

//         container.appendChild(stars_element)

//         const ready = document.createElement("button")
//         ready.classList.add("ready")
//         ready.innerHTML = "rate"
//         container.appendChild(ready)

//         ready.addEventListener("click",_=>{
//             this.element.remove()
//             callback(rating)
//         })

//         parent.appendChild(this.element)
//     }   
// }

