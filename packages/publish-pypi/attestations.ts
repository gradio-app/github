import { info, warning, setFailed } from "@actions/core";
import { exec, getExecOutput } from "@actions/exec";
import { promises as fs } from "fs";
import { join, basename } from "path";
import { glob } from "glob";

export interface AttestationOptions {
	distDir: string;
	oidcToken?: string;
}

export async function generateAttestations(
	options: AttestationOptions
): Promise<boolean> {
	const { distDir, oidcToken } = options;

	try {
		info("Generating attestations for distributions...");

		const distFiles = await glob(join(distDir, "*"), {
			absolute: true,
		});

		const distributions = distFiles.filter((file) => {
			const name = basename(file);
			return (
				(name.endsWith(".whl") || name.endsWith(".tar.gz")) &&
				!name.endsWith(".publish.attestation")
			);
		});

		if (distributions.length === 0) {
			warning("No distribution files found to attest.");
			return false;
		}

		info(`Found ${distributions.length} distribution(s) to attest.`);

		const existingAttestations = distFiles.filter((file) =>
			file.endsWith(".publish.attestation")
		);

		if (existingAttestations.length > 0) {
			setFailed(
				"Attestation files already exist in the dist directory: " +
					existingAttestations.map((f) => basename(f)).join(", ") +
					"\nRemove them before continuing."
			);
			return false;
		}

		const attestScript = `
import sys
import json
import os
from pathlib import Path
from pypi_attestations import Attestation, Distribution
from sigstore.models import ClientTrustConfig
from sigstore.oidc import IdentityError, IdentityToken, detect_credential
from sigstore.sign import SigningContext

def generate_attestations(dist_files):
    errors = []

		def get_identity_token() -> IdentityToken:
        # Will raise sigstore.oidc.IdentityError if it fails to get the token
        # from the environment or if the token is malformed.
        # NOTE: audience is always sigstore.
        oidc_token = detect_credential()
        if oidc_token is None:
            raise IdentityError('Attempted to discover OIDC in broken environment')
        return IdentityToken(oidc_token)

    trust = ClientTrustConfig.production()
    signing_ctx = SigningContext.from_trust_config(trust)
    identity = get_identity_token()


    with signing_ctx.signer(identity, cache=True) as signer:
        for dist_file in dist_files:
            dist_path = Path(dist_file)
            
            try:
                print(f"Attesting {dist_path.name}...")

                dist = Distribution.from_file(Path(path))
                att = Attestation.sign(signer, dist)
                print(att.model_dump_json())
                
                attestation_path = dist_path.with_suffix(dist_path.suffix + ".publish.attestation")
                attestation_path.write_text(attestation.model_dump_json())

                print(f"Created attestation: {attestation_path.name}")

            except Exception as e:
                errors.append(f"Error attesting {dist_path.name}: {e}")
                print(f"Error attesting {dist_path.name}: {e}", file=sys.stderr)

    if errors:
        summary_path = os.environ.get("GITHUB_STEP_SUMMARY")
        if summary_path:
            with open(summary_path, "a") as f:
                f.write("## Attestation Errors\\n\\n")
                for error in errors:
                    f.write(f"- {error}\\n")
        return False

    return True

if __name__ == "__main__":
    import json
    dist_files = json.loads(sys.argv[1])
    success = generate_attestations(dist_files)
    sys.exit(0 if success else 1)
`;

		await fs.writeFile("_action_temp/generate_attestations.py", attestScript);

		//@ts-ignore
		const env: Record<string, string> = {
			...process.env,
		};

		if (oidcToken) {
			env.PYPI_ATTESTATIONS_TOKEN = oidcToken;
		}

		const result = await exec(
			"python",
			["_action_temp/generate_attestations.py", JSON.stringify(distributions)],
			{
				env,
				ignoreReturnCode: true,
			}
		);

		if (result !== 0) {
			setFailed("Failed to generate attestations.");
			return false;
		}

		const attestationFiles = await glob(
			join(distDir, "*.publish.attestation"),
			{
				absolute: true,
			}
		);

		info(`Successfully generated ${attestationFiles.length} attestation(s).`);

		for (const file of attestationFiles) {
			info(`  - ${basename(file)}`);
		}

		return true;
	} catch (e: any) {
		setFailed(`Error during attestation generation: ${e.message}`);
		return false;
	}
}

export async function verifyAttestations(distDir: string): Promise<boolean> {
	try {
		const distFiles = await glob(join(distDir, "*"), {
			absolute: true,
		});

		const distributions = distFiles.filter((file) => {
			const name = basename(file);
			return (
				(name.endsWith(".whl") || name.endsWith(".tar.gz")) &&
				!name.endsWith(".publish.attestation")
			);
		});

		const attestations = distFiles.filter((file) =>
			file.endsWith(".publish.attestation")
		);

		if (distributions.length !== attestations.length) {
			warning(
				`Mismatch between distributions (${distributions.length}) ` +
					`and attestations (${attestations.length}). ` +
					`Some distributions may not have attestations.`
			);
		}

		for (const dist of distributions) {
			const attestationPath = `${dist}.publish.attestation`;
			const hasAttestation = attestations.includes(attestationPath);

			if (!hasAttestation) {
				warning(`Missing attestation for: ${basename(dist)}`);
			}
		}

		return true;
	} catch (e: any) {
		warning(`Failed to verify attestations: ${e.message}`);
		return false;
	}
}
