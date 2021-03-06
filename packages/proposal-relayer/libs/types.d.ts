import type { ProposalStatusInfo } from "@cennznet/types";

import { createProposalRecordUpdater } from "@proposal-relayer/libs/utils/createProposalRecordUpdater";

export type ProposalDetails = Map<{
	title: string;
	description: string;
}>;

export type ProposalInfo = Map<{
	sponsor: string;
	justificationUri: string;
	enactmentDelay: number;
}>;

export interface ProposalInterface {
	discordMessageId: string;
	proposalId: number;
	proposalInfo: ProposalInfo;
	proposalDetails: ProposalDetails;
	passVotes: number;
	rejectVotes: number;
	state: "Created" | "InfoFetched" | "DetailsFetched" | "DiscordSent" | "Done";
	status: "Pending" | "Failed" | "Skipped" | "Aborted" | ProposalStatus;
}

export type VoteAction = "pass" | "reject";

export type ProposalRecordUpdater = ReturnType<
	typeof createProposalRecordUpdater
>;

export type ProposalStatus =
	| ProposalStatusInfo["type"]
	| "ReferendumDeliberation";

export interface ProposalVotes {
	passVotes: number;
	rejectVotes: number;
}
