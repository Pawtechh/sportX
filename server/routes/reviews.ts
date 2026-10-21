import { Router } from "express";
import { desc, eq } from "drizzle-orm";
import { db } from "../db";
import { reviews, users } from "../db/schema";
import { reviewSchema } from "../../shared/validators";
import { requireAuth, requireRole, validate, wrap } from "../middleware";

const r = Router();

r.get("/product/:productId", wrap(async (req, res) => {
  const productId = Number(req.params.productId);
  const rows = await db
    .select({
      id: reviews.id,
      rating: reviews.rating,
      comment: reviews.comment,
      createdAt: reviews.createdAt,
      userName: users.name,
      userAvatar: users.avatarUrl,
    })
    .from(reviews)
    .innerJoin(users, eq(users.id, reviews.userId))
    .where(eq(reviews.productId, productId))
    .orderBy(desc(reviews.createdAt));

  res.json(rows);
}));

r.post("/", requireAuth, requireRole("consumer", "admin"), validate(reviewSchema), wrap(async (req, res) => {
  const { productId, rating, comment } = req.body;
  const [created] = await db
    .insert(reviews)
    .values({
      productId,
      userId: req.user!.id,
      rating,
      comment,
    })
    .returning();

  res.status(201).json(created);
}));

export default r;
