import { UiServiceClient } from "@/shared/api/grpc-client"
import * as proto from "@shared/proto/index"
import { useSettingsStore } from "@/features/settings/store/settingsStore"
import { VSCodeButton } from "@vscode/webview-ui-toolkit/react"
import { useEffect } from "react"
import { ModelSelector } from "../common/ModelSelector"
import { ModelInfoView } from "../common/ModelInfoView"
import { useApiConfigurationHandlers } from "../utils/useApiConfigurationHandlers"
import { normalizeApiConfiguration } from "@/features/settings/components/utils/providerUtils"
import type { Mode } from "@shared/ExtensionMessage"
// StateManager is not available in webview, using models from store instead

interface GithubCopilotProviderProps {
	showModelOptions: boolean
	isPopup?: boolean
	currentMode: Mode
}

export const GithubCopilotProvider = ({ showModelOptions, isPopup, currentMode }: GithubCopilotProviderProps) => {
	const { apiConfiguration } = useSettingsStore()
	const { handleModeFieldChange } = useApiConfigurationHandlers()
	const isAuthenticated = useSettingsStore((state) => state.githubCopilotIsAuthenticated)
	const email = useSettingsStore((state) => state.githubCopilotEmail)

	const { selectedModelId, selectedModelInfo } = normalizeApiConfiguration(apiConfiguration, currentMode)

	// Get models from cache
	const models = useSettingsStore((state) => state.githubCopilotModels || {})

	useEffect(() => {
		// Authentication state is now managed via useSettingsStore
	}, [])

	const handleLogin = async () => {
		try {
			await UiServiceClient.githubCopilotLogin(proto.dirac.EmptyRequest.create({}))
		} catch (error) {
			console.error("Failed to initiate GitHub Copilot login:", error)
		}
	}

	return (
		<div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
			<div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 5 }}>
				<span style={{ fontWeight: 500 }}>GitHub Copilot</span>
				{isAuthenticated ? (
					<span style={{ fontSize: "12px", color: "var(--vscode-descriptionForeground)" }}>
						Logged in as {email || "authenticated user"}
					</span>
				) : (
					<VSCodeButton appearance="primary" onClick={handleLogin}>
						Sign in with GitHub
					</VSCodeButton>
				)}
			</div>

			{isAuthenticated && showModelOptions && (
				<>
					<ModelSelector
						label="Model"
						models={models}
						onChange={(e: any) =>
							handleModeFieldChange(
								{ plan: "planModeApiModelId", act: "actModeApiModelId" },
								e.target.value,
								currentMode,
							)
						}
						selectedModelId={selectedModelId}
					/>
					<ModelInfoView isPopup={isPopup} modelInfo={selectedModelInfo as any} selectedModelId={selectedModelId} />
				</>
			)}
		</div>
	)
}
