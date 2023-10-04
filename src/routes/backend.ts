import { createClient, type SignUpWithPasswordCredentials } from '@supabase/supabase-js'
import type { NoteData } from './data_store';
import { pwdhash, userId, username } from './store';
import { get } from 'svelte/store';
import type { PathData } from './link';
import { set_store_value } from 'svelte/internal';



const pub_anon_key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InliZm9jbmJkZHZleXloZml6dmpqIiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTYzMzMzMzMsImV4cCI6MjAxMTkwOTMzM30.8YyrLgEjoBRBgs5IG4ekuY8qjqvEnjtviRygTtARIx8"
const supabase = createClient('https://ybfocnbddveyyhfizvjj.supabase.co', pub_anon_key)


export async function login(email:string, password:String){
    
    let res = await supabase.auth.signInWithPassword({email,password:get(pwdhash)})
    if (res.error != null){
        return {user:null, error:res.error}
    }
    userId.set(res.data.user.id)
    return {user:res.data.user!,error:null}
}

export async function register(email:string, password:String){

    let res = await supabase.auth.signUp({email,password: get(pwdhash)})
    if (res.data.user != null){
        userId.set(res.data.user.id)
    }
    console.log(res);

    
    return {user:res.data.user, error:res.error}
}


export async function getitem(key :PathData){
  
    console.log("backend get ",key)

    const title = key.location.join(".")

    let {data,error} = await supabase.from ("notes").select("*").eq("title",title).eq("is_public", key.pub).eq("user_id",get(userId))
    if (error){
        throw new Error(error.message)
    }

    if (data!.length>0){
        return data![0].content as string
    }
    throw new Error('no data found for that key')

}



export async function setitem (key:PathData, content:string){
    
    const title = key.location.join(".")
    let resp = await supabase.from("notes")
        .upsert({content:content,user_id:get(userId),title:title,is_public:key.pub})
    
}

export async function get_user_name(userId:string){


    if (userId == ""){
        return "system"
    }
    let {data,error} =  await supabase
        .from("userdata")
        .select("*")
        .eq("id",userId)

    if (data!.length > 0){
        return data![0].username as string
    }
    return ""
}

export async function set_user_name(userid:string){
    username.set(get(username).toLowerCase())
    return  await supabase.from("userdata").upsert({"id":userid,"username":get(username)}).select()
}

export function rate(key:string, rating:number){
    console.log("rating",key,rating);
}

export async function pick_username(username:String){

}