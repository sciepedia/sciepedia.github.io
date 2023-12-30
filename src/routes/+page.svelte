
<script lang="ts">
    import {browser} from "$app/environment"

    export let data

    import {tick} from "svelte"
    
    import { Note, ScriptNote, make_editable,title_list } from "./note";
    import { setup_autocomplete } from "./autocomplete";
    import { setup_spellcheck } from "./spellchecker";
    import { is_link } from "./util"
    import { store } from "./data_store"

    if (browser){
        document.title = window.location.hostname
    }

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

    const tutorial_text =`Click me and write something: xzxysl ... &^

You can create a new link with # followed by text, for example: #link #recursion #whatever

Click on a link to open a page. If the page already exists, it will be displayed to you.

Almost forgot! Create an account: {}/login, and then you can create public pages.

If you want to learn more, check out: #sciepedia:kormann
`

    let page:HTMLDivElement
    import {root} from "./note"
    import { is_online, lightmode, pwdhash, username } from "./store";
    import { PathData, get_path_data } from "./link";
    import Searchbar from "./searchbar.svelte";
    let hist: PathData[]
    let logged_in_prefix = $username[0]

    async function setup(){

        setup_autocomplete()

        window.fetch = data.fetch


        lightmode.subscribe(val=>{
            if (val){document.body.classList.add("light")}
            else{document.body.classList.remove("light")}
        })

        pred = document.createElement("div")
        pred.innerHTML = "<p>this is a pred</p><p>this is a pred</p><p>this is a pred</p>"

        pred.id = "pred"

        homebutton = `<a href=/ onclick="setTimeout(()=>{window.location.href='${window.origin}'})" id=homebtn>sciepedia</a>`
        fulltitle = homebutton
        let search = window.location.search 
    
        hist = [get_path_data(root.path)]
        if(search && search.length>1){
            search = decodeURI(search.slice(1))
            if (!is_link(search)){
                search= "#" + search
            }
            console.log("searching:",search)
            if (is_link(search)){
                hist.push(hist[0])
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
                        // top_input = tle
                    }
                }
            })

        })
        const tut_path = get_path_data('_tutorial:'+ $username)
        if (!store.has(tut_path)){
            store.setitem({Path:tut_path,Content:tutorial_text.replace("{}",window.location.origin),id:crypto.randomUUID()})
        }

        let home_path = get_path_data(root.path)
        if(!store.has(home_path)){
            const data = ({Path:home_path,Content:"welcome to sciepedia\ntry out the tutorial: _tutorial",id:crypto.randomUUID()})
            localStorage[JSON.stringify(data.Path)] = JSON.stringify(data)
        }
        
        let home = new Note("_home",home_path)
        if (home_path.location.includes("js")){
            home = new ScriptNote("_home",home_path)
        }

        title_list.push({element:home.head.title_element,fullpath:home_path})

        page.appendChild(home.element)

        document.body.addEventListener("click", e => {
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

// function push_note(path:string){
//     const pathdata = get_path_data("_account")
//     hist.push(pathdata)
//     let nt = new Note("_account")
//     page.removeChild(page.firstChild!)
//     page.appendChild(nt.element)
// }

// function toggle_lightmode(){
//     $lightmode = ! $lightmode
// }

</script>

<Searchbar />

<h2 id=fullheader >{@html fulltitle} {$is_online? "" : "offline"}</h2>


<!-- <button id = "light_btn" on:click={toggle_lightmode} >❋</button> -->
<!-- 
<button id = "loggedin_btn" on:click={()=>{

    window.location.pathname='login'

}}> {logged_in_prefix}</button> -->

<div id =page>

</div>

