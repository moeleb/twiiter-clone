import Post from "./Post";
import PostSkeleton from "../skeletons/PostSkeleton";
import { useQuery } from '@tanstack/react-query'
import { useEffect } from "react";

const Posts = ({ feedType }) => {
	const getPostsEndpoint = (feedType) => {
		switch (feedType) {
			case 'forYou':
				return "/api/posts/all";
			case 'following':
				return "/api/posts/following";
			default:
				return "/api/posts/all";
		}
	};

	const POST_ENDPOINT = getPostsEndpoint(feedType);

	const { data: posts, isLoading, refetch, isRefetching } = useQuery({
		queryKey: ["posts", feedType], // include feedType so it refetches
		queryFn: async () => {
			try {
				const res = await fetch(POST_ENDPOINT);
				if (!res.ok) throw new Error("Failed to fetch posts");
				const data = await res.json();
				return data; // ✅ return data
			} catch (error) {
				throw new Error(error.message);
			}
		},
	});

	useEffect(()=>{
		refetch()

	}, [feedType])

	return (
		<>
			{(isLoading || isRefetching) && (
				<div className='flex flex-col justify-center'>
					<PostSkeleton />
					<PostSkeleton />
					<PostSkeleton />
				</div>
			)}
			{!isLoading && !isRefetching && posts?.length === 0 && (
				<p className='text-center my-4'>No posts in this tab. Switch 👻</p>
			)}
			{!isLoading &&  !isRefetching && posts && (
				<div>
					{posts.map((post) => (
						<Post key={post._id} post={post} />
					))}
				</div>
			)}
		</>
	);
};

export default Posts;
