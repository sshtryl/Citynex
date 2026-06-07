"use client";
import { useAuth } from "@/lib/useAuth";
import { useFeed } from "@/lib/useFeed";
import { FeedList } from "./feedList";

export function HomeContent() {
    const { user } = useAuth({ required: true });
    const {
        reports,
        isLoading,
        error,
        pagination,
        isLiking,
        toggleLike,
        loadMore
    } = useFeed();

    const hasMore = pagination.page < pagination.totalPages;

    const handleLike = async (reportId: string, isCurrentlyLiked: boolean) => {
        await toggleLike(reportId, isCurrentlyLiked);
    };

    return (
        <div className="min-h-screen mx-auto w-full">
            <main className="flex justify-center py-8 px-4">
                <div className="w-full max-w-lg">
                    <FeedList
                        reports={reports}
                        isLoading={isLoading}
                        error={error}
                        hasMore={hasMore}
                        isLiking={isLiking}
                        onLike={handleLike}
                        onLoadMore={loadMore}
                    />
                </div>
            </main>
        </div>
    );
}