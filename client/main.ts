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
