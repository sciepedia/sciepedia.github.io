
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
    return /^((\.\.)|[\#\@\_\.])[a-zA-Z0-9ßäöüÄÖÜø_]+([.:][a-zA-Z0-9ßäöüÄÖÜø_]+)*\.?$/.test(txt)
}

export function valid_username(txt:string){
    return /^[a-z0-9ßäöüø_]+$/.test(txt)
}

export function is_youtube_link(name:string):boolean{
    //https://www.youtube.com/watch?v=8U8kK3SpLTU&t=745s
    return (name.startsWith("https://www.youtube.com/watch") || name.startsWith("https://www.youtube.com/embed"))
}

export function make_youtube_player(name:string){
    //<iframe width="560" height="315" src="https://www.youtube.com/embed/YourVideoID" frameborder="0" allowfullscreen></iframe>
    let element = document.createElement("iframe")
    if (name.startsWith("https://www.youtube.com/embed")){
        element.src = name
    }else{
        let ID = name.split("watch?v=")[1].split("&t")[0]
        element.src = `https://www.youtube.com/embed/${ID}`
    }
    element.classList.add("youtubeplayer")
    return element
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