import { upload_image } from "./backend";

export class Image{

    element: HTMLImageElement;

    constructor(url:string){
        this.element = document.createElement("img")
        this.element.classList.add("image")
        this.element.src = url
    }
}

export function image_from_file(file:File){
    const ret = new Image("")
    upload_image(crypto.randomUUID(),file).then(url => ret.element.src = url)
    return ret
}
