import { DOMParser } from "jsr:@b-fuze/deno-dom"
console.log(
    'Please open https://summer.hackclub.com, sign in, then find the "_journey_session" cookie. Once you log out of the website, it will invalidate the cookie, disabling this tool.'
)
const session = prompt("Paste it here:")
if (!session) {
    console.log("Please enter a session ID")
    Deno.exit(1)
}
let projectIds: string[] = []
try {
    const res = await fetch("https://summer.hackclub.com/map", {
        headers: {
            Cookie: "_journey_session=" + session,
            "User-Agent": "JmeowsMapBot (#som-map-botnet on Slack)",
        },
    })
    if (res.url != "https://summer.hackclub.com/map") {
        throw "error"
    }
    const htmlBody = await res.text()
    const doc = new DOMParser().parseFromString(htmlBody, "text/html")
    projectIds = new Array(
        ...doc.querySelectorAll('[data-map-target="placeableProjects"] div')
    ).map((x) => x.getAttribute("data-project-id")!)
    console.log(projectIds)
} catch (_err) {
    console.log("Invalid session")
    Deno.exit(1)
}
async function getCSRF() {
    const res = await fetch("https://summer.hackclub.com/map", {
        headers: {
            Cookie: "_journey_session=" + session,
            "User-Agent": "JmeowsMapBot (#som-map-botnet on Slack)",
        },
    })
    if (res.url != "https://summer.hackclub.com/map") {
        throw "error"
    }
    const htmlBody = await res.text()
    const doc = new DOMParser().parseFromString(htmlBody, "text/html")
    return doc.querySelector('meta[name="csrf-token"]')!.getAttribute("content")
}
projectIds.forEach(async (id) => {
    const point = await (
        await fetch("http://localhost:5218/pointfor/" + id)
    ).text()
    await fetch(
        "https://summer.hackclub.com/projects/" + id + "/update_coordinates",
        {
            method: "PATCH",
            body: point.replace("point", "project"),
            headers: {
                Cookie: "_journey_session=" + session,
                "User-Agent": "JmeowsMapBot (#som-map-botnet on Slack)",
                "Content-Type": "application/json",
                "X-CSRF-Token": (await getCSRF())!,
            },
        }
    )
    console.log("Moved project " + id + " to " + point)
})
