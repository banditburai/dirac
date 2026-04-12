import { DiracDefaultTool } from "@/shared/tools"
import type { DiracToolSpec } from "../spec"

export const execute_command: DiracToolSpec = {
	id: DiracDefaultTool.BASH,
	name: "execute_command",
	description:
		"Executes CLI commands on the system. Provide an array of commands for sequential execution. In multi-root workspaces, you can use @workspace:command syntax (e.g., @backend:npm install) to execute a command in a specific workspace. You are running in a fully capable shell; leverage standard Unix tools (grep, sed, awk, etc.) for efficient file manipulation when available.",
	parameters: [
		{
			name: "commands",
			required: true,
			type: "array",
			items: { type: "string" },
			instruction:
				"An array of CLI commands to execute in sequence. Use proper shell operators within each command. Do not use ~ for home directory.",
		},
	],
}
