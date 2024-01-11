/**
 * @jest-environment jsdom
 */


import {is_link, is_youtube_link, make_youtube_player, valid_username} from "../src/routes/util"



test('test is_link', () => {

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


test('test youtube video embedding', () => {
  let link = "https://www.youtube.com/watch?v=8U8kK3SpLTU&t=745s"

  expect(is_youtube_link(link)).toBeTruthy()
  expect(is_youtube_link("https://www.youtube.com/embed/8U8kK3SpLTU")).toBeTruthy()
  expect(is_youtube_link("https://www.google.com")).toBeFalsy()

  let player = make_youtube_player(link)
  expect(player).toBeInstanceOf(HTMLIFrameElement)
  expect(player.src).toBe("https://www.youtube.com/embed/8U8kK3SpLTU")
  expect(player.classList.contains("youtubeplayer")).toBe(true)

})
