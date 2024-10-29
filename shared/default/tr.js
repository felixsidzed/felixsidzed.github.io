async function render(html) {
	let rendered = html

	rendered = rendered.replace(/{{\s+head(?: "(.+)")?\s+}}/g, (match, title) => {
		return `<meta charset="utf-8">
		<meta http-equiv="X-UA-Compatible" content="IE=edge">
		<title>felix${title ? " - " + title : ""}</title>
		<meta name="viewport" content="width=device-width, initial-scale=1">
		<link rel="icon" type="image/x-icon" href="/shared/media/silly_car.png">
		{{ defaultstyle }}`
	})
	rendered = rendered.replace(/{{\s+defaultcss\s+}}|{{\s+defaultstyle\s+}}/g, `<link rel="stylesheet" href="/shared/default/default.css">`)

	const includePromises = []
	for (const match of [...rendered.matchAll(/{{\s+include\s+"(.+?)"\s+}}/g)]) {
		includePromises.push(fetch(`/` + match[1])
			.then(response => {
				if (!response.ok)
					throw new Error(`network response was not ok: ${response.statusText}`)
				return response.text()
			})
			.then(content => rendered = rendered.replace(match[0], content)))
	}
	await Promise.all(includePromises)

	return rendered
}

const startTime = new Date()
document.addEventListener("DOMContentLoaded", async () => {
	document.body.innerHTML = await render(document.body.innerHTML)
	document.head.innerHTML = await render(document.head.innerHTML)
	console.log(`rendered in ${new Date() - startTime}ms`)
})
