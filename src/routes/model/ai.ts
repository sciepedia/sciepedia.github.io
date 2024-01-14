import type { searchItem } from "../controller/search"
import { openaikey } from "./store"


function setup_openaikey(){
    const key = prompt("enter openai key")
    if (key){
        openaikey.set(key)
    }
}

export const openaisetup:searchItem = {
    tags:["openai", "ai", "gpt"],
    rep:'⚙️ add openai key',
    executor: setup_openaikey
}

type tag = string | ((x:string)=>boolean) | tag[]

const s: tag = 'w'
const f: tag = (a)=>a == 'w2'
const t: tag = [f, s]
const t2: tag = [t,f,s]

