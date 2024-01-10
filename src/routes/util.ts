
const SALT = "d8&"


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

export function is_link(txt:string):boolean{
    console.log(txt);
    txt = txt.trim()
    let prefixes = ["..",".","_","#","@"]

    for (let i = 0; i < prefixes.length; i++) {
        if (txt.startsWith(prefixes[i])) {
            let iname = is_name(txt.slice(prefixes[i].length))
            return iname
        }
    }
    return false
}

export function is_name(txt:string){

    for (let part of txt.split(/\.|\:/)){
        console.log(part);
        if (!/^[a-z0-9ßäöüø_]+$/i.test(part)){
            return false
        }
    }
    return true
}

export function is_http_link(name:string):boolean{
    return (name.startsWith("http://") || name.startsWith("https://"))
}

export function make_http_link(target:string):HTMLSpanElement{
    
    let spn = document.createElement("span")

    spn.textContent = target
    spn.classList.add("httplink")

    spn.addEventListener("click",e=>{

        if (target.endsWith(",") || target.endsWith(".")){
            target = target.substring(0,target.length-1)
        }
        window.open(target, '_blank')?.focus();
    })
    return spn
}

export function cleanMarkup(txt:string){
    let textarea = document.createElement('textarea');
    textarea.innerHTML = txt;
    return textarea.value;
}