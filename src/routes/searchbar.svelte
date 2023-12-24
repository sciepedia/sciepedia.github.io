
<script lang='ts'>
    import { browser } from "$app/environment";
    import { tick } from "svelte";
    import { get_completions } from "./autocomplete";
    import { PathData } from "./link";
    import { insert_hydration, prevent_default } from "svelte/internal";
    import { search, setup_search, type searchItem } from "./search";


    let searching:boolean = false
    let query:string = ""

    type restulttype = "page"
    let results:searchItem[] = []
    let highlight_index = 0

    let fillsuggestion = ""

    if (browser){
        window.addEventListener("keydown",e=>{

            if (e.key == "p"){
                if (e.metaKey){
                    e.preventDefault()
                    searching = true
                }
            }else if (e.key == "Escape"){
                searching = false
            }
        })
        window.addEventListener("keyup",(e)=>{

            if(!searching){return}

            if (e.key == "Meta" || e.key == "Escape"){
            }else if (e.key=="ArrowUp"){
                highlight_index = Math.max(highlight_index-1,0)
            }else if (e.key=="ArrowDown"){
                highlight_index = Math.min(highlight_index+1,results.length-1)
            }else if (e.key=="Tab"){
                let tag = results[highlight_index].tags
                console.log("tabbing");
                console.log(tag);
                
                if (typeof(tag)=="string" ){
                    tag = tag.split(":")[0]
                    console.log(tag);
                    tag = tag.split(".").slice(0,query.split(".").length).join(".")
                    
                    query = tag
                    bar.focus()
                }
                e.preventDefault()
            }else if (e.key=="Enter"){
                results[highlight_index].executor(query)
            }else{
                if (query == ""){results = []; return}
                highlight_index = 0
                results = search(query)
                let topres = results[0]
                console.log(topres.tags);
            }
        })

        window.addEventListener("click",e=>{
            if((e.target as HTMLElement).id == "search_btn"){return}
            searching = false
            searchhint = false
        })
    }

    let bar: HTMLElement

    $:if (searching){
        setup_search()
        tick().then(()=>{
            bar.focus()
        })
    }

    let searchhint = false

</script>

{#if searchhint}
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <span id = "search_btn" on:click={()=>{searchhint=false;searching=true}}>>> Cmd + P </span> 
{:else}
    <button id = "search_btn" on:click={(e)=>{ searchhint = true}} >⚙︎</button>
{/if}


<div class=searchbar hidden={!searching}>

    <p id=searchsuggestion>{fillsuggestion}</p>
    <input placeholder="search..." bind:this={bar} type="text" bind:value={query}>
    <div class="results">
        {#each results as res, i}        
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <p class={i==highlight_index ? "highlighted" : ""} on:click={()=>{res.executor(query)}}> {(typeof(res.rep) == 'string' ? res.rep : res.rep(query)) }</p>
            <br>
        {/each}
    </div>
</div>
