import { getJobs } from "./db/jobs.js";
import { getCompany } from "./db/companies.js";
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
	Query: {
		jobs: async () => getJobs(),
	},
	Job: {
		company: (job) => getCompany(job.companyId),

		date: (job) => toIsoDate(job.createdAt),
	},
};

function toIsoDate(value) {
	return value.slice(0, "yyyy-mm-dd".length);
}
