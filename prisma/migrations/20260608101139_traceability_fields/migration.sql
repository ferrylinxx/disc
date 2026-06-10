-- AlterTable
ALTER TABLE "item_responses" ADD COLUMN     "changeCount" INTEGER,
ADD COLUMN     "timeMs" INTEGER;

-- AlterTable
ALTER TABLE "response_sets" ADD COLUMN     "reflection" TEXT;
