
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
    return /^((\.\.)|[\#\@\_\.])[a-z0-9ßäöüø_]+([.:][a-z0-9ßäöüø_]+)*\.?$/.test(txt)
}

export function valid_username(txt:string){
    return /^[a-z0-9ßäöüø_]+$/.test(txt)
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