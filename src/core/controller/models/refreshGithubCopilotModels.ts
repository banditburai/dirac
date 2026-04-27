import { ModelInfo } from "@shared/api"
import { StateManager } from "@/core/storage/StateManager"
import { githubCopilotAuthManager } from "@/integrations/github-copilot/auth"
import { Logger } from "@/shared/services/Logger"
import { getCopilotToken, fetchCopilotModels, transformCopilotModelToModelInfo } from "@/integrations/github-copilot/api"

export async function refreshGithubCopilotModels(): Promise<Record<string, ModelInfo>> {
	try {
		const githubToken = await githubCopilotAuthManager.getAccessToken()
		if (!githubToken) {
			return {}
		}

		const token = await getCopilotToken(githubToken)
		const rawModels = await fetchCopilotModels(token)

		const models: Record<string, ModelInfo> = {}
		for (const rawModel of rawModels) {
			models[rawModel.id] = transformCopilotModelToModelInfo(rawModel)
		}

		StateManager.get().setModelsCache("github-copilot", models)
		return models
	} catch (error) {
		Logger.error("[github-copilot] Error refreshing models:", error)
		return {}
	}
}
