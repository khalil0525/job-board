import { GraphQLClient } from "graphql-request";
import { getAccessToken } from "../auth";
import {
	ApolloClient,
	gql,
	InMemoryCache,
	ApolloLink,
	createHttpLink,
	concat,
} from "@apollo/client";

// const client = new GraphQLClient("http://localhost:9000/graphql", {
// 	headers: () => {
// 		const accessToken = getAccessToken();
// 		if (accessToken) {
// 			console.log(accessToken);
// 			return { Authorization: `Bearer ${accessToken}` };
// 		}
// 		return {};
// 	},
// });

const httpLink = createHttpLink({ uri: "http://localhost:9000/graphql" });
// This custom link is used in order to get the JWT and send it in the request.
const customLink = new ApolloLink((operation, forward) => {
	const accessToken = getAccessToken();
	if (accessToken) {
		console.log(accessToken);
		operation.setContext({
			headers: { Authorization: `Bearer ${accessToken}` },
		});
	}

	return forward(operation);
});
const apolloClient = new ApolloClient({
	link: concat(customLink, httpLink),
	cache: new InMemoryCache(),
	// Global policy for fetching, but you can sit this on particular queries.
	defaultOptions: {
		// fetchPolicy is used to configure how fetching is done. The default option caches all fetch requests, but doesn't show new data before restart
		// network only will make it so results are not cached, meaning that we can get fresh data without restart
		query: {
			fetchPolicy: "network-only",
		},
		watchQuery: {
			fetchPolicy: "network-only",
		},
	},
});

export async function getJobs() {
	const query = gql`
		query Jobs {
			jobs {
				id
				date
				title

				company {
					id
					name
				}
			}
		}
	`;
	// Graphql-requests functionality
	// const { jobs } = await client.request(query);

	//Apollo client functionality

	const { data } = await apolloClient.query({
		query,
	});
	return data.jobs;
}
// Fragments are used to create reusable query targets. Here we created a frament to get JobDetails.
const jobDetailFragment = gql`
	fragment JobDetail on Job {
		id
		date
		title
		company {
			id
			name
		}
		description
	}
`;
const JobByIdQuery = gql`
	query JobById($id: ID!) {
		job(id: $id) {
			# This is where we extract the JobDetail frament, but we must also pass the variable "jobDetailFragment" as a literal
			...JobDetail
		}
	}
	# This is where we pass the literal
	${jobDetailFragment}
`;
export async function getJob(id) {
	// (query, variables)
	// Graphql-requests functionality
	// const { job } = await client.request(query, { id });
	const { data } = await apolloClient.query({
		query: JobByIdQuery,
		variables: { id },
	});
	return data.job;
}

export async function getCompany(id) {
	const query = gql`
		query CompanyById($id: ID!) {
			company(id: $id) {
				id
				name
				description
				jobs {
					id
					date
					title
				}
			}
		}
	`;
	// (query, variables)
	// const { company } = await client.request(query, { id });
	const { data } = await apolloClient.query({ query, variables: { id } });
	return data.company;
}

export async function createJob({ title, description }) {
	const mutation = gql`
		mutation CreateJob($input: CreateJobInput!) {
			job: createJob(input: $input) {
				...JobDetail
			}
		}
		${jobDetailFragment}
	`;
	// (query, variables)
	// const { job } = await client.request(mutation, {
	// 	input: { title, description },
	// });

	const { data } = await apolloClient.mutate({
		mutation,
		variables: { input: { title, description } },
		// Function that allow you to write data into cache,
		update: (cache, { data }) => {
			cache.writeQuery({
				query: JobByIdQuery,
				variables: { id: data.job.id },
				data,
			});
		},
	});

	return data.job;
}
