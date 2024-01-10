// example.test.ts

import {is_link, valid_username} from "../src/routes/util"



test('test utils', () => {

  expect(is_link("#link")).toBe(true)
  expect(is_link("#link.sin:auth.me:dd")).toBe(true)
  expect(is_link("@link")).toBe(true)
  expect(is_link("..link")).toBe(true)

  expect(is_link("#.link")).toBe(false)
  expect(is_link("#link:.author")).toBe(false)
  expect(is_link("#link.:")).toBe(false)
  expect(is_link("#link<script>")).toBe(false)
});


test('test username check', () => {
  expect(valid_username("paul")).toBe(true)
  expect(valid_username("paul_ä")).toBe(true)

  expect(valid_username("me.you")).toBe(false)
  expect(valid_username("<script>")).toBe(false)

})
