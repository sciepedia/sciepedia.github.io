

<script lang='ts'>

    import { createClient, type SignUpWithPasswordCredentials} from '@supabase/supabase-js'
    import { get_user_name, login, register, set_user_name } from '../backend';
    import { hash, valid_username } from '../util';
    import { email, pwdhash, username } from '../store';


    const pub_anon_key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InliZm9jbmJkZHZleXloZml6dmpqIiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTYzMzMzMzMsImV4cCI6MjAxMTkwOTMzM30.8YyrLgEjoBRBgs5IG4ekuY8qjqvEnjtviRygTtARIx8"

    const supabase = createClient('https://ybfocnbddveyyhfizvjj.supabase.co', pub_anon_key)

    async function _register(){
        if (password != password2){
            pwd2error = "password does not match."
            return
        }
        $pwdhash = hash(password)

        let {user, error} = await register($email, $pwdhash)
        if (error!=null){
            neterror = error.message
            return
        }
        userid = user!.id
        pick_username = true
    }
    
    let userid:string = ""

    async function _login(){
        $pwdhash = hash(password)
        let {user,error} = await login($email,$pwdhash)
        if (error) {
            neterror = error.message
        }else{
            userid = user!.id
        }
        $username = await get_user_name(userid!)

        if (!$username){
            pick_username = true
        }else{   
            window.location.pathname = "/"
        }
    }

    async function _set_username(){
        let {data,error} = await set_user_name(userid!)
        if (error){
            usernameerror  = error.message
            return
        }
        
        window.location.pathname = "/"
    }get_user_name

    let new_account = true
    let pick_username = false

    let pwderror = ""
    let pwd2error = ""
    let usererror = ""
    let neterror = ""
    let usernameerror = ""

    let password = ""
    let password2 =""

    
</script>



<div id = page>

    <a id = homebutton href="/">Sciepedia</a>

    {#if ! pick_username}
        {#if new_account }
            <div class = content>

                <h2>Register</h2>

                <br>

                <table>
                    <tr>
                        <td>
                            <label for="userinput">email:</label>
                        </td>

                        <td>
                            <input type="text"  placeholder="example@mail.com" bind:value={$email}>
                        </td>
                    </tr>

                    <tr><td></td><td>
                        <p class = error>{usererror}</p>
                    </td></tr>

                    <tr>
                        <td>
                            <label for="userinput">password:</label>
                        </td>

                        <td>
                            <input type="password" name=userinput placeholder="password" bind:value={password}>
                        </td>
                        
                    </tr>
                    <tr><td></td><td>
                        <p class = error>{pwderror}</p>
                    </td></tr>

                    <tr>
                        <td>

                            <label for="userinput">password:</label>

                            </td><td>
                            <input type="password" name=userinput placeholder="repeat password" bind:value={password2}>


                        </td>

                    </tr>
                    <tr><td></td><td>
                        <p class = error>{pwd2error}</p>
                    </td></tr>

                </table>

                <br>

                <button class = 'loginbtn' on:click={_register}>login</button>

                <br>
                <p class=error>{neterror}</p>
                <br>
                <br>
                <button class = "switchbtn" on:click={()=>new_account = false}>Already have an account? Login instead.</button>


            </div>
        {:else}

            <div class = content>

                <h2>Anmelden</h2>

                <br>
                <table>
                    <tr>
                        <td>
                            <label for="userinput">email:</label>
                        </td>

                        <td>
                            <input type="text" name=userinput placeholder="example@mail.com" bind:value={$email}>
                        </td>
                    </tr>

                    <tr><td></td><td>
                        <p class = error>{usererror}</p>
                    </td></tr>

                    <tr>
                        <td>
                            <label for="userinput">password:</label>
                        </td>

                        <td>
                            <input type="password" name=userinput placeholder="password" bind:value={password}>
                        </td>
                        
                    </tr>
                    <tr><td></td><td>
                        <p class = error>{pwderror}</p>
                    </td></tr>

                    <tr><td></td><td>
                        <p class = error>{pwd2error}</p>
                    </td></tr>

                </table>
                <br>

                <button class = 'loginbtn' on:click={_login}>login</button>
                <br>
                <p class=error>{neterror}</p>
                <br>
                <br>
                <button class = "switchbtn" on:click={()=>new_account = true}> Don't have an account? Sign up.</button>


            </div>

        {/if}
    {:else}
        <div class="content">

            <h2>pick username</h2>

            <input type="text" placeholder="username" bind:value={$username}>
            <p class="error">{usernameerror}</p>

            <button on:click={_set_username}>update</button>

        </div>
    {/if}

</div>


<style>

    #homebutton{
        text-decoration: none;
        color: #ffe6af5d;
        font-weight: bold;

    }


    #page{
        text-align: center;

        margin-left: 0;
        width:100%;
        padding-left:0;
    }

    .content{
        margin:auto;
    }

    input{
        all:unset;
        background-color: rgba(192, 178, 141, 0.126);
        padding: .2em;
        width:20em;
    }
    button{
        all:unset;
        all:unset;
        cursor: pointer;

    }

    .error{
        color:red
    }

    .loginbtn{
        background-color: var(--green);

        padding: .5em 1em;
        border-radius: .2em;
        margin: auto;
        color:var(--color);
    }

    .switchbtn{
        color: var(--green);

        font-style: italic;
    }

    table{
        text-align: left;
        margin: auto;
    }

        
    p{
        min-height: 0;
        padding-bottom: 1em;
        padding-right:1em;
    }


</style>