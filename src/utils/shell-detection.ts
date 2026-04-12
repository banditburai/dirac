import * as fs from "fs"
import * as path from "path"

export type ShellType = "bash" | "git-bash" | "wsl" | "powershell" | "cmd"

export interface ShellInfo {
	type: ShellType
	path: string
	isPosix: boolean
}

/**
 * Detects the best available shell on the system.
 *
 * Priority on Windows:
 * 1. Git Bash (Full GNU tools)
 * 2. WSL (Native Linux environment)
 * 3. PowerShell (Modern Windows shell)
 * 4. cmd.exe (Legacy fallback)
 *
 * On macOS/Linux:
 * Detects the active shell from environment or defaults to bash.
 */
export function detectBestShell(): ShellInfo {
	if (process.platform !== "win32") {
		const shellPath = process.env.SHELL || "/bin/bash"
		const shellName = path.basename(shellPath).toLowerCase()

		return {
			type: "bash", // We treat all Unix shells as 'bash' for instruction purposes as they are POSIX compliant
			path: shellPath,
			isPosix: true,
		}
	}

	// Windows hunting logic
	// 1. Git Bash
	const gitBashPath = "C:\\Program Files\\Git\\bin\\bash.exe"
	if (fs.existsSync(gitBashPath)) {
		return {
			type: "git-bash",
			path: gitBashPath,
			isPosix: true,
		}
	}

	// 2. WSL
	const wslPath = path.join(process.env.SystemRoot || "C:\\Windows", "System32", "wsl.exe")
	if (fs.existsSync(wslPath)) {
		return {
			type: "wsl",
			path: wslPath,
			isPosix: true,
		}
	}

	// 3. PowerShell 7 (pwsh)
	const pwshPath = path.join(process.env.ProgramFiles || "C:\\Program Files", "PowerShell", "7", "pwsh.exe")
	if (fs.existsSync(pwshPath)) {
		return {
			type: "powershell",
			path: pwshPath,
			isPosix: false,
		}
	}

	// 4. Windows PowerShell
	const powershellPath = path.join(
		process.env.SystemRoot || "C:\\Windows",
		"System32",
		"WindowsPowerShell",
		"v1.0",
		"powershell.exe",
	)
	if (fs.existsSync(powershellPath)) {
		return {
			type: "powershell",
			path: powershellPath,
			isPosix: false,
		}
	}

	// 5. cmd.exe (last resort)
	return {
		type: "cmd",
		path: process.env.COMSPEC || "cmd.exe",
		isPosix: false,
	}
}

/**
 * Gets the execution arguments for a given shell and command.
 */
export function getShellArgs(shellInfo: ShellInfo, command: string): string[] {
	switch (shellInfo.type) {
		case "bash":
		case "git-bash":
			return ["-c", command]
		case "wsl":
			return ["-e", "bash", "-c", command]
		case "powershell":
			return ["-Command", command]
		case "cmd":
			return ["/c", command]
		default:
			return ["-c", command]
	}
}
