import { text, tick } from "svelte/internal";


export function cleanMarkup(txt:string){
    // return txt.replace(/[^\x00-\x7F]/g, '');

    let textarea = document.createElement('textarea');
    textarea.innerHTML = txt;
    return textarea.value;

}