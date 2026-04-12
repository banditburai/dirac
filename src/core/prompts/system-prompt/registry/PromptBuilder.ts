import { SYSTEM_PROMPT } from "../template"
import { TemplateEngine } from "../templates/TemplateEngine"
import type { SystemPromptContext } from "../types"

export class PromptBuilder {
	private templateEngine: TemplateEngine

	constructor(private context: SystemPromptContext) {
		this.templateEngine = new TemplateEngine()
	}

	async build(): Promise<string> {
		const promptTemplate = SYSTEM_PROMPT(this.context)
		const placeholders = this.preparePlaceholders()
		const prompt = this.templateEngine.resolve(promptTemplate, this.context, placeholders)
		return this.postProcess(prompt)
	}

	private preparePlaceholders(): Record<string, unknown> {
		const placeholders: Record<string, unknown> = {}

		placeholders["OS"] = process.platform
		placeholders["SHELL"] = this.context.activeShellPath || process.env.SHELL || "bash"
		placeholders["SHELL_TYPE"] = this.context.activeShellType || "bash"
		placeholders["HOME_DIR"] = process.env.HOME || ""
		placeholders["CURRENT_DATE"] = new Date().toISOString().split("T")[0]

		// Add runtime placeholders if any
		const runtimePlaceholders = (this.context as any).runtimePlaceholders
		if (runtimePlaceholders) {
			Object.assign(placeholders, runtimePlaceholders)
		}

		return placeholders
	}

	private postProcess(prompt: string): string {
		if (!prompt) {
			return ""
		}

		return prompt
			.replace(/\n\s*\n\s*\n/g, "\n\n") // Remove multiple consecutive empty lines
			.trim() // Remove leading/trailing whitespace
			.replace(/====+\s*$/, "") // Remove trailing ==== after trim
			.replace(/\n====+\s*\n+\s*====+\n/g, "\n====\n") // Remove empty sections between separators
			.replace(/====\s*\n\s*====\s*\n/g, "====\n") // Remove consecutive empty sections
			.replace(/^##\s*$[\r\n]*/gm, "") // Remove empty section headers (## with no content)
			.replace(/\n##\s*$[\r\n]*/gm, "") // Remove empty section headers that appear mid-document
			.replace(/====+\n(?!\n)([^\n])/g, (match, _nextChar, offset, string) => {
				const beforeContext = string.substring(Math.max(0, offset - 50), offset)
				const afterContext = string.substring(offset, Math.min(string.length, offset + 50))
				const isDiffLike = /SEARCH|REPLACE|\+\+\+\+\+\+\+|-------/.test(beforeContext + afterContext)
				return isDiffLike ? match : match.replace(/\n/, "\n\n")
			})
			.replace(/([^\n])\n(?!\n)====+/g, (match, prevChar, offset, string) => {
				const beforeContext = string.substring(Math.max(0, offset - 50), offset)
				const afterContext = string.substring(offset, Math.min(string.length, offset + 50))
				const isDiffLike = /SEARCH|REPLACE|\+\+\+\+\+\+\+|-------/.test(beforeContext + afterContext)
				return isDiffLike ? match : prevChar + "\n\n" + match.substring(1).replace(/\n/, "")
			})
			.replace(/\n\s*\n\s*\n/g, "\n\n") // Clean up any multiple empty lines created by header removal
			.trim() // Final trim
	}
}
