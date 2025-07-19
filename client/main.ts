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
    const mapData = JSON.parse(
        doc
            .querySelector('[data-controller="map"]')
            ?.getAttribute("data-map-projects-value")!
    )
    const userId = parseInt(
        doc
            .querySelector('[data-controller="map"]')
            ?.getAttribute("data-map-user-id-value")!
    )
    projectIds.push(
        ...mapData
            .filter((x: { user_id: number }) => x.user_id == userId)
            .map((x: { id: number }) => x.id.toString())
    )
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
let remaining = projectIds.length
projectIds.forEach(async (id) => {
    const point = await (
        await fetch("http://som-map.jmeow.hackclub.app/pointfor/" + id)
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
    remaining--
    if (remaining === 0) {
        console.log(
            "Done. Thanks for contributing to the map art, come back again sometime! Also you may be added to the @som-map-botters user group, feel free to leave if you want to."
        )
    }
})
