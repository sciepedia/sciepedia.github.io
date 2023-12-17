
<script lang='ts'>
    import { browser } from "$app/environment";
    import { tick } from "svelte";
    import { get_completions } from "./autocomplete";
    import { PathData } from "./link";
    import { prevent_default } from "svelte/internal";
    import { search, type searchResult } from "./search";




    let searching:boolean = false
    let query:string = ""

    type restulttype = "page"
    // type searchresult = {type:restulttype, rep:string, data:PathData}

    let results:searchResult[] = []

    // function typerep(t:restulttype){
    //     if (t == "page"){
    //         return "⎘"
    //     }
    // }


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
            if (e.key == "Meta" || e.key == "Escape"){
            }else{
                let res = search(query)
                results = res
            }
            
        })

        window.addEventListener("click",e=>{
            console.log((e.target as HTMLElement) .id);
            
            if((e.target as HTMLElement).id == "search_btn"){return}
            searching = false
            searchhint = false
        })
    }

    let bar: HTMLElement

    $:if (searching){
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

    <input placeholder="search..." bind:this={bar} type="text" bind:value={query}>
    <div class="results">
        {#each results as res}        
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <p on:click={()=>{res.executor()}}> {res.rep}</p>
            <br>
        {/each}
    </div>
</div>

<style>
   
</style>