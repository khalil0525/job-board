import {
	getJob,
	getJobs,
	getJobsByCompany,
	createJob,
	deleteJob,
	updateJob,
} from "./db/jobs.js";
import { getCompany } from "./db/companies.js";
import { GraphQLError } from "graphql";
// export const resolvers = {
// 	Query: {
// 		jobs: async () => {
// 			// const jobs = await getJobs();
// 			// console.log(jobs);
// 			return getJobs();
// 			// return [
// 			// 	{
// 			// 		id: 1,
// 			// 		title: "The Title",
// 			// 		description: "The Description",
// 			// 	},
// 			// 	{
// 			// 		id: 2,
// 			// 		title: "The Title 2",
// 			// 		description: "The Description",
// 			// 	},
// 			// ];
// 		},
// 	},
// };
export const resolvers = {
	// This describes functions that are called when someone queries the server
	Query: {
		job: async (_root, { id }) => {
			const job = await getJob(id);
			if (!job) {
				throw new notFoundError("No Job found with id " + id);
			}
			return job;
		},
		jobs: async () => getJobs(),
		company: async (_root, { id }) => {
			const company = await getCompany(id);
			if (!company) {
				throw new notFoundError("No Company found with id " + id);
			}
			return company;
		},
	},
	// This describes inserting data into the database
	Mutation: {
		createJob: (_root, { input: { title, description } }, { user }) => {
			if (!user) {
				throw new unauthorizedError("Missing authentication");
			}

			return createJob({ companyId: user.companyId, title, description });
		},
		deleteJob: async (_root, { id }, { user }) => {
			if (!user) {
				throw new unauthorizedError("Missing authentication");
			}

			const job = await deleteJob(id, user.companyId);
			if (!job) {
				throw new notFoundError("No Job found with id " + id);
			}
			return job;
		},
		updateJob: async (
			_root,
			{ input: { id, title, description } },
			{ user }
		) => {
			if (!user) {
				throw new unauthorizedError("Missing authentication");
			}
			const job = await updateJob({
				id,
				companyId: user.companyId,
				title,
				description,
			});
			if (!job) {
				throw new notFoundError("No Job found with id " + id);
			}
			return job;
		},
	},
	// This describes how to get a Job
	Job: {
		company: (job) => getCompany(job.companyId),

		date: (job) => toIsoDate(job.createdAt),
	},
	// This describes how to get a Company
	Company: {
		jobs: (company) => getJobsByCompany(company.id),
	},
};

function notFoundError(message) {
	return new GraphQLError(message, {
		extensions: { code: "NOT_FOUND" },
	});
}
function unauthorizedError(message) {
	return new GraphQLError(message, {
		extensions: { code: "UNAUTHORIZED" },
	});
}
function toIsoDate(value) {
	return value.slice(0, "yyyy-mm-dd".length);
}
