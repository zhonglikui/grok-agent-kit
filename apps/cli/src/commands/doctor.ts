import { access, constants, readFile } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";

import { Command } from "commander";

import type { CliDependencies } from "../types.js";

type DoctorStatus = "PASS" | "WARN" | "FAIL";

interface DoctorCheck {
  status: DoctorStatus;
  label: string;
  detail: string;
  fix?: string;
}

export function createDoctorCommand(dependencies: CliDependencies): Command {
  return new Command("doctor")
    .description("Check local environment and configuration")
    .option("--json", "Print JSON output")
    .action(async (options) => {
      const checks = await collectDoctorChecks(dependencies);
      const summary = summarizeChecks(checks);

      if (options.json) {
        dependencies.writeStdout(
          JSON.stringify(
            {
              checks,
              summary
            },
            null,
            2
          )
        );
        return;
      }

      const lines = checks.flatMap((check) => [
        `${check.status} ${check.label}: ${check.detail}`,
        ...(check.fix ? [`  Fix: ${check.fix}`] : [])
      ]);

      lines.push("");
      lines.push(
        `Summary: ${summary.failures} failure(s), ${summary.warnings} warning(s), ${summary.passes} passing check(s).`
      );

      dependencies.writeStdout(lines.join("\n"));
    });
}

async function collectDoctorChecks(
  dependencies: CliDependencies
): Promise<DoctorCheck[]> {
  const checks: DoctorCheck[] = [];

  const nodeCheck = checkNodeVersion();
  const apiKeyCheck = checkApiKey(process.env.XAI_API_KEY);
  const baseUrlCheck = checkBaseUrl(process.env.XAI_BASE_URL);
  const managementApiKeyCheck = checkManagementApiKey(process.env.XAI_MANAGEMENT_API_KEY);
  const managementBaseUrlCheck = checkManagementBaseUrl(
    process.env.XAI_MANAGEMENT_BASE_URL
  );
  const modelCheck = checkDefaultModel(process.env.GROK_AGENT_KIT_MODEL);

  checks.push(nodeCheck);
  checks.push(apiKeyCheck);
  checks.push(baseUrlCheck);
  checks.push(managementApiKeyCheck);
  checks.push(managementBaseUrlCheck);
  checks.push(modelCheck);
  checks.push(
    await checkApiConnectivity(
      {
        apiKey: apiKeyCheck,
        baseUrl: baseUrlCheck
      },
      dependencies
    )
  );
  checks.push(
    await checkManagementApiConnectivity(
      {
        managementApiKey: managementApiKeyCheck,
        managementBaseUrl: managementBaseUrlCheck
      },
      dependencies
    )
  );

  const stateDirectory = join(homedir(), ".grok-agent-kit");
  checks.push(await checkStateDirectory(stateDirectory));
  checks.push(await checkSessionStore(stateDirectory));

  return checks;
}

function summarizeChecks(checks: DoctorCheck[]) {
  return {
    failures: checks.filter((check) => check.status === "FAIL").length,
    warnings: checks.filter((check) => check.status === "WARN").length,
    passes: checks.filter((check) => check.status === "PASS").length
  };
}

async function checkApiConnectivity(
  prerequisites: {
    apiKey: DoctorCheck;
    baseUrl: DoctorCheck;
  },
  dependencies: CliDependencies
): Promise<DoctorCheck> {
  if (
    prerequisites.apiKey.status === "FAIL" ||
    prerequisites.baseUrl.status === "FAIL"
  ) {
    return {
      status: "WARN",
      label: "XAI API connectivity",
      detail: "Skipped because API credentials or base URL are not valid yet.",
      fix: "Fix the failing XAI environment checks above, then re-run `grok-agent-kit doctor`."
    };
  }

  try {
    await dependencies.service.models();

    return {
      status: "PASS",
      label: "XAI API connectivity",
      detail: "Reached the xAI models endpoint successfully."
    };
  } catch (error) {
    const detail = error instanceof Error ? error.message : "Unknown API connectivity error";

    return {
      status: "FAIL",
      label: "XAI API connectivity",
      detail,
      fix: "Verify your network access, `XAI_API_KEY`, and `XAI_BASE_URL`, then re-run `grok-agent-kit doctor`."
    };
  }
}

async function checkManagementApiConnectivity(
  prerequisites: {
    managementApiKey: DoctorCheck;
    managementBaseUrl: DoctorCheck;
  },
  dependencies: CliDependencies
): Promise<DoctorCheck> {
  if (
    prerequisites.managementApiKey.status !== "PASS" ||
    prerequisites.managementBaseUrl.status === "FAIL"
  ) {
    return {
      status: "WARN",
      label: "xAI management API connectivity",
      detail: "Skipped because the management key or management base URL is not ready yet.",
      fix: "Set `XAI_MANAGEMENT_API_KEY` to use local team API key management commands."
    };
  }

  if (!dependencies.authService) {
    return {
      status: "WARN",
      label: "xAI management API connectivity",
      detail: "Auth service is not configured in this process.",
      fix: "Run the packaged CLI entrypoint or provide an auth service implementation."
    };
  }

  try {
    const validation = await dependencies.authService.validateManagementKey();

    return {
      status: validation.valid ? "PASS" : "FAIL",
      label: "xAI management API connectivity",
      detail: validation.valid
        ? `Validated the configured management key${validation.teamIds?.length ? ` for teams: ${validation.teamIds.join(", ")}` : "."}`
        : "Management API responded but reported the key as invalid.",
      ...(validation.valid
        ? {}
        : {
            fix: "Verify `XAI_MANAGEMENT_API_KEY`, then re-run `grok-agent-kit doctor`."
          })
    };
  } catch (error) {
    const detail = error instanceof Error ? error.message : "Unknown management API error";

    return {
      status: "FAIL",
      label: "xAI management API connectivity",
      detail,
      fix: "Verify `XAI_MANAGEMENT_API_KEY` and `XAI_MANAGEMENT_BASE_URL`, then re-run `grok-agent-kit doctor`."
    };
  }
}

function checkNodeVersion(): DoctorCheck {
  const majorVersion = Number(/^v(\d+)/.exec(process.version)?.[1] ?? 0);

  if (majorVersion >= 20) {
    return {
      status: "PASS",
      label: "Node.js",
      detail: `Detected ${process.version}`
    };
  }

  return {
    status: "FAIL",
    label: "Node.js",
    detail: `Detected ${process.version}; grok-agent-kit requires Node.js 20 or newer.`,
    fix: "Install Node.js 20+ and re-run `grok-agent-kit doctor`."
  };
}

function checkApiKey(apiKey: string | undefined): DoctorCheck {
  if (apiKey && apiKey.trim().length > 0) {
    return {
      status: "PASS",
      label: "XAI_API_KEY",
      detail: "Environment variable is set."
    };
  }

  return {
    status: "FAIL",
    label: "XAI_API_KEY",
    detail: "Environment variable is missing or empty.",
    fix: "Set `XAI_API_KEY` in your shell or MCP client environment."
  };
}

function checkBaseUrl(baseUrl: string | undefined): DoctorCheck {
  const resolvedBaseUrl = baseUrl && baseUrl.trim().length > 0
    ? baseUrl
    : "https://api.x.ai/v1";

  try {
    const parsedUrl = new URL(resolvedBaseUrl);

    return {
      status: "PASS",
      label: "XAI_BASE_URL",
      detail: `Using ${parsedUrl.toString()}`
    };
  } catch {
    return {
      status: "FAIL",
      label: "XAI_BASE_URL",
      detail: `Value is not a valid absolute URL: ${resolvedBaseUrl}`,
      fix: "Set `XAI_BASE_URL` to a valid absolute URL or unset it to use the default."
    };
  }
}

function checkManagementApiKey(apiKey: string | undefined): DoctorCheck {
  if (apiKey && apiKey.trim().length > 0) {
    return {
      status: "PASS",
      label: "XAI_MANAGEMENT_API_KEY",
      detail: "Environment variable is set."
    };
  }

  return {
    status: "WARN",
    label: "XAI_MANAGEMENT_API_KEY",
    detail: "Environment variable is missing or empty.",
    fix: "Set `XAI_MANAGEMENT_API_KEY` only if you want to validate, list, or create team API keys locally."
  };
}

function checkManagementBaseUrl(baseUrl: string | undefined): DoctorCheck {
  const resolvedBaseUrl = baseUrl && baseUrl.trim().length > 0
    ? baseUrl
    : "https://management-api.x.ai";

  try {
    const parsedUrl = new URL(resolvedBaseUrl);

    return {
      status: "PASS",
      label: "XAI_MANAGEMENT_BASE_URL",
      detail: `Using ${parsedUrl.toString()}`
    };
  } catch {
    return {
      status: "FAIL",
      label: "XAI_MANAGEMENT_BASE_URL",
      detail: `Value is not a valid absolute URL: ${resolvedBaseUrl}`,
      fix: "Set `XAI_MANAGEMENT_BASE_URL` to a valid absolute URL or unset it to use the default."
    };
  }
}

function checkDefaultModel(model: string | undefined): DoctorCheck {
  if (model === undefined) {
    return {
      status: "PASS",
      label: "GROK_AGENT_KIT_MODEL",
      detail: "Not set; the default model `grok-4` will be used."
    };
  }

  if (model.trim().length > 0) {
    return {
      status: "PASS",
      label: "GROK_AGENT_KIT_MODEL",
      detail: `Using ${model}`
    };
  }

  return {
    status: "FAIL",
    label: "GROK_AGENT_KIT_MODEL",
    detail: "Environment variable is set but empty.",
    fix: "Set `GROK_AGENT_KIT_MODEL` to a non-empty model name or unset it."
  };
}

async function checkStateDirectory(stateDirectory: string): Promise<DoctorCheck> {
  try {
    await access(stateDirectory, constants.R_OK);

    return {
      status: "PASS",
      label: "Local state directory",
      detail: `${stateDirectory} is readable.`
    };
  } catch (error) {
    if (isEnoent(error)) {
      return {
        status: "WARN",
        label: "Local state directory",
        detail: `${stateDirectory} does not exist yet.`,
        fix: "This is fine for a first run; it will be created automatically when local session data is saved."
      };
    }

    return {
      status: "FAIL",
      label: "Local state directory",
      detail: `Unable to read ${stateDirectory}.`,
      fix: "Check filesystem permissions for your home directory."
    };
  }
}

async function checkSessionStore(stateDirectory: string): Promise<DoctorCheck> {
  const sessionStorePath = join(stateDirectory, "sessions.json");

  try {
    const content = await readFile(sessionStorePath, "utf8");
    JSON.parse(content);

    return {
      status: "PASS",
      label: "sessions.json",
      detail: `${sessionStorePath} is readable valid JSON.`
    };
  } catch (error) {
    if (isEnoent(error)) {
      return {
        status: "WARN",
        label: "sessions.json",
        detail: `${sessionStorePath} has not been created yet.`,
        fix: "This is expected until you save your first named session."
      };
    }

    if (error instanceof SyntaxError) {
      return {
        status: "FAIL",
        label: "sessions.json",
        detail: `${sessionStorePath} exists but contains invalid JSON.`,
        fix: "Fix or remove the file, then re-run `grok-agent-kit doctor`."
      };
    }

    return {
      status: "FAIL",
      label: "sessions.json",
      detail: `Unable to read ${sessionStorePath}.`,
      fix: "Check the file permissions or remove the broken file."
    };
  }
}

function isEnoent(error: unknown): error is NodeJS.ErrnoException {
  return error instanceof Error && "code" in error && error.code === "ENOENT";
}
