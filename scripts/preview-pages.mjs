import http from "node:http"
import handler from "serve-handler"

const port = Number(process.env.PORT || 4173)

http
  .createServer((request, response) => handler(request, response, { public: "dist" }))
  .listen(port, () => {
    console.log(`Previewing dist at http://localhost:${port}`)
  })
