import { createClient, type SignUpWithPasswordCredentials } from '@supabase/supabase-js'
import type { NoteData, uuid } from './data_store';
import { pwdhash, userId, username } from './store';
import { get } from 'svelte/store';
import { PathData } from './link';
import { set_store_value } from 'svelte/internal';
import type { Note } from './note';

const pub_anon_key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InliZm9jbmJkZHZleXloZml6dmpqIiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTYzMzMzMzMsImV4cCI6MjAxMTkwOTMzM30.8YyrLgEjoBRBgs5IG4ekuY8qjqvEnjtviRygTtARIx8"
const supabase_url = 'https://ybfocnbddveyyhfizvjj.supabase.co'
const supabase = createClient(supabase_url, pub_anon_key)

export async function login(email:string, password:String){
    
    let res = await supabase.auth.signInWithPassword({email,password:get(pwdhash)})
    if (res.error != null){
        return {user:null, error:res.error}
    }
    userId.set(res.data.user.id as uuid)
    return {user:res.data.user!,error:null}
}

export async function register(email:string, password:String){

    let res = await supabase.auth.signUp({email,password: get(pwdhash)})
    if (res.data.user != null){
        userId.set(res.data.user.id as uuid)
    }
    
    return {user:res.data.user, error:res.error}
}

export async function getitem(key :PathData):Promise<NoteData|null>{

    if (key.author == "me"){
        return null
    }
    const title = key.location.join(".")

    let userid = await get_user_id(key.author)
    let {data,error} = await supabase.from ("notes").select("*").eq("title",title).eq("is_public", key.pub).eq("user_id",userid)
    if (error){
        throw new Error(error.message)
    }

    if (data!.length>0){
        const d = data![0]
        const res:NoteData = {
            id:d.id,
            Path:new PathData(d.is_public,d.user_id,d.title.split(".")),
            Content:d.content,
            comment_of: d.comment_of ?? undefined,
        }
        return res
    }
    return null
}

export async function getiditem (id:uuid):Promise <NoteData|null>{

    let {data,error} = await supabase.from ("notes").select("*").eq("id", id)
    
    if (error)throw error
    if (data!.length>0) {
        const d = data![0]
        const Path = new PathData(d.is_public,await get_user_name(d.user_id),d.title.split("."))
        
        const res= {
            Path,
            Content:d.content,
            id:d.id
        }
        return res
    }
    return null
}

export async function getcomments(id:uuid){
    let {data,error} = await supabase.from("notes").select("*").eq("comment_of",id)
    if (error) throw error
    return await Promise.all(
        data!.map(async (d) => {
          const Path = new PathData(d.is_public, await get_user_name(d.user_id), d.title.split("."));
          return {
            Path,
            Content: d.content,
            id: d.id,
          } as NoteData;
        })
      );  
}

export async function getPath(id:uuid){

}

export async function setitem (n:NoteData){
    const title = n.Path.location.join(".")
    const arg = {
        content:n.Content,
        user_id:get(userId),
        title:title,
        is_public:n.Path.pub,
        id:n.id,
        comment_of: n.comment_of?? null,
    }    

    let resp = await supabase.from("notes").upsert(arg)
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

export async function get_user_id(username:string){
    
    let {data,error} = await supabase
        .from ("userdata")
        .select("id")
        .eq("username",username)
    
    if (error){throw new Error(error.message)}
    if (data!.length > 0){
        return data![0].id as string
    }
    throw new Error("no data found for "+username)
}

export async function set_user_name(userid:string){
    username.set(get(username).toLowerCase())
    return  await supabase.from("userdata").upsert({"id":userid,"username":get(username)}).select()
}

export function rate(key:string, rating:number){
    console.log("rating",key,rating);
}

// export async function pick_username(username:String){

// }

export async function upload_image(path:string, file:File){
    const {data,error} = await supabase.storage.from("images").upload(path,file)
    if (error){
        console.error(error);
    }
    // https://ybfocnbddveyyhfizvjj.supabase.co/storage/v1/object/public/images/new%20image
    const pub_url = supabase_url + "/storage/v1/object/public/images/" + (data!=null ? data.path : path)
    return pub_url
}


