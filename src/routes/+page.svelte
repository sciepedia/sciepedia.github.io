
<script lang="ts">
    import {browser} from "$app/environment"

    export let data

    import {tick} from "svelte"
    
    import { Note, make_editable, pretty_path,title_list } from "./note";
    import { setup_autocomplete } from "./autocomplete";
    import { setup_spellcheck } from "./spellchecker";
    import { is_link } from "./util"
    import { store } from "./data_store"


    var homebutton:string
    var fulltitle:string = "<br>"
    if (browser){
        homebutton = `<a href=/ onclick="window.location.href = '${window.origin}'; location.reload();" id=homebtn>sciepedia</a>`
        fulltitle = homebutton
        tick().then(setup)
    }

    // let last_editable:HTMLElement|null = null
    let pred:HTMLDivElement
    

    const special_letters = ["¨","ö","ä","ü","ï","ë",
                            "ˆ","â","ê","î","ô","û",
                            "´","é","á","í","ú","ó",
                        ]

    const tutorial_text =`click mich und schreib was: xzxysl ... *&^*

du kannst einen neuen link erstellen mit # und dann text zb.: #link #rekursion #wasauchimmer

click einen link an um eine Seite zu öffnen. wenn die Seite schon existiert wird sie dir angezeigt.

fast vergessen! erstelle einen account: {}/login dann kannst du eine öffentliche Notiz erstellen die nur du verändern kannst oder du kannst eine Notiz an einen Kontakt schicken.

wenn du mehr wissen willst: #sciepedia:kormann
`

    let page:HTMLDivElement
    import {root} from "./note"
    import { error } from "@sveltejs/kit";
    import { lightmode, pwdhash, username } from "./store";
    import { get_path_data } from "./link";
    let hist: string[]
    let logged_in_prefix = $username[0]


    async function setup(){

        setup_autocomplete()

        window.fetch = data.fetch

        //lightmode?
        {
            if($lightmode){
                document.body.classList.add("light")
            }   
        }

        pred = document.createElement("div")
        pred.innerHTML = "<p>this is a pred</p><p>this is a pred</p><p>this is a pred</p>"

        pred.id = "pred"

        homebutton = `<a href=/ onclick="window.location.href = '${window.origin}'; location.reload();" id=homebtn>sciepedia</a>`
        fulltitle = homebutton
        let search = window.location.search 
    
        hist = [root.path]
        if(search && search.length>1){
            search  = search.slice(1)
            // search = "#" +search
            if (!is_link(search)){
                search= "#" + search
            }
            if (is_link(search)){
                hist.push(root.path)
                root.path = search
            }
        }

        page = document.querySelector("#page") as HTMLDivElement


        window.addEventListener("scroll",e=>{

            fulltitle = homebutton
            let top_input = {element:{offsetTop:0},fullpath:"<span id=homebtn>sciepedia</span>"}
            title_list.forEach(tle=>{

                if (window.scrollY + tle.element.offsetHeight > tle.element.offsetTop){
                    if (top_input.element.offsetTop < tle.element.offsetTop){
                        top_input = tle
                    }
                }
            })
            fulltitle = top_input.fullpath
            fulltitle = pretty_path(fulltitle)
        })

        store.setitem({Path:get_path_data("_turorial"),Content:tutorial_text.replace("{}",window.location.origin)})

        if(!store.has(get_path_data("_home"))){
            store.setitem({Path:get_path_data("_home"),Content:"willkommen zu sciepedia\nwenn du neu hier bist: #tutorial:system"})
        }

        console.log(`creating home for ${$username}`);
        
        let home = new Note (root.path,root.path)

        title_list.push({element:home.head.title_element,fullpath:root.path})

        page.appendChild(home.element)

        document.body.addEventListener("click",e=>{
            if(e.target == document.body){
                make_editable(null)
            }
        })

        window.addEventListener("onunload",_=>{
            localStorage.unloading = true
            home.body.free()
            localStorage.unloaded = true
        })

        setup_spellcheck().then(()=>{
            home.body.spellcheck()
        })
    }

function push_note(path:string){
    hist.push("_account")
    let nt = new Note("_account","")
    page.removeChild(page.firstChild!)
    page.appendChild(nt.element)
}

function toggle_lightmode(){
    $lightmode = ! $lightmode
}

</script>

<h2 id=fullheader >{@html fulltitle}</h2>


<button id = "light_btn" on:click={toggle_lightmode} >❋</button>

<button id = "loggedin_btn" on:click={()=>{

    push_note("_your_account")

}}> {logged_in_prefix}</button>

<div id =page>

</div>

