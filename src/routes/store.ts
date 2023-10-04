
import { browser } from "$app/environment";
import { writable, type Writable } from "svelte/store";

function createWritable<T>(key:string, def:T){

    let value = def
    if ( browser && localStorage[key]){
        value = JSON.parse(localStorage[key])
    }
    const wr = writable(value)
    if (browser){

        wr.subscribe(val=>{
            
            localStorage[key] = JSON.stringify(val)
        })
    }
    
    return wr
}

export const username       = createWritable<string>("username", "me")
export const email          = createWritable<string>("email", "")
export const userId         = createWritable<string>("userId", "")
export const pwdhash        = createWritable<string>("pwdhash", "None")
export const lightmode      = createWritable<Boolean> ("lightmode", false)

