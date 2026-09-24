import Link from 'next/link';
import { db } from '@/lib/db';
import { MessageSquare, Plus, User, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export const revalidate = 0;

export default async function DiscussionsPage() {
  const discussions = await db.discussion.findMany({
    include: {
      author: true,
      course: true,
      comments: {
        include: { author: true },
        orderBy: { createdAt: 'asc' },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-slate-900 text-white rounded-2xl p-8 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-2">
          <Badge variant="info" className="bg-brand-950 text-brand-300 border-brand-800">
            Community Forum
          </Badge>
          <h1 className="text-3xl font-extrabold">Peer-to-Peer Discussions & Q&A</h1>
          <p className="text-xs text-slate-300">
            Ask technical questions, share architectural insights, and collaborate with students & mentors.
          </p>
        </div>
      </div>

      {/* Discussions Feed */}
      <div className="space-y-4">
        {discussions.map((disc) => (
          <Card key={disc.id} className="p-6 space-y-4 hover:shadow-md transition-all">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-slate-900 dark:bg-brand-600 text-white flex items-center justify-center font-bold shrink-0">
                {disc.author.name[0]}
              </div>
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">{disc.title}</h3>
                  {disc.course && <Badge variant="outline">{disc.course.title}</Badge>}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Posted by <strong className="text-slate-700 dark:text-slate-200">{disc.author.name}</strong> ({disc.author.role}) • {new Date(disc.createdAt).toLocaleDateString()}
                </p>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed pt-2">{disc.content}</p>
              </div>
            </div>

            {/* Comments */}
            {disc.comments.length > 0 && (
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3 pl-8">
                <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Replies ({disc.comments.length})</h4>
                {disc.comments.map((comment) => (
                  <div key={comment.id} className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-lg text-xs space-y-1 border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 dark:text-white">{comment.author.name}</span>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500">{new Date(comment.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{comment.content}</p>
                  </div>
                ))}
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
