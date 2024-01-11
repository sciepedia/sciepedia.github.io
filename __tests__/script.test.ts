import {can_preview_code, preview_code} from "../src/routes/script"

test("can_preview_code",()=>{
    expect(can_preview_code("console.log")).toBeTruthy()
    expect(can_preview_code("'hello'")).toBeTruthy()
    expect(can_preview_code("window.location")).toBeTruthy()

    expect(can_preview_code("console.log(22)")).toBeFalsy()
    expect(can_preview_code("while(true){}")).toBeFalsy()
    expect(can_preview_code("fetch(\"https://google.com\")")).toBeFalsy()

})
