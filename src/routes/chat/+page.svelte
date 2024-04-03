<h1>chat</h1>

<div id=chat></div>

<div id="inputmask">
  <textarea id="" rows='1' ></textarea>
  <button id=sendbtn>send</button>
  <button id=resetbtn>reset</button>
</div>

<link rel="stylesheet" href="chatstyle.css">

<script lang='ts'>
  import {onMount } from "svelte";
  import {mount} from "./chat"
  onMount(mount)
  import { get_embeddings } from "./api_connection";
  get_embeddings(["hello"]).then(emb=>console.log(emb))
  
</script>
