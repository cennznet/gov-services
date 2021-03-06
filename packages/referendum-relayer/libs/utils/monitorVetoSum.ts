import type { Api } from "@cennznet/api";
import type { AMQPQueue } from "@cloudamqp/amqp-client";
import type { ReferendumVoteCount, StorageKey } from "@cennznet/types";

import { getLogger } from "@gov-libs/utils/getLogger";
import { Referendum } from "@referendum-relayer/libs/models";
import { Proposal } from "@proposal-relayer/libs/models";

const logger = getLogger("ReferendumListener");

export async function monitorVetoSum(
	cennzApi: Api,
	queue: AMQPQueue
): Promise<void> {
	await cennzApi.query.governance.referendumVetoSum.entries(
		(
			entries: [
				storageKey: StorageKey,
				voteCount: ReferendumVoteCount["vote"]
			][]
		) => {
			entries.forEach(async ([storageKey, voteCount]) => {
				const proposalId = Number(storageKey.toHuman()[0]);
				const vetoSum = voteCount.toNumber();

				const referendum = await Referendum.findOne({ proposalId });
				if (vetoSum === referendum?.vetoSum) return;

				const proposal = await Proposal.findOne({ proposalId });
				if (!proposal || proposal?.status === "Deliberation") return;

				if (!referendum) {
					logger.info(
						"Referendum #%d: New referendum, sent to queue...",
						proposalId
					);
					queue.publish(JSON.stringify({ proposalId, proposal, vetoSum }), {
						type: "new",
					});
				}

				if (referendum) {
					logger.info(
						"Referendum #%d: Update found, sent to queue...",
						proposalId
					);
					queue.publish(
						JSON.stringify({ proposalId, proposal, referendum, vetoSum }),
						{
							type: "update",
						}
					);
				}
			});
		}
	);
}
