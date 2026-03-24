import { useState } from "react";
import { MessageSquare, Reply, Trash2, User, Clock } from "lucide-react";
import { addComment } from "../../../utils/engagementSupabase";
import type { Comment } from "../../../app/types/engagement";

interface CommentComponentProps {
  spotlightId: string;
  comments: Comment[];
  onCommentAdded: (comment: Comment) => void;
  readonly?: boolean;
}

interface CommentFormProps {
  spotlightId: string;
  parentId?: string;
  onCommentAdded: (comment: Comment) => void;
  onCancel?: () => void;
  placeholder?: string;
}

function CommentForm({ spotlightId, parentId, onCommentAdded, onCancel, placeholder }: CommentFormProps) {
  const [formData, setFormData] = useState({
    authorName: "",
    authorEmail: "",
    content: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const result = await addComment(spotlightId, {
        ...formData,
        parentId,
      });

      if (result.success) {
        setFormData({ authorName: "", authorEmail: "", content: "" });
        onCancel?.();
        // In a real implementation, you'd get the new comment from the response
        // For now, we'll just trigger a refresh
        window.location.reload();
      } else {
        setError(result.error || "Failed to submit comment");
      }
    } catch (error) {
      setError("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="authorName" className="block text-sm font-medium text-gray-700 mb-1">
            Name *
          </label>
          <input
            type="text"
            id="authorName"
            value={formData.authorName}
            onChange={(e) => setFormData({ ...formData, authorName: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#B36A4C] focus:border-transparent"
            placeholder="Your name"
            required
            maxLength={100}
          />
        </div>
        <div>
          <label htmlFor="authorEmail" className="block text-sm font-medium text-gray-700 mb-1">
            Email (optional)
          </label>
          <input
            type="email"
            id="authorEmail"
            value={formData.authorEmail}
            onChange={(e) => setFormData({ ...formData, authorEmail: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#B36A4C] focus:border-transparent"
            placeholder="your@email.com"
            maxLength={255}
          />
        </div>
      </div>
      
      <div>
        <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
          Comment *
        </label>
        <textarea
          id="content"
          value={formData.content}
          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#B36A4C] focus:border-transparent resize-none"
          rows={4}
          placeholder={placeholder || "Share your thoughts about this spotlight..."}
          required
          maxLength={1000}
        />
        <div className="text-xs text-gray-500 mt-1">
          {formData.content.length}/1000 characters
        </div>
      </div>

      {error && (
        <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="flex justify-end gap-3">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2 bg-[#334233] text-white rounded-lg hover:bg-[#B36A4C] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Submitting..." : "Post Comment"}
        </button>
      </div>
    </form>
  );
}

function CommentItem({ comment, onReply }: { comment: Comment; onReply: (parentId: string) => void }) {
  const [showReplyForm, setShowReplyForm] = useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#F6F1E7] rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-[#6F7553]" />
          </div>
          <div>
            <div className="font-medium text-gray-900">{comment.authorName}</div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Clock className="w-3 h-3" />
              {formatDate(comment.createdAt)}
            </div>
          </div>
        </div>
      </div>

      <div className="text-gray-700 mb-4 leading-relaxed">{comment.content}</div>

      <div className="flex items-center gap-4">
        <button
          onClick={() => setShowReplyForm(!showReplyForm)}
          className="flex items-center gap-1 text-sm text-[#B36A4C] hover:text-[#8A6F5A] transition-colors"
        >
          <Reply className="w-4 h-4" />
          Reply
        </button>
      </div>

      {showReplyForm && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <CommentForm
            spotlightId={comment.spotlightId}
            parentId={comment.id}
            onCommentAdded={() => {
              setShowReplyForm(false);
              window.location.reload();
            }}
            onCancel={() => setShowReplyForm(false)}
            placeholder="Write a reply..."
          />
        </div>
      )}

      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-4 space-y-3 pl-4 border-l-2 border-gray-200">
          {comment.replies.map((reply) => (
            <CommentItem key={reply.id} comment={reply} onReply={onReply} />
          ))}
        </div>
      )}
    </div>
  );
}

export function CommentComponent({ spotlightId, comments, onCommentAdded, readonly = false }: CommentComponentProps) {
  const [showCommentForm, setShowCommentForm] = useState(false);

  const sortedComments = [...comments].sort((a, b) => 
    new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  return (
    <div className="space-y-6">
      {/* Comment Form */}
      {!readonly && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare className="w-5 h-5 text-[#B36A4C]" />
            <h3 className="text-lg font-semibold text-gray-900">Leave a Comment</h3>
          </div>
          
          {showCommentForm ? (
            <CommentForm
              spotlightId={spotlightId}
              onCommentAdded={(comment) => {
                onCommentAdded(comment);
                setShowCommentForm(false);
              }}
              onCancel={() => setShowCommentForm(false)}
            />
          ) : (
            <button
              onClick={() => setShowCommentForm(true)}
              className="w-full px-4 py-3 bg-[#334233] text-white rounded-lg hover:bg-[#B36A4C] transition-colors"
            >
              Add a Comment
            </button>
          )}
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-[#6F7553]" />
          <h3 className="text-lg font-semibold text-gray-900">
            Comments ({sortedComments.length})
          </h3>
        </div>

        {sortedComments.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">No comments yet. Be the first to share your thoughts!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedComments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                onReply={() => {}}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
