
import { tick } from 'svelte';

import Typo from 'typo-js';
import { autocomplete } from './note';

var dictionary : Typo 
var dictionary_en : Typo 

export async function setup_spellcheck(){

    const res = new Promise((resolve,_)=>{


        setTimeout(()=>{
            dictionary = new Typo("de", null, null, { dictionaryPath: "/dictionaries" });
            dictionary_en = new Typo("en_GB", null, null, { dictionaryPath: "/dictionaries" });
            resolve(true)
        },500)
    })
    return res
}

export function typo_element (word:string){

    if (spellcheck(word)){
        return
    }
    const spn = document.createElement("span")
    spn.classList.add("typo")
    spn.innerHTML = word
    spn.addEventListener("contextmenu",e=>{
        const suggestions = get_suggestions(word)
        console.log(suggestions);
        autocomplete.fill(spn,suggestions)

        console.log("my parent is ",autocomplete.element?.parentElement);
        e.preventDefault()
    })
    return spn
}

export default function spellcheck(req:string){


    req = req.replace(/\p{P}$/ug, ''); //   

    if (dictionary_en === undefined){
        return true
    }

    // check if req includes a digit
    if (/\d/.test(req)){
        return true
    }

    req = req.trim()
    if (req.length<2){
        return true
    }
    
    if (!dictionary.check(req) && !dictionary_en.check(req)){
        return false
    }else{
        return true
    }
}

export function get_suggestions(req:string){
    
    req = req.replace(/\p{P}$/ug, '');

    if (dictionary_en === undefined){
        return []
    }
    // check if req includes a digit
    if (/\d/.test(req)){
        return []
    }
    req = req.trim()
    if (req.length<2){
        return []
    }

    let suggestions = dictionary_en.suggest(req,5);
    suggestions = suggestions.concat(dictionary.suggest(req,5))
    suggestions = suggestions.filter((s,i)=>suggestions.indexOf(s)===i)
    return suggestions
}
