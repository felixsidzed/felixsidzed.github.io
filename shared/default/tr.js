async function render(html) {
	let rendered = html

	rendered = rendered.replace(/{{\s+defaultstyle\s+}}/g, () => {
		return '<link rel="stylesheet" href="/shared/default/default.css">'
	})

	const includes = [...rendered.matchAll(/{{\s+include (".+"|'.+')\s+}}/g)]
	
	for (const include of includes) {
		const response = await fetch("/" + include[1].slice(1, -1))
		
		if (!response.ok)
			throw new Error(`network response was not ok: ${response.statusText}`)
		
		rendered = rendered.replace(include[0], await response.text())
	}

	return rendered
}

const startTime = new Date()
document.addEventListener("DOMContentLoaded", async () => {
	document.body.innerHTML = await render(document.body.innerHTML)
	document.head.innerHTML = await render(document.head.innerHTML)
	console.log(`rendered in ${(new Date() - startTime)}ms`)
})