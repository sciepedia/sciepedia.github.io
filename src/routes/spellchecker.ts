
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
        autocomplete.fill(spn,suggestions)
        e.preventDefault()
    })
    return
}

let javascriptKeywords = [
    "abstract", "await", "boolean", "break", "byte", "case", "catch", "char", "class",
    "const", "continue", "debugger", "default", "delete", "do", "double", "else", "enum",
    "export", "extends", "false", "final", "finally", "float", "for", "function", "goto",
    "if", "implements", "import", "in", "instanceof", "int", "interface", "let", "long",
    "native", "new", "null", "package", "private", "protected", "public", "return", "short",
    "static", "super", "switch", "synchronized", "this", "throw", "throws", "transient",
    "true", "try", "typeof", "var", "void", "volatile", "while", "with", "yield",
    "String", "Array"
];



// Construct a regex pattern from the keywords
let keywordRegex = new RegExp("\\b" + javascriptKeywords.join("\\b|\\b") + "\\b");

const syntaxclasses = [
    {pattern:(x:string)=>/[\[\]{}()]/.test(x),color:"yellow"},
    {pattern:(x:string)=>javascriptKeywords.includes(x),color:"lightblue"},
    {pattern:(x:string)=>!isNaN(parseFloat(x)),color:"orange"}, // number
    {pattern:(x:string)=>/^"(.*)"/.test(x),color:"orange"}, // string
]

export function code_element(word:string){

    let res : Text | HTMLSpanElement = new Text(word)
    syntaxclasses.forEach(i=>{
        
        if (i.pattern(word)){
            res = document.createElement("span")
            res.innerHTML = word
            res.style.color = i.color
        }
    })
    return res

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
