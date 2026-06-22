-- Biblioteca de narrativas editable (motor de narrativas GESEM).
CREATE TABLE "narrative_entries" (
    "id" TEXT NOT NULL,
    "scope" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "locale" TEXT NOT NULL DEFAULT 'es',
    "content" JSONB NOT NULL,
    "status" "NarrativeStatus" NOT NULL DEFAULT 'PUBLISHED',
    "version" INTEGER NOT NULL DEFAULT 1,
    "author" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "narrative_entries_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "narrative_entries_scope_key_locale_key" ON "narrative_entries"("scope", "key", "locale");
