const points = [
    { x: 5, y: 5 },
    { x: 6, y: 5 },
    { x: 7, y: 5 },
]
const assignments: { [key: string]: number } = {}
let nextPoint = 0
Deno.serve({ port: 5218 }, (req) => {
    console.log(req.url)
    const url = new URL(req.url)
    if (url.pathname.startsWith("/pointfor/")) {
        const projectId = url.pathname.split("/pointfor/")[1]
        let point = { x: 0, y: 0 }
        if (projectId in assignments) {
            point = points[assignments[projectId]]
        } else if (nextPoint in points) {
            assignments[projectId] = nextPoint++
            point = points[assignments[projectId]]
        }
        return new Response(JSON.stringify({ point }), {
            headers: { "Content-Type": "application/json" },
        })
    }
    return new Response("asdf")
})
