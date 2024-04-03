import { Writable } from "./store";
import { get_answer } from "./api_connection";

let chat : HTMLDivElement
let input : HTMLTextAreaElement
let submitbtn : HTMLButtonElement
let resetbtn : HTMLButtonElement
type Role = 'user' | 'assistant' | 'system'
type Key = string


let last_message: Writable<Key> = new Writable('last_message', '')
let chat_history = new Writable<Key[]>('history', [])

export type Message = {
  parent_key: Key
  key: Key
  role: Role
  content: string
  child_keys: Key[]
}

const messages = new Map<string, Writable<Message>>()

class Bubble{
  msg: Writable<Message>
  element: HTMLDivElement
  constructor(msg: Writable<Message>){
    this.msg = msg
    this.element = document.createElement('div')
    this.element.classList.add('message')
    this.element.classList.add(msg.value.role)
    this.setContent(msg.value.content)
    chat.appendChild(this.element)
    msg.subscribe((msg)=>{
      this.setContent(msg.content)
    })
  }
  setContent(content: string){
    this.element.innerHTML = ""
    
    let txt = document.createElement("div")
    txt.classList.add("text")
    this.element.appendChild(txt)
    let c = 0
    content.split("\n").forEach((line)=>{
      if (line.startsWith("```")){
        c = (c+1)%2
        txt = document.createElement("div")
        let lang = ['text','code'][c]
        txt.classList.add(lang)
        this.element.appendChild(txt)
      }else{
        txt.textContent += line + "\n"
      }
    })
  }
}

const bubbles = new Map<string, Bubble>()
function createKey(){return Math.random().toString(36).slice(-8)}

function handle_command(content:string){
  new Bubble(new Writable<Message>("M_"+createKey(), {role: 'user', content, parent_key: "", key: "", child_keys: []}))
  let cmd = content.slice(1)
  let words = cmd.split(' ')
  cmd = words[0]
  let payload = words.slice(1)
  new Bubble(new Writable<Message>("M_"+createKey(), {role: 'assistant', content: 'Command received: '+cmd, parent_key: "", key: "", child_keys: []}))

}

function push_message(content:string){
  if (content.startsWith('/')) return handle_command(content)
  let key = "M_"+createKey()
  let msg = new Writable<Message>(key, {role: 'user', content, parent_key: last_message.value, key, child_keys: []})
  messages.set(key, msg)
  new Bubble(msg)
  last_message.set(key)
  let response_key = "M_"+createKey()
  let response = new Writable<Message>(response_key, {role: 'assistant', content: '...', parent_key: key, key: response_key, child_keys: []})

  let hist:Message[] = [msg.value]
  for (let i = 0; i < 10; i++){
    let pmsg = get_message(hist[0].parent_key)
    if (!pmsg) break
    hist = [pmsg.value, ...hist]
  }

  get_answer(hist,(chunk)=>{response.update((rmsg)=>{
    console.log(chunk);
    rmsg.content = rmsg.content.slice(0,rmsg.content.length-3) + chunk + "..."
    return rmsg
  })}).then(()=>{
    response.update((rmsg)=>{
      rmsg.content = rmsg.content.slice(0,rmsg.content.length-3)
      return rmsg
    })
    last_message.set(response_key)
  })
  new Bubble(response)
}

function get_message(key: Key){
  if (!key) return null
  if (messages.has(key)) return messages.get(key)!
  return new Writable<Message>(key, {role: 'system', content: 'Message not found', parent_key: '', key, child_keys: []})
}

export function mount(){

  chat = document.querySelector('#chat') as HTMLDivElement
  input = document.querySelector('#inputmask>textarea') as HTMLTextAreaElement
  submitbtn = document.querySelector('#sendbtn') as HTMLButtonElement
  resetbtn = document.querySelector('#resetbtn') as HTMLButtonElement

  input.addEventListener('keyup', (e)=>{
    if(e.key == 'Enter' && e.shiftKey){
      push_message(input.value.slice(0,-1))
      input.value = ''
      return
    }
    input.rows = input.value.split("\n").length
  })

  if (last_message.value){
    let msg = get_message(last_message.value) 
    function display(msg: Writable<Message> | null){
      if (msg == null) return  
      display(get_message(msg.value.parent_key))
      new Bubble(msg)
    }
    display(msg)
  }

  submitbtn.addEventListener('click', ()=>{
    push_message(input.value)
    input.value = ''
  })
  resetbtn.addEventListener('click', ()=>{
    chat_history.update(val=>val.concat([last_message.value]))
    last_message.set('')
    chat.innerHTML = ''
    console.log(chat_history);
    
  })
}
