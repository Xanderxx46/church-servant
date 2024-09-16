import { Client, ClientMode } from "@buape/carbon";
import {
	LinkedRoles,
	ApplicationRoleConnectionMetadataType,
} from "@buape/carbon-linked-roles";
import type { ExecutionContext } from "@cloudflare/workers-types/2023-07-01";

import PingCommand from "./commands/ping";

type Env = {
	CLIENT_ID: string;
	PUBLIC_KEY: string;
	DISCORD_TOKEN: string;
};

const secret = "N2BEFE1W1MZbxT61h-eEL_PrAFB3Koei";

export default {
	async fetch(request: Request, _env: Env, ctx: ExecutionContext) {
		const client = new Client(
			{
				clientId: _env.CLIENT_ID,
				publicKey: _env.PUBLIC_KEY,
				token: _env.DISCORD_TOKEN,
				mode: ClientMode.CloudflareWorkers,
			},
			[new PingCommand()],
		);

		const allStaff = [
			"517505979466776578",
			"1004251026758582402",
			"829909201262084096",
			"994417023452987513",
		];

		const isStaff = new LinkedRoles(client, {
			clientSecret: secret,
			baseUrl: "https://my-carbon-worker.xanderxx.workers.dev",
			metadata: [
				{
					key: "is_staff",
					name: "Verified Staff Member",
					description: "Whether the user is a verified staff member",
					type: ApplicationRoleConnectionMetadataType.BooleanEqual,
				},
			],
			metadataCheckers: {
				is_staff: async (userId) => {
					if (allStaff.includes(userId)) return true;
					return false;
				},
			},
		});

		if (request.url.endsWith("/deploy")) {
			await client.deployCommands();
			return new Response("Deployed commands");
		}
		const response = await client.router.fetch(request, ctx);
		return response;
	},
};
