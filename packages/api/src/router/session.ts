import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { MeditationSession, UserMeditationSession } from "@acme/db/schema";
import { and, eq, desc } from "@acme/db";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export const sessionRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.select().from(MeditationSession);
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      console.log("Fetching session with ID:", input.id);
      const session = await ctx.db.query.MeditationSession.findFirst({
        where: (session, { eq }) => eq(session.id, input.id),
      });

      console.log("Session found:", session);

      if (session) {
        console.log("Generating signed URL for:", session.audioFilePath);
        // Generate a new signed URL for the audio file
        const { data, error } = await ctx.supabase.storage
          .from('medidation_sessions')
          .createSignedUrl(session.audioFilePath, 3600); // URL valid for 1 hour

        if (error) {
          console.error("Error generating signed URL:", error);
          throw new Error(`Failed to generate signed URL: ${error.message}`);
        }

        if (!data?.signedUrl) {
          console.error("No signed URL generated");
          throw new Error("Failed to generate signed URL");
        }

        console.log("Signed URL generated successfully:", data.signedUrl);

        return {
          ...session,
          audioFilePath: data.signedUrl,
        };
      }

      console.log("Session not found");
      return null;
    }),

  create: protectedProcedure
    .input(
      z.object({
        title: z.string(),
        category: z.string(),
        description: z.string().optional(),
        audioFilePath: z.string(),
        duration: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Extract just the file path from the full URL
      const urlParts = input.audioFilePath.split('/');
      const filePath = urlParts.at(-1)?.split('?')[0] ?? '';
      console.log("Extracted file path:", filePath);

      return ctx.db.insert(MeditationSession).values({
        ...input,
        audioFilePath: filePath,
      });
    }),

  updateUserProgress: protectedProcedure
    .input(
      z.object({
        sessionId: z.string().uuid(),
        progress: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db
        .insert(UserMeditationSession)
        .values({
          userId: ctx.session.user.id,
          sessionId: input.sessionId,
          progress: input.progress,
        })
        .onConflictDoUpdate({
          target: [UserMeditationSession.userId, UserMeditationSession.sessionId],
          set: { progress: input.progress },
        });
    }),

  rateSession: protectedProcedure
    .input(
      z.object({
        sessionId: z.string().uuid(),
        rating: z.number().min(1).max(5),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db
        .update(UserMeditationSession)
        .set({
          rating: input.rating,
          notes: input.notes,
          completedAt: new Date(),
        })
        .where(
          and(
            eq(UserMeditationSession.userId, ctx.session.user.id),
            eq(UserMeditationSession.sessionId, input.sessionId)
          )
        );
    }),

  getRecentSessions: publicProcedure
    .input(z.object({ limit: z.number().optional().default(5) }))
    .query(async ({ ctx, input }) => {
      return ctx.db.query.MeditationSession.findMany({
        orderBy: desc(MeditationSession.createdAt),
        limit: input.limit,
      });
    }),
});