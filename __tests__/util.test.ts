// example.test.ts

import {is_link} from "../src/routes/util"



test('test utils', () => {

  expect(is_link("#link")).toBe(true)
  expect(is_link("#link.sin:auth.me:dd")).toBe(true)
  expect(is_link("@link")).toBe(true)
  expect(is_link("..link")).toBe(true)

  expect(is_link("#.link")).toBe(false)
  expect(is_link("#link:.author")).toBe(false)
  expect(is_link("#link.:")).toBe(false)
});


