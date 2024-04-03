
// const backend_url = "https://chatserver.sciepedia.com/"
const backend_url = "http://localhost:5000/"

import type {Message} from "./chat"

export function get_answer(hist:Message[], callback: (chunk:string)=>any){

    let res = new Promise<void>((resolve, reject)=>{

        let messages = hist.map(message=>{
            return {content:message.content, role:message.role}
        })

        fetch (backend_url + "answer", {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({messages})
        }).then(response=>{
            console.log(response);
            let reader = response.body!.getReader()
            function decode({done:done, value:value}:{done:boolean, value?:Uint8Array}){
                if (done){
                    resolve()
                    return
                }
                callback(new TextDecoder().decode(value))
                reader.read().then(decode)
            }
            reader.read().then(decode)
        })
    })
    return res
}


export function get_embeddings(messages:string[]){
    let res = new Promise<void>((resolve, reject)=>{
        fetch (backend_url + "embed", {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({messages})
        }).then(response=>{
            console.log(response);
            let resp = response.json()
            resolve(resp)
        })
    })
    return res
}
