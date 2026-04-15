/**
 * Opens a URL in the user's default browser.
 * Uses dynamic import of the 'open' package to open URLs.
 *
 * @param url - The URL to open in the browser
 */
export async function openUrlInBrowser(url: string): Promise<void> {
	try {
		const { default: open } = await import("open")
		const cp = await open(url)
		cp.on("error", () => {
			// Ignore spawn errors, the user will see the URL in the UI if applicable
		})
	} catch {
		// Ignore errors
	}
}
