
const SALT = "d8&"



export async function user_hash(username:string, password:string){
    return await sha256(username+password+SALT)
}

async function sha256(message:string){
    // encode as UTF-8
    const msgBuffer = new TextEncoder().encode(message);                    

    // hash the message
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);

    // convert ArrayBuffer to Array
    const hashArray = Array.from(new Uint8Array(hashBuffer));

    // convert bytes to hex string                  
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
}

export function hash(arg: string) {

    var hash = 0;

    if (arg.length == 0) return String(hash);

    for (var i = 0; i < arg.length; i++) {
        var char = arg.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }

    return String(hash);
}

export function is_legal_name(name:string):boolean{

    let starter = name[0]
    if (!Boolean( starter.match( /[a-z]/ ))){
        return false
    }

    return name.replace(/[a-z,A-Z,0-9,\-,\_]/g,"")==""

}


export function is_link(txt:string):boolean{

    txt = txt.trim()

    let prefixes = ["..",".","_","#"]

    // check if txt starts with a prefix
    for (let i = 0; i < prefixes.length; i++) {
        const prefix = prefixes[i];
        if (txt.startsWith(prefix)){
            return is_name(txt.slice(prefix.length))
        }
    }    
    return false
}



export function is_name(txt:string){
    if (txt==""){
        return false
    }

    //test for number or character
    return (/[a-z0-9,ß,ä,ö,ü,ø]/i.test(txt[0]))
}


export function is_http_link(name:string):boolean{
    return (name.startsWith("http://") || name.startsWith("https://"))
}

export function make_http_link(target:string):HTMLSpanElement{


    let spn = document.createElement("span")
    // let name = target.startsWith("https://") ? target.slice(8) : target
    spn.innerHTML = target
    spn.classList.add("httplink")

    spn.addEventListener("click",e=>{

        window.open(target, '_blank')?.focus();

    })
    return spn
}