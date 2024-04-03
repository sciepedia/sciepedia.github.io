

export class Writable<T>{

  value: T;
  subscribers: Function[];
  key:string;
  hash:string;

  constructor(key:string, value:T){

    if (localStorage.getItem(key) === null){
      localStorage.setItem(key, JSON.stringify(value));
    }else {
      value = JSON.parse(localStorage.getItem(key) as string);
    }
    this.value = value
    this.subscribers = []
    this.key = key
    this.hash = JSON.stringify(value)
  }
  set(newValue: T){
    
    if (this.hash == JSON.stringify(newValue))return
    this.value = newValue
    localStorage.setItem(this.key, JSON.stringify(newValue))
    this.subscribers.forEach((callback) => callback(newValue))

  }
  subscribe(callback: (value: T) => any){
    this.subscribers.push(callback)
  }
  update(callback: (value:T) => T){
    this.set(callback(this.value))
  }
}